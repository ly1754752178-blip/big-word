/**
 * SkillTreeView — 技能树（头部与画布同宽 + 暖色手帐风格）
 */
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { SkillTree } from '@/types';
import { generateSnowflakeLayout, type LayoutNode } from '@/lib/skillTreeLayout';
import { SkillNodeDetail } from './SkillNodeDetail';

const V = 200, CX = 100, CY = 100;
const ROOT_R = 5.5, MAJOR_R = 4.2, CHILD_R = 3.2, LEAF_W = 2.2;

const BG1 = '#FDF8F2', BG2 = '#F5EDE0';
const PAPER_LINE = 'rgba(180,160,140,0.2)';
const INK = '#8B7355';

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
}

export function SkillTreeView({ skill, color }: Props) {
  const [selId, setSelId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
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
  const { nodes, bounds } = useMemo(() => {
    return generateSnowflakeLayout(skill.nodes, expandedIds);
  }, [skill.nodes, expandedIds]);

  const selNode = useMemo(() => nodes.find(n => n.id === selId) ?? null, [nodes, selId]);

  // ── 聚焦 ──
  const panTo = useCallback((tx: number, ty: number) => {
    const canvas = canvasRef.current;
    const { w } = containerSizeRef.current;
    const unitPx = w / V;
    const zoom = zoomRef.current;
    if (!canvas) {
      panTarget.current = {
        x: w * 0.5 - tx * unitPx * zoom,
        y: containerSizeRef.current.h * 0.5 - ty * unitPx * zoom,
      };
      return;
    }
    const rect = canvas.getBoundingClientRect();
    // 计算画布当前在视口中的可视区域中心
    const vLeft = Math.max(0, rect.left);
    const vRight = Math.min(window.innerWidth, rect.right);
    const vTop = Math.max(0, rect.top);
    const vBottom = Math.min(window.innerHeight, rect.bottom);
    const cx = (vLeft + vRight) / 2;
    const cy = (vTop + vBottom) / 2;
    // 让目标节点(tx,ty)位于可视区域中心
    panTarget.current = {
      x: cx - rect.left - tx * unitPx * zoom,
      y: cy - rect.top - ty * unitPx * zoom,
    };
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

  const onSelect = useCallback((node: LayoutNode) => {
    const hasChildren = skill.nodes.some(n => n.parentIds?.[0] === node.id);
    if (hasChildren) {
      setExpandedIds(prev => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          // 收起该节点及其所有后代
          const toRemove = new Set<string>();
          const collect = (id: string) => {
            toRemove.add(id);
            skill.nodes.filter(n => n.parentIds?.[0] === id).forEach(child => collect(child.id));
          };
          collect(node.id);
          for (const id of toRemove) next.delete(id);
        } else {
          next.add(node.id);
        }
        return next;
      });
    }
    setSelId(prev => (prev === node.id ? null : node.id));
    if (node.pos) panTo(node.pos.x, node.pos.y);
  }, [skill.nodes, panTo]);

  // ── 初始视图自适应：让所有节点完整可见并居中 ──
  useEffect(() => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const w = rect?.width || containerSizeRef.current.w;
    const h = rect?.height || containerSizeRef.current.h;
    if (!w || !h) return;

    const bw = bounds.maxX - bounds.minX;
    const bh = bounds.maxY - bounds.minY;
    if (bw <= 0 || bh <= 0) return;

    const pad = 22; // 边距，避免节点贴边
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;

    // SVG 已由浏览器按 viewBox 0 0 200 200 缩放到容器（w × h），即 1 viewBox 单位 = w/200 px。
    // 整体缩放系数 zoom 在 CSS transform 中作为 scale(zoom) 使用。
    const unitPx = w / V;
    const targetZoom = Math.min(
      w / (bw * unitPx + pad * 2),
      h / (bh * unitPx + pad * 2)
    );

    const timer = setTimeout(() => {
      setZoom(targetZoom);
      // translate 在 scale 之前应用，因此以 viewBox 单位直接偏移即可
      setPan({
        x: w * 0.5 - cx * unitPx * targetZoom,
        y: h * 0.5 - cy * unitPx * targetZoom,
      });
    }, 80);
    return () => clearTimeout(timer);
  }, [bounds]);

  // ── 渲染 ──
  return (
    <div className="flex flex-col h-full relative">
      {/* 技能树画布 —— 填满弹窗内容区，无卡片边框 */}
      <div
        className="flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(170deg, ${BG1} 0%, ${BG2} 50%, #EDE3D5 100%)`,
        }}
      >
        <div
          ref={canvasRef}
          className="relative w-full h-full select-none"
          style={{
            cursor: drag ? 'grabbing' : 'grab',
          }}
          onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
          onDoubleClick={onDbl}
        >
          <svg viewBox={`0 0 ${V} ${V}`} className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
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

            {/* 连线：单一直线 */}
            <g>
              {nodes.map(node => {
                if (!node.parentIds?.length) return null;
                const parent = nodes.find(n => n.id === node.parentIds?.[0]);
                if (!parent?.pos || !node.pos) return null;
                const lit = node.unlocked && parent.unlocked;
                return (
                  <line
                    key={`line-${node.id}`}
                    x1={parent.pos.x}
                    y1={parent.pos.y}
                    x2={node.pos.x}
                    y2={node.pos.y}
                    stroke={lit ? INK : 'rgba(180,160,140,0.25)'}
                    strokeWidth={lit ? '0.6' : '0.3'}
                    strokeDasharray={lit ? undefined : '2 4'}
                    strokeLinecap="round"
                  />
                );
              })}
            </g>

            {/* 节点 */}
            <g>
              {nodes.map((node, i) => {
                if (!node.pos) return null;
                const { x, y } = node.pos;
                const isR = node.depth === 0;
                const r = isR ? ROOT_R : node.depth === 1 ? MAJOR_R : node.depth === 2 ? CHILD_R : LEAF_W;
                const fontSize = isR ? 2.4 : node.depth === 1 ? 2.0 : node.depth === 2 ? 1.8 : 1.5;
                const fontWeight = isR || node.depth === 1 ? 700 : 500;
                const levelFontSize = isR ? 1.4 : node.depth === 1 ? 1.2 : 1.0;
                const sel = node.id === selId;
                const exp = expandedIds.has(node.id);
                const pal = nodePalette[i % nodePalette.length];
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
                      fontSize={fontSize}
                      fill={node.unlocked ? '#5D4037' : '#A89880'}
                      fontWeight={fontWeight}
                      className="pointer-events-none select-none"
                      style={{ fontFamily: '"Noto Serif SC","PingFang SC","Microsoft YaHei",serif' }}>
                      {node.name}
                    </text>
                    <text y={r + 4.5} textAnchor="middle"
                      fontSize={levelFontSize}
                      fill={node.unlocked ? '#8D6E63' : '#B8A898'}
                      className="pointer-events-none select-none">
                      Lv.{node.level}/{node.maxLevel}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      <SkillNodeDetail skill={skill} node={selNode} color={color} onClose={() => setSelId(null)} />
    </div>
  );
}
