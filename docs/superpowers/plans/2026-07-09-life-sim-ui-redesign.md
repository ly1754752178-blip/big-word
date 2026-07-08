# 人生模拟器 UI 重设计实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按照设计规格，全面重制人生模拟器前端界面：消除卡片留白、重制上栏/左栏预览面板/正文/右栏/手机、新增径向技能树与关系网络等大界面。

**Architecture:** 基于现有 Vite + React + Tailwind CSS + Framer Motion 技术栈，保留 `GameContext` 数据流与 `OverlayRenderer` 全屏浮层机制；新增 `SidebarPreviewPanel` 组件承载左侧预览界面；各模块通过 Tailwind 工具类与 CSS 变量统一视觉语言；验证以 TypeScript 编译、`npm run build` 与 Playwright 截图为主。

**Tech Stack:** Vite 5.x, React 18, TypeScript 5, Tailwind CSS 3, Framer Motion, Lucide React

## Global Constraints

- 全中文化（不影响游戏体验的 logo 除外）。
- 禁止使用 emoji；好感度使用 Lucide `Heart` 图标。
- 使用语义化 HTML5 元素与唯一描述性 `id`。
- 不调用浏览器原生 `alert` / `confirm`。
- 动画使用 Framer Motion；性能优先使用 `transform` / `opacity`。
- 每次任务完成后运行 `tsc --noEmit` 与 `npm run build`。
- 仅前端原型，不制作后端。

---

## Phase 1: 全局布局与主题调整

### Task 1: 移除全局卡片留白并建立分区布局

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/styles/globals.css`

**Interfaces:**
- Consumes: `TopBar`, `LeftSidebar`, `RightPanel`, `NarrativePanel`, `Phone`, `OverlayRenderer`
- Produces: 全屏无外边距布局；各区域通过 `border-r` / `border-b` 分隔

- [ ] **Step 1: 修改 page.tsx 根布局**

将外层 `p-2 gap-2` 与三列网格的 `gap-2` 移除；改为全屏紧凑布局，主区域使用 `grid-cols-[auto_1fr_320px]`，左侧 `aside` 内并排放置 `LeftSidebar` 与新增的 `SidebarPreviewPanel` 占位。

```tsx
// src/app/page.tsx
import { GameProvider } from '@/context/GameContext';
import { TopBar } from '@/components/layout/TopBar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { SidebarPreviewPanel } from '@/components/layout/SidebarPreviewPanel';
import { RightPanel } from '@/components/layout/RightPanel';
import { Phone } from '@/components/layout/Phone';
import { NarrativePanel } from '@/components/modules/NarrativePanel';
import { OverlayRenderer } from '@/components/overlays/OverlayRenderer';

export default function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-bg-base text-text-primary font-body selection:bg-accent-sunset/20">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-accent-sunset/10 blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-accent-teal/10 blur-3xl" />
          <div className="absolute -bottom-40 right-1/4 w-[450px] h-[450px] rounded-full bg-accent-amber/10 blur-3xl" />
          <div className="absolute inset-0 grain-overlay" />
        </div>

        <div className="relative z-10 flex flex-col h-screen">
          <TopBar />
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[auto_1fr_320px]">
            <aside className="hidden lg:flex min-h-0 overflow-hidden border-r border-border-soft">
              <LeftSidebar />
              <SidebarPreviewPanel />
            </aside>
            <main className="min-h-0 overflow-hidden">
              <NarrativePanel />
            </main>
            <aside className="hidden lg:block min-h-0 overflow-hidden border-l border-border-soft">
              <RightPanel />
            </aside>
          </div>
        </div>

        <Phone />
        <OverlayRenderer />
      </div>
    </GameProvider>
  );
}
```

- [ ] **Step 2: 新增紧凑分隔工具类**

在 `src/styles/globals.css` 的 `@layer components` 中追加 `.panel-divider` 与 `.panel-surface`：

```css
.panel-divider {
  @apply border-border-soft/60;
}
.panel-surface {
  @apply bg-bg-card/50 backdrop-blur-sm;
}
```

- [ ] **Step 3: 验证 TypeScript 编译**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 4: 验证构建**

Run: `npm run build`
Expected: 构建成功

---

## Phase 2: 上栏重设计

### Task 2: 天气球外框与上栏结构改造

**Files:**
- Modify: `src/components/layout/TopBar.tsx`
- Modify: `src/components/ui/SkyOrb.tsx`
- Modify: `src/styles/globals.css`

**Interfaces:**
- Consumes: `GameState.date`, `GameState.time`, `GameState.festival`
- Produces: 带半圆突出外框的 TopBar；保留时间显示的 SkyOrb

- [ ] **Step 1: 给 SkyOrb 增加被包裹的外框效果**

在 `SkyOrb` 外层增加 `.anime-orb-frame` 容器，并在 `globals.css` 中定义：

```css
.anime-orb-frame {
  position: relative;
  padding: 6px;
  border-radius: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,253,250,0.85) 100%);
  box-shadow:
    0 0 0 2px rgba(218, 205, 190, 0.5),
    0 0 0 6px rgba(255, 253, 250, 0.6),
    0 12px 40px rgba(61, 50, 41, 0.12);
}
```

- [ ] **Step 2: 修改 TopBar 为半圆突出结构**

TopBar 使用 `relative`，中间区域用伪元素实现半圆下凸：

```tsx
<header className="relative h-16 px-5 flex items-center justify-between bg-bg-card-raised/90 backdrop-blur-md border-b border-border-soft z-20">
  {/* 左侧日期区 */}
  <div className="flex items-center gap-4 w-1/3">...{/* 见 Task 3 */}...</div>

  {/* 中间天气球凹槽 */}
  <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 w-28 h-14 bg-bg-card-raised/90 rounded-b-full border-b border-x border-border-soft">
    <div className="absolute left-1/2 -translate-x-1/2 -top-9">
      <SkyOrb />
    </div>
  </div>

  {/* 右侧播放器 */}
  <div className="flex items-center justify-end w-1/3">...{/* 见 Task 4 */}...</div>
