import { motion } from 'framer-motion';
import type { PhoneAppId } from '@/types';

interface PhoneAppGridProps {
  apps: { id: PhoneAppId; name: string; icon: string; color: string; badge?: number }[];
  onAppClick: (appId: PhoneAppId) => void;
}

export function PhoneAppGrid({ apps, onAppClick }: PhoneAppGridProps) {
  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-4 p-5 pt-6">
      {apps.map((app, index) => (
        <motion.button
          key={app.id}
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
          onClick={() => onAppClick(app.id)}
          className="flex flex-col items-center gap-1.5 group"
        >
          <div className="relative w-14 h-14 rounded-[22%] overflow-hidden shadow-sm group-hover:scale-105 transition-transform"
          >
            <img
              src={app.icon}
              alt={app.name}
              className="w-full h-full object-cover scale-110"
              draggable={false}
            />
            {app.badge && app.badge > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F43F5E] text-white text-[10px] font-bold flex items-center justify-center border border-white"
              >
                {app.badge > 99 ? '99+' : app.badge}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium text-slate-700/90 text-center leading-tight max-w-full px-1 truncate">
            {app.name}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
