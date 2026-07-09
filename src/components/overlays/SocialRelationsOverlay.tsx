import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, Heart, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Relation } from '@/types';

function RelationAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-base',
    lg: 'w-20 h-20 text-xl',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-sky-200 to-sky-300 border-4 border-white shadow-soft flex items-center justify-center font-bold text-slate-700`}
    >
      {name.slice(0, 1)}
    </div>
  );
}

function RelationAffinity({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-coral-50 border border-coral-100">
      <Heart className="w-3.5 h-3.5 text-coral-400 fill-coral-200" />
      <span className="text-sm font-number text-slate-700 font-bold">{value}</span>
    </div>
  );
}

function RelationListItem({ relation, index }: { relation: Relation; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlassCard variant="default" className="p-4 flex items-center gap-4"
      >
        <RelationAvatar name={relation.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-800 truncate">{relation.name}</span>
            <RelationAffinity value={relation.affinity} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-sky-500 font-medium">{relation.title}</span>
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            <span className="text-xs text-slate-500">{relation.group}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{relation.description}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function SocialRelationsOverlay() {
  const { state, openOverlayView } = useGame();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <GlassCard variant="sky" className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-500" /> 关系列表
          </h3>
          <motion.button
            type="button"
            onClick={() => openOverlayView('network')}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-600 text-sm font-medium border border-sky-200 hover:bg-sky-200 transition-colors"
          >
            <Network className="w-4 h-4" /> 关系网
          </motion.button>
        </div>

        <div className="space-y-3">
          {state.relationships.list.map((relation, idx) => (
            <RelationListItem key={relation.id} relation={relation} index={idx} />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
