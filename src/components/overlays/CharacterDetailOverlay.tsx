/**
 * CharacterDetailOverlay — 角色详情（暖色统一标准）
 */
import { useGame } from '@/hooks/useGameState';
import { Heart, MessageCircle, Gift, MapPin } from 'lucide-react';
import { AvatarImg } from '@/components/ui/AvatarImg';

const stageLabels: Record<string, string> = {
  stranger: '陌生人', acquaintance: '相识', friend: '朋友', close: '密友', lover: '恋人',
};

const COL = {
  bg: '#FDFAF5', card: '#FFFBF7', border: '#E8DFD3',
  text: '#4A3728', sub: '#8B7560', subtle: '#B8A898',
};

export function CharacterDetailOverlay() {
  const { state } = useGame();
  const character = state.characters.find((c) => c.id === state.detailView?.payload?.characterId);

  if (!character) {
    return <div className="p-8" style={{ color: COL.subtle, background: COL.bg }}>未找到角色</div>;
  }

  const currentLocation = state.locations.find((l) => l.id === character.currentLocationId);

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6" style={{ background: COL.bg }}>
      {/* 头像 + 基本信息 */}
      <div className="p-6 rounded-2xl" style={{ background: COL.card, border: `1.5px solid ${COL.border}` }}>
        <div className="flex items-start gap-5">
          <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FDE8D0, #FCE4EC)', border: `1px solid ${COL.border}` }}>
            <AvatarImg name={character.name} src={character.avatar || undefined} className="w-full h-full object-cover" size={96} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold" style={{ color: COL.text }}>{character.name}</h2>
            <p className="text-sm mt-1" style={{ color: COL.sub }}>《{character.sourceWork}》· {character.school || character.occupation}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: '#FCE4EC', color: '#E8574A' }}>
                {stageLabels[character.relationshipStage]}
              </span>
              {character.personality.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs"
                  style={{ background: COL.bg, color: COL.sub, border: `1px solid ${COL.border}` }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 基本信息 */}
        <div className="p-5 rounded-2xl" style={{ background: COL.card, border: `1.5px solid ${COL.border}` }}>
          <h3 className="font-bold mb-3" style={{ color: COL.text }}>基本信息</h3>
          <div className="space-y-2 text-sm">
            {[
              ['年龄', `${character.age} 岁`],
              ['身份', character.identity],
              ['现居地', character.address || '未知'],
              ['当前位置', currentLocation?.name ?? '未知'],
              ['心情', character.currentMood],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between">
                <span style={{ color: COL.subtle }}>{label}</span>
                <span style={{ color: COL.sub }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 关系 */}
        <div className="p-5 rounded-2xl" style={{ background: COL.card, border: `1.5px solid ${COL.border}` }}>
          <h3 className="font-bold mb-3" style={{ color: COL.text }}>关系</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" style={{ color: '#E8574A' }} />
              <span className="text-sm" style={{ color: COL.sub }}>好感度 {character.affection}/100</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F5EDE0' }}>
              <div className="h-full rounded-full" style={{ width: `${character.affection}%`, background: 'linear-gradient(90deg, #F48FB1, #E8574A)' }} />
            </div>
            <p className="text-xs" style={{ color: COL.subtle }}>最近互动：{character.lastInteractionAt}</p>
          </div>
        </div>
      </div>

      {/* 喜好与厌恶 */}
      <div className="p-5 rounded-2xl" style={{ background: COL.card, border: `1.5px solid ${COL.border}` }}>
        <h3 className="font-bold mb-3" style={{ color: COL.text }}>喜好与厌恶</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs mb-2" style={{ color: COL.subtle }}>喜欢</p>
            <div className="flex flex-wrap gap-2">
              {character.likes.map((like) => (
                <span key={like} className="px-2 py-1 rounded-lg text-xs"
                  style={{ background: '#E8F5E9', color: '#4A7C50' }}>{like}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs mb-2" style={{ color: COL.subtle }}>厌恶</p>
            <div className="flex flex-wrap gap-2">
              {character.dislikes.map((d) => (
                <span key={d} className="px-2 py-1 rounded-lg text-xs"
                  style={{ background: '#F5F0EB', color: COL.sub }}>{d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-105"
          style={{ background: 'linear-gradient(135deg, #C4953A, #B8852E)' }}>
          <MessageCircle className="w-4 h-4" /> 聊天
        </button>
        <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:brightness-105"
          style={{ background: COL.bg, color: COL.sub, border: `1.5px solid ${COL.border}` }}>
          <Gift className="w-4 h-4" /> 送礼
        </button>
        <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:brightness-105"
          style={{ background: COL.bg, color: COL.sub, border: `1.5px solid ${COL.border}` }}>
          <MapPin className="w-4 h-4" /> 去找她
        </button>
      </div>
    </div>
  );
}
