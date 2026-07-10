// src/components/overlays/SkillsOverlay/StatsBanner.tsx
import { Sparkles } from 'lucide-react';
import type { SkillTree } from '@/types';

interface StatsBannerProps {
  skills: SkillTree[];
  color: string;
}

export function StatsBanner({ skills, color }: StatsBannerProps) {
  const unlocked = skills.filter((s) => s.level > 0).length;
  const totalSkillPoints = skills.reduce((sum, s) => sum + s.skillPoints, 0);

  return (
    <div
      className="flex items-center justify-between px-5 py-3 rounded-2xl mx-4 border"
      style={{
        background: `linear-gradient(135deg, ${color}14, ${color}08)`,
        borderColor: `${color}25`,
      }}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4" style={{ color }} />
        <span className="text-sm font-semibold text-slate-700">
          已习得 <span className="font-number text-base" style={{ color }}>{unlocked}</span>
          <span className="text-slate-400">/{skills.length}</span> 项
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm text-slate-600">
          可用技能点 <span className="font-number font-bold text-slate-800">{totalSkillPoints}</span>
        </span>
      </div>
    </div>
  );
}
