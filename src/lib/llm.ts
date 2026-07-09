export interface LLMContext {
  locationName: string;
  time: string;
  playerName: string;
  charactersPresent: string[];
  history: string[];
}

export function buildPrompt(input: string, context: LLMContext): string {
  const present = context.charactersPresent.length > 0 ? context.charactersPresent.join('、') : '无';
  const history = context.history.length > 0 ? context.history.join('\n') : '（暂无）';

  return `你正在撰写一款现实日本生活模拟游戏的剧情。

当前场景：${context.locationName}
当前时间：${context.time}
在场角色：${present}
玩家姓名：${context.playerName}

最近的剧情：
${history}

玩家输入："${input}"

请用中文返回下一段剧情，包含：
1. 一段场景旁白（使用 <scene> 标签）
2. 若有角色发言，使用 <dialogue name="角色名"> 标签
3. 最后提供 2-4 个玩家可选择的选项（使用 <option> 标签）

示例格式：
<scene>夕阳照进教室，窗帘被风吹得轻轻晃动。</scene>
<dialogue name="雪之下雪乃">你也在啊。正好，我有个问题想问你。</dialogue>
<option>点头倾听</option>
<option>问她怎么了</option>
<option>说自己正要离开</option>`;
}

export interface ParsedLLMResponse {
  scene: string;
  dialogues: { speaker: string; content: string }[];
  options: { id: string; label: string }[];
}

export function parseLLMResponse(raw: string): ParsedLLMResponse {
  const scene = raw.match(/<scene>([\s\S]*?)<\/scene>/)?.[1]?.trim() ?? '';
  const dialogues = Array.from(raw.matchAll(/<dialogue name="(.*?)">([\s\S]*?)<\/dialogue>/g)).map((m) => ({
    speaker: m[1].trim(),
    content: m[2].trim(),
  }));
  const options = Array.from(raw.matchAll(/<option>([\s\S]*?)<\/option>/g)).map((m, i) => ({
    id: `opt-${i}`,
    label: m[1].trim(),
  }));

  return { scene, dialogues, options };
}
