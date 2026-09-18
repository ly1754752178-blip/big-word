// POI 图标与名称的独立疏密选择引擎。
// 「地点图标设置」与「地名设置」各持一套两圈模型：
// 内圈（≤radius 米）最小间距 baseSpacing；外圈（>radius 米）最小间距 baseSpacing + extraSpacing。
// 只有用户显式开启 hideOutside 时才完全隐藏外圈对应元素。

export interface ZoneSettings {
  radius: number; // 显示半径（米）
  baseSpacing: number; // 圈内最小间距（米）
  extraSpacing: number; // 圈外额外间距（米）
  hideOutside: boolean; // 圈外是否完全隐藏
}

export interface PoiSettings {
  icon: ZoneSettings; // 地点图标设置
  label: ZoneSettings; // 地名设置
}

const DEFAULT_ICON: ZoneSettings = { radius: 1000, baseSpacing: 200, extraSpacing: 1000, hideOutside: false };
const DEFAULT_LABEL: ZoneSettings = { radius: 1000, baseSpacing: 100, extraSpacing: 1000, hideOutside: false };

export const DEFAULT_POI_SETTINGS: PoiSettings = {
  icon: { ...DEFAULT_ICON },
  label: { ...DEFAULT_LABEL },
};

const STORAGE_KEY = 'no2-poi-settings';

function parseZone(raw: unknown, fallback: ZoneSettings): ZoneSettings {
  const r = raw as Partial<ZoneSettings> | null | undefined;
  if (!r || typeof r !== 'object') return { ...fallback };
  return {
    radius: Number.isFinite(r.radius) ? (r.radius as number) : fallback.radius,
    baseSpacing: Number.isFinite(r.baseSpacing) ? (r.baseSpacing as number) : fallback.baseSpacing,
    extraSpacing: Number.isFinite(r.extraSpacing) ? (r.extraSpacing as number) : fallback.extraSpacing,
    hideOutside: !!r.hideOutside,
  };
}

export function loadPoiSettings(): PoiSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PoiSettings>;
      return {
        icon: parseZone(parsed.icon, DEFAULT_ICON),
        label: parseZone(parsed.label, DEFAULT_LABEL),
      };
    }
  } catch {
    /* ignore */
  }
  return { icon: { ...DEFAULT_ICON }, label: { ...DEFAULT_LABEL } };
}

export function savePoiSettings(s: PoiSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export interface PoiCandidate {
  lng: number;
  lat: number;
  name: string;
  cls: string;
  sub: string;
  rank: number;
}

const METERS_PER_DEG_LAT = 110540;

/**
 * 从候选 POI 中挑选要显示的集合（图标与名称各自独立调用）。
 * 采用等距柱状投影（以玩家为原点，误差在几十公里内可忽略），
 * 贪心 + 优先级（rank 高者先占位，同 rank 就近优先）。
 */
export function selectPois(
  pois: PoiCandidate[],
  player: { lat: number; lon: number },
  s: ZoneSettings,
): PoiCandidate[] {
  const cosLat = Math.cos((player.lat * Math.PI) / 180);
  const metersPerDegLng = 111320 * cosLat;

  const scored: { p: PoiCandidate; x: number; y: number; d: number; spacing: number; priority: number }[] = [];
  for (const p of pois) {
    const x = (p.lng - player.lon) * metersPerDegLng;
    const y = (p.lat - player.lat) * METERS_PER_DEG_LAT;
    const d = Math.sqrt(x * x + y * y);
    let spacing: number;
    if (d <= s.radius) {
      spacing = s.baseSpacing;
    } else if (s.hideOutside) {
      continue;
    } else {
      spacing = s.baseSpacing + s.extraSpacing;
    }
    scored.push({ p, x, y, d, spacing, priority: p.rank || 0 });
  }

  scored.sort((a, b) => (b.priority - a.priority) || (a.d - b.d));

  const kept: { x: number; y: number; spacing: number }[] = [];
  const result: PoiCandidate[] = [];
  for (const it of scored) {
    let ok = true;
    for (const k of kept) {
      const dx = k.x - it.x;
      const dy = k.y - it.y;
      const th = Math.max(it.spacing, k.spacing);
      if (dx * dx + dy * dy < th * th) {
        ok = false;
        break;
      }
    }
    if (ok) {
      kept.push({ x: it.x, y: it.y, spacing: it.spacing });
      result.push(it.p);
    }
  }
  return result;
}
