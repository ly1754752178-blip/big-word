import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import type { SkillTree, SkillNode } from '@/types';
import { nodeVariants } from './node-animations';
import { SkillNodeDetail } from './SkillNodeDetail';

interface SkillTreeViewProps {
  skill: SkillTree;
  color: string;
  onBack: () => void;
  backgroundImage?: string;
}

// ── 节点尺寸 ──
const ROOT_R = 3;
const MAJOR_R = 2.2;
const CHILD_R = 1.6;

/** 判断节点是否可见 */
function isNodeVisible(node: SkillNode, allNodes: SkillNode[], expandedId: string | null): boolean {
  if (!node.parentIds || node.parentIds.length === 0) return true;
  for (const pid of node.parentIds) {
    const parent = allNodes.find((n) => n.id === pid);
    if (parent?.isMajor) return expandedId === pid;
    if (parent && !parent.isMajor && (parent.parentIds?.length ?? 0) > 0) {
      let ancestor = parent;
      while (ancestor.parentIds && ancestor.parentIds.length > 0) {
        const gp = allNodes.find((n) => n.id === ancestor.parentIds![0]);
        if (!gp) break;
        if (gp.isMajor) return expandedId === gp.id;
        ancestor = gp;
      }
    }
  }
  if (node.parentIds.length > 0) {
    const parent = allNodes.find((n) => n.id === node.parentIds![0]);
    if (parent && !parent.isMajor) return true;
  }
  return false;
}

// ── 装饰性星座点（在连线上点缀小星光）──
function ConstellationDots({ skill, visibleIds }: { skill: SkillTree; visibleIds: Set<string> }) {
  const dots: { x: number; y: number; unlocked: boolean }[] = [];
  for (const node of skill.nodes) {
    for (const pid of node.parentIds ?? []) {
      const parent = skill.nodes.find((n) => n.id === pid);
      if (!parent?.position || !node.position) continue;
      if (!visibleIds.has(node.id) || !visibleIds.has(pid)) continue;
      // 在连线中点添加星光
      dots.push({
        x: (parent.position.x + node.position.x) / 2,
        y: (parent.position.y + node.position.y) / 2,
        unlocked: node.unlocked && parent.unlocked,
      });
    }
  }
  return (
    <g>
      {dots.map((d, i) => (
        <g key={i} transform={`translate(${d.x}, ${d.y})`}>
          <circle r={0.25} fill={d.unlocked ? '#FCD34D' : '#CBD5E1'} opacity={d.unlocked ? 0.9 : 0.3} />
          <circle r={0.15} fill="#FFF" opacity={d.unlocked ? 0.6 : 0} />
        </g>
      ))}
    </g>
  );
}

// ── 连线（带发光效果）──
function TreeLines({ skill, visibleIds, color }: { skill: SkillTree; visibleIds: Set<string>; color: string }) {
  return (
    <g>
      {/* 发光层 */}
      {skill.nodes.map((node) =>
        (node.parentIds ?? []).map((pid) => {
          const parent = skill.nodes.find((n) => n.id === pid);
          if (!parent?.position || !node.position) return null;
          if (!visibleIds.has(node.id) || !visibleIds.has(pid)) return null;
          const unlocked = node.unlocked && parent.unlocked;
          if (!unlocked) return null;
          return (
            <line key={`glow-${pid}-${node.id}`}
              x1={parent.position.x} y1={parent.position.y}
              x2={node.position.x} y2={node.position.y}
              stroke={color} strokeWidth={1.2} opacity={0.15}
              strokeLinecap="round"
            />
          );
        })
      )}
      {/* 主线 */}
      {skill.nodes.map((node) =>
        (node.parentIds ?? []).map((pid) => {
          const parent = skill.nodes.find((n) => n.id === pid);
          if (!parent?.position || !node.position) return null;
          if (!visibleIds.has(node.id) || !visibleIds.has(pid)) return null;
          const unlocked = node.unlocked && parent.unlocked;
          return (
            <line key={`${pid}-${node.id}`}
              x1={parent.position.x} y1={parent.position.y}
              x2={node.position.x} y2={node.position.y}
              stroke={unlocked ? 'url(#lineGradient)' : '#CBD5E1'}
              strokeWidth={unlocked ? 0.6 : 0.35}
              strokeDasharray={unlocked ? 'none' : '2 2'}
              opacity={unlocked ? 0.8 : 0.3}
              strokeLinecap="round"
            />
          );
        })
      )}
    </g>
  );
}

