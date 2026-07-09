import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { Heart, MessageCircle, Gift, MapPin } from 'lucide-react';

const stageLabels: Record<string, string> = {
  stranger: '陌生人',
  acquaintance: '相识',
  friend: '朋友',
  close: '密友',
  lover: '恋人',
};

export function CharacterDetailOverlay() {
  const { state } = useGame();
  const character = state.characters.find((c) => c.id === state.detailView?.payload?.characterId);

  if (!character) {
    return <div className="p-8 text-slate-500">未找到角色</div>;
  }

  const currentLocation = state.locations.find((l) => l.id === character.currentLocationId);

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">
      <GlassCard variant="cream" className="p-6">
        <div className="flex items-start gap-5">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sky-100 to-coral-100 overflow-hidden shrink-0 flex items-center justify-center"
          >
            {character.avatar ? (
              <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-slate-700">{character.name.slice(0, 1)}</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800">{character.name}</h2>
            <p className="text-sm text-slate-500 mt-1">《{character.sourceWork}》· {character.school || character.occupation}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 rounded-full bg-coral-100 text-coral-600 text-xs font-medium">{stageLabels[character.relationshipStage]}</span>
              {character.personality.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white text-slate-600 text-xs border border-slate-100">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GlassCard variant="sky" className="p-5">
          <h3 className="font-bold text-slate-700 mb-3">基本信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">年龄</span>
              <span className="font-number">{character.age} 岁</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">身份</span>
              <span>{character.identity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">现居地</span>
              <span>{character.address || '未知'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">当前位置</span>
              <span>{currentLocation?.name ?? '未知'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">心情</span>
              <span>{character.currentMood}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="coral" className="p-5">
          <h3 className="font-bold text-slate-700 mb-3">关系</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-coral-400" />
              <span className="text-sm text-slate-600">好感度 {character.affection}/100</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div className="h-full bg-coral-400 rounded-full" style={{ width: `${character.affection}%` }} />
            </div>
            <p className="text-xs text-slate-500">最近互动：{character.lastInteractionAt}</p>
          </div>
        </GlassCard>
      </div>

      <GlassCard variant="mint" className="p-5">
        <h3 className="font-bold text-slate-700 mb-3">喜好与厌恶</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-2">喜欢</p>
            <div className="flex flex-wrap gap-2">
              {character.likes.map((like) => (
                <span key={like} className="px-2 py-1 rounded-lg bg-mint-100 text-mint-700 text-xs">{like}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">厌恶</p>
            <div className="flex flex-wrap gap-2">
              {character.dislikes.map((d) => (
                <span key={d} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs">{d}</span>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex gap-3">
        <button type="button" className="btn-primary flex-1 flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" /> 聊天
        </button>
        <button type="button" className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <Gift className="w-4 h-4" /> 送礼
        </button>
        <button type="button" className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4" /> 去找她
        </button>
      </div>
    </div>
  );
}
