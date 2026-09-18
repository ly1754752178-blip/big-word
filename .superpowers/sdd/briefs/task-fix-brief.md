# Fix Task: 修复 Task 7 验证发现的问题

## 目标
修复验证阶段发现的可用性问题，确保个人状态模块在桌面端和移动端都可用。

## 问题清单

### 问题 1：通知重复触发/堆叠
**现象**：每次打开 `PersonalStatusOverlay` 后右上角出现通知，多次打开后通知堆叠。
**要求**：
- 仅首次打开 `PersonalStatusOverlay` 时触发一次「个人状态已更新」通知。
- 关闭弹窗后再次打开，不应再次触发该通知。
- 实现方式建议：使用 `useRef` 标记已触发，或依赖 `detailView` 变化做更精确控制。

### 问题 2：通知遮挡弹窗关闭按钮
**现象**：通知容器 `z-[9999]` 固定在右上角，与全屏弹窗关闭按钮重叠，导致鼠标无法点击关闭按钮。
**要求**：
- 调整通知容器位置或 z-index，使其不遮挡弹窗关闭按钮。
- 建议：将容器下移（如 `top-20 right-4`）或降低 z-index 至弹窗 scrim 之下（但仍在普通内容之上）。
- 确保通知仍然可见且可交互。

### 问题 3：移动端无法进入个人状态
**现象**：在 375px/768px 下，左侧边栏与预览面板被隐藏，没有入口进入个人状态。
**要求**：
- 在 `TopBar` 右侧添加一个用户/状态图标按钮（使用 Lucide `User` 或 `Activity` 图标）。
- 该按钮仅在 `lg` 以下屏幕显示（`lg:hidden`）。
- 点击按钮调用 `openOverlayView('status')` 打开个人状态浮层。
- 按钮需要有唯一 ID，如 `mobile-status-entry`。

### 问题 4：当前状态词含「疲惫」
**现象**：`StatusPreview` 中当前状态显示为「略显疲惫」，与已移除的疲劳概念语义相关。
**要求**：
- 修改 `src/data/mockData.ts` 中 `player.bodyState.label` 为中性词，例如「状态普通」。

## 必改文件
1. `src/components/overlays/PersonalStatusOverlay.tsx` —— 修复通知重复触发。
2. `src/components/ui/NotificationContainer.tsx` —— 修复遮挡问题。
3. `src/components/layout/TopBar.tsx` —— 添加移动端个人状态入口。
4. `src/data/mockData.ts` —— 修改 `bodyState.label`。

## 验证命令
```bash
npx tsc --noEmit
npm run build
```

## 提交
```
fix: 修复个人状态模块可用性问题
```

## 全局约束
- 禁用 emoji，使用 Lucide SVG 图标。
- 文本全中文化。
- 所有交互元素需有唯一、描述性的 `id`。
- 动画仅使用 transform / opacity。
