# Task 5: 重制 PersonalStatusOverlay

## 目标
将全屏浮层 `PersonalStatusOverlay` 改为高密度、高级感的个人档案页，并在加载时触发一条 info 通知验证系统。

## 必改文件
1. `src/components/overlays/PersonalStatusOverlay.tsx` —— 完全重写。

## 布局要求
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
│  东京都·世田谷区·樱丘一丁目 2-15 阳光公寓 302         │
├─────────────────────────────────────────────────────────────┤
│  [资质与荣誉]                                                │
│  证件证书 无                                                │
│  奖项成就 无                                                │
└─────────────────────────────────────────────────────────────┘
```
- 注：图标使用 Lucide SVG（User / Heart / Brain / Activity / Stethoscope / Sparkles / Fingerprint / Award / FileBadge），禁止使用 emoji。

## 视觉要求
- 身份锚点区使用 `GlassCard variant="floating"`，顶部 3px 渐变条（status-coral → accent-teal → accent-green）。
- 头像 96×96px（桌面）/ 80×80px（移动），圆角 `rounded-2xl`。
- 状态条使用项目语义色：体力 `#E87A5D`、精神 `#38BDF8`、健康 `#6BBF73`。
- 身体状态区、个人讯息区、资质荣誉区使用统一卡片样式，细边框，柔和阴影。
- 标签使用 pill 样式，按语义着色（生理=薄荷，精神=天空蓝）。
- 字段按逻辑分组，组间用 1px 细线分隔，不使用独立大卡片。

## 行为要求
- 详情页加载后约 400ms，触发一条 info 通知：
  - 标题：「个人状态已更新」
  - 消息：「疲劳相关状态已移除，当前显示最新身体档案。」
  - duration: 4000
- 使用 `useGame().addNotification`。

## 响应式
- 桌面（>1024px）：状态条三列横向；身体测量三列横向；字段组横向排列。
- 平板（640-1024px）：状态条三列横向；身体测量三列横向；字段组横向但可适当换行。
- 移动（<640px）：状态条纵向堆叠；身体测量纵向堆叠；字段组内换行。

## ID 要求
- 身份锚点区：`personal-status-identity-card`
- 体力条：`personal-status-stamina`
- 精神条：`personal-status-mental`
- 健康条：`personal-status-health`
- 身体状态区：`personal-status-body-section`
- 个人讯息区：`personal-status-info-section`
- 资质荣誉区：`personal-status-awards-section`

## 验证命令
```bash
npx tsc --noEmit
```

## 提交
```
feat: 重制 PersonalStatusOverlay 为高密度信息档案页
```

## 全局约束
- 禁用 emoji，使用 Lucide SVG 图标。
- 文本全中文化（logo / 纯视觉元素除外）。
- 所有交互元素需有唯一、描述性的 `id`。
- 使用语义化 HTML（section, header, dl/dt/dd 优先）。
- 动画仅使用 transform / opacity，支持 prefers-reduced-motion。
