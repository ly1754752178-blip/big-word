import { GlassCard } from '@/components/ui/GlassCard';
import { Heart } from 'lucide-react';
import type { Character } from '@/types';

interface CharacterCardProps {
  character: Character;
  onClick?: (id: string) => void;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  return (
    <GlassCard
      variant="cream"
      className="p-4 cursor-pointer group"
      onClick={() => onClick?.(character.id)}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-100 to-coral-100 overflow-hidden shrink-0 flex items-center justify-center"
        >
          {character.avatar ? (
            <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-slate-700">{character.name.slice(0, 1)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-800 truncate">{character.name}</h4>
          <p className="text-xs text-slate-500 truncate">《{character.sourceWork}》· {character.school || character.occupation}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {character.personality.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[10px] border border-slate-100">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Heart className="w-4 h-4 text-coral-400" />
        <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-coral-300 to-coral-400 rounded-full"
            style={{ width: `${character.affection}%` }}
          />
        </div>
        <span className="text-xs font-number text-slate-500">{character.affection}</span>
      </div>
    </GlassCard>
  );
}
