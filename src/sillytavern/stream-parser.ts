// ============================================================
// 流式 XML 标签解析器 — v3 游戏模式核心
// 实时解析 LLM 流式输出中的 XML 标签
// ============================================================
import type { StreamParseState, StreamParseResult } from './types';

// ---- 标签定义 ----
export interface TagDefinition {
  name: string;
  /** 打开正则 */
  open: RegExp;
  /** 关闭正则 */
  close: RegExp;
}

// ---- 默认标签 ----
export const DEFAULT_TAGS: TagDefinition[] = [
  { name: 'thinking', open: /<thinking>/gi, close: /<\/thinking>/gi },
  { name: 'think', open: /<think>/gi, close: /<\/think>/gi },
  { name: 'maintext', open: /<maintext>/gi, close: /<\/maintext>/gi },
  { name: 'option', open: /<option>/gi, close: /<\/option>/gi },
  { name: 'sum', open: /<sum>/gi, close: /<\/sum>/gi },
  { name: 'vars', open: /<vars>/gi, close: /<\/vars>/gi },
];

// ---- 解析器工厂 ----
export function createStreamParser(tags: TagDefinition[] = DEFAULT_TAGS) {
  let state: StreamParseState = {
    tagStack: [],
    currentTag: null,
    buffers: {},
    thinkingEnded: false,
    maintextComplete: false,
  };

  /** 喂入文本片段，返回当前解析结果 */
  function feed(chunk: string): StreamParseResult {
    // 将 chunk 逐字符处理以模拟流式
    for (let i = 0; i < chunk.length; i++) {
      processChar(chunk[i]);
    }
    return getResult();
  }

  /** 处理单个字符 */
  function processChar(_char: string): void {
    const fullText = getFullPendingText();

    // 如果在某个标签内，先检查是否碰到了关闭标签
    if (state.currentTag) {
      const tag = tags.find((t) => t.name === state.currentTag);
      if (tag) {
        // 检查当前累积文本是否包含关闭标签
        const buf = (state.buffers[state.currentTag] ?? '');
        tag.close.lastIndex = 0;
        const closeMatch = tag.close.exec(buf);
        if (closeMatch) {
          // 找到了关闭标签，截断缓冲区
          state.buffers[state.currentTag] = buf.slice(0, closeMatch.index);
          // 思考标签特殊处理（thinking/think 均视为思考）
          if (tag.name === 'thinking' || tag.name === 'think') {
            state.thinkingEnded = true;
          }
          if (tag.name === 'maintext') {
            state.maintextComplete = true;
          }
          state.currentTag = null;
          return;
        }
      }
      return;
    }

    // 不在任何标签内，检查是否有新的开标签
    const currentBuffer = fullText;
    let earliestMatch: { tag: TagDefinition; index: number } | null = null;

    for (const tag of tags) {
      tag.open.lastIndex = 0;
      const m = tag.open.exec(currentBuffer);
      if (m && (earliestMatch === null || m.index < earliestMatch.index)) {
        earliestMatch = { tag, index: m.index };
      }
    }

    if (earliestMatch) {
      // 将标签前的文本归入 maintext（如果尚未在思考中）
      const beforeTag = currentBuffer.slice(0, earliestMatch.index);
      if (beforeTag && !state.currentTag) {
        // 如果还在思考标签之前，将文本归入 thinking
        if (!state.thinkingEnded) {
          state.buffers['thinking'] = (state.buffers['thinking'] ?? '') + beforeTag;
        } else {
          state.buffers['maintext'] = (state.buffers['maintext'] ?? '') + beforeTag;
        }
      }
      // 清空已处理部分，进入新标签
      state.currentTag = earliestMatch.tag.name;
      state.buffers[state.currentTag] = '';
    } else {
      // 没有新标签，将文本归入当前上下文
      // 实际上每个字符追加时，由 feed() 调用方累积
    }
  }

  /** 获取待处理的完整文本 */
  function getFullPendingText(): string {
    return Object.values(state.buffers).join('');
  }

  /** 获取当前解析结果 */
  function getResult(): StreamParseResult {
    return {
      thinking: state.buffers['thinking'] ?? '',
      maintext: state.buffers['maintext'] ?? '',
      option: state.buffers['option'] ?? '',
      sum: state.buffers['sum'] ?? '',
      vars: parseVarsText(state.buffers['vars'] ?? ''),
      partial: {
        thinking: state.buffers['thinking'] ?? '',
        maintext: state.buffers['maintext'] ?? '',
        option: state.buffers['option'] ?? '',
      },
      complete: state.maintextComplete,
    };
  }

  /** 重置解析器状态 */
  function reset(): void {
    state = {
      tagStack: [],
      currentTag: null,
      buffers: {},
      thinkingEnded: false,
      maintextComplete: false,
    };
  }

  return { feed, getResult, reset, getState: () => state };
}

