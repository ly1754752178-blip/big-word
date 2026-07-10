# 技能大界面重做 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 TalentsSkillsOverlay + SkillTreeOverlay 合并为日系轻小说风格的 SkillsOverlay，包含三标签切换、精美技能卡牌阵列、星座技能树可视化，以及卡片→技能树的共享布局动画。

**Architecture:** 创建 `SkillsOverlay/` 目录包含 7 个文件，通过内部 `viewMode` 状态管理 grid/tree 两种视图。使用 Framer Motion `layoutId` 实现卡片到技能树的共享布局过渡。删除两个旧 overlay 组件，更新类型系统和 OverlayRenderer 路由。

**Tech Stack:** React 18 + TypeScript + Tailwind CSS 3.4 + Framer Motion 11 + Lucide React

## Global Constraints

- 所有新组件位于 `src/components/overlays/SkillsOverlay/` 目录
- 标签名称：通用领域、专业领域、特殊领域（非日常/工作/特殊技能）
- 技能树保持 SVG 径向星座图结构，支持自定义背景图
- 卡片→树过渡使用 Framer Motion layoutId 共享布局动画
- 不得影响页面其他交互
- TypeScript 类型检查必须通过

---

## 文件结构映射

| 操作 | 路径 | 职责 |
|------|------|------|
| 新建 | `src/components/overlays/SkillsOverlay/node-animations.ts` | Framer Motion 动画变体定义 |
| 新建 | `src/components/overlays/SkillsOverlay/CategoryTabs.tsx` | 三标签切换栏 |
| 新建 | `src/components/overlays/SkillsOverlay/StatsBanner.tsx` | 技能统计横幅 |
| 新建 | `src/components/overlays/SkillsOverlay/SkillCard.tsx` | 单张技能卡牌 |
| 新建 | `src/components/overlays/SkillsOverlay/SkillCardGrid.tsx` | 卡牌阵列容器 |
| 新建 | `src/components/overlays/SkillsOverlay/SkillNodeDetail.tsx` | 树节点详情面板 |
| 新建 | `src/components/overlays/SkillsOverlay/SkillTreeView.tsx` | 星座技能树 SVG 画布 |
| 新建 | `src/components/overlays/SkillsOverlay/index.tsx` | 主组件，模式管理 |
| 修改 | `src/types/index.ts` | 添加 `'skills'` 到 OverlayViewType |
| 修改 | `src/context/GameContext.tsx` | 更新 overlayTitles |
| 修改 | `src/components/overlays/OverlayRenderer.tsx` | 路由 skills → SkillsOverlay |
| 修改 | `src/components/layout/previews/TalentsPreview.tsx` | 改用 `'skills'` |
| 删除 | `src/components/overlays/TalentsSkillsOverlay.tsx` | 被 SkillsOverlay 替代 |
| 删除 | `src/components/overlays/SkillTreeOverlay.tsx` | 被 SkillTreeView 替代 |

---

### Task 1: 更新类型定义

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Produces: `OverlayViewType` 新增 `'skills'` 成员；其他文件可引用

- [ ] **Step 1: 在 OverlayViewType 中添加 'skills'**

找到 `src/types/index.ts` 中 `OverlayViewType` 定义（约第 18 行），在 `'status'` 之后插入 `'skills'`：

```ts
export type OverlayViewType =
  | 'status'
  | 'skills'
  | 'social'
  | 'wealth'
  | 'calendar'
  | 'settings'
  | 'skillTree'
  | 'network'
  | 'history'
  | 'calendarFull'
  | 'characters'
  | 'characterDetail'
  | 'creativeWorkshop'
  | 'shop'
  | 'memories'
  | 'achievements';
```

注意：暂时保留 `'skillTree'` 和 `'talents'`（如果存在），等旧组件删除后再清理。如 `'talents'` 在当前版本中存在，也先保留。

- [ ] **Step 2: 运行 TypeScript 类型检查**

```bash
cd F:/AI/no2 && npx tsc --noEmit 2>&1 | head -30
```

预期：无新增类型错误（只有项目已有的类型警告/错误）。

- [ ] **Step 3: 提交**

```bash
git add src/types/index.ts
git commit -m "feat(types): add 'skills' to OverlayViewType"
```

---

### Task 2: 创建动画变体定义

**Files:**
- Create: `src/components/overlays/SkillsOverlay/node-animations.ts`

