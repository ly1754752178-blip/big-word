# Task 3: 完善并挂载全局 In-App Notification UI

## 当前状态
项目已存在以下文件：
- `src/components/ui/InAppNotification.tsx`：单个 In-App 通知项，使用 framer-motion，已具备自动消失和手动关闭。
- `src/components/ui/NotificationContainer.tsx`：通知容器，使用 AnimatePresence，已调用 `useGame().dismissNotification`。

但当前实现不完全符合设计文档要求，需要增强。

## 目标
完善 In-App Notification 组件，确保挂载到应用顶层，符合设计规范。

## 必改文件
1. `src/components/ui/InAppNotification.tsx` —— 增强：hover 暂停自动消失、恢复时重新计时、添加唯一 ID 属性、aria-live 支持。
2. `src/components/ui/NotificationContainer.tsx` —— 调整定位到右上角、z-index 最高、确保可访问属性。
3. `src/App.tsx`（或等效根组件）—— 挂载 `NotificationContainer`。
4. `src/styles/globals.css` —— 如需，补充 CSS 动画；若使用 framer-motion 可跳过。

## 行为要求
- 自动消失默认 4000ms，hover 时暂停，mouse leave 后重新计时。
- 通知项需要有唯一 `id` 属性：`notification-{id}` 和 `notification-close-{id}`。
- 容器 `id="notification-container"`，`aria-label="应用内通知"`。
- 位置：固定右上角 `top-4 right-4`，`z-[9999]`。
- 最多同时显示 3 条（已在 GameContext 中实现）。

## 实现提示
- 可以使用现有 framer-motion 动画，不必强制改为纯 CSS。
- 但必须添加 hover 暂停逻辑。
- 确保不破坏旧的 `NotificationItem.tsx`（系统通知列表组件，使用 `Notification` 类型）。

## 验证命令
```bash
npx tsc --noEmit
```
必须无类型错误。

## 提交
```
feat: 完善并挂载全局 In-App Notification UI
```

## 全局约束
- 禁用 emoji，使用 Lucide SVG 图标。
- 文本全中文化。
- 所有交互元素需有唯一、描述性的 `id`。
- 使用语义化 HTML。
