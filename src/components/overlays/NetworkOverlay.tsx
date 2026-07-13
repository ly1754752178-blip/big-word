/**
 * NetworkOverlay — 关系网络
 * 单人不框 / 多人统一框 + 线连框不连人 / 头像上文字回退置底
 */
import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { useGame } from '@/hooks/useGameState';
import { getAvatarSrc } from '@/components/ui/AvatarImg';
import type { Character } from '@/types';

const relMeta: Record<string, { label: string; color: string }> = {
  school:   { label: '同学',   color: '#E8A87C' },
  work:     { label: '同事',   color: '#64B5F6' },
  neighbor: { label: '邻居',   color: '#81C784' },
  interest: { label: '同好',   color: '#F48FB1' },
};

const VW = 800, VH = 520, CX = 400, CY = 260;
const NODE_R = 26;
const FRAME_H = 116;

const C = {
  bg: '#FDFAF5', card: '#FFFBF7', border: '#E8DFD3',
  txt: '#4A3728', sub: '#8B7560', dim: '#B8A898',
};

interface G { key: string; label: string; color: string; members: Character[]; }

function sname(n: string, max = 4) { return n.length > max ? n.slice(0, max) + '…' : n; }

export function NetworkOverlay() {
  const { state } = useGame();
  const { characters } = state;
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(false);
  const dr = useRef({ sx: 0, sy: 0, px: 0, py: 0 });
  const panRef = useRef(pan);
  const ctrRef = useRef<HTMLDivElement>(null);

  useEffect(() => { panRef.current = pan; }, [pan]);

  // ── 分组 ──
  const groups: G[] = useMemo(() => {
    const m = new Map<string, Character[]>();
    for (const c of characters) { const l = m.get(c.socialCircle) || []; l.push(c); m.set(c.socialCircle, l); }
    return Array.from(m.entries()).filter(([, v]) => v.length > 0).map(([k, v]) => ({
      key: k, label: relMeta[k]?.label ?? k, color: relMeta[k]?.color ?? '#B8A898', members: v,
    }));
  }, [characters]);

  // ── 布局 ──
  const layout = useMemo(() => {
    const total = groups.length;
    if (total === 0) return { frames: [] as any[], singles: [] as any[], nodeMap: new Map<string, { x: number; y: number; c: string }>() };

    const frames: any[] = [];
    const singles: any[] = [];
    const nodeMap = new Map<string, { x: number; y: number; c: string }>();

    // 将单人和多人分开编号以保证角度均匀
    const indexed: { g: G; multi: boolean }[] = groups.map(g => ({ g, multi: g.members.length >= 2 }));
    const n = indexed.length;

    indexed.forEach(({ g, multi }, gi) => {
      const angle = (Math.PI * 2 * gi) / n - Math.PI / 2;
      const dist = n === 1 ? 0 : 175;
      const fcx = CX + Math.cos(angle) * dist;
      const fcy = CY + Math.sin(angle) * dist;

      if (!multi) {
        // 单人：直接放节点，无线框
        singles.push({ key: g.key, color: g.color, x: fcx, y: fcy });
        nodeMap.set(g.members[0].id, { x: fcx, y: fcy, c: g.color });
      } else {
        // 多人：放框 + 框内节点
        const m = g.members.length;
        const STEP = 72; // 节点间距
        const fw = m * STEP + 40;
        const fh = FRAME_H;
        frames.push({ key: g.key, label: g.label, color: g.color, cx: fcx, cy: fcy, w: fw, h: fh });

        const totalW = (m - 1) * STEP;
        const sx = fcx - totalW / 2;
        g.members.forEach((c, mi) => {
          nodeMap.set(c.id, { x: sx + mi * STEP, y: fcy - 12, c: g.color });
        });
      }
    });

    return { frames, singles, nodeMap };
  }, [groups]);

  const { frames, singles, nodeMap } = layout;

  // ── 滚轮 ──
  useEffect(() => {
    const el = ctrRef.current; if (!el) return;
    const h = (e: WheelEvent) => { e.preventDefault(); e.stopPropagation(); setScale(z => Math.max(0.3, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1)))); };
    el.addEventListener('wheel', h, { passive: false });
    return () => el.removeEventListener('wheel', h);
  }, []);

  const onMD = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; e.preventDefault(); setDrag(true);
    dr.current = { sx: e.clientX, sy: e.clientY, px: panRef.current.x, py: panRef.current.y };
  }, []);

  useEffect(() => {
    if (!drag) return;
    const mm = (e: MouseEvent) => setPan({ x: dr.current.px + e.clientX - dr.current.sx, y: dr.current.py + e.clientY - dr.current.sy });
    const mu = () => setDrag(false);
    window.addEventListener('mousemove', mm); window.addEventListener('mouseup', mu);
    return () => { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu); };
  }, [drag]);

  return (
    <div className="w-full h-full min-h-[520px] flex flex-col" style={{ background: C.bg }}>
      {/* 图例 */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-t-2xl"
        style={{ background: C.card, borderBottom: `1.5px solid ${C.border}` }}>
        <div className="flex flex-wrap items-center gap-4">
          {groups.map(g => (
            <div key={g.key} className="flex items-center gap-2 text-sm font-medium" style={{ color: C.sub }}>
              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: g.color }} />
              {g.label}
              <span className="text-xs" style={{ color: C.dim }}>({g.members.length})</span>
            </div>
          ))}
        </div>
        <span className="text-xs" style={{ color: C.dim }}>滚轮缩放 · 拖拽 · {Math.round(scale * 100)}%</span>
      </div>

      {/* 画布 */}
      <div className="flex-1 min-h-0 m-2 rounded-b-2xl overflow-hidden"
        style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderTop: 'none' }}>
        <div ref={ctrRef} className="w-full h-full"
          style={{ background: `radial-gradient(ellipse at 50% 45%, ${C.card} 0%, ${C.bg} 70%)`, cursor: drag ? 'grabbing' : 'grab' }}
          onMouseDown={onMD}>
          <svg width="100%" height="100%" viewBox={`0 0 ${VW} ${VH}`}
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: 'center', transition: drag ? 'none' : 'transform 0.15s ease-out' }}>
            <defs>
              <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#8B7355" floodOpacity={0.1} />
              </filter>
            </defs>

            {/* ── 多人框 + 最短路径连线 ── */}
            {frames.map(f => {
              // 计算框边距中心最近的点
              const fl = f.cx - f.w / 2, fr = f.cx + f.w / 2;
              const ft = f.cy - f.h / 2, fb = f.cy + f.h / 2;
              const tx = Math.max(fl, Math.min(fr, CX));
              const ty = Math.max(ft, Math.min(fb, CY));
              return (
                <g key={`f-${f.key}`}>
                  <line x1={CX} y1={CY} x2={tx} y2={ty}
                    stroke={f.color} strokeWidth="2" opacity={0.35} strokeLinecap="round" />
                  <rect x={fl} y={ft} width={f.w} height={f.h} rx="14"
                    fill={C.card} stroke={f.color} strokeWidth="2" filter="url(#sh)" />
                  <rect x={fl + 14} y={ft - 11}
                    width={f.label.length * 15 + 24} height="22" rx="7" fill={f.color} />
                  <text x={fl + 14 + (f.label.length * 15 + 24) / 2} y={ft + 4}
                    textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">{f.label}</text>
                </g>
              );
            })}

            {/* ── 单人：直接连线 ── */}
            {singles.map(s => {
              const c = groups.find(g => g.key === s.key)?.members[0];
              if (!c) return null;
              return (
                <line key={`sl-${s.key}`} x1={CX} y1={CY} x2={s.x} y2={s.y}
                  stroke={s.color} strokeWidth="2" opacity={hoverId === c.id ? 0.6 : 0.32} strokeLinecap="round" />
              );
            })}

            {/* 中心"我" */}
            <circle cx={CX} cy={CY} r="40" fill="rgba(196,149,58,0.05)" />
            <circle cx={CX} cy={CY} r="28" fill="#C4953A" stroke="white" strokeWidth="3" filter="url(#sh)" />
            <text x={CX} y={CY + 5} textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">我</text>

            {/* ── 角色节点 ── */}
            {characters.map(c => {
              const pos = nodeMap.get(c.id);
              if (!pos) return null;
              const dn = sname(c.name);
              return (
                <g key={c.id} transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseEnter={() => setHoverId(c.id)}
                  onMouseLeave={() => setHoverId(null)}
                  className="cursor-pointer">

                  {/* 底圆 */}
                  <circle r={NODE_R} fill={C.card} stroke={pos.c} strokeWidth="2.8" filter="url(#sh)" />

                  {/* 文字回退 — 在 foreignObject 之前，头像盖住它 */}
                  <text y="3" textAnchor="middle" fontSize="17" fill={C.dim} fontWeight="bold"
                    style={{ pointerEvents: 'none' }}>{c.name.slice(0, 1)}</text>

                  {/* 头像 — 在文字之后，盖住回退文字 */}
                  <foreignObject x={-NODE_R} y={-NODE_R} width={NODE_R * 2} height={NODE_R * 2}>
                    <div style={{ width: NODE_R * 2, height: NODE_R * 2, borderRadius: '50%', overflow: 'hidden' }}>
                      <img src={getAvatarSrc(c.name)} alt={c.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  </foreignObject>

                  {/* 名称 */}
                  <text y={NODE_R + 14} textAnchor="middle" fontSize="12" fill={C.txt} fontWeight="bold"
                    style={{ pointerEvents: 'none' }}>{dn}</text>

                  {/* 好感度 */}
                  <text y={NODE_R + 26} textAnchor="middle" fontSize="10" fill={C.sub} fontWeight="600"
                    style={{ pointerEvents: 'none' }}>♥{c.affection}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
