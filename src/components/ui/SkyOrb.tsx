import { useGame } from '@/hooks/useGameState';
import { motion } from 'framer-motion';
import { Sun, Cloud, Moon, CloudRain } from 'lucide-react';
import type { SkyType } from '@/types';

const skyPalettes: Record<SkyType, { bands: string[]; sun: string; icon: typeof Sun }> = {
  sunny: {
    bands: ['#60A5FA', '#93C5FD', '#BFDBFE', '#FFFFFF'],
    sun: '#FCD34D',
    icon: Sun,
  },
  cloudy: {
    bands: ['#94A3B8', '#CBD5E1', '#E2E8F0', '#F8FAFC'],
    sun: '#E2E8F0',
    icon: Cloud,
  },
  sunset: {
    bands: ['#C2410C', '#E88D4F', '#F5C542', '#FDE68A'],
    sun: '#FDBA74',
    icon: Sun,
  },
  night: {
    bands: ['#1E1B4B', '#312E81', '#4338CA', '#6366F1'],
    sun: '#FEF3C7',
    icon: Moon,
  },
  rain: {
    bands: ['#475569', '#64748B', '#94A3B8', '#CBD5E1'],
    sun: '#CBD5E1',
    icon: CloudRain,
  },
};

export function SkyOrb() {
  const { state } = useGame();
  const { time } = state;
  const palette = skyPalettes[time.sky] ?? skyPalettes.sunny;
  const Icon = palette.icon;

  return (
    <div className="anime-orb-frame">
      <motion.div
        className="relative w-24 h-24 anime-orb animate-float"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* 赛璐璐硬切渐变天空 */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${palette.bands[0]} 0%, ${palette.bands[1]} 35%, ${palette.bands[2]} 65%, ${palette.bands[3]} 100%)`,
          }}
        />

        {/* 太阳 / 月亮 */}
        <div
          className="absolute top-3 right-5 w-8 h-8 rounded-full"
          style={{
            background: palette.sun,
            boxShadow: `0 0 16px ${palette.sun}`,
          }}
        />

        {/* 风景剪影 */}
        <div className="absolute bottom-0 left-0 right-0 h-[32%] z-[1]">
          <svg viewBox="0 0 120 40" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0 40 L0 22 Q15 12 30 20 T60 16 T90 22 T120 14 L120 40 Z"
              fill="rgba(61,50,41,0.35)"
            />
            <path
              d="M0 40 L0 28 Q20 24 40 28 T80 26 T120 30 L120 40 Z"
              fill="rgba(61,50,41,0.5)"
            />
          </svg>
        </div>

        {/* 时间文字 */}
        <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center">
          <Icon className="w-5 h-5 text-white drop-shadow-md mb-0.5" />
          <span className="font-number text-base font-bold text-white drop-shadow-md">
            {String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}
          </span>
        </div>

        {/* 高光 */}
        <div className="absolute top-3 left-4 w-5 h-3 bg-white/30 rounded-full blur-[2px] z-[4] rotate-[-20deg]" />
      </motion.div>
    </div>
  );
}
