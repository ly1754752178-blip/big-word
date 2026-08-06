/**
 * SkillNodeDetail — 右上角玻璃拟态详情面板
 * 固定在技能树界面右上角，不跟随节点移动
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, X, Sparkles } from 'lucide-react';
import type { SkillNode, SkillTree } from '@/types';

interface Props {
  skill: SkillTree;
  node: SkillNode | null;
  color: string;
  onClose: () => void;
}

export function SkillNodeDetail({ skill, node, color, onClose }: Props) {
  return (
    <aside
      className="absolute top-4 right-4 z-50 w-64 pointer-events-auto"
      style={{ maxHeight: 'calc(100% - 2rem)' }}
    >
      <AnimatePresence mode="wait">
        {node ? (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'rgba(255, 251, 247, 0.78)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1.5px solid rgba(255, 255, 255, 0.55)',
              boxShadow: '0 10px 36px rgba(80, 50, 30, 0.14)',
            }}
          >
            <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
            <div className="p-4 relative overflow-y-auto">
              <button
                onClick={e => { e.stopPropagation(); onClose(); }}
                className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center hover:bg-amber-50/80 transition-colors"
                aria-label="关闭"
              >
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
                  style={{ color: '#8B7560', borderColor: 'rgba(232, 223, 211, 0.8)' }}>{node.description}</p>
              )}
              {node.unlocked && node.level < node.maxLevel && (
                <button className="w-full py-2 rounded-lg text-[11px] font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}>
                  升级（消耗 1 技能点）
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255, 251, 247, 0.7)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 10px 36px rgba(80, 50, 30, 0.12)',
            }}
          >
            <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} style={{ color }} />
                <h4 className="font-bold text-sm" style={{ color: '#4A3728' }}>{skill.name}</h4>
              </div>
              <p className="text-[11px] leading-relaxed mb-2.5" style={{ color: '#8B7560' }}>
                点击节点查看详情与升级。再次点击已展开节点可收起整棵子树。
              </p>
              <div className="flex items-center justify-between text-[10px]" style={{ color: '#A89880' }}>
                <span>等级 {skill.level}/{skill.maxLevel}</span>
                <span>节点 {skill.nodes.length}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
