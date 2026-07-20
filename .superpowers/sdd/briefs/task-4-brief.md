# Task 4: 重制 StatusPreview

## 目标
将侧边栏 `StatusPreview` 改为精简快照布局，只展示核心信息，不重复详情页内容。

## 必改文件
1. `src/components/layout/previews/StatusPreview.tsx` —— 完全重写。
2. `src/components/ui/StatBar.tsx`（如需要）—— 添加 `id` prop 支持。

## 布局要求
```
┌─────────────────────────────┐
│ [头像]  叶悠真              │
│         高中生 · 18岁       │
├─────────────────────────────┤
│ ♥ 体力  78  ▓▓▓▓▓▓▓░       │
│ 🧠 精神  65  ▓▓▓▓▓░░░       │
│ 🏥 健康  82  ▓▓▓▓▓▓▓▓░      │
├─────────────────────────────┤
│ 当前：略显疲惫 · 平静        │
│ 180cm · 50斤 · 18岁         │
└─────────────────────────────┘
```
- 注：图标使用 Lucide SVG（Heart / Brain / Activity），禁止使用 emoji。

## 视觉要求
- 使用 `GlassCard` 组件包裹整个预览。
- 头像尺寸 64×64px，圆角 `rounded-xl`。
- 身份标签使用 pill 样式。
- 状态条紧凑，使用项目语义色：体力 `#E87A5D`、精神 `#38BDF8`、健康 `#6BBF73`。
- 底部身体摘要使用次要文字色。
- hover 时卡片轻微上浮 + 阴影加深。

## 行为要求
- 点击卡片进入 `PersonalStatusOverlay`（调用 `openOverlayView('status')`）。
- 三条状态条需要唯一 `id`：`preview-stamina-bar`、`preview-mental-bar`、`preview-health-bar`。

## 验证命令
```bash
npx tsc --noEmit
```

## 提交
```
feat: 重制 StatusPreview 为精简快照布局
```

## 全局约束
- 禁用 emoji，使用 Lucide SVG 图标。
- 文本全中文化。
- 所有交互元素需有唯一、描述性的 `id`。
- 动画仅使用 transform / opacity，支持 prefers-reduced-motion。
