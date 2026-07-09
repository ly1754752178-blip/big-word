import { useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { MiniMap } from '@/components/map/MiniMap';
import { FullMapModal } from '@/components/map/FullMapModal';
import { MapTargetDetail } from '@/components/map/MapTargetDetail';
import { SceneImpression } from '@/components/map/SceneImpression';
import { NotificationItem } from '@/components/ui/NotificationItem';
import { Bell, Map, MapPin, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

function EventListItem({
  title,
  date,
  description,
  type,
}: {
  title: string;
  date: string;
  description: string;
  type: 'world' | 'nearby';
}) {
  return (
    <GlassCard
      variant={type === 'world' ? 'sky' : 'coral'}
      className="p-2.5"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-slate-700 truncate">{title}</span>
        <span className="text-[10px] text-slate-400 shrink-0 font-number">{date}</span>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{description}</p>
    </GlassCard>
  );
}

export function RightPanel() {
  const { state } = useGame();
  const { notifications, selectedMarkerId, calendar } = state;
  const [mapOpen, setMapOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="h-full flex flex-col">
      {/* 场景印象图 */}
      <div className="flex-[2] min-h-0 relative">
        <SceneImpression />
      </div>

      {/* GPS 大地图 */}
      <div className="flex-[2] min-h-0 border-t border-slate-100 p-2 flex flex-col bg-cream-50/30">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <Map className="w-3.5 h-3.5" /> GPS
          </span>
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="flex items-center gap-0.5 text-[10px] text-sky-500 hover:text-sky-600 transition-colors"
          >
            展开 <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-slate-100 shadow-soft">
          <MiniMap />
        </div>
      </div>

      {/* 周边动态 + 通知合并 */}
      <div className="flex-[3] min-h-0 border-t border-slate-100 p-2 flex flex-col bg-cream-50/30">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-3.5 h-3.5 text-coral-400" />
          <span className="text-xs font-bold text-slate-500">周边动态</span>
          <Bell className="w-3.5 h-3.5 text-slate-400 ml-auto" />
          {unreadCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-coral-400 text-white text-[9px] flex items-center justify-center font-number">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5">
          {calendar.nearbyEvents.slice(0, 3).map((event) => (
            <EventListItem
              key={event.id}
              title={event.title}
              date={event.date}
              description={event.description}
              type="nearby"
            />
          ))}
          {notifications.slice(0, 3).map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {mapOpen && <FullMapModal onClose={() => setMapOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMarkerId && <MapTargetDetail />}
      </AnimatePresence>
    </div>
  );
}
