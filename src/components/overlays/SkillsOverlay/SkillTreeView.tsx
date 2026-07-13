/**
 * SkillTreeView — 技能树（头部与画布同宽 + 暖色手帐风格）
 */
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Maximize2 } from 'lucide-react';
import type { SkillTree, SkillNode } from '@/types';
import { SkillNodeDetail } from './SkillNodeDetail';

const V = 200, CX = 100, CY = 100;
const ROOT_R = 5.5, MAJOR_R = 4.2, CHILD_R = 3.2, LEAF_W = 2.2;
const ORBIT_R = 26;

const BG1 = '#FDF8F2', BG2 = '#F5EDE0';
const PAPER_LINE = 'rgba(180,160,140,0.2)';
const INK = '#8B7355';
const INK_LIGHT = '#B8A088';

function curvePath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
  const dx = to.x - from.x, dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const cx1 = mx - dy / dist * (dist * 0.15);
  const cy1 = my + dx / dist * (dist * 0.15);
  return `M${from.x},${from.y} Q${cx1},${cy1} ${to.x},${to.y}`;
}

function childPos(p: { x: number; y: number }, idx: number, total: number) {
  const dx = p.x - CX, dy = p.y - CY, dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const dxn = dx / dist, dyn = dy / dist;
  const px = -dyn, py = dxn;
  const arc = Math.min(1.6, total * 0.22);
  const t = total <= 1 ? 0.5 : idx / (total - 1);
  const angle = (t - 0.5) * arc;
  const rd = idx % 2 === 0 ? ORBIT_R : ORBIT_R * 1.35;
  return {
    x: +(p.x + dxn * rd + px * Math.sin(angle) * 30).toFixed(1),
    y: +(p.y + dyn * rd + py * Math.sin(angle) * 30).toFixed(1),
  };
}

function isVis(n: SkillNode, all: SkillNode[], expId: string | null): boolean {
  if (!n.parentIds?.length) return true;
  for (const pid of n.parentIds) {
    const p = all.find(an => an.id === pid);
    if (p?.isMajor) return expId === pid;
  }
  return true;
}

const nodePalette = [
  { fill: '#FDE8D0', stroke: '#E8A87C' },
  { fill: '#FCE4EC', stroke: '#F48FB1' },
  { fill: '#E8F5E9', stroke: '#81C784' },
  { fill: '#E3F2FD', stroke: '#64B5F6' },
  { fill: '#FFF3E0', stroke: '#FFB74D' },
  { fill: '#F3E5F5', stroke: '#BA68C8' },
  { fill: '#E0F7FA', stroke: '#4DD0E1' },
  { fill: '#F9FBE7', stroke: '#AED581' },
];

interface Props {
  skill: SkillTree;
  color: string;
  categoryLabel: string;
  categoryEmoji: string;
  onBack: () => void;
}

type NodeWithPos = SkillNode & { pos?: { x: number; y: number } | null; depth: number; paletteIdx: number };

