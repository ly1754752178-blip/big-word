import { useGame } from '@/hooks/useGameState';
import {
  Newspaper,
  CalendarDays,
  MessageCircle,
  MapPin,
  Mail,
  Image,
  MessageSquare,
  Heart,
  Wallet,
} from 'lucide-react';
import type { PhoneAppId } from '@/types';

const appIconMap: Record<PhoneAppId, React.ReactNode> = {
  news: <Newspaper className="w-6 h-6" />,
  schedule: <CalendarDays className="w-6 h-6" />,
  messages: <MessageCircle className="w-6 h-6" />,
  travel: <MapPin className="w-6 h-6" />,
  mail: <Mail className="w-6 h-6" />,
  gallery: <Image className="w-6 h-6" />,
  chat: <MessageSquare className="w-6 h-6" />,
  sns: <Heart className="w-6 h-6" />,
  wallet: <Wallet className="w-6 h-6" />,
};

interface PhoneAppScreenProps {
  app: { id: PhoneAppId; name: string; icon: string; color: string; badge?: number };
  onBack: () => void;
}

export function PhoneAppScreen({ app, onBack }: PhoneAppScreenProps) {
  const { state } = useGame();

  const renderContent = () => {
    switch (app.id) {
      case 'news':
        return (
          <div className="space-y-3">
            {state.calendar.worldEvents.map((event) => (
              <div key={event.id} className="rounded-2xl bg-white border border-slate-100 shadow-soft p-3">
                <h4 className="text-sm font-bold text-slate-800">{event.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{event.description}</p>
              </div>
            ))}
          </div>
        );
      case 'schedule':
        return (
          <div className="space-y-3">
            {state.calendar.calendarEvents.map((event) => (
              <div key={event.id} className="rounded-2xl bg-white border border-slate-100 shadow-soft p-3">
                <h4 className="text-sm font-bold text-slate-800">{event.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{event.date}</p>
              </div>
            ))}
          </div>
        );
      case 'messages':
        return (
          <div className="space-y-3">
            {state.relationships.list.slice(0, 3).map((relation) => (
              <div key={relation.id} className="flex items-center gap-3 rounded-2xl bg-white border border-slate-100 shadow-soft p-3">
                <div className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center text-sm font-bold text-slate-700"
                >
                  {relation.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{relation.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{relation.description}</p>
                </div>
              </div>
            ))}
          </div>
        );
      case 'chat':
        return (
          <div className="space-y-3">
            {state.chatThreads.map((thread) => {
              const character = state.characters.find((c) => c.id === thread.characterId);
              const last = thread.messages[thread.messages.length - 1];
              return (
                <div key={thread.id} className="flex items-center gap-3 rounded-2xl bg-white border border-slate-100 shadow-soft p-3">
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
      case 'sns':
        return (
          <div className="space-y-3">
            {state.snsPosts.map((post) => {
              const character = state.characters.find((c) => c.id === post.characterId);
              return (
                <div key={post.id} className="rounded-2xl bg-white border border-slate-100 shadow-soft p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-coral-100 flex items-center justify-center text-xs font-bold text-slate-700">
                      {character?.name.slice(0, 1) ?? '?'}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{character?.name ?? '未知角色'}</span>
                  </div>
                  <p className="text-sm text-slate-700">{post.content}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                    <Heart className="w-3 h-3" /> {post.likes}
                  </div>
                </div>
              );
            })}
          </div>
        );
      case 'wallet':
        return (
          <div className="space-y-3">
            <div className="rounded-2xl bg-mint-50 border border-mint-100 p-4 text-center">
              <div className="text-xs text-slate-500">当前现金</div>
              <div className="mt-1 text-2xl font-number font-bold text-slate-800">¥{state.finance.cash.toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              {state.finance.expenses.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between text-xs rounded-xl bg-white border border-slate-100 p-2.5">
                  <span className="text-slate-700 truncate">{tx.title}</span>
                  <span className={`font-number ${tx.type === 'income' ? 'text-mint-500' : 'text-coral-500'}`}>
                    {tx.type === 'income' ? '+' : ''}{tx.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white"
              style={{ backgroundColor: app.color }}
            >
              {appIconMap[app.id]}
            </div>
            <h3 className="text-lg font-bold text-slate-800">{app.name}</h3>
            <p className="text-xs text-slate-500 mt-1">该应用功能将在后续版本开放</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 p-5">
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
      >
        ← 返回桌面
      </button>
      {renderContent()}
    </div>
  );
}
