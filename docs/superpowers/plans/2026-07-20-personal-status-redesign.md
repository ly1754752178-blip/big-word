# 个人状态界面重制实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 彻底移除疲劳相关内容，重制个人状态详情页与侧边栏预览，建立全局 In-App Notification 系统。

**Architecture:** 保持 React + TypeScript + Tailwind CSS 技术栈，复用项目 design-system 色彩与字体；通过紧凑的信息分组与微动画提升信息密度和高级感；通知系统通过 GameContext 状态驱动，右上角固定容器渲染。

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React, clsx / tailwind-merge

## Global Constraints

- 禁用 emoji，所有图标使用 Lucide React SVG。
- 文本全中文化（logo / 纯视觉元素除外）。
- 动画仅使用 `transform` / `opacity`，支持 `prefers-reduced-motion`。
- 所有交互元素需有唯一、描述性的 `id`。
- 使用语义化 HTML（`section`, `header`, `dl/dt/dd`）。
- 不使用浏览器原生 `alert` / `confirm` / `toast`。
- 保持项目现有 design-system 色彩与字体系统。

---

## File Structure

### 修改文件

| 文件 | 说明 |
|---|---|
| `src/types/index.ts` | 删除 `PlayerBodyState.fatigue` 字段。 |
| `src/data/mockData.ts` | 删除 `player.bodyState.fatigue` 数据。 |
| `src/context/GameContext.tsx` | 增加 `inAppNotifications` 状态与 `add/dismiss/clear` 方法。 |
| `src/components/overlays/PersonalStatusOverlay.tsx` | 完全重制，高密度信息布局。 |
| `src/components/layout/previews/StatusPreview.tsx` | 重制为精简快照。 |
| `src/App.tsx` 或通知挂载点 | 挂载 `NotificationContainer`。 |
| `src/components/ui/StatBar.tsx` | 可选优化：增强动画与 ID 支持。 |

### 新建文件

| 文件 | 说明 |
|---|---|
| `src/components/ui/NotificationContainer.tsx` | 通知容器，固定右上角，管理多条通知。 |
| `src/components/ui/NotificationItem.tsx` | 单条通知项，含图标、标题、消息、关闭。 |

---

## Task 1: 清理 `fatigue` 数据模型

**Files:**
- Modify: `src/types/index.ts:65-76`
- Modify: `src/data/mockData.ts:487-498`
- Test: 全局搜索 `fatigue` / `疲劳` 确认无残留

**Interfaces:**
- Consumes: 现有 `PlayerBodyState` 类型定义。
- Produces: 删除 `fatigue: number` 后的新 `PlayerBodyState` 类型。

- [ ] **Step 1: 删除类型定义中的 `fatigue`**

打开 `src/types/index.ts`，找到：

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
```

改为：

```ts
export interface PlayerBodyState {
  label: string;
  mood: string;
  conditions: string[];
  description: string;
  height: number;
  weight: number;
  ageStage: string;
  physiological: string[];
  mental: string[];
}
```

- [ ] **Step 2: 删除 mock 数据中的 `fatigue`**

打开 `src/data/mockData.ts`，找到 `player.bodyState` 块：

```ts
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
```

改为：

```ts
bodyState: {
  label: '略显疲惫',
  mood: '平静',
  conditions: ['轻微睡眠不足', '运动后肌肉酸痛'],
  description: '昨晚熬夜看书，今天上课时有些走神。',
  height: 180,
  weight: 50,
  ageStage: '18岁',
  physiological: ['营养不良'],
  mental: ['颓废', '失眠'],
},
```

- [ ] **Step 3: 全局搜索残留引用**

Run:

```bash
grep -rE "fatigue|疲劳" --include="*.ts" --include="*.tsx" --include="*.html" src/ ui-showcase.html || echo "No fatigue references found"
```

Expected: `No fatigue references found`

如果仍找到引用，逐一清理。

- [ ] **Step 4: TypeScript 类型检查**

Run:

```bash
npx tsc --noEmit
```

Expected: 无与 `fatigue` 相关的类型错误。

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/data/mockData.ts
git commit -m "refactor: 彻底移除 PlayerBodyState.fatigue 数据模型"
```

---

## Task 2: 在 GameContext 中扩展通知状态

**Files:**
- Modify: `src/context/GameContext.tsx`

