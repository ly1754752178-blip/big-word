/** BGM 单曲 */
export interface BgmTrack {
  category: string;
  title: string;
  audioUrl: string;
  coverUrl?: string;
}

/** BGM 清单 */
export interface BgmScanResult {
  categories: string[];
  tracksByCategory: Record<string, BgmTrack[]>;
}

// 缓存
let cached: BgmScanResult | null = null;
let fetchPromise: Promise<BgmScanResult> | null = null;

/** 加载 BGM 播放列表（自动缓存） */
export async function loadBgmPlaylist(): Promise<BgmScanResult> {
  if (cached) return cached;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('/BGM/manifest.json')
    .then((res) => {
      if (!res.ok) throw new Error(`BGM manifest 加载失败: ${res.status}`);
      return res.json() as Promise<BgmScanResult>;
    })
    .then((data) => {
      cached = data;
      fetchPromise = null;
      return cached;
    })
    .catch((err) => {
      console.warn('[bgm-loader] 无法加载 BGM 清单，使用空列表:', err);
      fetchPromise = null;
      const fallback: BgmScanResult = { categories: [], tracksByCategory: {} };
      cached = fallback;
      return fallback;
    });

  return fetchPromise;
}

/** 将分类后的数据展平为顺序播放列表 */
export function flattenTracks(result: BgmScanResult): BgmTrack[] {
  const flat: BgmTrack[] = [];
  for (const cat of result.categories) {
    flat.push(...(result.tracksByCategory[cat] ?? []));
  }
  return flat;
}
