import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface FullscreenOverlayProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  accent?: 'status' | 'talent' | 'social' | 'wealth' | 'calendar' | 'map' | 'default';
}

const accentBarClass: Record<NonNullable<FullscreenOverlayProps['accent']>, string> = {
  status: 'bg-gradient-to-r from-status-coral to-status-salmon',
  talent: 'bg-gradient-to-r from-talent-violet via-talent-magenta to-talent-gold',
  social: 'bg-gradient-to-r from-social-teal to-social-cyan',
  wealth: 'bg-gradient-to-r from-wealth-emerald to-wealth-gold',
  calendar: 'bg-gradient-to-r from-calendar-indigo to-calendar-sky',
  map: 'bg-gradient-to-r from-map-earth to-map-sunset',
  default: 'bg-gradient-to-r from-accent-sunset to-accent-amber',
};

export function FullscreenOverlay({
  title,
  children,
  isOpen,
  onClose,
  className,
  accent = 'default',
}: FullscreenOverlayProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col bg-text-primary/60 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'relative m-4 md:m-6 flex flex-col rounded-3xl overflow-hidden bg-bg-card-floating shadow-floating border border-white/60',
              className
            )}
          >
            {/* 顶部强调条 */}
            <div className={cn('h-1.5 w-full', accentBarClass[accent])} />

            {/* 标题栏 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft/60 bg-white/40">
              <h2 className="font-heading text-xl md:text-2xl font-bold text-text-primary">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-bg-glass hover:bg-bg-glass/70 border border-border-soft flex items-center justify-center transition-colors"
                aria-label="关闭"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8 grain-overlay">
              <div className="relative z-10 h-full">{children}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
