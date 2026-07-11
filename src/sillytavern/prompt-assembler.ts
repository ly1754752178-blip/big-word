// ============================================================
// Prompt 组装器 — 按照预设顺序拼接系统提示
// ============================================================
import type {
  ChatMessage,
  ChatPreset,
  Lorebook,
  PromptOrderItem,
} from './types';
import { scanLorebooks, formatLorebookInjections, type LorebookMatch } from './lorebook-engine';
import { SYSTEM_ROLE, USER_ROLE, ASSISTANT_ROLE } from './types';

// ---- 组装参数 ----
export interface AssemblePromptParams {
  userInput: string;
  history: ChatMessage[];
  preset: ChatPreset;
  lorebooks: Lorebook[];
  userName: string;
  characterName: string;
  variables: Record<string, string | number>;
}

// ---- 组装结果 ----
export interface AssemblePromptResult {
  /** 完整的 messages 数组（可直接发往 API） */
  messages: Array<{ role: string; content: string }>;
  /** 匹配到的世界书条目 */
  lorebookMatches: LorebookMatch[];
  /** 系统 Prompt 全文（调试用） */
  systemPrompt: string;
}

// ---- 默认 Prompt 顺序 ----
export const DEFAULT_PROMPT_ORDER: PromptOrderItem[] = [
  { id: 'system_main', label: '系统主提示', enabled: true, order: 0 },
  { id: 'persona', label: '用户人设', enabled: true, order: 1 },
  { id: 'scenario', label: '场景描述', enabled: true, order: 2 },
  { id: 'world_info_before', label: '世界书(角色前)', enabled: true, order: 3 },
  { id: 'character', label: '角色定义', enabled: true, order: 4 },
  { id: 'world_info_after', label: '世界书(角色后)', enabled: true, order: 5 },
  { id: 'variables', label: '变量状态', enabled: true, order: 6 },
  { id: 'custom_insertions', label: '自定义插入', enabled: false, order: 7 },
  { id: 'example_messages', label: '示例对话', enabled: true, order: 8 },
];

// ---- 变量格式化 ----
function formatVariables(vars: Record<string, string | number>): string {
  const entries = Object.entries(vars);
  if (entries.length === 0) return '';
  return '当前游戏状态:\n' + entries
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n');
}

// ---- 组装系统 Prompt ----
function buildSystemPrompt(params: AssemblePromptParams): {
  systemPrompt: string;
  lorebookMatches: LorebookMatch[];
} {
  const {
    userInput,
    history,
    preset,
    lorebooks,
    userName,
    characterName,
    variables,
  } = params;

  // 排序 prompt 块
  const order = (preset.promptOrder?.length ?? 0) > 0
    ? [...preset.promptOrder].sort((a, b) => a.order - b.order)
    : [...DEFAULT_PROMPT_ORDER].sort((a, b) => a.order - b.order);

  // 扫描世界书
  const lorebookMatches = scanLorebooks(
    lorebooks,
    history,
    userInput,
    { scanDepth: 10, caseSensitive: false },
  );

  // 收集变量格式化
  const varsText = formatVariables(variables);

  // 按顺序组装各块
  const blocks: string[] = [];

  for (const item of order) {
    if (!item.enabled) continue;

    switch (item.id) {
      case 'system_main':
        if (preset.prompts.systemPrompt) {
          blocks.push(preset.prompts.systemPrompt);
        }
        break;

      case 'persona':
        if (preset.prompts.personaDescription) {
          blocks.push(
            `[${userName}的信息]\n${preset.prompts.personaDescription}`,
          );
        }
        break;

      case 'scenario':
        if (preset.prompts.scenario) {
          blocks.push(`[场景]\n${preset.prompts.scenario}`);
        }
        break;

      case 'world_info_before':
        {
          const wb = formatLorebookInjections(
            lorebookMatches,
            'before_character',
          );
          if (wb) blocks.push(`[世界信息]\n${wb}`);
        }
        break;

      case 'character':
        if (preset.prompts.characterDescription) {
          blocks.push(
            `[${characterName}的设定]\n${preset.prompts.characterDescription}`,
          );
        }
        break;

      case 'world_info_after':
        {
          const wa = formatLorebookInjections(
            lorebookMatches,
            'after_character',
          );
          if (wa) blocks.push(wa);
        }
        break;

      case 'variables':
        if (varsText) {
          blocks.push(varsText);
        }
        break;

      case 'custom_insertions':
        if (preset.customInsertions) {
          for (const [, text] of Object.entries(preset.customInsertions)) {
            if (text) blocks.push(text);
          }
        }
        break;

      case 'example_messages':
        if (preset.prompts.exampleMessages) {
          blocks.push(
            `[示例对话]\n${preset.prompts.exampleMessages}`,
          );
        }
        break;
    }
  }

  const systemPrompt = blocks.join('\n\n');
  return { systemPrompt, lorebookMatches };
}

// ---- 主组装函数 ----
export function assemblePrompt(
  params: AssemblePromptParams,
): AssemblePromptResult {
  const { systemPrompt, lorebookMatches } = buildSystemPrompt(params);
  const { userInput, history, preset } = params;

  // 注入聊天中的世界书
  const chatLorebook = formatLorebookInjections(
    lorebookMatches,
    'in_chat',
  );

  const messages: Array<{ role: string; content: string }> = [];

  // 系统消息
  if (systemPrompt) {
    messages.push({ role: SYSTEM_ROLE, content: systemPrompt });
  }

  // 历史消息
  for (const msg of history) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // 聊天内世界书（注入到最新用户消息前）
  if (chatLorebook) {
    messages.push({
      role: SYSTEM_ROLE,
      content: `[当前相关设定]\n${chatLorebook}`,
    });
  }

  // 用户输入
  messages.push({ role: USER_ROLE, content: userInput });

  // 如果有首条消息且历史为空，在前面加入
  if (history.length === 0 && preset.prompts.firstMessage) {
    // 作为 assistant 的第一条引导消息插入在用户消息之前
    messages.splice(1, 0, {
      role: ASSISTANT_ROLE,
      content: preset.prompts.firstMessage,
    });
  }

  return { messages, lorebookMatches, systemPrompt };
}
