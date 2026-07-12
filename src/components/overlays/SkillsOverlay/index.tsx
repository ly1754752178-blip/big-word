// src/components/overlays/SkillsOverlay/index.tsx
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/hooks/useGameState';
import type { SkillCategory, SkillTree } from '@/types';
import { CategoryTabs } from './CategoryTabs';
import { StatsBanner } from './StatsBanner';
import { SkillCardGrid } from './SkillCardGrid';
import { SkillTreeView } from './SkillTreeView';

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

  const skills = state.skills[activeCategory];
  const color = categoryColors[activeCategory];

  const handleCategoryChange = useCallback((cat: SkillCategory) => {
    setActiveCategory(cat);
    setSelectedSkill(null);
  }, []);

  const handleSkillClick = useCallback((skill: SkillTree) => {
    setSelectedSkill(skill);
  }, []);

  const handleBackToGrid = useCallback(() => {
    setSelectedSkill(null);
  }, []);

  return (
    <div className={selectedSkill ? 'h-full' : 'max-w-5xl mx-auto space-y-4'}>
      {!selectedSkill && (
        <CategoryTabs active={activeCategory} onChange={handleCategoryChange} />
      )}

      {selectedSkill ? (
        <SkillTreeView
          skill={selectedSkill}
          color={categoryColors[selectedSkill.category]}
          onBack={handleBackToGrid}
        />
      ) : (
        <div className="space-y-4">
          <StatsBanner skills={skills} color={color} />
          <SkillCardGrid skills={skills} color={color} onSkillClick={handleSkillClick} />
          {skills.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-12">该领域暂无技能</p>
          )}
        </div>
      )}
    </div>
  );
}
