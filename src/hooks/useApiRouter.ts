// ============================================================
// useApiRouter — API 路由 Hook
// 封装双 API 调用逻辑，管理请求状态
// ============================================================
import { useState, useCallback, useRef } from 'react';
import {
  routeApiCall,
  type RouteRequest,
  type RouteOptions,
  type AssemblePromptResult,
} from '../sillytavern';
import type { AppSettings } from '../sillytavern';

// ---- Hook 返回类型 ----
export interface UseApiRouterReturn {
  /** 是否正在请求 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 最后一次调用的结果 */
  lastResult: {
    rawReply: string;
    sum: string;
    vars: Record<string, string | number>;
    assembly: AssemblePromptResult;
  } | null;
  /** 流式累积的文本 */
  streamedText: string;
  /** 发送请求 */
  send: (
    settings: AppSettings,
    params: RouteRequest,
    options?: RouteOptions,
  ) => Promise<{
    rawReply: string;
    sum: string;
    vars: Record<string, string | number>;
    assembly: AssemblePromptResult;
  }>;
  /** 清空错误 */
  clearError: () => void;
  /** 重置状态 */
  reset: () => void;
}

// ---- Hook 实现 ----
export function useApiRouter(): UseApiRouterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<UseApiRouterReturn['lastResult']>(null);
  const [streamedText, setStreamedText] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (
      settings: AppSettings,
      params: RouteRequest,
      options?: RouteOptions,
    ) => {
      setIsLoading(true);
      setError(null);
      setStreamedText('');

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const result = await routeApiCall(settings, params, {
          ...options,
          signal: controller.signal,
          onStreamChunk: (chunk) => {
            setStreamedText((prev) => prev + chunk);
            options?.onStreamChunk?.(chunk);
          },
        });

        setLastResult(result);
        return result;
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          setError('请求已取消');
        } else {
          const message = err instanceof Error ? err.message : '未知错误';
          setError(message);
        }
        throw err;
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setLastResult(null);
    setStreamedText('');
  }, []);

  return { isLoading, error, lastResult, streamedText, send, clearError, reset };
}
