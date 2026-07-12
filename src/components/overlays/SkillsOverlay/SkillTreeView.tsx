/**
 * SkillTreeView — 星座技能树
 * 深空背景 + 发光连线 + 六边形大节点 + 浮动详情
 */
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { SkillTree, SkillNode } from '@/types';
import { SkillNodeDetail } from './SkillNodeDetail';

// ── 常量 ──
const V = 160, CX = 80, CY = 80;
const ROOT_R = 3.5, MAJOR_R = 3.0, CHILD_R = 2.2;
const ORBIT_R = 18;

// ── 六边形 ──
function hxPts(r: number, pad = 2.0): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return `${(r + pad) * Math.cos(a)},${(r + pad) * Math.sin(a)}`;
  }).join(' ');
}

// ── 子节点弧扇布局 ──
function childPos(p: { x: number; y: number }, idx: number, total: number) {
  const dx = p.x - CX, dy = p.y - CY, dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const dxn = dx / dist, dyn = dy / dist;
  const px = -dyn, py = dxn;
  const arc = Math.min(1.5, total * 0.22);
  const t = total <= 1 ? 0.5 : idx / (total - 1);
  const angle = (t - 0.5) * arc;
  const rd = idx % 2 === 0 ? ORBIT_R : ORBIT_R * 1.25;
  return {
    x: +(p.x + dxn * rd + px * Math.sin(angle) * 24).toFixed(1),
    y: +(p.y + dyn * rd + py * Math.sin(angle) * 24).toFixed(1),
  };
}

// ── 可见性 ──
function isVis(n: SkillNode, all: SkillNode[], exp: string | null): boolean {
  if (!n.parentIds?.length) return true;
  for (const pid of n.parentIds) {
    const p = all.find(an => an.id === pid);
    if (p?.isMajor) return exp === pid;
  }
  return true;
}

// ── 大技能内部图标 ──
function Glyph({ idx, r, color }: { idx: number; r: number; color: string }) {
  const s = r * 0.8;
  switch (idx % 7) {
    case 0: return <path d={`M0,${-s} Q${s},${-s * 0.3} 0,${s} Q${-s},${-s * 0.3} 0,${-s}Z`} fill={color} opacity={0.5} />;
    case 1: return <path d={`M${-s * 0.3},${-s} L${s * 0.5},${s} M${s * 0.5},${-s} L${s},${s * 0.3}`} stroke={color} strokeWidth="0.5" opacity={0.55} strokeLinecap="round" />;
    case 2: return <path d={`M0,${-s} Q${s * 0.6},${-s * 0.1} ${s * 0.3},${s * 0.3} Q0,0 0,${s} Q0,0 ${-s * 0.3},${s * 0.3} Q${-s * 0.6},${-s * 0.1} 0,${-s}Z`} fill={color} opacity={0.45} />;
    case 3: return <>{[0, 1, 2].map(i => <circle key={i} cx={(i - 1) * s * 0.5} cy={0} r={s * 0.2} fill={color} opacity={0.5} />)}</>;
    case 4: return <path d={`M${-s * 0.6},${-s * 0.4} Q0,${-s} ${s * 0.6},${-s * 0.4}`} fill="none" stroke={color} strokeWidth="0.45" opacity={0.55} />;
    case 5: return <polygon points={Array.from({ length: 10 }, (_, i) => { const a = (Math.PI * 2 * i) / 10 - Math.PI / 2; const rad = i % 2 === 0 ? s : s * 0.4; return `${rad * Math.cos(a)},${rad * Math.sin(a)}`; }).join(' ')} fill={color} opacity={0.45} />;
    case 6: return <circle cx={0} cy={0} r={s * 0.45} fill="none" stroke={color} strokeWidth="0.5" opacity={0.5} />;
    default: return null;
  }
}

