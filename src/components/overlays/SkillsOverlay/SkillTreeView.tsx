/**
 * SkillTreeView — 星座技能树全景面板
 * 深色宇宙背景 + 发光连线 + 六边形节点 + 浮动详情卡片
 */
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { SkillTree, SkillNode } from '@/types';
import { SkillNodeDetail } from './SkillNodeDetail';

// ── 常量 ──
const VIEW = 160;
const CX = VIEW / 2, CY = VIEW / 2;
const ROOT_R = 3.5;
const MAJOR_R = 3.2;
const CHILD_R = 2.2;
const ORBIT_R = 20;

// ── 六边形顶点 ──
function hexPts(r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return `${(r + 2.5) * Math.cos(a)},${(r + 2.5) * Math.sin(a)}`;
  }).join(' ');
}

// ── 大技能图标 ──
function MajorGlyph({ idx, r, color }: { idx: number; r: number; color: string }) {
  const s = r * 0.85;
  switch (idx) {
    case 0: return <path d={`M0,${-s} Q${s},${-s * 0.3} 0,${s} Q${-s},${-s * 0.3} 0,${-s}Z`} fill={color} opacity={0.55} />;
    case 1: return <path d={`M${-s * 0.3},${-s} L${s * 0.5},${s} M${s * 0.5},${-s} L${s},${s * 0.3}`} stroke={color} strokeWidth="0.5" opacity={0.6} strokeLinecap="round" />;
    case 2: return <path d={`M0,${-s} Q${s * 0.6},${-s * 0.1} ${s * 0.3},${s * 0.3} Q${s * 0.2},${-s * 0.1} 0,${s} Q${-s * 0.2},${-s * 0.1} ${-s * 0.3},${s * 0.3} Q${-s * 0.6},${-s * 0.1} 0,${-s}Z`} fill={color} opacity={0.5} />;
    case 3: return <>{[0, 1, 2].map(i => <circle key={i} cx={(i - 1) * s * 0.55} cy={0} r={s * 0.22} fill={color} opacity={0.55} />)}</>;
    case 4: return <><path d={`M${-s * 0.6},${-s * 0.4} Q0,${-s} ${s * 0.6},${-s * 0.4}`} fill="none" stroke={color} strokeWidth="0.45" opacity={0.6} /><line x1={-s * 0.6} y1={-s * 0.4} x2={-s * 0.9} y2={-s * 0.9} stroke={color} strokeWidth="0.35" opacity={0.45} /><line x1={s * 0.6} y1={-s * 0.4} x2={s * 0.9} y2={-s * 0.9} stroke={color} strokeWidth="0.35" opacity={0.45} /></>;
    case 5: return <polygon points={Array.from({ length: 10 }, (_, i) => { const a = (Math.PI * 2 * i) / 10 - Math.PI / 2; const rad = i % 2 === 0 ? s : s * 0.4; return `${rad * Math.cos(a)},${rad * Math.sin(a)}`; }).join(' ')} fill={color} opacity={0.5} />;
    case 6: return <><circle cx={0} cy={0} r={s * 0.5} fill="none" stroke={color} strokeWidth="0.5" opacity={0.55} /><circle cx={0} cy={0} r={s * 0.18} fill={color} opacity={0.5} /></>;
    default: return null;
  }
}

// ── 子节点弧形布局 ──
function childPos(parent: { x: number; y: number }, idx: number, total: number) {
  const dx = parent.x - CX, dy = parent.y - CY;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const dirX = dx / dist, dirY = dy / dist;
  const perpX = -dirY, perpY = dirX;
  const arc = Math.min(1.5, total * 0.22);
  const t = total <= 1 ? 0.5 : idx / (total - 1);
  const angle = (t - 0.5) * arc;
  const rowDist = idx % 2 === 0 ? ORBIT_R : ORBIT_R * 1.3;
  return {
    x: +(parent.x + dirX * rowDist + perpX * Math.sin(angle) * 26).toFixed(1),
    y: +(parent.y + dirY * rowDist + perpY * Math.sin(angle) * 26).toFixed(1),
  };
}

// ── 可见性判断 ──
function visible(node: SkillNode, all: SkillNode[], expanded: string | null): boolean {
  if (!node.parentIds?.length) return true;
  for (const pid of node.parentIds) {
    const p = all.find(n => n.id === pid);
    if (p?.isMajor) return expanded === pid;
  }
  return true;
}

