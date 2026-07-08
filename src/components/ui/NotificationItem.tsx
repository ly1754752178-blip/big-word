import { useState } from 'react';
import { Bell, User, Calendar, MapPin } from 'lucide-react';
import type { Notification } from '@/types';

const typeIconMap: Record<Notification['type'], typeof Bell> = {
  system: Calendar,
  social: User,
  event: MapPin,
};

const typeColorMap: Record<Notification['type'], string> = {
  system: 'bg-accent-teal/15 text-accent-teal',
  social: 'bg-accent-sunset/15 text-accent-sunset',
  event: 'bg-accent-amber/15 text-accent-amber',
};

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = typeIconMap[notification.type];

  return (
    <button
      type="button"
      onClick={() => setExpanded(!expanded)}
      className={`w-full text-left rounded-xl border p-2.5 transition-colors ${
        notification.read
          ? 'bg-bg-glass/50 border-border-soft'
          : 'bg-accent-sunset/5 border-accent-sunset/20'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${typeColorMap[notification.type]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-primary truncate">{notification.title}</span>
            <span className="text-[10px] text-text-muted whitespace-nowrap ml-2">{notification.time}</span>
          </div>
          <p className="text-[10px] text-text-secondary truncate mt-0.5">{notification.message}</p>
        </div>
      </div>

      {expanded && (
        <p className="mt-2 pl-10 text-[11px] text-text-secondary leading-relaxed">
          {notification.message} — 点击可查看完整内容（演示）。
        </p>
      )}
    </button>
  );
}