**Interfaces:**
- Consumes: `InAppNotification` 类型（已定义于 `src/types/index.ts`）。
- Produces:
  - `state.inAppNotifications: InAppNotification[]`
  - `addNotification(notification)`
  - `dismissNotification(id)`
  - `clearNotifications()`

- [ ] **Step 1: 查看现有 GameContext 结构**

Read `src/context/GameContext.tsx` 与 `src/hooks/useGameState.ts`，确认 state 初始化、reducer 或 setter 的写法模式。

- [ ] **Step 2: 在 Context 类型中增加通知相关字段与方法**

假设当前 Context 类型为：

```ts
interface GameContextType {
  state: GameState;
  openOverlayView: (type: OverlayViewType, title?: string, payload?: Record<string, unknown>) => void;
  closeOverlayView: () => void;
  // ... 其他方法
}
```

增加：

```ts
interface GameContextType {
  state: GameState;
  openOverlayView: (type: OverlayViewType, title?: string, payload?: Record<string, unknown>) => void;
  closeOverlayView: () => void;
  addNotification: (notification: Omit<InAppNotification, 'id'>) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  // ... 其他方法
}
```

- [ ] **Step 3: 实现通知方法**

在 Provider 内部添加：

```ts
const addNotification = useCallback((notification: Omit<InAppNotification, 'id'>) => {
  const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  setState((prev) => ({
    ...prev,
    inAppNotifications: [...prev.inAppNotifications, { ...notification, id }].slice(-3),
  }));
}, []);

const dismissNotification = useCallback((id: string) => {
  setState((prev) => ({
    ...prev,
    inAppNotifications: prev.inAppNotifications.filter((n) => n.id !== id),
  }));
}, []);

const clearNotifications = useCallback(() => {
  setState((prev) => ({ ...prev, inAppNotifications: [] }));
}, []);
```

- [ ] **Step 4: 确保 state 初始值包含 `inAppNotifications: []`**

在 `mockGameState` 或初始 state 中确认：

```ts
inAppNotifications: [],
```

- [ ] **Step 5: 运行类型检查**

Run:

```bash
npx tsc --noEmit
```

Expected: 无类型错误。

- [ ] **Step 6: Commit**

```bash
git add src/context/GameContext.tsx
git commit -m "feat: GameContext 增加 InAppNotification 状态管理"
```

---

## Task 3: 实现通知 UI 组件

**Files:**
- Create: `src/components/ui/NotificationItem.tsx`
- Create: `src/components/ui/NotificationContainer.tsx`

**Interfaces:**
- Consumes: `InAppNotification` 类型，`dismissNotification(id)` 方法。
- Produces: `NotificationContainer` 组件，渲染通知列表。

### Task 3.1: NotificationItem

- [ ] **Step 1: 创建文件**

Create `src/components/ui/NotificationItem.tsx`：

```tsx
import { useEffect, useRef } from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import type { InAppNotification } from '@/types';

const config = {
  info: { icon: Info, bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', iconColor: 'text-sky-500' },
  success: { icon: CheckCircle, bg: 'bg-mint-50', border: 'border-mint-200', text: 'text-mint-700', iconColor: 'text-mint-500' },
  warning: { icon: AlertTriangle, bg: 'bg-cream-50', border: 'border-cream-200', text: 'text-amber-700', iconColor: 'text-amber-500' },
  error: { icon: XCircle, bg: 'bg-coral-50', border: 'border-coral-200', text: 'text-coral-700', iconColor: 'text-coral-500' },
};

interface NotificationItemProps {
  notification: InAppNotification;
  onDismiss: (id: string) => void;
}

export function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const { id, type, title, message, duration = 4000 } = notification;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const style = config[type];
  const Icon = style.icon;

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, duration, onDismiss]);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => onDismiss(id), duration);
  };

  return (
    <div
      id={`notification-${id}`}
      role="alert"
      aria-live="polite"
      className={`
        w-80 rounded-2xl border shadow-soft-lg p-4
        ${style.bg} ${style.border} ${style.text}
        animate-slide-in-right
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconColor}`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-snug">{title}</div>
          {message && (
            <div className="mt-1 text-xs opacity-90 leading-relaxed">{message}</div>
          )}
        </div>
        <button
          type="button"
          id={`notification-close-${id}`}
          aria-label="关闭通知"
          className="shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
          onClick={() => onDismiss(id)}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 在 globals.css 中添加进入动画**

打开 `src/styles/globals.css`，在 `@layer utilities` 或 `keyframes` 区域添加：

```css
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-out-up {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-12px); }
}

