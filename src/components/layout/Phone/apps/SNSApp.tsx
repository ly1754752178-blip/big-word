import { useGame } from '@/hooks/useGameState';
import { Heart } from 'lucide-react';

export function SNSApp() {
  const { state } = useGame();

  return (
    <div className="space-y-3">
      {state.snsPosts.map((post) => {
        const character = state.characters.find((c) => c.id === post.characterId);
        return (
          <div
            key={post.id}
            className="rounded-2xl bg-white border border-slate-100 shadow-soft p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-coral-100 flex items-center justify-center text-xs font-bold text-slate-700">
                {character?.name.slice(0, 1) ?? '?'}
              </div>
              <span className="text-xs font-bold text-slate-700">{character?.name ?? '未知角色'}</span>
            </div>
            <p className="text-sm text-slate-700">{post.content}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
              <Heart className="w-3 h-3" /> {post.likes}
            </div>
          </div>
        );
      })}
    </div>
  );
}
