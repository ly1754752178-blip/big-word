import { useState, useMemo } from 'react';
import { useGame } from '@/hooks/useGameState';
import type { Relation } from '@/types';

interface ViewState {
  x: number;
  y: number;
  scale: number;
}

function affinityColor(affinity: number): string {
  if (affinity >= 90) return '#E87A5D';
  if (affinity >= 75) return '#2DD4BF';
  if (affinity >= 60) return '#38BDF8';
  return '#9CA3AF';
}

export function NetworkOverlay() {
  const { state } = useGame();
  const { list } = state.relationships;

  const [showPlayerLines, setShowPlayerLines] = useState(true);
  const [showRelationLines, setShowRelationLines] = useState(true);
  const [hideUnrelated, setHideUnrelated] = useState(false);
  const [minAffinity, setMinAffinity] = useState(0);
  const [maxAffinity, setMaxAffinity] = useState(100);
  const [view, setView] = useState<ViewState>({ x: 0, y: 0, scale: 1 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const center = { x: 400, y: 280 };

  // 按 group 分组
  const grouped = useMemo(() => {
    const map = new Map<string, Relation[]>();
    list.forEach((r) => {
      if (r.affinity < minAffinity || r.affinity > maxAffinity) return;
      if (!map.has(r.group)) map.set(r.group, []);
      map.get(r.group)!.push(r);
    });
    return map;
  }, [list, minAffinity, maxAffinity]);

  // 计算节点位置：按 group 角度分布
  const nodes = useMemo(() => {
    const result: {
      relation: Relation;
      x: number;
      y: number;
      angle: number;
    }[] = [];
    const groups = Array.from(grouped.entries());
    const total = groups.reduce((sum, [, items]) => sum + items.length, 0);
    let currentAngle = 0;

    groups.forEach(([, items]) => {
      const groupAngle = (items.length / total) * Math.PI * 1.6;
      items.forEach((relation, idx) => {
        const angle = currentAngle + (groupAngle / Math.max(1, items.length)) * idx + groupAngle / items.length / 2;
        const distance = 180 + (relation.affinity % 30);
        result.push({
          relation,
          x: center.x + Math.cos(angle - Math.PI / 2) * distance,
          y: center.y + Math.sin(angle - Math.PI / 2) * distance,
          angle,
        });
      });
      currentAngle += groupAngle;
    });

    return result;
  }, [grouped, center.x, center.y]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, (typeof nodes)[0]>();
    nodes.forEach((n) => map.set(n.relation.id, n));
    return map;
  }, [nodes]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setView((v) => ({ ...v, scale: Math.max(0.5, Math.min(2, v.scale * delta)) }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - view.x, y: e.clientY - view.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setView((v) => ({ ...v, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <div className="w-full h-full min-h-[480px] flex flex-col">
      {/* 顶部过滤面板 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-soft/60 bg-white/40">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={showPlayerLines}
              onChange={(e) => setShowPlayerLines(e.target.checked)}
              className="rounded border-border-soft"
            />
            实线
          </label>
          <label className="flex items-center gap-1.5 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={showRelationLines}
              onChange={(e) => setShowRelationLines(e.target.checked)}
              className="rounded border-border-soft"
            />
            虚线
          </label>
          <label className="flex items-center gap-1.5 text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={hideUnrelated}
              onChange={(e) => setHideUnrelated(e.target.checked)}
              className="rounded border-border-soft"
            />
            隐藏无实线关系
          </label>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span>好感范围</span>
          <input
            type="number"
            value={minAffinity}
            onChange={(e) => setMinAffinity(Number(e.target.value))}
            className="w-12 px-1 py-0.5 rounded border border-border-soft text-center font-number text-text-primary bg-white/60"
          />
          <span>~</span>
          <input
            type="number"
            value={maxAffinity}
            onChange={(e) => setMaxAffinity(Number(e.target.value))}
            className="w-12 px-1 py-0.5 rounded border border-border-soft text-center font-number text-text-primary bg-white/60"
          />
        </div>
      </div>

      {/* 关系网络画布 */}
      <div
        className="flex-1 min-h-0 relative overflow-hidden bg-gradient-to-br from-social-pale/40 to-white cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 560"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* 分组框 */}
          {Array.from(grouped.entries()).map(([group, items]) => {
            const positions = items
              .map((r) => nodeMap.get(r.id))
              .filter(Boolean) as { x: number; y: number }[];
            if (positions.length === 0) return null;
            const minX = Math.min(...positions.map((p) => p.x)) - 40;
            const minY = Math.min(...positions.map((p) => p.y)) - 40;
            const maxX = Math.max(...positions.map((p) => p.x)) + 40;
            const maxY = Math.max(...positions.map((p) => p.y)) + 40;
            const width = maxX - minX;
            const height = maxY - minY;

            return (
              <g key={group}>
                <rect
                  x={minX}
                  y={minY}
                  width={width}
                  height={height}
                  rx="16"
                  fill="rgba(45,212,191,0.06)"
                  stroke="rgba(45,212,191,0.25)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={minX + width / 2}
                  y={minY + 14}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#2DD4BF"
                  fontWeight="bold"
                >
                  {group}
                </text>
              </g>
            );
          })}

          {/* 玩家到角色实线 */}
          {showPlayerLines &&
            nodes.map((node) => {
              const color = affinityColor(node.relation.affinity);
              return (
                <line
                  key={`player-${node.relation.id}`}
                  x1={center.x}
                  y1={center.y}
                  x2={node.x}
                  y2={node.y}
                  stroke={color}
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                />
              );
            })}

          {/* 角色之间虚线 */}
          {showRelationLines &&
            nodes.map((node, i) =>
              nodes.slice(i + 1).map((other) => {
                if (node.relation.group !== other.relation.group) return null;
                if (hideUnrelated && !showPlayerLines) return null;
                return (
                  <line
                    key={`relation-${node.relation.id}-${other.relation.id}`}
                    x1={node.x}
                    y1={node.y}
                    x2={other.x}
                    y2={other.y}
                    stroke="#9CA3AF"
                    strokeWidth="1"
                    strokeOpacity="0.35"
                    strokeDasharray="4 4"
                  />
                );
              })
            )}

          {/* 玩家节点 */}
          <g transform={`translate(${center.x}, ${center.y})`}>
            <circle r="28" fill="rgba(45,212,191,0.2)" />
            <circle r="22" fill="#2DD4BF" stroke="white" strokeWidth="3" />
            <text y="4" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">我</text>
          </g>

          {/* 角色节点 */}
          {nodes.map((node) => {
            const color = affinityColor(node.relation.affinity);
            return (
              <g key={node.relation.id} transform={`translate(${node.x}, ${node.y})`}>
                <circle r="20" fill="white" stroke={color} strokeWidth="2" />
                <text y="-2" textAnchor="middle" fontSize="10" fill="#3D3229" fontWeight="bold">
                  {node.relation.name.slice(0, 1)}
                </text>
                <text y="10" textAnchor="middle" fontSize="8" fill="#7D6E5E">{node.relation.name}</text>
                <g transform="translate(-14, 16) scale(0.6)">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill={color}
                  />
                </g>
                <text x="6" y="22" textAnchor="middle" fontSize="8" fill={color}>
                  {node.relation.affinity}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
