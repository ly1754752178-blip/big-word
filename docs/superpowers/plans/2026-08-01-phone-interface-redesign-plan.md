# 手机界面全方位重制实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按照已确认的设计方案，重制游戏内手机界面的外框美术效果、状态栏时间位置，并用真实 APP 图标替换现有 APP。

**Architecture:** 保持 `PhoneFrame` 作为手机外框容器、`Phone` 管理状态栏与内容路由、`PhoneAppGrid` 渲染桌面图标、`PhoneAppScreen` 渲染应用内容的职责划分；将图标图片放入 `public/phone-icons/` 由构建工具直接提供静态资源；类型与数据集中维护于 `src/types/index.ts` 与 `src/data/mockData.ts`。

**Tech Stack:** React + TypeScript + Tailwind CSS + Framer Motion + Vite

## Global Constraints

- 手机外框尺寸保持约 288px × 560px 显示区域。
- 外框必须复刻参考图的金属边框、圆角、刘海、侧键、底部 Home 指示条。
- 状态栏左上角显示当前时间 `HH:mm`，右上角显示信号 / WiFi / 电量图标。
- APP 图标使用 `public/phone-icons/` 下的 jpg 图片，渲染为圆角矩形。
- 11 个 APP 按 3 列 × 4 行网格排列。
- LINE 点击后继承原有 `ChatApp` 聊天功能。
- TypeScript 类型检查必须无错误。

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `public/phone-icons/*.jpg` | 存放处理后的 APP 图标静态资源 |
| `src/types/index.ts` | 定义新的 `PhoneAppId` 联合类型 |
| `src/data/mockData.ts` | 定义新的 `phoneApps` 数组 |
| `src/components/layout/Phone/PhoneFrame.tsx` | 手机外框、刘海、侧键、底部指示条 |
| `src/components/layout/Phone/index.tsx` | 状态栏时间位置与内容路由 |
| `src/components/layout/Phone/PhoneAppGrid.tsx` | 3×4 桌面图标网格 |
| `src/components/layout/Phone/PhoneAppScreen.tsx` | APP 详情内容映射（LINE → ChatApp，其余占位） |

---

### Task 1: 准备 APP 图标静态资源

**Files:**
- Create: `public/phone-icons/line.jpg`
- Create: `public/phone-icons/x.jpg`
- Create: `public/phone-icons/instagram.jpg`
- Create: `public/phone-icons/paypay.jpg`
- Create: `public/phone-icons/google-maps.jpg`
- Create: `public/phone-icons/yahoo-japan.jpg`
- Create: `public/phone-icons/timetree.jpg`
- Create: `public/phone-icons/gmail.jpg`
- Create: `public/phone-icons/settings.jpg`
- Create: `public/phone-icons/youtube.jpg`
- Create: `public/phone-icons/tiktok.jpg`

**Interfaces:**
- Consumes: `F:\AI\gongcheng\*.jpg` 源文件
- Produces: 项目内可直接通过 `/phone-icons/{id}.jpg` 访问的图标文件

- [ ] **Step 1: 创建目标目录**

```bash
cd "F:\AI\no2" && mkdir -p public/phone-icons
```

- [ ] **Step 2: 复制源图标并统一小写文件名**

```bash
cd "F:\AI\no2"
cp "F:\AI\gongcheng\LINE.jpg" public/phone-icons/line.jpg
cp "F:\AI\gongcheng\X.jpg" public/phone-icons/x.jpg
cp "F:\AI\gongcheng\Instagram.jpg" public/phone-icons/instagram.jpg
cp "F:\AI\gongcheng\PayPay.jpg" public/phone-icons/paypay.jpg
cp "F:\AI\gongcheng\Google Maps.jpg" public/phone-icons/google-maps.jpg
cp "F:\AI\gongcheng\Yahoo! JAPAN.jpg" public/phone-icons/yahoo-japan.jpg
cp "F:\AI\gongcheng\TimeTree.jpg" public/phone-icons/timetree.jpg
cp "F:\AI\gongcheng\Gmail.jpg" public/phone-icons/gmail.jpg
cp "F:\AI\gongcheng\系统设置.jpg" public/phone-icons/settings.jpg
cp "F:\AI\gongcheng\YouTube.jpg" public/phone-icons/youtube.jpg
cp "F:\AI\gongcheng\tiktok.jpg" public/phone-icons/tiktok.jpg
```

