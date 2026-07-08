import { useGame } from '@/hooks/useGameState';
import { MapPin } from 'lucide-react';

export function SceneImpression() {
  const { state } = useGame();
  const { map } = state;

  const currentRegion = map.regions.find((region) => {
    const halfW = region.width / 2;
    const halfH = region.height / 2;
    return (
      map.center.x >= region.x - halfW &&
      map.center.x <= region.x + halfW &&
      map.center.y >= region.y - halfH &&
      map.center.y <= region.y + halfH
    );
  });

  return (
    <div className="relative h-full rounded-none overflow-hidden border-b border-border-soft map-texture">
      <div className="absolute inset-0 bg-gradient-to-br from-map-sunset/15 via-map-earth/10 to-accent-teal/10" />

      {/* 装饰性风景剪影 */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2">
        <svg viewBox="0 0 200 60" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M0 60 L0 30 Q30 15 60 28 T120 22 T180 32 L200 25 L200 60 Z"
            fill="rgba(61,50,41,0.12)"
          />
          <path
            d="M0 60 L0 42 Q40 36 80 44 T160 40 L200 48 L200 60 Z"
            fill="rgba(61,50,41,0.2)"
          />
        </svg>
      </div>

      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-card-floating/80 border border-white/50 text-[10px] text-text-secondary">
        <MapPin className="w-3 h-3 text-map-sunset" />
        <span>{currentRegion?.name ?? '未知区域'}</span>
      </div>
    </div>
  );
}
