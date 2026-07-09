import { useEffect } from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { InAppNotification } from '@/types';

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const colorMap = {
  info: 'bg-sky-500',
  success: 'bg-mint-500',
  warning: 'bg-amber-500',
  error: 'bg-coral-500',
};

interface InAppNotificationProps {
  notification: InAppNotification;
  onClose: () => void;
}

export function InAppNotification({ notification, onClose }: InAppNotificationProps) {
  const { type, title, message, duration = 4000 } = notification;
  const Icon = iconMap[type];

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96 }}
      className="w-80 rounded-2xl bg-white border border-slate-100 shadow-soft-lg overflow-hidden"
      role="alert"
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`w-9 h-9 rounded-xl ${colorMap[type]} bg-opacity-15 flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-5 h-5 ${colorMap[type].replace('bg-', 'text-')}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800">{title}</p>
          {message && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{message}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
          aria-label="关闭通知"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className={`h-1 ${colorMap[type]}`} style={{ opacity: 0.3 }} />
    </motion.div>
  );
}