- [ ] **Step 3: 检查并预处理白边/异色边角**

使用图片查看工具（如系统自带预览或 Photo Viewer）打开 `public/phone-icons/` 下所有图片，确认：
- YouTube 图片保留完整的圆角方形白底 + 红色播放按钮，不是仅红色区域。
- 若某些图标（如 Yahoo! JAPAN、TimeTree、Instagram）存在明显白边或灰边，使用任意图片编辑工具将画布裁剪至图标主体区域，保存覆盖原文件。

预期结果：11 张 jpg 均位于 `public/phone-icons/`，无明显多余边框。

- [ ] **Step 4: 提交**

```bash
cd "F:\AI\no2" && git add public/phone-icons && git commit -m "assets: add real app icons for phone redesign"
```

---

### Task 2: 更新 PhoneAppId 类型

**Files:**
- Modify: `src/types/index.ts:6-15`

**Interfaces:**
- Consumes: 无
- Produces: 新的 `PhoneAppId` 联合类型

- [ ] **Step 1: 替换类型定义**

将：
```ts
export type PhoneAppId =
  | 'news'
  | 'schedule'
  | 'messages'
  | 'travel'
  | 'mail'
  | 'gallery'
  | 'chat'
  | 'sns'
  | 'wallet';
```

替换为：
```ts
export type PhoneAppId =
  | 'line'
  | 'x'
  | 'instagram'
  | 'paypay'
  | 'google-maps'
  | 'yahoo-japan'
  | 'timetree'
  | 'gmail'
  | 'settings'
  | 'youtube'
  | 'tiktok';
```

- [ ] **Step 2: 运行类型检查**

```bash
cd "F:\AI\no2" && npx tsc --noEmit
```

预期结果：可能出现 `phoneApps` 等数据不匹配的报错，属于正常，将在 Task 3 修复。

- [ ] **Step 3: 提交**

```bash
cd "F:\AI\no2" && git add src/types/index.ts && git commit -m "types: update PhoneAppId for redesigned phone apps"
```

---

### Task 3: 更新 phoneApps 数据

**Files:**
- Modify: `src/data/mockData.ts:1004-1014`

**Interfaces:**
- Consumes: 新的 `PhoneAppId` 类型
- Produces: 新的 `phoneApps` 数组

- [ ] **Step 1: 替换数据**

将：
```ts
  phoneApps: [
    { id: 'news', name: '新闻', icon: 'newspaper', color: '#E88D4F', badge: 3 },
    { id: 'schedule', name: '日程', icon: 'calendar-days', color: '#5BA8A0' },
    { id: 'messages', name: '消息', icon: 'message-circle', color: '#6BBF73', badge: 1 },
    { id: 'travel', name: '旅行', icon: 'map-pin', color: '#F5C542' },
    { id: 'mail', name: '邮件', icon: 'mail', color: '#7D6E5E', badge: 5 },
    { id: 'gallery', name: '相册', icon: 'image', color: '#C77D9E' },
    { id: 'chat', name: '聊天', icon: 'message-square', color: '#38BDF8' },
    { id: 'sns', name: '动态', icon: 'heart', color: '#F43F5E' },
    { id: 'wallet', name: '钱包', icon: 'wallet', color: '#22C55E' },
  ],
```

替换为：
```ts
  phoneApps: [
    { id: 'line', name: 'LINE', icon: '/phone-icons/line.jpg', color: '#06C755', badge: 2 },
    { id: 'x', name: 'X', icon: '/phone-icons/x.jpg', color: '#000000' },
    { id: 'instagram', name: 'Instagram', icon: '/phone-icons/instagram.jpg', color: '#E4405F' },
    { id: 'paypay', name: 'PayPay', icon: '/phone-icons/paypay.jpg', color: '#FF0033' },
    { id: 'google-maps', name: 'Google Maps', icon: '/phone-icons/google-maps.jpg', color: '#4285F4' },
    { id: 'yahoo-japan', name: 'Yahoo! JAPAN', icon: '/phone-icons/yahoo-japan.jpg', color: '#FF0033' },
    { id: 'timetree', name: 'TimeTree', icon: '/phone-icons/timetree.jpg', color: '#4BD1A7' },
    { id: 'gmail', name: 'Gmail', icon: '/phone-icons/gmail.jpg', color: '#EA4335' },
    { id: 'settings', name: 'Settings', icon: '/phone-icons/settings.jpg', color: '#8E8E93' },
    { id: 'youtube', name: 'YouTube', icon: '/phone-icons/youtube.jpg', color: '#FF0000' },
    { id: 'tiktok', name: 'TikTok', icon: '/phone-icons/tiktok.jpg', color: '#000000' },
  ],
```

