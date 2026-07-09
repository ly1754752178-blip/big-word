import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { CheckCircle2, Circle, Lightbulb } from 'lucide-react';

const typeLabels: Record<string, string> = {
  novel: '小说',
  manga: '漫画',
  game: '游戏',
  video: '视频',
  music: '音乐',
};

export function CreativeWorkshopOverlay() {
  const { state } = useGame();
  const { projects } = state;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">创作项目</h3>
        <span className="text-xs text-slate-500">共 {projects.length} 个进行中</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => {
          const progressPct = Math.round((project.progress / project.maxProgress) * 100);
          return (
            <GlassCard key={project.id} variant="lavender" className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-800 truncate">{project.name}</h4>
                <span className="px-2 py-1 rounded-lg bg-lavender-100 text-lavender-700 text-xs">{typeLabels[project.type] ?? project.type}</span>
              </div>

              <div className="h-2 bg-white rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-lavender-400 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mb-4">
                <span>进度 {progressPct}%</span>
                <span className="font-number">截止 {project.deadline}</span>
              </div>

              <div className="space-y-2">
                {project.tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 text-sm text-slate-700">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-mint-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className={task.completed ? 'line-through text-slate-400' : ''}>{task.title}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 border border-slate-100">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-slate-600">灵感值：</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${project.inspiration}%` }}
                  />
                </div>
                <span className="text-xs font-number text-slate-500">{project.inspiration}</span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
