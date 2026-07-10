// src/components/overlays/SkillsOverlay/SkillCard.tsx
import { motion } from 'framer-motion';
import {
  Sparkles, UtensilsCrossed, Brush, Code, Wand2, ChefHat, Soup, Box, Archive,
  Layout, Component, Palette, Network, Clover, Eye, Shirt, Lamp, Cookie,
  Coffee, Music, BookOpen, PenTool, MapPin, Star,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { SkillTree } from '@/types';
import { cardVariants } from './node-animations';

const skillIconMap: Record<string, ComponentType<any>> = {
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
  'book-open': BookOpen,
  'pen-tool': PenTool,
  'map-pin': MapPin,
  'star': Star,
};

interface SkillCardProps {
  skill: SkillTree;
  color: string;
  onClick: (skill: SkillTree) => void;
}

export function SkillCard({ skill, color, onClick }: SkillCardProps) {
  const unlocked = skill.level > 0;
  const Icon = skillIconMap[skill.icon] ?? Sparkles;
  const expPercent = skill.maxExp > 0 ? (skill.exp / skill.maxExp) * 100 : 0;

  return (
    <motion.button
      type="button"
      variants={cardVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      layoutId={`skill-card-${skill.id}`}
      onClick={() => onClick(skill)}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-colors text-left
        ${unlocked
          ? 'bg-white/90 border-slate-200/80 shadow-sm'
          : 'bg-slate-50/60 border-dashed border-slate-200 opacity-60'}`}
      style={unlocked ? { borderColor: `${color}40` } : {}}
    >
      {/* 图标区 */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: unlocked
            ? `linear-gradient(135deg, ${color}, ${color}CC)`
            : 'linear-gradient(135deg, #CBD5E1, #94A3B8)',
        }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* 名称 */}
      <span className="text-xs font-bold text-slate-800 text-center leading-tight">
        {skill.name}
      </span>

      {/* 进度条 */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${expPercent}%`,
            background: unlocked
              ? `linear-gradient(90deg, ${color}, ${color}AA)`
              : '#CBD5E1',
          }}
        />
      </div>

      {/* 等级与技能点 */}
      <div className="flex items-center gap-2 text-[10px]">
        <span className={`font-number font-bold ${unlocked ? 'text-slate-700' : 'text-slate-400'}`}>
          Lv.{skill.level}/{skill.maxLevel}
        </span>
        {unlocked && skill.skillPoints > 0 && (
          <span className="font-number text-amber-500 flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" />
            {skill.skillPoints}
          </span>
        )}
      </div>

      {/* 解锁光效边 */}
      {unlocked && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-30"
          style={{
            background: `linear-gradient(135deg, ${color}20, transparent 60%)`,
          }}
        />
      )}
    </motion.button>
  );
}
