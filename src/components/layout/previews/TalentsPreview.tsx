import { useGame } from '@/hooks/useGameState';
import { Sparkles, Brain, ChevronRight, Heart, Moon, BookOpen } from 'lucide-react';
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
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-text-secondary">天赋特质</span>
        <button
          type="button"
          id="preview-talents-detail"
          onClick={() => openOverlayView('talents')}
          className="flex items-center text-[10px] text-text-muted hover:text-talent-violet"
        >
          详情 <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {state.talents.map((talent: Talent) => {
          const Icon = talentIconMap[talent.icon] ?? Sparkles;
          return (
            <div
              key={talent.id}
              className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-talent-violet/10 border border-talent-violet/20 min-w-[64px]"
            >
              <Icon className="w-5 h-5 text-talent-violet" />
              <span className="text-[10px] text-text-primary whitespace-nowrap">{talent.name}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-bold text-text-secondary">技能树</span>
      </div>

      <div className="space-y-2">
        {allSkills.slice(0, 3).map((skill) => (
          <button
            key={skill.id}
            type="button"
            id={`preview-skill-${skill.id}`}
            onClick={() => openOverlayView('skillTree', { skillId: skill.id })}
            className="w-full p-2 rounded-xl bg-white/60 border border-border-soft flex items-center gap-2 hover:bg-white/80 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-talent-violet to-talent-magenta flex items-center justify-center text-white">
              <Brain className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-bold text-text-primary truncate">{skill.name}</div>
              <div className="text-[10px] text-text-muted">Lv.{skill.level}/{skill.maxLevel}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
