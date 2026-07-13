/**
 * SkillNodeDetail — 浮动详情卡片（暖色系）
 */
import { motion } from 'framer-motion';
import { Lock, Star, X } from 'lucide-react';
import type { SkillNode } from '@/types';

interface Props { node: SkillNode; color: string; position: { x: number; y: number }; onClose: () => void; }

export function SkillNodeDetail({ node, color, position, onClose }: Props) {
  return (
    <motion.aside
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 10 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className="absolute z-50 w-60 pointer-events-auto"
      style={{ left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%, -120%)' }}
    >
      <div className="flex justify-center">
        <div className="w-3 h-3 rotate-45 -mb-[6px]"
          style={{ background: '#FFFBF7', border: '1px solid #E8DFD3', borderBottom: 'none', borderRight: 'none' }} />
      </div>
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: '#FFFBF7',
          border: '1.5px solid #E8DFD3',
          boxShadow: '0 12px 40px rgba(80,50,30,0.2)',
        }}>
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
        <div className="p-4 relative">
          <button onClick={e => { e.stopPropagation(); onClose(); }}
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center hover:bg-amber-50 transition-colors">
            <X size={12} style={{ color: '#B8A898' }} />
          </button>
          <h4 className="font-bold text-sm mb-1.5 pr-5" style={{ color: '#4A3728' }}>{node.name}</h4>
          <div className="flex items-center gap-1.5 mb-2.5">
            {Array.from({ length: node.maxLevel }).map((_, i) => (
              <Star key={i} size={10}
                className={i < node.level ? 'text-amber-500' : 'text-amber-200/60'}
                fill={i < node.level ? 'currentColor' : 'none'} />
            ))}
            <span className="text-[10px] ml-0.5" style={{ color: '#B8A898' }}>Lv.{node.level}/{node.maxLevel}</span>
          </div>
          {!node.unlocked ? (
            <div className="flex items-center gap-1.5 text-[11px] mb-2.5" style={{ color: '#B8A898' }}>
              <Lock size={10} /><span>未解锁</span>
            </div>
          ) : (
            <div className="text-[11px] font-semibold mb-2.5" style={{ color }}>✦ 已习得</div>
          )}
          {node.description && (
            <p className="text-[11px] leading-relaxed border-t pt-2.5 mb-2.5"
              style={{ color: '#8B7560', borderColor: '#E8DFD3' }}>{node.description}</p>
          )}
          {node.unlocked && node.level < node.maxLevel && (
            <button className="w-full py-2 rounded-lg text-[11px] font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}>
              升级（消耗 1 技能点）
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
