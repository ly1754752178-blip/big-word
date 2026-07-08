import { useGame } from '@/hooks/useGameState';
import { Calendar, Globe, ChevronRight } from 'lucide-react';
import { getRelativeDate, getFestivalName, getWeekdayCn } from '@/lib/calendar';
import type { CalendarEvent } from '@/types';

function EventMiniCard({ label, date, events }: { label: string; date: string; events: CalendarEvent[] }) {
  const festival = getFestivalName(date);

  return (
    <div className="p-2 rounded-xl bg-white/60 border border-border-soft flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-calendar-indigo">{label}</span>
        <span className="text-[9px] text-text-muted">{getWeekdayCn(date)}</span>
      </div>
      <div className="font-number text-lg font-bold text-text-primary mb-0.5">{date.slice(5)}</div>
      {festival && (
        <span className="inline-block px-1.5 py-0.5 rounded bg-calendar-indigo/15 text-calendar-indigo text-[9px] font-medium mb-1">{festival}</span>
      )}
      <div className="flex-1 space-y-0.5 mt-0.5">
        {events.length === 0 && <span className="text-[9px] text-text-muted">无日程</span>}
        {events.map((event) => (
          <div key={event.id} className="text-[10px] text-text-secondary truncate">{event.title}</div>
        ))}
      </div>
    </div>
  );
}

export function CalendarPreview() {
  const { state, openOverlayView } = useGame();
  const { calendarEvents, worldEvents, nearbyEvents } = state.calendar;
  const allEvents = [...calendarEvents, ...worldEvents, ...nearbyEvents];

  const today = getRelativeDate(0);
  const yesterday = getRelativeDate(-1);
  const tomorrow = getRelativeDate(1);

  const eventsFor = (date: string) => allEvents.filter((e) => e.date === date);

  return (
    <div className="p-3 space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <EventMiniCard label="昨日" date={yesterday} events={eventsFor(yesterday)} />
        <EventMiniCard label="今日" date={today} events={eventsFor(today)} />
        <EventMiniCard label="明天" date={tomorrow} events={eventsFor(tomorrow)} />
      </div>

      <div className="p-3 rounded-xl bg-white/60 border border-border-soft">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-calendar-sky" />
          <span className="text-xs font-bold text-text-secondary">世界事件</span>
        </div>
        <div className="space-y-1.5">
          {worldEvents.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-center justify-between text-xs">
              <span className="text-text-primary truncate max-w-[140px]">{event.title}</span>
              <span className="text-[10px] text-text-muted">{event.date}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        id="preview-calendar-full"
        onClick={() => openOverlayView('calendarFull')}
        className="w-full py-2 rounded-xl bg-calendar-indigo/10 border border-calendar-indigo/20 text-calendar-indigo text-xs font-bold flex items-center justify-center gap-1 hover:bg-calendar-indigo/20 transition-colors"
      >
        <Calendar className="w-4 h-4" /> 日历总览 <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
