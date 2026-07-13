/**
 * CharacterCard — 角色卡牌（暖色统一标准）
 */
import { Heart } from 'lucide-react';
import type { Character } from '@/types';
import { AvatarImg } from '@/components/ui/AvatarImg';

interface CharacterCardProps {
  character: Character;
  onClick?: (id: string) => void;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  return (
    <article
      className="p-4 cursor-pointer rounded-2xl transition-all hover:-translate-y-0.5"
      style={{
        background: '#FFFBF7',
        border: '1.5px solid #E8DFD3',
        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
      }}
      onClick={() => onClick?.(character.id)}
    >
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FDE8D0, #FCE4EC)', border: '1px solid #E8DFD3' }}>
          <AvatarImg name={character.name} src={character.avatar || undefined} className="w-full h-full object-cover" size={80} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold truncate" style={{ color: '#4A3728' }}>{character.name}</h4>
          <p className="text-xs truncate" style={{ color: '#B8A898' }}>《{character.sourceWork}》· {character.school || character.occupation}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {character.personality.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[10px]"
                style={{ background: '#FDFAF5', color: '#8B7560', border: '1px solid #E8DFD3' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Heart className="w-4 h-4" style={{ color: '#E8574A' }} />
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#F5EDE0' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${character.affection}%`, background: 'linear-gradient(90deg, #F48FB1, #E8574A)' }}
          />
        </div>
        <span className="text-xs font-bold" style={{ color: '#8B7560' }}>{character.affection}</span>
      </div>
    </article>
  );
}
