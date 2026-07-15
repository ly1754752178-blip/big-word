import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { X, MapPin, Footprints, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function MapTargetDetail() {
  const { state, setSelectedMarker } = useGame();
  const { map, selectedMarkerId } = state;

  const marker = map.markers.find((m) => m.id === selectedMarkerId);
  if (!marker) return null;

  const distance = Math.round(
    Math.sqrt(
      Math.pow(marker.x - map.center.x, 2) + Math.pow(marker.y - map.center.y, 2)
    )
  );

  // 简单估算：每 100 单位约 1 分钟路程
  const minutes = Math.max(1, Math.round(distance / 100));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
      onClick={() => setSelectedMarker(null)}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <GlassCard variant="floating" className="w-full max-w-sm overflow-hidden">
          {/* 头部 */}
          <div className="relative h-28 bg-gradient-to-br from-sky-200/60 to-coral-200/50">
            <button
              type="button"
              onClick={() => setSelectedMarker(null)}
              aria-label="关闭"
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="absolute -bottom-8 left-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-200 to-coral-200 border-2 border-white/70 flex items-center justify-center shadow-md">
              <MapPin className="w-7 h-7 text-slate-700" />
            </div>
          </div>

          {/* 内容 */}
          <div className="pt-10 px-5 pb-5">
            <h3 className="font-heading text-lg font-bold text-slate-800">{marker.name}</h3>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-600 text-[10px]">
              {marker.type === 'location' ? '地点' : marker.type === 'event' ? '事件' : '人物'}
            </span>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="rounded-xl bg-white border border-slate-100 p-2.5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
                  <Footprints className="w-3 h-3" />
                  <span>当前距离</span>
                </div>
                <span className="font-number text-sm font-bold text-slate-700">{distance} m</span>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 p-2.5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
                  <Clock className="w-3 h-3" />
                  <span>预计路程</span>
                </div>
                <span className="font-number text-sm font-bold text-slate-700">约 {minutes} 分钟</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-semibold text-slate-500 mb-1.5">地点情报</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{marker.description}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
