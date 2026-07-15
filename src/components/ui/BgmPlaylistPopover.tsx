import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import type { BgmScanResult, BgmTrack } from '@/lib/bgm-loader';

interface BgmPlaylistPopoverProps {
  result: BgmScanResult;
  currentAudioUrl: string | null;
  onSelect: (track: BgmTrack) => void;
  onClose: () => void;
  /** 锚点元素，用于计算 fixed 定位（脱离层叠上下文限制） */
  anchorEl: HTMLElement | null;
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
  anchorEl,
}: BgmPlaylistPopoverProps) {
  const [activeCategory, setActiveCategory] = useState<string>(
    result.categories[0] ?? ''
  );
  const panelRef = useRef<HTMLDivElement>(null);

  // result 异步加载后，同步 activeCategory
  useEffect(() => {
    setActiveCategory((prev) => {
      if (result.categories.length > 0 && !result.categories.includes(prev)) {
        return result.categories[0];
      }
      return prev;
    });
  }, [result.categories]);

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

  // 基于锚点计算 fixed 定位
  const anchorRect = anchorEl?.getBoundingClientRect();
  const panelStyle: React.CSSProperties = anchorRect
    ? {
        position: 'fixed',
        top: anchorRect.bottom + 8,
        right: window.innerWidth - anchorRect.right,
      }
    : { position: 'fixed', top: 72, right: 20 };

  const panel = (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-56 rounded-xl overflow-hidden"
      style={{
        ...panelStyle,
        zIndex: 100,
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
                    ? 'rgba(201,168,76,0.22)'
                    : 'rgba(255,255,255,0.06)',
                  color: cat === activeCategory
                    ? '#D4B85A'
                    : 'rgba(255,255,255,0.55)',
                  border: cat === activeCategory
                    ? '1px solid rgba(201,168,76,0.35)'
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
                    background: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
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
                    style={{ color: isActive ? '#D4B85A' : 'rgba(240,234,216,0.85)' }}
                  >
                    {track.title}
                  </span>

                  {/* 播放中指示 */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#D4B85A', boxShadow: '0 0 6px rgba(212,184,90,0.55)' }} />
                  )}
                </button>
              );
            })
          )}
        </div>
      </motion.div>
  );
  return createPortal(panel, document.body);
}
