// ============================================================
// SillyTavern 类型定义 — 完整 v3 游戏模式类型体系
// ============================================================

// ---- 基础标识 ----
export const USER_ROLE = 'user' as const;
export const ASSISTANT_ROLE = 'assistant' as const;
export const SYSTEM_ROLE = 'system' as const;

export type MessageRole = typeof USER_ROLE | typeof ASSISTANT_ROLE | typeof SYSTEM_ROLE;

// ---- 聊天消息 ----
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  /** 该消息产生时的变量快照 */
  variables: Record<string, string | number>;
}

// ---- 聊天会话 ----
export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  characterName: string;
  userName: string;
  presetId: string | null;
  lorebookIds: string[];
  variables: Record<string, string | number>;
  createdAt: number;
  updatedAt: number;
}

// ---- 世界书条目 ----
export interface LorebookEntry {
  id: string;
  /** 主关键词（触发词列表） */
  keys: string[];
  /** 次级关键词（仅当主关键词已命中时才检查） */
  secondaryKeys: string[];
  /** 注入内容 */
  content: string;
  /** 是否启用 */
  enabled: boolean;
  /** 优先级（数字越大越靠前） */
  insertionOrder: number;
  /** 插入位置：before_character = 角色定义前, after_character = 角色定义后, in_chat = 聊天顶部 */
  insertionPosition: 'before_character' | 'after_character' | 'in_chat';
  /** 常量深度（0 为始终注入，1 为仅次级命中时注入更深层） */
  constantDepth: number;
  /** 是否大小写敏感 */
  caseSensitive: boolean;
  /** 选择性检查：primary 仅检查主关键词, both 检查主+次 */
  selective: 'primary' | 'both';
  /** 可选备注 */
  comment: string;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
}

// ---- 世界书 ----
export interface Lorebook {
  id: string;
  name: string;
  description: string;
  entries: LorebookEntry[];
  /** 是否全局启用 */
  enabled: boolean;
  /** 扫描深度（会话中最近 N 条消息） */
  scanDepth: number;
  /** 单个条目最大 token 预算 */
  tokenBudget: number;
  /** 递归扫描层数 */
  recursiveScanning: boolean;
  createdAt: number;
  updatedAt: number;
}

// ---- Prompt 顺序项 ----
export interface PromptOrderItem {
  /** 块的标识符 */
  id: string;
  /** 显示名称 */
  label: string;
  /** 是否启用 */
  enabled: boolean;
  /** 排序权重（数字越小越靠前） */
  order: number;
}

// ---- 聊天预设 ----
export interface ChatPreset {
  id: string;
  name: string;
  /** 采样参数 */
  settings: PresetSettings;
  /** Prompt 文本片段 */
  prompts: PresetPrompts;
  /** Prompt 块排列顺序 */
  promptOrder: PromptOrderItem[];
  /** 自定义插入文本 */
  customInsertions: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

// ---- 预设采样参数 ----
export interface PresetSettings {
  temp_openai?: number;
  openai_max_tokens?: number;
  top_p_openai?: number;
  freq_pen_openai?: number;
  pres_pen_openai?: number;
  stream_openai?: boolean;
  openai_model?: string;
  /** 自定义停止序列 */
  customStoppingStrings?: string[];
}

// ---- 预设 Prompt 文本 ----
export interface PresetPrompts {
  /** 系统 Prompt */
  systemPrompt: string;
  /** 角色定义 */
  characterDescription: string;
  /** 用户定义 */
  personaDescription: string;
  /** 聊天开头 */
  firstMessage: string;
  /** 示例对话 */
  exampleMessages: string;
  /** 场景描述 */
  scenario: string;
}

// ---- API 配置 ----
export interface ApiConfig {
  /** API 基础地址 */
  baseUrl: string;
  /** API 密钥 */
  apiKey: string;
  /** 模型名称 */
  model: string;
}

// ---- 次 API 配置 ----
export interface SecondaryApiConfig extends ApiConfig {
  /** 是否启用次 API */
  enabled: boolean;
  /** 次 API 负责的标签（默认 sum, vars） */
  handledTags: string[];
}

// ---- 自定义标签配置 ----
export interface CustomTag {
  /** 标签名（不含尖括号） */
  name: string;
  /** 显示标签 */
  label: string;
  /** 是否在流式解析中启用 */
  enabled: boolean;
}

// ---- 应用设置 ----
export interface AppSettings {
  /** 角色名 */
  characterName: string;
  /** 用户名 */
  userName: string;
  /** UI 模式 */
  uiMode: 'game' | 'chat';
  /** 主 API */
  api: ApiConfig;
  /** 次 API */
  secondaryApi: SecondaryApiConfig;
  /** 当前激活的预设 ID */
  activePresetId: string | null;
  /** 当前激活的世界书 ID 列表 */
  activeLorebookIds: string[];
  /** 自定义标签集 */
  customTags: CustomTag[];
  /** 是否自动流式输出 */
  autoStream: boolean;
  /** 语言 */
  language: string;
}

// ---- 流式解析中间状态 ----
export interface StreamParseState {
  /** 当前所在的标签栈 */
  tagStack: string[];
  /** 当前正在收集文本的标签 */
  currentTag: string | null;
  /** 各标签已收集的文本 */
  buffers: Record<string, string>;
  /** 是否思考已结束 */
  thinkingEnded: boolean;
  /** 正文是否已完成 */
  maintextComplete: boolean;
}

// ---- 流式解析结果 ----
export interface StreamParseResult {
  thinking: string;
  maintext: string;
  option: string;
  sum: string;
  vars: Record<string, string | number>;
  /** 当前可显示的部分结果 */
  partial: Partial<{
    thinking: string;
    maintext: string;
    option: string;
  }>;
  /** 是否全部解析完成 */
  complete: boolean;
}

// ---- 变量楼层快照 ----
export interface VariableSnapshot {
  /** 关联的消息 ID */
  messageId: string;
  /** 该消息时的变量状态 */
  variables: Record<string, string | number>;
  /** 时间戳 */
  timestamp: number;
}

// ---- API 路由请求 ----
export interface ApiRouteRequest {
  /** 用户输入 */
  userInput: string;
  /** 聊天历史 */
  history: ChatMessage[];
  /** 当前变量 */
  variables: Record<string, string | number>;
  /** 角色名 */
  characterName: string;
  /** 用户名 */
  userName: string;
}

// ---- 默认设置工厂 ----
export function createDefaultSettings(): AppSettings {
  return {
    characterName: '未命名角色',
    userName: '玩家',
    uiMode: 'game',
    api: {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o',
    },
    secondaryApi: {
      enabled: false,
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o-mini',
      handledTags: ['sum', 'vars'],
    },
    activePresetId: null,
    activeLorebookIds: [],
    customTags: [
      { name: 'thinking', label: '思考', enabled: true },
      { name: 'think', label: '思考(简)', enabled: true },
      { name: 'maintext', label: '正文', enabled: true },
      { name: 'option', label: '选项', enabled: true },
      { name: 'sum', label: '总结', enabled: true },
      { name: 'vars', label: '变量', enabled: true },
    ],
    autoStream: true,
    language: 'zh-CN',
  };
}
