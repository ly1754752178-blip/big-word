import type { Destination, LatLon, RouteResult, TravelMode } from '@/types';
import { TRAVEL_MODE_LABEL } from './routing';

export interface TravelContext {
  action: 'travel';
  origin: { name: string; lat: number; lon: number };
  destination: { name: string; lat: number; lon: number };
  mode: TravelMode;
  distanceKm: number;
  durationMin: number;
  summary: string;
  legs: RouteResult['legs'];
}

/** 把「玩家当前坐标 + 目的地 + 路线」组成结构化 JSON，供 LLM 使用 */
export function buildTravelContext(
  playerPosition: LatLon,
  destination: Destination,
  route: RouteResult,
  originName = '当前位置',
): TravelContext {
  return {
    action: 'travel',
    origin: { name: originName, lat: playerPosition.lat, lon: playerPosition.lon },
    destination: { name: destination.name, lat: destination.lat, lon: destination.lon },
    mode: route.mode,
    distanceKm: +(route.distanceMeters / 1000).toFixed(2),
    durationMin: Math.round(route.durationSeconds / 60),
    summary: route.summary,
    legs: route.legs,
  };
}

/** 转成给 LLM 的自然语言提示片段 */
export function travelContextToPrompt(ctx: TravelContext): string {
  return (
    `玩家正在移动：从「${ctx.origin.name}」前往「${ctx.destination.name}」，` +
    `方式为${TRAVEL_MODE_LABEL[ctx.mode]}，约 ${ctx.distanceKm} km、${ctx.durationMin} 分钟。` +
    `路线：${ctx.summary}。请据此描述这段旅途。`
  );
}
