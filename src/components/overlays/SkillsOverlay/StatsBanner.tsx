/**
 * StatsBanner — 技能统计横幅（暖色系）
 */
import type { SkillTree, CategoryExp } from '@/types';

interface Props {
  skills: SkillTree[];
  color: string;
  categoryExp: CategoryExp;
}

export function StatsBanner({ skills, color, categoryExp }: Props) {
  const learned = skills.reduce((s, sk) => s + sk.nodes.filter(n => n.unlocked).length, 0);
  const total = skills.reduce((s, sk) => s + sk.nodes.length, 0);
  const pts = skills.reduce((s, sk) => s + sk.skillPoints, 0);

  const expPct = categoryExp.maxExp > 0
    ? Math.min(100, Math.max(0, Math.round((categoryExp.exp / categoryExp.maxExp) * 100)))
    : 0;

  return (
    <section className="flex items-center gap-5 px-5 py-3 rounded-xl" style={{ background: '#FDFAF5' }}>
      <StatBlock label="已习得" value={`${learned}/${total}`} />
      <div className="w-px h-8" style={{ background: '#E0D5C5' }} />
      <StatBlock label="可用技能点" value={`${pts}`} accent={color} />
      <div className="w-px h-8" style={{ background: '#E0D5C5' }} />

      {/* 泛用经验条 */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium" style={{ color: '#8B7560' }}>泛用经验值</span>
          <span className="font-number" style={{ color: '#8B7560' }}>{expPct}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: '#EDE5DA' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${expPct}%`, background: color }}
          />
        </div>
        <div className="flex justify-end text-[10px]" style={{ color: '#B8A898' }}>
          <span className="font-number">{categoryExp.exp}/{categoryExp.maxExp}</span>
        </div>
      </div>
    </section>
  );
}

function StatBlock({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex flex-col items-center min-w-[60px]">
      <span className="text-[10px] uppercase tracking-wider" style={{ color: '#B8A898' }}>{label}</span>
      <span className="text-lg font-bold" style={{ color: accent ?? '#4A3728' }}>{value}</span>
    </div>
  );
}
