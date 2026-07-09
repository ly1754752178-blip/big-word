import { useGame } from '@/hooks/useGameState';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SceneImpressionProps {
  className?: string;
  imageUrl?: string;
}

export function SceneImpression({ className, imageUrl }: SceneImpressionProps) {
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
    <div
      className={cn(
        'relative w-full h-full overflow-hidden map-texture',
        className
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="场景印象图"
          className="w-full h-full object-cover"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100/60 via-cream-50/40 to-coral-100/40" />

          {/* 装饰性风景剪影 */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2">
            <svg viewBox="0 0 200 60" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M0 60 L0 30 Q30 15 60 28 T120 22 T180 32 L200 25 L200 60 Z"
                fill="rgba(100, 116, 139, 0.1)"
              />
              <path
                d="M0 60 L0 42 Q40 36 80 44 T160 40 L200 48 L200 60 Z"
                fill="rgba(100, 116, 139, 0.16)"
              />
            </svg>
          </div>
        </>
      )}

      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-white/60 shadow-soft text-[10px] text-slate-600">
        <MapPin className="w-3 h-3 text-coral-400" />
        <span>{currentRegion?.name ?? '未知区域'}</span>
      </div>
    </div>
  );
}
