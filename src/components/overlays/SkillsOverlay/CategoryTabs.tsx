/**
 * CategoryTabs — 领域标签导航（暖色系）
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
    <nav className="flex gap-2 p-1 rounded-xl" style={{ background: '#FDFAF5' }}>
      {tabs.map(tab => {
        const isActive = active === tab.key;
        return (
          <button key={tab.key} onClick={() => onChange(tab.key)}
            aria-selected={isActive}
            className="relative flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              color: isActive ? '#4A3728' : '#B8A898',
              fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif',
              background: isActive ? '#FDF8F2' : 'transparent',
              border: isActive ? '2px solid #E8DFD3' : '2px solid transparent',
              boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
            }}>
            <span className="mr-1.5">{tab.emoji}</span>{tab.label}
            {isActive && (
              <motion.div layoutId="tab-active-border" className="absolute inset-0 rounded-xl border-2"
                style={{ borderColor: '#D4C5B0' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