// ── 节点 ──
function TreeCircles({
  skill, color, selectedId, onSelect, visibleIds, expandedId,
}: {
  skill: SkillTree; color: string; selectedId: string | null;
  onSelect: (n: SkillNode) => void; visibleIds: Set<string>; expandedId: string | null;
}) {
  return (
    <g>
      {skill.nodes.map((node, i) => {
        if (!node.position) return null;
        if (!visibleIds.has(node.id)) return null;

        const isRoot = !node.parentIds || node.parentIds.length === 0;
        const isMajor = node.isMajor;
        const isExpanded = isMajor && expandedId === node.id;
        const r = isRoot ? ROOT_R : isMajor ? MAJOR_R : CHILD_R;
        const isSelected = node.id === selectedId;
        const fontSize = isRoot ? 2.4 : isMajor ? 2.0 : 1.7;
        const lvFontSize = isRoot ? 1.6 : isMajor ? 1.4 : 1.2;

        return (
          <g key={node.id} transform={`translate(${node.position.x}, ${node.position.y})`}>
            <defs>
              <radialGradient id={`nodeGradient-${node.id}`} cx="40%" cy="35%">
                <stop offset="0%" stopColor={node.unlocked ? '#FFFFFF' : '#F1F5F9'} stopOpacity={0.9} />
                <stop offset="60%" stopColor={node.unlocked ? color : '#CBD5E1'} stopOpacity={0.7} />
                <stop offset="100%" stopColor={node.unlocked ? `${color}66` : '#E2E8F0'} />
              </radialGradient>
              <filter id={`glow-${node.id}`} x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation={isRoot ? 0.8 : isMajor ? 0.5 : 0.3} result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <motion.g
              custom={i}
              variants={nodeVariants}
              initial="hidden"
              animate="visible"
              onClick={() => onSelect(node)}
              className="cursor-pointer"
              filter={node.unlocked ? `url(#glow-${node.id})` : undefined}
            >
              {/* 选中脉冲环 */}
              {isSelected && (
                <circle r={r + 2.5} fill="none" stroke={color} strokeWidth="0.5" opacity={0.5}>
                  <animate attributeName="r" from={r + 2.5} to={r + 4.5} dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* 展开态光环（大技能展开后） */}
              {isExpanded && (
                <circle r={r + 4} fill="none" stroke={color} strokeWidth="0.3" opacity={0.4}
                  strokeDasharray="0.6 0.4"
                >
                  <animate attributeName="r" from={r + 3} to={r + 5} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0.1" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* 根节点外环 */}
              {isRoot && (
                <>
                  <circle r={r + 2} fill="none" stroke={color} strokeWidth="0.3" opacity={0.25} />
                  <circle r={r + 3.5} fill="none" stroke={color} strokeWidth="0.15" opacity={0.12}
                    strokeDasharray="0.5 1"
                  />
                </>
              )}

              {/* 大技能装饰环 */}
              {isMajor && (
                <circle r={r + 1.2} fill="none" stroke={color} strokeWidth="0.3" opacity={0.35}
                  strokeDasharray={isExpanded ? 'none' : '0.8 0.5'}
                />
              )}

              {/* 主体圆 — 带高光立体感 */}
              <circle r={r} fill={`url(#nodeGradient-${node.id})`}
                stroke={node.unlocked ? color : '#94A3B8'}
                strokeWidth={isSelected ? 1.2 : isMajor ? 0.8 : 0.5}
              />
              {/* 高光点 */}
              {node.unlocked && (
                <circle cx={-r * 0.3} cy={-r * 0.3} r={r * 0.35} fill="white" opacity={0.45} />
              )}

              {/* 展开指示器（大技能未展开时显示小箭头） */}
              {isMajor && !isExpanded && (
                <g transform={`translate(0, ${-(r + 2)})`}>
                  <path d="M-1.5,0 L0,-2 L1.5,0" fill="none" stroke={color} strokeWidth="0.4"
                    strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
                </g>
              )}

              {/* 名称 */}
              <text y={r + 2.8} textAnchor="middle" fontSize={fontSize}
                fill={node.unlocked ? '#1E293B' : '#94A3B8'}
                fontWeight={isRoot || isMajor ? 'bold' : 'normal'}
                className="select-none pointer-events-none"
                style={{ textShadow: node.unlocked ? '0 0 3px rgba(255,255,255,0.6)' : undefined } as any}
              >
                {node.name}
              </text>
              {/* 等级 */}
              <text y={r + 4.6} textAnchor="middle" fontSize={lvFontSize}
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

// ── 装饰性背景元素 ──
function DecorativeBackground({ color }: { color: string }) {
  // 在同心圆交点上放置装饰点
  const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  return (
    <g opacity={0.3}>
      {[15, 30, 45, 60, 75].map((r, ri) =>
        angles.map((angle, ai) => {
          const rad = (angle * Math.PI) / 180;
          const x = 50 + r * Math.cos(rad);
          const y = 50 + r * Math.sin(rad);
          const size = ri === 0 ? 0.15 : ri === 1 ? 0.12 : ri === 2 ? 0.1 : 0.08;
          return (
            <circle key={`dot-${ri}-${ai}`} cx={x} cy={y} r={size}
              fill={ri % 2 === 0 ? color : '#94A3B8'} opacity={0.25 + ri * 0.04} />
          );
        })
      )}
    </g>
  );
}

// ── 主组件 ──
export function SkillTreeView({ skill, color, onBack, backgroundImage }: SkillTreeViewProps) {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  // 手风琴模式：同一时间只展开一个大技能
  const [expandedMajorId, setExpandedMajorId] = useState<string | null>(null);
  const expPercent = skill.maxExp > 0 ? (skill.exp / skill.maxExp) * 100 : 0;

  const handleNodeClick = useCallback((node: SkillNode) => {
    if (node.isMajor) {
      setExpandedMajorId((prev) => prev === node.id ? null : node.id);
    }
    setSelectedNode(node);
  }, []);

  // 计算可见节点
  const visibleIds = new Set<string>();
  for (const node of skill.nodes) {
    if (isNodeVisible(node, skill.nodes, expandedMajorId)) {
      visibleIds.add(node.id);
    }
  }

  return (
    <motion.div
      layoutId={`skill-card-${skill.id}`}
      className="flex flex-col h-full rounded-2xl overflow-hidden border border-slate-200/80 bg-white/90 shadow-lg"
    >
      {/* 顶部返回栏 */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100 bg-white/70 shrink-0">
        <button type="button" onClick={onBack}
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
              <div className="h-full rounded-full"
                style={{ width: `${expPercent}%`, background: `linear-gradient(90deg, ${color}, ${color}AA)` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-number">{skill.exp}/{skill.maxExp}</span>
          </div>
        </div>
      </div>

      {/* SVG 画布区 */}
      <div className="flex-1 relative min-h-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${color}08 0%, transparent 70%)`,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full"
          style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined, backgroundSize: 'cover' }}
        >
          <defs>
            {/* 连线渐变 */}
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.7} />
              <stop offset="50%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={`${color}88`} stopOpacity={0.3} />
            </linearGradient>
            {/* 背景径向渐变 */}
            <radialGradient id="bgRadial">
              <stop offset="0%" stopColor={color} stopOpacity={0.06} />
              <stop offset="50%" stopColor={color} stopOpacity={0.03} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </radialGradient>
          </defs>

          {/* 背景柔光 */}
          <circle cx={50} cy={50} r={50} fill="url(#bgRadial)" />

          {/* 装饰性背景点阵 */}
          <DecorativeBackground color={color} />

          {/* 同心圆参考线 */}
          {[15, 30, 45, 60, 75].map((r) => (
            <circle key={r} cx={50} cy={50} r={r} fill="none"
              stroke={r === 45 ? `${color}20` : 'rgba(203,213,225,0.2)'}
              strokeWidth={r === 45 ? 0.4 : 0.2}
              strokeDasharray="0.8 1.5"
            />
          ))}

          {/* 连线 + 星座点 + 节点 */}
          <TreeLines skill={skill} visibleIds={visibleIds} color={color} />
          <ConstellationDots skill={skill} visibleIds={visibleIds} />
          <TreeCircles skill={skill} color={color} selectedId={selectedNode?.id ?? null}
            onSelect={handleNodeClick} visibleIds={visibleIds} expandedId={expandedMajorId}
          />
        </svg>

        <SkillNodeDetail node={selectedNode} color={color} />
      </div>
    </motion.div>
  );
}
