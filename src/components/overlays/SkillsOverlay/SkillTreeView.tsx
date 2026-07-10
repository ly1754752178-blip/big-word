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
const ROOT_R = 2.5;
const MAJOR_R = 2;
const CHILD_R = 1.5;

/** 判断节点是否应该可见 */
function isNodeVisible(node: SkillNode, allNodes: SkillNode[], expandedIds: Set<string>): boolean {
  // 根节点始终可见
  if (!node.parentIds || node.parentIds.length === 0) return true;
  // 父节点是大技能且已展开 → 可见
  for (const pid of node.parentIds) {
    const parent = allNodes.find((n) => n.id === pid);
    if (parent?.isMajor && expandedIds.has(pid)) return true;
    // 如果父节点也是某个大技能的子节点，递归向上检查
    if (parent && !parent.isMajor && (parent.parentIds?.length ?? 0) > 0) {
      // 非大技能的子节点：只要其最顶层大技能祖先展开了就可见
      let ancestor = parent;
      while (ancestor.parentIds && ancestor.parentIds.length > 0) {
        const grandParent = allNodes.find((n) => n.id === ancestor.parentIds![0]);
        if (!grandParent) break;
        if (grandParent.isMajor) return expandedIds.has(grandParent.id);
        ancestor = grandParent;
      }
    }
  }
  // 父节点不是大技能 → 始终可见（旧版兼容）
  if (node.parentIds.length > 0) {
    const parent = allNodes.find((n) => n.id === node.parentIds![0]);
    if (parent && !parent.isMajor) return true;
  }
  return false;
}

// ── 连线 ──
function TreeLines({ skill, visibleIds }: { skill: SkillTree; visibleIds: Set<string> }) {
  return (
    <g>
      {skill.nodes.map((node) =>
        (node.parentIds ?? []).map((pid) => {
          const parent = skill.nodes.find((n) => n.id === pid);
          if (!parent?.position || !node.position) return null;
          // 仅当两端节点均可见时才画线
          if (!visibleIds.has(node.id) || !visibleIds.has(pid)) return null;
          const unlocked = node.unlocked && parent.unlocked;
          return (
            <line
              key={`${pid}-${node.id}`}
              x1={parent.position.x} y1={parent.position.y}
              x2={node.position.x} y2={node.position.y}
              stroke={unlocked ? 'url(#lineGradient)' : '#CBD5E1'}
              strokeWidth={unlocked ? 0.5 : 0.3}
              strokeDasharray={unlocked ? 'none' : '2 2'}
              opacity={unlocked ? 0.65 : 0.3}
            />
          );
        })
      )}
    </g>
  );
}

// ── 节点圆 ──
function TreeCircles({
  skill, color, selectedId, onSelect, visibleIds,
}: {
  skill: SkillTree; color: string; selectedId: string | null;
  onSelect: (n: SkillNode) => void; visibleIds: Set<string>;
}) {
  return (
    <g>
      {skill.nodes.map((node, i) => {
        if (!node.position) return null;
        if (!visibleIds.has(node.id)) return null;

        const isRoot = !node.parentIds || node.parentIds.length === 0;
        const isMajor = node.isMajor;
        const r = isRoot ? ROOT_R : isMajor ? MAJOR_R : CHILD_R;
        const isSelected = node.id === selectedId;
        const fontSize = isRoot ? 2.2 : isMajor ? 1.9 : 1.6;
        const lvFontSize = isRoot ? 1.5 : isMajor ? 1.3 : 1.1;

        return (
          <g key={node.id} transform={`translate(${node.position.x}, ${node.position.y})`}>
            <defs>
              <radialGradient id={`nodeGradient-${node.id}`}>
                <stop offset="0%" stopColor={node.unlocked ? color : '#CBD5E1'} />
                <stop offset="100%" stopColor={node.unlocked ? `${color}88` : '#E2E8F0'} />
              </radialGradient>
            </defs>

            <motion.g
              custom={i}
              variants={nodeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => onSelect(node)}
              className="cursor-pointer"
            >
              {/* 选中脉冲 */}
              {isSelected && (
                <circle r={r + 2} fill="none" stroke={color} strokeWidth="0.6" opacity={0.5}>
                  <animate attributeName="r" from={r + 2} to={r + 4} dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              {/* 根节点光环 */}
              {isRoot && node.unlocked && (
                <circle r={r + 1.5} fill="none" stroke={color} strokeWidth="0.25" opacity={0.3} />
              )}
              {/* 大技能虚线环 */}
              {isMajor && (
                <circle r={r + 1} fill="none" stroke={color} strokeWidth="0.25" strokeDasharray="1 0.5" opacity={0.4} />
              )}
              {/* 主体 */}
              <circle
                r={r}
                fill={node.unlocked ? `url(#nodeGradient-${node.id})` : '#E2E8F0'}
                stroke={node.unlocked ? color : '#94A3B8'}
                strokeWidth={isSelected ? 1 : isMajor ? 0.6 : 0.4}
              />
              {/* 名称 */}
              <text y={r + 2.5} textAnchor="middle" fontSize={fontSize}
                fill={node.unlocked ? '#1E293B' : '#94A3B8'}
                fontWeight={isRoot || isMajor ? 'bold' : 'normal'}
                className="select-none pointer-events-none"
              >
                {node.name}
              </text>
              {/* 等级 */}
              <text y={r + 4.2} textAnchor="middle" fontSize={lvFontSize}
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

// ── 主组件 ──
export function SkillTreeView({ skill, color, onBack, backgroundImage }: SkillTreeViewProps) {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [expandedMajorIds, setExpandedMajorIds] = useState<Set<string>>(new Set());
  const expPercent = skill.maxExp > 0 ? (skill.exp / skill.maxExp) * 100 : 0;

  const handleNodeClick = useCallback((node: SkillNode) => {
    if (node.isMajor) {
      // 大技能节点：切换折叠/展开
      setExpandedMajorIds((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        return next;
      });
    }
    // 同时选中该节点以显示详情
    setSelectedNode(node);
  }, []);

  // 计算可见节点 ID 集合
  const visibleIds = new Set<string>();
  for (const node of skill.nodes) {
    if (isNodeVisible(node, skill.nodes, expandedMajorIds)) {
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
      <div className="flex-1 relative min-h-0">
        <svg viewBox="0 0 100 100" className="w-full h-full"
          style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined, backgroundSize: 'cover' }}
        >
          {/* 同心圆参考线 */}
          {[15, 30, 45, 60, 75].map((r) => (
            <circle key={r} cx={50} cy={50} r={r} fill="none"
              stroke="rgba(203,213,225,0.25)" strokeWidth="0.25" strokeDasharray="1 1"
            />
          ))}

          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={`${color}88`} stopOpacity={0.35} />
            </linearGradient>
          </defs>

          <TreeLines skill={skill} visibleIds={visibleIds} />
          <TreeCircles skill={skill} color={color} selectedId={selectedNode?.id ?? null}
            onSelect={handleNodeClick} visibleIds={visibleIds}
          />
        </svg>

        <SkillNodeDetail node={selectedNode} color={color} />
      </div>
    </motion.div>
  );
}
