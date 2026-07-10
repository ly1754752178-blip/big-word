import { useRef, useState, useCallback, useEffect } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { MapMarker } from './MapMarker';
import { X, Navigation, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface FullMapModalProps {
  onClose: () => void;
  view?: 'city' | 'national';
}

export function FullMapModal({ onClose, view = 'city' }: FullMapModalProps) {
  const { state, setMapCenter, setMapZoom, setSelectedMarker } = useGame();
  const { map } = state;
  const isCity = view === 'city';

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, centerX: 0, centerY: 0 });

  const viewRange = 4000 / map.zoom;

  const worldDeltaFromPixel = (pixelDelta: number, range: number, containerSize: number) => {
    return (pixelDelta / containerSize) * range * 2;
  };

  const toPercent = (value: number, center: number, range: number) => {
    return 50 + ((value - center) / range) * 50;
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        centerX: map.center.x,
        centerY: map.center.y,
      };
    },
    [map.center]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = worldDeltaFromPixel(e.clientX - dragStartRef.current.x, viewRange, rect.width);
      const dy = worldDeltaFromPixel(e.clientY - dragStartRef.current.y, viewRange, rect.height);
      setMapCenter({
        x: dragStartRef.current.centerX - dx,
        y: dragStartRef.current.centerY - dy,
      });
    },
    [isDragging, viewRange, setMapCenter]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldMouseX = map.center.x + ((mouseX / rect.width) * 2 - 1) * viewRange;
      const worldMouseY = map.center.y + ((mouseY / rect.height) * 2 - 1) * viewRange;

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(5, Math.max(0.5, map.zoom * zoomFactor));
      const newRange = 4000 / newZoom;

      const newCenterX = worldMouseX - ((mouseX / rect.width) * 2 - 1) * newRange;
      const newCenterY = worldMouseY - ((mouseY / rect.height) * 2 - 1) * newRange;

      setMapZoom(newZoom);
      setMapCenter({ x: newCenterX, y: newCenterY });
    },
    [map.center, map.zoom, viewRange, setMapCenter, setMapZoom]
  );

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleMarkerClick = (markerId: string) => {
    setSelectedMarker(markerId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
    >
      <GlassCard variant="floating" className="w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-sky-500" />
            <h2 className="font-heading text-lg font-bold text-slate-800">{isCity ? '城市地图' : '全国地图'}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭地图"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 地图区域 */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className={`relative flex-1 overflow-hidden bg-sky-50 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100/50 via-cream-50/30 to-mint-50/40" />

          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `
                linear-gradient(rgba(148,163,184,0.25) 1px, transparent 1px),
                linear-gradient(90deg, rgba(148,163,184,0.25) 1px, transparent 1px)
              `,
              backgroundSize: '10% 10%',
            }}
          />

          {map.regions.map((region) => (
            <div
              key={region.id}
              className="absolute rounded-xl border border-white/60 flex items-center justify-center"
              style={{
                left: `${toPercent(region.x, map.center.x, viewRange)}%`,
                top: `${toPercent(region.y, map.center.y, viewRange)}%`,
                width: `${(region.width / viewRange) * 50}%`,
                height: `${(region.height / viewRange) * 50}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: region.color,
              }}
            >
              <span className="text-xs font-medium text-slate-700/80">{region.name}</span>
            </div>
          ))}

          {map.markers.map((marker) => (
            <MapMarker
              key={marker.id}
              marker={marker}
              onClick={() => handleMarkerClick(marker.id)}
              style={{
                left: `${toPercent(marker.x, map.center.x, viewRange)}%`,
                top: `${toPercent(marker.y, map.center.y, viewRange)}%`,
              }}
            />
          ))}

          <div
            className="absolute w-4 h-4 rounded-full bg-mint-500 border-2 border-white shadow-lg z-10"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* 控制栏 */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">按住左键拖动 · 滚轮缩放 · 点击标记查看详情</span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMapZoom(Math.max(0.5, map.zoom - 0.2))}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              aria-label="缩小"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-number text-slate-500 w-12 text-center">{map.zoom.toFixed(1)}x</span>
            <button
              type="button"
              onClick={() => setMapZoom(Math.min(5, map.zoom + 0.2))}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              aria-label="放大"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
