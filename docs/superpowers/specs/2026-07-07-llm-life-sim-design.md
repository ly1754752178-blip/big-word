# LLM 驱动综漫开放世界人生模拟游戏 — 前端设计规格

**项目路径：** `F:\AI\no2`  
**日期：** 2026-07-07  
**版本：** v1.0  
**状态：** 已通过设计评审，待进入实现计划

---

## 1. 项目概述

### 1.1 产品定位
一款以 LLM 叙事为核心的**综漫开放世界人生模拟 / 社会关系经营 RPG**的前端原型。玩家通过主界面管理角色状态、技能、社交关系、财富资产、日历事件，并与 AI 进行沉浸式角色扮演对话。

### 1.2 美学方向
**「黄昏电车暖调」**

融合三种参考风格：
- 《碧蓝档案》的现代 UI 设计语言
- 日常系 Galgame 的情绪氛围
- 日本真实生活 App 的交互逻辑

整体视觉呈现：米杏底色、夕阳橙强调色、柔和玻璃质感、傍晚时分放学/下班后的温暖日常感。

### 1.3 设计原则
1. 高级感优先：拒绝普通、简陋、默认感
2. 信息密度高但不拥挤
3. 微交互动画自然、有目的
4. 全中文化，使用 SVG 图标而非 emoji
5. 前端内部实现警告/通知，不使用浏览器默认弹窗
6. 语义化 HTML、唯一 ID、性能优化

---

## 2. 技术栈

- **框架：** React 18
- **构建工具：** Vite
- **样式：** Tailwind CSS
- **组件基础：** shadcn/ui（大量自定义）
- **动画：** Framer Motion
- **图标：** Lucide React
- **字体：**
  - 标题：HarmonyOS Sans SC / PingFang SC
  - 正文：LXGW WenKai / Source Han Sans SC
  - 数字：JetBrains Mono / Inter

**架构方式：** 模块化组件 + Context 状态管理。数据层与视图层分离，便于后续替换为 LLM 真实数据。

---

## 3. 整体布局架构

### 3.1 屏幕划分

全屏应用，无页面滚动，使用 CSS Grid 固定比例：

```
+--------------------------------------------------+
|                    TopBar (80px)                  |
+---------+---------------------------+------------+
|         |                           |            |
|  Left   |        Narrative          |   Right    |
| Sidebar |        Center             |   Panel    |
|  ~22%   |        ~56%               |   ~22%     |
|         |                           |            |
+---------+---------------------------+------------+
```

| 区域 | 尺寸 | 作用 |
|------|------|------|
| 上栏 | 100% × 80px | 日期、时间水晶球、节日 |
| 左侧边栏 | 约 22% | 六大模块切换 + 详情面板 |
| 中间叙事区 | 约 56% | LLM 叙事输出 + 玩家输入 |
| 右侧面板 | 约 22% | 地图、场景图、通知列表、手机浮层 |

### 3.2 响应式策略

- **桌面端（≥1280px）：** 完整四栏布局，主体验
- **平板端（768px–1279px）：** 左侧详情面板改为可滑出抽屉，右侧面板可收起
- **手机端（<768px）：** 底部导航 + 各模块全屏展示，不强行塞入四栏

---

## 4. 视觉设计系统

### 4.1 色彩 Tokens

| Token | 色值 | 用途 |
|-------|------|------|
| `--bg-base` | `#FAF6F1` | 全局背景，奶油米白 |
| `--bg-card` | `rgba(255, 253, 250, 0.78)` | 卡片背景，半透明 |
| `--bg-glass` | `rgba(255, 255, 255, 0.45)` | 玻璃质感 |
| `--border-soft` | `rgba(218, 205, 190, 0.5)` | 柔和边框 |
| `--text-primary` | `#3D3229` | 主文字，深棕 |
| `--text-secondary` | `#7D6E5E` | 次要文字 |
| `--accent-sunset` | `#E88D4F` | 强调色，夕阳橙 |
| `--accent-amber` | `#F5C542` | 点缀，琥珀黄 |
| `--accent-teal` | `#5BA8A0` | 次要强调，青绿 |
| `--accent-green` | `#6BBF73` | 玩家位置点，绿 |
| `--shadow-soft` | `0 8px 32px rgba(61, 50, 41, 0.08)` | 柔和阴影 |

### 4.2 字体系统

```css
--font-heading: 'HarmonyOS Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
--font-body: 'LXGW WenKai', 'Source Han Sans SC', 'Noto Sans SC', sans-serif;
--font-mono: 'JetBrains Mono', 'Inter', monospace;
```

### 4.3 圆角与间距

- 大卡片圆角：`16px`
- 小按钮/输入框圆角：`12px`
- 间距基线：`8px` 栅格
- 常用间距：`8px / 12px / 16px / 24px / 32px / 48px`