**Interfaces:**
- Produces: `cardVariants`, `nodeVariants`, `gridVariants`, `overlayTransition` — 导出给 SkillCard、SkillTreeView、SkillCardGrid、index.tsx 使用

- [ ] **Step 1: 创建文件**

```ts
// src/components/overlays/SkillsOverlay/node-animations.ts
// 技能大界面共享动画变体定义
import type { Variants, Transition } from 'framer-motion';

/** 技能卡牌 hover/tap 动画 */
export const cardVariants: Variants = {
  idle: { scale: 1, y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  hover: { scale: 1.04, y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)', transition: { type: 'spring', stiffness: 400, damping: 25 } },
  tap: { scale: 0.97, transition: { type: 'spring', stiffness: 600, damping: 30 } },
};

/** 技能树节点弹出动画 */
export const nodeVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20, delay: i * 0.06 },
  }),
  exit: { scale: 0, opacity: 0, transition: { duration: 0.2 } },
};

/** 卡牌网格容器动画 */
export const gridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/** 详情面板滑入 */
export const panelVariants: Variants = {
  hidden: { x: 30, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { x: 30, opacity: 0, transition: { duration: 0.15 } },
};

/** 标签内容区滑动过渡 */
export const tabContentTransition: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 28,
};

/** 共享过渡配置 */
export const overlayTransition: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 30,
};
```

- [ ] **Step 2: 提交**

```bash
git add src/components/overlays/SkillsOverlay/node-animations.ts
git commit -m "feat: add skills overlay animation variants"
```

---

### Task 3: 创建 CategoryTabs 组件

**Files:**
- Create: `src/components/overlays/SkillsOverlay/CategoryTabs.tsx`

**Interfaces:**
- Consumes: `SkillCategory` from `@/types`
- Produces: `<CategoryTabs active={SkillCategory} onChange={(c) => void} />`

- [ ] **Step 1: 创建组件文件**

```tsx
// src/components/overlays/SkillsOverlay/CategoryTabs.tsx
import { motion } from 'framer-motion';
import { UtensilsCrossed, Code, Wand2 } from 'lucide-react';
import type { SkillCategory } from '@/types';

interface TabConfig {
  key: SkillCategory;
  label: string;
  icon: typeof UtensilsCrossed;
  color: string;
}

const tabs: TabConfig[] = [
  { key: 'daily', label: '通用领域', icon: UtensilsCrossed, color: '#8B5CF6' },
  { key: 'work', label: '专业领域', icon: Code, color: '#0EA5E9' },
  { key: 'special', label: '特殊领域', icon: Wand2, color: '#F43F5E' },
];

interface CategoryTabsProps {
  active: SkillCategory;
  onChange: (category: SkillCategory) => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex items-center justify-center gap-1 px-4 pt-2 pb-0" role="tablist">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap
              ${isActive ? 'text-white' : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'}`}
            style={isActive ? { backgroundColor: tab.color } : {}}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="active-tab-underline"
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-white/60"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/overlays/SkillsOverlay/CategoryTabs.tsx
git commit -m "feat: add CategoryTabs component"
```

---

### Task 4: 创建 StatsBanner 组件

**Files:**
- Create: `src/components/overlays/SkillsOverlay/StatsBanner.tsx`

**Interfaces:**
- Consumes: `SkillTree[]` from `@/types`
- Produces: `<StatsBanner skills={SkillTree[]} color={string} />`

- [ ] **Step 1: 创建组件文件**

```tsx
// src/components/overlays/SkillsOverlay/StatsBanner.tsx
import { Sparkles } from 'lucide-react';
import type { SkillTree } from '@/types';

interface StatsBannerProps {
  skills: SkillTree[];
  color: string;
}

