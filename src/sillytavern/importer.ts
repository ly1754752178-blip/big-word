// ============================================================
// SillyTavern 格式导入/导出器
// ============================================================
import type { Lorebook, LorebookEntry, ChatPreset } from './types';

// ---- 导入类型 ----
export type ImportFormat = 'sillytavern' | 'json';

// ---- SillyTavern 世界书 JSON 格式 ----
interface STLorebookData {
  name?: string;
  description?: string;
  scan_depth?: number;
  token_budget?: number;
  recursive_scanning?: boolean;
  entries?: Record<string, STEntryData>;
}

interface STEntryData {
  keys?: string[];
  secondary_keys?: string[];
  content?: string;
  enabled?: boolean;
  insertion_order?: number;
  insertion_position?: number;
  constant?: boolean;
  case_sensitive?: boolean;
  selective?: boolean;
  comment?: string;
}

// ---- SillyTavern 预设 JSON 格式 ----
interface STPresetData {
  name?: string;
  temp_openai?: number;
  openai_max_tokens?: number;
  top_p_openai?: number;
  freq_pen_openai?: number;
  pres_pen_openai?: number;
  stream_openai?: boolean;
  openai_model?: string;
  prompt_order?: Array<{ id: string; label: string; enabled: boolean; order: number }>;
  [key: string]: unknown;
}

// ---- 导入世界书 ----
export function importLorebook(
  jsonData: STLorebookData | string,
): Lorebook {
  const data: STLorebookData =
    typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

  const entries: LorebookEntry[] = [];

  if (data.entries) {
    for (const [entryId, stEntry] of Object.entries(data.entries)) {
      // insertion_position: 0=before_char, 1=after_char, 2=in_chat
      const posMap: Record<number, LorebookEntry['insertionPosition']> = {
        0: 'before_character',
        1: 'after_character',
        2: 'in_chat',
      };

      entries.push({
        id: entryId,
        keys: stEntry.keys ?? [],
        secondaryKeys: stEntry.secondary_keys ?? [],
        content: stEntry.content ?? '',
        enabled: stEntry.enabled ?? true,
        insertionOrder: stEntry.insertion_order ?? 100,
        insertionPosition: posMap[stEntry.insertion_position ?? 0] ?? 'before_character',
        constantDepth: stEntry.constant ? 1 : 0,
        caseSensitive: stEntry.case_sensitive ?? false,
        selective: stEntry.selective ? 'both' : 'primary',
        comment: stEntry.comment ?? '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  }

  return {
    id: crypto.randomUUID(),
    name: data.name ?? '导入的世界书',
    description: data.description ?? '',
    entries,
    enabled: true,
    scanDepth: data.scan_depth ?? 10,
    tokenBudget: data.token_budget ?? 1000,
    recursiveScanning: data.recursive_scanning ?? false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ---- 导出世界书 ----
export function exportLorebook(book: Lorebook): string {
  const entries: Record<string, unknown> = {};

  for (const entry of book.entries) {
    const posMap: Record<string, number> = {
      before_character: 0,
      after_character: 1,
      in_chat: 2,
    };

    entries[entry.id] = {
      keys: entry.keys,
      secondary_keys: entry.secondaryKeys,
      content: entry.content,
      enabled: entry.enabled,
      insertion_order: entry.insertionOrder,
      insertion_position: posMap[entry.insertionPosition] ?? 0,
      constant: entry.constantDepth > 0,
      case_sensitive: entry.caseSensitive,
      selective: entry.selective === 'both',
      comment: entry.comment,
    };
  }

  return JSON.stringify(
    {
      name: book.name,
      description: book.description,
      scan_depth: book.scanDepth,
      token_budget: book.tokenBudget,
      recursive_scanning: book.recursiveScanning,
      entries,
    },
    null,
    2,
  );
}

// ---- 导入预设 ----
export function importPreset(
  jsonData: STPresetData | string,
  prompts?: Record<string, string>,
): ChatPreset {
  const data: STPresetData =
    typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

  return {
    id: crypto.randomUUID(),
    name: data.name ?? '导入的预设',
    settings: {
      temp_openai: data.temp_openai,
      openai_max_tokens: data.openai_max_tokens,
      top_p_openai: data.top_p_openai,
      freq_pen_openai: data.freq_pen_openai,
      pres_pen_openai: data.pres_pen_openai,
      stream_openai: data.stream_openai,
      openai_model: data.openai_model,
    },
    prompts: {
      systemPrompt: prompts?.systemPrompt ?? '',
      characterDescription: prompts?.characterDescription ?? '',
      personaDescription: prompts?.personaDescription ?? '',
      firstMessage: prompts?.firstMessage ?? '',
      exampleMessages: prompts?.exampleMessages ?? '',
      scenario: prompts?.scenario ?? '',
    },
    promptOrder: data.prompt_order ?? [],
    customInsertions: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ---- 导出预设 ----
export function exportPreset(preset: ChatPreset): string {
  return JSON.stringify(
    {
      name: preset.name,
      ...preset.settings,
      prompt_order: preset.promptOrder,
    },
    null,
    2,
  );
}

// ---- 检测导入格式 ----
export function detectImportFormat(
  data: string | object,
): ImportFormat {
  const obj = typeof data === 'string' ? JSON.parse(data) : data;

  // SillyTavern 世界书特征：有 entries 字段
  if ('entries' in obj) return 'sillytavern';

  // SillyTavern 预设特征：有 temp_openai 或 prompt_order
  if ('temp_openai' in obj || 'prompt_order' in obj) return 'sillytavern';

  // 默认为 JSON
  return 'json';
}
