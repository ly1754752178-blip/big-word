import { useGame } from '@/hooks/useGameState';
import { SkyOrb } from '@/components/ui/SkyOrb';
import { BgmPlayer } from '@/components/ui/BgmPlayer';
import { Calendar, Star } from 'lucide-react';
import type { Festival } from '@/types';

export function TopBar() {
  const { state, openOverlayView } = useGame();
  const { date, time, festival } = state;

  return (
    <header
      id="top-bar"
      className="relative h-16 px-5 flex items-center justify-between bg-gradient-to-r from-sky-50 via-cream-50 to-sky-50 border-b border-sky-100 z-20"
    >
      {/* 左侧日期与节日 */}
      <div className="flex items-center gap-4 w-1/3">
        <button
          type="button"
          id="topbar-date-festival"
          onClick={() => openOverlayView('calendarFull')}
          className="flex items-center gap-4 text-left group"
        >
          <div className="w-11 h-11 rounded-xl bg-cream-100 border border-cream-200 flex items-center justify-center overflow-hidden"
          >
            {festival ? (
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-500" />
              </div>
            ) : (
              <Calendar className="w-5 h-5 text-sky-500" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="font-number text-xl font-semibold text-slate-800">
                {date.year} / {String(date.month).padStart(2, '0')} / {String(date.day).padStart(2, '0')}
              </span>
              <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-600 text-xs font-medium">
                {date.weekday}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              {festival && <FestivalBadge festival={festival} />}
              <span className="text-xs text-slate-500">
                {date.weekdayCn} · <span className="capitalize">{getSkyLabel(time.sky)}</span>
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* 中间天气球凹槽 */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 w-28 h-14 bg-gradient-to-r from-sky-50 via-cream-50 to-sky-50 rounded-b-full border-b border-x border-sky-100 shadow-soft">
        <div className="absolute left-1/2 -translate-x-1/2 -top-10">
          <SkyOrb />
        </div>
      </div>

      {/* 右侧 BGM 播放器 */}
      <div className="flex items-center justify-end h-full w-1/3">
        <BgmPlayer title="黄昏的车站" />
      </div>
    </header>
  );
}

function FestivalBadge({ festival }: { festival: Festival }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cream-100 text-amber-600 text-xs font-bold whitespace-nowrap border border-cream-200">
      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
      今天是{festival.name}哦！
    </span>
  );
}

function getSkyLabel(sky: string) {
  const map: Record<string, string> = {
    sunny: '晴朗',
    cloudy: '多云',
    sunset: '黄昏',
    night: '夜晚',
    rain: '雨天',
  };
  return map[sky] ?? sky;
}