- [ ] **Step 2: 运行类型检查**

```bash
cd "F:\AI\no2" && npx tsc --noEmit
```

预期结果：无错误（若 `PhoneApp` 类型允许 `icon` 为字符串路径）。

- [ ] **Step 3: 提交**

```bash
cd "F:\AI\no2" && git add src/data/mockData.ts && git commit -m "data: update phoneApps to real app icons"
```

---

### Task 4: 重制手机外框 PhoneFrame

**Files:**
- Modify: `src/components/layout/Phone/PhoneFrame.tsx`
- Modify: `src/styles/globals.css`（如需补充 CSS 变量）

**Interfaces:**
- Consumes: `expanded`, `onHeadClick`, `children` props
- Produces: 新的手机外框 DOM 结构与样式

- [ ] **Step 1: 重写 PhoneFrame.tsx**

用以下结构替换当前实现：

```tsx
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PhoneFrameProps {
  expanded: boolean;
  onHeadClick: () => void;
  children: ReactNode;
}

export function PhoneFrame({ expanded, onHeadClick, children }: PhoneFrameProps) {
  return (
    <>
      {/* 收起状态：底部横条 */}
      {!expanded && (
        <motion.button
          type="button"
          onClick={onHeadClick}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-50 h-10 flex items-center justify-center cursor-pointer"
          style={{ width: '288px' }}
          aria-label="打开手机"
        >
          <div className="w-20 h-1 rounded-full bg-white/30" />
        </motion.button>
      )}

      {/* 完整手机 */}
      <motion.div
        initial={{ y: '110%' }}
        animate={{ y: expanded ? '0%' : '110%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 z-50 mx-auto"
        style={{ width: '304px', height: '592px' }}
      >
        {/* 侧键 */}
        <div className="absolute -left-[3px] top-[92px] w-[3px] h-7 rounded-l-sm bg-gradient-to-b from-[#d1d1d6] via-[#9e9ea4] to-[#d1d1d6]" />
        <div className="absolute -left-[3px] top-[138px] w-[3px] h-12 rounded-l-sm bg-gradient-to-b from-[#d1d1d6] via-[#9e9ea4] to-[#d1d1d6]" />
        <div className="absolute -right-[3px] top-[120px] w-[3px] h-16 rounded-r-sm bg-gradient-to-b from-[#d1d1d6] via-[#9e9ea4] to-[#d1d1d6]" />

        {/* 金属边框外壳 */}
        <div
          className="w-full h-full rounded-[48px] p-[8px] flex flex-col relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #e8e8ed 0%, #b8b8c0 25%, #f2f2f7 50%, #b0b0b8 75%, #e8e8ed 100%)',
            boxShadow: `
              inset 0 0 0 1px rgba(255,255,255,0.6),
              inset 0 0 10px rgba(0,0,0,0.15),
              0 -6px 32px rgba(0,0,0,0.4),
              0 0 0 1px rgba(0,0,0,0.2)
            `,
          }}
        >
          {/* 天线带 */}
          <div className="absolute top-[64px] -left-[1px] w-[2px] h-3 bg-[#9e9ea4]/60" />
          <div className="absolute top-[64px] -right-[1px] w-[2px] h-3 bg-[#9e9ea4]/60" />

          {/* 黑色前面板 */}
          <div
            className="flex-1 rounded-[40px] bg-[#0a0a0a] p-[10px] flex flex-col relative overflow-hidden"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)' }}
          >
            {/* 刘海 / Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
              <div
                className="h-7 w-24 rounded-full bg-black flex items-center justify-center gap-2"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}
              >
                <div className="w-14 h-3 rounded-full bg-[#1a1a1a]" />
                <div className="w-2 h-2 rounded-full bg-[#0f0f15] ring-1 ring-[#2a2a35]" />
              </div>
            </div>

            {/* 屏幕区域 */}
            <div className="flex-1 rounded-[34px] bg-[#FAF6F1] relative overflow-hidden"
              style={{ boxShadow: 'inset 0 0 8px rgba(0,0,0,0.06)' }}
            >
              <div className="relative z-10 h-full">{children}</div>
            </div>

            {/* 底部 Home 指示条 */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30">
              <div className="w-28 h-1 rounded-full bg-white/25" />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
```

