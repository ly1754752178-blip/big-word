/**
 * StatsBanner — 技能统计横幅
 */
import type { SkillTree } from '@/types';

interface Props { skills: SkillTree[]; color: string; }

export function StatsBanner({ skills, color }: Props) {
  const learned = skills.reduce((s, sk) => s + sk.nodes.filter(n => n.unlocked).length, 0);
  const total = skills.reduce((s, sk) => s + sk.nodes.length, 0);
  const pts = skills.reduce((s, sk) => s + sk.skillPoints, 0);

  return (
    <section id="skill-stats-banner" aria-label="技能统计"
      className="flex items-center gap-6 px-5 py-3 rounded-2xl border border-white/10"
      style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
      <StatBlock label="已习得" value={`${learned}/${total}`} />
      <div className="w-px h-8 bg-white/10" />
      <StatBlock label="可用技能点" value={`${pts}`} accent={color} />
      <div className="w-px h-8 bg-white/10" />
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${total > 0 ? (learned / total) * 100 : 0}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      </div>
    </section>
  );
}

function StatBlock({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex flex-col items-center min-w-[60px]">
      <span className="text-[10px] text-white/40 uppercase tracking-wider"
        style={{ fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>{label}</span>
      <span className="text-lg font-bold" style={{ color: accent ?? '#fff', fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>{value}</span>
    </div>
  );
}
