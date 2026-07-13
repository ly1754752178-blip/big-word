import { useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import {
  Sparkles, Heart, Moon, BookOpen, ChevronRight,
  UtensilsCrossed, Code, Wand2, ChefHat, Soup, Box,
  Archive, Brush, Layout, Component, Palette, Network,
  Clover, Eye, Shirt, Lamp, Cookie, Coffee, Music,
  BookOpen as BookOpenIcon, PenTool, MapPin, Star,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { TalentDetailModal } from '@/components/ui/TalentDetailModal';
import type { Talent, SkillCategory } from '@/types';

const talentIconMap: Record<string, typeof Heart> = {
  heart: Heart,
  moon: Moon,
  'book-open': BookOpen,
};

// 技能图标映射 —— 字符串 → Lucide 组件
const skillIconMap: Record<string, React.ComponentType<any>> = {
  'utensils-crossed': UtensilsCrossed,
  'broom': Brush,
  'code': Code,
  'wand-2': Wand2,
  'chef-hat': ChefHat,
  'soup': Soup,
  'box': Box,
  'archive': Archive,
  'sparkles': Sparkles,
  'layout': Layout,
  'component': Component,
  'palette': Palette,
  'network': Network,
  'clover': Clover,
  'eye': Eye,
  'shirt': Shirt,
  'lamp': Lamp,
  'cookie': Cookie,
  'coffee': Coffee,
  'music': Music,
  'book-open': BookOpenIcon,
  'pen-tool': PenTool,
  'map-pin': MapPin,
  'star': Star,
};

const categoryMeta: Record<SkillCategory, { label: string; icon: typeof UtensilsCrossed; color: string; bg: string }> = {
  daily: { label: '通用领域', icon: UtensilsCrossed, color: '#D4A853', bg: 'from-amber-300/30 to-amber-500/20' },
  work: { label: '专业领域', icon: Code, color: '#0EA5E9', bg: 'from-sky-300/30 to-sky-500/20' },
  special: { label: '特殊领域', icon: Wand2, color: '#C084FC', bg: 'from-purple-300/30 to-purple-500/20' },
};

function TalentItem({ talent, onClick }: { talent: Talent; onClick: (talent: Talent) => void }) {
  const Icon = talentIconMap[talent.icon] ?? Sparkles;

  return (
    <button
      type="button"
      onClick={() => onClick(talent)}
      className="group relative flex flex-col items-center gap-1 px-2 py-2 min-w-[56px] rounded-xl bg-white/60 border border-lavender-100 cursor-pointer hover:bg-white/80 transition-colors"
    >
      <Icon className="w-4 h-4 text-lavender-500" />
      <span className="text-[10px] text-slate-700 whitespace-nowrap font-medium">{talent.name}</span>

      {/* hover 提示 */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-44 p-2.5 rounded-xl bg-white border border-slate-100 shadow-soft opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
        <p className="text-xs text-slate-800 font-bold">{talent.name}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-3">{talent.description}</p>
        {talent.rarity && (
          <span className="inline-block mt-1 px-1.5 py-0.5 rounded-md bg-lavender-100 text-lavender-600 text-[10px]">
            {talent.rarity === 'legendary' ? '传说' : talent.rarity === 'epic' ? '史诗' : talent.rarity === 'rare' ? '稀有' : '普通'}
          </span>
        )}
      </div>
    </button>
  );
}

function CategoryCard({ category }: { category: SkillCategory }) {
  const { state, openOverlayView } = useGame();
  const skills = state.skills[category];
  const meta = categoryMeta[category];
  const Icon = meta.icon;

  // 取前9个技能图标用于九宫格展示
  const iconSlots = skills.slice(0, 9);

  return (
    <GlassCard
      variant="default"
      className="p-2.5 w-full cursor-pointer hover:-translate-y-0.5 transition-all"
      onClick={() => openOverlayView('skills', { category })}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${meta.color}30, ${meta.color}50)` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
          </div>
          <span className="text-xs font-bold text-slate-700">{meta.label}</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
      </div>

      {/* 九宫格图标 */}
      <div className="grid grid-cols-3 gap-1">
        {iconSlots.map((skill) => {
          const SkillIcon = skillIconMap[skill.icon];
          return (
            <div
              key={skill.id}
              className="aspect-square rounded-lg border flex flex-col items-center justify-center gap-0.5 px-0.5"
              title={`${skill.name} Lv.${skill.level}/${skill.maxLevel}`}
              style={{
                backgroundColor: `${meta.color}18`,
                borderColor: `${meta.color}30`,
              }}
            >
              {SkillIcon ? (
                <SkillIcon className="w-[22px] h-[22px]" style={{ color: meta.color }} />
              ) : (
                <Sparkles className="w-[22px] h-[22px]" style={{ color: meta.color }} />
              )}
              <span className="text-[10px] text-slate-700 truncate text-center leading-tight max-w-full font-semibold">
                {skill.name}
              </span>
              <span className="text-[9px] text-slate-400 font-number leading-none">
                Lv.{skill.level}/{skill.maxLevel}
              </span>
            </div>
          );
        })}
        {/* 填充空格保持九宫格 */}
        {Array.from({ length: Math.max(0, 9 - iconSlots.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square rounded-lg bg-slate-50/50 border border-dashed border-slate-100" />
        ))}
      </div>

      {skills.length > 9 && (
        <div className="mt-1.5 text-center text-[10px] text-slate-400">
          还有 {skills.length - 9} 个技能...
        </div>
      )}
    </GlassCard>
  );
}

export function TalentsPreview() {
  const { state } = useGame();
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);

  return (
    <div className="space-y-2">
      {/* 天赋才能 —— 居中标题横栏 */}
      <div className="-mx-2.5 -mt-3 px-3 py-3 bg-gradient-to-r from-lavender-50 via-lavender-100/40 to-lavender-50 border-b border-lavender-100/60 text-center">
        <span className="text-base font-bold text-slate-800 tracking-wide">天赋才能</span>
        <div className="mt-1 mx-auto w-8 h-0.5 rounded-full" style={{ backgroundColor: '#8B5CF6' }} />
      </div>

      {/* 天赋列表 —— hover显示简介 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {state.talents.map((talent: Talent) => (
          <TalentItem key={talent.id} talent={talent} onClick={setSelectedTalent} />
        ))}
      </div>

      {/* 三个分类卡片 —— 九宫格图标 */}
      <div className="space-y-2 mt-1">
        {(['daily', 'work', 'special'] as SkillCategory[]).map((cat) => (
          <CategoryCard key={cat} category={cat} />
        ))}
      </div>

      <TalentDetailModal talent={selectedTalent} onClose={() => setSelectedTalent(null)} />
    </div>
  );
}