- [ ] **Step 2: 视觉验证**

启动开发服务器，进入游戏后打开手机，确认：
- 外框有金属光泽和圆角。
- 顶部有黑色刘海。
- 左右两侧有侧键。
- 底部有 Home 指示条。

- [ ] **Step 3: 提交**

```bash
cd "F:\AI\no2" && git add src/components/layout/Phone/PhoneFrame.tsx && git commit -m "ui: remake phone frame with metal bezel and notch"
```

---

### Task 5: 更新状态栏时间位置

**Files:**
- Modify: `src/components/layout/Phone/index.tsx`

**Interfaces:**
- Consumes: `state.time`
- Produces: 左上角时间 + 右上角状态图标的布局

- [ ] **Step 1: 调整状态栏布局**

修改 `Phone` 组件中的状态栏部分，保持时间、WiFi、电量，将时间移到左上角：

```tsx
{/* 状态栏 */}
<div className="flex items-center justify-between px-5 pt-3 pb-1 shrink-0 z-20">
  <span className="text-xs font-semibold text-slate-800 tracking-tight">
    {String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}
  </span>
  <div className="flex items-center gap-1.5 text-slate-800">
    <Wifi className="w-3.5 h-3.5" />
    <Battery className="w-3.5 h-3.5" />
  </div>
</div>
```

- [ ] **Step 2: 视觉验证**

确认时间显示在手机屏幕左上角，信号/WiFi/电量在右上角，且均位于刘海下方不被遮挡。

- [ ] **Step 3: 提交**

```bash
cd "F:\AI\no2" && git add src/components/layout/Phone/index.tsx && git commit -m "ui: move phone status bar time to top-left"
```

---

### Task 6: 更新 APP 桌面网格 PhoneAppGrid

**Files:**
- Modify: `src/components/layout/Phone/PhoneAppGrid.tsx`

**Interfaces:**
- Consumes: `apps` 数组（新字段 `icon` 为图片路径）
- Produces: 3 列 × 4 行图片图标网格

- [ ] **Step 1: 重写 PhoneAppGrid.tsx**

```tsx
import { motion } from 'framer-motion';
import type { PhoneAppId } from '@/types';

interface PhoneAppGridProps {
  apps: { id: PhoneAppId; name: string; icon: string; color: string; badge?: number }[];
  onAppClick: (appId: PhoneAppId) => void;
}

export function PhoneAppGrid({ apps, onAppClick }: PhoneAppGridProps) {
  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-4 p-5 pt-6">
      {apps.map((app, index) => (
        <motion.button
          key={app.id}
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
          onClick={() => onAppClick(app.id)}
          className="flex flex-col items-center gap-1.5 group"
        >
          <div className="relative w-14 h-14 rounded-[22%] overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
            <img
              src={app.icon}
              alt={app.name}
              className="w-full h-full object-cover"
              draggable={false}
            />
            {app.badge && app.badge > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F43F5E] text-white text-[10px] font-bold flex items-center justify-center border border-white">
                {app.badge > 99 ? '99+' : app.badge}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium text-slate-700/90 text-center leading-tight max-w-full px-1 truncate">
            {app.name}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 视觉验证**

确认：
- 11 个 APP 按 3 列 × 4 行显示。
- 图标为真实图片，圆角矩形。
- 名称显示正确，长名称截断合理。
- 徽章数字显示正常。

- [ ] **Step 3: 提交**

```bash
cd "F:\AI\no2" && git add src/components/layout/Phone/PhoneAppGrid.tsx && git commit -m "ui: render real app icons in 3x4 grid"
```

---

### Task 7: 更新 APP 详情页 PhoneAppScreen

**Files:**
- Modify: `src/components/layout/Phone/PhoneAppScreen.tsx`

**Interfaces:**
- Consumes: `app.id` 为新 `PhoneAppId`
- Produces: LINE 打开 `ChatApp`，其余 APP 显示占位页

- [ ] **Step 1: 简化详情内容映射**

替换为：

```tsx
import { useGame } from '@/hooks/useGameState';
import type { PhoneAppId } from '@/types';
import { ChatApp } from './apps/ChatApp';

