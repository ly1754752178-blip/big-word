// SkillNodeDetail — 浮动详情卡片
// 选中节点时在节点附近弹出毛玻璃卡片，取代固定右侧面板
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, X } from 'lucide-react';
import type { SkillNode } from '@/types';

interface SkillNodeDetailProps {
  node: SkillNode | null;
  color: string;
  /** 节点在 viewBox 坐标系中的位置（用于定位卡片） */
  position?: { x: number; y: number } | null;
  onClose: () => void;
}

export function SkillNodeDetail({ node, color, position, onClose }: SkillNodeDetailProps) {
  return (
    <AnimatePresence>
      {node && position && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 6 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          style={{
            position: 'absolute',
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -120%)',
            zIndex: 50,
            pointerEvents: 'auto',
          }}
          className="w-56"
        >
          {/* 小三角指示器 */}
          <div className="flex justify-center">
            <div
              className="w-3 h-3 rotate-45 -mb-[6px]"
              style={{ background: `linear-gradient(135deg, ${color}18, ${color}08)` }}
            />
          </div>

          {/* 卡片主体 */}
          <div
            className="rounded-xl overflow-hidden border shadow-2xl backdrop-blur-xl"
            style={{
              background: `linear-gradient(135deg, ${color}14, rgba(255,255,255,0.92))`,
              borderColor: `${color}30`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px ${color}18 inset, 0 0 60px ${color}10`,
            }}
          >
            {/* 顶部色条 */}
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />

            <div className="p-4">
              {/* 关闭按钮 */}
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
              >
                <X size={12} className="text-slate-400" />
              </button>

              {/* 名称 */}
              <h3 className="font-bold text-sm text-slate-800 mb-1 pr-5">
                {node.name}
              </h3>

              {/* 等级 */}
              <div className="flex items-center gap-1.5 mb-2">
                {Array.from({ length: node.maxLevel }).map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={i < node.level ? 'text-amber-400' : 'text-slate-200'}
                    fill={i < node.level ? 'currentColor' : 'none'}
                  />
                ))}
                <span className="text-[10px] text-slate-400 ml-1 font-medium">
                  Lv.{node.level}/{node.maxLevel}
                </span>
              </div>

              {/* 解锁状态 */}
              {!node.unlocked ? (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
                  <Lock size={10} />
                  <span>未解锁</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] font-medium mb-2" style={{ color }}>
                  <Sparkles size={10} />
                  <span>已习得</span>
                </div>
              )}

              {/* 描述 */}
              {node.description && (
                <p className="text-[11px] leading-relaxed text-slate-500 border-t pt-2"
                  style={{ borderColor: `${color}15` }}>
                  {node.description}
                </p>
              )}

              {/* 下一级提示 */}
              {node.unlocked && node.level < node.maxLevel && (
                <div className="mt-2 pt-2 border-t" style={{ borderColor: `${color}15` }}>
                  <button
                    className="w-full py-1.5 rounded-lg text-[11px] font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
                  >
                    升级 ({node.level}/{node.maxLevel})
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Sparkles({ size, className = '' }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className}>
      <path d="M8 0l1.5 4.5L14 2l-2 4.5L16 8l-4.5 1.5L14 14l-4.5-2L8 16l-1.5-4.5L2 14l2-4.5L0 8l4.5-1.5L2 2l4.5 2z"
        fill="currentColor" opacity="0.8" />
    </svg>
  );
}
