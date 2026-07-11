// src/lib/dialogue-parser.ts

export interface ParsedDialogue {
  type: 'scene' | 'dialogue' | 'option' | 'thinking' | 'vars';
  content: string;
  speaker?: string;
  speakerAvatar?: string;
  options?: string[];
  vars?: Record<string, string | number>;
}

/**
 * 解析 AI 回复中的自定义标签，返回结构化对话片段数组。
 *
 * 支持标签：
 *   <角色名>对话内容</角色名>  → dialogue + 头像匹配
 *   <option>文本</option>      → option
 *   <thinking>...</thinking>   → thinking（不渲染为消息）
 *   <think>...</think>         → thinking（同上）
 *   <vars>JSON</vars>          → vars（不渲染为消息）
 *   裸文本                      → scene
 */
export function parseDialogueResponse(raw: string): ParsedDialogue[] {
  const results: ParsedDialogue[] = [];

  // 提取 thinking / think
  const thinkingMatch =
    raw.match(/<thinking>([\s\S]*?)<\/thinking>/i) ??
    raw.match(/<think>([\s\S]*?)<\/think>/i);
  if (thinkingMatch) {
    results.push({ type: 'thinking', content: thinkingMatch[1].trim() });
  }

  // 提取 vars
  const varsMatch = raw.match(/<vars>([\s\S]*?)<\/vars>/i);
  if (varsMatch) {
    try {
      results.push({ type: 'vars', content: '', vars: JSON.parse(varsMatch[1].trim()) });
    } catch {
      // 非 JSON 忽略
    }
  }

  // 移除 thinking/think/vars 标签后处理剩余文本
  let remaining = raw
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<vars>[\s\S]*?<\/vars>/gi, '')
    .trim();

  // 提取所有 option 标签
  const optionRegex = /<option>([\s\S]*?)<\/option>/gi;
  const options: string[] = [];
  let optMatch: RegExpExecArray | null;
  while ((optMatch = optionRegex.exec(remaining)) !== null) {
    options.push(optMatch[1].trim());
  }
  if (options.length > 0) {
    results.push({ type: 'option', content: '你要怎么做？', options });
  }
  remaining = remaining.replace(/<option>[\s\S]*?<\/option>/gi, '').trim();

  // 解析角色标签和裸文本
  // 正则匹配任意自定义标签：<任意名称>内容</任意名称>
  const charTagRegex = /<([^>]+)>([\s\S]*?)<\/\1>/g;
  let lastIndex = 0;
  let charMatch: RegExpExecArray | null;

  while ((charMatch = charTagRegex.exec(remaining)) !== null) {
    // 标签前的裸文本 → scene
    const before = remaining.slice(lastIndex, charMatch.index).trim();
    if (before) {
      results.push({ type: 'scene', content: before });
    }

    const tagName = charMatch[1].trim();
    const tagContent = charMatch[2].trim();

    // 过滤掉系统标签
    if (!['option', 'thinking', 'think', 'vars', 'maintext', 'sum'].includes(tagName.toLowerCase())) {
      const avatar = getAvatarUrl(tagName);
      results.push({
        type: 'dialogue',
        content: tagContent,
        speaker: tagName,
        speakerAvatar: avatar ?? undefined,
      });
    }

    lastIndex = charMatch.index + charMatch[0].length;
  }

  // 剩余的裸文本
  const after = remaining.slice(lastIndex).trim();
  if (after) {
    results.push({ type: 'scene', content: after });
  }

  return results;
}

/**
 * 根据角色名查找头像 URL。
 * 读取 public/juesetouxiang/ 中匹配文件名的图片。
 * 支持常见图片格式。
 */
export function getAvatarUrl(name: string): string | null {
  // 构建可能的文件路径（Vite public 目录直接访问）
  // 默认返回 .png 路径，由浏览器尝试加载
  // 实际使用时通过 img onError 回退到默认头像
  return `/juesetouxiang/${encodeURIComponent(name)}.png`;
}

/** 默认占位头像 */
export const DEFAULT_AVATAR = '/juesetouxiang/_default.png';
