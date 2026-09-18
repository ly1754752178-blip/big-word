import { useEffect, useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { RealMap } from './RealMap';
import { getRoute, TRAVEL_MODE_LABEL } from '@/lib/routing';
import { getTransitRoute } from '@/lib/transit';
import { buildTravelContext, travelContextToPrompt } from '@/lib/travel';
import type { TravelMode, NarrativeMessage } from '@/types';
import { X, Navigation, MapPin, Trash2, Footprints, Car, Bike, TrainFront, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface FullMapModalProps {
  onClose: () => void;
  view?: 'city' | 'national';
}

const MODES: { mode: TravelMode; icon: typeof Footprints }[] = [
  { mode: 'walking', icon: Footprints },
  { mode: 'driving', icon: Car },
  { mode: 'cycling', icon: Bike },
  { mode: 'transit', icon: TrainFront },
];

export function FullMapModal({ onClose, view = 'city' }: FullMapModalProps) {
  const { state, setDestination, clearDestination, setRoute, clearRoute, setPlayerPosition, appendNarrativeMessage, sendNarrativeMessage } = useGame();
  const { playerPosition, destination, route } = state;
  const isCity = view === 'city';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePick = (pos: { lat: number; lon: number }, name?: string) => {
    setDestination({
      ...pos,
      name: name ?? `自定义地点 (${pos.lat.toFixed(3)}, ${pos.lon.toFixed(3)})`,
    });
    clearRoute();
    setError(null);
  };

  const handleRoute = async (mode: TravelMode) => {
    if (!destination) return;
    setLoading(true);
    setError(null);
    try {
      const result =
        mode === 'transit'
          ? await getTransitRoute(playerPosition, destination)
          : await getRoute(mode, playerPosition, destination);
      setRoute(result);
    } catch (e) {
      clearRoute();
      setError(e instanceof Error ? e.message : '路线计算失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTravel = () => {
    if (!destination || !route) return;
    const ctx = buildTravelContext(playerPosition, destination, route);
    const sysMsg: NarrativeMessage = {
      id: `msg-${Date.now()}`,
      type: 'system',
      content: `【移动】${travelContextToPrompt(ctx)}\n\n<travel>${JSON.stringify(ctx)}</travel>`,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    appendNarrativeMessage(sysMsg);
    setPlayerPosition({ lat: destination.lat, lon: destination.lon });
    clearDestination();
    void sendNarrativeMessage(`我出发了：${travelContextToPrompt(ctx)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
    >
      <GlassCard variant="floating" className="w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-sky-500" />
            <h2 className="font-heading text-lg font-bold text-slate-800">
              {isCity ? '城市地图' : '全国地图'}
            </h2>
            {destination && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-coral-100 text-coral-600 text-[10px] max-w-[220px]">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{destination.name}</span>
              </span>
            )}
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
        <div className="relative flex-1 min-h-0">
          <RealMap
            view={view}
            playerPosition={playerPosition}
            destination={destination}
            route={route}
            onMapClick={handlePick}
          />

          {destination && (
            <button
              type="button"
              onClick={clearDestination}
              className="absolute left-3 bottom-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm border border-slate-200 shadow-soft text-xs font-bold text-slate-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-coral-500" />
              清除目的地
            </button>
          )}
        </div>

        {/* 底部操作区 */}
        <div className="border-t border-slate-100">
          {destination ? (
            <div className="px-5 py-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 shrink-0">出行方式</span>
                {MODES.map(({ mode, icon: Icon }) => (
                  <button
                    key={mode}
                    type="button"
                    disabled={loading}
                    onClick={() => handleRoute(mode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      route?.mode === mode
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {TRAVEL_MODE_LABEL[mode]}
                  </button>
                ))}
              </div>

              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  正在计算路线…
                </div>
              )}
              {error && <div className="text-xs text-coral-500">{error}</div>}
              {route && !loading && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-xs text-slate-600 leading-relaxed">
                    <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-sky-100 text-sky-600 font-bold">
                      {TRAVEL_MODE_LABEL[route.mode]}
                    </span>
                    {route.summary}
                  </div>
                  <button
                    type="button"
                    onClick={handleTravel}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-mint-500 hover:opacity-90 text-white text-xs font-bold transition-opacity"
                  >
                    确认出发
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="px-5 py-3 text-xs text-slate-500">
              点击地图选择目的地 · 滚轮缩放 · 拖动平移
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
