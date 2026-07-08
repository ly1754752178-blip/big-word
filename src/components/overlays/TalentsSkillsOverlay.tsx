import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  Sparkles,
  Brain,
  BookOpen,
  Moon,
  Heart,
  UtensilsCrossed,
  Code,
  Wand2,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Talent, SkillTree, SkillCategory } from '@/types';

const talentIconMap: Record<string, typeof Heart> = {
  heart: Heart,
  moon: Moon,
  'book-open': BookOpen,
};

const categoryMeta: Record<
  SkillCategory,
  { label: string; icon: typeof Brain; gradient: string }
> = {
  daily: { label: '日常技能', icon: UtensilsCrossed, gradient: 'from-talent-violet to-talent-magenta' },
  work: { label: '工作技能', icon: Code, gradient: 'from-talent-magenta to-talent-gold' },
  special: { label: '特殊技能', icon: Wand2, gradient: 'from-talent-gold to-talent-violet' },
};

function TalentGrid() {
  const { state } = useGame();

  return (
    <GlassCard variant="raised" className="p-5 module-card-talent">
      <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-talent-violet" /> 天赋
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {state.talents.map((talent) => (
          <TalentItem key={talent.id} talent={talent} />
        ))}
      </div>
    </GlassCard>
  );
}

function TalentItem({ talent }: { talent: Talent }) {
  const Icon = talentIconMap[talent.icon] ?? Sparkles;
  const rarityColor =
    talent.rarity === 'legendary'
      ? 'bg-talent-gold/25 text-talent-gold border-talent-gold/40'
      : talent.rarity === 'epic'
        ? 'bg-talent-magenta/20 text-talent-magenta border-talent-magenta/40'
        : talent.rarity === 'rare'
          ? 'bg-talent-violet/15 text-talent-violet border-talent-violet/40'
          : 'bg-bg-glass text-text-secondary border-border-soft';

  return (
    <div className="group relative">
      <GlassCard
        variant="elevated"
        className={`p-3 flex flex-col items-center gap-2 border ${rarityColor}`}
      >
        <Icon className="w-6 h-6" />
        <span className="text-xs font-medium text-center truncate w-full">{talent.name}</span>
      </GlassCard>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-3 rounded-xl bg-bg-card-floating border border-border-soft shadow-floating opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20"
      >
        <p className="text-sm text-text-primary font-bold">{talent.name}</p>
        <p className="text-xs text-text-secondary mt-1 leading-relaxed">{talent.description}</p>
      </div>
    </div>
  );
}

function SkillTreePreview({ skill }: { skill: SkillTree }) {
  const { openOverlayView } = useGame();
  const meta = categoryMeta[skill.category];
  const Icon = meta.icon;

  return (
    <motion.button
      type="button"
      onClick={() => openOverlayView('skillTree', { skillId: skill.id })}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left"
    >
      <GlassCard variant="elevated" hover className="p-4 module-card-talent">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white shadow-md`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading text-base font-bold text-text-primary">{skill.name}</h4>
              <p className="text-xs text-text-secondary mt-0.5">{meta.label} · Lv.{skill.level}/{skill.maxLevel}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-text-muted" />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
            <span>经验值</span>
            <span className="font-number">{skill.exp}/{skill.maxExp}</span>
          </div>
          <div className="h-2 bg-border-soft/60 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${meta.gradient} rounded-full`}
              style={{ width: `${(skill.exp / skill.maxExp) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-text-secondary">技能点</span>
          <span className="px-2 py-0.5 rounded-full bg-talent-gold/15 text-talent-gold text-xs font-number font-bold">
            {skill.skillPoints}
          </span>
          <span className="ml-auto text-xs text-text-muted">{skill.nodes.length} 个节点</span>
        </div>
      </GlassCard>
    </motion.button>
  );
}

export function TalentsSkillsOverlay() {
  const { state } = useGame();
  const allSkills = [...state.skills.daily, ...state.skills.work, ...state.skills.special];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <TalentGrid />

      <GlassCard variant="raised" className="p-5 module-card-talent">
        <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-talent-violet" /> 技能树
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allSkills.map((skill) => (
            <SkillTreePreview key={skill.id} skill={skill} />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
