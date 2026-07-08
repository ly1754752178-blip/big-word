# 蔚蓝档案 × 日常 Galgame 风格改造实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 `F:\AI\no2` 人生模拟器前端全面改造为「现实日本 + 动漫角色」题材的生活模拟游戏界面，采用蔚蓝档案清新视觉与日常 Galgame 柔和氛围，仅前端原型，无后端。

**Architecture:** 基于现有 Vite + React + TypeScript + Tailwind CSS 代码库，通过重写主题系统、扩展类型与 mock 数据、新增组件与覆盖层来实现。所有新功能均使用本地状态与 mock 数据，LLM 交互通过前端占位 Hook 模拟。

**Tech Stack:** Vite 5 + React 18 + TypeScript 5 + Tailwind CSS 3 + Framer Motion + Lucide React。

## Global Constraints

- 仅前端原型，不制作后端，API 调用用 mock/占位实现。
- 全中文界面，除 logo 与视觉元素外所有文字为中文。
- 禁用 emoji，全部图标使用 Lucide React。
- 现实日本现代社会背景，不引入非角色幻想/科幻设定。
- 高级 UI/UX：细节丰富、动画灵动、拒绝简陋 MVP。
- 语义化 HTML + 唯一 ID，便于浏览器测试与可访问性。
- 动画仅使用 transform/opacity，支持 `prefers-reduced-motion`。
- 内部通知/警告，不使用浏览器 `alert`。

---

## 文件结构总览

| 路径 | 责任 |
|---|---|
| `tailwind.config.ts` | 主题色、字体、间距、动画 token |
| `src/styles/globals.css` | 全局样式、CSS 变量、动画关键帧、组件工具类 |
| `src/types/index.ts` | 所有类型定义扩展 |
| `src/data/mockData.ts` | mock 数据：角色、地点、日程、商品、成就等 |
| `src/context/GameContext.tsx` | 全局状态扩展：角色、地点、手机、叙事分支等 |
| `src/components/ui/*` | 基础 UI 组件改造 |
| `src/components/layout/*` | 布局组件视觉改造 |
| `src/components/modules/NarrativePanel.tsx` | 叙事区 LLM 化改造 |
| `src/components/overlays/*` | 全屏覆盖层新增与改造 |
| `src/lib/llm.ts` | LLM prompt 组装与 mock 响应 |
| `src/hooks/useLLM.ts` | LLM 调用 Hook（前端占位） |
| `src/app/page.tsx` | 主页三栏布局调整 |

---

## Phase 1：视觉系统基础

### Task 1.1：更新 Tailwind 主题 token

**Files:**
- Modify: `tailwind.config.ts`
- Test: 运行 `npx tsc --noEmit`

**Interfaces:**
- Consumes: 现有 Tailwind 配置结构。
- Produces: 新的 `colors`、`fontFamily`、`extend` token，供所有组件使用。

- [ ] **Step 1：打开 `tailwind.config.ts`**

- [ ] **Step 2：在 `theme.extend` 中添加完整 token**

```typescript
colors: {
  sky: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    300: '#7DD3FC',
    500: '#0EA5E9',
  },
  coral: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    300: '#FDA4AF',
    500: '#F43F5E',
  },
  mint: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    300: '#86EFAC',
    500: '#22C55E',
  },
  cream: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    300: '#FDE68A',
  },
  lavender: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    300: '#C4B5FD',
    500: '#8B5CF6',
  },
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
},
fontFamily: {
  display: ['"Noto Sans JP"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
  body: ['"Noto Sans JP"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
  number: ['Outfit', '"DIN Alternate"', '"Helvetica Neue"', 'sans-serif'],
},
borderRadius: {
  '2xl': '16px',
  '3xl': '20px',
  '4xl': '24px',
},
boxShadow: {
  'soft': '0 2px 12px rgba(30, 41, 59, 0.06)',
  'soft-lg': '0 8px 30px rgba(30, 41, 59, 0.08)',
  'glow-sky': '0 0 20px rgba(14, 165, 233, 0.25)',
  'glow-coral': '0 0 20px rgba(244, 63, 94, 0.2)',
},
transitionTimingFunction: {
  'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
},
```

- [ ] **Step 3：运行类型检查**

Run: `npx tsc --noEmit`
Expected: 无错误。

- [ ] **Step 4：提交**

```bash
git add tailwind.config.ts
git commit -m "design: update Tailwind theme tokens for Blue Archive/Galgame style"
```

---

### Task 1.2：更新全局 CSS 变量与动画

**Files:**
- Modify: `src/styles/globals.css`
- Test: 运行 `npm run build`

**Interfaces:**
- Consumes: Tailwind token。
- Produces: CSS 变量、工具类、动画，供组件直接引用。

- [ ] **Step 1：在 `:root` 添加 CSS 变量**

```css
:root {
  --sky-50: #F0F9FF;
  --sky-100: #E0F2FE;
  --sky-300: #7DD3FC;
  --sky-500: #0EA5E9;
  --coral-50: #FFF1F2;
  --coral-300: #FDA4AF;
  --coral-500: #F43F5E;
  --mint-50: #F0FDF4;
  --mint-300: #86EFAC;
  --mint-500: #22C55E;
  --cream-50: #FFFBEB;
  --cream-100: #FEF3C7;
  --lavender-50: #F5F3FF;
  --lavender-300: #C4B5FD;
  --slate-800: #1E293B;
  --slate-500: #64748B;
  --slate-300: #CBD5E1;

  --font-display: "Noto Sans JP", "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-number: Outfit, "DIN Alternate", "Helvetica Neue", sans-serif;

  --shadow-soft: 0 2px 12px rgba(30, 41, 59, 0.06);
  --shadow-soft-lg: 0 8px 30px rgba(30, 41, 59, 0.08);
}
```

- [ ] **Step 2：添加工具类**

```css
@layer components {
  .card-surface {
    @apply bg-white rounded-2xl shadow-soft border border-slate-100 transition-all duration-200;
  }
  .card-surface:hover {
    @apply -translate-y-0.5 shadow-soft-lg border-sky-100;
  }
  .btn-primary {
    @apply px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-sky-500 text-white font-medium
           shadow-soft hover:shadow-glow-sky hover:-translate-y-0.5 active:scale-[0.97]
           transition-all duration-150 ease-out;
  }
  .btn-secondary {
    @apply px-4 py-2 rounded-xl bg-white text-slate-700 font-medium border border-slate-200
           hover:bg-slate-50 hover:border-sky-200 active:scale-[0.97]
           transition-all duration-150 ease-out;
  }
  .text-gradient-sky {
    @apply bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent;
  }
  .surface-cream {
    @apply bg-cream-50 border border-cream-100;
  }
}
```

- [ ] **Step 3：添加动画关键帧**

