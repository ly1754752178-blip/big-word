# 场景印象图横向化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将右侧面板顶部的【场景印象图】改为 16:9 横向长方形，并导入指定动漫场景图展示。

**Architecture:** 通过 `SceneImpression` 组件新增 `imageUrl` 可选属性控制是否展示图片；`RightPanel` 移除固定 flex 比例，由 `aspect-video` 驱动高度；`MiniMap` 不传入图片，保持地图背景不变。

**Tech Stack:** React + TypeScript + Tailwind CSS + Vite

## Global Constraints

- 图片展示方式：`object-fit: cover`，保持比例并居中裁剪。
- 目标比例：`16:9`（Tailwind 的 `aspect-video`）。
- 图片源文件路径：`F:\AI\gongcheng\场景动漫化.png`。
- 静态资源目标路径：`public/images/scene-anime.png`。
- 组件引用路径：`/images/scene-anime.png`。
- 不影响 MiniMap 内部背景。

---

### Task 1: 导入场景图片资源

**Files:**
- Create: `public/images/scene-anime.png`

**Interfaces:**
- Consumes: `F:\AI\gongcheng\场景动漫化.png`
- Produces: `public/images/scene-anime.png`

- [ ] **Step 1: 复制图片到项目静态资源目录**

```bash
cp "F:\AI\gongcheng\场景动漫化.png" "F:\AI\no2\public\images\scene-anime.png"
```

- [ ] **Step 2: 确认文件存在**

```bash
ls -l "F:\AI\no2\public\images\scene-anime.png"
```

Expected: 文件大小大于 0，路径正确。

- [ ] **Step 3: Commit**

```bash
git add public/images/scene-anime.png
git commit -m "assets: add scene anime image for impression panel"
```

---

### Task 2: 改造 SceneImpression 组件

**Files:**
- Modify: `src/components/map/SceneImpression.tsx`

**Interfaces:**
- Consumes: `imageUrl?: string`（新增可选属性）
- Produces: 根据 `imageUrl` 决定渲染图片或原有渐变占位背景

- [ ] **Step 1: 修改组件 Props 与渲染逻辑**

完整替换 `src/components/map/SceneImpression.tsx` 为：

```tsx
import { useGame } from '@/hooks/useGameState';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SceneImpressionProps {
  className?: string;
  imageUrl?: string;
}

export function SceneImpression({ className, imageUrl }: SceneImpressionProps) {
  const { state } = useGame();
  const { map } = state;

  const currentRegion = map.regions.find((region) => {
    const halfW = region.width / 2;
    const halfH = region.height / 2;
    return (
      map.center.x >= region.x - halfW &&
      map.center.x <= region.x + halfW &&
      map.center.y >= region.y - halfH &&
      map.center.y <= region.y + halfH
    );
  });

  return (
    <div
      className={cn(
        'relative overflow-hidden map-texture',
        className
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="场景印象图"
          className="w-full h-full object-cover"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100/60 via-cream-50/40 to-coral-100/40" />

          {/* 装饰性风景剪影 */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2">
            <svg viewBox="0 0 200 60" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M0 60 L0 30 Q30 15 60 28 T120 22 T180 32 L200 25 L200 60 Z"
                fill="rgba(100, 116, 139, 0.1)"
              />
              <path
                d="M0 60 L0 42 Q40 36 80 44 T160 40 L200 48 L200 60 Z"
                fill="rgba(100, 116, 139, 0.16)"
              />
            </svg>
          </div>
        </>
      )}

      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-white/60 shadow-soft text-[10px] text-slate-600">
        <MapPin className="w-3 h-3 text-coral-400" />
        <span>{currentRegion?.name ?? '未知区域'}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 运行 TypeScript 类型检查**

```bash
cd "F:\AI\no2" && npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 3: Commit**

```bash
git add src/components/map/SceneImpression.tsx
git commit -m "feat: support optional imageUrl in SceneImpression"
```

---

### Task 3: 调整 RightPanel 布局并传入图片

**Files:**
- Modify: `src/components/layout/RightPanel.tsx`

**Interfaces:**
- Consumes: `SceneImpression` 的 `imageUrl` 属性
- Produces: 顶部场景印象图区域改为 16:9 横向长方形

- [ ] **Step 1: 修改场景印象图容器**

在 `src/components/layout/RightPanel.tsx` 中，将顶部场景印象图区域：

```tsx
{/* 场景印象图 */}
<div className="flex-[2] min-h-0 relative">
  <SceneImpression />
</div>
```

替换为：

```tsx
{/* 场景印象图 */}
<div className="relative aspect-video w-full shrink-0">
  <SceneImpression imageUrl="/images/scene-anime.png" />
</div>
```

- [ ] **Step 2: 运行 TypeScript 类型检查**

```bash
cd "F:\AI\no2" && npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/RightPanel.tsx
git commit -m "feat: make scene impression panel 16:9 and load anime image"
```

---

### Task 4: 验证页面效果

**Files:**
- 无需修改代码，使用 Playwright 验证

**Interfaces:**
- Consumes: 已启动的 Vite 开发服务器（http://localhost:5173）

- [ ] **Step 1: 确认开发服务器正在运行**

```bash
cat /tmp/vite-dev.log | grep -E "VITE|5173"
```

Expected: 显示 `http://localhost:5173/`。

- [ ] **Step 2: 使用 Playwright 访问页面并截图**

导航至 `http://localhost:5173`，等待 3 秒后截取全页截图，保存为 `scene-impression-verification.png`。

- [ ] **Step 3: 人工审查截图**

确认：
- 右侧面板顶部的场景印象图区域为横向长方形。
- 区域内展示了 `场景动漫化.png`。
- 城市地图 / 全国地图区域未被场景图覆盖。

- [ ] **Step 4: Commit 验证截图（可选）**

```bash
git add scene-impression-verification.png
git commit -m "docs: add scene impression redesign verification screenshot"
```

---

## Self-Review

**1. Spec coverage:**
- 16:9 横向长方形 → Task 3 使用 `aspect-video`。
- 导入 `F:\AI\gongcheng\场景动漫化.png` → Task 1 复制到 `public/images/scene-anime.png`。
- cover 填满、居中裁剪 → Task 2 使用 `object-cover`。
- 不影响城市地图 / 全国地图 → MiniMap 不传入 `imageUrl`，保持原背景。

**2. Placeholder scan:**
- 无 TBD/TODO。
- 每个代码步骤均给出完整代码。
- 命令与预期输出明确。

**3. Type consistency:**
- `imageUrl?: string` 在 Task 2 中定义，Task 3 中以字符串路径传入，一致。
- `SceneImpressionProps` 扩展后不影响现有调用（`MiniMap` 不传 `imageUrl`）。

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-09-scene-impression-plan.md`. Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
