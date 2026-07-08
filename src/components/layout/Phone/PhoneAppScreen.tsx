import { useGame } from '@/hooks/useGameState';
import {
  Newspaper,
  CalendarDays,
  MessageCircle,
  MapPin,
  Mail,
  Image,
} from 'lucide-react';
import type { PhoneAppId } from '@/types';

const appIconMap: Record<PhoneAppId, React.ReactNode> = {
  news: <Newspaper className="w-6 h-6" />,
  schedule: <CalendarDays className="w-6 h-6" />,
  messages: <MessageCircle className="w-6 h-6" />,
  travel: <MapPin className="w-6 h-6" />,
  mail: <Mail className="w-6 h-6" />,
  gallery: <Image className="w-6 h-6" />,
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
              <div key={event.id} className="rounded-xl bg-white/60 border border-border-soft p-3">
                <h4 className="text-sm font-medium text-text-primary">{event.title}</h4>
                <p className="text-xs text-text-secondary mt-1">{event.description}</p>
              </div>
            ))}
          </div>
        );
      case 'schedule':
        return (
          <div className="space-y-3">
            {state.calendar.calendarEvents.map((event) => (
              <div key={event.id} className="rounded-xl bg-white/60 border border-border-soft p-3">
                <h4 className="text-sm font-medium text-text-primary">{event.title}</h4>
                <p className="text-xs text-text-secondary mt-1">{event.date}</p>
              </div>
            ))}
          </div>
        );
      case 'messages':
        return (
          <div className="space-y-3">
            {state.relationships.list.slice(0, 3).map((relation) => (
              <div key={relation.id} className="flex items-center gap-3 rounded-xl bg-white/60 border border-border-soft p-3">
                <div className="w-9 h-9 rounded-full bg-accent-amber/30 flex items-center justify-center text-sm font-bold text-text-primary"
                >
                  {relation.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-text-primary truncate">{relation.name}</h4>
                  <p className="text-xs text-text-secondary truncate">{relation.description}</p>
                </div>
              </div>
            ))}
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
            <h3 className="text-lg font-bold text-text-primary">{app.name}</h3>
            <p className="text-xs text-text-secondary mt-1">该应用功能将在后续版本开放</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 p-5">
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        ← 返回桌面
      </button>
      {renderContent()}
    </div>
  );
}
