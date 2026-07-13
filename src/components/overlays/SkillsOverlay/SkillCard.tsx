/**
 * SkillCard — 技能卡牌（暖色系 + 清晰边框）
 */
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { SkillTree } from '@/types';

interface Props { skill: SkillTree; color: string; onClick: (s: SkillTree) => void; index: number; }

const iconMap: Record<string, string> = {
  UtensilsCrossed: '🍳', Code: '💻', Wand2: '✨', Music: '🎵', Palette: '🎨',
  BookOpen: '📖', Heart: '💚', Brain: '🧠', Dumbbell: '💪', Briefcase: '💼',
};

export function SkillCard({ skill, color, onClick, index }: Props) {
  const learned = skill.nodes.filter(n => n.unlocked).length;
  const total = skill.nodes.length;
  const pct = total > 0 ? (learned / total) * 100 : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 350, damping: 26 }}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(skill)}
      className="relative p-4 rounded-2xl cursor-pointer overflow-hidden group transition-shadow"
      style={{
        background: '#FFFBF7',
        border: '1.5px solid #E8DFD3',
        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
            {iconMap[skill.icon] ?? '📦'}
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: '#4A3728' }}>{skill.name}</h3>
            <p className="text-[10px]" style={{ color: '#B8A898' }}>{learned}/{total} 节点</p>
          </div>
        </div>

        <div className="h-1.5 rounded-full mb-2 overflow-hidden" style={{ background: '#EDE5DA' }}>
          <motion.div className="h-full rounded-full"
            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, delay: index * 0.08 }}
            style={{ background: color }} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star key={i} size={10}
                className={i < Math.min(skill.level, 3) ? 'text-amber-500' : 'text-amber-200/60'}
                fill={i < Math.min(skill.level, 3) ? 'currentColor' : 'none'} />
            ))}
            <span className="text-[10px] ml-1" style={{ color: '#B8A898' }}>Lv.{skill.level}</span>
          </div>
          {skill.skillPoints > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color, background: `${color}12`, border: `1px solid ${color}20` }}>+{skill.skillPoints}</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