### 4.4 特效规范

- 玻璃卡片：`backdrop-filter: blur(20px)` + 半透明背景 + 柔和阴影
- Hover 反馈：`translateY(-2px)` + 阴影加深
- Active 反馈：`scale(0.98)`
- 焦点环：`2px solid var(--accent-sunset)`，偏移 `2px`

---

## 5. 界面模块详细设计

### 5.1 顶部栏（TopBar）

固定高度 `80px`，横向三等分。

#### 左侧：日期信息
- 大号数字显示年 / 月 / 日
- 下方小字显示日本曜日 + 中文周称
- 示例：`2026 / 07 / 07` + `火曜日（周二）`

#### 中间：时间水晶球
- 直径 `64px` 圆形玻璃球
- 上半球显示天色图案：
  - 晴空：天蓝 → 白云渐变
  - 夕阳：橙红 → 紫粉渐变
  - 星夜：深蓝 + 星点
  - 暴雨：灰蓝 + 雨线
- 下半球显示当前时间，如 `07:30`
- 球体有高光反射、内阴影、轻微呼吸动画

#### 右侧：节日提示
- 节日名称 + 小型图案
- 图案可超出栏边界，占据右上角
- 无节日时显示"平日"或天气简述

### 5.2 左侧边栏（LeftSidebar）

分为两层：极窄图标条 + 详情面板。

#### 5.2.1 图标条（宽度约 64px）

六个选项垂直排列：
1. 个人状态
2. 天赋才能
3. 社交关系
4. 财富资产
5. 日历事件
6. 系统设置

交互：
- 默认只显示 SVG 图标
- 鼠标悬停时，半透明方块底衬淡入
- 选中项底衬为夕阳橙微透明显示
- 点击切换右侧详情面板

#### 5.2.2 详情面板

点击图标条后，右侧显示对应详情。

##### 个人状态
- 顶部：角色名 + 小头像
- 状态条：体力、精神、健康，各带进度条
- 身体状态：标签式展示（如"精力充沛""轻微疲劳"）
- 个人信息：出身、户籍、生日、家庭背景等

##### 天赋才能
- 顶部切换按钮：天赋才能 / 日常技能 / 工作技能 / 特殊技能
- 默认显示「天赋才能」列表（特性/被动，无技能树）
- 后三种技能树默认只显示"图标 + 名称 + 等级条"
- 点击技能树后展开详细节点
- 每个技能树有独立经验条和技能点显示

##### 社交关系
- 顶部切换：关系列表 / 关系网络
- **关系列表**：按关系定位分组（家人/同学/朋友/同事等），列表式展示头像、名字、好感度
- **关系网络**：
  - 玩家位于中央，向四周放射
  - 角色显示圆形头像 + 名字 + 好感度
  - 玩家与角色之间直线连接，标注关系简称
  - 按关系分组划分区域（同学圈、家人圈等）
  - 支持滚轮缩放、拖拽平移
  - 头像之间不可重叠

##### 财富资产
- 顶部切换：近期开支 / 虚拟财产 / 固定产
- 近期开支：时间线/列表展示收入支出
- 虚拟财产：现金、账户余额、积分等
- 固定产：房产、车辆、物品等

##### 日历事件
- 顶部切换：日历 / 世界事件 / 周边事件
- 日历：月视图，日期上有事件标记点
- 世界事件：全球/城市级事件列表
- 周边事件：玩家身边发生的事件

##### 系统设置
- 暂时保留占位面板，显示"设置功能开发中"
- 不实现具体功能，但UI完整

### 5.3 中间叙事区（NarrativePanel）

#### 5.3.1 叙事输出区
- 占据中间区域约 80% 高度
- 背景使用稍暖的奶油色，带极淡纸张纹理
- 文本逐段展示，每段有轻微入场动画
- 支持区分叙事元素：
  - 场景描述：正文字体
  - 角色对话：左侧带角色头像 + 名字
  - 系统提示：居中小字，浅灰色
  - 选择支：按钮形式排列
- 自定义滚动条：细线 + 暖色滑块
- 底部渐变遮罩，暗示可继续滚动

#### 5.3.2 玩家输入区

固定在中间区域底部，结构为：

```
[功能集合按钮] [ 玩家输入框………………………… ] [发送按钮]
```

- **功能集合按钮**：位于输入框左侧，点击后向上展开功能菜单
  - 当前只包含「重新生成本轮消息」
  - 后续可扩展快捷指令、历史记录等
- **输入框**：多行文本，圆角，placeholder 示例：`"接下来你想做什么……"`
- **发送按钮**：纸飞机图标，点击时 scale(0.92) + 图标飞出效果
- 快捷动作按钮："环顾四周""与角色对话""移动"等

