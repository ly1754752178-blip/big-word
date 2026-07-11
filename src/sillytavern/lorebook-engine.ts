// ============================================================
// 世界书引擎 — 关键词匹配 & 上下文注入
// ============================================================
import type { Lorebook, LorebookEntry, ChatMessage } from './types';

// ---- 匹配结果 ----
export interface LorebookMatch {
  bookId: string;
  bookName: string;
  entry: LorebookEntry;
  /** 命中的关键词 */
  matchedKey: string;
  /** 匹配类型 */
  matchType: 'primary' | 'secondary';
}

// ---- 配置 ----
export interface LorebookEngineConfig {
  /** 扫描最近 N 条消息 */
  scanDepth: number;
  /** 是否区分大小写 */
  caseSensitive: boolean;
}

// ---- 核心匹配逻辑 ----
export function scanLorebooks(
  books: Lorebook[],
  recentMessages: ChatMessage[],
  userInput: string,
  config: LorebookEngineConfig = { scanDepth: 10, caseSensitive: false },
): LorebookMatch[] {
  const matches: LorebookMatch[] = [];

  // 合并最近消息 + 当前输入作为扫描文本
  const scanMessages = recentMessages.slice(-config.scanDepth);
  const scanText = [
    ...scanMessages.map((m) => m.content),
    userInput,
  ].join('\n');

  const normalizedText = config.caseSensitive ? scanText : scanText.toLowerCase();

  for (const book of books) {
    if (!book.enabled) continue;

    for (const entry of book.entries) {
      if (!entry.enabled) continue;

      const normalize = (s: string) =>
        config.caseSensitive ? s : s.toLowerCase();

      // 步骤 1：检查主关键词
      let primaryMatch: string | null = null;
      for (const key of entry.keys) {
        if (normalizedText.includes(normalize(key))) {
          primaryMatch = key;
          break;
        }
      }

      if (!primaryMatch) continue; // 主关键词未命中，跳过

      // 步骤 2：根据选择性配置决定是否需要次级匹配
      if (entry.selective === 'both' && entry.secondaryKeys.length > 0) {
        let secondaryMatch: string | null = null;
        for (const key of entry.secondaryKeys) {
          if (normalizedText.includes(normalize(key))) {
            secondaryMatch = key;
            break;
          }
        }
        if (!secondaryMatch) continue; // 需要次级但未命中
      }

      matches.push({
        bookId: book.id,
        bookName: book.name,
        entry,
        matchedKey: primaryMatch,
        matchType: 'primary',
      });
    }
  }

  // 按 insertionOrder 排序（数字越大越靠前）
  matches.sort((a, b) => b.entry.insertionOrder - a.entry.insertionOrder);

  return matches;
}

// ---- 将匹配条目组织为 Prompt 注入文本 ----
export function formatLorebookInjections(
  matches: LorebookMatch[],
  position: 'before_character' | 'after_character' | 'in_chat',
  tokenBudget: number = 1000,
): string {
  const relevant = matches.filter(
    (m) => m.entry.insertionPosition === position,
  );

  if (relevant.length === 0) return '';

  const parts: string[] = [];
  let usedTokens = 0;

  for (const match of relevant) {
    const content = match.entry.content;
    // 粗略估计 token 数（中文约 1 字 1 token，英文约 4 字符 1 token）
    const estimatedTokens = Math.ceil(content.length / 2);
    if (usedTokens + estimatedTokens > tokenBudget) break;

    parts.push(`[${match.bookName}] ${content}`);
    usedTokens += estimatedTokens;
  }

  return parts.join('\n');
}
