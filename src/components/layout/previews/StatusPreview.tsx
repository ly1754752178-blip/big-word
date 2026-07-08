import { useGame } from '@/hooks/useGameState';
import { User, Heart, Brain, Activity, ChevronRight } from 'lucide-react';
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
    <div className="p-3 space-y-3">
      {/* ID 卡 */}
      <div className="p-3 rounded-2xl bg-gradient-to-br from-status-pale to-white border border-status-salmon/30">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-status-coral/25 to-status-salmon/25 border-2 border-white shadow-md flex items-center justify-center overflow-hidden"
          >
            {player.avatar ? (
              <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-status-coral" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-heading text-lg font-bold text-text-primary truncate">{player.name}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-status-coral/15 text-status-coral text-[10px] font-medium whitespace-nowrap">{player.bodyState.label}</span>
              <span className="px-2 py-0.5 rounded-full bg-status-salmon/15 text-text-secondary text-[10px] whitespace-nowrap">{player.socialIdentity}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <StatBar label="体力" value={player.status.stamina} color="bg-status-coral" icon={<Heart className="w-3 h-3" />} />
          <StatBar label="精神" value={player.status.mental} color="bg-accent-teal" icon={<Brain className="w-3 h-3" />} />
          <StatBar label="健康" value={player.status.health} color="bg-accent-green" icon={<Activity className="w-3 h-3" />} />
        </div>
      </div>

      {/* 身体状态概览 */}
      <button
        type="button"
        id="preview-body-state"
        onClick={() => openOverlayView('status')}
        className="w-full p-3 rounded-2xl bg-white/60 border border-border-soft text-left hover:bg-white/80 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-secondary">身体状态</span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </div>
        <div className="mt-2 text-sm font-bold text-text-primary truncate">{deriveBodyFigure(player.bodyState)}</div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {[...player.bodyState.physiological, ...player.bodyState.mental].map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-md bg-status-coral/10 text-status-coral text-[10px] whitespace-nowrap">{tag}</span>
          ))}
        </div>
      </button>

      {/* 个人讯息概览 */}
      <button
        type="button"
        id="preview-personal-info"
        onClick={() => openOverlayView('status')}
        className="w-full p-3 rounded-2xl bg-white/60 border border-border-soft text-left hover:bg-white/80 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-secondary">个人讯息</span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </div>
        <div className="mt-2 space-y-1 text-xs text-text-primary">
          <div className="flex justify-between"><span className="text-text-muted">年龄</span><span className="font-number">{player.age}岁</span></div>
          <div className="flex justify-between"><span className="text-text-muted">身份</span><span className="truncate max-w-[120px]">{player.socialIdentity}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">住址</span><span className="truncate max-w-[120px]">{player.address}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">现金</span><span className="font-number">¥{state.finance.cash.toLocaleString()}</span></div>
        </div>
      </button>
    </div>
  );
}
