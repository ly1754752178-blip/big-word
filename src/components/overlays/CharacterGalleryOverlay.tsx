/**
 * CharacterGalleryOverlay — 角色图鉴（暖色统一标准）
 */
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
    <div className="h-full flex flex-col" style={{ background: '#FDFAF5' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#B8A898' }} />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="搜索角色、出处作品或性格"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: '#FFFBF7',
              border: '1.5px solid #E8DFD3',
              color: '#4A3728',
            }}
          />
        </div>
        <span className="text-xs shrink-0" style={{ color: '#B8A898' }}>
          共 {filtered.length} 位角色
        </span>
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
