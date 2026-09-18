# 个人状态界面重制设计文档

> 日期：2026-07-20  
> 范围：个人状态模块（`PersonalStatusOverlay` + `StatusPreview`）+ 全局 In-App Notification 系统  
> 状态：已确认，待实现

---

## 1. 背景与目标

当前「个人状态」界面存在以下问题：

- 美术表现基础，卡片堆砌感强，高级感不足。
- 信息组织零散，大量字段各自占用独立矩形框，空间利用率低。
- 包含「疲劳」相关内容，需要彻底移除。
- 使用浏览器原生通知或不一致提示，缺乏统一的内部通知系统。
- 全中文化不彻底，部分视觉表达粗糙。

本次重制目标：

1. **彻底移除疲劳相关内容**（从数据模型到 UI）。
2. **全中文化**：除 logo / 纯视觉元素外，所有文本使用中文。
3. **禁用 emoji**，统一使用 Lucide SVG 图标。
4. **提升信息密度与直观度**：减少无意义容器，信息一眼可读。
5. **建立高端视觉质感**：现代排版、柔和渐变、细腻阴影、微交互动画。
6. **建立全局 In-App Notification 系统**：不使用浏览器原生通知。
7. **性能与可访问**：语义化 HTML、唯一 ID、`prefers-reduced-motion` 支持。

---

## 2. 核心设计原则

- **信息优先**：界面服务于信息展示，装饰不喧宾夺主。
- **层级清晰**：顶部身份锚点 → 身体状态 → 个人讯息 → 资质荣誉，按重要性纵向排列。
- **避免重复**：详情页不重复展示侧边栏 `StatusPreview` 已呈现的简单快照信息。
- **高密度但不拥挤**：用间距、字重、颜色区分信息组，而非大量边框和卡片。
- **一致性**：沿用项目现有 design-system 色彩与字体系统（奶油/薄荷/珊瑚/天空蓝）。

---

## 3. 数据层变更

### 3.1 删除 `fatigue` 字段

从 `PlayerBodyState` 类型中彻底删除 `fatigue`：

```ts
// src/types/index.ts
export interface PlayerBodyState {
  label: string;
  // fatigue: number;   // ← 删除
  mood: string;
  conditions: string[];
  description: string;
  height: number;
  weight: number;
  ageStage: string;
  physiological: string[];
  mental: string[];
}
```

### 3.2 清理 mock 数据

`src/data/mockData.ts` 中 `player.bodyState` 删除 `fatigue` 键值对。

### 3.3 清理所有引用

全局搜索 `fatigue`，确保以下位置无残留：

- `src/components/overlays/PersonalStatusOverlay.tsx`
- `src/components/layout/previews/StatusPreview.tsx`
- `src/context/GameContext.tsx`（如有 reducer 逻辑）
- `ui-showcase.html` 及任何展示文件
- 其他工具函数或派生逻辑

---

## 4. `PersonalStatusOverlay` 重制

### 4.1 布局结构

```
┌─────────────────────────────────────────────────────────────┐
│  [身份锚点区]                                                │
│  [头像]  叶悠真  ·  高中生  ·  18岁                         │
│  ♥ 体力 78  ▓▓▓▓▓▓▓░  🧠 精神 65  ▓▓▓▓▓░░░  🏥 健康 82 ▓▓▓▓▓▓▓▓░ │
├─────────────────────────────────────────────────────────────┤
│  [身体状态]                                                  │
│  180cm · 50斤 · 18岁                                        │
│  生理：营养不良 · 运动后肌肉酸痛                            │
│  精神：颓废 · 失眠 · 轻微睡眠不足                           │
│  昨晚熬夜看书，今天上课时有些走神。                         │
├─────────────────────────────────────────────────────────────┤
│  [个人讯息]                                                  │
│  叶悠真 · 男 · 18岁                                         │
│  2008年4月17日 · 日本 · 东京都                              │
│  日语 · 高中生                                              │
│  父亲、母亲                                                 │
│  东京都·世田谷区·樱丘一丁目 2-15 阳光公寓 302              │
├─────────────────────────────────────────────────────────────┤
│  [资质与荣誉]                                                │
│  证件证书 无                                                │
│  奖项成就 无                                                │
└─────────────────────────────────────────────────────────────┘
```

