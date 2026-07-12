/**
 * SkillsOverlay — 技能系统主容器
 * 卡片网格 / 技能树双视图切换
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGameState';
import type { SkillCategory, SkillTree } from '@/types';
import { CategoryTabs } from './CategoryTabs';
import { StatsBanner } from './StatsBanner';
import { SkillCardGrid } from './SkillCardGrid';
import { SkillTreeView } from './SkillTreeView';

const catColors: Record<SkillCategory, string> = { daily: '#8B5CF6', work: '#0EA5E9', special: '#F43F5E' };

export function SkillsOverlay() {
  const { state } = useGame();
  const payload = state.detailView?.payload;
  const initialCat = (payload?.category as SkillCategory) || 'daily';

  const [category, setCategory] = useState<SkillCategory>(initialCat);
  const [selectedSkill, setSelectedSkill] = useState<SkillTree | null>(null);

  const skills = state.skills[category];
  const color = catColors[category];

  const handleBack = useCallback(() => setSelectedSkill(null), []);

  return (
    <div className={selectedSkill ? 'h-full' : 'max-w-5xl mx-auto space-y-4'}>
      {!selectedSkill && (
        <>
          <CategoryTabs active={category} onChange={setCategory} />
          <StatsBanner skills={skills} color={color} />
          <SkillCardGrid skills={skills} color={color} onClick={setSelectedSkill} />
        </>
      )}

      <AnimatePresence mode="wait">
        {selectedSkill && (
          <motion.div key={`tree-${selectedSkill.id}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full">
            <SkillTreeView skill={selectedSkill} color={color} onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