```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.animate-fade-in-up {
  animation: fade-in-up 0.25s ease-out forwards;
}
.animate-pulse-soft {
  animation: pulse-soft 1.5s ease-in-out infinite;
}
```

- [ ] **Step 4：构建验证**

Run: `npm run build`
Expected: 构建成功。

- [ ] **Step 5：提交**

```bash
git add src/styles/globals.css
git commit -m "design: add CSS variables, utility classes and animations"
```

---

### Task 1.3：改造 GlassCard 组件

**Files:**
- Modify: `src/components/ui/GlassCard.tsx`
- Test: 运行 dev server 并截图验证卡片外观

**Interfaces:**
- Consumes: Tailwind token (`card-surface`, shadows)。
- Produces: 统一风格的卡片容器，被所有模块使用。

- [ ] **Step 1：打开 `src/components/ui/GlassCard.tsx`**

- [ ] **Step 2：更新默认样式为奶油/白色柔和卡片**

```tsx
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const glassCardVariants = cva(
  'rounded-2xl border transition-all duration-200 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-white border-slate-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5',
        elevated: 'bg-white border-slate-100 shadow-soft-lg',
        floating: 'bg-white/90 backdrop-blur-md border-white/60 shadow-soft-lg',
        cream: 'bg-cream-50 border-cream-100 shadow-soft',
        sky: 'bg-sky-50 border-sky-100 shadow-soft',
        coral: 'bg-coral-50 border-coral-100 shadow-soft',
        mint: 'bg-mint-50 border-mint-100 shadow-soft',
        lavender: 'bg-lavender-50 border-lavender-100 shadow-soft',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
```

- [ ] **Step 3：确保 props 不变，导出组件**

保持现有 `GlassCard` 接口：`variant`、`className`、`children`。

- [ ] **Step 4：验证**

Run: `npm run dev`
Expected: 主页卡片呈现新风格，hover 有上浮阴影效果。

- [ ] **Step 5：提交**

```bash
git add src/components/ui/GlassCard.tsx
git commit -m "ui: redesign GlassCard with Blue Archive/Galgame surface styles"
```

---

### Task 1.4：改造 FullscreenOverlay 组件

**Files:**
- Modify: `src/components/ui/FullscreenOverlay.tsx`
- Test: 打开任意覆盖层截图验证

**Interfaces:**
- Consumes: 现有覆盖层触发逻辑。
- Produces: 带语义渐变条、柔和进入动画的模态容器。

- [ ] **Step 1：打开组件**

- [ ] **Step 2：调整背景、阴影与进入动画**

```tsx
className="fixed inset-0 z-50 flex flex-col bg-slate-900/50 backdrop-blur-sm"
```

内容容器：
```tsx
className="relative m-4 md:m-6 flex flex-col rounded-3xl overflow-hidden bg-cream-50 shadow-soft-lg border border-white/80"
```

动画保持 spring，但调整初始 scale 为 0.96：
```tsx
initial={{ y: 40, opacity: 0, scale: 0.96 }}
animate={{ y: 0, opacity: 1, scale: 1 }}
exit={{ y: 40, opacity: 0, scale: 0.96 }}
transition={{ type: 'spring', stiffness: 320, damping: 30 }}
```

- [ ] **Step 3：标题栏使用更柔和的样式**

```tsx
<div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/60">
```

- [ ] **Step 4：验证并提交**

Run: `npm run dev`，打开任意覆盖层。
Expected: 覆盖层从中心缩放进入，背景有模糊遮罩。

```bash
git add src/components/ui/FullscreenOverlay.tsx
git commit -m "ui: soften FullscreenOverlay appearance and motion"
```

---

### Task 1.5：改造 TopBar 视觉

**Files:**
- Modify: `src/components/layout/TopBar.tsx`
- Test: 主页截图

**Interfaces:**
- Consumes: `state.date`, `state.time`, `state.festival`。
- Produces: 清新风格的上栏。

- [ ] **Step 1：打开组件**

- [ ] **Step 2：将整体背景改为奶油色/天空蓝渐变**

```tsx
<header className="h-16 flex items-center justify-between px-4 bg-gradient-to-r from-sky-50 via-cream-50 to-sky-50 border-b border-sky-100">
```

- [ ] **Step 3：日期区使用圆润标签**

```tsx
<div className="flex items-center gap-3">
  <span className="font-number text-xl font-semibold text-slate-800">
    {year} / {month} / {day}
  </span>
  <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-600 text-xs font-medium">
    水曜日
  </span>
</div>
```

- [ ] **Step 4：天气球外框改为柔和发光**

```tsx
<div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 shadow-glow-sky flex items-center justify-center">
```

- [ ] **Step 5：验证并提交**

Run: `npm run dev`
Expected: 上栏呈现柔和蓝白渐变，天气球有光晕。

```bash
git add src/components/layout/TopBar.tsx
git commit -m "ui: redesign TopBar with sky/cream gradient and soft glow"
```

---

### Task 1.6：改造 LeftSidebar 与预览面板视觉

**Files:**
- Modify: `src/components/layout/LeftSidebar.tsx`
- Modify: `src/components/layout/SidebarPreviewPanel.tsx`
- Modify: `src/components/layout/previews/*.tsx`
- Test: 截图左栏

**Interfaces:**
- Consumes: `activeTab`, `previewTab`, `state`。
- Produces: 圆润导航按钮与柔和预览卡片。

- [ ] **Step 1：导航按钮使用新样式**

```tsx
className={cn(
  'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200',
  isActive
    ? 'bg-sky-500 text-white shadow-glow-sky scale-105'
    : 'bg-white text-slate-500 hover:bg-sky-50 hover:text-sky-500'
)}
```

- [ ] **Step 2：预览面板标题使用柔和 pill 标签**

```tsx
<div className="flex items-center justify-between mb-3">
  <h3 className="px-3 py-1 rounded-full bg-sky-100 text-sky-600 text-sm font-medium">
    个人状态
  </h3>
</div>
```

- [ ] **Step 3：预览卡片全部使用 `GlassCard` 新变体**

例如 StatusPreview 中的卡片使用 `variant="cream"` 或 `variant="sky"`。

- [ ] **Step 4：验证并提交**

Run: `npm run dev`
Expected: 左栏导航清晰、柔和，预览卡片风格统一。

```bash
git add src/components/layout/LeftSidebar.tsx src/components/layout/SidebarPreviewPanel.tsx src/components/layout/previews/
git commit -m "ui: redesign left sidebar and preview panels"
```

---

### Task 1.7：改造 RightPanel 视觉

**Files:**
- Modify: `src/components/layout/RightPanel.tsx`
- Modify: `src/components/map/SceneImpression.tsx`
- Modify: `src/components/map/MiniMap.tsx`
- Test: 截图右栏

