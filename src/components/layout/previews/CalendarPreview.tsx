import { useGame } from '@/hooks/useGameState';
import { Calendar, Globe, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { getRelativeDate, getFestivalName, getWeekdayCn } from '@/lib/calendar';
import type { CalendarEvent } from '@/types';

function EventMiniCard({ label, date, events, highlighted = false }: { label: string; date: string; events: CalendarEvent[]; highlighted?: boolean }) {
  const festival = getFestivalName(date);

  return (
    <GlassCard
      variant={highlighted ? 'sky' : 'default'}
      className="p-2 flex flex-col min-h-[96px]"
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[10px] font-bold ${highlighted ? 'text-sky-600' : 'text-slate-500'}`}>{label}</span>
        <span className="text-[9px] text-slate-400">{getWeekdayCn(date)}</span>
      </div>
      <div className="font-number text-lg font-bold text-slate-800 mb-0.5">{date.slice(5)}</div>
      {festival && (
        <span className="inline-block px-1.5 py-0.5 rounded bg-sky-100 text-sky-600 text-[9px] font-medium mb-1">{festival}</span>
      )}
      <div className="flex-1 space-y-0.5 mt-0.5">
        {events.length === 0 && <span className="text-[9px] text-slate-400">无日程</span>}
        {events.map((event) => (
          <div key={event.id} className="text-[10px] text-slate-600 truncate">{event.title}</div>
        ))}
      </div>
    </GlassCard>
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
    <div className="space-y-3">
      {/* 日程安排 —— 居中标题横栏 */}
      <div className="-mx-2.5 -mt-3 px-3 py-3 bg-gradient-to-r from-sky-50 via-sky-100/40 to-sky-50 border-b border-sky-100/60 text-center">
        <span className="text-base font-bold text-slate-800 tracking-wide">日程安排</span>
        <div className="mt-1 mx-auto w-8 h-0.5 rounded-full" style={{ backgroundColor: '#0EA5E9' }} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <EventMiniCard label="昨日" date={yesterday} events={eventsFor(yesterday)} />
        <EventMiniCard label="今日" date={today} events={eventsFor(today)} highlighted />
        <EventMiniCard label="明天" date={tomorrow} events={eventsFor(tomorrow)} />
      </div>

      <GlassCard variant="sky" className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-bold text-slate-600">世界事件</span>
        </div>
        <div className="space-y-1.5">
          {worldEvents.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-center justify-between text-xs">
              <span className="text-slate-700 truncate max-w-[140px]">{event.title}</span>
              <span className="text-[10px] text-slate-400 font-number">{event.date}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <button
        type="button"
        id="preview-calendar-full"
        onClick={() => openOverlayView('calendarFull')}
        className="w-full py-2.5 rounded-xl bg-sky-100 border border-sky-200 text-sky-600 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-sky-200 transition-colors"
      >
        <Calendar className="w-4 h-4" /> 日历总览 <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
