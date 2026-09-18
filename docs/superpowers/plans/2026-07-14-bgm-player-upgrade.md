# BGM 播放器升级实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 BGM 播放器从硬编码单曲升级为动态加载 `public/BGM/` 目录下所有音频文件，支持情景词分类浏览与选歌。播放器主体 UI 保持不变。

**Architecture:** Vite 插件在构建/开发时扫描 `public/BGM/` 生成 `manifest.json` → 运行时 fetch manifest → `BgmPlayer` 消费动态播放列表 → 点击列表按钮弹出 `BgmPlaylistPopover` 分类选歌面板。

**Tech Stack:** React 18 + TypeScript + Vite 5 + Tailwind CSS + framer-motion + lucide-react

## Global Constraints

- 支持音频格式：`.mp3` `.ogg` `.wav` `.flac` `.m4a`
- 封面格式：`.jpg` `.png`（同名匹配，jpg 优先）
- 命名规则：`<情景词>_<曲名>.<扩展名>`，第一个 `_` 分隔
- order.txt 格式：`序号、情景词`，每行一条
- 播放器现有 UI 完全不变
- 无 cover 时用情景词 HSL 色相生成渐变占位
- 弹窗风格：深色半透明毛玻璃，延续黑胶复古暖调

---

### Task 1: Vite 插件 — 构建时扫描 BGM 目录生成 manifest

**Files:**
- Modify: `vite.config.ts`
- Create: `public/BGM/order.txt`

**Interfaces:**
- Produces: `public/BGM/manifest.json` 文件，格式 `{ categories: string[], tracksByCategory: Record<string, Array<{category, title, audioUrl, coverUrl?}>> }`

- [ ] **Step 1: 创建 order.txt 模板文件**

```bash
mkdir -p public/BGM
```

写入 `public/BGM/order.txt`：

```txt
1、日常
2、午后
3、夜空
4、夏天
```

- [ ] **Step 2: 修改 vite.config.ts，添加 BGM 扫描插件**

将 `vite.config.ts` 改为：

