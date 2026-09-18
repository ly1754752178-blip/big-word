import type { LatLon, RouteResult, TravelMode } from '@/types';

// FOSSGIS 公共路由服务器（基于 OSRM，覆盖日本，免费无 key）
const OSRM_BASE: Record<Exclude<TravelMode, 'transit'>, string> = {
  walking: 'https://routing.openstreetmap.de/routed-foot/route/v1/driving/',
  driving: 'https://routing.openstreetmap.de/routed-car/route/v1/driving/',
  cycling: 'https://routing.openstreetmap.de/routed-bike/route/v1/driving/',
};

export async function getRoute(
  mode: Exclude<TravelMode, 'transit'>,
  from: LatLon,
  to: LatLon,
): Promise<RouteResult> {
  const url =
    `${OSRM_BASE[mode]}${from.lon},${from.lat};${to.lon},${to.lat}` +
    `?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`路线服务错误 HTTP ${res.status}`);
  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error('未找到可用路线');
  return {
    mode,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    geometry: route.geometry.coordinates,
    legs: [
      {
        mode,
        fromName: '当前位置',
        toName: '目的地',
        distanceMeters: route.distance,
        durationSeconds: route.duration,
      },
    ],
    summary: `${TRAVEL_MODE_LABEL[mode]} ${formatDistance(route.distance)} · 约 ${formatDuration(route.duration)}`,
  };
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min} 分钟`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} 小时` : `${h} 小时 ${m} 分钟`;
}

export const TRAVEL_MODE_LABEL: Record<TravelMode, string> = {
  walking: '步行',
  driving: '驾车',
  cycling: '骑行',
  transit: '电车',
};
