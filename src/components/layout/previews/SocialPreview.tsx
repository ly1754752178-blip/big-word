import { useGame } from '@/hooks/useGameState';
import { Heart, Network } from 'lucide-react';
import type { Relation } from '@/types';

function RelationRow({ relation }: { relation: Relation }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/60 border border-border-soft">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-social-teal/30 to-social-cyan/30 border-2 border-white shadow-sm flex items-center justify-center font-bold text-text-primary text-base">
        {relation.name.slice(0, 1)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-text-primary truncate">{relation.name}</div>
        <div className="text-[10px] text-text-muted truncate">{relation.title}</div>
      </div>
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-social-teal/10 border border-social-teal/20">
        <Heart className="w-3 h-3 text-social-teal fill-social-teal/40" />
        <span className="text-[10px] font-number text-text-primary">{relation.affinity}</span>
      </div>
    </div>
  );
}

export function SocialPreview() {
  const { state, openOverlayView } = useGame();
  const present = state.relationships.list.slice(0, 5);
  const topAffinity = [...state.relationships.list].sort((a, b) => b.affinity - a.affinity).slice(0, 5);

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-text-secondary">在场角色</span>
      </div>
      <div className="space-y-1.5">{present.map((r) => <RelationRow key={r.id} relation={r} />)}</div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs font-bold text-text-secondary">最高好感</span>
      </div>
      <div className="space-y-1.5">{topAffinity.map((r) => <RelationRow key={`top-${r.id}`} relation={r} />)}</div>

      <button
        type="button"
        id="preview-network"
        onClick={() => openOverlayView('network')}
        className="w-full mt-2 py-2 rounded-xl bg-social-teal/10 border border-social-teal/20 text-social-teal text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-social-teal/20 transition-colors"
      >
        <Network className="w-4 h-4" /> 关系网络
      </button>
    </div>
  );
}
