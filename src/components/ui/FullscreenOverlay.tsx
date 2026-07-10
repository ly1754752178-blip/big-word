import { useEffect, useCallback, useRef } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const scrollEl = scrollRef.current;
      if (scrollEl) {
        scrollEl.scrollTop += e.deltaY;
      }
    };

    document.addEventListener('keydown', handleEscape);
    // 滚轮监听放在内容包裹层上
    wrapper.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('keydown', handleEscape);
      wrapper.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          {/* 遮罩层 —— 独立于内容，只负责关闭 */}
          <motion.div
            key="overlay-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 内容定位层 —— pointer-events-none 让空白区点击穿透到遮罩 */}
          <motion.div
            key="overlay-wrapper"
            ref={wrapperRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center p-4 md:p-6 pointer-events-none"
          >
            {/* 内容卡片 —— pointer-events-auto 恢复交互 */}
            <motion.div
              key="overlay-content"
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className={cn(
                'pointer-events-auto relative max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)] w-full max-w-6xl flex flex-col rounded-3xl overflow-hidden bg-cream-50 shadow-soft-lg border border-white/80',
                className
              )}
            >
              {/* 顶部强调条 */}
              <div className={cn('h-1.5 w-full', accentBarClass[accent])} />

              {/* 标题栏 */}
              <div className="relative flex items-center px-6 py-4 border-b border-slate-100 bg-white/60 shrink-0">
                <div className="w-10 h-10" />
                <h2 className="flex-1 text-center font-heading text-xl md:text-2xl font-bold text-slate-800">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-cream-50 hover:bg-white border border-slate-100 flex items-center justify-center transition-colors shrink-0"
                  aria-label="关闭"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* 内容区 */}
              <div
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-scroll p-5 md:p-8 grain-overlay"
              >
                <div className="relative z-10">{children}</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
