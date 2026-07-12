import { useEffect, useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
  /** 无缝模式——去掉卡片容器，内容直接铺满 */
  seamless?: boolean;
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

// 退场动画持续时间（ms）
const EXIT_DURATION = 250;

export function FullscreenOverlay({
  title,
  children,
  isOpen,
  onClose,
  className,
  accent = 'default',
  seamless = false,
}: FullscreenOverlayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 自管理开关状态：延迟卸载 DOM 以实现退场动画
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // 管理打开/关闭状态
  useEffect(() => {
    if (isOpen && !mounted) {
      setMounted(true);
      setExiting(false);
    } else if (!isOpen && mounted && !exiting) {
      // 开始退场动画
      setExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setMounted(false);
        setExiting(false);
      }, EXIT_DURATION);
    }
  }, [isOpen, mounted, exiting]);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!mounted) return;

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
    wrapper.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('keydown', handleEscape);
      wrapper.removeEventListener('wheel', handleWheel);
    };
  }, [mounted, handleEscape]);

  // 完全卸载后不渲染任何内容
  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* 遮罩层 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 内容定位层 */}
      <motion.div
        ref={wrapperRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-center justify-center p-4 md:p-6 pointer-events-none"
      >
        {/* 无缝模式：内容直接铺满，无边卡 */}
        {seamless ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: exiting ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto absolute inset-0 flex flex-col"
          >
            <div className="relative flex items-center justify-between px-6 py-4 shrink-0">
              <div className="w-10 h-10" />
              <h2 className="flex-1 text-center font-heading text-xl font-bold text-white/80">{title}</h2>
              <button
                type="button" onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-hidden">
              <div className="relative z-10 h-full">{children}</div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={exiting ? { y: 40, opacity: 0, scale: 0.96 } : { y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={cn(
              'pointer-events-auto relative max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)] w-full max-w-6xl flex flex-col rounded-3xl overflow-hidden bg-cream-50 shadow-soft-lg border border-white/80',
              className
            )}
          >
            <div className={cn('h-1.5 w-full', accentBarClass[accent])} />
            <div className="relative flex items-center px-6 py-4 border-b border-slate-100 bg-white/60 shrink-0">
              <div className="w-10 h-10" />
              <h2 className="flex-1 text-center font-heading text-xl md:text-2xl font-bold text-slate-800">{title}</h2>
              <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-cream-50 hover:bg-white border border-slate-100 flex items-center justify-center transition-colors shrink-0" aria-label="关闭">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-scroll p-5 md:p-8 grain-overlay">
              <div className="relative z-10">{children}</div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
