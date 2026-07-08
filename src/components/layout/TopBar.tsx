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
      className="relative h-16 px-5 flex items-center justify-between bg-bg-card-raised/90 backdrop-blur-md border-b border-border-soft z-20"
    >
      {/* 左侧日期与节日 */}
      <div className="flex items-center gap-4 w-1/3">
        <button
          type="button"
          id="topbar-date-festival"
          onClick={() => openOverlayView('calendarFull')}
          className="flex items-center gap-4 text-left group"
        >
          <div className="w-11 h-11 rounded-xl bg-accent-amber/15 border border-accent-amber/25 flex items-center justify-center overflow-hidden"
          >
            {festival ? (
              <div className="w-7 h-7 rounded-full bg-accent-amber/25 flex items-center justify-center">
                <Star className="w-4 h-4 text-accent-amber" />
              </div>
            ) : (
              <Calendar className="w-5 h-5 text-accent-sunset" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="font-heading text-2xl font-bold text-text-primary tracking-tight leading-none">
              {date.year} / {String(date.month).padStart(2, '0')} / {String(date.day).padStart(2, '0')}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              {festival && <FestivalBadge festival={festival} />}
              <span className="text-xs text-text-secondary">
                {date.weekday}（{date.weekdayCn}）· <span className="capitalize">{getSkyLabel(time.sky)}</span>
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* 中间天气球凹槽 */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 w-28 h-14 bg-bg-card-raised/90 rounded-b-full border-b border-x border-border-soft">
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
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent-amber text-white text-xs font-bold shadow-sm whitespace-nowrap">
      <Star className="w-3 h-3 fill-white" />
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
