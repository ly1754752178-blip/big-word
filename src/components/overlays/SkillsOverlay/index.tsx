/**
 * SkillsOverlay — 技能系统主容器
 * 整片统一暖色不透明背景，匹配主 UI 奶油色系
 */
import { useState, useCallback, useEffect } from 'react';
import { useGame } from '@/hooks/useGameState';
import type { SkillCategory, SkillTree } from '@/types';
import { CategoryTabs } from './CategoryTabs';
import { StatsBanner } from './StatsBanner';
import { SkillCardGrid } from './SkillCardGrid';
import { SkillTreeView } from './SkillTreeView';

const catMeta: Record<SkillCategory, { label: string; emoji: string; color: string }> = {
  daily:    { label: '通用领域', emoji: '🌸', color: '#C4953A' },
  work:     { label: '专业领域', emoji: '⚡', color: '#0E8DC4' },
  special:  { label: '特殊领域', emoji: '💎', color: '#9B5FC0' },
};

// 暖色系统一色板（匹配 app 奶油主题）
const COL = {
  bg:      '#FDFAF5',  // 整片底色
  card:    '#FFFBF7',  // 卡片底色
  border:  '#E8DFD3',  // 边框
  text:    '#4A3728',  // 主文字
  sub:     '#8B7560',  // 副文字
  subtle:  '#B8A898',  // 淡文字
  divider: '#E0D5C5',  // 分隔线
};

export function SkillsOverlay() {
  const { state, updateOverlayTitle } = useGame();
  const payload = state.detailView?.payload;
  const initialCat = (payload?.category as SkillCategory) || 'daily';

  const [category, setCategory] = useState<SkillCategory>(initialCat);
  const [selectedSkill, setSelectedSkill] = useState<SkillTree | null>(null);

  const skills = state.skills[category];
  const meta = catMeta[category];
  const color = meta.color;

  useEffect(() => {
    updateOverlayTitle(
      selectedSkill
        ? `${meta.emoji} ${meta.label} · ${selectedSkill.name}`
        : `${meta.emoji} ${meta.label}`
    );
  }, [category, selectedSkill, meta, updateOverlayTitle]);

  const handleBack = useCallback(() => setSelectedSkill(null), []);

  if (selectedSkill) {
    return (
      <div className="h-full flex flex-col" style={{ background: COL.bg }}>
        <SkillTreeView
          skill={selectedSkill}
          color={color}
          categoryLabel={meta.label}
          categoryEmoji={meta.emoji}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 p-4 rounded-2xl" style={{ background: COL.bg }}>
      {/* 领域标签 */}
      <div className="p-1.5 rounded-2xl" style={{ background: COL.card, border: `1.5px solid ${COL.border}` }}>
        <CategoryTabs active={category} onChange={setCategory} />
      </div>

      {/* 统计栏 */}
      <div className="p-1 rounded-2xl" style={{ background: COL.card, border: `1.5px solid ${COL.border}` }}>
        <StatsBanner skills={skills} color={color} />
      </div>

      {/* 分隔 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: COL.divider }} />
        <span className="text-xs font-bold tracking-widest" style={{ color: COL.subtle }}>
          {skills.length} 项技能
        </span>
        <div className="flex-1 h-px" style={{ background: COL.divider }} />
      </div>

      {/* 技能卡片 */}
      <SkillCardGrid skills={skills} color={color} onClick={setSelectedSkill} />
    </div>
  );
}
