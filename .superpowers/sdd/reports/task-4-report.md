# Task 4 报告：重制 StatusPreview 为精简快照布局

## 完成情况

- 已完成：
  - 完全重写 `src/components/layout/previews/StatusPreview.tsx` 为精简快照布局。
  - 为 `StatBar` 添加 `id?: string` prop 并绑定到根元素。
  - 为 `GlassCard` 添加 `id?: string` prop 并绑定到根元素（`StatusPreview` 需要给外层卡片设置 id）。
  - 删除旧代码中不再使用的 `deriveBodyFigure` 函数及其类型导入。
  - 运行 `npx tsc --noEmit` 通过，无类型错误。
  - 已提交并推送至远程分支。

- 未完成：无。

- 已修复：无额外修复。

- 仍有风险：无已知风险。

## 修改文件

### 1. `src/components/layout/previews/StatusPreview.tsx`

- 删除原 `PlayerBodyState` 类型导入与 `deriveBodyFigure` 函数（原第 7–18 行）。
- 删除原顶部标题横栏、个人讯息列表、身体状态标签等冗余区块。
- 重写为 `GlassCard` 包裹的精简快照布局：
  - 头像（64×64px，`rounded-xl`）+ 玩家名 + 身份 pill（`socialIdentity` / `age`）。
  - 三条核心状态条：体力 / 精神 / 健康。
  - 底部摘要：当前状态（`bodyState.label · bodyState.mood`）+ 身体摘要（`height cm · weight 斤 · ageStage`）。
  - 整个卡片点击调用 `openOverlayView('status')`。
- 新增 `id="status-preview-card"` 到外层卡片。
- 动画仅使用 `transform/opacity`，并添加 `motion-reduce:transform-none motion-reduce:transition-none` 支持 `prefers-reduced-motion`。

### 2. `src/components/ui/StatBar.tsx`

- 第 2 行：接口 `StatBarProps` 增加 `id?: string`。
- 第 10 行：解构增加 `id`。
- 第 14 行：根元素 `<div>` 绑定 `id={id}`。

### 3. `src/components/ui/GlassCard.tsx`

- 第 27 行：接口 `GlassCardProps` 增加 `id?: string`。
- 第 33 行：解构增加 `id`。
- 第 36 行：根元素 `<div>` 绑定 `id={id}`。

## 状态条 ID 设置

| 状态条 | ID |
|--------|-----|
| 体力 | `preview-stamina-bar` |
| 精神 | `preview-mental-bar` |
| 健康 | `preview-health-bar` |

颜色设置：
- 体力 `#E87A5D`
- 精神 `#38BDF8`
- 健康 `#6BBF73`

## 验证结果

运行命令：

```bash
npx tsc --noEmit
```

输出：无输出，退出码 0，表示类型检查通过。

## Git 提交

- Commit message: `feat: 重制 StatusPreview 为精简快照布局`
- Commit hash: `e851872`
- 分支：`feature/personal-status-redesign`
- 已推送至远程：`feature/personal-status-redesign -> feature/personal-status-redesign`

## 备注

- 本次修改未引入 emoji，全部使用 Lucide SVG 图标（Heart / Brain / Activity）。
- 文本全中文化。
- 后续 Task 5 重制 `PersonalStatusOverlay` 时，可保持相同的配色与数据字段约定。
