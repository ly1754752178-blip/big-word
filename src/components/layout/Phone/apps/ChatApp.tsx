import { useGame } from '@/hooks/useGameState';

export function ChatApp() {
  const { state } = useGame();

  return (
    <div className="space-y-3">
      {state.chatThreads.map((thread) => {
        const character = state.characters.find((c) => c.id === thread.characterId);
        const last = thread.messages[thread.messages.length - 1];
        return (
          <div
            key={thread.id}
            className="flex items-center gap-3 rounded-2xl bg-white border border-slate-100 shadow-soft p-3"
          >
            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-sm font-bold text-slate-700">
              {character?.name.slice(0, 1) ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-800 truncate">{character?.name ?? '未知角色'}</h4>
              <p className="text-xs text-slate-500 truncate">{last?.content ?? '暂无消息'}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
