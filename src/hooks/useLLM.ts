import { useCallback } from 'react';
import { parseLLMResponse, type LLMContext } from '@/lib/llm';

export function useLLM() {
  const send = useCallback(async (input: string, context: LLMContext) => {
    // 占位实现：真实环境可替换为 fetch API 调用后端 LLM
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const mockRaw = `
<scene>夕阳斜斜地照进${context.locationName}，空气里带着夏末的暖意。远处的电车声若有若无。</scene>
<dialogue name="雪之下雪乃">你刚才说「${input}」……正好，我有个问题想问你。</dialogue>
<option>点头倾听</option>
<option>问她怎么了</option>
<option>说自己正要离开</option>
    `.trim();

    return parseLLMResponse(mockRaw);
  }, []);

  return { send };
}
