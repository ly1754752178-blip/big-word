/**
 * SkillNodeDetail — 浮动详情卡片
 * 毛玻璃 + 弹簧动画 + 星级指示器
 */
import { motion } from 'framer-motion';
import { Lock, Star, X } from 'lucide-react';
import type { SkillNode } from '@/types';

interface Props { node: SkillNode; color: string; position: { x: number; y: number }; onClose: () => void; }

export function SkillNodeDetail({ node, color, position, onClose }: Props) {
  return (
    <motion.aside
      id={`node-detail-${node.id}`}
      aria-label={`${node.name} 详情`}
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 10 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className="absolute z-50 w-56 pointer-events-auto"
      style={{ left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%, -120%)' }}>
      {/* 三角指示器 */}
      <div className="flex justify-center">
        <div className="w-3 h-3 rotate-45 -mb-[6px]" style={{ background: `linear-gradient(135deg, ${color}20, ${color}08)` }} />
      </div>

      {/* 卡片 */}
      <div className="rounded-2xl overflow-hidden border shadow-2xl backdrop-blur-2xl"
        style={{ background: `linear-gradient(135deg, ${color}14, rgba(15,15,25,0.94))`, borderColor: `${color}30`,
          boxShadow: `0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px ${color}15 inset, 0 0 80px ${color}08` }}>
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
        <div className="p-4">
          <button onClick={e => { e.stopPropagation(); onClose(); }}
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={12} className="text-white/40" />
          </button>

          <h4 className="font-bold text-sm text-white mb-1 pr-5"
            style={{ fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>{node.name}</h4>

          {/* 星级 */}
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: node.maxLevel }).map((_, i) => (
              <Star key={i} size={11} className={i < node.level ? 'text-amber-400' : 'text-white/10'}
                fill={i < node.level ? 'currentColor' : 'none'} />
            ))}
            <span className="text-[10px] text-white/30 ml-1"
              style={{ fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>Lv.{node.level}/{node.maxLevel}</span>
          </div>

          {!node.unlocked ? (
            <div className="flex items-center gap-1.5 text-[11px] text-white/30 mb-2">
              <Lock size={10} /><span>未解锁</span>
            </div>
          ) : (
            <div className="text-[11px] font-medium mb-2" style={{ color }}>✦ 已习得</div>
          )}

          {node.description && (
            <p className="text-[11px] leading-relaxed text-white/50 border-t pt-2 mb-2"
              style={{ borderColor: `${color}15`, fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>
              {node.description}
            </p>
          )}

          {node.unlocked && node.level < node.maxLevel && (
            <button id={`upgrade-${node.id}`}
              className="w-full py-1.5 rounded-lg text-[11px] font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)`, fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>
              升级（消耗 1 技能点）
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
