import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { SkillTree, SkillNode } from '@/types';
import { nodeVariants } from './node-animations';
import { SkillNodeDetail } from './SkillNodeDetail';

interface SkillTreeViewProps {
  skill: SkillTree;
  color: string;
}

// ── 画布与布局常量 ──
const VIEW_SIZE = 160;
const CENTER = { x: VIEW_SIZE / 2, y: VIEW_SIZE / 2 };
const CHILD_RADIUS = 20;

// ── 节点尺寸 ──
const ROOT_R = 3.5;
const MAJOR_R = 2.8;
const CHILD_R = 2.2;

// ── 子节点弧形扇开布局 ──
function computeChildPosition(
  parentPos: { x: number; y: number },
  index: number,
  total: number,
): { x: number; y: number } {
  const dx = parentPos.x - CENTER.x;
  const dy = parentPos.y - CENTER.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const dirX = dist > 0 ? dx / dist : 0;
  const dirY = dist > 0 ? dy / dist : -1;
  const perpX = -dirY;
  const perpY = dirX;

  // 扇形角度：根据子节点数量自适应
  const arcAngle = Math.min(1.6, total * 0.25);
  const t = total <= 1 ? 0.5 : index / (total - 1);
  const angle = (t - 0.5) * arcAngle;

  // 径向距离：错落式——奇偶行交替
  const rowDist = index % 2 === 0 ? CHILD_RADIUS : CHILD_RADIUS * 1.25;

  return {
    x: +(parentPos.x + dirX * rowDist + perpX * Math.sin(angle) * 22).toFixed(1),
    y: +(parentPos.y + dirY * rowDist + perpY * Math.sin(angle) * 22).toFixed(1),
  };
}

// ── 判断节点是否可见 ──
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

// ── 大技能节点：统一六边形 + 内部图案 ──
function hexPoints(r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return `${(r + 2.2) * Math.cos(a)},${(r + 2.2) * Math.sin(a)}`;
  }).join(' ');
}

/** 大技能节点内部图标（7种简单 SVG 图案） */
function MajorIcon({ idx, r, color }: { idx: number; r: number; color: string }) {
  const s = r * 0.9; // 图标缩放
  switch (idx) {
    case 0: // 食材处理 —— 叶子
      return <path d={`M0,${-s} Q${s},${-s * 0.3} 0,${s} Q${-s},${-s * 0.3} 0,${-s}Z`} fill={color} opacity={0.35} />;
    case 1: // 刀工 —— 斜刀
      return <path d={`M${-s * 0.4},${-s} L${s * 0.6},${s} M${s * 0.4},${-s} L${s},${s * 0.2}`} stroke={color} strokeWidth="0.45" opacity={0.45} />;
    case 2: // 火候 —— 火焰
      return <path d={`M0,${-s} Q${s * 0.6},${-s * 0.2} ${s * 0.4},${s * 0.3} Q${s * 0.2},${-s * 0.1} 0,${s} Q${-s * 0.2},${-s * 0.1} ${-s * 0.4},${s * 0.3} Q${-s * 0.6},${-s * 0.2} 0,${-s}Z`} fill={color} opacity={0.3} />;
    case 3: // 调味 —— 圆点阵
      return <>{[0, 1, 2].map(i => <circle key={i} cx={(i - 1) * s * 0.6} cy={0} r={s * 0.25} fill={color} opacity={0.4} />)}</>;
    case 4: // 烹饪工艺 —— 锅形
      return <>
        <path d={`M${-s * 0.7},${-s * 0.5} Q0,${-s * 1.1} ${s * 0.7},${-s * 0.5}`} fill="none" stroke={color} strokeWidth="0.4" opacity={0.5} />
        <line x1={-s * 0.7} y1={-s * 0.5} x2={-s * 0.9} y2={-s} stroke={color} strokeWidth="0.3" opacity={0.35} />
        <line x1={s * 0.7} y1={-s * 0.5} x2={s * 0.9} y2={-s} stroke={color} strokeWidth="0.3" opacity={0.35} />
      </>;
    case 5: // 口感 —— 星形
      return <polygon points={Array.from({ length: 10 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 10 - Math.PI / 2;
        const rad = i % 2 === 0 ? s : s * 0.45;
        return `${rad * Math.cos(a)},${rad * Math.sin(a)}`;
      }).join(' ')} fill={color} opacity={0.3} />;
    case 6: // 面点 —— 麦穗/圆形
      return <>
        <circle cx={0} cy={0} r={s * 0.55} fill="none" stroke={color} strokeWidth="0.4" opacity={0.45} />
        <circle cx={0} cy={0} r={s * 0.2} fill={color} opacity={0.3} />
      </>;
    default: return null;
  }
}

