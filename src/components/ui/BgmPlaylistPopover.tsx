import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Search, ListMusic, Music } from 'lucide-react';
import type { BgmScanResult, BgmTrack } from '@/lib/bgm-loader';
import { useGame } from '@/hooks/useGameState';
import { getPhoneUiStyle } from '@/lib/phone-ui-styles';

interface BgmPlaylistPopoverProps {
  result: BgmScanResult;
  currentAudioUrl: string | null;
  onSelect: (track: BgmTrack) => void;
  onClose: () => void;
  /** 锚点元素，用于计算 fixed 定位（脱离层叠上下文限制） */
  anchorEl: HTMLElement | null;
}

// ── 分类名 → 稳定色相（确定性哈希，封面占位用） ──
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function getCategoryGradient(category: string): string {
  const hue = hashString(category) % 360;
  return `linear-gradient(135deg, hsl(${hue},42%,38%) 0%, hsl(${(hue + 30) % 360},34%,24%) 100%)`;
}

export function BgmPlaylistPopover({
  result,
  currentAudioUrl,
  onSelect,
  onClose,
  anchorEl,
}: BgmPlaylistPopoverProps) {
  const { state } = useGame();
  const style = getPhoneUiStyle(state.phoneUiStyle);

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const categoryListRef = useRef<HTMLDivElement>(null);
  const trackListRef = useRef<HTMLDivElement>(null);

  const categories = result.categories;
  const totalTracks = useMemo(
    () => categories.reduce((sum, cat) => sum + (result.tracksByCategory[cat]?.length ?? 0), 0),
    [categories, result.tracksByCategory]
  );

  const query = search.trim().toLowerCase();

  // ── 打开时定位到当前曲目所在分类 ──
  useEffect(() => {
    if (!currentAudioUrl) return;
    for (const cat of categories) {
      const hit = (result.tracksByCategory[cat] ?? []).some((t) => t.audioUrl === currentAudioUrl);
      if (hit) {
        setActiveCategory(cat);
        return;
      }
    }
  }, [currentAudioUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── result 异步加载后同步 activeCategory ──
  useEffect(() => {
    setActiveCategory((prev) => (categories.includes(prev) ? prev : categories[0] ?? ''));
  }, [categories]);

  // ── 跨分类搜索匹配 ──
  const matchingTracks = useMemo(() => {
    if (!query) return null;
    const out: BgmTrack[] = [];
    for (const cat of categories) {
      for (const t of result.tracksByCategory[cat] ?? []) {
        if (t.title.toLowerCase().includes(query) || cat.toLowerCase().includes(query)) {
          out.push(t);
        }
      }
    }
    return out;
  }, [query, categories, result.tracksByCategory]);

  // ── 分类曲目计数（搜索态显示匹配数） ──
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    if (query && matchingTracks) {
      for (const t of matchingTracks) map[t.category] = (map[t.category] ?? 0) + 1;
    } else {
      for (const cat of categories) map[cat] = result.tracksByCategory[cat]?.length ?? 0;
    }
    return map;
  }, [query, matchingTracks, categories, result.tracksByCategory]);

  // ── 点击外部 / Esc 关闭 ──
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    },
    [onClose]
  );
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── 切换到某分类 / 搜索变化时，滚动到可视位置 ──
  useEffect(() => {
    const catEl = categoryListRef.current?.querySelector<HTMLElement>(
      `[data-cat="${CSS.escape(activeCategory)}"]`
    );
    catEl?.scrollIntoView({ block: 'nearest' });
    const activeEl = trackListRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeCategory, query]);

  // ── 当前要展示的曲目列表 ──
  const visibleTracks = query
    ? (matchingTracks ?? [])
    : (result.tracksByCategory[activeCategory] ?? []);

  // ── 基于锚点计算 fixed 定位（自适应视口，不越界） ──
  const anchorRect = anchorEl?.getBoundingClientRect();
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const width = Math.min(640, viewportW - 24);
  const top = (anchorRect ? anchorRect.bottom : 64) + 8;
  const maxHeight = Math.min(viewportH - top - 16, 560);
  let right = anchorRect ? Math.max(12, viewportW - anchorRect.right) : 20;
  if (viewportW - right - width < 12) right = viewportW - width - 12;

  const panel = (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        position: 'fixed',
        top,
        right,
        width,
        maxHeight,
        zIndex: 100,
        background: style.cardBg,
        border: `1px solid ${style.cardBorder}`,
        backdropFilter: 'blur(20px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
      }}
    >
      {/* 动态样式：悬停底色 + 搜索占位符颜色（随 UI 风格变化） */}
      <style>{`
        .bpp-hover:hover { background: ${style.hoverBg}; }
        .bpp-input::placeholder { color: ${style.textSecondary}; }
      `}</style>

      {/* ── 顶部强调色线 ── */}
      <div
        className="shrink-0 pointer-events-none"
        style={{
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${style.accent} 50%, transparent 100%)`,
        }}
      />

      {/* ── 标题栏 ── */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 shrink-0">
        <ListMusic className="w-4 h-4 shrink-0" style={{ color: style.accent }} />
        <span className="text-sm font-bold tracking-wide" style={{ color: style.textPrimary }}>
          播放列表
        </span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-md font-number shrink-0"
          style={{ background: style.accentSoft, color: style.accent }}
        >
          {totalTracks} 首
        </span>
        <div className="flex-1" />
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className="bpp-hover w-7 h-7 rounded-full flex items-center justify-center transition-colors"
          style={{ color: style.textSecondary }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── 搜索框 ── */}
      <div className="px-4 pb-3 shrink-0">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: style.settingsBg, border: `1px solid ${style.divider}` }}
        >
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: style.textSecondary }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索曲名或分类…"
            className="bpp-input flex-1 bg-transparent outline-none text-xs"
            style={{ color: style.textPrimary, caretColor: style.accent }}
          />
          {search && (
            <button
              type="button"
              aria-label="清空搜索"
              onClick={() => setSearch('')}
              className="shrink-0"
              style={{ color: style.textSecondary }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── 分隔线 ── */}
      <div className="shrink-0" style={{ height: '1px', background: style.divider }} />

      {/* ── 双栏主体 ── */}
      <div className="flex flex-1 min-h-0">
        {/* 左侧：分类列表 */}
        <div
          ref={categoryListRef}
          className="w-[188px] shrink-0 overflow-y-auto py-2"
          style={{
            background: style.settingsBg,
            borderRight: `1px solid ${style.divider}`,
            scrollbarWidth: 'thin',
            scrollbarColor: `${style.divider} transparent`,
          }}
        >
          {categories.length === 0 ? (
            <div className="px-3 py-8 text-center text-[11px]" style={{ color: style.textSecondary }}>
              暂无分类
            </div>
          ) : (
            categories.map((cat) => {
              const active = cat === activeCategory;
              const count = categoryCounts[cat] ?? 0;
              return (
                <button
                  key={cat}
                  type="button"
                  data-cat={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="bpp-hover w-full flex items-center gap-2 pl-3 pr-2 py-2 text-left transition-colors relative"
                  style={{ background: active ? style.accentSoft : undefined }}
                >
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-full"
                    style={{
                      height: '60%',
                      background: active ? style.accent : 'transparent',
                    }}
                  />
                  <span
                    className="flex-1 text-[12px] truncate"
                    title={cat}
                    style={{ color: active ? style.accent : style.textPrimary }}
                  >
                    {cat}
                  </span>
                  {active ? (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-md font-number shrink-0"
                      style={{ background: style.accent, color: '#ffffff' }}
                    >
                      {count}
                    </span>
                  ) : (
                    <span className="text-[10px] font-number shrink-0" style={{ color: style.textSecondary }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* 右侧：曲目列表 */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="px-3 pt-2 pb-1.5 shrink-0 flex items-center justify-between">
            <span className="text-[11px] truncate" style={{ color: style.textSecondary }}>
              {query ? '搜索结果' : activeCategory || '全部'}
            </span>
            <span className="text-[10px] font-number shrink-0" style={{ color: style.textSecondary }}>
              共 {visibleTracks.length} 首
            </span>
          </div>
          <div
            ref={trackListRef}
            className="flex-1 min-h-0 overflow-y-auto px-2 pb-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: `${style.divider} transparent` }}
          >
            {categories.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Music className="w-6 h-6" style={{ color: style.textSecondary }} />
                <span className="text-[11px]" style={{ color: style.textSecondary }}>
                  暂无播放列表
                </span>
              </div>
            ) : visibleTracks.length === 0 ? (
              <div className="py-10 text-center text-[11px]" style={{ color: style.textSecondary }}>
                {query ? '未找到匹配的曲目' : '此分类下暂无曲目'}
              </div>
            ) : (
              visibleTracks.map((track) => {
                const isActive = track.audioUrl === currentAudioUrl;
                return (
                  <button
                    key={track.audioUrl}
                    type="button"
                    data-active={isActive ? 'true' : 'false'}
                    onClick={() => {
                      onSelect(track);
                      onClose();
                    }}
                    className="bpp-hover w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors"
                    style={{ background: isActive ? style.accentSoft : undefined }}
                  >
                    <div
                      className="w-8 h-8 rounded-md shrink-0 overflow-hidden flex items-center justify-center"
                      style={{
                        background: track.coverUrl ? '#111' : getCategoryGradient(track.category),
                        boxShadow: isActive ? `0 0 0 1px ${style.accent}` : 'none',
                      }}
                    >
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs truncate leading-tight"
                        title={track.title}
                        style={{ color: isActive ? style.accent : style.textPrimary }}
                      >
                        {track.title}
                      </div>
                      {query && (
                        <div className="text-[9px] truncate mt-0.5" style={{ color: style.textSecondary }}>
                          {track.category}
                        </div>
                      )}
                    </div>

                    {isActive && (
                      <span className="shrink-0 flex items-end gap-[2px] h-3" aria-label="正在播放">
                        {[0.5, 0.9, 0.6, 0.8].map((h, i) => (
                          <span
                            key={i}
                            className="w-[2px] rounded-full"
                            style={{ height: `${h * 100}%`, background: style.accent }}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return createPortal(panel, document.body);
}