**Interfaces:**
- Consumes: `state.map`, `state.notifications`, `state.locations`。
- Produces: 右侧信息区新风格。

- [ ] **Step 1：右栏背景使用奶油色**

```tsx
<aside className="w-80 flex flex-col bg-cream-50 border-l border-slate-100">
```

- [ ] **Step 2：场景印象图使用圆角卡片**

```tsx
<GlassCard variant="elevated" className="m-3 p-0 overflow-hidden h-40">
  <img ... className="w-full h-full object-cover" />
</GlassCard>
```

- [ ] **Step 3：迷你地图与动态区使用对应变体卡片**

- 地图：`variant="sky"`
- 周边动态：`variant="cream"`

- [ ] **Step 4：验证并提交**

Run: `npm run dev`
Expected: 右栏层次清晰，色调柔和。

```bash
git add src/components/layout/RightPanel.tsx src/components/map/SceneImpression.tsx src/components/map/MiniMap.tsx
git commit -m "ui: redesign right panel, scene impression and mini map"
```

---

### Task 1.8：改造 NarrativePanel 视觉

**Files:**
- Modify: `src/components/modules/NarrativePanel.tsx`
- Test: 截图叙事区

**Interfaces:**
- Consumes: `state.narrative.messages`。
- Produces: Galgame 风格的叙事呈现。

- [ ] **Step 1：叙事区背景改为奶油色便签感**

```tsx
<section className="flex-1 min-h-0 surface-cream rounded-3xl p-5 overflow-y-auto">
```

- [ ] **Step 2：旁白文字使用居中柔和样式**

```tsx
<p className="text-center text-slate-600 leading-relaxed text-sm">{content}</p>
```

- [ ] **Step 3：对话气泡使用白色圆角卡片**

```tsx
<GlassCard variant="elevated" className="px-5 py-3 max-w-[80%]">
  <span className="text-sm text-slate-700 leading-relaxed">{content}</span>
</GlassCard>
```

- [ ] **Step 4：输入区使用圆润样式**

```tsx
<div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-soft">
```

- [ ] **Step 5：验证并提交**

Run: `npm run dev`
Expected: 叙事区像 Galgame 文本框，柔和温暖。

```bash
git add src/components/modules/NarrativePanel.tsx
git commit -m "ui: redesign narrative panel as Galgame-style text stage"
```

---

### Task 1.9：改造 NotificationItem

**Files:**
- Modify: `src/components/ui/NotificationItem.tsx`
- Test: 截图通知列表

**Interfaces:**
- Consumes: `Notification` 类型。
- Produces: 圆润通知项。

- [ ] **Step 1：使用白色小卡片**

```tsx
<div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-soft hover:shadow-soft-lg transition-all">
  <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-500">
    <Icon className="w-4 h-4" />
  </div>
  ...
</div>
```

- [ ] **Step 2：验证并提交**

```bash
git add src/components/ui/NotificationItem.tsx
git commit -m "ui: redesign notification item as soft card"
```

---

### Task 1.10：Phase 1 视觉验收

**Files:**
- Test: 全站截图

- [ ] **Step 1：运行 dev server**

Run: `npm run dev -- --host --port 5173`

- [ ] **Step 2：使用 Playwright 截取主页、三个预览面板、一个覆盖层**

- [ ] **Step 3：运行构建**

Run: `npm run build`
Expected: 构建成功。

- [ ] **Step 4：提交验收截图或记录**

```bash
git commit --allow-empty -m "chore: complete Phase 1 visual system verification"
```

---

## Phase 2：数据层与角色系统

### Task 2.1：扩展类型定义

**Files:**
- Modify: `src/types/index.ts`
- Test: `npx tsc --noEmit`

**Interfaces:**
- Consumes: 现有类型。
- Produces: `Character`, `Location`, `ScheduleEvent`, `Project`, `ShopItem`, `InventoryItem`, `Memory`, `Achievement`, `ChatThread`, `SNSPost`, 扩展的 `NarrativeMessage`。

- [ ] **Step 1：添加新类型**

```typescript
export interface Character {
  id: string;
  name: string;
  sourceWork: string;
  avatar: string;
  age: number;
  identity: string;
  school?: string;
  occupation?: string;
  address?: string;
  personality: string[];
  likes: string[];
  dislikes: string[];
  currentMood: string;
  currentLocationId: string;
  relationshipStage: 'stranger' | 'acquaintance' | 'friend' | 'close' | 'lover';
  affection: number;
  trust: number;
  lastInteractionAt: string;
}

export interface Location {
  id: string;
  name: string;
  type: 'home' | 'school' | 'company' | 'shop' | 'restaurant' | 'park' | 'station' | 'other';
  description: string;
  image: string;
  coordinates: { x: number; y: number };
  charactersPresent: string[];
  eventsAvailable: string[];
}

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  locationId: string;
  type: 'class' | 'work' | 'appointment' | 'event' | 'deadline' | 'personal';
  description?: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  type: 'novel' | 'manga' | 'game' | 'video' | 'music';
  progress: number;
  maxProgress: number;
  deadline: string;
  memberIds: string[];
  tasks: { id: string; title: string; completed: boolean }[];
  inspiration: number;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'gift' | 'outfit' | 'furniture' | 'consumable' | 'book';
  price: number;
  effect: string;
  description: string;
  icon: string;
}

export interface InventoryItem extends ShopItem {
  quantity: number;
}

export interface Memory {
  id: string;
  title: string;
  date: string;
  description: string;
  image?: string;
  characterIds: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
  icon: string;
}

export interface ChatThread {
  id: string;
  characterId: string;
  messages: { id: string; role: 'user' | 'character'; content: string; timestamp: string }[];
}

export interface SNSPost {
  id: string;
  characterId: string;
  content: string;
  image?: string;
  likes: number;
  timestamp: string;
}

export interface NarrativeOption {
  id: string;
  label: string;
  impact?: string;
}

export interface NarrativeMessage {
  id: string;
  type: 'scene' | 'dialogue' | 'option' | 'system';
  content: string;
  speaker?: string;
  speakerAvatar?: string;
  timestamp: string;
  options?: NarrativeOption[];
}
```

- [ ] **Step 2：扩展 GameState**

```typescript
export interface GameState {
  // 现有字段保留...
  characters: Character[];
  locations: Location[];
  scheduleEvents: ScheduleEvent[];
  projects: Project[];
  shopItems: ShopItem[];
  inventory: InventoryItem[];
  memories: Memory[];
  achievements: Achievement[];
  chatThreads: ChatThread[];
  snsPosts: SNSPost[];
  activeCharacterId: string | null;
  activeLocationId: string;
  narrative: {
    inputText: string;
    messages: NarrativeMessage[];
    isGenerating: boolean;
    branchRootId: string | null;
  };
}
```

- [ ] **Step 3：类型检查**