// ══════════════════════════════════
export function SkillTreeView({ skill, color, onBack }: { skill: SkillTree; color: string; onBack: () => void }) {
  const [selId, setSelId] = useState<string | null>(null);
  const [expId, setExpId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(false);
  const dr = useRef({ sx: 0, sy: 0, px: 0, py: 0 });

  // 节点位置
  const nodes = useMemo(() => {
    const res = skill.nodes.map(n => ({ ...n, pos: n.position ?? null as { x: number; y: number } | null }));
    for (const n of res) {
      if (!n.pos && n.parentIds?.length) {
        const p = res.find(pn => pn.id === n.parentIds![0]);
        if (p?.pos) {
          const sibs = res.filter(s => s.parentIds?.includes(p.id) && !s.isMajor);
          n.pos = childPos(p.pos, sibs.findIndex(s => s.id === n.id), sibs.length);
        }
      }
    }
    return res;
  }, [skill.nodes]);

  const visibleIds = useMemo(() => {
    const s = new Set<string>();
    for (const n of nodes) if (isVis(n, nodes, expId)) s.add(n.id);
    return s;
  }, [nodes, expId]);

  const selNode = useMemo(() => nodes.find(n => n.id === selId) ?? null, [nodes, selId]);
  const majorIdx = useMemo(() => { const m = new Map<string, number>(); let i = 0; for (const n of nodes) if (n.isMajor) m.set(n.id, i++); return m; }, [nodes]);

  // 交互
  const onZoom = useCallback((e: React.WheelEvent) => { e.preventDefault(); setZoom(z => Math.max(0.35, Math.min(2.8, z + (e.deltaY > 0 ? -0.08 : 0.08)))); }, []);
  const onMD = useCallback((e: React.MouseEvent) => { if (e.button !== 0) return; setDrag(true); dr.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y }; }, [pan]);
  const onMM = useCallback((e: React.MouseEvent) => { if (!drag) return; setPan({ x: dr.current.px + e.clientX - dr.current.sx, y: dr.current.py + e.clientY - dr.current.sy }); }, [drag]);
  const onMU = useCallback(() => setDrag(false), []);
  useEffect(() => { const h = () => setDrag(false); window.addEventListener('mouseup', h); return () => window.removeEventListener('mouseup', h); }, []);

  const onSelect = useCallback((node: SkillNode) => {
    if (node.isMajor) setExpId(p => p === node.id ? null : node.id);
    setSelId(p => p === node.id ? null : node.id);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* 顶部栏 — 返回 + 标题 */}
      <header className="flex items-center gap-3 px-4 py-3 shrink-0">
        <button id="skill-tree-back" onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={16} className="text-white/60" />
        </button>
        <div>
          <h3 className="font-bold text-sm text-white"
            style={{ fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>
            {skill.name}
          </h3>
          <p className="text-[10px] text-white/30"
            style={{ fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>
            Lv.{skill.level}/{skill.maxLevel} · EXP {skill.exp}/{skill.maxExp} · 技能点 {skill.skillPoints}
          </p>
        </div>
        <span className="ml-auto text-[10px] text-white/20">🖱️ 滚轮缩放 · 拖拽平移 · {Math.round(zoom * 100)}%</span>
      </header>

      {/* 画布 */}
      <div id="skill-tree-canvas"
        className="flex-1 relative min-h-0 overflow-hidden select-none"
        style={{ background: `radial-gradient(ellipse at 50% 40%, ${color}0D 0%, #0A0A14 70%)`, cursor: drag ? 'grabbing' : 'grab' }}
        onWheel={onZoom} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}>
        <svg viewBox={`0 0 ${V} ${V}`} className="w-full h-full"
          style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, transformOrigin: 'center', transition: drag ? 'none' : 'transform 0.12s ease-out' }}>
          <defs>
            <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={color} stopOpacity={0.7} /><stop offset="100%" stopColor={`${color}66`} stopOpacity={0.2} /></linearGradient>
            <filter id="gf" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="0.7" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <radialGradient id={`ng-${skill.id}`} cx="38%" cy="32%"><stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.95} /><stop offset="55%" stopColor={color} stopOpacity={0.7} /><stop offset="100%" stopColor={`${color}55`} /></radialGradient>
            <radialGradient id={`ng-lock`} cx="38%" cy="32%"><stop offset="0%" stopColor="#F1F5F9" stopOpacity={0.95} /><stop offset="55%" stopColor="#CBD5E1" stopOpacity={0.7} /><stop offset="100%" stopColor="#E2E8F0" /></radialGradient>
          </defs>

          {/* 背景粒子 */}
          {Array.from({ length: 36 }).map((_, i) => {
            const px = (i * 47 + 11) % V, py = (i * 61 + 19) % V;
            return <motion.circle key={`bg-${i}`} cx={px} cy={py} r={0.12 + (i % 3) * 0.08}
              fill={color} opacity={0.1 + (i % 5) * 0.03}
              animate={{ opacity: [0.08, 0.22, 0.08] }}
              transition={{ duration: 2.5 + (i % 4), repeat: Infinity, delay: i * 0.25 }} />;
          })}

          {/* 轨道 */}
          {[30, 55, 80, 105].map(r => (
            <circle key={`orb-${r}`} cx={CX} cy={CY} r={r} fill="none" stroke={`${color}0D`} strokeWidth="0.15" strokeDasharray="1 3" />
          ))}

          {/* 连线 */}
          <g>
            {nodes.filter(n => n.pos && n.parentIds?.length).map(n => {
              const p = nodes.find(pn => pn.id === n.parentIds![0]);
              const np = n.pos!;
              if (!p?.pos || !visibleIds.has(n.id) || !visibleIds.has(p.id)) return null;
              const lit = n.unlocked && p.unlocked;
              return (
                <g key={`line-${p.id}-${n.id}`}>
                  {lit && <line x1={p.pos.x} y1={p.pos.y} x2={np.x} y2={np.y} stroke={color} strokeWidth="0.8" opacity="0.07" strokeLinecap="round" />}
                  <line x1={p.pos.x} y1={p.pos.y} x2={np.x} y2={np.y}
                    stroke={lit ? 'url(#lg)' : '#ffffff10'} strokeWidth={lit ? "0.35" : "0.18"}
                    strokeDasharray={lit ? undefined : "2 3"} strokeLinecap="round" />
                  {lit && <motion.circle cx={(p.pos.x + np.x) / 2} cy={(p.pos.y + np.y) / 2} r={0.35}
                    fill="#FDE68A" opacity={0.55} animate={{ opacity: [0.25, 0.65, 0.25] }}
                    transition={{ duration: 1.8, repeat: Infinity }} />}
                </g>
              );
            })}
          </g>

          {/* 节点 */}
          <g>
            {nodes.map(node => {
              if (!node.pos || !visibleIds.has(node.id)) return null;
              const { x, y } = node.pos;
              const isR = !node.parentIds?.length;
              const isM = !!node.isMajor;
              const r = isR ? ROOT_R : isM ? MAJOR_R : CHILD_R;
              const sel = node.id === selId;
              const exp = node.id === expId;
              const idx = majorIdx.get(node.id) ?? 0;

              return (
                <g key={node.id} id={`node-${node.id}`} transform={`translate(${x}, ${y})`}>
                  {/* 主体 */}
                  {isM ? (
                    <motion.polygon id={`node-body-${node.id}`}
                      points={hxPts(r)} fill={node.unlocked ? `url(#ng-${skill.id})` : `url(#ng-lock)`}
                      stroke={node.unlocked ? color : '#64748B'} strokeWidth={sel ? "0.7" : "0.4"}
                      filter={node.unlocked ? 'url(#gf)' : undefined}
                      whileHover={{ scale: 1.12 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      className="cursor-pointer" onClick={() => onSelect(node)} />
                  ) : (
                    <motion.circle id={`node-body-${node.id}`} r={r}
                      fill={node.unlocked ? `url(#ng-${skill.id})` : `url(#ng-lock)`}
                      stroke={node.unlocked ? color : '#64748B'} strokeWidth={sel ? "0.7" : "0.35"}
                      filter={node.unlocked ? 'url(#gf)' : undefined}
                      whileHover={{ scale: 1.15 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      className="cursor-pointer" onClick={() => onSelect(node)} />
                  )}

                  {/* 六边形内图标 */}
                  {isM && <Glyph idx={idx} r={r} color={node.unlocked ? color : '#64748B'} />}
                  {/* 根节点图标 */}
                  {isR && <text fontSize="3.2" textAnchor="middle" dy="0.3em" fill={color} opacity={0.55} className="pointer-events-none">◆</text>}

                  {/* 选中脉冲 */}
                  {sel && <circle r={r + 3} fill="none" stroke={color} strokeWidth="0.3" opacity={0.3}>
                    <animate attributeName="r" from={r + 2} to={r + 5} dur="1.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.35" to="0" dur="1.6s" repeatCount="indefinite" />
                  </circle>}

                  {/* 展开呼吸环 */}
                  {exp && <circle r={r + 4} fill="none" stroke={color} strokeWidth="0.2" opacity={0.25} strokeDasharray="0.5 0.5">
                    <animate attributeName="r" from={r + 3} to={r + 6} dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.25" to="0.04" dur="2.5s" repeatCount="indefinite" />
                  </circle>}

                  {/* 名称 */}
                  <text id={`node-label-${node.id}`} y={r + 2.6} textAnchor="middle"
                    fontSize={isR ? 2.4 : isM ? 2.0 : 1.8}
                    fill={node.unlocked ? '#CBD5E1' : '#475569'}
                    fontWeight={isR || isM ? 600 : 400}
                    className="pointer-events-none select-none"
                    style={{ fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>
                    {node.name}
                  </text>

                  {/* 等级 */}
                  <text id={`node-lv-${node.id}`} y={r + 4.3} textAnchor="middle"
                    fontSize={isR ? 1.4 : isM ? 1.25 : 1.1}
                    fill={node.unlocked ? '#64748B' : '#334155'}
                    className="pointer-events-none select-none"
                    style={{ fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>
                    Lv.{node.level}/{node.maxLevel}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* 浮动详情卡 */}
        {selNode && (() => {
          const pos = selNode.pos;
          if (!pos) return null;
          return (
            <SkillNodeDetail node={selNode} color={color}
              position={{ x: (pos.x / V) * 100, y: (pos.y / V) * 100 }}
              onClose={() => setSelId(null)} />
          );
        })()}
      </div>
    </div>
  );
}
