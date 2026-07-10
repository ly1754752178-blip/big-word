// src/components/overlays/SkillsOverlay/SkillTreeView.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import type { SkillTree, SkillNode } from '@/types';
import { nodeVariants } from './node-animations';
import { SkillNodeDetail } from './SkillNodeDetail';

interface SkillTreeViewProps {
  skill: SkillTree;
  color: string;
  onBack: () => void;
  /** 自定义背景图 URL（可选） */
  backgroundImage?: string;
}

function TreeLines({ skill }: { skill: SkillTree }) {
  return (
    <g>
      {skill.nodes.map((node) =>
        (node.parentIds ?? []).map((pid) => {
          const parent = skill.nodes.find((n) => n.id === pid);
          if (!parent?.position || !node.position) return null;
          const unlocked = node.unlocked && parent.unlocked;
          return (
            <line
              key={`${pid}-${node.id}`}
              x1={parent.position.x}
              y1={parent.position.y}
              x2={node.position.x}
              y2={node.position.y}
              stroke={unlocked ? 'url(#lineGradient)' : '#CBD5E1'}
              strokeWidth={unlocked ? 0.6 : 0.4}
              strokeDasharray={unlocked ? 'none' : '2 2'}
              opacity={unlocked ? 0.7 : 0.35}
            />
          );
        })
      )}
    </g>
  );
}

function TreeCircles({
  skill,
  color,
  selectedId,
  onSelect,
}: {
  skill: SkillTree;
  color: string;
  selectedId: string | null;
  onSelect: (n: SkillNode) => void;
}) {
  return (
    <g>
      {skill.nodes.map((node, i) => {
        if (!node.position) return null;
        const isRoot = !node.parentIds || node.parentIds.length === 0;
        const r = isRoot ? 5.5 : 4;
        const isSelected = node.id === selectedId;
        return (
          /* 外层 <g> 负责 SVG 坐标定位，不受动画影响 */
          <g key={node.id} transform={`translate(${node.position.x}, ${node.position.y})`}>
            {/* 渐变定义放在此处，确保 id 在 SVG 中唯一 */}
            <defs>
              <radialGradient id={`nodeGradient-${node.id}`}>
                <stop offset="0%" stopColor={node.unlocked ? color : '#CBD5E1'} />
                <stop offset="100%" stopColor={node.unlocked ? `${color}88` : '#E2E8F0'} />
              </radialGradient>
            </defs>
            {/* 内层 motion.g 只负责动画（scale/opacity），不影响坐标 */}
            <motion.g
              custom={i}
              variants={nodeVariants}
              initial="hidden"
              animate="visible"
              onClick={() => onSelect(node)}
              className="cursor-pointer"
            >
              {/* 选中脉冲光环 */}
              {isSelected && (
                <circle r={r + 3} fill="none" stroke={color} strokeWidth="0.8" opacity={0.5}>
                  <animate attributeName="r" from={r + 3} to={r + 6} dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {/* 双重光环（根节点） */}
              {isRoot && node.unlocked && (
                <circle r={r + 2} fill="none" stroke={color} strokeWidth="0.3" opacity={0.35} />
              )}
              {/* 主体圆 */}
              <circle
                r={r}
                fill={node.unlocked ? `url(#nodeGradient-${node.id})` : '#E2E8F0'}
                stroke={node.unlocked ? color : '#94A3B8'}
                strokeWidth={isSelected ? 1.2 : 0.6}
              />
              {/* 名称 */}
              <text
                y={r + 3.2}
                textAnchor="middle"
                fontSize={isRoot ? 2.8 : 2.3}
                fill={node.unlocked ? '#1E293B' : '#94A3B8'}
                fontWeight={isRoot ? 'bold' : 'normal'}
                className="select-none pointer-events-none"
              >
                {node.name}
              </text>
              {/* 等级 */}
              <text
                y={r + 5.5}
                textAnchor="middle"
                fontSize="1.8"
                fill={node.unlocked ? '#64748B' : '#CBD5E1'}
                className="select-none pointer-events-none"
              >
                Lv.{node.level}/{node.maxLevel}
              </text>
            </motion.g>
          </g>
        );
      })}
    </g>
  );
}

export function SkillTreeView({ skill, color, onBack, backgroundImage }: SkillTreeViewProps) {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const expPercent = skill.maxExp > 0 ? (skill.exp / skill.maxExp) * 100 : 0;

  return (
    <motion.div
      layoutId={`skill-card-${skill.id}`}
      className="flex flex-col h-full rounded-2xl overflow-hidden border border-slate-200/80 bg-white/90 shadow-lg"
    >
      {/* 顶部返回栏 */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100 bg-white/70 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color }} />
            <h4 className="font-heading font-bold text-slate-800 text-sm">{skill.name}</h4>
            <span className="text-[10px] text-slate-500">Lv.{skill.level}/{skill.maxLevel}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 max-w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${expPercent}%`, background: `linear-gradient(90deg, ${color}, ${color}AA)` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-number">
              {skill.exp}/{skill.maxExp}
            </span>
          </div>
        </div>
      </div>

      {/* SVG 画布区 */}
      <div className="flex-1 relative min-h-0">
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined, backgroundSize: 'cover' }}>
          {/* 同心圆参考线 */}
          {[15, 30, 45, 60, 75].map((r) => (
            <circle
              key={r}
              cx={50}
              cy={50}
              r={r}
              fill="none"
              stroke="rgba(203,213,225,0.3)"
              strokeWidth="0.3"
              strokeDasharray="1 1"
            />
          ))}

          {/* 连线渐变 */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={`${color}88`} stopOpacity={0.35} />
            </linearGradient>
          </defs>

          <TreeLines skill={skill} />
          <TreeCircles skill={skill} color={color} selectedId={selectedNode?.id ?? null} onSelect={setSelectedNode} />
        </svg>

        {/* 节点详情面板 */}
        <SkillNodeDetail node={selectedNode} color={color} />
      </div>
    </motion.div>
  );
}