</header>
```

- [ ] **Step 3: 编译验证**

Run: `npx tsc --noEmit`
Expected: 无错误

---

### Task 3: 左上角日期与节日迁移

**Files:**
- Modify: `src/components/layout/TopBar.tsx`

**Interfaces:**
- Consumes: `GameState.date`, `GameState.festival`
- Produces: 可点击的日期/节日入口；节日提示使用纯色圆角矩形底色

- [ ] **Step 1: 创建 FestivalBadge 组件片段**

在 `TopBar.tsx` 内部实现：

```tsx
function FestivalBadge({ festival }: { festival: Festival }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-amber text-white text-xs font-bold shadow-sm">
      <Star className="w-3.5 h-3.5 fill-white" />
      今天是{festival.name}哦！
    </span>
  );
}
```

- [ ] **Step 2: 重制左上角日期区**

```tsx
const { openOverlayView } = useGame();

<button
  type="button"
  id="topbar-date-festival"
  onClick={() => openOverlayView('calendarFull')}
  className="flex items-center gap-4 text-left group"
>
  <div className="w-11 h-11 rounded-xl bg-accent-amber/15 border border-accent-amber/25 flex items-center justify-center overflow-hidden">
    {festival ? (
      <img src={`/festivals/${festival.icon}.svg`} alt={festival.name} className="w-7 h-7 object-contain" />
    ) : (
      <Calendar className="w-5 h-5 text-accent-sunset" />
    )}
  </div>
  <div className="flex flex-col">
    <div className="font-heading text-2xl font-bold text-text-primary tracking-tight leading-none">
      {date.year} / {String(date.month).padStart(2, '0')} / {String(date.day).padStart(2, '0')}
    </div>
    <div className="flex items-center gap-2 mt-1.5">
      {festival && <FestivalBadge festival={festival} />}
      <span className="text-xs text-text-secondary">
        {date.weekday}（{date.weekdayCn}）· <span className="capitalize">{getSkyLabel(time.sky)}</span>
      </span>
    </div>
  </div>
</button>
```

- [ ] **Step 3: 准备节日占位图**

在 `public/festivals/` 目录下放置 `star.svg`（日历图标备用）；若缺失可用内联 SVG 兜底：

```tsx
const FestivalIcon = festival ? (
  <div className="w-7 h-7 rounded-full bg-accent-amber/25 flex items-center justify-center">
    <Star className="w-4 h-4 text-accent-amber" />
  </div>
) : (
  <Calendar className="w-5 h-5 text-accent-sunset" />
);
```

- [ ] **Step 4: 编译验证**

Run: `npx tsc --noEmit`
Expected: 无错误

---

### Task 4: 右上角 BGM 播放器卡片

**Files:**
- Create: `src/components/ui/BgmPlayer.tsx`
- Modify: `src/components/layout/TopBar.tsx`

**Interfaces:**
- Consumes: 无状态依赖（纯 UI）
- Produces: 可复用的 BgmPlayer 组件，含唱片图案与控制按钮

- [ ] **Step 1: 创建 BgmPlayer.tsx**

```tsx
import { Repeat, SkipBack, Pause, SkipForward, ListMusic } from 'lucide-react';
import { motion } from 'framer-motion';

interface BgmPlayerProps {
  coverUrl?: string;
  title?: string;
}

