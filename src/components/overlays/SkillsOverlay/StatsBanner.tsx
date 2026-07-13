/**
 * StatsBanner — 技能统计横幅（暖色系）
 */
import type { SkillTree } from '@/types';

interface Props { skills: SkillTree[]; color: string; }

export function StatsBanner({ skills, color }: Props) {
  const learned = skills.reduce((s, sk) => s + sk.nodes.filter(n => n.unlocked).length, 0);
  const total = skills.reduce((s, sk) => s + sk.nodes.length, 0);
  const pts = skills.reduce((s, sk) => s + sk.skillPoints, 0);

  return (
    <section className="flex items-center gap-5 px-5 py-3 rounded-xl" style={{ background: '#FDFAF5' }}>
      <StatBlock label="已习得" value={`${learned}/${total}`} />
      <div className="w-px h-8" style={{ background: '#E0D5C5' }} />
      <StatBlock label="可用技能点" value={`${pts}`} accent={color} />
      <div className="w-px h-8" style={{ background: '#E0D5C5' }} />
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#EDE5DA' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${total > 0 ? (learned / total) * 100 : 0}%`, background: color }} />
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
