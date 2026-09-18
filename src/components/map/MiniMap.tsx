import { useGame } from '@/hooks/useGameState';
import { RealMap } from './RealMap';

interface MiniMapProps {
  view?: 'city' | 'national';
}

export function MiniMap({ view = 'city' }: MiniMapProps) {
  const { state, setDestination } = useGame();
  const { playerPosition, destination, route } = state;

  return (
    <RealMap
      view={view}
      playerPosition={playerPosition}
      destination={destination}
      route={route}
      onMapClick={(pos, name) =>
        setDestination({
          ...pos,
          name: name ?? `自定义地点 (${pos.lat.toFixed(3)}, ${pos.lon.toFixed(3)})`,
        })
      }
      showControls={false}
    />
  );
}
