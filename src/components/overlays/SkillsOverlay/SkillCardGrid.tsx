/**
 * SkillCardGrid — 响应式技能卡牌网格
 */
import type { SkillTree } from '@/types';
import { SkillCard } from './SkillCard';

interface Props { skills: SkillTree[]; color: string; onClick: (s: SkillTree) => void; }

export function SkillCardGrid({ skills, color, onClick }: Props) {
  if (skills.length === 0) {
    return (
      <p className="text-center text-sm text-white/25 py-16"
        style={{ fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>
        该领域暂无技能
      </p>
    );
  }

  return (
    <section id="skill-card-grid" aria-label="技能列表"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {skills.map((skill, i) => (
        <SkillCard key={skill.id} skill={skill} color={color} onClick={onClick} index={i} />
      ))}
    </section>
  );
}