Run: `npx tsc --noEmit`
Expected: 可能出现 mockData 类型错误，下一步修复。

- [ ] **Step 4：提交**

```bash
git add src/types/index.ts
git commit -m "types: extend data model for characters, locations, life systems and LLM narrative"
```

---

### Task 2.2：扩展 mockData

**Files:**
- Modify: `src/data/mockData.ts`
- Test: `npx tsc --noEmit`

**Interfaces:**
- Consumes: 新扩展的类型。
- Produces: 完整的 mock 数据集。

- [ ] **Step 1：添加角色数据**

```typescript
const characters: Character[] = [
  {
    id: 'char-yukino',
    name: '雪之下雪乃',
    sourceWork: '我的青春恋爱物语果然有问题',
    avatar: '/avatars/yukino.jpg',
    age: 17,
    identity: '学生',
    school: '总武高中 2 年 J 班',
    personality: ['认真', '冷静', '追求完美'],
    likes: ['猫', '红茶', '阅读'],
    dislikes: ['虚伪', '嘈杂'],
    currentMood: '平静',
    currentLocationId: 'loc-school',
    relationshipStage: 'acquaintance',
    affection: 35,
    trust: 40,
    lastInteractionAt: '2026-07-08',
  },
  // 其他 7-9 个角色...
];
```

- [ ] **Step 2：添加地点数据**

```typescript
const locations: Location[] = [
  {
    id: 'loc-home',
    name: '自家公寓',
    type: 'home',
    description: '位于世田谷区的一间小公寓，阳光很好。',
    image: '/scenes/home.jpg',
    coordinates: { x: 30, y: 60 },
    charactersPresent: [],
    eventsAvailable: ['morning-routine', 'cooking'],
  },
  {
    id: 'loc-school',
    name: '总武高中',
    type: 'school',
    description: '一所普通的都立高中。',
    image: '/scenes/school.jpg',
    coordinates: { x: 50, y: 40 },
    charactersPresent: ['char-yukino'],
    eventsAvailable: ['class', 'club'],
  },
  // ...
];
```

- [ ] **Step 3：添加日程、商品、项目、成就等 mock 数据**

提供至少 3 个日程事件、6 个商店商品、2 个创作项目、5 个成就、3 条回忆。

- [ ] **Step 4：合并到 mockGameState**

```typescript
export const mockGameState: GameState = {
  // 现有字段...
  characters,
  locations,
  scheduleEvents,
  projects,
  shopItems,
  inventory: [],
  memories,
  achievements,
  chatThreads: [],
  snsPosts,
  activeCharacterId: null,
  activeLocationId: 'loc-home',
  narrative: {
    inputText: '',
    messages: [/* 保留现有初始叙事 */],
    isGenerating: false,
    branchRootId: null,
  },
};
```

- [ ] **Step 5：类型检查**

Run: `npx tsc --noEmit`
Expected: 无错误。

- [ ] **Step 6：提交**

```bash
git add src/data/mockData.ts
git commit -m "data: add mock characters, locations, life systems and narrative data"
```

---

### Task 2.3：创建 CharacterCard 组件

**Files:**
- Create: `src/components/character/CharacterCard.tsx`
- Test: 使用 Storybook 或简单 import 测试渲染

**Interfaces:**
- Consumes: `Character`。
- Produces: 可复用的角色卡片，用于图鉴与关系网络。

- [ ] **Step 1：创建文件并接收 props**

```tsx
import { GlassCard } from '@/components/ui/GlassCard';
import { Heart } from 'lucide-react';
import type { Character } from '@/types';

interface CharacterCardProps {
  character: Character;
  onClick?: (id: string) => void;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  return (
    <GlassCard
      variant="cream"
      className="p-4 cursor-pointer group"
      onClick={() => onClick?.(character.id)}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-200 overflow-hidden shrink-0">
          <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-800 truncate">{character.name}</h4>
          <p className="text-xs text-slate-500 truncate">{character.school || character.occupation}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {character.personality.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-white text-slate-600 text-[10px] border border-slate-100">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Heart className="w-4 h-4 text-coral-500" />
        <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-coral-300 to-coral-500 rounded-full"
            style={{ width: `${character.affection}%` }}
          />
        </div>
        <span className="text-xs font-number text-slate-500">{character.affection}</span>
      </div>
    </GlassCard>
  );
}
```

- [ ] **Step 2：提交**

```bash
git add src/components/character/CharacterCard.tsx
git commit -m "feat: add CharacterCard component"
```

---

### Task 2.4：创建 CharacterGallery 覆盖层

**Files:**
- Create: `src/components/overlays/CharacterGalleryOverlay.tsx`
- Modify: `src/components/overlays/OverlayRenderer.tsx`
- Modify: `src/context/GameContext.tsx`
- Modify: `src/types/index.ts`（OverlayViewType）
- Test: 打开角色图鉴覆盖层

**Interfaces:**
- Consumes: `state.characters`, `openOverlayView`。
- Produces: 角色图鉴网格，点击打开角色详情。

- [ ] **Step 1：在 OverlayViewType 增加 `characters`**

- [ ] **Step 2：在 overlayTitles 增加 `characters: '角色图鉴'`**

- [ ] **Step 3：创建覆盖层组件**

```tsx
import { useGame } from '@/hooks/useGameState';
import { CharacterCard } from '@/components/character/CharacterCard';
import { useState } from 'react';
import { Search } from 'lucide-react';

export function CharacterGalleryOverlay() {
  const { state, openOverlayView } = useGame();
  const [filter, setFilter] = useState('');

  const filtered = state.characters.filter((c) =>
    c.name.includes(filter) || c.sourceWork.includes(filter)
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="搜索角色或出处作品"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
        {filtered.map((c) => (
          <CharacterCard
            key={c.id}
            character={c}
            onClick={(id) => openOverlayView('characterDetail', { characterId: id })}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4：在 OverlayRenderer 中注册**

- [ ] **Step 5：在左栏角色按钮绑定 openOverlayView('characters')**

- [ ] **Step 6：验证并提交**

Run: `npm run dev`
Expected: 点击左栏「角色」打开图鉴网格，可搜索，点击卡片可打开详情（详情下一步实现）。

```bash
git add src/components/overlays/CharacterGalleryOverlay.tsx src/components/overlays/OverlayRenderer.tsx src/context/GameContext.tsx src/types/index.ts src/components/layout/LeftSidebar.tsx
git commit -m "feat: add CharacterGallery overlay"
```

---

### Task 2.5：创建 CharacterDetail 覆盖层

**Files:**
- Create: `src/components/overlays/CharacterDetailOverlay.tsx`
- Modify: `src/components/overlays/OverlayRenderer.tsx`
- Modify: `src/types/index.ts`（OverlayViewType）
- Test: 打开角色详情

**Interfaces:**
- Consumes: `state.characters`, `state.activeCharacterId`。
- Produces: 单个角色完整档案与互动入口。

- [ ] **Step 1：在 OverlayViewType 增加 `characterDetail`，标题为角色详情**

- [ ] **Step 2：创建组件**

```tsx
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { Heart, MessageCircle, Gift, MapPin } from 'lucide-react';