export function StatsBanner({ skills, color }: StatsBannerProps) {
  const unlocked = skills.filter((s) => s.level > 0).length;
  const totalSkillPoints = skills.reduce((sum, s) => sum + s.skillPoints, 0);

  return (
    <div
      className="flex items-center justify-between px-5 py-3 rounded-2xl mx-4 border"
      style={{
        background: `linear-gradient(135deg, ${color}14, ${color}08)`,
        borderColor: `${color}25`,
      }}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4" style={{ color }} />
        <span className="text-sm font-semibold text-slate-700">
          已习得 <span className="font-number text-base" style={{ color }}>{unlocked}</span>
          <span className="text-slate-400">/{skills.length}</span> 项
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm text-slate-600">
          可用技能点 <span className="font-number font-bold text-slate-800">{totalSkillPoints}</span>
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/overlays/SkillsOverlay/StatsBanner.tsx
git commit -m "feat: add StatsBanner component"
```

---

### Task 5: 创建 SkillCard 组件

**Files:**
- Create: `src/components/overlays/SkillsOverlay/SkillCard.tsx`

**Interfaces:**
- Consumes: `SkillTree` from `@/types`, `cardVariants` from `./node-animations`
- Produces: `<SkillCard skill={SkillTree} color={string} iconMap={Record<string, ComponentType>} onClick={(skill) => void} />`

- [ ] **Step 1: 创建组件文件**

```tsx
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
```

- [ ] **Step 2: 提交**

```bash
git add src/components/overlays/SkillsOverlay/SkillCard.tsx
git commit -m "feat: add SkillCard component"
```

---

### Task 6: 创建 SkillCardGrid 组件

**Files:**
- Create: `src/components/overlays/SkillsOverlay/SkillCardGrid.tsx`

**Interfaces:**
- Consumes: `SkillTree` from `@/types`; `SkillCard` from `./SkillCard`; `gridVariants` from `./node-animations`
- Produces: `<SkillCardGrid skills={SkillTree[]} color={string} onSkillClick={(s) => void} />`

- [ ] **Step 1: 创建组件文件**

```tsx
// src/components/overlays/SkillsOverlay/SkillCardGrid.tsx
import { motion, AnimatePresence } from 'framer-motion';
import type { SkillTree } from '@/types';
import { SkillCard } from './SkillCard';
import { gridVariants } from './node-animations';

interface SkillCardGridProps {
  skills: SkillTree[];
  color: string;
  onSkillClick: (skill: SkillTree) => void;
  /** 排除的 skillId（展开中的卡片） */
  excluding?: string | null;
}

export function SkillCardGrid({ skills, color, onSkillClick, excluding }: SkillCardGridProps) {
  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4"
    >
      <AnimatePresence>
        {skills.map((skill) => (
          skill.id !== excluding && (
            <SkillCard
              key={skill.id}
              skill={skill}
              color={color}
              onClick={onSkillClick}
            />
          )
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/overlays/SkillsOverlay/SkillCardGrid.tsx
git commit -m "feat: add SkillCardGrid component"
```

---

### Task 7: 创建 SkillNodeDetail 面板

**Files:**
- Create: `src/components/overlays/SkillsOverlay/SkillNodeDetail.tsx`

**Interfaces:**
- Consumes: `SkillNode` from `@/types`; `panelVariants` from `./node-animations`
- Produces: `<SkillNodeDetail node={SkillNode | null} color={string} />`

- [ ] **Step 1: 创建组件文件**

```tsx
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
```

- [ ] **Step 2: 提交**

```bash
git add src/components/overlays/SkillsOverlay/SkillNodeDetail.tsx
git commit -m "feat: add SkillNodeDetail panel"
```

---

### Task 8: 创建 SkillTreeView 星座技能树

**Files:**
- Create: `src/components/overlays/SkillsOverlay/SkillTreeView.tsx`

**Interfaces:**
- Consumes: `SkillTree`, `SkillNode` from `@/types`; `nodeVariants` from `./node-animations`; `SkillNodeDetail` from `./SkillNodeDetail`
- Produces: `<SkillTreeView skill={SkillTree} color={string} onBack={()} />`

- [ ] **Step 1: 创建组件文件**

```tsx
// src/components/overlays/SkillsOverlay/SkillTreeView.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import type { SkillTree, SkillNode } from '@/types';
import { nodeVariants } from './node-animations';
import { SkillNodeDetail } from './SkillNodeDetail';

interface SkillTreeViewProps {
  skill: SkillTree;
  color: string;
  onBack: () => void;
  /** 自定义背景图 URL（可选） */
  backgroundImage?: string;
}

function TreeLines({ skill }: { skill: SkillTree }) {
  return (
    <g>
      {skill.nodes.map((node) =>
        (node.parentIds ?? []).map((pid) => {
          const parent = skill.nodes.find((n) => n.id === pid);
          if (!parent?.position || !node.position) return null;
          const unlocked = node.unlocked && parent.unlocked;
          return (
            <line
              key={`${pid}-${node.id}`}
              x1={parent.position.x}
              y1={parent.position.y}
              x2={node.position.x}
              y2={node.position.y}
              stroke={unlocked ? 'url(#lineGradient)' : '#CBD5E1'}
              strokeWidth={unlocked ? 0.6 : 0.4}
              strokeDasharray={unlocked ? 'none' : '2 2'}
              opacity={unlocked ? 0.7 : 0.35}
            />
          );
        })
      )}
    </g>
  );
}

function TreeCircles({
  skill,
  color,
  selectedId,
  onSelect,
}: {
  skill: SkillTree;
  color: string;
  selectedId: string | null;
  onSelect: (n: SkillNode) => void;
}) {
  return (
    <g>
      {skill.nodes.map((node, i) => {
        if (!node.position) return null;
        const isRoot = !node.parentIds || node.parentIds.length === 0;
        const r = isRoot ? 5.5 : 4;
        const isSelected = node.id === selectedId;
        return (
          <motion.g
            key={node.id}
            custom={i}
            variants={nodeVariants}
            initial="hidden"
            animate="visible"
            style={{ originX: `${node.position.x}px`, originY: `${node.position.y}px` }}
            transform={`translate(${node.position.x}, ${node.position.y})`}
            onClick={() => onSelect(node)}
            className="cursor-pointer"
          >
            {/* 选中脉冲光环 */}
            {isSelected && (
              <circle r={r + 3} fill="none" stroke={color} strokeWidth="0.8" opacity={0.5}>
                <animate attributeName="r" from={r + 3} to={r + 6} dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
            {/* 双重光环（根节点） */}
            {isRoot && node.unlocked && (
              <circle r={r + 2} fill="none" stroke={color} strokeWidth="0.3" opacity={0.35} />
            )}
            {/* 主体圆 */}
            <circle
              r={r}
              fill={node.unlocked ? `url(#nodeGradient-${node.id})` : '#E2E8F0'}
              stroke={node.unlocked ? color : '#94A3B8'}
              strokeWidth={isSelected ? 1.2 : 0.6}
            />
            {/* 渐变定义 */}
            <defs>
              <radialGradient id={`nodeGradient-${node.id}`}>
                <stop offset="0%" stopColor={node.unlocked ? color : '#CBD5E1'} />
                <stop offset="100%" stopColor={node.unlocked ? `${color}88` : '#E2E8F0'} />
              </radialGradient>
            </defs>
            {/* 名称 */}
            <text
              y={r + 3.2}
              textAnchor="middle"
              fontSize={isRoot ? 2.8 : 2.3}
              fill={node.unlocked ? '#1E293B' : '#94A3B8'}
              fontWeight={isRoot ? 'bold' : 'normal'}
              className="select-none pointer-events-none"
            >
              {node.name}
            </text>
            {/* 等级 */}
            <text
              y={r + 5.5}
              textAnchor="middle"
              fontSize="1.8"
              fill={node.unlocked ? '#64748B' : '#CBD5E1'}
              className="select-none pointer-events-none"
            >
              Lv.{node.level}/{node.maxLevel}
            </text>
          </motion.g>
        );
      })}
    </g>
  );
}

export function SkillTreeView({ skill, color, onBack, backgroundImage }: SkillTreeViewProps) {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const expPercent = skill.maxExp > 0 ? (skill.exp / skill.maxExp) * 100 : 0;

  return (
    <motion.div
      layoutId={`skill-card-${skill.id}`}
      className="flex flex-col h-full rounded-2xl overflow-hidden border border-slate-200/80 bg-white/90 shadow-lg"
    >
      {/* 顶部返回栏 */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100 bg-white/70 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color }} />
            <h4 className="font-heading font-bold text-slate-800 text-sm">{skill.name}</h4>
            <span className="text-[10px] text-slate-500">Lv.{skill.level}/{skill.maxLevel}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 max-w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${expPercent}%`, background: `linear-gradient(90deg, ${color}, ${color}AA)` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-number">
              {skill.exp}/{skill.maxExp}
            </span>
          </div>
        </div>
      </div>

      {/* SVG 画布区 */}
      <div className="flex-1 relative min-h-0">
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined, backgroundSize: 'cover' }}>
          {/* 同心圆参考线 */}
          {[15, 30, 45, 60, 75].map((r) => (
            <circle
              key={r}
              cx={50}
              cy={50}
              r={r}
              fill="none"
              stroke="rgba(203,213,225,0.3)"
              strokeWidth="0.3"
              strokeDasharray="1 1"
            />
          ))}

          {/* 连线渐变 */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={`${color}88`} stopOpacity={0.35} />
            </linearGradient>
          </defs>

          <TreeLines skill={skill} />
          <TreeCircles skill={skill} color={color} selectedId={selectedNode?.id ?? null} onSelect={setSelectedNode} />
        </svg>

        {/* 节点详情面板 */}
        <SkillNodeDetail node={selectedNode} color={color} />
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/overlays/SkillsOverlay/SkillTreeView.tsx
git commit -m "feat: add SkillTreeView constellation tree"
```

---

### Task 9: 创建 SkillsOverlay 主组件

**Files:**
- Create: `src/components/overlays/SkillsOverlay/index.tsx`

**Interfaces:**
- Consumes: All sub-components from `./`; `useGame` from `@/hooks/useGameState`
- Produces: `<SkillsOverlay />` — 渲染到 OverlayRenderer

- [ ] **Step 1: 创建主组件文件**

```tsx
// src/components/overlays/SkillsOverlay/index.tsx
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGameState';
import type { SkillCategory, SkillTree } from '@/types';
import { CategoryTabs } from './CategoryTabs';
import { StatsBanner } from './StatsBanner';
import { SkillCardGrid } from './SkillCardGrid';
import { SkillTreeView } from './SkillTreeView';
import { tabContentTransition } from './node-animations';

const categoryColors: Record<SkillCategory, string> = {
  daily: '#8B5CF6',
  work: '#0EA5E9',
  special: '#F43F5E',
};

export function SkillsOverlay() {
  const { state } = useGame();
  const payload = state.detailView?.payload;
  const initialCategory = (payload?.category as SkillCategory) || 'daily';

  const [activeCategory, setActiveCategory] = useState<SkillCategory>(initialCategory);
  const [selectedSkill, setSelectedSkill] = useState<SkillTree | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  const skills = state.skills[activeCategory];
  const color = categoryColors[activeCategory];

  const handleCategoryChange = useCallback((cat: SkillCategory) => {
    const categories: SkillCategory[] = ['daily', 'work', 'special'];
    const oldIdx = categories.indexOf(activeCategory);
    const newIdx = categories.indexOf(cat);
    setDirection(newIdx > oldIdx ? 1 : -1);
    setActiveCategory(cat);
    setSelectedSkill(null);
  }, [activeCategory]);

  const handleSkillClick = useCallback((skill: SkillTree) => {
    setSelectedSkill(skill);
  }, []);

  const handleBackToGrid = useCallback(() => {
    setSelectedSkill(null);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* 模式切换：grid 显示标签栏；tree 隐藏 */}
      {!selectedSkill && (
        <CategoryTabs active={activeCategory} onChange={handleCategoryChange} />
      )}

      {/* 内容区 */}
      <AnimatePresence mode="wait" custom={direction}>
        {selectedSkill ? (
          /* 详情模式：星座技能树 */
          <motion.div
            key={`tree-${selectedSkill.id}`}
            custom={direction}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={tabContentTransition}
            className="min-h-[480px]"
          >
            <SkillTreeView
              skill={selectedSkill}
              color={categoryColors[selectedSkill.category]}
              onBack={handleBackToGrid}
            />
          </motion.div>
        ) : (
          /* 总览模式：统计 + 卡牌网格 */
          <motion.div
            key={`grid-${activeCategory}`}
            custom={direction}
            initial={{ x: direction * 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -40, opacity: 0 }}
            transition={tabContentTransition}
            className="space-y-4"
          >
            <StatsBanner skills={skills} color={color} />
            <SkillCardGrid skills={skills} color={color} onSkillClick={handleSkillClick} />
            {skills.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-12">该领域暂无技能</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/overlays/SkillsOverlay/index.tsx
git commit -m "feat: add SkillsOverlay main component"
```

---

### Task 10: 更新 OverlayRenderer 路由

**Files:**
- Modify: `src/components/overlays/OverlayRenderer.tsx`

**Interfaces:**
- Consumes: `SkillsOverlay` from `./SkillsOverlay`
- 将 `'talents'` 和 `'skillTree'` 路由合并到 `'skills'`

- [ ] **Step 1: 更新导入和路由**

```tsx
// 在 OverlayRenderer.tsx 顶部：
// 删除这两行导入：
// import { TalentsSkillsOverlay } from './TalentsSkillsOverlay';
// import { SkillTreeOverlay } from './SkillTreeOverlay';

// 新增：
import { SkillsOverlay } from './SkillsOverlay';

// 在 accentMap 中：
// 将 'talents' 改为 'skills'，删除 'skillTree'
const accentMap: Record<OverlayViewType, NonNullable<React.ComponentProps<typeof FullscreenOverlay>['accent']>> = {
  status: 'status',
  skills: 'talent',     // 改：原 'talents': 'talent'
  social: 'social',
  wealth: 'wealth',
  calendar: 'calendar',
  settings: 'default',
  // 删除: skillTree: 'talent',
  network: 'social',
  history: 'default',
  calendarFull: 'calendar',
  characters: 'talent',
  characterDetail: 'talent',
  creativeWorkshop: 'talent',
  shop: 'wealth',
  memories: 'calendar',
  achievements: 'wealth',
};

// 更新 talentsCategoryLabels（如果存在）或直接删除
// 因为在 SkillsOverlay 内部处理标签名称

// 在 JSX 中：
// 删除这两行：
// {type === 'talents' && <TalentsSkillsOverlay />}
// {type === 'skillTree' && <SkillTreeOverlay />}

// 新增：
{type === 'skills' && <SkillsOverlay />}

// 标题逻辑更新（约第 52-55 行）：
// 删除 category 相关的 title 覆盖逻辑，因为 SkillsOverlay 内部处理标签
// 或将 skills 的标题固定为 "技能"
```

完整的修改后 `OverlayRenderer` 关键部分：

```tsx
import { SkillsOverlay } from './SkillsOverlay';
// 移除 TalentsSkillsOverlay 和 SkillTreeOverlay 的导入

const accentMap: Record<import('@/types').OverlayViewType, NonNullable<React.ComponentProps<typeof FullscreenOverlay>['accent']>> = {
  status: 'status',
  skills: 'talent',
  social: 'social',
  wealth: 'wealth',
  calendar: 'calendar',
  settings: 'default',
  network: 'social',
  history: 'default',
  calendarFull: 'calendar',
  characters: 'talent',
  characterDetail: 'talent',
  creativeWorkshop: 'talent',
  shop: 'wealth',
  memories: 'calendar',
  achievements: 'wealth',
};

// 删除 talentsCategoryLabels

export function OverlayRenderer() {
  const { state, closeOverlayView } = useGame();
  const { detailView } = state;
  const isOpen = detailView !== null;
  const type = detailView?.type;

  // 对于 skills 类型，标题不在此处覆盖
  const title = detailView?.title ?? '';

  return (
    <FullscreenOverlay
      title={title}
      isOpen={isOpen}
      onClose={closeOverlayView}
      accent={type ? accentMap[type] : 'default'}
    >
      {type === 'status' && <PersonalStatusOverlay />}
      {type === 'skills' && <SkillsOverlay />}
      {type === 'social' && <SocialRelationsOverlay />}
      {/* ... 其余保持不变 */}
    </FullscreenOverlay>
  );
}
```

- [ ] **Step 2: 运行 TypeScript 检查**

```bash
cd F:/AI/no2 && npx tsc --noEmit 2>&1 | grep -i error | head -20
```

预期：无新增类型错误。

- [ ] **Step 3: 提交**

```bash
git add src/components/overlays/OverlayRenderer.tsx
git commit -m "feat: route 'skills' to SkillsOverlay in OverlayRenderer"
```

---

### Task 11: 更新 GameContext overlayTitles

**Files:**
- Modify: `src/context/GameContext.tsx`

**Interfaces:**
- 确保 `overlayTitles` 中包含 `skills: '技能'`

- [ ] **Step 1: 更新 overlayTitles**

在 `src/context/GameContext.tsx` 中找到 `overlayTitles` 对象（约第 66 行），执行以下修改：

```tsx
const overlayTitles: Record<OverlayViewType, string> = {
  status: '个人状态',
  skills: '技能',           // 新增
  // talents: '天赋才能',    // 删除
  social: '社交关系',
  wealth: '财富资产',
  calendar: '日历事件',
  settings: '系统设置',
  // skillTree: '技能树',   // 删除
  network: '关系网络',
  history: '叙事历史',
  calendarFull: '完整日历',
  characters: '角色图鉴',
  characterDetail: '角色详情',
  creativeWorkshop: '创作工坊',
  shop: '商店与衣柜',
  memories: '回忆相册',
  achievements: '成就',
};
```

- [ ] **Step 2: 提交**

```bash
git add src/context/GameContext.tsx
git commit -m "feat: update overlayTitles for 'skills' type"
```

---

### Task 12: 更新 TalentsPreview 调用

**Files:**
- Modify: `src/components/layout/previews/TalentsPreview.tsx`

**Interfaces:**
- 将 `openOverlayView('talents', ...)` 改为 `openOverlayView('skills', ...)`

- [ ] **Step 1: 更新 CategoryCard onClick**

在 `TalentsPreview.tsx` 中找到 `CategoryCard` 组件（约第 80-148 行），修改：

```tsx
// 旧代码（第 93 行附近）：
onClick={() => openOverlayView('talents', { category })}

// 新代码：
onClick={() => openOverlayView('skills', { category })}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/layout/previews/TalentsPreview.tsx
git commit -m "feat: use 'skills' overlay type in TalentsPreview"
```

---

### Task 13: 删除旧组件

**Files:**
- Delete: `src/components/overlays/TalentsSkillsOverlay.tsx`
- Delete: `src/components/overlays/SkillTreeOverlay.tsx`

**前置条件**：确认 `OverlayViewType` 中 `'talents'` 和 `'skillTree'` 无其他引用。

- [ ] **Step 1: 确认无残留引用**

```bash
cd F:/AI/no2 && grep -rn "TalentsSkillsOverlay\|SkillTreeOverlay" src/ --include="*.tsx" --include="*.ts" | grep -v "SkillsOverlay/" | grep -v "node_modules"
```

预期：无输出（或只有历史引用/注释，可在下一步手动清理）。

- [ ] **Step 2: 清理 OverlayViewType 中的旧类型**

在 `src/types/index.ts` 中，如 `'talents'` 和 `'skillTree'` 仍存在且无引用，移除它们。

```ts
export type OverlayViewType =
  | 'status'
  | 'skills'
  | 'social'
  | 'wealth'
  | 'calendar'
  | 'settings'
  | 'network'
  | 'history'
  | 'calendarFull'
  | 'characters'
  | 'characterDetail'
  | 'creativeWorkshop'
  | 'shop'
  | 'memories'
  | 'achievements';
// 移除 'talents' 和 'skillTree'
```

- [ ] **Step 3: 删除旧文件**

```bash
cd F:/AI/no2 && rm src/components/overlays/TalentsSkillsOverlay.tsx src/components/overlays/SkillTreeOverlay.tsx
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "refactor: remove deprecated TalentsSkillsOverlay and SkillTreeOverlay"
```

---

### Task 14: 验证与测试

**前置条件**：所有以上任务已完成。

- [ ] **Step 1: TypeScript 类型检查**

```bash
cd F:/AI/no2 && npx tsc --noEmit 2>&1 | tail -30
```

预期：无新增类型错误。如有错误，逐一修复。

- [ ] **Step 2: 启动开发服务器验证**

```bash
# 确保 dev server 在运行（已在后台运行则跳过）
cd F:/AI/no2 && npm run dev -- --host 0.0.0.0 &
```

- [ ] **Step 3: 功能验证清单**

在浏览器中逐项验证：

1. 点击右侧面板「天赋才能」→「通用领域」卡片 → 打开 SkillsOverlay
2. 三个标签（通用/专业/特殊领域）可点击切换，带滑动动画
3. 统计横幅显示正确数据
4. 技能卡牌展示精美，hover 有浮起效果
5. 点击某技能卡片 → 卡片放大展开过渡到星座技能树
6. 技能树中节点带发光效果，已解锁/未解锁区分明显
7. 点击技能树节点 → 右侧弹出详情面板
8. 点击返回按钮 → 收起动画回到卡牌总览
9. 关闭全屏 overlay → 回到主页，不影响其他交互

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "test: verified skills overlay redesign works end-to-end"
```