interface PhoneAppScreenProps {
  app: { id: PhoneAppId; name: string; icon: string; color: string; badge?: number };
  onBack: () => void;
}

export function PhoneAppScreen({ app, onBack }: PhoneAppScreenProps) {
  const { state } = useGame();

  const renderContent = () => {
    switch (app.id) {
      case 'line':
        return <ChatApp />;
      case 'yahoo-japan':
        return (
          <div className="space-y-3">
            {state.calendar.worldEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl bg-white border border-slate-100 shadow-soft p-3"
              >
                <h4 className="text-sm font-bold text-slate-800">{event.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{event.description}</p>
              </div>
            ))}
          </div>
        );
      case 'timetree':
        return (
          <div className="space-y-3">
            {state.calendar.calendarEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl bg-white border border-slate-100 shadow-soft p-3"
              >
                <h4 className="text-sm font-bold text-slate-800">{event.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{event.date}</p>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-[22%] mx-auto mb-3 overflow-hidden shadow-sm"
            >
              <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">{app.name}</h3>
            <p className="text-xs text-slate-500 mt-1">该应用功能将在后续版本开放</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 p-5">
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
      >
        ← 返回桌面
      </button>
      {renderContent()}
    </div>
  );
}
```

- [ ] **Step 2: 验证 LINE 可进入聊天**

点击 LINE 图标，确认能进入原有聊天界面。

- [ ] **Step 3: 提交**

```bash
cd "F:\AI\no2" && git add src/components/layout/Phone/PhoneAppScreen.tsx && git commit -m "feat: map LINE to ChatApp, keep other apps as placeholders"
```

---

### Task 8: 类型检查与最终验证

**Files:**
- 无需修改代码

**Interfaces：**
- Consumes: 前述所有改动
- Produces: 无报错、视觉符合预期的最终状态

- [ ] **Step 1: 运行 TypeScript 类型检查**

```bash
cd "F:\AI\no2" && npx tsc --noEmit
```

预期结果：无错误。

- [ ] **Step 2: 启动开发服务器进行视觉验证**

```bash
cd "F:\AI\no2" && npm run dev
```

打开游戏，依次验证：
1. 手机外框有金属光泽、刘海、侧键、底部指示条。
2. 状态栏时间位于左上角，格式正确。
3. 11 个 APP 图标全部显示为真实图片，3 列 × 4 行排列。
4. 图标无白边、异色边角。
5. LINE 能进入聊天界面。
6. 其他 APP 点击后显示占位页。

- [ ] **Step 3: 最终提交**

```bash
cd "F:\AI\no2" && git status
# 确认只有本次改动的文件
git add .
git commit -m "feat: complete phone interface redesign"
```

---

## 自我审查

### Spec 覆盖检查

- 手机外框金属边框、圆角、刘海、侧键、底部指示条 → Task 4
- 左上角时间显示 → Task 5
- 真实 APP 图标替换 → Task 1, Task 6
- APP 名称英文 → Task 3
- LINE 继承聊天功能 → Task 7
- 图标去白边/异色边角 → Task 1 预处理 + Task 6 CSS 裁剪
- 3 列 × 4 行布局 → Task 6

### Placeholder 扫描

- 无 TBD/TODO。
- 所有代码块包含具体实现。
- 验证命令与预期结果明确。

### 类型一致性检查

- `PhoneAppId` 在 Task 2 定义，Task 3/6/7 使用相同 ID。
- `app.icon` 从 lucide 名称字符串变为图片路径字符串，`PhoneApp` 类型已允许字符串。
- LINE 映射到 `ChatApp` 在 Task 7 明确。

---

## 执行方式

Plan complete and saved to `docs/superpowers/plans/2026-08-01-phone-interface-redesign-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
