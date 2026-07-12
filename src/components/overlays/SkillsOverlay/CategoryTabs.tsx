/**
 * CategoryTabs — 领域标签导航
 * 毛玻璃底 + 滑动下划线 + hover 微交互
 */
import { motion } from 'framer-motion';
import type { SkillCategory } from '@/types';

const tabs: { key: SkillCategory; label: string; emoji: string }[] = [
  { key: 'daily', label: '通用领域', emoji: '🌸' },
  { key: 'work', label: '专业领域', emoji: '⚡' },
  { key: 'special', label: '特殊领域', emoji: '💎' },
];

interface Props { active: SkillCategory; onChange: (cat: SkillCategory) => void; }

export function CategoryTabs({ active, onChange }: Props) {
  return (
    <nav id="skill-category-tabs" aria-label="技能领域"
      className="flex gap-2 p-1 rounded-2xl border border-white/10"
      style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
      {tabs.map(tab => (
        <button key={tab.key} id={`tab-${tab.key}`} onClick={() => onChange(tab.key)}
          aria-selected={active === tab.key}
          className="relative flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ color: active === tab.key ? '#fff' : 'rgba(255,255,255,0.5)',
            fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>
          <span className="mr-1.5">{tab.emoji}</span>{tab.label}
          {active === tab.key && (
            <motion.div layoutId="tab-underline" className="absolute inset-0 rounded-xl border border-white/20"
              style={{ background: 'rgba(255,255,255,0.08)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
          )}
        </button>
      ))}
    </nav>
  );
}
