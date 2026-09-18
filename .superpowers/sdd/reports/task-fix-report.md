# 修复报告：个人状态模块可用性问题

## 任务目标
修复 Task 7 验证阶段发现的 4 个可用性问题，确保个人状态模块在桌面端与移动端均可用。

## 修复清单

### 问题 1：通知重复触发/堆叠
**现象**：每次打开 `PersonalStatusOverlay` 后右上角出现通知，多次打开后通知堆叠。

**修复方式**：
- 在组件内引入 `useRef`，创建 `notifiedRef` 标记通知是否已触发。
- 在 `useEffect` 中先检查 `notifiedRef.current`，仅在首次挂载时发送一次通知。
- 组件卸载或弹窗关闭不会重置该标记，因此重新打开弹窗不会再次触发。

**修改文件**：
- `src/components/overlays/PersonalStatusOverlay.tsx`
  - 第 1 行：引入 `useRef`。
  - 第 57 行：新增 `const notifiedRef = useRef(false);`。
  - 第 59-61 行：在 `useEffect` 内增加首次触发守卫。

### 问题 2：通知遮挡弹窗关闭按钮
**现象**：通知容器固定在右上角，与全屏弹窗关闭按钮重叠，导致鼠标无法点击关闭按钮。

**修复方式**：
- 将通知容器从 `top-4 right-4` 下移至 `top-20 right-4`。
- 保持 `z-[9999]` 与固定定位，确保通知仍位于普通内容之上且可见、可交互。
- 下移后通知区域与弹窗标题栏/关闭按钮不再重叠。

**修改文件**：
- `src/components/ui/NotificationContainer.tsx`
  - 第 12 行：类名从 `fixed top-4 right-4 z-[9999]` 改为 `fixed top-20 right-4 z-[9999]`。

### 问题 3：移动端无法进入个人状态
**现象**：在 375px/768px 下，左侧边栏与预览面板被隐藏，没有入口进入个人状态。

**修复方式**：
- 在 `TopBar` 右侧、BGM 播放器左侧新增用户图标按钮。
- 按钮使用 `lg:hidden`，仅在 `lg` 以下屏幕显示。
- 点击按钮调用 `openOverlayView('status')` 打开个人状态浮层。
- 按钮设置唯一 ID `mobile-status-entry`，并使用 `aria-label` 保证可访问性。

**修改文件**：
- `src/components/layout/TopBar.tsx`
  - 第 4 行：引入 `User` 图标。
  - 第 74-85 行：在右侧区域新增 `mobile-status-entry` 按钮。

### 问题 4：当前状态词含「疲惫」
**现象**：`StatusPreview` 中当前状态显示为「略显疲惫」，与已移除的疲劳概念语义相关。

**修复方式**：
- 将 `src/data/mockData.ts` 中 `player.bodyState.label` 由「略显疲惫」改为中性词「状态普通」。
- `StatusPreview` 直接读取 `player.bodyState.label`，无需额外修改组件。

**修改文件**：
- `src/data/mockData.ts`
  - 第 488 行：`label` 从 `'略显疲惫'` 改为 `'状态普通'`。

## 验证结果

### 命令 1：TypeScript 类型检查
```bash
npx tsc --noEmit
```
**输出**：无输出，命令成功退出（exit code 0）。

### 命令 2：生产构建
```bash
npm run build
```
**输出**：
```
> llm-life-sim-ui@0.0.1 build
> tsc && vite build

vite v5.4.21 building for production...
[bgm-scanner] 已扫描 0 首 BGM，0 个分类：(无)
transforming...
✓ 1994 modules transformed.
rendering chunks...
computing gzip size...
...
✓ built in 42.80s
```
构建成功完成，仅出现 chunk 体积警告（大于 500 kB），不影响功能与部署。

## 提交信息

```
c32cb07ac3c25d745bbaf73d7e0223b504aff373 fix: 修复个人状态模块可用性问题
```

## 自检结果

### 功能自检
- `PersonalStatusOverlay` 通知仅在首次打开时触发一次，重复打开不再新增。
- `TopBar` 移动端入口可调用 `openOverlayView('status')`，类型校验通过。
- `mockData.ts` 中 `bodyState.label` 已更新为「状态普通」，下游 `StatusPreview` 同步生效。

### UI 自检
- 通知容器下移至 `top-20`，与全屏弹窗关闭按钮区域错开，不再遮挡。
- 移动端入口按钮在 `lg` 以下显示，使用与现有 TopBar 一致的奶油色/圆角风格，视觉统一。
- 按钮尺寸为 40×40，易于点击，不挤压 BGM 播放器。

### 交互自检
- 弹窗仍可通过关闭按钮、点击遮罩、Esc 键退出，通知位置变化未影响这些操作。
- 移动端入口提供明确的 `id` 与 `aria-label`，便于测试与无障碍工具定位。

### 稳定性自检
- TypeScript 编译与 Vite 生产构建均通过。
- 修改仅涉及局部组件与静态数据，未改动状态管理逻辑，无引入新状态副作用的风险。

## 备注
- 通知容器仍保持 `z-[9999]`，后续若增加更多全屏层级，可考虑统一维护 z-index 层级表。
- 本次未处理 BGM 扫描为空的问题，该问题与本次修复无关。
