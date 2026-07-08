import { useGame } from '@/hooks/useGameState';
import { SidebarTab } from '@/types';
import { User, Sparkles, Users, Wallet, Calendar, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const sidebarItems: { id: SidebarTab; label: string; icon: typeof User }[] = [
  { id: 'status', label: '个人状态', icon: User },
  { id: 'talents', label: '天赋才能', icon: Sparkles },
  { id: 'social', label: '社交关系', icon: Users },
  { id: 'wealth', label: '财富资产', icon: Wallet },
  { id: 'calendar', label: '日历事件', icon: Calendar },
  { id: 'settings', label: '系统设置', icon: Settings },
];

export function LeftSidebar() {
  const { state, setActiveTab, setPreviewTab } = useGame();

  const handleClick = (id: SidebarTab) => {
    setActiveTab(id);
    setPreviewTab(id);
  };

  return (
    <aside className="w-14 h-full bg-bg-card-raised/80 backdrop-blur-md border-r border-border-soft flex flex-col items-center py-3 gap-2 z-10">
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const active = state.activeTab === item.id;
        return (
          <motion.button
            key={item.id}
            id={`sidebar-${item.id}`}
            onClick={() => handleClick(item.id)}
            whileTap={{ scale: 0.92 }}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors group"
            aria-label={item.label}
            title={item.label}
          >
            <motion.div
              className={`absolute inset-0 rounded-xl ${active ? 'bg-accent-sunset/20' : 'bg-transparent group-hover:bg-white/50'}`}
              layoutId="sidebar-bg"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            <Icon
              className={`w-5 h-5 relative z-10 transition-colors ${active ? 'text-accent-sunset' : 'text-text-secondary group-hover:text-text-primary'}`}
            />

            {active && (
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-accent-sunset" />
            )}
          </motion.button>
        );
      })}
    </aside>
  );
}
