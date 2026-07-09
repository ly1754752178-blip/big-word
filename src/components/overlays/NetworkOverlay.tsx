import { useMemo, useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Character } from '@/types';

interface NetworkNode {
  character: Character;
  x: number;
  y: number;
  color: string;
}

const circleConfig = [
  { key: 'school', label: '同学圈', color: '#7DD3FC' },
  { key: 'work', label: '职场圈', color: '#C4B5FD' },
  { key: 'neighbor', label: '邻里圈', color: '#86EFAC' },
  { key: 'interest', label: '兴趣圈', color: '#FDA4AF' },
];

function affectionColor(value: number): string {
  if (value >= 75) return '#F43F5E';
  if (value >= 50) return '#F59E0B';
  if (value >= 25) return '#38BDF8';
  return '#94A3B8';
}

export function NetworkOverlay() {
  const { state } = useGame();
  const { characters } = state;
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const center = { x: 400, y: 260 };

  const nodes: NetworkNode[] = useMemo(() => {
    const groups = circleConfig.map((cfg) => ({
      ...cfg,
      members: characters.filter((c) => c.socialCircle === cfg.key),
    }));

    const result: NetworkNode[] = [];
    let startAngle = 0;
    const total = Math.max(1, characters.length);

    groups.forEach((group) => {
      const sweep = (group.members.length / total) * Math.PI * 1.8;
      group.members.forEach((character, idx) => {
        const angle = startAngle + (sweep / Math.max(1, group.members.length)) * idx + sweep / group.members.length / 2;
        const distance = 160 + (character.affection % 30);
        result.push({
          character,
          x: center.x + Math.cos(angle - Math.PI / 2) * distance,
          y: center.y + Math.sin(angle - Math.PI / 2) * distance,
          color: group.color,
        });
      });
      startAngle += sweep;
    });

    return result;
  }, [characters, center.x, center.y]);

  return (
    <div className="w-full h-full min-h-[480px] flex flex-col">
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-slate-100 bg-white/40">
        {circleConfig.map((cfg) => (
          <div key={cfg.key} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
            {cfg.label}
          </div>
        ))}
      </div>

      <GlassCard variant="default" className="flex-1 min-h-0 m-4 p-0 overflow-hidden">
        <div className="relative w-full h-full bg-gradient-to-br from-sky-50/40 to-cream-50/40">
          <svg width="100%" height="100%" viewBox="0 0 800 520">
            {nodes.map((node) => (
              <line
                key={`line-${node.character.id}`}
                x1={center.x}
                y1={center.y}
                x2={node.x}
                y2={node.y}
                stroke={affectionColor(node.character.affection)}
                strokeWidth="1.5"
                strokeOpacity={hoveredId === node.character.id ? 0.7 : 0.25}
              />
            ))}

            <g transform={`translate(${center.x}, ${center.y})`}>
              <circle r="32" fill="rgba(56, 189, 248, 0.15)" />
              <circle r="24" fill="#38BDF8" stroke="white" strokeWidth="3" />
              <text y="4" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">我</text>
            </g>

            {nodes.map((node) => {
              const color = affectionColor(node.character.affection);
              return (
                <g
                  key={node.character.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setHoveredId(node.character.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="cursor-pointer"
                >
                  <circle r="22" fill="white" stroke={node.color} strokeWidth="2.5" />
                  <text y="-2" textAnchor="middle" fontSize="10" fill="#334155" fontWeight="bold">
                    {node.character.name.slice(0, 1)}
                  </text>
                  <text y="10" textAnchor="middle" fontSize="8" fill="#64748B">
                    {node.character.name}
                  </text>
                  <text y="22" textAnchor="middle" fontSize="8" fill={color} fontWeight="bold">
                    {node.character.affection}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </GlassCard>
    </div>
  );
}
