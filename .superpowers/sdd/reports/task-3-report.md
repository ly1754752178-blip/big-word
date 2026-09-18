# Task 3 报告：完善并挂载全局 In-App Notification UI

## 完成情况

* 已完成：
  * `InAppNotification.tsx` 增加 hover 暂停、mouse leave 重新计时逻辑。
  * 通知项添加唯一 `id={`notification-${id}`}` 与关闭按钮 `id={`notification-close-${id}`}`。
  * 通知项添加 `aria-live="polite"`。
  * `NotificationContainer.tsx` 定位改为 `fixed top-4 right-4 z-[9999]`。
  * 容器添加 `id="notification-container"` 与 `aria-label="应用内通知"`。
  * 将 `NotificationContainer` 从 `GameLayout.tsx` 迁移至根组件 `src/app/page.tsx` 挂载，确保跨页面（大厅/菜单/游戏）都能显示。
  * 运行 `npx tsc --noEmit` 无类型错误。
  * 已提交 git，commit hash 见下方。
* 未完成：无。
* 已修复：容器原先位于 `GameLayout` 内，切换回大厅/菜单时通知会随组件卸载而消失；现提升至根组件后可在全局保留。
* 仍有风险：hover 暂停依赖 `Date.now()` 计算剩余时间，在极端快速进出时剩余时间可能略有不准确，但在 4000ms 级别可忽略。

## 修改文件与行

### 1. `src/components/ui/InAppNotification.tsx`

* 第 1 行：引入 `useRef`（替代原 `useEffect` 单一引入）。
* 第 26 行：解构 `id`。
* 第 28–30 行：新增 `remainingRef`、`startTimeRef`、`timerRef`。
* 第 32–43 行：重写 `useEffect`，初始化计时器并保存到 `timerRef`。
* 第 45–51 行：新增 `handleMouseEnter`，清除计时器并扣减已耗时。
* 第 53–58 行：新增 `handleMouseLeave`，按剩余时间重新启动计时器。
* 第 63 行：`motion.div` 添加 `id={`notification-${id}`}`。
* 第 69 行：添加 `aria-live="polite"`。
* 第 70–71 行：绑定 `onMouseEnter` / `onMouseLeave`。
* 第 83 行：关闭按钮添加 `id={`notification-close-${id}`}`。

### 2. `src/components/ui/NotificationContainer.tsx`

* 第 9 行：`div` 改为带 `id="notification-container"` 与 `aria-label="应用内通知"`。
* 第 10 行：className 改为 `fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80`。

### 3. `src/app/page.tsx`

* 第 3 行：引入 `NotificationContainer`。
* 第 53–54 行：在 `GameProvider` 内、渐黑遮罩层之上挂载 `<NotificationContainer />`。

### 4. `src/app/GameLayout.tsx`

* 第 7 行：移除 `NotificationContainer` 引入。
* 第 52 行：移除 `<NotificationContainer />` 调用。

## hover 暂停实现方式

使用 `useRef` 保存当前剩余毫秒数 `remainingRef`、本次计时启动时间 `startTimeRef`、计时器句柄 `timerRef`。

* **初始**：`useEffect` 内将 `remainingRef.current` 设为 `duration`，记录 `startTimeRef.current = Date.now()`，并启动 `setTimeout(onClose, duration)`。
* **hover**：`handleMouseEnter` 清除当前计时器，计算 `已耗时 = Date.now() - startTimeRef.current`，从剩余时间中扣除。
* **mouse leave**：`handleMouseLeave` 重新记录 `startTimeRef.current = Date.now()`，若剩余时间大于 0 则按剩余时间重新 `setTimeout`。
* **卸载**：`useEffect` 清理函数清除计时器，避免内存泄漏。

## 挂载位置

`NotificationContainer` 现挂载于 `src/app/page.tsx`（等效根组件 `App`）的 `GameProvider` 内部、条件渲染页面（大厅/菜单/游戏）之后、渐黑过渡遮罩层之前。这样无论处于哪个页面阶段，通知都能显示在所有内容之上。

## 类型检查

```bash
npx tsc --noEmit
```

输出为空，表示无类型错误。

## Git 提交

```
commit 7a30459
Author: LLM Life Sim Developer
Date:   2026-07-20

    feat: 完善并挂载全局 In-App Notification UI

    - InAppNotification.tsx 增加 hover 暂停与 mouse leave 重新计时
    - 添加唯一 id 与关闭按钮 id、aria-live="polite"
    - NotificationContainer.tsx 改为 fixed top-4 right-4 z-[9999]
    - 将容器从 GameLayout 提升至根组件 page.tsx 挂载

    Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

## 自检结果

* 功能自检：计时器在 hover 时暂停、mouse leave 后按剩余时间恢复；关闭按钮可点击；挂载后跨页面生效。
* UI 自检：通知位于右上角 `top-4 right-4`，z-index 9999，正常显示在游戏布局、overlay 等内容之上（仅低于全屏渐黑过渡遮罩）。
* 交互自检：可正常进入/退出/切换页面，通知不随 `GameLayout` 卸载而丢失。
* 稳定性自检：`useEffect` 清理函数确保组件卸载时清除计时器；无新增类型错误。

## 备注

* 需要注意的点：`NotificationContainer` 使用 `useGame()`，必须置于 `GameProvider` 内部；page.tsx 已满足该条件。
* 后续建议：若需要通知在渐黑过渡期间也可见，可考虑将 `z-[9999]` 进一步调高或调整遮罩层 z-index。
