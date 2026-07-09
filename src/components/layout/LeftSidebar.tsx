import { useGame } from '@/hooks/useGameState';
import { SidebarTab } from '@/types';
import { User, Sparkles, Users, Wallet, Calendar, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
    <aside className="w-16 h-full bg-cream-50 border-r border-slate-100 flex flex-col items-center py-4 gap-3 z-10">
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const active = state.activeTab === item.id;
        return (
          <motion.button
            key={item.id}
            id={`sidebar-${item.id}`}
            onClick={() => handleClick(item.id)}
            whileTap={{ scale: 0.92 }}
            className={cn(
              'relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200',
              active
                ? 'bg-sky-500 text-white shadow-glow-sky scale-105'
                : 'bg-white text-slate-500 hover:bg-sky-50 hover:text-sky-500 shadow-soft'
            )}
            aria-label={item.label}
            title={item.label}
          >
            <Icon className="w-5 h-5 relative z-10" />
          </motion.button>
        );
      })}
    </aside>
  );
}
