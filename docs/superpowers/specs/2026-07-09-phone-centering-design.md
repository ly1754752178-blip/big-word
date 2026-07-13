# 手机组件在右侧面板内居中设计

## 背景

用户希望右下角手机在右侧面板（地图+通知区）内部水平居中，而非在整个屏幕中居中。当前手机组件使用 `fixed` 定位，相对于整个 viewport，需要调整。

## 目标

- 将 `Phone` 组件从 `page.tsx` 的全局渲染改为在 `RightPanel.tsx` 内部渲染。
- 让 `RightPanel` 成为相对定位容器。
- 将 `PhoneFrame` 的定位从 `fixed` 改为 `absolute`，使其相对于 `RightPanel` 定位。
- 收起状态手机头部与展开状态手机宽度一致（288px），并在 `RightPanel` 内水平居中。
- 竖向位置保持不变（仍在 `RightPanel` 底部）。
- 不影响展开/收起动画。

## 关键改动

### 1. page.tsx

- 移除全局渲染的 `<Phone />` 组件。

### 2. RightPanel.tsx

- 在右侧面板最外层容器添加 `relative`。
- 在面板底部渲染 `<Phone />` 组件。

### 3. PhoneFrame.tsx

#### 收起状态头部

- 定位由 `fixed bottom-0 right-0` 改为 `absolute bottom-0 left-1/2 -translate-x-1/2`。
- 宽度统一为 `288px`。

#### 展开状态手机

- 定位由 `fixed bottom-0 right-0` 改为 `absolute bottom-0 left-0 right-0 mx-auto`。
- 宽度统一为 `288px`。
- 动画保持原有弹簧效果。

## 成功标准

- 手机仅在右侧面板宽度（320px）范围内居中，不覆盖中间叙事面板。
- 收起状态手机头部宽度为 288px，在右侧面板内水平居中（左右各 16px 边距）。
- 展开状态手机宽度为 288px，在右侧面板内水平居中。
- 展开/收起动画保持原有弹簧效果，仅沿 Y 轴移动。
- TypeScript 类型检查通过。

## 依赖与风险

- 依赖：无新增依赖。
- 风险：将手机移入 `RightPanel` 后，展开手机只覆盖右侧面板区域，这是预期行为。
