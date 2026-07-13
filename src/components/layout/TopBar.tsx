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
      className="relative h-16 pl-5 pr-0 flex items-center justify-between bg-[#FDFAF5] z-20 shadow-sm overflow-visible"
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

      {/* 底部边框：左段水平线 */}
      <div
        className="absolute left-0 bottom-0 border-b-2 border-[#E8DFD3] pointer-events-none"
        style={{ right: 'calc(50% + 53px)' }}
      />

      {/* 底部边框：右段水平线 */}
      <div
        className="absolute right-0 bottom-0 border-b-2 border-[#E8DFD3] pointer-events-none"
        style={{ left: 'calc(50% + 53px)' }}
      />

      {/* 底部边框：中间半圆浅凸出，包裹放大后的天气球露出部分 */}
      <div className="absolute left-1/2 bottom-[-24px] -translate-x-1/2 w-[105px] h-[24px] border-2 border-t-0 border-[#E8DFD3] rounded-b-full bg-[#FDFAF5] pointer-events-none" />

      {/* 天气球 — 放大35% */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-20px] z-10">
        <SkyOrb />
      </div>

      {/* 右侧 BGM 播放器 */}
      <div className="flex items-center justify-end h-full">
        <BgmPlayer />
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