// ── 连线 ──
function TreeLines({ skill, visibleIds, color }: { skill: SkillTree; visibleIds: Set<string>; color: string }) {
  return (
    <g>
      {/* 发光层 */}
      {skill.nodes.map((node) =>
        (node.parentIds ?? []).map((pid) => {
          const parent = skill.nodes.find((n) => n.id === pid);
          if (!parent?.position || !node.position) return null;
          if (!visibleIds.has(node.id) || !visibleIds.has(pid)) return null;
          if (!node.unlocked || !parent.unlocked) return null;
          return (
            <line key={`glow-${pid}-${node.id}`}
              x1={parent.position.x} y1={parent.position.y}
              x2={node.position.x} y2={node.position.y}
              stroke={color} strokeWidth={1.5} opacity={0.12} strokeLinecap="round"
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
              opacity={unlocked ? 0.75 : 0.3} strokeLinecap="round"
            />
          );
        })
      )}
    </g>
  );
}

// ── 星座星光 ──
function ConstellationDots({ skill, visibleIds }: { skill: SkillTree; visibleIds: Set<string> }) {
  const dots: { x: number; y: number; unlocked: boolean }[] = [];
  for (const node of skill.nodes) {
    for (const pid of node.parentIds ?? []) {
      const parent = skill.nodes.find((n) => n.id === pid);
      if (!parent?.position || !node.position) continue;
      if (!visibleIds.has(node.id) || !visibleIds.has(pid)) continue;
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
          <circle r={0.3} fill={d.unlocked ? '#FCD34D' : '#CBD5E1'} opacity={d.unlocked ? 0.85 : 0.25} />
          <circle r={0.18} fill="#FFF" opacity={d.unlocked ? 0.55 : 0} />
        </g>
      ))}
    </g>
  );
}