.animate-slide-in-right {
  animation: slide-in-right 0.2s ease-out forwards;
}

.animate-slide-out-up {
  animation: slide-out-up 0.15s ease-in forwards;
}
```

### Task 3.2: NotificationContainer

- [ ] **Step 3: 创建文件**

Create `src/components/ui/NotificationContainer.tsx`：

```tsx
import { useGame } from '@/hooks/useGameState';
import { NotificationItem } from './NotificationItem';

export function NotificationContainer() {
  const { state, dismissNotification } = useGame();
  const { inAppNotifications } = state;

  if (inAppNotifications.length === 0) return null;

  return (
    <div
      id="notification-container"
      aria-label="应用内通知"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
    >
      {inAppNotifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem
            notification={notification}
            onDismiss={dismissNotification}
          />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: 挂载到应用顶层**

打开 `src/App.tsx`（或等效根组件），在合适位置添加：

```tsx
import { NotificationContainer } from '@/components/ui/NotificationContainer';

// ...

function App() {
  return (
    <div className="relative min-h-screen">
      {/* 现有应用内容 */}
      <NotificationContainer />
    </div>
  );
}
```

如果 `App.tsx` 结构复杂，可改为在 `OverlayRenderer` 同级挂载，确保通知在所有浮层之上。

- [ ] **Step 5: 类型检查**

Run:

```bash
npx tsc --noEmit
```

Expected: 无类型错误。

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/NotificationItem.tsx src/components/ui/NotificationContainer.tsx src/styles/globals.css src/App.tsx
git commit -m "feat: 实现全局 InAppNotification UI 组件并挂载"
```

---

## Task 4: 重制 `StatusPreview`

**Files:**
- Modify: `src/components/layout/previews/StatusPreview.tsx`

**Interfaces:**
- Consumes: `player` 数据，`openOverlayView('status')`。
- Produces: 精简的侧边栏个人状态预览。

- [ ] **Step 1: 重写 StatusPreview 组件**

打开 `src/components/layout/previews/StatusPreview.tsx`，替换为：

```tsx
import { useGame } from '@/hooks/useGameState';
import { Heart, Brain, Activity, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AvatarImg } from '@/components/ui/AvatarImg';
import { StatBar } from '@/components/ui/StatBar';

export function StatusPreview() {
  const { state, openOverlayView } = useGame();
  const { player } = state;

  return (
    <div className="space-y-2">
      {/* 标题栏 */}
      <div className="-mx-2.5 -mt-3 px-3 py-3 bg-gradient-to-r from-status-pale via-white to-status-pale border-b border-status-salmon/30 text-center">
        <span className="text-base font-bold text-text-primary tracking-wide">个人状态</span>
        <div className="mt-1 mx-auto w-8 h-0.5 rounded-full bg-status-coral" />
      </div>

      <GlassCard
        variant="default"
        className="p-3 w-full cursor-pointer hover:-translate-y-0.5 hover:shadow-soft-lg transition-all duration-200"
        onClick={() => openOverlayView('status')}
      >
        {/* 头部 */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-status-salmon/30 to-status-coral/20 border-2 border-white shadow-soft flex items-center justify-center overflow-hidden shrink-0">
            <AvatarImg
              name={player.name}
              src={player.avatar || undefined}
              className="w-full h-full object-cover"
              size={64}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-heading text-lg font-bold text-text-primary truncate">
              {player.name}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-white text-status-coral text-[10px] font-medium whitespace-nowrap border border-status-salmon/30">
                {player.bodyState.label}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white text-text-secondary text-[10px] whitespace-nowrap border border-border-soft">
                {player.socialIdentity}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-text-muted shrink-0" />
        </div>

        {/* 状态条 */}
        <div className="mt-3 space-y-1.5">
          <StatBar
            id="preview-stamina-bar"
            label="体力"
            value={player.status.stamina}
            color="#E87A5D"
            icon={<Heart className="w-3 h-3" />}
          />
          <StatBar
            id="preview-mental-bar"
            label="精神"
            value={player.status.mental}
            color="#38BDF8"
            icon={<Brain className="w-3 h-3" />}
          />
          <StatBar
            id="preview-health-bar"
            label="健康"
            value={player.status.health}
            color="#6BBF73"
            icon={<Activity className="w-3 h-3" />}
          />
        </div>

        {/* 身体摘要 */}
        <div className="mt-3 pt-2.5 border-t border-border-soft/60">
          <div className="text-xs text-text-secondary leading-relaxed">
            <span className="font-medium text-text-primary">{player.bodyState.label}</span>
            <span className="mx-1">·</span>
            <span>{player.bodyState.mood}</span>
          </div>
          <div className="mt-1 text-[11px] text-text-muted">
            {player.bodyState.height}cm · {player.bodyState.weight}斤 · {player.bodyState.ageStage}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
```

- [ ] **Step 2: 确保 StatBar 支持 `id` 属性（如需要）**

如果 `StatBar` 当前不接受 `id`，打开 `src/components/ui/StatBar.tsx`，在 props 中添加：

```ts
interface StatBarProps {
  id?: string;
  label: string;
  value: number;
  max?: number;
  color?: string;
  icon?: React.ReactNode;
}
```

并在根 `div` 上应用 `id={id}`。

- [ ] **Step 3: 删除 `deriveBodyFigure` 函数**

由于不再使用（且可能引用疲劳相关逻辑），从 `StatusPreview.tsx` 中删除该函数。

- [ ] **Step 4: 类型检查**

Run:

```bash
npx tsc --noEmit
```

Expected: 无类型错误。

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/previews/StatusPreview.tsx src/components/ui/StatBar.tsx
git commit -m "feat: 重制 StatusPreview 为精简快照布局"
```

---

## Task 5: 重制 `PersonalStatusOverlay`

**Files:**
- Modify: `src/components/overlays/PersonalStatusOverlay.tsx`

**Interfaces:**
- Consumes: `player` 数据，`addNotification` 方法。
- Produces: 高密度、高级感的个人状态详情页。

- [ ] **Step 1: 完全重写 PersonalStatusOverlay**

打开 `src/components/overlays/PersonalStatusOverlay.tsx`，替换为：

```tsx
import { useEffect } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatBar } from '@/components/ui/StatBar';
import { AvatarImg } from '@/components/ui/AvatarImg';
import {
  User,
  Heart,
  Activity,
  Brain,
  Fingerprint,
  Award,
  Stethoscope,
  Sparkles,
  FileBadge,
} from 'lucide-react';

interface InfoGroupProps {
  children: React.ReactNode;
}

function InfoGroup({ children }: InfoGroupProps) {
  return <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">{children}</div>;
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-text-muted text-xs">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  );
}

interface ConditionTagProps {
  children: string;
  variant?: 'physiological' | 'mental' | 'neutral';
}

function ConditionTag({ children, variant = 'neutral' }: ConditionTagProps) {
  const styles = {
    physiological: 'bg-mint-50 text-mint-600 border-mint-200',
    mental: 'bg-sky-50 text-sky-600 border-sky-200',
    neutral: 'bg-cream-50 text-amber-600 border-cream-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  );
}

export function PersonalStatusOverlay() {
  const { state, addNotification } = useGame();
  const { player } = state;

  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        type: 'info',
        title: '个人状态已更新',
        message: '疲劳相关状态已移除，当前显示最新身体档案。',
        duration: 4000,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [addNotification]);

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* 身份锚点区 */}
      <GlassCard
        variant="floating"
        className="relative overflow-hidden p-5 md:p-6"
        id="personal-status-identity-card"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-status-coral via-accent-teal to-accent-green" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-status-salmon/40 to-status-coral/20 border-4 border-white shadow-soft flex items-center justify-center overflow-hidden shrink-0">
            {player.avatar ? (
              <AvatarImg name={player.name} src={player.avatar} className="w-full h-full object-cover" size={96} />
            ) : (
              <User className="w-10 h-10 md:w-12 md:h-12 text-status-coral" />
            )}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
                {player.name}
              </h2>
              <span className="px-3 py-1 rounded-full bg-status-pale text-status-coral text-xs font-medium border border-status-salmon/30">
                {player.socialIdentity}
              </span>
              <span className="px-3 py-1 rounded-full bg-cream-50 text-text-secondary text-xs border border-cream-100">
                {player.age}岁
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatBar
                id="personal-status-stamina"
                label="体力"
                value={player.status.stamina}
                color="#E87A5D"
                icon={<Heart className="w-3.5 h-3.5" />}
              />
              <StatBar
                id="personal-status-mental"
                label="精神"
                value={player.status.mental}
                color="#38BDF8"
                icon={<Brain className="w-3.5 h-3.5" />}
              />
              <StatBar
                id="personal-status-health"
                label="健康"
                value={player.status.health}
                color="#6BBF73"
                icon={<Activity className="w-3.5 h-3.5" />}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 身体状态区 */}
      <section
        id="personal-status-body-section"
        className="rounded-2xl border border-border-soft bg-white/80 backdrop-blur-sm p-5 shadow-soft"
      >
        <header className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-mint-50 flex items-center justify-center text-mint-500">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="font-heading text-base font-bold text-text-primary">身体状态</h3>
        </header>

        <InfoGroup>
          <InfoItem label="身高" value={`${player.bodyState.height} cm`} />
          <InfoItem label="体重" value={`${player.bodyState.weight} 斤`} />
          <InfoItem label="年龄阶段" value={player.bodyState.ageStage} />
        </InfoGroup>

        <div className="my-4 h-px bg-border-soft/60" />

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs text-text-muted">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>生理状态</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {player.bodyState.physiological.length > 0 ? (
                player.bodyState.physiological.map((item) => (
                  <ConditionTag key={item} variant="physiological">{item}</ConditionTag>
                ))
              ) : (
                <span className="text-sm text-text-secondary">无异常</span>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2 text-xs text-text-muted">
              <Sparkles className="w-3.5 h-3.5" />
              <span>精神状态</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {player.bodyState.mental.length > 0 ? (
                player.bodyState.mental.map((item) => (
                  <ConditionTag key={item} variant="mental">{item}</ConditionTag>
                ))
              ) : (
                <span className="text-sm text-text-secondary">平稳</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-cream-50/60 border border-cream-100">
          <p className="text-sm text-text-secondary leading-relaxed">{player.bodyState.description}</p>
        </div>
      </section>

      {/* 个人讯息区 */}
      <section
        id="personal-status-info-section"
        className="rounded-2xl border border-border-soft bg-white/80 backdrop-blur-sm p-5 shadow-soft"
      >
        <header className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500">
            <Fingerprint className="w-4 h-4" />
          </div>
          <h3 className="font-heading text-base font-bold text-text-primary">个人讯息</h3>
        </header>

        <div className="space-y-4">
          <InfoGroup>
            <InfoItem label="姓名" value={player.name} />
            <InfoItem label="性别" value={player.gender} />
            <InfoItem label="年龄" value={`${player.age}岁`} />
          </InfoGroup>

          <div className="h-px bg-border-soft/60" />

          <InfoGroup>
            <InfoItem label="生日" value={player.birthday} />
            <InfoItem label="国籍" value={player.nationality} />
            <InfoItem label="户籍" value={player.householdRegistration} />
          </InfoGroup>

          <div className="h-px bg-border-soft/60" />

          <InfoGroup>
            <InfoItem label="母语" value={player.nativeLanguage} />
            <InfoItem label="社会身份" value={player.socialIdentity} />
          </InfoGroup>

          <div className="h-px bg-border-soft/60" />

          <InfoGroup>
            <InfoItem label="家庭成员" value={player.familyMembers} />
          </InfoGroup>

          <div className="h-px bg-border-soft/60" />

          <InfoGroup>
            <InfoItem label="住址" value={player.address} />
          </InfoGroup>
        </div>
      </section>

      {/* 资质与荣誉区 */}
      <section
        id="personal-status-awards-section"
        className="rounded-2xl border border-border-soft bg-white/80 backdrop-blur-sm p-5 shadow-soft"
      >
        <header className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cream-50 flex items-center justify-center text-amber-500">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="font-heading text-base font-bold text-text-primary">资质与荣誉</h3>
        </header>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <FileBadge className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
            <div>
              <span className="text-xs text-text-muted block">证件证书</span>
              <span className="text-sm text-text-primary">
                {player.certificates.join('、') || '无'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Award className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
            <div>
              <span className="text-xs text-text-muted block">奖项成就</span>
              <span className="text-sm text-text-primary">
                {player.awards.join('、') || '无'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: 确认 AvatarImg 组件存在**

如果 `AvatarImg` 不存在，使用 `User` 图标占位（代码中已有 fallback），或检查项目中的头像组件路径。

- [ ] **Step 3: 类型检查**

Run:

```bash
npx tsc --noEmit
```

Expected: 无类型错误。

- [ ] **Step 4: Commit**

```bash
git add src/components/overlays/PersonalStatusOverlay.tsx
git commit -m "feat: 重制 PersonalStatusOverlay 为高密度信息档案页"
```

---

## Task 6: 全局检查与收尾

**Files:**
- 全部已修改文件

- [ ] **Step 1: 全局搜索 emoji 残留**

Run:

```bash
grep -rE "[\x{1F300}-\x{1F9FF}]|[\x{2600}-\x{26FF}]|[\x{2700}-\x{27BF}]" --include="*.tsx" --include="*.ts" src/components/overlays/PersonalStatusOverlay.tsx src/components/layout/previews/StatusPreview.tsx src/components/ui/NotificationItem.tsx src/components/ui/NotificationContainer.tsx || echo "No emoji found"
```

Expected: `No emoji found`

- [ ] **Step 2: 全局搜索 `fatigue` / `疲劳` 残留**

Run:

```bash
grep -rE "fatigue|疲劳" --include="*.ts" --include="*.tsx" --include="*.html" src/ ui-showcase.html || echo "No fatigue references found"
```

Expected: `No fatigue references found`

- [ ] **Step 3: 运行类型检查**

Run:

```bash
npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 4: 运行构建**

Run:

```bash
npm run build
```

Expected: 构建成功。

- [ ] **Step 5: Commit 收尾**

```bash
git add -A
git commit -m "chore: 个人状态重制收尾检查"
```

---

## Task 7: 自检验证

**Files:**
- 全部已修改文件

- [ ] **Step 1: 功能自检**

手动验证或编写临时测试：

1. 打开应用，点击左侧「个人状态」进入详情页。
2. 确认无「疲劳」字段显示。
3. 确认状态条数值与 `mockData.ts` 一致。
4. 确认详情页加载后右上角出现通知。
5. 通知 4 秒后自动消失，hover 时暂停，关闭按钮可用。

- [ ] **Step 2: UI 自检**

1. 桌面端：布局无溢出、无遮挡、信息分组清晰。
2. 移动端（浏览器 DevTools 模拟 375px）：状态条、字段组正确换行，文字不拥挤。
3. 颜色可读：正文与背景对比度 ≥ 4.5:1。

- [ ] **Step 3: 交互自检**

1. `StatusPreview` hover 有上浮效果。
2. 点击 `StatusPreview` 能打开详情页。
3. 详情页返回按钮可用。
4. 多次进入/退出详情页，通知不重复堆积。

- [ ] **Step 4: 稳定性自检**

1. 浏览器控制台无报错。
2. 切换分辨率不破坏布局。
3. 在 DevTools 中启用 `prefers-reduced-motion: reduce`，动画应被禁用。

---

## 交付清单

- [ ] `fatigue` 从类型、mock 数据、所有引用中彻底移除。
- [ ] `PersonalStatusOverlay.tsx` 重制完成，信息高密度、无疲劳字段。
- [ ] `StatusPreview.tsx` 重制完成，精简快照。
- [ ] 全局 `InAppNotification` 系统可用（Context + UI + 挂载）。
- [ ] 无 emoji 使用。
- [ ] 全中文化（除 logo / 视觉元素）。
- [ ] TypeScript 检查通过。
- [ ] 构建成功。
- [ ] 自检完成。

---

## 风险提醒

1. `AvatarImg` 组件路径或接口可能与示例不同，需按项目实际调整。
2. `GameContext` 的实现模式（useState / useReducer）会影响通知方法的写法，需按实际结构微调。
3. 通知挂载点需确保在所有浮层之上，若 `App.tsx` 结构特殊，可改挂到 `OverlayRenderer` 同级。
4. `StatBar` 若不支持 `id`，需同步修改。
5. 项目如使用 `framer-motion` 等动画库，可替代手写 CSS 动画，但本计划按纯 Tailwind/CSS 实现。
