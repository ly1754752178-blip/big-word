# 手机组件在右侧面板内居中实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让右下角手机仅在右侧面板内部水平居中，且收起头部与展开手机宽度一致（288px）。

**Architecture:** 将 `Phone` 从 `page.tsx` 移到 `RightPanel.tsx` 内部；`RightPanel` 添加 `relative`；`PhoneFrame` 的定位从 `fixed` 改为 `absolute`，并在右侧面板内水平居中。

**Tech Stack:** React + TypeScript + Tailwind CSS + Framer Motion + Vite

## Global Constraints

- 手机必须在右侧面板（320px 宽）内部水平居中。
- 收起状态手机头部宽度：288px。
- 展开状态手机宽度：288px。
- 水平居中：收起头部使用 `left-1/2 -translate-x-1/2`；展开手机使用 `left-0 right-0 mx-auto`。
- 竖向位置保持不变：`bottom-0`。
- 不改动展开/收起动画的弹簧效果。

---

### Task 1: 将 Phone 移入 RightPanel

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/layout/RightPanel.tsx`

**Interfaces:**
- Consumes: `Phone` 组件
- Produces: `Phone` 在 `RightPanel` 内部渲染

- [ ] **Step 1: 从 page.tsx 移除 Phone**

删除以下行：

```tsx
import { Phone } from '@/components/layout/Phone';
```

以及：

```tsx
        <Phone />
```

- [ ] **Step 2: 在 RightPanel.tsx 中引入并渲染 Phone**

在 `src/components/layout/RightPanel.tsx` 顶部添加 import：

```tsx
import { Phone } from '@/components/layout/Phone';
```

将最外层容器：

```tsx
  return (
    <div className="h-full flex flex-col">
```

改为：

```tsx
  return (
    <div className="h-full flex flex-col relative">
```

在组件返回值末尾、所有 `AnimatePresence` 之后添加：

```tsx
      <Phone />
    </div>
  );
```

- [ ] **Step 3: 运行 TypeScript 类型检查**

```bash
cd "F:\AI\no2" && npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 4: Commit**

```bash
cd "F:\AI\no2" && git add src/app/page.tsx src/components/layout/RightPanel.tsx && git commit -m "refactor: move Phone into RightPanel"
```

---

### Task 2: 修改 PhoneFrame 定位与宽度

**Files:**
- Modify: `src/components/layout/Phone/PhoneFrame.tsx`

**Interfaces:**
- Consumes: 无
- Produces: 收起头部与展开手机均为 absolute 定位、宽度 288px、在右侧面板内居中

- [ ] **Step 1: 修改收起状态头部**

将：

```tsx
        <motion.button
          type="button"
          onClick={onHeadClick}
          className="fixed bottom-0 right-0 z-50 w-72 h-10 phone-case flex items-center justify-center cursor-pointer"
          aria-label="打开手机"
        >
```

替换为：

```tsx
        <motion.button
          type="button"
          onClick={onHeadClick}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-50 h-10 phone-case flex items-center justify-center cursor-pointer"
          style={{ width: '288px' }}
          aria-label="打开手机"
        >
```

- [ ] **Step 2: 修改展开状态手机容器**

将：

```tsx
      <motion.div
        initial={{ y: '110%' }}
        animate={{ y: expanded ? '0%' : '110%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 right-0 z-50 w-80 h-[560px] phone-case flex flex-col overflow-hidden"
      >
```

替换为：

```tsx
      <motion.div
        initial={{ y: '110%' }}
        animate={{ y: expanded ? '0%' : '110%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 z-50 phone-case flex flex-col overflow-hidden mx-auto"
        style={{ width: '288px', height: '560px' }}
      >
```

- [ ] **Step 3: 运行 TypeScript 类型检查**

```bash
cd "F:\AI\no2" && npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 4: Commit**

```bash
cd "F:\AI\no2" && git add src/components/layout/Phone/PhoneFrame.tsx && git commit -m "feat: center phone inside RightPanel with unified 288px width"
```

---

### Task 3: 验证页面效果

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

导航至 `http://localhost:5173`，等待 3 秒后截取全页截图，保存为 `phone-rightpanel-verification.png`。

- [ ] **Step 3: 点击手机头部展开手机并截图**

使用 Playwright 点击“打开手机”按钮，等待动画结束后再次截图，保存为 `phone-rightpanel-expanded-verification.png`。

- [ ] **Step 4: 人工审查截图**

确认：
- 收起状态手机头部位于右侧面板底部，水平居中。
- 展开手机位于右侧面板底部，水平居中。
- 手机未覆盖中间叙事面板。

- [ ] **Step 5: Commit 验证截图（可选）**

```bash
cd "F:\AI\no2" && git add phone-rightpanel-verification.png phone-rightpanel-expanded-verification.png && git commit -m "docs: add right panel phone centering verification screenshots"
```

---

## Self-Review

**1. Spec coverage:**
- 在右侧面板内居中 → Task 1 将 Phone 移入 RightPanel，Task 2 改为 absolute 定位。
- 宽度一致（288px） → Task 2 统一宽度。
- 水平居中 → Task 2 使用 `left-1/2 -translate-x-1/2` 和 `left-0 right-0 mx-auto`。
- 竖向位置不变 → 两者均保持 `bottom-0`。
- 动画不变 → 未修改 `initial` / `animate` / `transition`。

**2. Placeholder scan:**
- 无 TBD/TODO。
- 每个代码步骤均给出完整代码片段。
- 命令与预期输出明确。

**3. Type consistency:**
- 无新增接口或类型，仅修改 className 与 style。

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-09-phone-centering-plan.md`. Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
