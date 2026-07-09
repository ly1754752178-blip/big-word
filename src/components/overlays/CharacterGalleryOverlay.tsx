import { useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { CharacterCard } from '@/components/character/CharacterCard';
import { Search } from 'lucide-react';

export function CharacterGalleryOverlay() {
  const { state, openOverlayView } = useGame();
  const [filter, setFilter] = useState('');

  const filtered = state.characters.filter(
    (c) =>
      c.name.includes(filter) ||
      c.sourceWork.includes(filter) ||
      c.personality.some((p) => p.includes(filter))
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="搜索角色、出处作品或性格"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-100 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-sky-200 focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4">
        {filtered.map((c) => (
          <CharacterCard
            key={c.id}
            character={c}
            onClick={(id) => openOverlayView('characterDetail', { characterId: id })}
          />
        ))}
      </div>
    </div>
  );
}
