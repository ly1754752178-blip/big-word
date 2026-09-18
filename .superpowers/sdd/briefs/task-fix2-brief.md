# Fix 2 Task: 修复通知触发与移动端入口遮挡

## 目标
修复重新验证中发现的两个高/中优先级问题。

## 问题 1：弹窗首次打开时通知未触发
**现象**：`PersonalStatusOverlay` 中 `useEffect` 以 `addNotification` 为依赖，第一次渲染后的 400ms 定时器在 Provider 重渲染后的 cleanup 中被清理，随后 `notifiedRef.current` 已为 `true`，导致通知永远不触发。

**要求**：
- 确保 `PersonalStatusOverlay` 首次打开时，400ms 后稳定触发一次 info 通知。
- 重复打开不重复触发。
- 不能破坏 React hooks 规则。

**修复建议**：
- 移除 `useEffect` 对 `addNotification` 的依赖，使用空依赖数组 `[]`。
- 如果 eslint 报错，使用 `// eslint-disable-next-line react-hooks/exhaustive-deps` 注释并说明原因。
- 保留 `notifiedRef` 防止重复触发。
- 在 `useEffect` 内部直接调用 `addNotification`，不通过 `setTimeout` 包装；或者保留 400ms 延迟但确保 cleanup 不导致永久失效。
- 更简单的方案：直接同步触发（无延迟），避免定时器被 cleanup 取消的问题。若保留延迟，需确保在组件卸载前不会取消已触发的通知。

## 问题 2：375px 下移动端个人状态入口按钮被天气球遮挡
**现象**：`TopBar` 右侧 `#mobile-status-entry` 按钮存在，但位于 `SkyOrb` 的可点击区域下方，Playwright 点击被天气球 subtree 拦截。

**要求**：
- 确保 375px 下移动端个人状态入口按钮可正常点击。
- 不要破坏现有 TopBar 和天气球的视觉设计。

**修复建议（任选其一或组合）**：
- 给 `mobile-status-entry` 按钮设置更高的 `z-index`（如 `z-30` 或 `z-40`），并确保其父级没有创建新的 stacking context 限制。
- 或者将按钮移到天气球左侧，避免重叠。
- 或者调整 `SkyOrb` 容器的 `pointer-events` 为 `none`（如果天气球不需要点击）。

## 必改文件
1. `src/components/overlays/PersonalStatusOverlay.tsx` —— 修复通知触发。
2. `src/components/layout/TopBar.tsx` —— 修复移动端入口遮挡。

## 验证命令
```bash
npx tsc --noEmit
npm run build
```

## 提交
```
fix: 修复通知触发与移动端入口遮挡
```

## 全局约束
- 禁用 emoji，使用 Lucide SVG 图标。
- 所有交互元素需有唯一、描述性的 `id`。
- 不破坏现有功能和视觉设计。
