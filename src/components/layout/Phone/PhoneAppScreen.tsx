import { useGame } from '@/hooks/useGameState';
import type { PhoneAppId } from '@/types';
import { ChatApp } from './apps/ChatApp';

interface PhoneAppScreenProps {
  app: { id: PhoneAppId; name: string; icon: string; color: string; badge?: number };
  onBack: () => void;
}

export function PhoneAppScreen({ app, onBack }: PhoneAppScreenProps) {
  const { state } = useGame();

  const renderContent = () => {
    switch (app.id) {
      case 'line':
        return <ChatApp />;
      case 'yahoo-japan':
        return (
          <div className="space-y-3">
            {state.calendar.worldEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl bg-white border border-slate-100 shadow-soft p-3"
              >
                <h4 className="text-sm font-bold text-slate-800">{event.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{event.description}</p>
              </div>
            ))}
          </div>
        );
      case 'timetree':
        return (
          <div className="space-y-3">
            {state.calendar.calendarEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl bg-white border border-slate-100 shadow-soft p-3"
              >
                <h4 className="text-sm font-bold text-slate-800">{event.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{event.date}</p>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-[22%] mx-auto mb-3 overflow-hidden shadow-sm"
            >
              <img src={app.icon} alt={app.name} className="w-full h-full object-cover scale-110" />
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
