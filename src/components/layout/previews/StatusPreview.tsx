import { useGame } from '@/hooks/useGameState';
import { User, Heart, Brain, Activity, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatBar } from '@/components/ui/StatBar';
import type { PlayerBodyState } from '@/types';

function deriveBodyFigure(bodyState: PlayerBodyState) {
  const parts: string[] = [];
  if (bodyState.height >= 175 && bodyState.weight < 55) parts.push('瘦竹竿一样');
  else if (bodyState.weight > 80) parts.push('敦实');
  else parts.push('身材匀称');

  if (bodyState.mental.includes('颓废')) parts.push('颓废');
  if (bodyState.mental.includes('失眠')) parts.push('睡眠不足');

  return `${parts.join('、')}的${bodyState.ageStage}年轻人`;
}

export function StatusPreview() {
  const { state, openOverlayView } = useGame();
  const { player } = state;

  return (
    <div className="space-y-2">
      {/* 个人状态 —— 居中标题横栏 */}
      <div className="-mx-2.5 -mt-3 px-3 py-3 bg-gradient-to-r from-coral-50 via-coral-100/40 to-coral-50 border-b border-coral-100/60 text-center">
        <span className="text-base font-bold text-slate-800 tracking-wide">个人状态</span>
        <div className="mt-1 mx-auto w-8 h-0.5 rounded-full" style={{ backgroundColor: '#F43F5E' }} />
      </div>

      {/* 统一合并卡片 —— ID卡 + 身体状态 + 个人讯息 */}
      <GlassCard variant="coral" className="p-3 w-full">
        {/* ID 卡头部 —— 头像放大25% */}
        <div className="flex items-center gap-3">
          <div className="w-[70px] h-[70px] rounded-xl bg-gradient-to-br from-coral-300/30 to-coral-500/20 border-2 border-white shadow-soft flex items-center justify-center overflow-hidden shrink-0">
            {player.avatar ? (
              <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-9 h-9 text-coral-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-lg font-bold text-slate-800 truncate">{player.name}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-white text-coral-500 text-[10px] font-medium whitespace-nowrap border border-coral-100">{player.bodyState.label}</span>
              <span className="px-2 py-0.5 rounded-full bg-white text-slate-500 text-[10px] whitespace-nowrap border border-slate-100">{player.socialIdentity}</span>
            </div>
          </div>
        </div>

        {/* 状态条 */}
        <div className="mt-3 space-y-1.5">
          <StatBar label="体力" value={player.status.stamina} color="#F43F5E" icon={<Heart className="w-3 h-3" />} />
          <StatBar label="精神" value={player.status.mental} color="#0EA5E9" icon={<Brain className="w-3 h-3" />} />
          <StatBar label="健康" value={player.status.health} color="#22C55E" icon={<Activity className="w-3 h-3" />} />
        </div>

        {/* 身体状态 + 个人讯息分隔线后内嵌 */}
        <div className="mt-3 pt-2.5 border-t border-coral-100/60 space-y-1.5">
          {/* 身体状态 */}
          <button
            type="button"
            className="w-full text-left flex items-center justify-between p-1.5 rounded-lg hover:bg-white/50 transition-colors"
            onClick={() => openOverlayView('status')}
          >
            <span className="text-xs font-bold text-slate-500">身体状态</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
          <div className="px-1.5">
            <div className="text-sm font-bold text-slate-700 truncate">{deriveBodyFigure(player.bodyState)}</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {[...player.bodyState.physiological, ...player.bodyState.mental].map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-coral-50 text-coral-500 text-[10px] whitespace-nowrap border border-coral-100">{tag}</span>
              ))}
            </div>
          </div>

          {/* 个人讯息 */}
          <button
            type="button"
            className="w-full text-left flex items-center justify-between p-1.5 rounded-lg hover:bg-white/50 transition-colors"
            onClick={() => openOverlayView('status')}
          >
            <span className="text-xs font-bold text-slate-500">个人讯息</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
          <div className="px-1.5 space-y-0.5 text-xs text-slate-700">
            <div className="flex justify-between"><span className="text-slate-400">年龄</span><span className="font-number">{player.age}岁</span></div>
            <div className="flex justify-between"><span className="text-slate-400">身份</span><span className="truncate max-w-[120px]">{player.socialIdentity}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">住址</span><span className="truncate max-w-[120px]">{player.address}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">现金</span><span className="font-number">¥{state.finance.cash.toLocaleString()}</span></div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
