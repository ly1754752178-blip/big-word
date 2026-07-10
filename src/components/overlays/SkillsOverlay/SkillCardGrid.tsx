// src/components/overlays/SkillsOverlay/SkillCardGrid.tsx
// 技能卡牌网格组件 - 以网格布局展示技能卡片，支持 AnimatePresence 动画
import { motion, AnimatePresence } from 'framer-motion';
import type { SkillTree } from '@/types';
import { SkillCard } from './SkillCard';
import { gridVariants } from './node-animations';

interface SkillCardGridProps {
  skills: SkillTree[];
  color: string;
  onSkillClick: (skill: SkillTree) => void;
  /** 排除的 skillId（展开中的卡片） */
  excluding?: string | null;
}

export function SkillCardGrid({ skills, color, onSkillClick, excluding }: SkillCardGridProps) {
  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4"
    >
      <AnimatePresence>
        {skills.map((skill) => (
          skill.id !== excluding && (
            <SkillCard
              key={skill.id}
              skill={skill}
              color={color}
              onClick={onSkillClick}
            />
          )
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
