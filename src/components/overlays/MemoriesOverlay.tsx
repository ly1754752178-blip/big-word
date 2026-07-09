import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { Calendar } from 'lucide-react';

export function MemoriesOverlay() {
  const { state } = useGame();
  const { memories, characters } = state;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">回忆相册</h3>
        <span className="text-xs text-slate-500">共 {memories.length} 段回忆</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memories.map((memory) => {
          const related = characters.filter((c) => memory.characterIds.includes(c.id));
          return (
            <GlassCard key={memory.id} variant="cream" className="p-4 overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-sky-100 to-coral-100 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
                {memory.image ? (
                  <img src={memory.image} alt={memory.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-400">CG</span>
                )}
              </div>
              <h4 className="font-bold text-slate-800">{memory.title}</h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-number">{memory.date}</span>
              </div>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{memory.description}</p>
              {related.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {related.map((c) => (
                    <span key={c.id} className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[10px] border border-slate-100">
                      {c.name}
                    </span>
                  ))}
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