#### 5.3.3 默认内容
首次进入显示一段开场引导文本，例如：
> "你醒来时，窗外是四月的黄昏。远处传来电车的声音，风把窗帘吹得轻轻晃动。"

### 5.4 右侧面板（RightPanel）

从上到下分为三个区块。

#### 5.4.1 大地图（占右侧面板 2/5）
- 圆角卡片容器
- 单张大图，以玩家当前位置为中心
- 玩家标记为呼吸绿点
- 支持：
  - 滚轮缩放
  - 拖拽平移
  - 点击地图标记显示地点信息
  - 区域高亮
- 右下角按钮：点击展开全屏地图
- **全屏地图模式**：
  - 左侧地点列表
  - 右侧大地图
  - 可点击坐标点查看地理信息
  - 坐标范围：±110000（抽象网格坐标）

#### 5.4.2 场景印象图（占右侧面板 1/5）
- 显示当前地点/场景的插画/印象图
- 圆角 + 轻微阴影
- 下方标注当前地点名称
- 无图片时显示插画风格占位图 + 地点名

#### 5.4.3 通知列表 + 手机头部（占右侧面板 2/5）

**通知列表：**
- 最近通知列表
- 每条显示图标、标题、时间
- 点击展开详情
- 支持清空/标记已读

**手机头部：**
- 位于通知列表下方，显示被截断的手机顶部
- 点击后手机从底部向上浮出

**手机屏幕：**
- 上方：消息通知区，列表状
- 下方：APP 区，六个应用：
  - 新闻
  - 日程
  - 消息
  - 旅行
  - 邮件
  - 相册
- 点击每个 APP 打开对应全屏模态界面
- 设计风格参考 `F:\AI\gongcheng\手机.jfif`，现代圆润风格

---

## 6. 交互与动画设计

### 6.1 微交互清单

| 元素 | 交互效果 |
|------|----------|
| 图标条选项 | hover 底衬淡入 + 图标高亮；active scale(0.95) |
| 详情面板切换 | crossfade 淡入淡出，200ms |
| 技能树展开 | 高度动画 + 节点 stagger 入场 |
| 关系网节点 | hover 放大 1.1 + tooltip 显示关系详情 |
| 地图缩放 | transform scale，平滑过渡 |
| 手机浮出 | translateY 滑入 + 背景模糊遮罩 |
| 发送按钮 | 点击 scale(0.92) + 纸飞机飞出 |
| 功能集合按钮 | 点击旋转 45°，菜单项 stagger 出现 |
| 卡片 hover | translateY(-2px) + 阴影加深 |

### 6.2 动画参数

- 微交互时长：`150ms–300ms`
- 面板切换时长：`400ms`
- 标准缓动：`cubic-bezier(0.4, 0, 0.2, 1)`
- 弹性缓动：`cubic-bezier(0.34, 1.56, 0.64, 1)`
- 仅使用 `transform` 和 `opacity`，避免布局回流
- 尊重 `prefers-reduced-motion`

---

## 7. 数据结构设计

所有数据集中在 `src/data/mockData.ts`。

### 7.1 核心类型

```typescript
interface GameState {
  date: {
    year: number;
    month: number;
    day: number;
    weekday: string;    // e.g. "火曜日"
    weekdayCn: string;  // e.g. "周二"
  };
  time: {
    hour: number;
    minute: number;
    sky: 'sunny' | 'cloudy' | 'sunset' | 'night' | 'rain';
  };
  festival: {
    name: string;
    icon: string;
  } | null;
  player: {
    name: string;
    avatar: string;
    status: {
      stamina: number;
      mental: number;
      health: number;
    };
    bodyState: string;
    info: {
      birth: string;
      origin: string;
      household: string;
    };
  };
  talents: Talent[];
  skills: {
    daily: SkillTree[];
    work: SkillTree[];
    special: SkillTree[];
  };
  relationships: {
    list: Relation[];
    network: NetworkNode[];
  };
  finance: {
    expenses: Transaction[];
    virtualAssets: Asset[];
    fixedAssets: Asset[];
  };
  calendar: {
    calendarEvents: CalendarEvent[];
    worldEvents: WorldEvent[];
    nearbyEvents: NearbyEvent[];
  };
  notifications: Notification[];
  phoneApps: PhoneAppData;
  map: {
    center: { x: number; y: number };
    zoom: number;
    markers: MapMarker[];
    regions: Region[];
  };
}
```

### 7.2 数据填充策略

- 每个界面都有真实感的 Mock 数据
- 关系网角色使用 SVG 占位头像 + 中文名
- 地图标记、日历事件、收支记录都有具体示例
- 数据结构清晰，后续可无缝替换为 LLM 生成数据

