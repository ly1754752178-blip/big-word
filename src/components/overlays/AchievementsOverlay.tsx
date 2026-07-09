import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  MapPin,
  BookOpen,
  Wallet,
  PenTool,
  Heart,
  Award,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'map-pin': MapPin,
  'book-open': BookOpen,
  wallet: Wallet,
  'pen-tool': PenTool,
  heart: Heart,
  award: Award,
};

export function AchievementsOverlay() {
  const { state } = useGame();
  const { achievements } = state;

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-500" />
          <h3 className="text-lg font-bold text-slate-800">成就</h3>
        </div>
        <span className="text-xs text-slate-500">已解锁 {unlockedCount} / {achievements.length}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {achievements.map((achievement) => {
          const Icon = iconMap[achievement.icon] ?? Award;
          const unlocked = !!achievement.unlockedAt;

          return (
            <GlassCard
              key={achievement.id}
              variant={unlocked ? 'mint' : 'default'}
              className="p-4 text-center"
            >
              <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center ${unlocked ? 'bg-white text-mint-500' : 'bg-slate-100 text-slate-400'}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h4 className={`mt-3 font-bold text-sm ${unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                {achievement.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1">{achievement.description}</p>
              {unlocked && (
                <span className="mt-2 inline-block text-[10px] font-number text-mint-600">{achievement.unlockedAt}</span>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
