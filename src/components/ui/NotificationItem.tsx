import { useState } from 'react';
import { Bell, User, Calendar, MapPin } from 'lucide-react';
import type { Notification } from '@/types';

const typeIconMap: Record<Notification['type'], typeof Bell> = {
  system: Calendar,
  social: User,
  event: MapPin,
};

const typeColorMap: Record<Notification['type'], string> = {
  system: 'bg-sky-100 text-sky-500',
  social: 'bg-coral-100 text-coral-500',
  event: 'bg-lavender-100 text-lavender-500',
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
      className={`w-full text-left rounded-2xl border p-2.5 transition-all ${
        notification.read
          ? 'bg-white border-slate-100'
          : 'bg-coral-50/50 border-coral-100 shadow-soft'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${typeColorMap[notification.type]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 truncate">{notification.title}</span>
            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 font-number">{notification.time}</span>
          </div>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">{notification.message}</p>
        </div>
      </div>

      {expanded && (
        <p className="mt-2 pl-10 text-[11px] text-slate-500 leading-relaxed">
          {notification.message} — 点击可查看完整内容（演示）。
        </p>
      )}
    </button>
  );
}
