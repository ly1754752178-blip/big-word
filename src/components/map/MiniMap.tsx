import { useGame } from '@/hooks/useGameState';
import { MapMarker } from './MapMarker';
import { SceneImpression } from './SceneImpression';

interface MiniMapProps {
  view?: 'city' | 'national';
}

export function MiniMap({ view = 'city' }: MiniMapProps) {
  const { state } = useGame();
  const { map } = state;

  // 城市地图：近距离，高缩放；全国地图：远距离，低缩放
  const isCity = view === 'city';
  const zoom = isCity ? map.zoom : map.zoom * 0.4;
  const center = isCity ? map.center : { x: 0, y: 0 };

  const viewRange = 2500 / Math.max(0.3, zoom);
  const toPercent = (value: number, c: number, range: number) => {
    return 50 + ((value - c) / range) * 50;
  };

  // 全国地图显示所有标记，城市地图只显示附近的
  const visibleMarkers = isCity
    ? map.markers.filter(m => Math.abs(m.x - map.center.x) < 2000 && Math.abs(m.y - map.center.y) < 2000)
    : map.markers;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-100 shadow-soft bg-cream-50">
      <SceneImpression className="absolute inset-0" />

      <div className="relative flex-1 min-h-0 overflow-hidden w-full h-full">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(100,116,139,0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100,116,139,0.2) 1px, transparent 1px)
            `,
            backgroundSize: `${isCity ? '20%' : '10%'} ${isCity ? '20%' : '10%'}`,
          }}
        />

        {map.regions.map((region) => (
          <div
            key={region.id}
            className="absolute rounded-lg border border-white/40"
            style={{
              left: `${toPercent(region.x, center.x, viewRange)}%`,
              top: `${toPercent(region.y, center.y, viewRange)}%`,
              width: `${(region.width / viewRange) * 50}%`,
              height: `${(region.height / viewRange) * 50}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: region.color,
            }}
          />
        ))}

        {visibleMarkers.map((marker) => (
          <MapMarker
            key={marker.id}
            marker={marker}
            style={{
              left: `${toPercent(marker.x, center.x, viewRange)}%`,
              top: `${toPercent(marker.y, center.y, viewRange)}%`,
            }}
          />
        ))}

        <div
          className="absolute w-3 h-3 rounded-full bg-sky-500 border-2 border-white shadow-md z-10"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-white/80 backdrop-blur-sm border border-white/60 shadow-soft text-[10px] font-number text-slate-500">
          {isCity
            ? `X:${Math.round(map.center.x)} Y:${Math.round(map.center.y)}`
            : '全国概览'}
        </div>
      </div>
    </div>
  );
}
