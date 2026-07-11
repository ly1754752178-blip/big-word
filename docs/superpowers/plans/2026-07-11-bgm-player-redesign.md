# BGM 播放器色系重制 & 平行四边形改造 实现计划

> **For agentic workers:** 使用 superpowers:subagent-driven-development 或 superpowers:executing-plans 逐步实现。

**Goal:** 将 BgmPlayer 从红色系矩形改造为棕色+蓝色系平行四边形，右侧无缝衔接屏幕边缘。

**Architecture:** 修改 BgmPlayer.tsx 的 inline style 色值和 clip-path 形状，调整 TopBar.tsx 的布局容器。

**Tech Stack:** React 18 + TypeScript + Tailwind CSS + Framer Motion

## Global Constraints

- 保持现有美术质量（光效、细节、UI 格局）
- 色系：棕色（基底）+ 蓝色（强调）
- 形状：clip-path 平行四边形，左侧斜边 ~17°，右侧平直
- 右侧完全无缝衔接屏幕边缘

---

### Task 1: BgmPlayer 色系重制 + 平行四边形

**Files:**
- Modify: `src/components/ui/BgmPlayer.tsx`

- [ ] **Step 1: 替换容器背景和边框为棕+蓝色系**

将容器 `style` 中的：
- `background` 从暗黑渐变 → 深棕渐变 `linear-gradient(135deg, rgba(58,42,30,0.96) 0%, rgba(45,31,20,0.94) 50%, rgba(38,25,16,0.96) 100%)`
- `borderLeft` 从红色 → 蓝色 `2px solid rgba(100,140,200,0.6)`
- `boxShadow` 从红色微光 → 蓝色微光

- [ ] **Step 2: 替换背景光晕色系**

将背景光晕 `div` 的 `background` 从 `radial-gradient(circle, rgba(198,47,47,0.5) 0%, transparent 70%)` → `radial-gradient(circle, rgba(80,140,210,0.45) 0%, transparent 70%)`

- [ ] **Step 3: 替换唱片中心标为蓝色**

将中心红标渐变从 `#C62F2F → #8B1A1A` → `#5A9ED8 → #2563A0`，阴影从 `rgba(198,47,47,0.4)` → `rgba(90,158,216,0.4)`

- [ ] **Step 4: 替换针尖颜色**

针尖红点从 `#C62F2F` → `#5A9ED8`，阴影同步更新

- [ ] **Step 5: 替换歌名和副标题颜色**

歌名从 `#e8e0d8` → `#e8dcc8`，副标题从 `rgba(198,47,47,0.7)` → `rgba(140,170,210,0.7)`

- [ ] **Step 6: 替换进度条色系**

已播放条从 `#C62F2F → #8B1A1A` → `#6AADF0 → #3B7DC0`，阴影从红 → 蓝

- [ ] **Step 7: 替换播放按钮色系**

按钮背景从 `#C62F2F → #A51D1D` → `#4A8FD4 → #3570B0`，阴影和呼吸光晕从红 → 蓝

- [ ] **Step 8: 替换循环按钮激活色**

激活背景从 `rgba(198,47,47,0.15)` → `rgba(74,143,212,0.15)`，文字色 `text-red-500` → `text-blue-400`

- [ ] **Step 9: 添加 clip-path 平行四边形**

在容器 `style` 中添加 `clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 0% 100%)'`

- [ ] **Step 10: 增强斜边边缘细节**

在容器上添加：
- `filter: drop-shadow(-3px 0 6px rgba(100,150,210,0.2))` — 蓝色投影
- 斜边内侧高光：在容器内添加一个伪元素效果的 div，沿左侧斜边放置一条半透明蓝色高光线

---

### Task 2: TopBar 布局调整

**Files:**
- Modify: `src/components/layout/TopBar.tsx`

- [ ] **Step 1: BGM 容器改为右对齐全宽延伸**

将右侧 BGM 容器 `<div className="flex items-center justify-end h-full w-1/3">` 改为 `<div className="flex items-center justify-end h-full">`，去除 `w-1/3` 限制使其自然延伸至右边缘。

同时确保容器无右侧 padding，将 header 的 `px-5` 改为 `pl-5 pr-0`。
