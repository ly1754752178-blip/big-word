export interface CalendarDay {
  date: string;
  year: number;
  month: number;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  weekday: number;
}

function toISODate(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/** 生成某月完整的日历网格（包含前后月份的补齐日期） */
export function getMonthGrid(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay(); // 0=周日

  const today = new Date();
  const todayStr = toISODate(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const days: CalendarDay[] = [];

  // 上月补齐
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    days.push({
      date: toISODate(prevYear, prevMonth, day),
      year: prevYear,
      month: prevMonth,
      day,
      isCurrentMonth: false,
      isToday: false,
      weekday: 0,
    });
  }

  // 当月
  for (let day = 1; day <= daysInMonth; day++) {
    const date = toISODate(year, month, day);
    days.push({
      date,
      year,
      month,
      day,
      isCurrentMonth: true,
      isToday: date === todayStr,
      weekday: new Date(year, month - 1, day).getDay(),
    });
  }

  // 下月补齐，补满 42 格（6 行）
  const remaining = 42 - days.length;
  for (let day = 1; day <= remaining; day++) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    days.push({
      date: toISODate(nextYear, nextMonth, day),
      year: nextYear,
      month: nextMonth,
      day,
      isCurrentMonth: false,
      isToday: false,
      weekday: 0,
    });
  }

  return days;
}

/** 简单内置节日表 */
const builtInFestivals: Record<string, string> = {
  '2026-01-01': '元旦',
  '2026-02-14': '情人节',
  '2026-03-03': '女儿节',
  '2026-03-14': '白色情人节',
  '2026-04-29': '昭和之日',
  '2026-05-03': '宪法纪念日',
  '2026-05-05': '儿童节',
  '2026-07-07': '七夕',
  '2026-08-15': '盂兰盆节',
  '2026-09-21': '敬老日',
  '2026-10-31': '万圣节',
  '2026-12-24': '平安夜',
  '2026-12-25': '圣诞节',
};

export function getFestivalName(date: string): string | undefined {
  return builtInFestivals[date];
}

export function getWeekdayCn(dateStr: string): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[new Date(dateStr).getDay()];
}

/** 获取相对今天的昨日/今日/明天日期字符串 */
export function getRelativeDate(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toISODate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
