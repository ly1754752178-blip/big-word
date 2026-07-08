import { MapPin } from 'lucide-react';
import type { MapMarker as MapMarkerType } from '@/types';

interface MapMarkerProps {
  marker: MapMarkerType;
  onClick?: (marker: MapMarkerType) => void;
  className?: string;
  style?: React.CSSProperties;
}

const typeColorMap: Record<MapMarkerType['type'], string> = {
  location: 'text-accent-sunset',
  event: 'text-accent-teal',
  npc: 'text-accent-amber',
};

export function MapMarker({ marker, onClick, className = '', style }: MapMarkerProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(marker)}
      aria-label={`${marker.name}：${marker.description}`}
      className={`absolute flex flex-col items-center group ${className}`}
      style={{ ...style, transform: 'translate(-50%, -100%)' }}
    >
      <MapPin className={`w-5 h-5 ${typeColorMap[marker.type]} drop-shadow-sm group-hover:scale-110 transition-transform`} />
      <span className="mt-0.5 px-1.5 py-0.5 rounded bg-white/80 text-[10px] text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
        {marker.name}
      </span>
    </button>
  );
}
