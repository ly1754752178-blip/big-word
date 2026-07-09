import { MapPin } from 'lucide-react';
import type { MapMarker as MapMarkerType } from '@/types';

interface MapMarkerProps {
  marker: MapMarkerType;
  onClick?: (marker: MapMarkerType) => void;
  className?: string;
  style?: React.CSSProperties;
}

const typeColorMap: Record<MapMarkerType['type'], string> = {
  location: 'text-coral-400',
  event: 'text-sky-500',
  npc: 'text-mint-500',
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
      <MapPin className={`w-5 h-5 ${typeColorMap[marker.type]} drop-shadow-soft group-hover:scale-110 transition-transform`} />
      <span className="mt-0.5 px-1.5 py-0.5 rounded bg-white/90 text-[10px] text-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-soft">
        {marker.name}
      </span>
    </button>
  );
}