// ---- 简化版流式解析器（逐 token 追加） ----
export interface SimpleStreamParser {
  /** 追加文本 token */
  append: (token: string) => void;
  /** 获取当前解析结果 */
  getResult: () => StreamParseResult;
  /** 重置 */
  reset: () => void;
}

/**
 * 创建简化版流式解析器。
 * 与 createStreamParser 不同，此版本不做逐字符状态机，
 * 而是直接将缓冲区文本按标签正则切分。
 * 适合 LLM streaming 中每个 chunk 直接 append 的场景。
 */
export function createSimpleStreamParser(
  tags: TagDefinition[] = DEFAULT_TAGS,
): SimpleStreamParser {
  let rawText = '';

  function append(token: string): void {
    rawText += token;
  }

  function getResult(): StreamParseResult {
    // 初始化结果容器
    const buffers: Record<string, string> = {};
    for (const tag of tags) {
      buffers[tag.name] = '';
    }

    let remaining = rawText;

    // 按标签依次提取
    for (const tag of tags) {
      const openRegex = new RegExp(
        `<${tag.name}>([\\s\\S]*?)</${tag.name}>`,
        'gi',
      );
      let match: RegExpExecArray | null;
      while ((match = openRegex.exec(remaining)) !== null) {
        buffers[tag.name] += (buffers[tag.name] ? '\n' : '') + match[1].trim();
      }
      // 移除已处理的标签内容
      remaining = remaining.replace(
        new RegExp(`<${tag.name}>[\\s\\S]*?</${tag.name}>`, 'gi'),
        '',
      );
    }

    // 剩余未包裹文本 → 如果还有未关闭标签，归入该标签
    const openTagMatch = /<(\w+)>([^<]*)$/.exec(remaining);
    if (openTagMatch) {
      const tagName = openTagMatch[1];
      if (buffers[tagName] !== undefined) {
        buffers[tagName] += (buffers[tagName] ? '\n' : '') + openTagMatch[2].trim();
      }
    }

    const thinking =
      (buffers['thinking'] ?? '') || (buffers['think'] ?? '');
    const hasThinking = thinking.length > 0;

    return {
      thinking,
      maintext: buffers['maintext'] ?? '',
      option: buffers['option'] ?? '',
      sum: buffers['sum'] ?? '',
      vars: parseVarsText(buffers['vars'] ?? ''),
      partial: {
        thinking,
        maintext: buffers['maintext'] ?? '',
        option: buffers['option'] ?? '',
      },
      complete: hasThinking && (buffers['maintext'] ?? '').length > 0,
    };
  }

  function reset(): void {
    rawText = '';
  }

  return { append, getResult, reset };
}

// ---- 解析 vars 文本为变量对象 ----
function parseVarsText(text: string): Record<string, string | number> {
  if (!text.trim()) return {};
  try {
    // 尝试直接 JSON 解析
    const parsed = JSON.parse(text.trim());
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
  } catch {
    // 不是 JSON，尝试 key:value 行解析
  }

  const result: Record<string, string | number> = {};
  const lines = text.split('\n');
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      const num = Number(value);
      result[key] = Number.isNaN(num) ? value : num;
    }
  }
  return result;
}
