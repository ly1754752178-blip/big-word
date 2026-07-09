import { motion } from 'framer-motion';
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

interface PhoneAppGridProps {
  apps: { id: PhoneAppId; name: string; icon: string; color: string; badge?: number }[];
  onAppClick: (appId: PhoneAppId) => void;
}

export function PhoneAppGrid({ apps, onAppClick }: PhoneAppGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4 p-5">
      {apps.map((app, index) => (
        <motion.button
          key={app.id}
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.04 }}
          onClick={() => onAppClick(app.id)}
          className="flex flex-col items-center gap-2 group"
        >
          <div
            className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform"
            style={{ backgroundColor: app.color }}
          >
            {appIconMap[app.id]}
            {app.badge && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-coral-400 text-white text-[10px] flex items-center justify-center border-2 border-white"
              >
                {app.badge}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-700/90">{app.name}</span>
        </motion.button>
      ))}
    </div>
  );
}
