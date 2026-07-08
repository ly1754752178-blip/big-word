import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { Calendar, Globe, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CalendarEvent } from '@/types';
import { getRelativeDate, getFestivalName, getWeekdayCn } from '@/lib/calendar';

function EventMiniCard({
  label,
  date,
  events,
}: {
  label: string;
  date: string;
  events: CalendarEvent[];
}) {
  const festival = getFestivalName(date);

  return (
    <GlassCard variant="elevated" className="p-4 module-card-calendar flex flex-col"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-calendar-indigo uppercase tracking-wider">{label}</span>
        <span className="text-[10px] text-text-muted">{getWeekdayCn(date)}</span>
      </div>
      <div className="font-number text-2xl font-bold text-text-primary mb-1">
        {date.slice(5)}
      </div>
      {festival && (
        <span className="inline-block px-2 py-0.5 rounded-full bg-calendar-indigo/15 text-calendar-indigo text-xs font-medium mb-2">
          {festival}
        </span>
      )}
      <div className="flex-1 space-y-1.5 mt-1">
        {events.length === 0 && (
          <span className="text-xs text-text-muted">无日程</span>
        )}
        {events.map((event) => (
          <div key={event.id} className="text-xs text-text-secondary truncate">{event.title}</div>
        ))}
      </div>
    </GlassCard>
  );
}

export function CalendarEventsOverlay() {
  const { state, openOverlayView } = useGame();
  const { calendarEvents, worldEvents, nearbyEvents } = state.calendar;
  const allEvents = [...calendarEvents, ...worldEvents, ...nearbyEvents];

  const today = getRelativeDate(0);
  const yesterday = getRelativeDate(-1);
  const tomorrow = getRelativeDate(1);

  const eventsFor = (date: string) => allEvents.filter((e) => e.date === date);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <GlassCard variant="default" className="p-5 module-card-calendar">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2">
            <Calendar className="w-5 h-5 text-calendar-indigo" /> 近期日程
          </h3>
          <motion.button
            type="button"
            onClick={() => openOverlayView('calendarFull')}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 rounded-full bg-calendar-indigo/15 text-calendar-indigo text-sm font-medium border border-calendar-indigo/25 hover:bg-calendar-indigo/25 transition-colors"
          >
            完整日历
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <EventMiniCard label="昨日" date={yesterday} events={eventsFor(yesterday)} />
          <EventMiniCard label="今日" date={today} events={eventsFor(today)} />
          <EventMiniCard label="明天" date={tomorrow} events={eventsFor(tomorrow)} />
        </div>
      </GlassCard>

      <GlassCard variant="default" className="p-5 module-card-calendar">
        <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-calendar-sky" /> 世界事件
        </h3>
        <div className="space-y-2">
          {worldEvents.map((event) => (
            <GlassCard key={event.id} variant="elevated" className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-text-primary">{event.title}</span>
                <span className="text-[10px] text-text-muted">{event.date}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1">{event.description}</p>
            </GlassCard>
          ))}
        </div>
      </GlassCard>

      <GlassCard variant="default" className="p-5 module-card-calendar">
        <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-calendar-indigo" /> 附近动态
        </h3>
        <div className="space-y-2">
          {nearbyEvents.map((event) => (
            <GlassCard key={event.id} variant="elevated" className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-text-primary">{event.title}</span>
                <span className="text-[10px] text-text-muted">{event.date}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1">{event.description}</p>
            </GlassCard>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
