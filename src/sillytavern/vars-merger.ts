// ============================================================
// 变量深度合并器 — 支持嵌套对象合并
// ============================================================

/** 检查值是否为可合并的普通对象 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 深度合并两个变量对象。
 * base 中的值被 updates 中的同名键覆盖。
 * 嵌套对象进行递归合并而非替换。
 */
export function deepMerge(
  base: Record<string, string | number>,
  updates: Record<string, string | number>,
): Record<string, string | number> {
  const result: Record<string, string | number> = { ...base };

  for (const key of Object.keys(updates)) {
    const updateVal = updates[key];
    const baseVal = result[key];

    if (
      isPlainObject(updateVal) &&
      isPlainObject(baseVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, string | number>,
        updateVal as Record<string, string | number>,
      ) as unknown as string | number;
    } else {
      result[key] = updateVal;
    }
  }

  return result;
}

/**
 * 从 LLM 回复中提取变量更新。
 * 解析 <vars>...</vars> 标签内的 JSON 或 key:value 文本。
 */
export function extractVariables(
  rawReply: string,
): { cleanedText: string; updates: Record<string, string | number> } {
  const varsRegex = /<vars>([\s\S]*?)<\/vars>/gi;
  let cleanedText = rawReply;
  const updates: Record<string, string | number> = {};

  let match: RegExpExecArray | null;
  while ((match = varsRegex.exec(rawReply)) !== null) {
    const varsText = match[1].trim();
    cleanedText = cleanedText.replace(match[0], '');

    try {
      const parsed = JSON.parse(varsText);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.assign(updates, parsed);
      }
    } catch {
      // 按行解析 key:value
      const lines = varsText.split('\n');
      for (const line of lines) {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          const key = line.slice(0, colonIdx).trim();
          const value = line.slice(colonIdx + 1).trim();
          const num = Number(value);
          updates[key] = Number.isNaN(num) ? value : num;
        }
      }
    }
  }

  // 同时提取 <sum> 标签（总结不用于变量，但从回复中清理）
  cleanedText = cleanedText.replace(/<sum>[\s\S]*?<\/sum>/gi, '').trim();

  return { cleanedText, updates };
}

/**
 * 合并变量（非深度版本，用于聊天）。
 */
export function mergeVariables(
  current: Record<string, string | number>,
  updates: Record<string, string | number>,
): Record<string, string | number> {
  return { ...current, ...updates };
}