```ts
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// ── BGM 扫描插件：构建/开发时扫描 public/BGM/，生成 manifest.json ──
function bgmScannerPlugin(): Plugin {
  const BGM_DIR = path.resolve(__dirname, 'public/BGM');
  const AUDIO_EXTS = new Set(['.mp3', '.ogg', '.wav', '.flac', '.m4a']);
  const COVER_EXTS = ['.jpg', '.png'];

  function scan() {
    const manifestPath = path.join(BGM_DIR, 'manifest.json');

    if (!fs.existsSync(BGM_DIR)) {
      fs.mkdirSync(BGM_DIR, { recursive: true });
    }

    // 读取 order.txt
    const orderPath = path.join(BGM_DIR, 'order.txt');
    const categoryOrder: string[] = [];
    if (fs.existsSync(orderPath)) {
      const lines = fs.readFileSync(orderPath, 'utf-8').split('\n').filter(Boolean);
      for (const line of lines) {
        const m = line.match(/^\d+[、,.]\s*(.+)/);
        if (m) categoryOrder.push(m[1].trim());
      }
    }

    // 扫描文件
    const allFiles = fs.existsSync(BGM_DIR) ? fs.readdirSync(BGM_DIR) : [];
    const audioFiles = allFiles.filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return AUDIO_EXTS.has(ext) && f.includes('_');
    });

    // 构建分类 map
    const categorySet = new Set<string>();
    const tracksByCategory: Record<string, Array<{
      category: string;
      title: string;
      audioUrl: string;
      coverUrl?: string;
    }>> = {};

    for (const file of audioFiles) {
      const firstUnderscore = file.indexOf('_');
      const category = file.slice(0, firstUnderscore);
      const rest = file.slice(firstUnderscore + 1);
      const ext = path.extname(rest);
      const title = rest.slice(0, rest.length - ext.length);

      // 查找封面：同名 jpg 或 png
      const baseName = file.slice(0, file.length - path.extname(file).length);
      let coverUrl: string | undefined;
      for (const cext of COVER_EXTS) {
        const coverFile = baseName + cext;
        if (allFiles.includes(coverFile)) {
          coverUrl = `/BGM/${coverFile}`;
          break;
        }
      }

      categorySet.add(category);
      if (!tracksByCategory[category]) tracksByCategory[category] = [];
      tracksByCategory[category].push({
        category,
        title,
        audioUrl: `/BGM/${file}`,
        ...(coverUrl ? { coverUrl } : {}),
      });
    }

    // 排序分类：order.txt 中的在前，其余按字母序
    const orderedCategories: string[] = [];
    for (const cat of categoryOrder) {
      if (categorySet.has(cat)) orderedCategories.push(cat);
    }
    for (const cat of [...categorySet].sort()) {
      if (!orderedCategories.includes(cat)) orderedCategories.push(cat);
    }

    const manifest = { categories: orderedCategories, tracksByCategory };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`[bgm-scanner] 已扫描 ${audioFiles.length} 首 BGM，${orderedCategories.length} 个分类`);
  }

  return {
    name: 'bgm-scanner',
    buildStart() { scan(); },
    configureServer(server) {
      scan();
      // 监听目录变化，自动重新扫描
      const watcher = server.watcher;
      if (fs.existsSync(BGM_DIR)) {
        watcher.add(BGM_DIR);
        watcher.on('change', (filePath) => {
          if (filePath.startsWith(BGM_DIR) && !filePath.endsWith('manifest.json')) {
            console.log('[bgm-scanner] 检测到 BGM 目录变化，重新扫描...');
            scan();
          }
        });
        watcher.on('add', (filePath) => {
          if (filePath.startsWith(BGM_DIR) && !filePath.endsWith('manifest.json')) {
            scan();
          }
        });
        watcher.on('unlink', (filePath) => {
          if (filePath.startsWith(BGM_DIR) && !filePath.endsWith('manifest.json')) {
            scan();
          }
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), bgmScannerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 3: 验证 — 启动 dev server 查看 manifest 是否生成**

```bash
# 由于 BGM 目录为空，预期输出 "[bgm-scanner] 已扫描 0 首 BGM，0 个分类"
# 同时 public/BGM/manifest.json 被创建
```

- [ ] **Step 4: 提交**

```bash
git add vite.config.ts public/BGM/order.txt
git commit -m "feat: 添加 BGM 扫描 Vite 插件，构建时自动生成 manifest"
```

---

### Task 2: BGM 加载器 — 运行时获取播放列表

**Files:**
- Create: `src/lib/bgm-loader.ts`

**Interfaces:**
- Produces: `loadBgmPlaylist(): Promise<BgmScanResult>`
- Exports: `BgmScanResult`, `Track` 类型

- [ ] **Step 1: 创建 bgm-loader.ts**

```ts
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
```

- [ ] **Step 2: 验证 — TypeScript 编译检查**

```bash
npx tsc --noEmit src/lib/bgm-loader.ts
```

预期：无错误。

- [ ] **Step 3: 提交**

```bash
git add src/lib/bgm-loader.ts
git commit -m "feat: 添加 BGM 运行时加载器，fetch manifest 并缓存"
```

---

### Task 3: 播放列表弹窗组件

**Files:**
- Create: `src/components/ui/BgmPlaylistPopover.tsx`

**Interfaces:**
- Consumes: `BgmScanResult`, `BgmTrack` from `@/lib/bgm-loader`
- Props: `{ result: BgmScanResult; currentTrack: BgmTrack | null; onSelect: (track: BgmTrack) => void; onClose: () => void }`

- [ ] **Step 1: 创建 BgmPlaylistPopover.tsx**

```tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BgmScanResult, BgmTrack } from '@/lib/bgm-loader';

