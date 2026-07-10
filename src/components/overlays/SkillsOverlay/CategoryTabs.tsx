import { motion } from 'framer-motion';
import { UtensilsCrossed, Code, Wand2 } from 'lucide-react';
import type { SkillCategory } from '@/types';

interface TabConfig {
  key: SkillCategory;
  label: string;
  icon: typeof UtensilsCrossed;
  color: string;
}

const tabs: TabConfig[] = [
  { key: 'daily', label: '通用领域', icon: UtensilsCrossed, color: '#8B5CF6' },
  { key: 'work', label: '专业领域', icon: Code, color: '#0EA5E9' },
  { key: 'special', label: '特殊领域', icon: Wand2, color: '#F43F5E' },
];

interface CategoryTabsProps {
  active: SkillCategory;
  onChange: (category: SkillCategory) => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex items-center justify-center gap-1 px-4 pt-2 pb-0" role="tablist">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap
              ${isActive ? 'text-white' : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'}`}
            style={isActive ? { backgroundColor: tab.color } : {}}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="active-tab-underline"
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-white/60"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
