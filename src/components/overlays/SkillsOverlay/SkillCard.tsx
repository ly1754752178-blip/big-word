/**
 * SkillCard — 技能卡牌
 * 毛玻璃 + 渐变光晕 + hover 浮起 + 进度光环
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
      id={`skill-card-${skill.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 350, damping: 26 }}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(skill)}
      className="relative p-5 rounded-2xl border border-white/10 cursor-pointer overflow-hidden group"
      style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}
    >
      {/* hover 光晕 */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}20, transparent 70%)` }} />

      <div className="relative z-10">
        {/* 图标 + 名称 */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)` }}>
            {iconMap[skill.icon] ?? '📦'}
          </div>
          <div>
            <h3 className="font-bold text-sm text-white"
              style={{ fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>
              {skill.name}
            </h3>
            <p className="text-[10px] text-white/40"
              style={{ fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>
              {learned}/{total} 节点
            </p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="h-1 rounded-full bg-white/5 mb-2 overflow-hidden">
          <motion.div className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
        </div>

        {/* 等级 + 技能点 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star key={i} size={10} className={i < Math.min(skill.level, 3) ? 'text-amber-400' : 'text-white/10'}
                fill={i < Math.min(skill.level, 3) ? 'currentColor' : 'none'} />
            ))}
            <span className="text-[10px] text-white/30 ml-1"
              style={{ fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>
              Lv.{skill.level}
            </span>
          </div>
          {skill.skillPoints > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color, background: `${color}15`, fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}>
              +{skill.skillPoints}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