> 注：图标使用 Lucide SVG，上图中 ♥/🧠/🏥 仅用于示意。

### 4.2 身份锚点区

- **头像**：圆角矩形，带柔和阴影和渐变背景。尺寸 72×72px（桌面）/ 64×64px（移动）。
- **姓名**：`font-heading`，24px，bold，`text-primary`。
- **身份标签**：社会身份 + 年龄，使用 pill 标签，轻量背景。
- **状态条**：三大状态水平排列，每条包含：
  - Lucide 图标（Heart / Brain / Activity）
  - 中文标签（体力 / 精神 / 健康）
  - 数值 `value/100`
  - 细进度条（高度 6px，圆角）
- 进入动画：状态条从 0 填充到实际值，400ms ease-out。

### 4.3 身体状态区

- **标题**：`Activity` 图标 + 「身体状态」。
- **身体测量**：身高 / 体重 / 年龄阶段，横向紧凑排列，用中点分隔。
- **生理状态**：标签 pill 流式排列。
- **精神状态**：标签 pill 流式排列。
- **当前描述**：完整描述文本，使用次要文字色。

### 4.4 个人讯息区

- **标题**：`Fingerprint` 图标 + 「个人讯息」。
- 字段按逻辑分组，每组内横向排列，组间用 1px 细线分隔：
  - 基本身份：姓名 / 性别 / 年龄
  - 出生与出身：生日 / 国籍 / 户籍
  - 社会属性：母语 / 社会身份
  - 家庭：家庭成员
  - 居住：住址

### 4.5 资质与荣誉区

- **标题**：`Award` 图标 + 「资质与荣誉」。
- 证件证书、奖项成就分别列出。
- 空状态显示「无」。

### 4.6 响应式策略

| 断点 | 布局调整 |
|---|---|
| 桌面（>1024px） | 状态条三列横向；身体测量三列横向；个人讯息字段组横向排列。 |
| 平板（640-1024px） | 状态条三列横向；身体测量三列横向；字段组横向但可适当换行。 |
| 移动（<640px） | 状态条纵向堆叠；身体测量纵向堆叠；字段组内换行，标签-数值上下排列。 |

---

## 5. `StatusPreview` 重制

侧边栏预览保持极简，只展示核心快照，避免与详情页重复。

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

- 头像 + 姓名 + 身份标签。
- 三条核心状态条（与详情页一致但尺寸更小）。
- 当前身体标签 + 心情。
- 身体测量一行摘要。
- 点击进入 `PersonalStatusOverlay`。

---

## 6. 全局 In-App Notification 系统

### 6.1 状态管理

在 `GameContext` 中扩展：

```ts
// 已在 types/index.ts 定义
export interface InAppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
}

// GameContext 新增
inAppNotifications: InAppNotification[];
addNotification: (notification: Omit<InAppNotification, 'id'>) => void;
dismissNotification: (id: string) => void;
clearNotifications: () => void;
```

### 6.2 组件结构

- `NotificationContainer`：固定定位在视口右上角，`z-index` 最高（如 9999）。
- `NotificationItem`：单条通知，包含：
  - 类型图标（Info / CheckCircle / AlertTriangle / XCircle）
  - 标题
  - 可选消息
  - 关闭按钮

### 6.3 交互行为

- 自动消失：默认 4000ms，可通过 `duration` 覆盖。
- hover 时暂停计时，移出后继续。
- 手动关闭按钮带 `aria-label`。
- 最多同时显示 3 条，超出时移除最早的一条。
- 进入动画：从右侧滑入 + 淡入，200ms ease-out。
- 退出动画：向上滑出 + 淡出，150ms ease-in。

### 6.4 首次使用场景

`PersonalStatusOverlay` 加载完成后，触发一条 info 通知：

> 标题：「个人状态已更新」  
> 消息：「疲劳相关状态已移除，当前显示最新身体档案。」

用于验证通知系统接通，并自然告知玩家数据变更。

---

## 7. 视觉与动效

### 7.1 色彩

沿用项目设计系统：

