import { useGame } from '@/hooks/useGameState';
import { Sparkles, Brain, ChevronRight, Heart, Moon, BookOpen } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Talent } from '@/types';

const talentIconMap: Record<string, typeof Heart> = {
  heart: Heart,
  moon: Moon,
  'book-open': BookOpen,
};

export function TalentsPreview() {
  const { state, openOverlayView } = useGame();
  const allSkills = [...state.skills.daily, ...state.skills.work, ...state.skills.special];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 rounded-full bg-lavender-100 text-lavender-600 text-sm font-medium">天赋才能</span>
        <button
          type="button"
          id="preview-talents-detail"
          onClick={() => openOverlayView('talents')}
          className="flex items-center text-[10px] text-slate-400 hover:text-lavender-500 transition-colors"
        >
          详情 <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {state.talents.map((talent: Talent) => {
          const Icon = talentIconMap[talent.icon] ?? Sparkles;
          return (
            <GlassCard
              key={talent.id}
              variant="lavender"
              className="flex flex-col items-center gap-1 px-2 py-2 min-w-[64px]"
            >
              <Icon className="w-5 h-5 text-lavender-500" />
              <span className="text-[10px] text-slate-700 whitespace-nowrap">{talent.name}</span>
            </GlassCard>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-bold text-slate-500">技能树</span>
      </div>

      <div className="space-y-2">
        {allSkills.slice(0, 3).map((skill) => (
          <GlassCard
            key={skill.id}
            variant="default"
            className="p-2 w-full flex items-center gap-2"
            onClick={() => openOverlayView('skillTree', { skillId: skill.id })}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lavender-300 to-lavender-500 flex items-center justify-center text-white">
              <Brain className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-bold text-slate-700 truncate">{skill.name}</div>
              <div className="text-[10px] text-slate-400">Lv.{skill.level}/{skill.maxLevel}</div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
