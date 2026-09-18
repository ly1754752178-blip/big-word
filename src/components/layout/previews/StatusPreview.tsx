import { useGame } from '@/hooks/useGameState';
import { Heart, Brain, Activity } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AvatarImg } from '@/components/ui/AvatarImg';
import { StatBar } from '@/components/ui/StatBar';

export function StatusPreview() {
  const { state, openOverlayView } = useGame();
  const { player } = state;

  return (
    <GlassCard
      id="status-preview-card"
      className="p-4 w-full cursor-pointer transition-[transform,opacity] duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none"
      onClick={() => openOverlayView('status')}
    >
      {/* 头部：头像与身份信息 */}
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-coral-300/30 to-coral-500/20 border-2 border-white shadow-soft shrink-0">
          <AvatarImg
            name={player.name}
            src={player.avatar || undefined}
            className="w-full h-full object-cover"
            size={64}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg font-bold text-slate-800 truncate">
            {player.name}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[10px] font-medium whitespace-nowrap border border-slate-100">
              {player.socialIdentity}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white text-slate-500 text-[10px] whitespace-nowrap border border-slate-100">
              {player.age}岁
            </span>
          </div>
        </div>
      </div>

      {/* 三条核心状态条 */}
      <div className="mt-4 space-y-2">
        <StatBar
          id="preview-stamina-bar"
          label="体力"
          value={player.status.stamina}
          color="#E87A5D"
          icon={<Heart className="w-3.5 h-3.5" />}
        />
        <StatBar
          id="preview-mental-bar"
          label="精神"
          value={player.status.mental}
          color="#38BDF8"
          icon={<Brain className="w-3.5 h-3.5" />}
        />
        <StatBar
          id="preview-health-bar"
          label="健康"
          value={player.status.health}
          color="#6BBF73"
          icon={<Activity className="w-3.5 h-3.5" />}
        />
      </div>

      {/* 当前状态与身体摘要 */}
      <div className="mt-4 pt-3 border-t border-slate-100/80 space-y-1">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span>当前：</span>
          <span className="text-slate-700">{player.bodyState.label}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-700">{player.bodyState.mood}</span>
        </div>
        <div className="text-xs text-slate-400">
          {player.bodyState.height}cm · {player.bodyState.weight}斤 · {player.bodyState.ageStage}
        </div>
      </div>
    </GlassCard>
  );
}