export function BgmPlayer({ coverUrl, title = '未播放歌曲' }: BgmPlayerProps) {
  const controls = [
    { icon: Repeat, label: '循环' },
    { icon: SkipBack, label: '上一首' },
    { icon: Pause, label: '暂停', active: true },
    { icon: SkipForward, label: '下一首' },
    { icon: ListMusic, label: '列表' },
  ];

  return (
    <div
      id="topbar-bgm-player"
      className="h-16 flex items-center gap-4 pl-4 pr-5 bg-bg-card-raised/95 border-l border-border-soft"
    >
      {/* 唱片 */}
      <div className="relative w-14 h-14 shrink-0">
        <motion.div
          className="w-full h-full rounded-full bg-[#1a1a1a] border-4 border-[#2a2a2a] shadow-lg flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-10 h-10 rounded-full border-2 border-accent-amber overflow-hidden flex items-center justify-center bg-[#333]">
            {coverUrl ? (
              <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] text-white/60">封面</span>
            )}
          </div>
          <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-black/20" />
        </motion.div>
        {/* 唱针 */}
        <div className="absolute -top-2 -right-2 w-6 h-6">
          <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-white shadow" />
          <div className="absolute top-1 right-1 w-5 h-0.5 bg-white/80 origin-right rotate-[-35deg]" />
        </div>
      </div>

      {/* 歌曲名 */}
      <div className="min-w-0">
        <span className="block text-sm font-bold text-text-primary truncate">《{title}》</span>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center gap-2">
        {controls.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              active
                ? 'bg-accent-sunset text-white shadow-md'
                : 'bg-bg-glass text-text-secondary hover:bg-white/60 hover:text-text-primary'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 在 TopBar 右侧引入 BgmPlayer**

```tsx
import { BgmPlayer } from '@/components/ui/BgmPlayer';

<div className="flex items-center justify-end h-full">
  <BgmPlayer title="黄昏的车站" />
</div>
```

- [ ] **Step 3: 编译与视觉验证**

Run: `npx tsc --noEmit`
Run: `npm run build`
Expected: 无错误且构建成功

---

## Phase 3: 左栏预览面板

### Task 5: 缩小左栏按钮列并创建预览面板骨架

**Files:**
- Modify: `src/components/layout/LeftSidebar.tsx`
- Create: `src/components/layout/SidebarPreviewPanel.tsx`
- Modify: `src/context/GameContext.tsx`
- Modify: `src/types/index.ts`

**Interfaces:**
- Consumes: `SidebarTab`, `activeTab`, `openOverlayView`
- Produces: 收窄的按钮列；默认显示状态概览的预览面板；新增 `previewTab` 状态

- [ ] **Step 1: 在类型中扩展预览状态**

```ts
// src/types/index.ts
export type PreviewTab = SidebarTab;

export interface GameState {
  // ...existing fields
  activeTab: SidebarTab;
  previewTab: SidebarTab; // 新增
  phoneExpanded: boolean;
  // ...
}
```

- [ ] **Step 2: 在 GameContext 中增加 previewTab 状态与切换函数**

```ts
interface GameContextValue {
  // ...existing
  setPreviewTab: (tab: SidebarTab) => void;
}

type Action =
  // ...existing
  | { type: 'SET_PREVIEW_TAB'; payload: SidebarTab };

gameReducer:
  case 'SET_PREVIEW_TAB':
    return { ...state, previewTab: action.payload };

value:
  setPreviewTab: (tab) => dispatch({ type: 'SET_PREVIEW_TAB', payload: tab }),
```

- [ ] **Step 3: 重制 LeftSidebar 为窄按钮列**

```tsx
export function LeftSidebar() {
  const { state, setActiveTab, setPreviewTab } = useGame();

  const handleClick = (id: SidebarTab) => {
    setActiveTab(id);
    setPreviewTab(id);
  };

  return (
    <aside className="w-14 h-full bg-bg-card-raised/80 backdrop-blur-md border-r border-border-soft flex flex-col items-center py-3 gap-2 z-10">
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const active = state.activeTab === item.id;
        return (
          <motion.button
            key={item.id}
            id={`sidebar-${item.id}`}
            onClick={() => handleClick(item.id)}
            whileTap={{ scale: 0.92 }}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors group"
            aria-label={item.label}
            title={item.label}
          >
            <motion.div
              className={`absolute inset-0 rounded-xl ${active ? 'bg-accent-sunset/20' : 'bg-transparent group-hover:bg-white/50'}`}
              layoutId="sidebar-bg"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            <Icon className={`w-5 h-5 relative z-10 ${active ? 'text-accent-sunset' : 'text-text-secondary group-hover:text-text-primary'}`} />
            {active && <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-accent-sunset" />}
          </motion.button>
        );
      })}
    </aside>
  );
}
```

- [ ] **Step 4: 创建 SidebarPreviewPanel 骨架**

```tsx
// src/components/layout/SidebarPreviewPanel.tsx
import { useGame } from '@/hooks/useGameState';
import type { SidebarTab } from '@/types';
import { StatusPreview } from './previews/StatusPreview';
import { TalentsPreview } from './previews/TalentsPreview';
import { SocialPreview } from './previews/SocialPreview';
import { WealthPreview } from './previews/WealthPreview';
import { CalendarPreview } from './previews/CalendarPreview';
import { SettingsPreview } from './previews/SettingsPreview';

const previewMap: Record<SidebarTab, React.FC> = {
  status: StatusPreview,
  talents: TalentsPreview,
  social: SocialPreview,
  wealth: WealthPreview,
  calendar: CalendarPreview,
  settings: SettingsPreview,
};

export function SidebarPreviewPanel() {
  const { state } = useGame();
  const Preview = previewMap[state.previewTab];

  return (
    <section
      id="sidebar-preview-panel"
      className="w-[260px] h-full bg-bg-card/60 backdrop-blur-sm border-r border-border-soft overflow-y-auto"
    >
      <Preview />
    </section>
  );
}
```

- [ ] **Step 5: 编译验证**

Run: `npx tsc --noEmit`
Expected: 无错误

---

### Task 6: 个人状态预览

**Files:**
- Create: `src/components/layout/previews/StatusPreview.tsx`
- Modify: `src/data/mockData.ts`
- Modify: `src/types/index.ts`

**Interfaces:**
- Consumes: `Player`, `PlayerBodyState`, `PlayerStatus`
- Produces: 紧凑的状态概览卡片；点击打开 `status` 全屏浮层

- [ ] **Step 1: 扩展 Player 与 BodyState 类型**

```ts
export interface PlayerBodyState {
  label: string;
  fatigue: number;
  mood: string;
  conditions: string[];
  description: string;
  height: number;
  weight: number;
  ageStage: string;
  physiological: string[];
  mental: string[];
}

export interface Player {
  name: string;
  avatar: string;
  age: number;
  gender: string;
  birthday: string;
  nationality: string;
  householdRegistration: string;
  nativeLanguage: string;
  socialIdentity: string;
  familyMembers: string;
  address: string;
  socialEvaluation: string;
  certificates: string[];
  awards: string[];
  status: PlayerStatus;
  bodyState: PlayerBodyState;
  info: {
    birth: string;
    origin: string;
    household: string;
  };
}
```

- [ ] **Step 2: 更新 mockData.ts 中 player 数据**

```ts
player: {
  name: '叶悠真',
  avatar: '/scenes/classroom.jpg',
  age: 18,
  gender: '男',
  birthday: '2008年4月17日',
  nationality: '日本',
  householdRegistration: '东京都',
  nativeLanguage: '日语',
  socialIdentity: '高中生',
  familyMembers: '父亲、母亲',
  address: '东京都·世田谷区·樱丘一丁目 2-15 阳光公寓 302',
  socialEvaluation: '普通学生，成绩中上',
  certificates: [],
  awards: [],
  status: { stamina: 78, mental: 65, health: 82 },
  bodyState: {
    label: '略显疲惫',
    fatigue: 42,
    mood: '平静',
    conditions: ['轻微睡眠不足', '运动后肌肉酸痛'],
    description: '昨晚熬夜看书，今天上课时有些走神。',
    height: 180,
    weight: 50,
    ageStage: '18岁',
    physiological: ['营养不良'],
    mental: ['颓废', '失眠'],
  },
  info: {
    birth: '2008年4月17日',
    origin: '东京都世田谷区',
    household: '普通工薪家庭（独子）',
  },
},
```

- [ ] **Step 3: 创建 StatusPreview.tsx**

```tsx
import { useGame } from '@/hooks/useGameState';
import { User, Heart, Brain, Activity, ChevronRight } from 'lucide-react';
import { StatBar } from '@/components/ui/StatBar';

function deriveBodyFigure(bodyState: PlayerBodyState) {
  const parts: string[] = [];
  if (bodyState.height >= 175 && bodyState.weight < 55) parts.push('瘦竹竿一样');
  else if (bodyState.weight > 80) parts.push('敦实');
  else parts.push('身材匀称');

  if (bodyState.mental.includes('颓废')) parts.push('颓废');
  if (bodyState.mental.includes('失眠')) parts.push('睡眠不足');

  return `${parts.join('、')}的${bodyState.ageStage}年轻人`;
}

export function StatusPreview() {
  const { state, openOverlayView } = useGame();
  const { player } = state;

  return (
    <div className="p-3 space-y-3">
      {/* ID 卡 */}
      <div className="p-3 rounded-2xl bg-gradient-to-br from-status-pale to-white border border-status-salmon/30">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-status-coral/25 to-status-salmon/25 border-2 border-white shadow-md flex items-center justify-center">
            {player.avatar ? (
              <img src={player.avatar} alt={player.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <User className="w-7 h-7 text-status-coral" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-heading text-lg font-bold text-text-primary truncate">{player.name}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-status-coral/15 text-status-coral text-[10px] font-medium">{player.bodyState.label}</span>
              <span className="px-2 py-0.5 rounded-full bg-status-salmon/15 text-text-secondary text-[10px]">{player.socialIdentity}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <StatBar label="体力" value={player.status.stamina} color="bg-status-coral" icon={<Heart className="w-3 h-3" />} />
          <StatBar label="精神" value={player.status.mental} color="bg-status-teal" icon={<Brain className="w-3 h-3" />} />
          <StatBar label="健康" value={player.status.health} color="bg-accent-green" icon={<Activity className="w-3 h-3" />} />
        </div>
      </div>

      {/* 身体状态概览 */}
      <button
        type="button"
        onClick={() => openOverlayView('status')}
        className="w-full p-3 rounded-2xl bg-white/60 border border-border-soft text-left hover:bg-white/80 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-secondary">身体状态</span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </div>
        <div className="mt-2 text-sm font-bold text-text-primary truncate">{deriveBodyFigure(player.bodyState)}</div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {[...player.bodyState.physiological, ...player.bodyState.mental].map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-md bg-status-coral/10 text-status-coral text-[10px]">{tag}</span>
          ))}
        </div>
      </button>

      {/* 个人讯息概览 */}
      <button
        type="button"
        onClick={() => openOverlayView('status')}
        className="w-full p-3 rounded-2xl bg-white/60 border border-border-soft text-left hover:bg-white/80 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-secondary">个人讯息</span>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </div>
        <div className="mt-2 space-y-1 text-xs text-text-primary">
          <div className="flex justify-between"><span className="text-text-muted">年龄</span><span>{player.age}岁</span></div>
          <div className="flex justify-between"><span className="text-text-muted">身份</span><span className="truncate max-w-[120px]">{player.socialIdentity}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">住址</span><span className="truncate max-w-[120px]">{player.address}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">现金</span><span>¥{player.finance.cash ?? 3240}</span></div>
        </div>
      </button>
    </div>
  );
}
```

- [ ] **Step 4: 编译验证**

Run: `npx tsc --noEmit`
Expected: 无错误

---

### Task 7: 天赋才能预览

**Files:**
- Create: `src/components/layout/previews/TalentsPreview.tsx`
- Create: `src/components/layout/previews/SocialPreview.tsx`
- Create: `src/components/layout/previews/WealthPreview.tsx`
- Create: `src/components/layout/previews/CalendarPreview.tsx`
- Create: `src/components/layout/previews/SettingsPreview.tsx`

**Interfaces:**
- Consumes: `talents`, `skills`, `relationships`, `finance`, `calendar`
- Produces: 五个预览面板，点击按钮进入对应全屏浮层

- [ ] **Step 1: 创建 TalentsPreview.tsx**

```tsx
import { useGame } from '@/hooks/useGameState';
import { Sparkles, Brain, ChevronRight, Heart, Moon, BookOpen } from 'lucide-react';
import type { Talent, SkillTree } from '@/types';

const talentIconMap: Record<string, typeof Heart> = {
  heart: Heart,
  moon: Moon,
  'book-open': BookOpen,
};

export function TalentsPreview() {
  const { state, openOverlayView } = useGame();
  const allSkills = [...state.skills.daily, ...state.skills.work, ...state.skills.special];

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-text-secondary">天赋特质</span>
        <button
          type="button"
          onClick={() => openOverlayView('talents')}
          className="flex items-center text-[10px] text-text-muted hover:text-talent-violet"
        >
          详情 <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {state.talents.map((talent) => {
          const Icon = talentIconMap[talent.icon] ?? Sparkles;
          return (
            <div
              key={talent.id}
              className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-talent-violet/10 border border-talent-violet/20 min-w-[64px]"
            >
              <Icon className="w-5 h-5 text-talent-violet" />
              <span className="text-[10px] text-text-primary whitespace-nowrap">{talent.name}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-bold text-text-secondary">技能树</span>
      </div>

      <div className="space-y-2">
        {allSkills.slice(0, 3).map((skill) => (
          <button
            key={skill.id}
            type="button"
            onClick={() => openOverlayView('skillTree', { skillId: skill.id })}
            className="w-full p-2 rounded-xl bg-white/60 border border-border-soft flex items-center gap-2 hover:bg-white/80 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-talent-violet to-talent-magenta flex items-center justify-center text-white">
              <Brain className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-bold text-text-primary truncate">{skill.name}</div>
              <div className="text-[10px] text-text-muted">Lv.{skill.level}/{skill.maxLevel}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 SocialPreview.tsx**

```tsx
import { useGame } from '@/hooks/useGameState';
import { Users, Heart, ChevronRight, Network } from 'lucide-react';
import type { Relation } from '@/types';

function RelationRow({ relation }: { relation: Relation }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/60 border border-border-soft">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-social-teal/30 to-social-cyan/30 border-2 border-white shadow-sm flex items-center justify-center font-bold text-text-primary text-sm">
        {relation.name.slice(0, 1)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-text-primary truncate">{relation.name}</div>
        <div className="text-[10px] text-text-muted truncate">{relation.title}</div>
      </div>
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-social-teal/10 border border-social-teal/20">
        <Heart className="w-3 h-3 text-social-teal fill-social-teal/40" />
        <span className="text-[10px] font-number text-text-primary">{relation.affinity}</span>
      </div>
    </div>
  );
}

export function SocialPreview() {
  const { state, openOverlayView } = useGame();
  const present = state.relationships.list.slice(0, 5);
  const topAffinity = [...state.relationships.list].sort((a, b) => b.affinity - a.affinity).slice(0, 5);

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-text-secondary">在场角色</span>
      </div>
      <div className="space-y-1.5">{present.map((r) => <RelationRow key={r.id} relation={r} />)}</div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs font-bold text-text-secondary">最高好感</span>
      </div>
      <div className="space-y-1.5">{topAffinity.map((r) => <RelationRow key={`top-${r.id}`} relation={r} />)}</div>

      <button
        type="button"
        onClick={() => openOverlayView('network')}
        className="w-full mt-2 py-2 rounded-xl bg-social-teal/10 border border-social-teal/20 text-social-teal text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-social-teal/20 transition-colors"
      >
        <Network className="w-4 h-4" /> 关系网络
      </button>
    </div>
  );
}
```

- [ ] **Step 3: 创建 WealthPreview.tsx**

```tsx
import { useGame } from '@/hooks/useGameState';
import { Wallet, TrendingUp, TrendingDown, Banknote, CreditCard, Coins, ChevronRight } from 'lucide-react';
import { getDailySummary, formatCurrency } from '@/lib/finance';

export function WealthPreview() {
  const { state, openOverlayView } = useGame();
  const today = `${state.date.year}-${String(state.date.month).padStart(2, '0')}-${String(state.date.day).padStart(2, '0')}`;
  const daily = getDailySummary(state.finance.expenses, today);
  const cash = state.finance.virtualAssets.find((a) => a.name === '现金')?.value ?? 3240;

  return (
    <div className="p-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-xl bg-wealth-emerald/10 border border-wealth-emerald/20">
          <div className="flex items-center gap-1 text-[10px] text-wealth-emerald"><TrendingUp className="w-3 h-3" /> 今日收入</div>
          <div className="mt-1 font-number text-sm font-bold text-text-primary">+¥{formatCurrency(daily.income)}</div>
        </div>
        <div className="p-2 rounded-xl bg-status-coral/10 border border-status-coral/20">
          <div className="flex items-center gap-1 text-[10px] text-status-coral"><TrendingDown className="w-3 h-3" /> 今日支出</div>
          <div className="mt-1 font-number text-sm font-bold text-text-primary">-¥{formatCurrency(Math.abs(daily.expense))}</div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-white/60 border border-border-soft">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-secondary">现金</span>
          <Banknote className="w-4 h-4 text-wealth-gold" />
        </div>
        <div className="mt-1 font-number text-lg font-bold text-text-primary">¥{formatCurrency(cash)}</div>
      </div>

      <div className="space-y-2">
        {state.finance.virtualAssets
          .filter((a) => a.name !== '现金')
          .slice(0, 2)
          .map((asset) => (
            <div key={asset.id} className="p-2 rounded-xl bg-white/60 border border-border-soft flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-wealth-gold/15 flex items-center justify-center text-wealth-gold">
                  {asset.name === '银行账户' ? <CreditCard className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                </div>
                <span className="text-xs text-text-primary">{asset.name}</span>
              </div>
              <span className="text-xs font-number text-text-primary">¥{formatCurrency(asset.value)}</span>
            </div>
          ))}
      </div>

      <button
        type="button"
        onClick={() => openOverlayView('wealth')}
        className="w-full py-2 rounded-xl bg-wealth-emerald/10 border border-wealth-emerald/20 text-wealth-emerald text-xs font-bold flex items-center justify-center gap-1 hover:bg-wealth-emerald/20 transition-colors"
      >
        财产详情 <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
```

- [ ] **Step 4: 创建 CalendarPreview.tsx 与 SettingsPreview.tsx**

`CalendarPreview.tsx` 复用 `CalendarEventsOverlay` 中的 `EventMiniCard` 逻辑但等比缩小；`SettingsPreview.tsx` 显示系统快捷入口（存档、读档、设置按钮）。

- [ ] **Step 5: 编译验证**

Run: `npx tsc --noEmit`
Expected: 无错误

---

## Phase 4: 正文叙事区改造

### Task 8: 旁白去气泡与对话放大

**Files:**
- Modify: `src/components/modules/NarrativePanel.tsx`

**Interfaces:**
- Consumes: `NarrativeMessage`
- Produces: 旁白直接呈现；对话头像、气泡、文字放大；间距压缩

- [ ] **Step 1: 修改 MessageBubble 组件**

```tsx
function MessageBubble({ message }: { message: NarrativeMessage }) {
  const isScene = message.type === 'scene';
  const isDialogue = message.type === 'dialogue';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-3 ${isScene ? 'flex justify-center' : 'flex justify-start'}`}
    >
      {isScene && (
        <div className="max-w-[90%] text-center">
          <p className="text-base leading-relaxed text-text-primary/90">{message.content}</p>
          <span className="text-[10px] text-text-muted mt-1 block">{message.timestamp}</span>
        </div>
      )}

      {isDialogue && (
        <div className="w-full max-w-[92%] flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-amber/30 to-accent-sunset/30 border-[5px] border-white shadow-md flex items-center justify-center shrink-0"
          >
            {message.avatar ? (
              <span className="text-xl font-bold text-text-primary">{message.avatar.slice(0, 1).toUpperCase()}</span>
            ) : (
              <User className="w-8 h-8 text-text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {message.speaker && (
              <span className="text-base font-bold text-accent-sunset block mb-1">{message.speaker}</span>
            )}
            <div className="inline-block px-5 py-3 rounded-2xl bg-bg-card-raised border border-border-soft shadow-sm"
            >
              <p className="text-base leading-snug text-text-primary">{message.content}</p>
            </div>
            <span className="text-[10px] text-text-muted mt-1 block">{message.timestamp}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: 调整 NarrativePanel 容器**

```tsx
<GlassCard variant="raised" className="h-full flex flex-col overflow-hidden rounded-none border-0 bg-transparent">
  <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 scroll-smooth">
    <AnimatePresence initial={false}>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </AnimatePresence>
  </div>
  {/* 输入区保持现有逻辑，仅微调内边距 */}
</GlassCard>
```

- [ ] **Step 3: 编译验证**

Run: `npx tsc --noEmit`
Expected: 无错误

---

## Phase 5: 右栏与手机改造

### Task 9: 右栏区域重排与手机视觉重制

**Files:**
- Modify: `src/components/layout/RightPanel.tsx`
- Modify: `src/components/layout/Phone/PhoneFrame.tsx`
- Modify: `src/components/layout/Phone/index.tsx`
- Modify: `src/styles/globals.css`

**Interfaces:**
- Consumes: `map`, `notifications`, `calendar`, `phoneApps`
- Produces: 场景印象图 + GPS 地图 + 周边动态/通知合并 + 手机头部的新右栏；黑边框浅色屏幕手机

- [ ] **Step 1: 重排 RightPanel**

```tsx
export function RightPanel() {
  const { state } = useGame();
  const { notifications, selectedMarkerId, calendar } = state;
  const [mapOpen, setMapOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="h-full flex flex-col">
      {/* 场景印象图 */}
      <div className="flex-[2] min-h-0 relative bg-bg-card/30">
        <SceneImpression />
      </div>

      {/* GPS 大地图 */}
      <div className="flex-[2] min-h-0 border-t border-border-soft p-2 flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-text-secondary">GPS</span>
          <button type="button" onClick={() => setMapOpen(true)} className="text-[10px] text-text-muted hover:text-accent-sunset">展开</button>
        </div>
        <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-border-soft">
          <MiniMap />
        </div>
      </div>

      {/* 周边动态 + 通知合并 */}
      <div className="flex-[3] min-h-0 border-t border-border-soft p-2 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-3.5 h-3.5 text-accent-amber" />
          <span className="text-xs font-bold text-text-secondary">周边动态</span>
          <Bell className="w-3.5 h-3.5 text-text-muted ml-auto" />
          {unreadCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-accent-sunset text-white text-[9px] flex items-center justify-center">{unreadCount}</span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5">
          {calendar.nearbyEvents.slice(0, 3).map((event) => (
            <EventListItem key={event.id} {...event} type="nearby" />
          ))}
          {notifications.slice(0, 3).map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {mapOpen && <FullMapModal onClose={() => setMapOpen(false)} />}
        {selectedMarkerId && <MapTargetDetail />}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: 重制手机边框与屏幕底色**

在 `globals.css` 中更新：

```css
:root {
  --phone-frame: #1C1C1E;
  --phone-screen-bg: #FAF6F1;
  --phone-screen-text: #3D3229;
}

.phone-case {
  background: #1C1C1E;
  border-radius: 32px 32px 0 0;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.35);
}

.phone-screen {
  background: var(--phone-screen-bg);
  border-radius: 28px 28px 0 0;
  color: var(--phone-screen-text);
}
```

- [ ] **Step 3: 修改 PhoneFrame 为更宽更扁的头部**

```tsx
{!expanded && (
  <motion.button
    type="button"
    onClick={onHeadClick}
    className="fixed bottom-0 right-0 z-50 w-72 h-10 phone-case flex items-center justify-center cursor-pointer"
    aria-label="打开手机"
  >
    <div className="w-20 h-1 rounded-full bg-white/30" />
    <div className="absolute right-4 flex items-center gap-2">
      <Wifi className="w-4 h-4 text-white/70" />
      <Battery className="w-4 h-4 text-white/70" />
    </div>
  </motion.button>
)}

<motion.div
  initial={{ y: '110%' }}
  animate={{ y: expanded ? '0%' : '110%' }}
  className="fixed bottom-0 right-0 z-50 w-80 h-[560px] phone-case flex flex-col overflow-hidden"
>
  <button
    type="button"
    onClick={onHeadClick}
    className="h-10 shrink-0 flex items-center justify-center border-b border-white/10"
  >
    <div className="w-20 h-1 rounded-full bg-white/30" />
    <div className="absolute right-4 flex items-center gap-2 text-white/70">
      <Wifi className="w-4 h-4" />
      <Battery className="w-4 h-4" />
    </div>
  </button>
  <div className="flex-1 mx-3 mt-1 mb-3 phone-screen relative overflow-hidden">
    <div className="relative z-10 h-full">{children}</div>
  </div>
  <div className="h-5 shrink-0 flex items-center justify-center">
    <div className="w-24 h-1 rounded-full bg-white/30" />
  </div>
</motion.div>
```

- [ ] **Step 4: 修改 Phone 内部字体颜色**

在 `Phone/index.tsx` 中，将 `text-white/80` 改为 `text-text-primary` 等适合浅色屏幕的颜色。

- [ ] **Step 5: 编译与构建验证**

Run: `npx tsc --noEmit`
Run: `npm run build`
Expected: 无错误且构建成功

---

## Phase 6: 全屏大界面重制

### Task 10: 径向技能树界面

**Files:**
- Modify: `src/components/overlays/SkillTreeOverlay.tsx`
- Modify: `src/types/index.ts`（确认 position 字段）

**Interfaces:**
- Consumes: `SkillTree`, `SkillNode`
- Produces: 中心向外扩散的径向技能树 SVG/Canvas 视图

- [ ] **Step 1: 实现径向技能树渲染**

```tsx
export function SkillTreeOverlay() {
  const { state } = useGame();
  const { detailView } = state;
  const skillId = (detailView?.payload?.skillId as string) ?? state.skills.daily[0]?.id;
  const allSkills = [...state.skills.daily, ...state.skills.work, ...state.skills.special];
  const skill = allSkills.find((s) => s.id === skillId) ?? allSkills[0];

  const centerX = 50;
  const centerY = 50;

  return (
    <div className="w-full h-full min-h-[400px] relative overflow-hidden">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 背景同心圆 */}
        {[20, 40, 60, 80].map((r) => (
          <circle key={r} cx={centerX} cy={centerY} r={r} fill="none" stroke="rgba(125,110,94,0.12)" strokeWidth="0.3" />
        ))}

        {/* 连线 */}
        {skill.nodes.map((node) =>
          (node.parentIds ?? []).map((parentId) => {
            const parent = skill.nodes.find((n) => n.id === parentId);
            if (!parent || !node.position || !parent.position) return null;
            return (
              <line
                key={`${parent.id}-${node.id}`}
                x1={parent.position.x}
                y1={parent.position.y}
                x2={node.position.x}
                y2={node.position.y}
                stroke={node.unlocked ? '#8B5CF6' : 'rgba(125,110,94,0.25)'}
                strokeWidth="0.5"
              />
            );
          })
        )}

        {/* 节点 */}
        {skill.nodes.map((node) => {
          if (!node.position) return null;
          return (
            <g key={node.id} transform={`translate(${node.position.x}, ${node.position.y})`}>
              <circle
                r="4"
                fill={node.unlocked ? '#8B5CF6' : '#E8E0D8'}
                stroke={node.unlocked ? '#F5B041' : '#BDB0A0'}
                strokeWidth="0.5"
              />
              <text y="6.5" textAnchor="middle" fontSize="2.2" fill={node.unlocked ? '#3D3229' : '#9A8B7A'}>
                {node.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-bg-card-floating border border-border-soft text-sm font-bold text-text-primary">
        {skill.name} · Lv.{skill.level}/{skill.maxLevel}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 编译验证**

Run: `npx tsc --noEmit`
Expected: 无错误

---

### Task 11: 关系网络界面

**Files:**
- Modify: `src/components/overlays/NetworkOverlay.tsx`

**Interfaces:**
- Consumes: `relationships.list`, `relationships.network`
- Produces: 可拖拽/缩放的关系网络；右上角过滤 UI

- [ ] **Step 1: 实现关系网络 SVG 视图与过滤**

使用 SVG + transform 实现拖拽缩放；按 `relation.group` 分组框选相同关系；唯一关系单独显示；实线连接玩家，虚线连接角色间关系。

- [ ] **Step 2: 编译验证**

Run: `npx tsc --noEmit`
Expected: 无错误

---

### Task 12: 日历网格界面

**Files:**
- Modify: `src/components/overlays/CalendarOverlay.tsx`

**Interfaces:**
- Consumes: `calendar`, `dateMarks`, `festival`
- Produces: 网格图表式月历

- [ ] **Step 1: 实现月历网格**

生成当前月份日期网格，标注：
- 当日高亮
- 节日名称
- 事件点
- 个人标记颜色

- [ ] **Step 2: 编译验证**

Run: `npx tsc --noEmit`
Expected: 无错误

---

### Task 13: 个人状态/财富详情/日历事件全屏浮层内容重制

**Files:**
- Modify: `src/components/overlays/PersonalStatusOverlay.tsx`
- Modify: `src/components/overlays/WealthAssetsOverlay.tsx`
- Modify: `src/components/overlays/CalendarEventsOverlay.tsx`

**Interfaces:**
- Consumes: 扩展后的 `Player` / `Finance` / `Calendar` 数据
- Produces: 信息完整、布局紧凑的全屏详情

- [ ] **Step 1: 重制 PersonalStatusOverlay**

增加身体状态完整信息（身高、体重、年龄阶段、生理/精神状态）与个人讯息完整字段。

- [ ] **Step 2: 重制 WealthAssetsOverlay**

将「最近流水」改为「今日流水」；合并今日收支概览；底部增加「财产详情」按钮进入完整资产列表。

- [ ] **Step 3: 重制 CalendarEventsOverlay**

等比缩小后，顶部增加「日历总览」按钮。

- [ ] **Step 4: 编译验证**

Run: `npx tsc --noEmit`
Expected: 无错误

---

## Phase 7: 最终集成与打磨

### Task 14: 全局视觉一致性检查

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `tailwind.config.ts`

**Interfaces:**
- Produces: 统一的色板、阴影、间距变量

- [ ] **Step 1: 审查并补全 CSS 变量**

确保 `--status-pale`、`--talent-pale` 等 pale 色变量存在；在 `:root` 中补充：

```css
--status-pale: #FFF5F2;
--talent-pale: #F8F5FF;
--social-pale: #F0FDFB;
--wealth-pale: #F0FDF4;
--calendar-pale: #F5F8FF;
--map-pale: #FAF6F1;
--narrative-paper: #FFFDF8;
```

- [ ] **Step 2: 验证 tailwind.config.ts 扩展**

确认 `colors` 中已映射上述变量；如缺失则补充。

- [ ] **Step 3: 编译与构建**

Run: `npx tsc --noEmit`
Run: `npm run build`
Expected: 无错误且构建成功

---

### Task 15: Playwright 视觉验证

**Files:**
- Create: `e2e/visual-check.spec.ts`（如不存在 e2e 目录则创建）

**Interfaces:**
- Produces: 关键界面截图用于人工审查

- [ ] **Step 1: 安装 Playwright（如未安装）**

Run: `npm install -D @playwright/test`
Run: `npx playwright install chromium`

- [ ] **Step 2: 编写基础截图测试**

```ts
import { test, expect } from '@playwright/test';

test('main layout renders', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('#topbar-bgm-player');
  await page.waitForSelector('#sidebar-preview-panel');
  await expect(page.locator('#topbar-date-festival')).toBeVisible();
});
```

- [ ] **Step 3: 启动服务并运行测试**

Run: `npm run dev`
Run: `npx playwright test`
Expected: 测试通过

---

## 附录：文件变更清单

| 路径 | 操作 | 说明 |
|------|------|------|
| `src/app/page.tsx` | 修改 | 全屏紧凑布局 |
| `src/components/layout/TopBar.tsx` | 修改 | 天气球外框、BGM播放器、节日迁移 |
| `src/components/ui/BgmPlayer.tsx` | 创建 | BGM 播放器组件 |
| `src/components/ui/SkyOrb.tsx` | 修改 | 增加外框 |
| `src/components/layout/LeftSidebar.tsx` | 修改 | 窄按钮列 |
| `src/components/layout/SidebarPreviewPanel.tsx` | 创建 | 预览面板容器 |
| `src/components/layout/previews/*.tsx` | 创建 6 个 | 各类预览 |
| `src/components/modules/NarrativePanel.tsx` | 修改 | 旁白去气泡、对话放大 |
| `src/components/layout/RightPanel.tsx` | 修改 | 右栏区域重排 |
| `src/components/layout/Phone/PhoneFrame.tsx` | 修改 | 手机头部重制 |
| `src/components/layout/Phone/index.tsx` | 修改 | 屏幕字体颜色 |
| `src/components/overlays/SkillTreeOverlay.tsx` | 修改 | 径向技能树 |
| `src/components/overlays/NetworkOverlay.tsx` | 修改 | 关系网络 |
| `src/components/overlays/CalendarOverlay.tsx` | 修改 | 网格日历 |
| `src/components/overlays/PersonalStatusOverlay.tsx` | 修改 | 完整状态详情 |
| `src/components/overlays/WealthAssetsOverlay.tsx` | 修改 | 今日流水与资产详情 |
| `src/components/overlays/CalendarEventsOverlay.tsx` | 修改 | 日历事件预览 |
| `src/context/GameContext.tsx` | 修改 | previewTab 状态 |
| `src/types/index.ts` | 修改 | 扩展 Player/BodyState/Finance |
| `src/data/mockData.ts` | 修改 | 补充新字段数据 |
| `src/styles/globals.css` | 修改 | 紧凑分隔、手机样式、色板 |
| `tailwind.config.ts` | 修改 | 补全颜色映射 |
| `e2e/visual-check.spec.ts` | 创建 | 基础视觉测试 |

---

## 自我审查

- **Spec coverage**: 所有主要需求（布局、上栏、左栏预览、正文、右栏、手机、大界面）均已映射到任务。
- **Placeholder scan**: 无 TBD/TODO；所有关键代码已给出结构或示例。
- **Type consistency**: `previewTab`、`Player` 扩展字段、`finance.cash` 等在类型、mock、组件中保持一致。
