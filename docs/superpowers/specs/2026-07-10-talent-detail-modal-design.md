# 天赋详情悬停提示与弹窗设计

## 背景

当前「天赋才能」区域的天赋列表（如共感者、夜猫子）已有 hover 提示，但用户希望：
1. 鼠标悬停时显示更明确的简要介绍。
2. 点击天赋时弹出独立小窗口，展示完整详情：名称、稀有度、等级、介绍、效果、获得时间。

## 目标

- 优化 `TalentItem` 的 hover 提示。
- 点击天赋时弹出专用详情模态框。
- 在模态框中展示：名称、稀有度、等级、介绍、效果、获得时间。
- 扩展 `Talent` 类型与 mock 数据，支持等级、效果、获得时间字段。

## 关键改动

### 1. Talent 类型扩展

文件：`src/types/index.ts`

在 `Talent` 接口中新增可选字段：

```ts
export interface Talent {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  level?: number;
  effect?: string;
  acquiredAt?: string;
}
```

### 2. Mock 数据补全

文件：`src/data/mockData.ts`

为现有天赋补全字段：

```ts
{
  id: 't1',
  name: '共感者',
  description: '更容易理解他人的情绪与想法，社交事件中获得额外好感度',
  icon: 'heart',
  rarity: 'rare',
  level: 1,
  effect: '社交事件中好感度获取 +15%，更易触发深度对话选项',
  acquiredAt: '2026-04-06',
}
```

### 3. 新建 TalentDetailModal 组件

文件：`src/components/ui/TalentDetailModal.tsx`

- 接收 `talent: Talent` 和 `onClose: () => void`。
- 使用 `GlassCard` + `motion.div` 构建小尺寸居中模态框。
- 背景遮罩点击可关闭。
- 内容布局：
  - 顶部：图标 + 名称 + 稀有度标签。
  - 等级（若存在）。
  - 介绍。
  - 效果（若存在）。
  - 获得时间（若存在）。

### 4. TalentItem 改造

文件：`src/components/layout/previews/TalentsPreview.tsx`

- hover 提示保持并优化文案：显示名称 + description 前段。
- 将 `TalentItem` 外层从 `div` 改为 `button`，支持点击。
- 点击时调用本地状态打开 `TalentDetailModal`。

### 5. 数据缺失处理

- 若 `level`/`effect`/`acquiredAt` 不存在，对应字段不渲染或显示「未知」。

## 成功标准

- 鼠标悬停在任意天赋上时，显示包含名称与简要介绍的 tooltip。
- 点击天赋时弹出居中模态框，展示完整信息。
- 模态框可点击遮罩或关闭按钮关闭。
- 弹窗不影响页面其他交互。
- TypeScript 类型检查通过。

## 依赖与风险

- 依赖：无新增依赖。
- 风险：`Talent` 类型扩展后，其他地方使用 Talent 的代码需要兼容可选字段，已通过 `?` 规避。
