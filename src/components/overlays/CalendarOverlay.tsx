import { useState, useMemo } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DateMark } from '@/types';
import { getMonthGrid, getFestivalName, getWeekdayCn } from '@/lib/calendar';

const markOptions: { value: DateMark['mark']; label: string; color: string }[] = [
  { value: 'important', label: '重要', color: 'bg-status-coral' },
  { value: 'anniversary', label: '纪念日', color: 'bg-talent-gold' },
  { value: 'sad', label: '悲伤', color: 'bg-text-muted' },
  { value: 'custom', label: '自定义', color: 'bg-calendar-indigo' },
];

export function CalendarOverlay() {
  const { state, setDateMark, clearDateMark } = useGame();
  const { date, calendar, dateMarks } = state;
  const { calendarEvents, worldEvents, nearbyEvents } = calendar;

  const [viewYear, setViewYear] = useState(date.year);
  const [viewMonth, setViewMonth] = useState(date.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [selectedMark, setSelectedMark] = useState<DateMark['mark']>('important');

  const allEvents = useMemo(
    () => [...calendarEvents, ...worldEvents, ...nearbyEvents],
    [calendarEvents, worldEvents, nearbyEvents]
  );

  const days = useMemo(
    () => getMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const mark = dateMarks[dateStr];
    setNote(mark?.note ?? '');
    setSelectedMark(mark?.mark ?? 'important');
  };

  const handleSaveMark = () => {
    if (!selectedDate) return;
    if (!note.trim()) {
      clearDateMark(selectedDate);
    } else {
      setDateMark(selectedDate, { date: selectedDate, note: note.trim(), mark: selectedMark });
    }
    setSelectedDate(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <GlassCard variant="raised" className="p-5 module-card-calendar">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-xl font-bold text-text-primary flex items-center gap-2">
            <Calendar className="w-6 h-6 text-calendar-indigo" />
            {viewYear} 年 {String(viewMonth).padStart(2, '0')} 月
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-9 h-9 rounded-full bg-bg-glass hover:bg-white/60 flex items-center justify-center text-text-secondary transition-colors"
              aria-label="上个月"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-9 h-9 rounded-full bg-bg-glass hover:bg-white/60 flex items-center justify-center text-text-secondary transition-colors"
              aria-label="下个月"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 星期表头 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
            <div key={d} className="text-center text-xs font-bold text-text-muted py-2">
              {d}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const festival = getFestivalName(day.date);
            const mark = dateMarks[day.date];
            const dayEvents = allEvents.filter((e) => e.date === day.date);
            const isSelected = selectedDate === day.date;

            return (
              <motion.button
                key={day.date}
                type="button"
                onClick={() => handleSelectDate(day.date)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative min-h-[100px] p-2 rounded-xl text-left transition-colors border ${
                  day.isCurrentMonth
                    ? 'bg-white/60 border-border-soft hover:bg-white/90'
                    : 'bg-bg-glass/40 border-transparent text-text-muted'
                } ${day.isToday ? 'ring-2 ring-calendar-indigo/40' : ''} ${
                  isSelected ? 'bg-calendar-pale border-calendar-indigo' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-number text-sm font-bold ${day.isToday ? 'text-calendar-indigo' : 'text-text-primary'}`}>
                    {day.day}
                  </span>
                  {mark && (
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        markOptions.find((m) => m.value === mark.mark)?.color ?? 'bg-calendar-indigo'
                      }`}
                    />
                  )}
                </div>

                {festival && (
                  <div className="mt-1 text-[10px] text-calendar-indigo font-medium truncate">{festival}</div>
                )}

                {mark?.note && (
                  <div className="mt-1 text-[10px] text-text-secondary truncate">{mark.note}</div>
                )}

                {dayEvents.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <span
                        key={event.id}
                        className="text-[9px] px-1.5 py-0.5 rounded-full bg-calendar-indigo/10 text-calendar-indigo truncate max-w-full"
                      >
                        {event.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-text-muted">+{dayEvents.length - 2}</span>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </GlassCard>

      {/* 选中日期编辑浮层 */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-0 bottom-0 z-[60] p-4 md:p-6"
          >
            <GlassCard variant="floating" className="max-w-2xl mx-auto p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-heading text-lg font-bold text-text-primary">
                  {selectedDate} {getWeekdayCn(selectedDate)} 标记
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="w-8 h-8 rounded-full bg-bg-glass hover:bg-white/60 flex items-center justify-center text-text-secondary"
                  aria-label="取消"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {markOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedMark(option.value)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selectedMark === option.value
                          ? 'bg-calendar-indigo/15 border-calendar-indigo text-calendar-indigo'
                          : 'bg-bg-glass border-border-soft text-text-secondary hover:bg-white/60'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${option.color}`} />
                      {option.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="输入备注……"
                  rows={3}
                  className="w-full rounded-xl bg-bg-glass border border-border-soft p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-calendar-indigo/30 resize-none"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedDate) clearDateMark(selectedDate);
                      setSelectedDate(null);
                    }}
                    className="px-4 py-2 rounded-full text-sm text-text-secondary hover:bg-bg-glass transition-colors"
                  >
                    清除
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMark}
                    className="px-5 py-2 rounded-full bg-calendar-indigo text-white text-sm font-medium hover:bg-calendar-indigo/90 transition-colors"
                  >
                    保存
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
