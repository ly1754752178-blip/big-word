import { useGame } from '@/hooks/useGameState';
import { Sparkles } from 'lucide-react';
import type { SkillTree, SkillNode } from '@/types';

function SkillNodeItem({ node, isRoot }: { node: SkillNode; isRoot: boolean }) {
  const unlocked = node.unlocked;
  if (!node.position) return null;

  return (
    <g transform={`translate(${node.position.x}, ${node.position.y})`}>
      <circle
        r={isRoot ? 5 : 4}
        fill={unlocked ? '#8B5CF6' : '#E8E0D8'}
        stroke={unlocked ? '#F5B041' : '#BDB0A0'}
        strokeWidth="0.6"
      />
      <text
        y={isRoot ? 7.5 : 6.5}
        textAnchor="middle"
        fontSize={isRoot ? 2.6 : 2.2}
        fill={unlocked ? '#3D3229' : '#9A8B7A'}
        fontWeight={isRoot ? 'bold' : 'normal'}
      >
        {node.name}
      </text>
      <text
        y={isRoot ? 10.2 : 9}
        textAnchor="middle"
        fontSize="1.8"
        fill={unlocked ? '#7D6E5E' : '#9A8B7A'}
      >
        Lv.{node.level}/{node.maxLevel}
      </text>
    </g>
  );
}

function TreeConnections({ skill }: { skill: SkillTree }) {
  return (
    <>
      {skill.nodes.map((node) =>
        (node.parentIds ?? []).map((parentId) => {
          const parent = skill.nodes.find((n) => n.id === parentId);
          if (!parent?.position || !node.position) return null;
          return (
            <line
              key={`${parent.id}-${node.id}`}
              x1={parent.position.x}
              y1={parent.position.y}
              x2={node.position.x}
              y2={node.position.y}
              stroke={node.unlocked ? 'rgba(139,92,246,0.5)' : 'rgba(125,110,94,0.2)'}
              strokeWidth="0.4"
            />
          );
        })
      )}
    </>
  );
}

export function SkillTreeOverlay() {
  const { state } = useGame();
  const skillId = state.detailView?.payload?.skillId as string | undefined;

  const allSkills = [...state.skills.daily, ...state.skills.work, ...state.skills.special];
  const skill = allSkills.find((s) => s.id === skillId) ?? allSkills[0];

  return (
    <div className="w-full h-full min-h-[480px] flex flex-col">
      {/* 顶部信息 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft/60 bg-white/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-talent-violet to-talent-magenta flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-text-primary">{skill.name}</h3>
            <p className="text-xs text-text-secondary">Lv.{skill.level}/{skill.maxLevel} · 技能点 {skill.skillPoints}</p>
          </div>
        </div>
        <div className="w-40">
          <div className="flex justify-between text-[10px] text-text-muted mb-1">
            <span>经验值</span>
            <span className="font-number">{skill.exp}/{skill.maxExp}</span>
          </div>
          <div className="h-2 bg-border-soft/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-talent-violet to-talent-gold rounded-full"
              style={{ width: `${(skill.exp / skill.maxExp) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 径向技能树 */}
      <div className="flex-1 min-h-0 relative overflow-hidden bg-gradient-to-br from-talent-pale/50 to-white">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* 同心圆参考线 */}
          {[15, 30, 45, 60, 75].map((r) => (
            <circle
              key={r}
              cx={50}
              cy={50}
              r={r}
              fill="none"
              stroke="rgba(125,110,94,0.08)"
              strokeWidth="0.3"
            />
          ))}

          <TreeConnections skill={skill} />

          {skill.nodes.map((node) => (
            <SkillNodeItem
              key={node.id}
              node={node}
              isRoot={!node.parentIds || node.parentIds.length === 0}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
