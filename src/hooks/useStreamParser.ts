// ============================================================
// useStreamParser — 流式解析 Hook
// 管理 createSimpleStreamParser 的生命周期
// ============================================================
import { useState, useCallback, useRef } from 'react';
import {
  createSimpleStreamParser,
  type SimpleStreamParser,
  type StreamParseResult,
  type TagDefinition,
  DEFAULT_TAGS,
} from '../sillytavern';

// ---- Hook 返回类型 ----
export interface UseStreamParserReturn {
  /** 当前解析结果 */
  result: StreamParseResult;
  /** 追加 token */
  append: (token: string) => void;
  /** 追加完整 chunk */
  appendChunk: (chunk: string) => void;
  /** 完成解析（处理剩余缓冲区） */
  finish: () => void;
  /** 重置 */
  reset: () => void;
}

// ---- Hook 实现 ----
export function useStreamParser(
  tags: TagDefinition[] = DEFAULT_TAGS,
): UseStreamParserReturn {
  const parserRef = useRef<SimpleStreamParser>(createSimpleStreamParser(tags));
  const [result, setResult] = useState<StreamParseResult>({
    thinking: '',
    maintext: '',
    option: '',
    sum: '',
    vars: {},
    partial: {},
    complete: false,
  });

  const syncResult = useCallback(() => {
    const r = parserRef.current.getResult();
    setResult(r);
  }, []);

  const append = useCallback(
    (token: string) => {
      parserRef.current.append(token);
      syncResult();
    },
    [syncResult],
  );

  const appendChunk = useCallback(
    (chunk: string) => {
      parserRef.current.append(chunk);
      syncResult();
    },
    [syncResult],
  );

  const finish = useCallback(() => {
    syncResult();
  }, [syncResult]);

  const reset = useCallback(() => {
    parserRef.current.reset();
    setResult({
      thinking: '',
      maintext: '',
      option: '',
      sum: '',
      vars: {},
      partial: {},
      complete: false,
    });
  }, []);

  return { result, append, appendChunk, finish, reset };
}