// ── 装饰背景 ──
function DecorativeBackground({ color }: { color: string }) {
  const rings = [20, 40, 60, 75];
  const dotsPerRing = [8, 12, 16, 20];
  return (
    <g opacity={0.22}>
      {rings.map((r, ri) =>
        Array.from({ length: dotsPerRing[ri] }, (_, i) => {
          const angle = (Math.PI * 2 * i) / dotsPerRing[ri];
          return (
            <circle key={`d-${ri}-${i}`}
              cx={CENTER.x + r * Math.cos(angle)} cy={CENTER.y + r * Math.sin(angle)}
              r={0.12 + ri * 0.03} fill={ri % 2 ? '#94A3B8' : color}
              opacity={0.15 + ri * 0.07}
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
  majorOrder,
}: {
  skill: SkillTree; color: string; selectedId: string | null;
  onSelect: (n: SkillNode) => void; visibleIds: Set<string>; expandedId: string | null;
  majorOrder: Map<string, number>;
}) {
  return (
    <g>
      {skill.nodes.map((node, i) => {
        // 运行时计算子节点位置
        let pos = node.position;
        if (!pos && node.parentIds && node.parentIds.length > 0) {
          const parent = skill.nodes.find((n) => n.id === node.parentIds![0]);
          if (parent?.position) {
            const siblings = skill.nodes.filter((n) =>
              n.parentIds?.includes(parent.id)
            );
            const idx = siblings.indexOf(node);
            pos = computeChildPosition(parent.position, idx, siblings.length);
          }
        }
        if (!pos) return null;
        if (!visibleIds.has(node.id)) return null;

        const isRoot = !node.parentIds || node.parentIds.length === 0;
        const isMajor = node.isMajor;
        const isExpanded = isMajor && expandedId === node.id;
        const r = isRoot ? ROOT_R : isMajor ? MAJOR_R : CHILD_R;
        const isSelected = node.id === selectedId;
        const fontSize = isRoot ? 2.6 : isMajor ? 2.2 : 2.0;
        const lvFontSize = isRoot ? 1.7 : isMajor ? 1.5 : 1.4;

        // 大技能形状索引
        const shapeIdx = isMajor ? (majorOrder.get(node.id) ?? 0) : -1;

        return (
          <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
            <defs>
              <radialGradient id={`nodeGradient-${node.id}`} cx="38%" cy="32%">
                <stop offset="0%" stopColor={node.unlocked ? '#FFFFFF' : '#F1F5F9'} stopOpacity={0.95} />
                <stop offset="55%" stopColor={node.unlocked ? color : '#CBD5E1'} stopOpacity={0.7} />
                <stop offset="100%" stopColor={node.unlocked ? `${color}55` : '#E2E8F0'} />
              </radialGradient>
              <filter id={`glow-${node.id}`} x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation={isRoot ? 0.9 : isMajor ? 0.6 : 0.35} result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
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
              {/* 大技能六边形（实心主体） */}
              {isMajor && (
                <>
                  <polygon points={hexPoints(r)}
                    fill={node.unlocked ? `${color}22` : '#F1F5F9'}
                    stroke={node.unlocked ? color : '#94A3B8'} strokeWidth="0.5" />
                  <MajorIcon idx={shapeIdx} r={r} color={node.unlocked ? color : '#94A3B8'} />
                </>
              )}

              {/* 选中脉冲 */}
              {isSelected && (
                <circle r={r + 2.5} fill="none" stroke={color} strokeWidth="0.5" opacity={0.5}>
                  <animate attributeName="r" from={r + 2.5} to={r + 4.5} dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* 展开呼吸环 */}
              {isExpanded && (
                <circle r={r + 4.5} fill="none" stroke={color} strokeWidth="0.3" opacity={0.4}
                  strokeDasharray="0.6 0.4">
                  <animate attributeName="r" from={r + 3.5} to={r + 5.5} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0.1" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* 根节点装饰环 */}
              {isRoot && (
                <>
                  <circle r={r + 2.5} fill="none" stroke={color} strokeWidth="0.3" opacity={0.22} />
                  <circle r={r + 4} fill="none" stroke={color} strokeWidth="0.15" opacity={0.1}
                    strokeDasharray="0.6 1.2" />
                </>
              )}


              {/* 主体球（大技能六边形不渲染圆形） */}
              {!isMajor && (
                <circle r={r} fill={`url(#nodeGradient-${node.id})`}
                  stroke={node.unlocked ? color : '#94A3B8'}
                  strokeWidth={isSelected ? 1.2 : 0.5}
                />
              )}
              {/* 高光 */}
              {node.unlocked && (
                <circle cx={-r * 0.3} cy={-r * 0.3} r={r * 0.35} fill="white" opacity={0.45} />
              )}

              {/* 名称 */}
              <text y={r + 3} textAnchor="middle" fontSize={fontSize}
                fill={node.unlocked ? '#1E293B' : '#94A3B8'}
                fontWeight={isRoot || isMajor ? 'bold' : 'normal'}
                className="select-none pointer-events-none"
              >
                {node.name}
              </text>
              {/* 等级 */}
              <text y={r + 5} textAnchor="middle" fontSize={lvFontSize}
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
export function SkillTreeView({ skill, color }: SkillTreeViewProps) {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [expandedMajorId, setExpandedMajorId] = useState<string | null>(null);
  // 缩放与平移
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // 构建大技能顺序映射
  const majorOrder = new Map<string, number>();
  let majorIdx = 0;
  for (const node of skill.nodes) {
    if (node.isMajor) {
      majorOrder.set(node.id, majorIdx++);
    }
  }

  const handleNodeClick = useCallback((node: SkillNode) => {
    if (node.isMajor) {
      setExpandedMajorId((prev) => prev === node.id ? null : node.id);
    }
    setSelectedNode(node);
  }, []);

  // ── 缩放（滚轮）──
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((z) => Math.max(0.4, Math.min(2.5, z + delta)));
  }, []);

  // ── 拖拽（鼠标）──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = pan;
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  // 全局 mouseup 监听：确保即使鼠标在组件外释放，拖拽状态也能正确重置
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDragging(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      // 卸载时确保拖拽状态重置，防止光标样式残留
      setDragging(false);
    };
  }, []);

  // 计算可见节点
  const visibleIds = new Set<string>();
  for (const node of skill.nodes) {
    if (isNodeVisible(node, skill.nodes, expandedMajorId)) {
      visibleIds.add(node.id);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* SVG 画布区——填满整个空间 */}
      <div
        ref={svgContainerRef}
        className="flex-1 relative min-h-0 overflow-hidden select-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${color}11 0%, transparent 70%)`,
          cursor: dragging ? 'grabbing' : 'grab',
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
          className="w-full h-full"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
            transition: dragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.7} />
              <stop offset="50%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={`${color}88`} stopOpacity={0.3} />
            </linearGradient>
            <radialGradient id="bgRadial">
              <stop offset="0%" stopColor={color} stopOpacity={0.05} />
              <stop offset="50%" stopColor={color} stopOpacity={0.02} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </radialGradient>
          </defs>

          {/* 背景柔光 */}
          <circle cx={CENTER.x} cy={CENTER.y} r={VIEW_SIZE / 2} fill="url(#bgRadial)" />

          {/* 装饰背景点阵 */}
          <DecorativeBackground color={color} />

          {/* 同心圆参考轨道 */}
          {[20, 40, 60, 75, 90, 105].map((r) => (
            <circle key={r} cx={CENTER.x} cy={CENTER.y} r={r} fill="none"
              stroke={r === 60 ? `${color}18` : 'rgba(203,213,225,0.15)'}
              strokeWidth={r === 60 ? 0.4 : 0.2}
              strokeDasharray="0.8 1.8"
            />
          ))}

          <TreeLines skill={skill} visibleIds={visibleIds} color={color} />
          <ConstellationDots skill={skill} visibleIds={visibleIds} />
          <TreeCircles skill={skill} color={color} selectedId={selectedNode?.id ?? null}
            onSelect={handleNodeClick} visibleIds={visibleIds} expandedId={expandedMajorId}
            majorOrder={majorOrder}
          />
        </svg>

        <SkillNodeDetail node={selectedNode} color={color} />
      </div>
    </div>
  );
}