---

## 8. 文件结构

```
F:\AI\no2\
├── public\
│   ├── map\
│   │   └── world-map.jpg          # 大地图图片（后续导入）
│   └── scenes\
│       └── classroom.jpg          # 场景印象图示例
├── src\
│   ├── app\
│   │   └── page.tsx               # 主游戏界面
│   ├── components\
│   │   ├── layout\
│   │   │   ├── TopBar.tsx
│   │   │   ├── LeftSidebar.tsx
│   │   │   ├── NarrativePanel.tsx
│   │   │   └── RightPanel.tsx
│   │   ├── modules\
│   │   │   ├── PersonalStatus.tsx
│   │   │   ├── TalentsSkills.tsx
│   │   │   ├── SocialRelations.tsx
│   │   │   ├── WealthAssets.tsx
│   │   │   ├── CalendarEvents.tsx
│   │   │   └── SystemSettings.tsx
│   │   ├── map\
│   │   │   ├── MiniMap.tsx
│   │   │   ├── FullMapModal.tsx
│   │   │   └── MapMarker.tsx
│   │   ├── phone\
│   │   │   ├── PhoneShell.tsx
│   │   │   ├── PhoneAppGrid.tsx
│   │   │   └── PhoneAppModal.tsx
│   │   └── ui\
│   │       ├── GlassCard.tsx
│   │       ├── IconButton.tsx
│   │       └── SkillTree.tsx
│   ├── context\
│   │   └── GameContext.tsx        # 全局状态管理
│   ├── data\
│   │   └── mockData.ts
│   ├── types\
│   │   └── index.ts
│   ├── hooks\
│   │   └── useGameState.ts
│   └── styles\
│       └── globals.css            # 设计 tokens
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 9. 性能与可访问性

### 9.1 语义化 HTML
- 使用 `header`、`main`、`nav`、`section`、`article`、`aside`
- 主内容区域使用 `main` 包裹
- 导航使用 `nav` + `ul/li`

### 9.2 唯一 ID
所有交互元素具有唯一描述性 ID，例如：
- `sidebar-status`
- `sidebar-talents`
- `narrative-input`
- `narrative-send-btn`
- `map-fullscreen-btn`
- `phone-toggle-btn`

### 9.3 性能优化
- 地图缩放使用 `transform: scale()`
- 关系网节点使用绝对定位，避免频繁重排
- 长列表虚拟化（当关系列表超过 50 条时）
- 图片使用 `loading="lazy"`
- 字体使用 `font-display: swap`
- 组件按需加载（地图、手机等可动态 import）

### 9.4 无障碍
- 所有图标按钮带 `aria-label`
- 焦点环清晰可见
- 支持 Tab 键盘导航
- 颜色对比度 ≥ 4.5:1
- 支持 `prefers-reduced-motion`

---

## 10. 边界与限制

### 10.1 本次范围
- 仅实现前端原型，无后端
- 使用 Mock 数据填充界面
- 系统设置模块为占位状态
- 手机 APP 内部为占位或示例内容

### 10.2 后续扩展点
- 接入 LLM 叙事生成
- 真实地图图片替换
- 角色头像图片替换
- 状态持久化 / 存档
- 暗色模式切换
- 手机 APP 深度功能

---

## 11. 设计决策记录

| 决策 | 选择 | 原因 |
|------|------|------|
| 视觉方向 | 黄昏电车暖调 | 符合 Galgame 情绪氛围，与碧蓝档案现代感融合 |
| 技术栈 | React + Vite + Tailwind + shadcn + Framer Motion | 轻量、动画强、组件化、易维护 |
| 架构 | 模块化组件 + Context | 平衡开发速度与可维护性 |
| 响应式 | 桌面为主，平板适配，手机端简化 | 信息密度高，不适合强行压缩 |
| 字体 | HarmonyOS Sans + LXGW WenKai + JetBrains Mono | 现代标题 + 温暖正文 + 等宽数字 |
| 地图坐标 | ±110000 抽象网格 | 用户指定，支持缩放定位 |
| 输入区 | 左侧功能集合按钮 + 输入框 + 发送按钮 | 用户提供明确需求 |

---

## 12. 待确认事项

当前设计已确认以下内容：
- [x] 视觉方向：黄昏电车暖调
- [x] 技术栈：React + Vite + Tailwind + shadcn + Framer Motion
- [x] 架构：模块化组件 + Context
- [x] 响应式策略：桌面为主
- [x] 字体方案
- [x] 地图系统需求
- [x] Mock 数据填充策略
- [x] 默认状态与核心流程
- [x] 输入区功能集合按钮设计

---

*本规格文档已通过设计评审，下一步进入实现计划阶段。*