interface BgmPlaylistPopoverProps {
  result: BgmScanResult;
  currentAudioUrl: string | null;
  onSelect: (track: BgmTrack) => void;
  onClose: () => void;
}

// ── 情景词 → HSL 色相映射（用于无封面占位） ──
const CATEGORY_HUES: Record<string, string> = {};
const HUE_POOL = [42, 30, 260, 140, 10, 200, 320, 55, 180, 340];

function getCategoryGradient(category: string): string {
  if (!CATEGORY_HUES[category]) {
    const idx = Object.keys(CATEGORY_HUES).length;
    const hue = HUE_POOL[idx % HUE_POOL.length];
    CATEGORY_HUES[category] = `linear-gradient(135deg, hsl(${hue},35%,35%) 0%, hsl(${hue + 15},30%,22%) 100%)`;
  }
  return CATEGORY_HUES[category];
}

export function BgmPlaylistPopover({
  result,
  currentAudioUrl,
  onSelect,
  onClose,
}: BgmPlaylistPopoverProps) {
  const [activeCategory, setActiveCategory] = useState<string>(
    result.categories[0] ?? ''
  );
  const panelRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const tracks = result.tracksByCategory[activeCategory] ?? [];

  return (
    <AnimatePresence>
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="absolute right-0 bottom-full mb-2 w-56 rounded-xl overflow-hidden z-50"
        style={{
          background: 'rgba(20,15,10,0.94)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* 情景词标签栏 */}
        {result.categories.length > 1 && (
          <div
            className="flex gap-0.5 px-2 pt-2 pb-1.5 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {result.categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200"
                style={{
                  background: cat === activeCategory
                    ? 'rgba(74,143,212,0.25)'
                    : 'rgba(255,255,255,0.06)',
                  color: cat === activeCategory
                    ? '#8ec8f6'
                    : 'rgba(255,255,255,0.55)',
                  border: cat === activeCategory
                    ? '1px solid rgba(74,143,212,0.4)'
                    : '1px solid transparent',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* 分隔线 */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

        {/* 曲目列表 */}
        <div className="max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
          {tracks.length === 0 ? (
            <div className="px-3 py-6 text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              此分类下暂无曲目
            </div>
          ) : (
            tracks.map((track) => {
              const isActive = track.audioUrl === currentAudioUrl;
              return (
                <button
                  key={track.audioUrl}
                  type="button"
                  onClick={() => { onSelect(track); onClose(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all duration-150"
                  style={{
                    background: isActive ? 'rgba(74,143,212,0.15)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {/* 封面缩略图 32x32 */}
                  <div
                    className="w-8 h-8 rounded-md shrink-0 overflow-hidden flex items-center justify-center"
                    style={{
                      background: track.coverUrl
                        ? '#111'
                        : getCategoryGradient(track.category),
                    }}
                  >
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[7px] font-number" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        ♪
                      </span>
                    )}
                  </div>

                  {/* 歌名 */}
                  <span
                    className="flex-1 text-xs truncate"
                    style={{ color: isActive ? '#8ec8f6' : 'rgba(240,234,216,0.85)' }}
                  >
                    {track.title}
                  </span>

                  {/* 播放中指示 */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#6AADF0', boxShadow: '0 0 6px rgba(106,173,240,0.6)' }} />
                  )}
                </button>
              );
            })
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit src/components/ui/BgmPlaylistPopover.tsx
```

预期：无错误。

- [ ] **Step 3: 提交**

```bash
git add src/components/ui/BgmPlaylistPopover.tsx
git commit -m "feat: 添加 BGM 播放列表弹出面板 — 情景词标签 + 曲目列表"
```

---

### Task 4: 改造 BgmPlayer — 接入动态播放列表和弹窗

**Files:**
- Modify: `src/components/ui/BgmPlayer.tsx`

**Interfaces:**
- Consumes: `loadBgmPlaylist`, `flattenTracks`, `BgmTrack` from `@/lib/bgm-loader`
- Consumes: `BgmPlaylistPopover` from `./BgmPlaylistPopover`
- Removes: 硬编码 `DEFAULT_PLAYLIST`，内部 `Track` 接口
- Adds: 列表按钮 `onClick` 打开弹窗，激活态高亮
- Adds: `useEffect` 启动时加载 BGM 清单

- [ ] **Step 1: 修改 BgmPlayer.tsx**

将现有 `BgmPlayer.tsx` 替换为以下内容（仅标注变更部分）：

```tsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { Repeat, SkipBack, Pause, Play, SkipForward, ListMusic, Volume2, Volume1, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { BgmPlaylistPopover } from './BgmPlaylistPopover';
import { loadBgmPlaylist, flattenTracks, type BgmTrack, type BgmScanResult } from '@/lib/bgm-loader';

// ── 唱片纹理圆环尺寸（适配 52px 唱片）──
const GROOVE_RINGS = [23, 26, 29, 32, 35, 38, 41, 44, 47];

export function BgmPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [, setCoverLoaded] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [bgmResult, setBgmResult] = useState<BgmScanResult>({ categories: [], tracksByCategory: {} });
  const [playlist, setPlaylist] = useState<BgmTrack[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // ── 启动时加载 BGM 清单 ──
  useEffect(() => {
    loadBgmPlaylist().then((result) => {
      setBgmResult(result);
      const flat = flattenTracks(result);
      setPlaylist(flat);
    });
  }, []);

  const currentTrack: BgmTrack | undefined = playlist[currentIndex];
  const hasCover = Boolean(currentTrack?.coverUrl);

  // ── 初始化 audio 元素 ──
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 0.5;
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (repeatMode === 'all') {
        handleNext();
      } else {
        setIsPlaying(false);
        audio.currentTime = 0;
      }
    };
    const onError = () => {
      setIsPlaying(false);
      setCoverLoaded(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 切换音轨时加载新音频 ──
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    const wasPlaying = !audio.paused;
    audio.src = currentTrack.audioUrl;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (wasPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 音量变更 ──
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  // ── 播放/暂停 ──
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentTrack]);

  // ── 上下首 ──
  const handlePrev = useCallback(() => {
    if (playlist.length <= 1) {
      const audio = audioRef.current;
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); setIsPlaying(true); }
      return;
    }
    setCurrentIndex((v) => (v === 0 ? playlist.length - 1 : v - 1));
  }, [playlist.length]);

  const handleNext = useCallback(() => {
    if (playlist.length <= 1) {
      const audio = audioRef.current;
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); setIsPlaying(true); }
      return;
    }
    setCurrentIndex((v) => (v === playlist.length - 1 ? 0 : v + 1));
  }, [playlist.length]);

  // ── 循环模式 ──
  const toggleRepeat = useCallback(() => {
    setRepeatMode((v) => (v === 'off' ? 'all' : v === 'all' ? 'one' : 'off'));
  }, []);

  // ── 选歌回调 ──
  const handleSelectTrack = useCallback((track: BgmTrack) => {
    const idx = playlist.findIndex((t) => t.audioUrl === track.audioUrl);
    if (idx >= 0) setCurrentIndex(idx);
  }, [playlist]);

  // ── 格式化时间 ──
  const formatTime = (t: number) => {
    if (!t || !isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── 进度条数据 ──
  const progressRatio = duration > 0 ? currentTime / duration : 0;
  const playedBars = Math.floor(progressRatio * 24);

  // ── 音量图标 ──
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.3 ? Volume1 : Volume2;

  const repeatColors: Record<string, string> = {
    off: 'text-white/30 hover:text-white/60',
    all: 'text-blue-400 hover:text-blue-300',
    one: 'text-blue-400 hover:text-blue-300',
  };

  // 共用斜边百分比
  const slantPct = '8%';

  return (
    <div
      ref={playerRef}
      id="topbar-bgm-player"
      className="h-16 flex items-center gap-3 pl-8 pr-4 relative"
      style={{
        background: hasCover
          ? 'rgba(30,25,18,0.65)'
          : 'linear-gradient(135deg, rgba(238,228,198,0.96) 0%, rgba(228,218,185,0.94) 50%, rgba(218,208,173,0.96) 100%)',
        clipPath: `polygon(${slantPct} 0, 100% 0, 100% 100%, 0% 100%)`,
        filter: 'drop-shadow(-2px 0 6px rgba(0,0,0,0.06))',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.08)',
      }}
    >
      {/* ── 毛玻璃封面背景 ── */}
      {hasCover && (
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `polygon(${slantPct} 0, 100% 0, 100% 100%, 0% 100%)` }}>
          <img
            src={currentTrack.coverUrl}
            alt=""
            className="absolute w-full h-full object-cover"
            style={{
              filter: 'blur(18px) brightness(0.5) saturate(1.3)',
              transform: 'scale(1.2)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(30,25,18,0.35)', backdropFilter: 'blur(4px)' }}
          />
        </div>
      )}

      {/* 斜边米白渐变高光 */}
      <div
        className="absolute left-0 top-0 bottom-0 pointer-events-none"
        style={{
          width: '80px',
          background: hasCover
            ? 'linear-gradient(90deg, rgba(255,250,240,0.25) 0%, rgba(255,250,240,0.06) 40%, transparent 100%)'
            : 'linear-gradient(90deg, rgba(255,250,240,0.45) 0%, rgba(250,242,225,0.18) 35%, rgba(245,235,215,0.05) 65%, transparent 100%)',
          left: '0px',
        }}
      />

      {/* 背景暖光 */}
      <div
        className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full pointer-events-none opacity-15"
        style={{
          background: hasCover
            ? 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,250,240,0.5) 0%, transparent 70%)',
        }}
      />

      {/* ── 唱片区域 52×52 ── */}
      <div className="relative w-[52px] h-[52px] shrink-0">
        <motion.div
          className="w-full h-full rounded-full flex items-center justify-center relative"
          style={{
            background: hasCover
              ? 'radial-gradient(circle at 50% 50%, rgba(20,15,10,0.6) 0%, rgba(10,8,5,0.8) 60%, rgba(15,12,8,0.75) 100%)'
              : 'radial-gradient(circle at 50% 50%, #e0d4b0 0%, #c8b888 60%, #d0c098 100%)',
            boxShadow: hasCover
              ? '0 3px 12px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)'
              : '0 3px 12px rgba(0,0,0,0.3), 0 0 0 1.5px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.04)',
          }}
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={isPlaying ? { duration: 8, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
        >
          {/* 唱片纹理 —— 同心圆轨道 */}
          {GROOVE_RINGS.map((size, i) => (
            <div
              key={size}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                border: `0.5px solid ${hasCover ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)'}`,
                opacity: i % 3 === 0 ? 0.6 : 0.25,
              }}
            />
          ))}

          {/* 封面 / 占位 */}
          <div
            className="absolute rounded-full overflow-hidden flex items-center justify-center"
            style={{
              width: '33px',
              height: '33px',
              border: `1.5px solid ${hasCover ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
              background: hasCover ? '#111' : 'linear-gradient(135deg, #e8dcc0 0%, #d8c8a0 100%)',
            }}
          >
            {hasCover ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover rounded-full"
                onError={() => setCoverLoaded(false)}
              />
            ) : (
              <span className="text-[8px] text-[#5a4030]/35 tracking-wider font-number">LP</span>
            )}
          </div>

          {/* 中心蓝标 */}
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: '12px',
              height: '12px',
              background: 'linear-gradient(135deg, #5A9ED8 0%, #2563A0 100%)',
              boxShadow: '0 0 5px rgba(90,158,216,0.45)',
            }}
          >
            <div className="rounded-full" style={{ width: '3.5px', height: '3.5px', background: '#1a1a1a' }} />
          </div>
        </motion.div>

        {/* 唱针 */}
        <div className="absolute -top-1 -right-1 w-8 h-8 pointer-events-none">
          <div
            className="absolute top-0 right-0.5 w-2.5 h-2.5 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #e8e0d8 0%, #c0b8b0 40%, #a09890 100%)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
          />
          <div
            className="absolute top-2 right-1.5 w-7 h-[1.5px] origin-right"
            style={{
              transform: 'rotate(-32deg)',
              background: 'linear-gradient(90deg, rgba(192,184,176,0.9) 0%, rgba(160,152,144,0.95) 60%, rgba(200,194,188,0.7) 100%)',
              boxShadow: '0 0 2px rgba(0,0,0,0.3)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: '2px', height: '2px',
              background: '#5A9ED8', top: '3px', left: '2.5px',
              boxShadow: '0 0 2px rgba(90,158,216,0.6)',
            }}
          />
        </div>
      </div>

      {/* ── 歌曲信息 + 进度条 + 音量 ── */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-[2px] relative z-[1]">
        {/* 歌名 */}
        <motion.span
          className="block text-[12px] font-bold truncate leading-tight"
          style={{ color: hasCover ? '#f0ead8' : '#4a3528' }}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          《{currentTrack?.title ?? '未播放歌曲'}》
        </motion.span>

        {/* 波形进度条 */}
        <div className="flex items-center gap-1.5">
          <div className="w-[100px] flex items-end gap-[1px] h-2.5">
            {Array.from({ length: 24 }).map((_, i) => {
              const isPlayed = i < playedBars;
              const heights = [0.4, 0.7, 0.55, 0.85, 0.6, 0.9, 0.5, 0.75, 0.45, 0.8, 0.35, 0.65,
                0.5, 0.7, 0.4, 0.6, 0.3, 0.55, 0.45, 0.7, 0.35, 0.5, 0.4, 0.6];
              return (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-all duration-300"
                  style={{
                    height: `${heights[i] * 100}%`,
                    background: isPlayed
                      ? 'linear-gradient(180deg, #6AADF0 0%, #3B7DC0 100%)'
                      : hasCover ? 'rgba(255,255,255,0.12)' : 'rgba(180,160,120,0.2)',
                    boxShadow: isPlayed ? '0 0 3px rgba(74,143,212,0.3)' : 'none',
                  }}
                />
              );
            })}
          </div>
          <span
            className="text-[8px] font-number shrink-0"
            style={{ color: hasCover ? 'rgba(255,255,255,0.35)' : 'rgba(90,64,48,0.3)' }}
          >
            {formatTime(currentTime)}
          </span>
        </div>

        {/* ── 音量条 ── */}
        <div className="flex items-center gap-1.5">
          <VolumeIcon
            className="w-3 h-3 shrink-0"
            style={{ color: hasCover ? 'rgba(255,255,255,0.4)' : 'rgba(90,64,48,0.35)' }}
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="音量"
            className="w-[100px] h-1 appearance-none rounded-full cursor-pointer"
            style={{
              background: `linear-gradient(90deg, ${hasCover ? '#6AADF0' : '#4A8FD4'} ${volume * 100}%, ${hasCover ? 'rgba(255,255,255,0.15)' : 'rgba(180,160,120,0.25)'} ${volume * 100}%)`,
              outline: 'none',
              accentColor: '#4A8FD4',
            }}
          />
        </div>
      </div>

      {/* ── 控制按钮 ── */}
      <div className="flex items-center gap-1 shrink-0 relative z-[1]">
        <button
          type="button" aria-label="循环模式" onClick={toggleRepeat}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${repeatColors[repeatMode]}`}
          style={{ background: repeatMode !== 'off' ? 'rgba(74,143,212,0.15)' : 'transparent' }}
        >
          <Repeat className="w-3.5 h-3.5" />
          {repeatMode === 'one' && <span className="absolute text-[6px] font-bold text-blue-400 -top-0.5">1</span>}
        </button>

        <button
          type="button" aria-label="上一首" onClick={handlePrev}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${hasCover ? 'text-white/35 hover:text-white/70 hover:bg-white/8' : 'text-[#5a4030]/40 hover:text-[#5a4030]/70 hover:bg-[#5a4030]/8'}`}
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <motion.button
          type="button" aria-label={isPlaying ? '暂停' : '播放'} onClick={togglePlay}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, #4A8FD4 0%, #3570B0 100%)',
            boxShadow: '0 2px 8px rgba(74,143,212,0.45), 0 0 16px rgba(74,143,212,0.2)',
          }}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-white" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }} />
          ) : (
            <Play className="w-3.5 h-3.5 text-white ml-0.5" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }} />
          )}
          {isPlaying && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: '2px solid rgba(74,143,212,0.4)' }}
              animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </motion.button>

        <button
          type="button" aria-label="下一首" onClick={handleNext}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${hasCover ? 'text-white/35 hover:text-white/70 hover:bg-white/8' : 'text-[#5a4030]/40 hover:text-[#5a4030]/70 hover:bg-[#5a4030]/8'}`}
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* ── 列表按钮 — 新增弹窗和激活态 ── */}
        <div className="relative">
          <button
            type="button"
            aria-label="播放列表"
            onClick={() => setShowPlaylist((v) => !v)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              color: showPlaylist
                ? '#8ec8f6'
                : (hasCover ? 'rgba(255,255,255,0.45)' : 'rgba(90,64,48,0.4)'),
              background: showPlaylist ? 'rgba(74,143,212,0.15)' : 'transparent',
            }}
          >
            <ListMusic className="w-3.5 h-3.5" />
          </button>

          {/* 弹窗 */}
          {showPlaylist && (
            <BgmPlaylistPopover
              result={bgmResult}
              currentAudioUrl={currentTrack?.audioUrl ?? null}
              onSelect={handleSelectTrack}
              onClose={() => setShowPlaylist(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

**关键变更说明：**
- 移除 `interface Track` 和 `DEFAULT_PLAYLIST`，改用 `BgmTrack` 和动态加载
- `useEffect` 启动时调用 `loadBgmPlaylist()` + `flattenTracks()`
- 列表按钮包裹在 `relative` div 中，点击切换 `showPlaylist`
- 弹窗打开时按钮显示蓝色激活态
- 新增 `handleSelectTrack` 回调：从弹窗选歌后切换 `currentIndex`

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

预期：无错误。

- [ ] **Step 3: 提交**

```bash
git add src/components/ui/BgmPlayer.tsx
git commit -m "feat: BgmPlayer 接入动态播放列表 + 弹窗选歌功能"
```

---

### Task 5: 端到端验证

**Files:**
- 手动验证（无需改动代码）

- [ ] **Step 1: 启动 dev server 验证基础功能**

```bash
npm run dev
```

验证点：
1. BGM 目录为空时，播放器显示"未播放歌曲"，不报错
2. 点击列表按钮，弹窗显示"此分类下暂无曲目"
3. 往 `public/BGM/` 放入测试 mp3 + 封面，dev server 自动重新扫描
4. 刷新后播放器加载新歌曲，封面正确显示
5. 弹窗可切换分类、选歌，播放器正常切换

- [ ] **Step 2: 验证构建**

```bash
npm run build
```

预期：构建成功，`dist/BGM/manifest.json` 存在且内容正确。

- [ ] **Step 3: 提交并推送**

```bash
git push origin feature/talent-detail-modal
```

- [ ] **Step 4: Vercel 部署验证**

推送后等待 Vercel 自动部署，访问线上地址验证 BGM 功能正常。
```
