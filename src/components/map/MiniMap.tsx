import { useGame } from '@/hooks/useGameState';
import { MapMarker } from './MapMarker';
import { SceneImpression } from './SceneImpression';

export function MiniMap() {
  const { state } = useGame();
  const { map } = state;

  const viewRange = 2500 / map.zoom;
  const toPercent = (value: number, center: number, range: number) => {
    return 50 + ((value - center) / range) * 50;
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden card-tier-raised flex flex-col"
    >
      <SceneImpression />

      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(141,110,99,0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(141,110,99,0.25) 1px, transparent 1px)
            `,
            backgroundSize: '20% 20%',
          }}
        />

        {map.regions.map((region) => (
          <div
            key={region.id}
            className="absolute rounded-lg border border-white/30"
            style={{
              left: `${toPercent(region.x, map.center.x, viewRange)}%`,
              top: `${toPercent(region.y, map.center.y, viewRange)}%`,
              width: `${(region.width / viewRange) * 50}%`,
              height: `${(region.height / viewRange) * 50}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: region.color,
            }}
          />
        ))}

        {map.markers.map((marker) => (
          <MapMarker
            key={marker.id}
            marker={marker}
            style={{
              left: `${toPercent(marker.x, map.center.x, viewRange)}%`,
              top: `${toPercent(marker.y, map.center.y, viewRange)}%`,
            }}
          />
        ))}

        <div
          className="absolute w-3 h-3 rounded-full bg-accent-green border-2 border-white shadow-md z-10"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-bg-card-floating/80 backdrop-blur-sm border border-white/40 text-[10px] font-number text-text-secondary"
        >
          X:{Math.round(map.center.x)} Y:{Math.round(map.center.y)}
        </div>
      </div>
    </div>
  );
}
