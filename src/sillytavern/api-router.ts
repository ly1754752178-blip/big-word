// ============================================================
// 双 API 路由器 — 主 API 跑剧情，次 API 跑总结/变量
// ============================================================
import type { AppSettings, ChatMessage } from './types';
import { assemblePrompt, type AssemblePromptResult } from './prompt-assembler';
import type { ChatPreset, Lorebook } from './types';

// ---- 路由请求 ----
export interface RouteRequest {
  userInput: string;
  history: ChatMessage[];
  preset: ChatPreset;
  lorebooks: Lorebook[];
  userName: string;
  characterName: string;
  variables: Record<string, string | number>;
}

// ---- 路由选项 ----
export interface RouteOptions {
  /** 强制使用主 API（跳过次 API） */
  forcePrimary?: boolean;
  /** 流式回调 */
  onStreamChunk?: (chunk: string) => void;
  /** 中止信号 */
  signal?: AbortSignal;
}

// ---- 主 API 调用结果 ----
export interface ApiCallResult {
  /** 原始回复 */
  rawReply: string;
  /** 使用的 API 类型 */
  apiType: 'primary' | 'secondary';
  /** Prompt 组装信息 */
  assembly: AssemblePromptResult;
}

// ---- 默认输出格式提示 ----
export const DEFAULT_OUTPUT_FORMAT = `
请按以下 XML 标签格式输出：

<thinking>你的思考过程（可选，不会显示给玩家）</thinking>
<maintext>剧情正文，支持多行。这是玩家会看到的主要内容。</maintext>
<option>选项A
选项B
选项C</option>
<sum>本回合一句话总结</sum>
<vars>{"HP": 80, "gold": 15}</vars>
`.trim();

// ---- 次 API Prompt（仅提取总结和变量） ----
function buildSecondaryPrompt(
  rawReply: string,
  variables: Record<string, string | number>,
): string {
  return `你是一个变量提取助手。根据以下对话内容和当前变量状态，提取总结和变量更新。

当前变量:
${JSON.stringify(variables, null, 2)}

对话内容:
${rawReply}

请按以下格式输出：
<sum>一句话总结本回合内容</sum>
<vars>{"变量名": 新值}</vars>`;
}

// ---- 主 API 调用 ----
export async function callPrimaryApi(
  settings: AppSettings,
  params: RouteRequest,
  options: RouteOptions = {},
): Promise<ApiCallResult> {
  const assembly = assemblePrompt({
    userInput: params.userInput,
    history: params.history,
    preset: params.preset,
    lorebooks: params.lorebooks,
    userName: params.userName,
    characterName: params.characterName,
    variables: params.variables,
  });

  // 在系统 Prompt 末尾追加输出格式要求
  const formatMessages = assembly.messages.map((m) => ({
    ...m,
    content:
      m.role === 'system'
        ? m.content + '\n\n' + DEFAULT_OUTPUT_FORMAT
        : m.content,
  }));

  const requestBody: Record<string, unknown> = {
    model: settings.api.model,
    messages: formatMessages,
    stream: settings.autoStream,
  };

  // 预设参数覆写
  if (params.preset.settings.temp_openai !== undefined)
    requestBody.temperature = params.preset.settings.temp_openai;
  if (params.preset.settings.openai_max_tokens !== undefined)
    requestBody.max_tokens = params.preset.settings.openai_max_tokens;
  if (params.preset.settings.top_p_openai !== undefined)
    requestBody.top_p = params.preset.settings.top_p_openai;

  const response = await fetch(
    `${settings.api.baseUrl}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.api.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: options.signal,
    },
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => 'Unknown error');
    throw new Error(`主 API 错误 ${response.status}: ${errText}`);
  }

  // 处理流式响应
  let rawReply = '';

  if (settings.autoStream && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content ?? '';
          if (content) {
            rawReply += content;
            options.onStreamChunk?.(content);
          }
        } catch {
          // 忽略解析失败的行
        }
      }
    }
  } else {
    const data = await response.json();
    rawReply = data.choices?.[0]?.message?.content ?? '';
  }

  return { rawReply, apiType: 'primary', assembly };
}

// ---- 次 API 调用 ----
export async function callSecondaryApi(
  settings: AppSettings,
  rawReply: string,
  variables: Record<string, string | number>,
  options: RouteOptions = {},
): Promise<{ sum: string; vars: Record<string, string | number> }> {
  if (!settings.secondaryApi.enabled) {
    // 次 API 未启用，从原始回复中提取
    return { sum: '', vars: {} };
  }

  const secondaryPrompt = buildSecondaryPrompt(rawReply, variables);

  const requestBody = {
    model: settings.secondaryApi.model,
    messages: [
      { role: 'user', content: secondaryPrompt },
    ],
  };

  try {
    const response = await fetch(
      `${settings.secondaryApi.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.secondaryApi.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: options.signal,
      },
    );

    if (!response.ok) {
      console.warn(`次 API 错误 ${response.status}，降级到主 API 提取`);
      return { sum: '', vars: {} };
    }

    const data = await response.json();
    const secondaryReply = data.choices?.[0]?.message?.content ?? '';

    // 从次 API 回复中提取 sum 和 vars
    const sumMatch = /<sum>([\s\S]*?)<\/sum>/i.exec(secondaryReply);
    const varsMatch = /<vars>([\s\S]*?)<\/vars>/i.exec(secondaryReply);

    let vars: Record<string, string | number> = {};
    if (varsMatch) {
      try {
        vars = JSON.parse(varsMatch[1].trim());
      } catch {
        // 非 JSON 格式则忽略
      }
    }

    return {
      sum: sumMatch?.[1]?.trim() ?? '',
      vars,
    };
  } catch (err) {
    console.warn('次 API 调用失败，降级到主 API 提取:', err);
    return { sum: '', vars: {} };
  }
}

// ---- 组合路由：主 API + 可选的次 API ----
export async function routeApiCall(
  settings: AppSettings,
  params: RouteRequest,
  options: RouteOptions = {},
): Promise<{
  rawReply: string;
  sum: string;
  vars: Record<string, string | number>;
  assembly: AssemblePromptResult;
}> {
  // 步骤 1：调用主 API
  const primaryResult = await callPrimaryApi(settings, params, options);

  // 步骤 2：如果启用次 API，调用次 API 提取总结和变量
  let sum = '';
  let vars: Record<string, string | number> = {};

  if (settings.secondaryApi.enabled) {
    const secondaryResult = await callSecondaryApi(
      settings,
      primaryResult.rawReply,
      params.variables,
      options,
    );
    sum = secondaryResult.sum;
    vars = secondaryResult.vars;
  }

  return {
    rawReply: primaryResult.rawReply,
    sum,
    vars,
    assembly: primaryResult.assembly,
  };
}