- 背景：`--bg-base` / `--bg-card`
- 主文字：`--text-primary`
- 次要文字：`--text-secondary`
- 状态色：体力珊瑚 `--status-coral`、精神天空蓝 `--calendar-sky`、健康薄荷绿 `--accent-green`
- 边框：`--border-soft`

### 7.2 字体

- 标题：`font-heading`（HarmonyOS Sans SC / PingFang SC）
- 正文：`font-body`（LXGW WenKai / Noto Sans SC）
- 数字：`font-number`（Outfit / JetBrains Mono）

### 7.3 动效规范

| 动画 | 时长 | 说明 |
|---|---|---|
| 区域入场 | 200ms | 从下方 12px 淡入，stagger 50ms。 |
| 状态条填充 | 400ms | 从 0 到实际值，ease-out。 |
| 标签 hover | 150ms | 上浮 2px，阴影加深。 |
| 卡片 hover | 150ms | 上浮 2px，边框色变化。 |
| 通知进入 | 200ms | 从右侧滑入 + 淡入。 |
| 通知退出 | 150ms | 向上滑出 + 淡出。 |

所有动画仅使用 `transform` / `opacity`，并在 `prefers-reduced-motion: reduce` 时禁用。

---

## 8. 可访问与性能

### 8.1 语义化 HTML

- 使用 `<section>` 划分区域。
- 使用 `<header>` 作为区域标题。
- 使用 `<dl>` / `<dt>` / `<dd>` 展示键值对信息。
- 图标按钮必须带 `aria-label`。

### 8.2 唯一 ID

- 所有用于测试的交互元素（状态条、通知、关闭按钮等）必须具有唯一且描述性的 `id`。
- 建议前缀：`personal-status-*`、`notification-*`。

### 8.3 性能

- 动画仅使用 `transform` / `opacity`。
- 不使用大图片或复杂 SVG 滤镜。
- 通知容器使用 `React.memo` 或合理拆分避免不必要重渲染。
- 支持 `prefers-reduced-motion`。

---

## 9. 实现范围清单

### 9.1 必做

- [ ] 从 `types/index.ts` 删除 `fatigue`。
- [ ] 从 `mockData.ts` 删除 `fatigue`。
- [ ] 全局清理所有 `fatigue` 引用。
- [ ] 重制 `PersonalStatusOverlay.tsx`。
- [ ] 重制 `StatusPreview.tsx`。
- [ ] 在 `GameContext` 中扩展通知状态与操作。
- [ ] 新增 `NotificationContainer.tsx` 和 `NotificationItem.tsx`。
- [ ] 将通知容器挂载到应用顶层（如 `App.tsx` 或 `OverlayRenderer` 同级）。
- [ ] 在 `PersonalStatusOverlay` 加载时触发首次通知。
- [ ] 检查并替换所有可能存在的 emoji（本模块内）。
- [ ] 语义化 HTML 与唯一 ID。
- [ ] `prefers-reduced-motion` 支持。

### 9.2 自检项

- [ ] 功能自检：状态条数值正确、通知能显示与关闭、点击预览可进入详情。
- [ ] UI 自检：无遮挡、无溢出、颜色可读、风格统一。
- [ ] 交互自检：hover/press 反馈正常、移动端可用、重复进入退出正常。
- [ ] 稳定性自检：无 console 报错、无残留 `fatigue`、动画不卡顿。

---

## 10. 风险与注意事项

1. `fatigue` 可能通过字符串或中文「疲劳」在其他文件中被引用，需要全局搜索确认。
2. `StatusPreview` 中的 `deriveBodyFigure` 函数依赖 `bodyState.mental`，需确认移除疲劳后描述仍然合理。
3. 全局通知系统首次引入，需确保不会与现有通知/提示冲突。
4. 高信息密度设计在移动端需要特别注意可读性，避免文字拥挤。

---

## 11. 后续建议

- 通知系统建立后，可逐步替换其他模块中的浏览器原生 `alert` / `confirm`。
- 可考虑为通知增加「操作按钮」扩展点，供未来交互使用。
- 个人状态未来可增加「状态历史趋势」图表，但不在本次范围内。
