// ============================================================
// 编辑器工具函数 — 纯函数，无副作用
// ============================================================
import type { Lorebook, LorebookEntry, PromptOrderItem } from './types';

// ---- 创建默认条目 ----
export function createDefaultEntry(): LorebookEntry {
  return {
    id: crypto.randomUUID(),
    keys: [],
    secondaryKeys: [],
    content: '',
    enabled: true,
    insertionOrder: 100,
    insertionPosition: 'before_character',
    constantDepth: 0,
    caseSensitive: false,
    selective: 'primary',
    comment: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ---- 创建默认世界书 ----
export function createDefaultLorebook(name?: string): Lorebook {
  return {
    id: crypto.randomUUID(),
    name: name ?? '新建世界书',
    description: '',
    entries: [],
    enabled: true,
    scanDepth: 10,
    tokenBudget: 1000,
    recursiveScanning: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ---- 应用条目默认值 ----
export function applyEntryDefaults(
  partial: Partial<LorebookEntry>,
): LorebookEntry {
  const base = createDefaultEntry();
  return { ...base, ...partial, id: partial.id ?? base.id };
}

// ---- 更新世界书中的条目 ----
export function updateEntry(
  book: Lorebook,
  entryId: string,
  updates: Partial<LorebookEntry>,
): Lorebook {
  return {
    ...book,
    entries: book.entries.map((e) =>
      e.id === entryId
        ? { ...e, ...updates, updatedAt: Date.now() }
        : e,
    ),
    updatedAt: Date.now(),
  };
}

// ---- 删除世界书中的条目 ----
export function removeEntry(book: Lorebook, entryId: string): Lorebook {
  return {
    ...book,
    entries: book.entries.filter((e) => e.id !== entryId),
    updatedAt: Date.now(),
  };
}

// ---- 移动 Prompt 顺序项 ----
export function movePromptItem(
  items: PromptOrderItem[],
  fromIndex: number,
  toIndex: number,
): PromptOrderItem[] {
  const result = [...items];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  // 重新编号
  return result.map((item, idx) => ({ ...item, order: idx }));
}

// ---- 数值钳制 ----
export function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
