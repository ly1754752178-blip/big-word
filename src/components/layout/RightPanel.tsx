import { useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { MiniMap } from '@/components/map/MiniMap';
import { FullMapModal } from '@/components/map/FullMapModal';
import { MapTargetDetail } from '@/components/map/MapTargetDetail';
import { SceneImpression } from '@/components/map/SceneImpression';
import { NotificationItem } from '@/components/ui/NotificationItem';
import { Phone } from '@/components/layout/Phone';
import { Bell, Map, MapPin, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

type NotifyTab = 'nearby' | 'notifications';
type MapTab = 'city' | 'national';

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
    <GlassCard variant={type === 'world' ? 'sky' : 'coral'} className="p-2">
      <div className="flex items-center justify-between mb-0.5">
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
  const [mapTab, setMapTab] = useState<MapTab>('city');
  const [activeNotifyTab, setActiveNotifyTab] = useState<NotifyTab>('nearby');

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="h-full flex flex-col relative">
      {/* 场景印象图 */}
      <div className="relative aspect-video w-full shrink-0">
        <SceneImpression imageUrl="/images/scene-anime.png" />
      </div>

      {/* GPS 地图 —— 城市 / 全国双Tab */}
      <div className="flex-[2] min-h-0 border-t border-[#E8DFD3] flex flex-col">
        <div className="flex px-2 pt-2 pb-1 gap-1">
          {(['city', 'national'] as MapTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMapTab(tab)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mapTab === tab
                  ? 'bg-sky-100 text-sky-600 border border-sky-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
              }`}
            >
              <Map className="w-3 h-3" />
              {tab === 'city' ? '城市地图' : '全国地图'}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="shrink-0 flex items-center gap-0.5 px-1.5 py-1.5 text-[10px] text-sky-500 hover:text-sky-600 transition-colors"
          >
            展开<ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex-1 min-h-0 mx-2 mb-2 rounded-2xl overflow-hidden border border-slate-100 shadow-soft">
          <MiniMap key={mapTab} view={mapTab} />
        </div>
      </div>

      {/* 周边动态 / 当前通知 双Tab */}
      <div className="flex-[3] min-h-0 border-t border-[#E8DFD3] flex flex-col">
        {/* Tab 切换 */}
        <div className="flex px-2 pt-2 pb-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveNotifyTab('nearby')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeNotifyTab === 'nearby'
                ? 'bg-coral-100 text-coral-600 border border-coral-200'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
            }`}
          >
            <MapPin className="w-3 h-3" />
            周边动态
          </button>
          <button
            type="button"
            onClick={() => setActiveNotifyTab('notifications')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeNotifyTab === 'notifications'
                ? 'bg-sky-100 text-sky-600 border border-sky-200'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
            }`}
          >
            <Bell className="w-3 h-3" />
            当前通知
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-coral-400 text-white text-[9px] flex items-center justify-center font-number">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* 列表内容 —— 底部留空间避免被手机遮挡 */}
        <div className="flex-1 overflow-y-auto px-2 pb-16 space-y-1">
          <AnimatePresence mode="wait">
            {activeNotifyTab === 'nearby' ? (
              <div key="nearby" className="space-y-1">
                {calendar.nearbyEvents.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">暂无周边动态</p>
                )}
                {calendar.nearbyEvents.slice(0, 3).map((event) => (
                  <EventListItem
                    key={event.id}
                    title={event.title}
                    date={event.date}
                    description={event.description}
                    type="nearby"
                  />
                ))}
              </div>
            ) : (
              <div key="notifications" className="space-y-1">
                {notifications.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">暂无通知</p>
                )}
                {notifications.slice(0, 3).map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {mapOpen && <FullMapModal onClose={() => setMapOpen(false)} view={mapTab} />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMarkerId && <MapTargetDetail />}
      </AnimatePresence>

      <Phone />
    </div>
  );
}
