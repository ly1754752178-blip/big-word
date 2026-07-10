// src/components/overlays/SkillsOverlay/SkillNodeDetail.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import type { SkillNode } from '@/types';
import { panelVariants } from './node-animations';

interface SkillNodeDetailProps {
  node: SkillNode | null;
  color: string;
}

export function SkillNodeDetail({ node, color }: SkillNodeDetailProps) {
  return (
    <AnimatePresence mode="wait">
      {node ? (
        <motion.div
          key={node.id}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute right-4 top-16 bottom-4 w-56 rounded-2xl bg-white/95 border border-slate-200/80 shadow-lg p-4 flex flex-col gap-3 overflow-y-auto z-10"
        >
          {/* 节点图标与名称 */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: node.unlocked
                  ? `linear-gradient(135deg, ${color}, ${color}CC)`
                  : 'linear-gradient(135deg, #CBD5E1, #94A3B8)',
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">{node.name}</h4>
              <span className="text-[10px] text-slate-500">
                Lv.{node.level}/{node.maxLevel}
              </span>
            </div>
          </div>

          {/* 解锁状态 */}
          {!node.unlocked && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 rounded-lg px-2 py-1.5">
              <Lock className="w-3 h-3" />
              <span>未解锁</span>
            </div>
          )}

          {/* 描述 */}
          <p className="text-xs text-slate-600 leading-relaxed">{node.description}</p>

          {/* 升级按钮 */}
          {node.unlocked && node.level < node.maxLevel && (
            <button
              type="button"
              className="mt-auto w-full py-2 rounded-xl text-white text-xs font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
            >
              升级（消耗 1 技能点）
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute right-4 top-16 bottom-4 w-56 rounded-2xl bg-white/60 border border-dashed border-slate-200 flex items-center justify-center"
        >
          <p className="text-xs text-slate-400 text-center px-4">点击节点<br />查看详情</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