export function SkillTreeView({ skill, color, categoryLabel, categoryEmoji, onBack }: Props) {
  const [selId, setSelId] = useState<string | null>(null);
  const [expId, setExpId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(false);
  const dr = useRef({ sx: 0, sy: 0, px: 0, py: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerSizeRef = useRef({ w: 620, h: 620 });
  const panTarget = useRef<{ x: number; y: number } | null>(null);
  const animFrame = useRef<number>(0);
  const zoomRef = useRef(zoom);

  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // ── 原生滚轮缩放 ──
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setZoom(z => Math.max(0.3, Math.min(3.0, z + (e.deltaY > 0 ? -0.1 : 0.1))));
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) containerSizeRef.current = { w: e.contentRect.width, h: e.contentRect.height };
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── 节点 ──
  const nodes: NodeWithPos[] = useMemo(() => {
    const raw = skill.nodes.map((n, i) => ({ ...n, depth: 0, paletteIdx: i % nodePalette.length }));
    const byId = new Map(raw.map(n => [n.id, n]));
    const calcDepth = (n: NodeWithPos): number => {
      if (!n.parentIds?.length) return 0;
      let max = 0;
      for (const pid of n.parentIds) { const p = byId.get(pid); if (p) max = Math.max(max, calcDepth(p) + 1); }
      return max;
    };
    for (const n of raw) n.depth = calcDepth(n);
    const res: NodeWithPos[] = raw.map(n => ({ ...n, pos: n.position as { x: number; y: number } | null }));
    const root = res.find(n => !n.parentIds?.length);
    if (root && !root.pos) root.pos = { x: CX, y: CY };
    const majors = res.filter(n => n.isMajor && n.depth <= 2);
    majors.forEach((n, i) => {
      if (!n.pos) {
        const angle = (Math.PI * 2 * i) / Math.max(1, majors.length) - Math.PI / 2;
        n.pos = { x: +(CX + Math.cos(angle) * 60).toFixed(1), y: +(CY + Math.sin(angle) * 60).toFixed(1) };
      }
    });
    for (const n of res) {
      if (n.pos || !n.parentIds?.length) continue;
      const p = res.find(pn => pn.id === n.parentIds![0]);
      if (!p?.pos) continue;
      const sibs = res.filter(s => s.parentIds?.includes(p.id) && !s.isMajor);
      n.pos = childPos(p.pos, sibs.findIndex(s => s.id === n.id), sibs.length);
    }
    return res;
  }, [skill.nodes]);

  const visibleIds = useMemo(() => {
    const s = new Set<string>();
    for (const n of nodes) if (isVis(n, nodes, expId)) s.add(n.id);
    return s;
  }, [nodes, expId]);

  const selNode = useMemo(() => nodes.find(n => n.id === selId) ?? null, [nodes, selId]);

  // ── 聚焦 ──
  const panTo = useCallback((tx: number, ty: number) => {
    const { w, h } = containerSizeRef.current;
    panTarget.current = { x: w * (0.5 - tx / V), y: h * (0.5 - ty / V) };
  }, []);

  useEffect(() => {
    if (!panTarget.current) return;
    let start: number | null = null;
    const sx = pan.x, sy = pan.y;
    const ex = panTarget.current.x, ey = panTarget.current.y;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min(1, (ts - start) / 500);
      const ease = 1 - Math.pow(1 - t, 3);
      setPan({ x: sx + (ex - sx) * ease, y: sy + (ey - sy) * ease });
      if (t < 1) animFrame.current = requestAnimationFrame(tick);
      else panTarget.current = null;
    };
    animFrame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame.current);
  }, [panTarget.current]); // eslint-disable-line

  const onMD = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setDrag(true);
    panTarget.current = null;
    dr.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
  }, [pan]);

  const onMM = useCallback((e: React.MouseEvent) => {
    if (!drag) return;
    setPan({ x: dr.current.px + e.clientX - dr.current.sx, y: dr.current.py + e.clientY - dr.current.sy });
  }, [drag]);

  const onMU = useCallback(() => setDrag(false), []);
  useEffect(() => { const h = () => setDrag(false); window.addEventListener('mouseup', h); return () => window.removeEventListener('mouseup', h); }, []);

  const onDbl = useCallback(() => {
    const root = nodes.find(n => !n.parentIds?.length);
    if (root?.pos) panTo(root.pos.x, root.pos.y);
  }, [nodes, panTo]);

  const onSelect = useCallback((node: NodeWithPos) => {
    if (node.isMajor) setExpId(p => p === node.id ? null : node.id);
    setSelId(p => p === node.id ? null : node.id);
    if (node.pos) panTo(node.pos.x, node.pos.y);
  }, [panTo]);

  useEffect(() => {
    const root = nodes.find(n => !n.parentIds?.length);
    if (root?.pos) {
      const timer = setTimeout(() => {
        const { w, h } = containerSizeRef.current;
        setPan({ x: w * (0.5 - root.pos!.x / V), y: h * (0.5 - root.pos!.y / V) });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line

  return (
    <div className="flex flex-col items-center h-full">
      {/* 头部信息栏 —— 与画布同宽 */}
      <div
        className="w-full max-w-[620px] shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-t-2xl"
        style={{ background: '#FFFBF7', border: '1.5px solid #E8DFD3', borderBottom: 'none' }}
      >
        <button onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-amber-50 transition-colors"
          style={{ background: '#FDFAF5', border: '1px solid #E8DFD3' }}>
          <ArrowLeft size={16} style={{ color: '#8B7560' }} />
        </button>
        <div>
          <h3 className="font-bold text-sm" style={{ color: '#4A3728' }}>
            {categoryEmoji} {categoryLabel} · {skill.name}
          </h3>
          <p className="text-[10px]" style={{ color: '#B8A898' }}>
            Lv.{skill.level}/{skill.maxLevel} · EXP {skill.exp}/{skill.maxExp} · 技能点 {skill.skillPoints}
          </p>
        </div>
        <button onClick={onDbl} className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center hover:bg-amber-50"
          title="回到中心"><Maximize2 size={12} style={{ color: '#B8A898' }} /></button>
        <span className="text-[10px] hidden sm:inline" style={{ color: '#D0C5B5' }}>
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* 正方形画布 */}
      <div className="flex-1 w-full max-w-[620px] flex items-center justify-center min-h-0">
        <div
          ref={canvasRef}
          className="relative w-full aspect-square select-none rounded-b-2xl overflow-hidden"
          style={{
            background: `linear-gradient(170deg, ${BG1} 0%, ${BG2} 50%, #EDE3D5 100%)`,
            border: '1.5px solid #E8DFD3',
            borderTop: 'none',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08), inset 0 0 60px rgba(180,140,100,0.05)',
            cursor: drag ? 'grabbing' : 'grab',
          }}
          onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
          onDoubleClick={onDbl}
        >
          <svg viewBox={`0 0 ${V} ${V}`} className="w-full h-full"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transformOrigin: 'center',
              transition: drag ? 'none' : 'transform 0.12s ease-out',
            }}>
            <defs>
              <radialGradient id="root-glow" cx="50%" cy="40%">
                <stop offset="0%" stopColor="#FFF8E1" stopOpacity={0.9} />
                <stop offset="40%" stopColor="#FFE0B2" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#FFCC80" stopOpacity={0.2} />
              </radialGradient>
              <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#8B7355" floodOpacity={0.2} />
              </filter>
            </defs>

            {/* 纸纹横线 */}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`paper-${i}`} x1={0} y1={i * 22 + 5} x2={V} y2={i * 22 + 5}
                stroke={PAPER_LINE} strokeWidth="0.15" />
            ))}

            {/* 装饰环 */}
            {[40, 70, 100].map(r => (
              <circle key={`deco-${r}`} cx={CX} cy={CY} r={r} fill="none"
                stroke="rgba(180,160,140,0.1)" strokeWidth="0.2" strokeDasharray="1 5" />
            ))}

            {/* 连线 */}
            <g>
              {nodes.filter(n => n.pos && n.parentIds?.length).map(n => {
                const p = nodes.find(pn => pn.id === n.parentIds![0]);
                if (!p?.pos || !visibleIds.has(n.id) || !visibleIds.has(p.id)) return null;
                const lit = n.unlocked && p.unlocked;
                const d = curvePath(p.pos, n.pos!);
                return (
                  <g key={`curve-${p.id}-${n.id}`}>
                    {lit && <path d={d} fill="none" stroke={INK_LIGHT} strokeWidth="1.8" opacity={0.1} strokeLinecap="round" />}
                    <path d={d} fill="none"
                      stroke={lit ? INK : 'rgba(180,160,140,0.2)'}
                      strokeWidth={lit ? '0.55' : '0.25'}
                      strokeDasharray={lit ? undefined : '3 5'} strokeLinecap="round" />
                    {lit && (
                      <motion.circle r={0.4} fill="#D4A853" opacity={0.5}
                        animate={{ opacity: [0.15, 0.55, 0.15] }}
                        transition={{ duration: 3, repeat: Infinity }}>
                        <animateMotion dur="4s" repeatCount="indefinite" path={d} />
                      </motion.circle>
                    )}
                  </g>
                );
              })}
            </g>

            {/* 节点 */}
            <g>
              {nodes.map(node => {
                if (!node.pos || !visibleIds.has(node.id)) return null;
                const { x, y } = node.pos;
                const isR = node.depth === 0;
                const isM = !!node.isMajor && !isR;
                const isLeaf = node.depth >= 3;
                const r = isR ? ROOT_R : isM ? MAJOR_R : isLeaf ? LEAF_W : CHILD_R;
                const sel = node.id === selId;
                const exp = node.id === expId;
                const pal = nodePalette[node.paletteIdx];
                const nFill = node.unlocked ? pal.fill : '#F5F0EB';
                const nStroke = node.unlocked ? pal.stroke : '#CCC0B5';

                return (
                  <g key={node.id} transform={`translate(${x}, ${y})`}>
                    {sel && (
                      <circle r={r + 5} fill="none" stroke="#D4A853" strokeWidth="0.6" opacity={0.35}>
                        <animate attributeName="r" from={r + 3} to={r + 7} dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.35" to="0" dur="1.8s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {exp && (
                      <circle r={r + 5} fill="none" stroke={nStroke} strokeWidth="0.4" opacity={0.3} strokeDasharray="0.8 1.2">
                        <animate attributeName="r" from={r + 3} to={r + 8} dur="3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.3" to="0.04" dur="3s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <motion.circle r={r}
                      fill={isR ? 'url(#root-glow)' : nFill}
                      stroke={isR ? '#D4A853' : nStroke}
                      strokeWidth={isR ? '0.7' : sel ? '0.6' : '0.45'}
                      filter="url(#soft-shadow)"
                      whileHover={{ scale: 1.15 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                      className="cursor-pointer"
                      onClick={() => onSelect(node)} />
                    {!node.unlocked && (
                      <text y="0.8" textAnchor="middle" fontSize="2.5" fill="#C0B0A0" className="pointer-events-none">🔒</text>
                    )}
                    {isR && node.unlocked && (
                      <text y="0.6" textAnchor="middle" fontSize="3.5" fill="#D4A853" className="pointer-events-none">✦</text>
                    )}
                    <text y={r + 2.8} textAnchor="middle"
                      fontSize={isR ? 2.4 : isM ? 2.0 : isLeaf ? 1.5 : 1.8}
                      fill={node.unlocked ? '#5D4037' : '#A89880'}
                      fontWeight={isR || isM ? 700 : 500}
                      className="pointer-events-none select-none"
                      style={{ fontFamily: '"Noto Serif SC","PingFang SC","Microsoft YaHei",serif' }}>
                      {node.name}
                    </text>
                    <text y={r + 4.5} textAnchor="middle"
                      fontSize={isR ? 1.4 : isM ? 1.2 : 1.0}
                      fill={node.unlocked ? '#8D6E63' : '#B8A898'}
                      className="pointer-events-none select-none">
                      Lv.{node.level}/{node.maxLevel}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {selNode && selNode.pos && (
            <SkillNodeDetail node={selNode} color={color}
              position={{ x: (selNode.pos.x / V) * 100, y: (selNode.pos.y / V) * 100 }}
              onClose={() => setSelId(null)} />
          )}
        </div>
      </div>
    </div>
  );
}
