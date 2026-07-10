import { useGame } from '@/hooks/useGameState';
import { Heart, Network } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Relation } from '@/types';

function RelationRow({ relation }: { relation: Relation }) {
  return (
    <GlassCard variant="default" className="flex items-center gap-2 p-2">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-200 to-sky-300 border-2 border-white shadow-soft flex items-center justify-center font-bold text-slate-700 text-lg">
        {relation.avatar ? (
          <img src={relation.avatar} alt={relation.name} className="w-full h-full object-cover rounded-full" />
        ) : (
          relation.name.slice(0, 1)
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-slate-700 truncate">{relation.name}</div>
        <div className="text-[10px] text-slate-400 truncate">{relation.title}</div>
      </div>
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-coral-50 border border-coral-100">
        <Heart className="w-3 h-3 text-coral-400 fill-coral-200" />
        <span className="text-[10px] font-number text-slate-700">{relation.affinity}</span>
      </div>
    </GlassCard>
  );
}

export function SocialPreview() {
  const { state, openOverlayView } = useGame();
  const present = state.relationships.list.slice(0, 5);
  const topAffinity = [...state.relationships.list].sort((a, b) => b.affinity - a.affinity).slice(0, 5);

  return (
    <div className="space-y-2">
      {/* 社交关系 —— 居中标题横栏 */}
      <div className="-mx-2.5 -mt-3 px-3 py-3 bg-gradient-to-r from-sky-50 via-sky-100/40 to-sky-50 border-b border-sky-100/60 text-center">
        <span className="text-base font-bold text-slate-800 tracking-wide">社交关系</span>
        <div className="mt-1 mx-auto w-8 h-0.5 rounded-full" style={{ backgroundColor: '#0EA5E9' }} />
      </div>

      {/* 关系网络按钮 —— 置于顶部 */}
      <button
        type="button"
        id="preview-network"
        onClick={() => openOverlayView('network')}
        className="w-full py-2 rounded-xl bg-sky-100 border border-sky-200 text-sky-600 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-sky-200 transition-colors"
      >
        <Network className="w-4 h-4" /> 关系网络
      </button>

      {/* 在场角色 */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">在场角色</span>
      </div>
      <div className="space-y-1.5">{present.map((r) => <RelationRow key={r.id} relation={r} />)}</div>

      {/* 最高好感 */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs font-bold text-slate-500">最高好感</span>
      </div>
      <div className="space-y-1.5">{topAffinity.map((r) => <RelationRow key={`top-${r.id}`} relation={r} />)}</div>
    </div>
  );
}
