// src/components/overlays/SkillsOverlay/index.tsx
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGameState';
import type { SkillCategory, SkillTree } from '@/types';
import { CategoryTabs } from './CategoryTabs';
import { StatsBanner } from './StatsBanner';
import { SkillCardGrid } from './SkillCardGrid';
import { SkillTreeView } from './SkillTreeView';
import { tabContentTransition } from './node-animations';

const categoryColors: Record<SkillCategory, string> = {
  daily: '#8B5CF6',
  work: '#0EA5E9',
  special: '#F43F5E',
};

export function SkillsOverlay() {
  const { state } = useGame();
  const payload = state.detailView?.payload;
  const initialCategory = (payload?.category as SkillCategory) || 'daily';

  const [activeCategory, setActiveCategory] = useState<SkillCategory>(initialCategory);
  const [selectedSkill, setSelectedSkill] = useState<SkillTree | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  const skills = state.skills[activeCategory];
  const color = categoryColors[activeCategory];

  const handleCategoryChange = useCallback((cat: SkillCategory) => {
    const categories: SkillCategory[] = ['daily', 'work', 'special'];
    const oldIdx = categories.indexOf(activeCategory);
    const newIdx = categories.indexOf(cat);
    setDirection(newIdx > oldIdx ? 1 : -1);
    setActiveCategory(cat);
    setSelectedSkill(null);
  }, [activeCategory]);

  const handleSkillClick = useCallback((skill: SkillTree) => {
    setSelectedSkill(skill);
  }, []);

  const handleBackToGrid = useCallback(() => {
    setSelectedSkill(null);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* 模式切换：grid 显示标签栏；tree 隐藏 */}
      {!selectedSkill && (
        <CategoryTabs active={activeCategory} onChange={handleCategoryChange} />
      )}

      {/* 内容区 */}
      <AnimatePresence mode="wait" custom={direction}>
        {selectedSkill ? (
          /* 详情模式：星座技能树 */
          <motion.div
            key={`tree-${selectedSkill.id}`}
            custom={direction}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={tabContentTransition}
            className="min-h-[480px]"
          >
            <SkillTreeView
              skill={selectedSkill}
              color={categoryColors[selectedSkill.category]}
              onBack={handleBackToGrid}
            />
          </motion.div>
        ) : (
          /* 总览模式：统计 + 卡牌网格 */
          <motion.div
            key={`grid-${activeCategory}`}
            custom={direction}
            initial={{ x: direction * 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -40, opacity: 0 }}
            transition={tabContentTransition}
            className="space-y-4"
          >
            <StatsBanner skills={skills} color={color} />
            <SkillCardGrid skills={skills} color={color} onSkillClick={handleSkillClick} />
            {skills.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-12">该领域暂无技能</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