// ═══════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════
export function SkillTreeView({ skill, color }: { skill: SkillTree; color: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ sx: 0, sy: 0, px: 0, py: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 大技能索引
  const majorIdx = useMemo(() => {
    const m = new Map<string, number>();
    let i = 0;
    for (const n of skill.nodes) if (n.isMajor) m.set(n.id, i++);
    return m;
  }, [skill.nodes]);

  // 选中节点
  const selNode = useMemo(() => skill.nodes.find(n => n.id === selectedId) ?? null, [skill.nodes, selectedId]);

  // 计算子节点位置并归入可见列表
  const positionedNodes = useMemo(() => {
    const result = skill.nodes.map(n => ({ ...n, pos: n.position ?? null }));
    // 为无 position 的子节点计算位置
    for (const n of result) {
      if (!n.pos && n.parentIds?.length) {
        const p = result.find(pn => pn.id === n.parentIds![0]);
        if (p?.pos) {
          const siblings = result.filter(s => s.parentIds?.includes(p.id) && !s.isMajor);
          const idx = siblings.findIndex(s => s.id === n.id);
          n.pos = childPos(p.pos, idx, siblings.length);
        }
      }
    }
    return result;
  }, [skill.nodes]);

  const visibleIds = useMemo(() => {
    const s = new Set<string>();
    for (const n of positionedNodes) {
      if (visible(n, positionedNodes, expandedId)) s.add(n.id);
    }
    return s;
  }, [positionedNodes, expandedId]);

  // 缩放 / 拖拽
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault(); e.stopPropagation();
    setZoom(z => Math.max(0.35, Math.min(2.8, z + (e.deltaY > 0 ? -0.08 : 0.08))));
  }, []);
  const onMDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
  }, [pan]);
  const onMMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({ x: dragRef.current.px + e.clientX - dragRef.current.sx, y: dragRef.current.py + e.clientY - dragRef.current.sy });
  }, [dragging]);
  const onMUp = useCallback(() => setDragging(false), []);
  useEffect(() => { const h = () => setDragging(false); window.addEventListener('mouseup', h); return () => window.removeEventListener('mouseup', h); }, []);

  // 点击节点
  const onSelect = useCallback((node: SkillNode) => {
    if (node.isMajor) setExpandedId(prev => prev === node.id ? null : node.id);
    setSelectedId(prev => prev === node.id ? null : node.id);
  }, []);

  return (
    <div className="flex flex-col h-full relative">
      {/* 画布 */}
      <div
        ref={containerRef}
        className="flex-1 relative min-h-0 overflow-hidden select-none"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${color}0D 0%, #0B0B15 70%)`,
          cursor: dragging ? 'grabbing' : 'grab',
        }}
        onWheel={onWheel} onMouseDown={onMDown} onMouseMove={onMMove} onMouseUp={onMUp} onMouseLeave={onMUp}
      >
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="w-full h-full"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center',
            transition: dragging ? 'none' : 'transform 0.12s ease-out',
          }}
        >
          <defs>
            {/* 连线渐变 */}
            <linearGradient id="gl" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={color} stopOpacity={0.7} /><stop offset="100%" stopColor={`${color}66`} stopOpacity={0.2} /></linearGradient>
            {/* 节点发光滤镜 */}
            <filter id="gf" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="0.8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            {/* 粒子散射 */}
            <radialGradient id="particle" cx="50%" cy="50%"><stop offset="0%" stopColor={color} stopOpacity={0.5} /><stop offset="100%" stopColor={color} stopOpacity={0} /></radialGradient>
          </defs>

          {/* 宇宙背景粒子 */}
          {Array.from({ length: 40 }).map((_, i) => {
            const px = (i * 37 + 13) % VIEW;
            const py = (i * 53 + 7) % VIEW;
            return <motion.circle key={`bg-${i}`} cx={px} cy={py} r={0.15 + (i % 3) * 0.1}
              fill={color} opacity={0.15 + (i % 5) * 0.04}
              animate={{ opacity: [0.1, 0.25, 0.1] }}
              transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
            />;
          })}

          {/* 同心参考轨道 */}
          {[30, 55, 80, 105].map(r => (
            <circle key={`orb-${r}`} cx={CX} cy={CY} r={r} fill="none" stroke={`${color}10`} strokeWidth="0.15" strokeDasharray="1 3" />
          ))}

          {/* ── 连线 ── */}
          <g>
            {positionedNodes.filter(n => n.pos && n.parentIds?.length).map(n => {
              const parent = positionedNodes.find(pn => pn.id === n.parentIds![0]);
              const npos = n.pos!;
              const ppos = parent?.pos;
              if (!ppos || !visibleIds.has(n.id) || !visibleIds.has(parent!.id)) return null;
              const lit = n.unlocked && parent!.unlocked;
              return (
                <g key={`line-${parent!.id}-${n.id}`}>
                  {lit && <line x1={ppos.x} y1={ppos.y} x2={npos.x} y2={npos.y} stroke={color} strokeWidth="0.9" opacity="0.08" strokeLinecap="round" />}
                  <line x1={ppos.x} y1={ppos.y} x2={npos.x} y2={npos.y}
                    stroke={lit ? 'url(#gl)' : '#ffffff10'} strokeWidth={lit ? "0.4" : "0.2"}
                    strokeDasharray={lit ? undefined : "2 3"} strokeLinecap="round" />
                  {lit && (
                    <motion.circle cx={(ppos.x + npos.x) / 2} cy={(ppos.y + npos.y) / 2} r={0.4}
                      fill="#FDE68A" opacity={0.6}
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* ── 节点 ── */}
          <g>
            {positionedNodes.map((node) => {
              if (!node.pos || !visibleIds.has(node.id)) return null;
              const { x, y } = node.pos;
              const isRoot = !node.parentIds?.length;
              const isMajor = !!node.isMajor;
              const r = isRoot ? ROOT_R : isMajor ? MAJOR_R : CHILD_R;
              const isSel = node.id === selectedId;
              const isExp = node.id === expandedId;
              const idx = majorIdx.get(node.id) ?? 0;

              return (
                <g key={node.id} transform={`translate(${x}, ${y})`}>
                  {/* 六边形主体（根+大节点） */}
                  {(isRoot || isMajor) && (
                    <motion.polygon
                      points={hexPts(isRoot ? r * 1.1 : r)}
                      fill={node.unlocked ? `${color}18` : '#ffffff08'}
                      stroke={node.unlocked ? color : '#ffffff20'}
                      strokeWidth={isSel ? "0.7" : "0.4"}
                      filter={node.unlocked ? 'url(#gf)' : undefined}
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="cursor-pointer"
                      onClick={() => onSelect(node)}
                    >
                      {isExp && (
                        <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite" />
                      )}
                    </motion.polygon>
                  )}

                  {/* 圆形主体（小节点） */}
                  {!isRoot && !isMajor && (
                    <motion.circle
                      r={r}
                      fill={node.unlocked ? `url(#particle)` : '#ffffff08'}
                      stroke={node.unlocked ? color : '#ffffff20'}
                      strokeWidth={isSel ? "0.6" : "0.3"}
                      filter={node.unlocked ? 'url(#gf)' : undefined}
                      whileHover={{ scale: 1.15 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="cursor-pointer"
                      onClick={() => onSelect(node)}
                    />
                  )}

                  {/* 选中脉冲 */}
                  {isSel && (
                    <circle r={r + 3} fill="none" stroke={color} strokeWidth="0.3" opacity={0.3}>
                      <animate attributeName="r" from={r + 2} to={r + 5} dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* 展开呼吸环 */}
                  {isExp && (
                    <circle r={r + 4} fill="none" stroke={color} strokeWidth="0.2" opacity={0.3} strokeDasharray="0.5 0.5">
                      <animate attributeName="r" from={r + 3} to={r + 6} dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.3" to="0.05" dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* 大/根节点图标 */}
                  {(isRoot || isMajor) && (
                    isRoot ? (
                      <text fontSize="3.5" textAnchor="middle" dy="0.35em" fill={color} opacity={0.6} className="pointer-events-none" style={{ fontFamily: 'serif' }}>◆</text>
                    ) : (
                      <MajorGlyph idx={idx} r={r} color={node.unlocked ? color : '#ffffff30'} />
                    )
                  )}

                  {/* 名称 */}
                  <text y={r + 2.5} textAnchor="middle"
                    fontSize={isRoot ? 2.5 : isMajor ? 2.0 : 1.8}
                    fill={node.unlocked ? '#CBD5E1' : '#475569'}
                    fontWeight={isRoot || isMajor ? 600 : 400}
                    className="pointer-events-none select-none"
                    style={{ fontFamily: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif' }}
                  >
                    {node.name}
                  </text>

                  {/* 等级 */}
                  <text y={r + 4.2} textAnchor="middle"
                    fontSize={isRoot ? 1.5 : isMajor ? 1.3 : 1.2}
                    fill={node.unlocked ? '#64748B' : '#334155'}
                    className="pointer-events-none select-none"
                    style={{ fontFamily: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif' }}
                  >
                    Lv.{node.level}/{node.maxLevel}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* 浮动详情卡片 */}
        {selNode && (() => {
          const p = positionedNodes.find(n => n.id === selNode.id);
          const pos = p?.pos;
          if (!pos) return null;
          const leftPct = (pos.x / VIEW) * 100;
          const topPct = (pos.y / VIEW) * 100;
          return (
            <SkillNodeDetail
              node={selNode}
              color={color}
              position={{ x: leftPct, y: topPct }}
              onClose={() => setSelectedId(null)}
            />
          );
        })()}
      </div>
    </div>
  );
}