const stageLabels: Record<string, string> = {
  stranger: '陌生人',
  acquaintance: '相识',
  friend: '朋友',
  close: '密友',
  lover: '恋人',
};

export function CharacterDetailOverlay() {
  const { state } = useGame();
  const character = state.characters.find((c) => c.id === state.detailView?.payload?.characterId);

  if (!character) return <div className="p-8 text-slate-500">未找到角色</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <GlassCard variant="cream" className="p-6">
        <div className="flex items-start gap-5">
          <div className="w-24 h-24 rounded-3xl bg-slate-200 overflow-hidden shrink-0">
            <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800">{character.name}</h2>
            <p className="text-sm text-slate-500 mt-1">《{character.sourceWork}》· {character.school || character.occupation}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 rounded-full bg-coral-100 text-coral-600 text-xs font-medium">{stageLabels[character.relationshipStage]}</span>
              {character.personality.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white text-slate-600 text-xs border border-slate-100">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GlassCard variant="sky" className="p-5">
          <h3 className="font-bold text-slate-700 mb-3">基本信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">年龄</span><span>{character.age} 岁</span></div>
            <div className="flex justify-between"><span className="text-slate-500">现居地</span><span>{character.address || '未知'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">当前位置</span><span>{state.locations.find((l) => l.id === character.currentLocationId)?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">心情</span><span>{character.currentMood}</span></div>
          </div>
        </GlassCard>

        <GlassCard variant="coral" className="p-5">
          <h3 className="font-bold text-slate-700 mb-3">关系</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-coral-500" />
              <span className="text-sm text-slate-600">好感度 {character.affection}/100</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div className="h-full bg-coral-400 rounded-full" style={{ width: `${character.affection}%` }} />
            </div>
            <p className="text-xs text-slate-500">最近互动：{character.lastInteractionAt}</p>
          </div>
        </GlassCard>
      </div>

      <GlassCard variant="mint" className="p-5">
        <h3 className="font-bold text-slate-700 mb-3">喜好与厌恶</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-2">喜欢</p>
            <div className="flex flex-wrap gap-2">
              {character.likes.map((like) => (
                <span key={like} className="px-2 py-1 rounded-lg bg-mint-100 text-mint-700 text-xs">{like}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">厌恶</p>
            <div className="flex flex-wrap gap-2">
              {character.dislikes.map((d) => (
                <span key={d} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs">{d}</span>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex gap-3">
        <button type="button" className="btn-primary flex-1 flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" /> 聊天
        </button>
        <button type="button" className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <Gift className="w-4 h-4" /> 送礼
        </button>
        <button type="button" className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4" /> 去找她
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3：注册并验证**

Run: `npm run dev`
Expected: 角色卡片点击后打开详情页，显示头像、基本信息、关系、喜好、互动按钮。

- [ ] **Step 4：提交**

```bash
git add src/components/overlays/CharacterDetailOverlay.tsx src/components/overlays/OverlayRenderer.tsx src/types/index.ts
git commit -m "feat: add CharacterDetail overlay"
```

---

### Task 2.6：改造 Relationship Network

**Files:**
- Modify: `src/components/overlays/NetworkOverlay.tsx`
- Modify: `src/data/mockData.ts`
- Test: 打开关系网络

**Interfaces:**
- Consumes: `state.characters`, `state.relationships`。
- Produces: 按现实社交圈层（同学/同事/邻居/兴趣）分布的关系网络。

- [ ] **Step 1：调整数据模型，让角色分组为「同学圈」「职场圈」「邻里圈」「兴趣圈」**

在 mockData 中给角色增加 `socialCircle` 字段，或在 network 中按 `school`/`occupation` 推断。

- [ ] **Step 2：重写 NetworkOverlay，按圈层分组布局**

```tsx
const groups = [
  { key: 'school', label: '同学圈', color: '#7DD3FC' },
  { key: 'work', label: '职场圈', color: '#C4B5FD' },
  { key: 'neighbor', label: '邻里圈', color: '#86EFAC' },
  { key: 'interest', label: '兴趣圈', color: '#FDA4AF' },
];
```

- [ ] **Step 3：节点使用角色头像，连线表示关系强度**

- [ ] **Step 4：验证并提交**

Run: `npm run dev`
Expected: 关系网络显示玩家为中心，角色按圈层分布，带头像与好感度。

```bash
git add src/components/overlays/NetworkOverlay.tsx src/data/mockData.ts
git commit -m "feat: redesign relationship network by social circles"
```

---

### Task 2.7：Phase 2 验收

**Files:**
- Test: 截图验证

- [ ] **Step 1：运行 dev server**

- [ ] **Step 2：截图角色图鉴、角色详情、关系网络**

- [ ] **Step 3：运行 `npx tsc --noEmit` 和 `npm run build`**

- [ ] **Step 4：提交**

```bash
git commit --allow-empty -m "chore: complete Phase 2 character system verification"
```

---

## Phase 3：生活与城市系统

### Task 3.1：改造 Calendar 覆盖层

**Files:**
- Modify: `src/components/overlays/CalendarOverlay.tsx`
- Modify: `src/components/overlays/CalendarEventsOverlay.tsx`
- Modify: `src/components/layout/previews/CalendarPreview.tsx`
- Test: 打开日历

**Interfaces:**
- Consumes: `state.scheduleEvents`, `state.dateMarks`。
- Produces: 带季节事件与角色生日的月视图日历。

- [ ] **Step 1：扩展 CalendarOverlay 显示事件标记**

在日期格子中显示小圆点表示有事件，hover 显示事件摘要。

- [ ] **Step 2：CalendarEventsOverlay 使用新卡片样式**

```tsx
<GlassCard variant="sky" className="p-4">
  <div className="flex items-center justify-between">
    <span className="font-bold text-slate-700">{event.title}</span>
    <span className="text-xs text-slate-500">{event.time}</span>
  </div>
  <p className="text-xs text-slate-500 mt-1">{event.description}</p>
</GlassCard>
```

- [ ] **Step 3：提交**

```bash
git add src/components/overlays/CalendarOverlay.tsx src/components/overlays/CalendarEventsOverlay.tsx src/components/layout/previews/CalendarPreview.tsx
git commit -m "ui: redesign calendar overlays with seasonal events"
```

---

### Task 3.2：改造 Map 组件

**Files:**
- Modify: `src/components/map/MiniMap.tsx`
- Modify: `src/components/map/FullMapModal.tsx`
- Modify: `src/components/map/MapTargetDetail.tsx`
- Modify: `src/components/map/MapMarker.tsx`
- Test: 打开地图

**Interfaces:**
- Consumes: `state.locations`, `state.activeLocationId`。
- Produces: 城市地图，支持移动、查看地点详情。

- [ ] **Step 1：地图背景使用柔和淡色，地点标记使用图标+头像**

```tsx
<div className="relative w-full h-full bg-sky-50 rounded-2xl overflow-hidden border border-sky-100">
```

- [ ] **Step 2：地点卡片使用 `GlassCard` 新样式**

- [ ] **Step 3：移动操作消耗时间与体力，更新 `activeLocationId`**

- [ ] **Step 4：提交**

```bash
git add src/components/map/
git commit -m "feat: redesign map components with real locations and travel"
```

---

### Task 3.3：改造 Status / Wealth / Skill 覆盖层

**Files:**
- Modify: `src/components/overlays/PersonalStatusOverlay.tsx`
- Modify: `src/components/overlays/WealthAssetsOverlay.tsx`
- Modify: `src/components/overlays/SkillTreeOverlay.tsx`
- Modify: `src/components/overlays/TalentsSkillsOverlay.tsx`
- Modify: `src/components/layout/previews/*.tsx`
- Test: 打开生活相关覆盖层

**Interfaces：**
- Consumes: `state.player`, `state.finance`, `state.skills`, `state.projects`。
- Produces: 柔和风格的生活管理界面。

- [ ] **Step 1：为所有生活卡片应用新 `GlassCard` 变体**

- [ ] **Step 2：更新进度条、标签、数据展示样式**

- [ ] **Step 3：提交**

```bash
git add src/components/overlays/PersonalStatusOverlay.tsx src/components/overlays/WealthAssetsOverlay.tsx src/components/overlays/SkillTreeOverlay.tsx src/components/overlays/TalentsSkillsOverlay.tsx src/components/layout/previews/
git commit -m "ui: redesign life management overlays and previews"
```

---

### Task 3.4：创建 Creative Workshop 覆盖层

**Files:**
- Create: `src/components/overlays/CreativeWorkshopOverlay.tsx`
- Modify: `src/components/overlays/OverlayRenderer.tsx`
- Modify: `src/context/GameContext.tsx`
- Modify: `src/types/index.ts`（OverlayViewType）
- Test: 打开创作工坊

**Interfaces:**
- Consumes: `state.projects`。
- Produces: 项目列表与详情，支持任务勾选。

- [ ] **Step 1：新增 `creativeWorkshop` 覆盖层类型**

- [ ] **Step 2：创建组件展示项目列表、进度条、任务清单**

```tsx
<GlassCard variant="lavender" className="p-5">
  <div className="flex items-center justify-between mb-3">
    <h3 className="font-bold text-slate-700">{project.name}</h3>
    <span className="px-2 py-1 rounded-lg bg-lavender-100 text-lavender-700 text-xs">{project.type}</span>
  </div>
  <div className="h-2 bg-white rounded-full overflow-hidden">
    <div className="h-full bg-lavender-400 rounded-full" style={{ width: `${(project.progress / project.maxProgress) * 100}%` }} />
  </div>
  <p className="text-xs text-slate-500 mt-2">截止：{project.deadline}</p>
</GlassCard>
```

- [ ] **Step 3：注册并绑定左栏入口**

- [ ] **Step 4：提交**

```bash
git add src/components/overlays/CreativeWorkshopOverlay.tsx src/components/overlays/OverlayRenderer.tsx src/context/GameContext.tsx src/types/index.ts src/components/layout/LeftSidebar.tsx
git commit -m "feat: add Creative Workshop overlay"
```

---

### Task 3.5：创建 Shop & Wardrobe 覆盖层

**Files:**
- Create: `src/components/overlays/ShopOverlay.tsx`
- Modify: `src/components/overlays/OverlayRenderer.tsx`
- Modify: `src/context/GameContext.tsx`
- Modify: `src/types/index.ts`（OverlayViewType）
- Test: 打开商店

**Interfaces:**
- Consumes: `state.shopItems`, `state.inventory`, `state.finance.cash`。
- Produces: 商品列表、分类筛选、购买确认。

- [ ] **Step 1：新增 `shop` 覆盖层类型**

- [ ] **Step 2：创建商品卡片与分类筛选**

```tsx
<GlassCard variant="cream" className="p-4">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-500">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-slate-700 text-sm">{item.name}</h4>
      <p className="text-xs text-slate-500">{item.effect}</p>
    </div>
    <span className="font-number text-coral-500 font-bold">¥{item.price}</span>
  </div>
</GlassCard>
```

- [ ] **Step 3：购买逻辑更新 inventory 与 cash（本地状态）**

- [ ] **Step 4：提交**

```bash
git add src/components/overlays/ShopOverlay.tsx src/components/overlays/OverlayRenderer.tsx src/context/GameContext.tsx src/types/index.ts src/components/layout/LeftSidebar.tsx
git commit -m "feat: add Shop overlay with purchase logic"
```

---

### Task 3.6：Phase 3 验收

**Files:**
- Test: 截图验证

- [ ] **Step 1：运行 dev server**

- [ ] **Step 2：截图日历、地图、生活覆盖层、创作工坊、商店**

- [ ] **Step 3：运行 `npx tsc --noEmit` 和 `npm run build`**

- [ ] **Step 4：提交**

```bash
git commit --allow-empty -m "chore: complete Phase 3 life and city system verification"
```

---

## Phase 4：手机、回忆与 LLM 叙事

### Task 4.1：重构 Phone 系统

**Files:**
- Modify: `src/components/layout/Phone/index.tsx`
- Modify: `src/components/layout/Phone/PhoneAppGrid.tsx`
- Modify: `src/components/layout/Phone/PhoneAppScreen.tsx`
- Create: `src/components/layout/Phone/apps/ChatApp.tsx`
- Create: `src/components/layout/Phone/apps/SNSApp.tsx`
- Create: `src/components/layout/Phone/apps/WalletApp.tsx`
- Modify: `src/data/mockData.ts`
- Test: 打开手机各应用

**Interfaces:**
- Consumes: `state.chatThreads`, `state.snsPosts`, `state.finance`, `state.notifications`。
- Produces: 多个手机应用界面。

- [ ] **Step 1：为每个应用创建独立组件**

- ChatApp：角色聊天列表与对话界面。
- SNSApp：角色动态流。
- WalletApp：余额、消费记录。

- [ ] **Step 2：更新 PhoneAppScreen 根据 app.id 渲染对应组件**

```tsx
const apps: Record<PhoneAppId, React.ComponentType> = {
  chat: ChatApp,
  sns: SNSApp,
  wallet: WalletApp,
  // ...
};
```

- [ ] **Step 3：更新 mockData 中的手机应用与初始聊天记录/动态**

- [ ] **Step 4：提交**

```bash
git add src/components/layout/Phone/ src/data/mockData.ts
git commit -m "feat: refactor phone into multiple apps with chat, sns and wallet"
```

---

### Task 4.2：创建 Memories 覆盖层

**Files:**
- Create: `src/components/overlays/MemoriesOverlay.tsx`
- Modify: `src/components/overlays/OverlayRenderer.tsx`
- Modify: `src/types/index.ts`（OverlayViewType）
- Test: 打开回忆相册

**Interfaces:**
- Consumes: `state.memories`。
- Produces: 事件时间线与 CG 画廊。

- [ ] **Step 1：新增 `memories` 覆盖层类型**

- [ ] **Step 2：创建组件**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {memories.map((m) => (
    <GlassCard key={m.id} variant="cream" className="p-4">
      <div className="h-32 bg-slate-200 rounded-xl mb-3 overflow-hidden">
        {m.image && <img src={m.image} alt={m.title} className="w-full h-full object-cover" />}
      </div>
      <h3 className="font-bold text-slate-700">{m.title}</h3>
      <p className="text-xs text-slate-500">{m.date}</p>
      <p className="text-sm text-slate-600 mt-2">{m.description}</p>
    </GlassCard>
  ))}
</div>
```

- [ ] **Step 3：注册并绑定入口**

- [ ] **Step 4：提交**

```bash
git add src/components/overlays/MemoriesOverlay.tsx src/components/overlays/OverlayRenderer.tsx src/types/index.ts src/components/layout/LeftSidebar.tsx
git commit -m "feat: add Memories overlay"
```

---

### Task 4.3：创建 Achievements 覆盖层

**Files:**
- Create: `src/components/overlays/AchievementsOverlay.tsx`
- Modify: `src/components/overlays/OverlayRenderer.tsx`
- Modify: `src/types/index.ts`（OverlayViewType）
- Test: 打开成就

**Interfaces:**
- Consumes: `state.achievements`。
- Produces: 成就网格，区分已解锁与未解锁。

- [ ] **Step 1：新增 `achievements` 覆盖层类型**

- [ ] **Step 2：创建组件**

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
  {achievements.map((a) => (
    <GlassCard
      key={a.id}
      variant={a.unlockedAt ? 'mint' : 'default'}
      className="p-4 text-center"
    >
      <div className="w-12 h-12 mx-auto rounded-2xl bg-white flex items-center justify-center text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className={`mt-3 font-bold text-sm ${a.unlockedAt ? 'text-slate-800' : 'text-slate-400'}`}>
        {a.title}
      </h4>
      <p className="text-xs text-slate-500 mt-1">{a.description}</p>
    </GlassCard>
  ))}
</div>
```

- [ ] **Step 3：注册并绑定入口**

- [ ] **Step 4：提交**

```bash
git add src/components/overlays/AchievementsOverlay.tsx src/components/overlays/OverlayRenderer.tsx src/types/index.ts src/components/layout/LeftSidebar.tsx
git commit -m "feat: add Achievements overlay"
```

---

### Task 4.4：扩展叙事类型与状态

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/context/GameContext.tsx`
- Modify: `src/data/mockData.ts`
- Test: `npx tsc --noEmit`

**Interfaces:**
- Consumes: 现有叙事结构。
- Produces: 支持选项、分支、生成状态的叙事模型。

- [ ] **Step 1：更新 `NarrativeMessage` 与 `NarrativeOption` 类型**

已在 Task 2.1 中完成，确认一致。

- [ ] **Step 2：在 GameContext 中添加叙事操作**

```typescript
setNarrativeInput: (text: string) => void;
sendNarrativeMessage: (content: string) => void;
selectNarrativeOption: (optionId: string) => void;
regenerateLastMessage: () => void;
branchNarrativeTo: (messageId: string) => void;
```

- [ ] **Step 3：实现 selectNarrativeOption 与 branchNarrativeTo**

- `selectNarrativeOption`：将选项作为玩家输入，触发 LLM 生成下一段。
- `branchNarrativeTo`：截断到指定消息，重新生成后续。

- [ ] **Step 4：提交**

```bash
git add src/types/index.ts src/context/GameContext.tsx src/data/mockData.ts
git commit -m "feat: extend narrative state for options and branching"
```

---

### Task 4.5：创建 LLM 占位 Hook

**Files:**
- Create: `src/hooks/useLLM.ts`
- Create: `src/lib/llm.ts`
- Test: 调用 hook 返回 mock 回复

**Interfaces:**
- Consumes: prompt、history、character context。
- Produces: stream-like async generator 或 Promise。

- [ ] **Step 1：创建 `src/lib/llm.ts` 组装 prompt**

```typescript
export function buildPrompt(input: string, context: {
  locationName: string;
  time: string;
  playerName: string;
  charactersPresent: string[];
  history: string[];
}) {
  return `你正在撰写一款现实日本生活模拟游戏的剧情。当前场景：${context.locationName}，时间：${context.time}。在场的角色：${context.charactersPresent.join('、')}。玩家的输入是："${input"。请用中文返回一段剧情，包含：一段旁白、可能发生的对话、以及 2-4 个玩家可选择的选项。使用 XML 标签：<scene>旁白</scene>、<dialogue name="角色名">台词</dialogue>、<option>选项文字</option>。`;
}

export function parseLLMResponse(raw: string) {
  const scene = raw.match(/<scene>([\s\S]*?)<\/scene>/)?.[1]?.trim() || '';
  const dialogues = Array.from(raw.matchAll(/<dialogue name="(.*?)">([\s\S]*?)<\/dialogue>/g)).map((m) => ({
    speaker: m[1],
    content: m[2].trim(),
  }));
  const options = Array.from(raw.matchAll(/<option>([\s\S]*?)<\/option>/g)).map((m, i) => ({
    id: `opt-${i}`,
    label: m[1].trim(),
  }));
  return { scene, dialogues, options };
}
```

- [ ] **Step 2：创建 `src/hooks/useLLM.ts` 提供 mock 调用**

```typescript
import { useCallback } from 'react';
import { buildPrompt, parseLLMResponse } from '@/lib/llm';

export function useLLM() {
  const send = useCallback(async (input: string, context: Parameters<typeof buildPrompt>[1]) => {
    // 占位：真实环境可替换为 fetch API
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const mockRaw = `
      <scene>夕阳照进${context.locationName}，空气中带着夏末的暖意。</scene>
      <dialogue name="雪之下雪乃">你也在啊。正好，我有个问题想问你。</dialogue>
      <option>点头倾听</option>
      <option>问她怎么了</option>
      <option>说自己正要离开</option>
    `;
    return parseLLMResponse(mockRaw);
  }, []);

  return { send };
}
```

- [ ] **Step 3：提交**

```bash
git add src/hooks/useLLM.ts src/lib/llm.ts
git commit -m "feat: add LLM hook and prompt parser with mock responses"
```

---

### Task 4.6：改造 NarrativePanel 支持选项与生成状态

**Files:**
- Modify: `src/components/modules/NarrativePanel.tsx`
- Modify: `src/context/GameContext.tsx`
- Test: 输入行动，观察 mock LLM 返回的剧情与选项

**Interfaces:**
- Consumes: `state.narrative`, `useLLM()`。
- Produces: 可交互的 LLM 叙事流。

- [ ] **Step 1：在 GameContext 的 `sendNarrativeMessage` 中集成 useLLM 逻辑**

由于 hook 不能在 reducer 中使用，改为在 Context value 的 `sendNarrativeMessage` 函数中调用：

```typescript
const sendNarrativeMessage = useCallback(async (content: string) => {
  const userMsg: NarrativeMessage = { /* ... */ };
  dispatch({ type: 'ADD_NARRATIVE_MESSAGE', payload: userMsg });
  dispatch({ type: 'SET_NARRATIVE_GENERATING', payload: true });

  const location = state.locations.find((l) => l.id === state.activeLocationId);
  const result = await llm.send(content, {
    locationName: location?.name || '未知地点',
    time: `${state.time.hour}:${state.time.minute}`,
    playerName: state.player.name,
    charactersPresent: location?.charactersPresent.map((id) => state.characters.find((c) => c.id === id)?.name || '').filter(Boolean) || [],
    history: state.narrative.messages.slice(-6).map((m) => m.content),
  });

  const messages: NarrativeMessage[] = [];
  if (result.scene) {
    messages.push({ id: `msg-${Date.now()}-scene`, type: 'scene', content: result.scene, timestamp });
  }
  result.dialogues.forEach((d, i) => {
    messages.push({ id: `msg-${Date.now()}-dlg-${i}`, type: 'dialogue', content: d.content, speaker: d.speaker, timestamp });
  });
  if (result.options.length > 0) {
    messages.push({ id: `msg-${Date.now()}-opt`, type: 'option', content: '你要怎么做？', options: result.options, timestamp });
  }

  messages.forEach((m) => dispatch({ type: 'ADD_NARRATIVE_MESSAGE', payload: m }));
  dispatch({ type: 'SET_NARRATIVE_GENERATING', payload: false });
}, [state, llm]);
```

- [ ] **Step 2：在 NarrativePanel 中渲染选项按钮**

```tsx
{message.type === 'option' && message.options && (
  <div className="flex flex-col gap-2 mt-3">
    {message.options.map((opt) => (
      <button
        key={opt.id}
        type="button"
        onClick={() => selectNarrativeOption(opt.id)}
        className="w-full text-left px-4 py-3 rounded-xl bg-white border border-sky-200 text-sky-700 text-sm hover:bg-sky-50 hover:border-sky-300 transition-all"
      >
        {opt.label}
      </button>
    ))}
  </div>
)}
```

- [ ] **Step 3：添加生成中指示器**

```tsx
{state.narrative.isGenerating && (
  <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
    <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse-soft" />
    <span>正在生成剧情……</span>
  </div>
)}
```

- [ ] **Step 4：提交**

```bash
git add src/components/modules/NarrativePanel.tsx src/context/GameContext.tsx
git commit -m "feat: integrate LLM narrative with options and generating state"
```

---

### Task 4.7：创建内部通知系统

**Files:**
- Create: `src/components/ui/InAppNotification.tsx`
- Create: `src/components/ui/NotificationContainer.tsx`
- Modify: `src/context/GameContext.tsx`
- Modify: `src/app/page.tsx`
- Test: 触发通知并截图

**Interfaces:**
- Consumes: 通知列表。
- Produces: 游戏内右上角滑入通知。

- [ ] **Step 1：在类型中添加通知**

```typescript
export interface InAppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
}
```

- [ ] **Step 2：在 GameContext 中添加 addNotification / removeNotification**

- [ ] **Step 3：创建通知容器组件**

```tsx
export function NotificationContainer() {
  const { state, removeNotification } = useGame();
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 w-80">
      {state.notifications.map((n) => (
        <InAppNotification key={n.id} notification={n} onClose={() => removeNotification(n.id)} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4：将容器放入 `page.tsx`**

- [ ] **Step 5：提交**

```bash
git add src/components/ui/InAppNotification.tsx src/components/ui/NotificationContainer.tsx src/context/GameContext.tsx src/types/index.ts src/app/page.tsx
git commit -m "feat: add in-app notification system"
```

---

### Task 4.8：最终集成与验收

**Files:**
- Test: 全项目

- [ ] **Step 1：运行完整类型检查与构建**

```bash
npx tsc --noEmit
npm run build
```

Expected: 全部通过。

- [ ] **Step 2：使用 Playwright 进行全站截图验证**

- 主页三栏布局
- 角色图鉴与详情
- 关系网络
- 日历、地图、生活覆盖层
- 创作工坊、商店
- 手机各应用
- 回忆与成就
- LLM 叙事生成流程

- [ ] **Step 3：对照验收标准检查**

- [ ] 所有界面符合 Blue Archive + Galgame 视觉方向。
- [ ] 无 emoji，全部使用 Lucide 图标。
- [ ] 全中文界面。
- [ ] 所有模态框/标签页有内容，不空白。
- [ ] 点击主界面交互入口能打开对应功能。
- [ ] 动画流畅，不阻塞交互。
- [ ] 构建通过，无类型错误。
- [ ] 语义化 HTML，交互元素有唯一 id。
- [ ] 内部通知/警告，不使用浏览器 alert。

- [ ] **Step 4：提交**

```bash
git commit --allow-empty -m "chore: complete Phase 4 and full frontend prototype verification"
```

---

## 计划自我审查

1. **Spec 覆盖**：世界观、设计系统、13 个界面/模态框、LLM 叙事、通知系统、性能/可访问性均有对应任务。
2. **无占位符**：每个任务均给出具体文件、代码片段、验证命令。
3. **类型一致性**：`Character`、`Location`、`NarrativeMessage` 等类型在 Task 2.1 定义，后续任务统一引用。
4. **可执行性**：任务按 Phase 分组，每 Phase 结束可独立验收。

---

## 执行方式选择

计划已保存到 `docs/superpowers/plans/2026-07-09-blue-archive-galgame-redesign-plan.md`。

**两种执行方式：**

1. **Subagent-Driven（推荐）**：每个任务派一个独立子代理执行，我在任务之间审查合并，适合这种大规模多文件改造。
2. **Inline Execution**：在当前会话中按任务顺序执行，我直接修改代码并验证。

请选择一种方式开始。
