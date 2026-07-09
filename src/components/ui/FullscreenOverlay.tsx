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
  status: 'bg-gradient-to-r from-coral-300 to-coral-500',
  talent: 'bg-gradient-to-r from-lavender-300 via-purple-300 to-amber-300',
  social: 'bg-gradient-to-r from-sky-300 to-cyan-300',
  wealth: 'bg-gradient-to-r from-mint-300 to-emerald-300',
  calendar: 'bg-gradient-to-r from-sky-300 to-lavender-300',
  map: 'bg-gradient-to-r from-orange-300 to-sky-300',
  default: 'bg-gradient-to-r from-sky-400 to-coral-300',
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
          className="fixed inset-0 z-50 flex flex-col bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'relative m-4 md:m-6 flex flex-col rounded-3xl overflow-hidden bg-cream-50 shadow-soft-lg border border-white/80',
              className
            )}
          >
            {/* 顶部强调条 */}
            <div className={cn('h-1.5 w-full', accentBarClass[accent])} />

            {/* 标题栏 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/60">
              <h2 className="font-heading text-xl md:text-2xl font-bold text-slate-800">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-cream-50 hover:bg-white border border-slate-100 flex items-center justify-center transition-colors"
                aria-label="关闭"
              >
                <X className="w-5 h-5 text-slate-500" />
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
