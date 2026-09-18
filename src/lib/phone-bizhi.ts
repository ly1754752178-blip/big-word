/** bizhi 壁纸清单（由 vite bizhi-scanner 插件生成 public/bizhi/manifest.json） */
export interface BizhiManifest {
  /** 数字命名的默认壁纸文件名 */
  defaults: string[];
  /** 非数字命名的内置壁纸文件名 */
  builtins: string[];
}

// 缓存
let cached: BizhiManifest | null = null;
let fetchPromise: Promise<BizhiManifest> | null = null;

/** 加载手机壁纸清单（自动缓存） */
export function loadBizhiManifest(): Promise<BizhiManifest> {
  if (cached) return Promise.resolve(cached);
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('/bizhi/manifest.json')
    .then((res) => {
      if (!res.ok) throw new Error(`bizhi manifest 加载失败: ${res.status}`);
      return res.json() as Promise<BizhiManifest>;
    })
    .then((data) => {
      cached = { defaults: data.defaults ?? [], builtins: data.builtins ?? [] };
      fetchPromise = null;
      return cached;
    })
    .catch((err) => {
      console.warn('[phone-bizhi] 无法加载壁纸清单，使用空列表:', err);
      fetchPromise = null;
      const fallback: BizhiManifest = { defaults: [], builtins: [] };
      cached = fallback;
      return fallback;
    });

  return fetchPromise;
}

/** 拼出 public 资源访问 URL */
export function bizhiUrl(fileName: string): string {
  return `/bizhi/${encodeURIComponent(fileName)}`;
}
