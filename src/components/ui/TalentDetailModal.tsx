import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Talent } from '@/types';

interface TalentDetailModalProps {
  talent: Talent | null;
  onClose: () => void;
}

const rarityMeta: Record<Talent['rarity'], { label: string; color: string; bg: string }> = {
  common: { label: '普通', color: 'text-slate-600', bg: 'bg-slate-100' },
  rare: { label: '稀有', color: 'text-sky-600', bg: 'bg-sky-100' },
  epic: { label: '史诗', color: 'text-purple-600', bg: 'bg-purple-100' },
  legendary: { label: '传说', color: 'text-amber-600', bg: 'bg-amber-100' },
};

export function TalentDetailModal({ talent, onClose }: TalentDetailModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!talent) return;
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [talent, handleEscape]);

  if (!talent) return null;

  const rarity = rarityMeta[talent.rarity];

  return (
    <AnimatePresence>
      {talent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm"
          >
            <GlassCard variant="lavender" className="p-5 overflow-hidden">
              {/* 关闭按钮 */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center transition-colors"
                aria-label="关闭"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>

              {/* 头部 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender-300 to-lavender-500 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-800 truncate">{talent.name}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${rarity.bg} ${rarity.color}`}>
                    {rarity.label}
                  </span>
                </div>
              </div>

              {/* 详情字段 */}
              <div className="space-y-3">
                {typeof talent.level === 'number' && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">等级</span>
                    <span className="text-sm font-bold text-slate-700">Lv.{talent.level}</span>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-500 mb-0.5">介绍</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{talent.description}</p>
                </div>

                {talent.effect && (
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">效果</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{talent.effect}</p>
                  </div>
                )}

                {talent.acquiredAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">获得时间</span>
                    <span className="text-sm text-slate-700 font-number">{talent.acquiredAt}</span>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
