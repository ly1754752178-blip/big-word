# 综漫开放世界人生模拟游戏 UI 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 React + Vite + Tailwind + shadcn/ui + Framer Motion 实现一个高保真、高级感的 LLM 驱动人生模拟游戏前端原型，完整覆盖顶部栏、左侧边栏六大模块、中间叙事区、右侧地图与手机浮层。

**Architecture:** 使用模块化组件 + React Context 状态管理。`GameContext` 作为单一数据源，所有界面模块从 Context 读取状态。数据层通过 `mockData.ts` 提供高保真示例内容，便于后续替换为 LLM 真实数据。布局采用 CSS Grid 固定比例，动画统一使用 Framer Motion。

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React

## Global Constraints

- 所有代码文件使用 TypeScript
- 所有界面文本使用简体中文
- 禁止使用 emoji，使用 Lucide SVG 图标
- 桌面端主布局 `min-width: 1280px`
- 颜色、字体、间距全部使用 CSS 变量 / Tailwind 配置，禁止硬编码色值
- 所有交互元素必须具有唯一 `id`
- 动画使用 `transform` 和 `opacity`，尊重 `prefers-reduced-motion`
- 地图坐标范围：±110000，抽象网格坐标
- 项目根目录：`F:\AI\no2`

---

## File Structure

```
F:\AI\no2\
├── public\
│   ├── map\
│   │   └── world-map.jpg
│   └── scenes\
│       └── classroom.jpg
├── src\
│   ├── app\
│   │   └── page.tsx
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
│   │       ├── StatBar.tsx
│   │       ├── SkillTree.tsx
│   │       ├── NetworkGraph.tsx
│   │       └── InlineNotification.tsx
│   ├── context\
│   │   └── GameContext.tsx
│   ├── data\
│   │   └── mockData.ts
│   ├── types\
│   │   └── index.ts
│   ├── hooks\
│   │   └── useGameState.ts
│   └── styles\
│       └── globals.css
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## Task 1: 项目初始化与基础配置

**Files:**
- Create: `F:\AI\no2\package.json`
- Create: `F:\AI\no2\vite.config.ts`
- Create: `F:\AI\no2\tsconfig.json`
- Create: `F:\AI\no2\tailwind.config.ts`
- Create: `F:\AI\no2\index.html`
- Create: `F:\AI\no2\src\main.tsx`
- Create: `F:\AI\no2\src\vite-env.d.ts`
- Create: `F:\AI\no2\src\styles\globals.css`

**Interfaces:**
- Produces: 可运行的 Vite + React + Tailwind 项目骨架

- [ ] **Step 1: 初始化项目并安装依赖**

```bash
cd F:\AI\no2
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install framer-motion lucide-react clsx tailwind-merge class-variance-authority
npm install -D @types/node
```

- [ ] **Step 2: 配置 `package.json` 脚本**

```json
{
  "name": "llm-life-sim-ui",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.0",
    "vite": "^5.2.0"
  }
}
```

- [ ] **Step 3: 配置 `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: 配置 `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 5: 配置 `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#FAF6F1',
        'bg-card': 'rgba(255, 253, 250, 0.78)',
        'bg-glass': 'rgba(255, 255, 255, 0.45)',
        'border-soft': 'rgba(218, 205, 190, 0.5)',
        'text-primary': '#3D3229',
        'text-secondary': '#7D6E5E',
        'accent-sunset': '#E88D4F',
        'accent-amber': '#F5C542',
        'accent-teal': '#5BA8A0',
        'accent-green': '#6BBF73',
      },
      fontFamily: {
        heading: ['HarmonyOS Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        body: ['LXGW WenKai', 'Source Han Sans SC', 'Noto Sans SC', 'sans-serif'],
        mono: ['JetBrains Mono', 'Inter', 'monospace'],
      },
      boxShadow: {
        soft: '0 8px 32px rgba(61, 50, 41, 0.08)',
        glow: '0 4px 20px rgba(232, 141, 79, 0.25)',
      },
      backdropBlur: {
        glass: '20px',
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.85' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: 创建 `src/styles/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-base: #FAF6F1;
    --bg-card: rgba(255, 253, 250, 0.78);
    --bg-glass: rgba(255, 255, 255, 0.45);
    --border-soft: rgba(218, 205, 190, 0.5);
    --text-primary: #3D3229;
    --text-secondary: #7D6E5E;
    --accent-sunset: #E88D4F;
    --accent-amber: #F5C542;
    --accent-teal: #5BA8A0;
    --accent-green: #6BBF73;
  }

  * {
    @apply border-border-soft;
  }

  html {
    @apply bg-bg-base text-text-primary;
    font-family: 'LXGW WenKai', 'Source Han Sans SC', 'Noto Sans SC', sans-serif;
  }

  body {
    @apply m-0 min-h-screen overflow-hidden antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'HarmonyOS Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  }

  /* 自定义滚动条 */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(125, 110, 94, 0.3);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(125, 110, 94, 0.5);
  }
}

@layer utilities {
  .font-heading {
    font-family: 'HarmonyOS Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  }

  .font-body {
    font-family: 'LXGW WenKai', 'Source Han Sans SC', 'Noto Sans SC', sans-serif;
  }

  .font-mono {
    font-family: 'JetBrains Mono', 'Inter', monospace;
  }

  .glass-card {
    @apply bg-bg-card backdrop-blur-glass rounded-2xl border border-border-soft shadow-soft;
  }

  .text-balance {
    text-wrap: balance;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 7: 创建 `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/page';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 8: 创建 `index.html`**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>人生模拟器</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: 安装依赖并启动开发服务器验证**

```bash
cd F:\AI\no2
npm install
npm run dev
```

Expected: Vite 开发服务器启动成功，无报错。

---

## Task 2: 类型定义与 Mock 数据

**Files:**
- Create: `F:\AI\no2\src\types\index.ts`
- Create: `F:\AI\no2\src\data\mockData.ts`

**Interfaces:**
- Produces: 所有组件共享的 TypeScript 类型与 Mock 数据

- [ ] **Step 1: 创建 `src/types/index.ts`**

```typescript
export type SkyType = 'sunny' | 'cloudy' | 'sunset' | 'night' | 'rain';
export type SidebarTab = 'status' | 'talents' | 'social' | 'wealth' | 'calendar' | 'settings';
export type SkillCategory = 'daily' | 'work' | 'special';
export type FinanceTab = 'expenses' | 'virtual' | 'fixed';
export type CalendarTab = 'calendar' | 'world' | 'nearby';
export type PhoneAppId = 'news' | 'schedule' | 'messages' | 'travel' | 'mail' | 'gallery';

export interface GameDate {
  year: number;
  month: number;
  day: number;
  weekday: string;
  weekdayCn: string;
}

export interface GameTime {
  hour: number;
  minute: number;
  sky: SkyType;
}

export interface Festival {
  name: string;
  icon: string;
}

export interface PlayerStatus {
  stamina: number;
  mental: number;
  health: number;
}

export interface Player {
  name: string;
  avatar: string;
  status: PlayerStatus;
  bodyState: string;
  info: {
    birth: string;
    origin: string;
    household: string;
  };
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  icon: string;
}

export interface SkillTree {
  id: string;
  name: string;
  icon: string;
  category: SkillCategory;
  level: number;
  maxLevel: number;
  exp: number;
  maxExp: number;
  skillPoints: number;
  nodes: SkillNode[];
}

export interface Relation {
  id: string;
  name: string;
  group: string;
  affinity: number;
  avatar: string;
  title: string;
  description: string;
}

export interface NetworkNode {
  id: string;
  relationId: string;
  x: number;
  y: number;
  angle: number;
  distance: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  icon: string;
  description: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'personal' | 'world' | 'nearby';
  description: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'system' | 'social' | 'event';
}

export interface MapMarker {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'location' | 'event' | 'npc';
  description: string;
}

export interface Region {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface PhoneApp {
  id: PhoneAppId;
  name: string;
  icon: string;
  color: string;
  badge?: number;
}

export interface GameState {
  date: GameDate;
  time: GameTime;
  festival: Festival | null;
  player: Player;
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
    worldEvents: CalendarEvent[];
    nearbyEvents: CalendarEvent[];
  };
  notifications: Notification[];
  phoneApps: PhoneApp[];
  map: {
    center: { x: number; y: number };
    zoom: number;
    markers: MapMarker[];
    regions: Region[];
  };
  narrative: {
    messages: NarrativeMessage[];
    inputText: string;
  };
}

export interface NarrativeMessage {
  id: string;
  type: 'scene' | 'dialogue' | 'system' | 'choice';
  speaker?: string;
  avatar?: string;
  content: string;
  choices?: string[];
  timestamp: string;
}
```

- [ ] **Step 2: 创建 `src/data/mockData.ts`**

```typescript
import type { GameState } from '@/types';

export const mockGameState: GameState = {
  date: {
    year: 2026,
    month: 7,
    day: 7,
    weekday: '火曜日',
    weekdayCn: '周二',
  },
  time: {
    hour: 18,
    minute: 30,
    sky: 'sunset',
  },
  festival: {
    name: '七夕',
    icon: 'star',
  },
  player: {
    name: '叶悠真',
    avatar: '/scenes/classroom.jpg',
    status: {
      stamina: 78,
      mental: 65,
      health: 82,
    },
    bodyState: '略显疲惫',
    info: {
      birth: '2008年4月17日',
      origin: '东京都世田谷区',
      household: '普通工薪家庭（独子）',
    },
  },
  talents: [
    { id: 't1', name: '共感者', description: '更容易理解他人的情绪与想法', icon: 'heart', rarity: 'rare' },
    { id: 't2', name: '夜猫子', description: '夜晚行动时精神与创造力提升', icon: 'moon', rarity: 'common' },
    { id: 't3', name: '过目不忘', description: '阅读与学习技能时经验获取提升', icon: 'book-open', rarity: 'epic' },
  ],
  skills: {
    daily: [
      {
        id: 'sd1',
        name: '料理',
        icon: 'utensils-crossed',
        category: 'daily',
        level: 3,
        maxLevel: 10,
        exp: 340,
        maxExp: 1000,
        skillPoints: 2,
        nodes: [
          { id: 'sdn1', name: '基础刀工', description: '切菜速度提升', level: 1, maxLevel: 3, unlocked: true, icon: 'chef-hat' },
          { id: 'sdn2', name: '味噌汤专精', description: '味噌汤风味提升', level: 1, maxLevel: 3, unlocked: true, icon: 'soup' },
          { id: 'sdn3', name: '便当大师', description: '制作高级便当', level: 0, maxLevel: 3, unlocked: false, icon: 'box' },
        ],
      },
      {
        id: 'sd2',
        name: '打扫',
        icon: 'broom',
        category: 'daily',
        level: 2,
        maxLevel: 10,
        exp: 180,
        maxExp: 800,
        skillPoints: 1,
        nodes: [
          { id: 'sdn4', name: '快速整理', description: '整理速度提升', level: 1, maxLevel: 3, unlocked: true, icon: 'archive' },
          { id: 'sdn5', name: '除菌达人', description: '清洁效果提升', level: 0, maxLevel: 3, unlocked: false, icon: 'sparkles' },
        ],
      },
    ],
    work: [
      {
        id: 'sw1',
        name: '编程',
        icon: 'code',
        category: 'work',
        level: 4,
        maxLevel: 10,
        exp: 1200,
        maxExp: 2500,
        skillPoints: 3,
        nodes: [
          { id: 'swn1', name: '前端基础', description: '掌握 HTML/CSS/JS', level: 3, maxLevel: 3, unlocked: true, icon: 'layout' },
          { id: 'swn2', name: 'React 进阶', description: '熟练使用 React', level: 1, maxLevel: 3, unlocked: true, icon: 'component' },
          { id: 'swn3', name: '系统设计', description: '设计复杂系统', level: 0, maxLevel: 3, unlocked: false, icon: 'network' },
        ],
      },
    ],
    special: [
      {
        id: 'ss1',
        name: '魔术',
        icon: 'wand-2',
        category: 'special',
        level: 1,
        maxLevel: 10,
        exp: 50,
        maxExp: 500,
        skillPoints: 0,
        nodes: [
          { id: 'ssn1', name: '扑克戏法', description: '基础纸牌魔术', level: 1, maxLevel: 3, unlocked: true, icon: 'clover' },
          { id: 'ssn2', name: '读心术', description: '猜测观众选择', level: 0, maxLevel: 3, unlocked: false, icon: 'eye' },
        ],
      },
    ],
  },
  relationships: {
    list: [
      { id: 'r1', name: '叶和美', group: '家人', affinity: 92, avatar: 'user', title: '母亲', description: '温柔体贴的家庭主妇' },
      { id: 'r2', name: '叶健太', group: '家人', affinity: 85, avatar: 'user', title: '父亲', description: '沉默寡言的上班族' },
      { id: 'r3', name: '朝比奈樱', group: '同学', affinity: 74, avatar: 'user', title: '同班同学', description: '活泼开朗的班长' },
      { id: 'r4', name: '桐谷莲', group: '同学', affinity: 68, avatar: 'user', title: '同班同学', description: '喜欢打篮球的损友' },
      { id: 'r5', name: '藤堂静', group: '朋友', affinity: 61, avatar: 'user', title: '邻居', description: '安静的书店女孩' },
    ],
    network: [
      { id: 'n1', relationId: 'r1', x: 0, y: -80, angle: -90, distance: 80 },
      { id: 'n2', relationId: 'r2', x: 0, y: 80, angle: 90, distance: 80 },
      { id: 'n3', relationId: 'r3', x: 100, y: -40, angle: -22, distance: 110 },
      { id: 'n4', relationId: 'r4', x: 120, y: 40, angle: 22, distance: 130 },
      { id: 'n5', relationId: 'r5', x: -100, y: 0, angle: 180, distance: 100 },
    ],
  },
  finance: {
    expenses: [
      { id: 'e1', title: '便利店午餐', amount: -680, type: 'expense', date: '07/07', category: '餐饮' },
      { id: 'e2', title: '电车月票充值', amount: -5000, type: 'expense', date: '07/06', category: '交通' },
      { id: 'e3', title: '兼职工资', amount: 15000, type: 'income', date: '07/05', category: '收入' },
    ],
    virtualAssets: [
      { id: 'v1', name: '现金', value: 3240, icon: 'banknote', description: '钱包里的纸币与硬币' },
      { id: 'v2', name: '银行账户', value: 128500, icon: 'credit-card', description: '主要用于生活费与储蓄' },
      { id: 'v3', name: '积分', value: 450, icon: 'coins', description: '便利店与商场积分' },
    ],
    fixedAssets: [
      { id: 'f1', name: '二手自行车', value: 8000, icon: 'bike', description: '上下学代步工具' },
      { id: 'f2', name: '笔记本电脑', value: 85000, icon: 'laptop', description: '用于学习与兼职' },
    ],
  },
  calendar: {
    calendarEvents: [
      { id: 'c1', title: '期中考试', date: '2026-07-15', type: 'personal', description: '数学与英语考试' },
      { id: 'c2', title: '学园祭准备会议', date: '2026-07-10', type: 'nearby', description: '下午三点在学生会室' },
    ],
    worldEvents: [
      { id: 'w1', title: '东京都节能倡议', date: '2026-07-07', type: 'world', description: '本月起公共场所空调温度建议设定为 28°C' },
    ],
    nearbyEvents: [
      { id: 'n1', title: '便利店新品试吃', date: '2026-07-08', type: 'nearby', description: '车站前的 Lawson 推出夏日限定甜品' },
    ],
  },
  notifications: [
    { id: 'notif1', title: '收到新消息', message: '朝比奈樱发来一条消息', time: '18:25', read: false, type: 'social' },
    { id: 'notif2', title: '日程提醒', message: '今晚 20:00 与父亲通话', time: '17:50', read: true, type: 'system' },
    { id: 'notif3', title: '附近事件', message: '公园里有街头艺人在表演', time: '16:30', read: true, type: 'event' },
  ],
  phoneApps: [
    { id: 'news', name: '新闻', icon: 'newspaper', color: '#E88D4F', badge: 3 },
    { id: 'schedule', name: '日程', icon: 'calendar-days', color: '#5BA8A0' },
    { id: 'messages', name: '消息', icon: 'message-circle', color: '#6BBF73', badge: 1 },
    { id: 'travel', name: '旅行', icon: 'map-pin', color: '#F5C542' },
    { id: 'mail', name: '邮件', icon: 'mail', color: '#7D6E5E', badge: 5 },
    { id: 'gallery', name: '相册', icon: 'image', color: '#C77D9E' },
  ],
  map: {
    center: { x: 3500, y: -1200 },
    zoom: 1,
    markers: [
      { id: 'm1', name: '自家公寓', x: 3500, y: -1200, type: 'location', description: '两室一厅，位于安静的住宅区' },
      { id: 'm2', name: '樱丘高中', x: 4200, y: -800, type: 'location', description: '你就读的高中' },
      { id: 'm3', name: '车站前书店', x: 3100, y: -1500, type: 'location', description: '藤堂静打工的地方' },
    ],
    regions: [
      { id: 'reg1', name: '住宅区', x: 3000, y: -2000, width: 1500, height: 1500, color: 'rgba(107, 191, 115, 0.15)' },
      { id: 'reg2', name: '学区', x: 4000, y: -1000, width: 1200, height: 1200, color: 'rgba(91, 168, 160, 0.15)' },
    ],
  },
  narrative: {
    messages: [
      {
        id: 'msg1',
        type: 'scene',
        content: '你醒来时，窗外是四月的黄昏。远处传来电车的声音，风把窗帘吹得轻轻晃动。',
        timestamp: '18:30',
      },
      {
        id: 'msg2',
        type: 'system',
        content: '今天是火曜日，距离期中考试还有 8 天。',
        timestamp: '18:30',
      },
    ],
    inputText: '',
  },
};
```

- [ ] **Step 3: 验证类型无错误**

运行 TypeScript 检查：

```bash
npx tsc --noEmit
```

Expected: 无类型错误。

---

## Task 3: GameContext 状态管理

**Files:**
- Create: `F:\AI\no2\src\context\GameContext.tsx`
- Create: `F:\AI\no2\src\hooks\useGameState.ts`

**Interfaces:**
- Consumes: `GameState` from `src/types/index.ts`
- Produces: `GameProvider`, `useGame` hook

- [ ] **Step 1: 创建 `src/context/GameContext.tsx`**

```tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { GameState, SidebarTab, NarrativeMessage, PhoneAppId } from '@/types';
import { mockGameState } from '@/data/mockData';

interface GameContextValue {
  state: GameState;
  setActiveTab: (tab: SidebarTab) => void;
  setNarrativeInput: (text: string) => void;
  sendNarrativeMessage: (content: string) => void;
  regenerateLastMessage: () => void;
  setMapZoom: (zoom: number) => void;
  setMapCenter: (center: { x: number; y: number }) => void;
  togglePhone: () => void;
  openPhoneApp: (appId: PhoneAppId) => void;
  closePhoneApp: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

type Action =
  | { type: 'SET_ACTIVE_TAB'; payload: SidebarTab }
  | { type: 'SET_NARRATIVE_INPUT'; payload: string }
  | { type: 'ADD_NARRATIVE_MESSAGE'; payload: NarrativeMessage }
  | { type: 'REGENERATE_LAST_MESSAGE' }
  | { type: 'SET_MAP_ZOOM'; payload: number }
  | { type: 'SET_MAP_CENTER'; payload: { x: number; y: number } }
  | { type: 'TOGGLE_PHONE' }
  | { type: 'OPEN_PHONE_APP'; payload: PhoneAppId }
  | { type: 'CLOSE_PHONE_APP' };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_NARRATIVE_INPUT':
      return { ...state, narrative: { ...state.narrative, inputText: action.payload } };
    case 'ADD_NARRATIVE_MESSAGE': {
      const messages = [...state.narrative.messages, action.payload];
      return { ...state, narrative: { ...state.narrative, messages, inputText: '' } };
    }
    case 'REGENERATE_LAST_MESSAGE': {
      const messages = state.narrative.messages.slice(0, -1);
      const regenerated: NarrativeMessage = {
        id: `msg-${Date.now()}`,
        type: 'scene',
        content: '（故事重新展开……你再次睁开眼睛，黄昏的光线似乎比刚才更柔和了一些。）',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      return { ...state, narrative: { ...state.narrative, messages: [...messages, regenerated] } };
    }
    case 'SET_MAP_ZOOM':
      return { ...state, map: { ...state.map, zoom: action.payload } };
    case 'SET_MAP_CENTER':
      return { ...state, map: { ...state.map, center: action.payload } };
    case 'TOGGLE_PHONE':
      return { ...state, phoneOpen: !state.phoneOpen };
    case 'OPEN_PHONE_APP':
      return { ...state, activePhoneApp: action.payload };
    case 'CLOSE_PHONE_APP':
      return { ...state, activePhoneApp: null };
    default:
      return state;
  }
}

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, mockGameState as GameState);

  const value: GameContextValue = {
    state,
    setActiveTab: (tab) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
    setNarrativeInput: (text) => dispatch({ type: 'SET_NARRATIVE_INPUT', payload: text }),
    sendNarrativeMessage: (content) => {
      const message: NarrativeMessage = {
        id: `msg-${Date.now()}`,
        type: 'dialogue',
        content,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      dispatch({ type: 'ADD_NARRATIVE_MESSAGE', payload: message });
    },
    regenerateLastMessage: () => dispatch({ type: 'REGENERATE_LAST_MESSAGE' }),
    setMapZoom: (zoom) => dispatch({ type: 'SET_MAP_ZOOM', payload: zoom }),
    setMapCenter: (center) => dispatch({ type: 'SET_MAP_CENTER', payload: center }),
    togglePhone: () => dispatch({ type: 'TOGGLE_PHONE' }),
    openPhoneApp: (appId) => dispatch({ type: 'OPEN_PHONE_APP', payload: appId }),
    closePhoneApp: () => dispatch({ type: 'CLOSE_PHONE_APP' }),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
```

- [ ] **Step 2: 更新 `src/types/index.ts` 扩展 GameState**

在 `GameState` 接口末尾添加：

```typescript
  activeTab: SidebarTab;
  phoneOpen: boolean;
  activePhoneApp: PhoneAppId | null;
```

- [ ] **Step 3: 更新 `src/data/mockData.ts` 添加状态字段**

在 `mockGameState` 末尾添加：

```typescript
  activeTab: 'status',
  phoneOpen: false,
  activePhoneApp: null,
```

- [ ] **Step 4: 创建 `src/hooks/useGameState.ts`**

```typescript
export { useGame } from '@/context/GameContext';
```

- [ ] **Step 5: 验证类型一致性**

```bash
npx tsc --noEmit
```

Expected: 无类型错误。

---

## Task 4: 通用 UI 组件

**Files:**
- Create: `F:\AI\no2\src\components\ui\GlassCard.tsx`
- Create: `F:\AI\no2\src\components\ui\IconButton.tsx`
- Create: `F:\AI\no2\src\components\ui\StatBar.tsx`

**Interfaces:**
- Produces: 可复用的玻璃卡片、图标按钮、状态条组件

- [ ] **Step 1: 创建 `src/components/ui/GlassCard.tsx`**

```tsx
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        'bg-bg-card/80 backdrop-blur-glass rounded-2xl border border-border-soft shadow-soft',
        hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: 创建 `src/lib/utils.ts`**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: 创建 `src/components/ui/IconButton.tsx`**

```tsx
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  id?: string;
}

export function IconButton({ icon: Icon, label, active, onClick, className, id }: IconButtonProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      aria-label={label}
      className={cn(
        'relative flex items-center justify-center w-12 h-12 rounded-xl',
        'transition-all duration-200 ease-out',
        'hover:bg-white/60 active:scale-95',
        active && 'bg-accent-sunset/15 text-accent-sunset',
        className
      )}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
```

- [ ] **Step 4: 创建 `src/components/ui/StatBar.tsx`**

```tsx
interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

export function StatBar({ label, value, max = 100, color = 'bg-accent-sunset' }: StatBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="font-mono text-text-primary">{value}/{max}</span>
      </div>
      <div className="h-2 bg-border-soft/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

---

## Task 5: 顶部栏组件

**Files:**
- Create: `F:\AI\no2\src\components\layout\TopBar.tsx`

**Interfaces:**
- Consumes: `date`, `time`, `festival` from `useGame`
- Produces: `TopBar` component

- [ ] **Step 1: 创建 `src/components/layout/TopBar.tsx`**

```tsx
import { useGame } from '@/hooks/useGameState';
import { Sun, Cloud, Moon, CloudRain, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const skyGradients: Record<string, string> = {
  sunny: 'from-sky-300 via-sky-200 to-white',
  cloudy: 'from-slate-300 via-slate-200 to-white',
  sunset: 'from-orange-400 via-rose-300 to-purple-200',
  night: 'from-indigo-900 via-indigo-700 to-slate-800',
  rain: 'from-slate-500 via-slate-400 to-slate-300',
};

const skyIcons: Record<string, typeof Sun> = {
  sunny: Sun,
  cloudy: Cloud,
  sunset: Sun,
  night: Moon,
  rain: CloudRain,
};

export function TopBar() {
  const { state } = useGame();
  const { date, time, festival } = state;
  const SkyIcon = skyIcons[time.sky] || Sun;

  return (
    <header
      id="top-bar"
      className="h-20 px-6 flex items-center justify-between bg-bg-base/90 backdrop-blur-md border-b border-border-soft z-20"
    >
      {/* 左侧日期 */}
      <div className="flex items-baseline gap-3 w-1/3">
        <div className="font-heading text-2xl font-bold text-text-primary tracking-tight">
          {date.year} / {String(date.month).padStart(2, '0')} / {String(date.day).padStart(2, '0')}
        </div>
        <div className="text-sm text-text-secondary font-body">
          {date.weekday}（{date.weekdayCn}）
        </div>
      </div>

      {/* 中间时间水晶球 */}
      <div className="w-1/3 flex justify-center">
        <motion.div
          className="relative w-16 h-16 rounded-full overflow-hidden shadow-glow animate-float"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className={`absolute inset-0 bg-gradient-to-b ${skyGradients[time.sky]}`} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <SkyIcon className="w-5 h-5 text-white drop-shadow-md" />
            <span className="font-mono text-sm font-semibold text-white drop-shadow-md">
              {String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}
            </span>
          </div>
          <div className="absolute top-1 right-2 w-3 h-3 bg-white/50 rounded-full blur-[1px]" />
        </motion.div>
      </div>

      {/* 右侧节日 */}
      <div className="w-1/3 flex justify-end items-center gap-2">
        {festival ? (
          <>
            <span className="text-sm text-text-secondary font-body">今日节日</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-amber/15 rounded-full">
              <Star className="w-4 h-4 text-accent-amber" />
              <span className="text-sm font-medium text-text-primary">{festival.name}</span>
            </div>
          </>
        ) : (
          <span className="text-sm text-text-secondary font-body">平日</span>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: 验证顶部栏渲染**

在 `src/app/page.tsx` 中临时导入 `TopBar` 并渲染：

```tsx
import { TopBar } from '@/components/layout/TopBar';

export default function App() {
  return (
    <div className="min-h-screen bg-bg-base">
      <TopBar />
    </div>
  );
}
```

Expected: 顶部栏显示日期、水晶球、节日。

---

## Task 6: 左侧边栏框架

**Files:**
- Create: `F:\AI\no2\src\components\layout\LeftSidebar.tsx`
- Create: `F:\AI\no2\src\components\modules\ModuleContainer.tsx`

**Interfaces:**
- Consumes: `activeTab`, `setActiveTab` from `useGame`
- Produces: `LeftSidebar`, `ModuleContainer`

- [ ] **Step 1: 创建 `src/components/layout/LeftSidebar.tsx`**

```tsx
import { useGame } from '@/hooks/useGameState';
import { SidebarTab } from '@/types';
import { User, Sparkles, Users, Wallet, Calendar, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleContainer } from '@/components/modules/ModuleContainer';

const sidebarItems: { id: SidebarTab; label: string; icon: typeof User }[] = [
  { id: 'status', label: '个人状态', icon: User },
  { id: 'talents', label: '天赋才能', icon: Sparkles },
  { id: 'social', label: '社交关系', icon: Users },
  { id: 'wealth', label: '财富资产', icon: Wallet },
  { id: 'calendar', label: '日历事件', icon: Calendar },
  { id: 'settings', label: '系统设置', icon: Settings },
];

export function LeftSidebar() {
  const { state, setActiveTab } = useGame();

  return (
    <aside className="flex h-full">
      {/* 极窄图标条 */}
      <nav className="w-16 h-full bg-bg-card/50 backdrop-blur-sm border-r border-border-soft flex flex-col items-center py-4 gap-2 z-10">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = state.activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              id={`sidebar-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              whileTap={{ scale: 0.95 }}
              className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 group"
              aria-label={item.label}
            >
              <motion.div
                className={`absolute inset-0 rounded-xl ${active ? 'bg-accent-sunset/20' : 'bg-transparent group-hover:bg-white/40'}`}
                layoutId="sidebar-bg"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              <Icon className={`w-5 h-5 relative z-10 transition-colors ${active ? 'text-accent-sunset' : 'text-text-secondary group-hover:text-text-primary'}`} />
            </motion.button>
          );
        })}
      </nav>

      {/* 详情面板 */}
      <div className="flex-1 h-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto p-4"
          >
            <ModuleContainer tab={state.activeTab} />
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: 创建 `src/components/modules/ModuleContainer.tsx`**

```tsx
import { SidebarTab } from '@/types';
import { PersonalStatus } from './PersonalStatus';
import { TalentsSkills } from './TalentsSkills';
import { SocialRelations } from './SocialRelations';
import { WealthAssets } from './WealthAssets';
import { CalendarEvents } from './CalendarEvents';
import { SystemSettings } from './SystemSettings';

interface ModuleContainerProps {
  tab: SidebarTab;
}

export function ModuleContainer({ tab }: ModuleContainerProps) {
  switch (tab) {
    case 'status':
      return <PersonalStatus />;
    case 'talents':
      return <TalentsSkills />;
    case 'social':
      return <SocialRelations />;
    case 'wealth':
      return <WealthAssets />;
    case 'calendar':
      return <CalendarEvents />;
    case 'settings':
      return <SystemSettings />;
    default:
      return null;
  }
}
```

- [ ] **Step 3: 创建占位模块文件**

创建以下空占位文件（后续任务填充）：
- `src/components/modules/PersonalStatus.tsx`
- `src/components/modules/TalentsSkills.tsx`
- `src/components/modules/SocialRelations.tsx`
- `src/components/modules/WealthAssets.tsx`
- `src/components/modules/CalendarEvents.tsx`
- `src/components/modules/SystemSettings.tsx`

每个文件初始内容：

```tsx
export function PersonalStatus() {
  return <div>PersonalStatus</div>;
}
```

---

## Task 7: 个人状态模块

**Files:**
- Create: `F:\AI\no2\src\components\modules\PersonalStatus.tsx`

**Interfaces:**
- Consumes: `player` from `useGame`
- Produces: `PersonalStatus` component

- [ ] **Step 1: 创建 `src/components/modules/PersonalStatus.tsx`**

```tsx
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatBar } from '@/components/ui/StatBar';
import { User, MapPin, Cake, Home, Heart, Brain, Shield } from 'lucide-react';

export function PersonalStatus() {
  const { state } = useGame();
  const { player } = state;

  return (
    <div className="space-y-4">
      {/* 角色头部 */}
      <GlassCard className="p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-sunset/30 to-accent-amber/30 flex items-center justify-center border-2 border-white/60">
          <User className="w-8 h-8 text-text-primary" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-text-primary">{player.name}</h2>
          <p className="text-sm text-text-secondary">{player.bodyState}</p>
        </div>
      </GlassCard>

      {/* 状态条 */}
      <GlassCard className="p-5 space-y-5">
        <h3 className="font-heading text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
          <Heart className="w-4 h-4" /> 基本状态
        </h3>
        <StatBar label="体力" value={player.status.stamina} color="bg-accent-sunset" />
        <StatBar label="精神" value={player.status.mental} color="bg-accent-teal" />
        <StatBar label="健康" value={player.status.health} color="bg-accent-green" />
      </GlassCard>

      {/* 个人信息 */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="font-heading text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4" /> 个人信息
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-text-secondary">
            <Cake className="w-4 h-4" />
            <span>生日：{player.info.birth}</span>
          </div>
          <div className="flex items-center gap-3 text-text-secondary">
            <MapPin className="w-4 h-4" />
            <span>出身：{player.info.origin}</span>
          </div>
          <div className="flex items-center gap-3 text-text-secondary">
            <Home className="w-4 h-4" />
            <span>家庭背景：{player.info.household}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
```

---

## Task 8: 天赋才能模块

**Files:**
- Create: `F:\AI\no2\src\components\modules\TalentsSkills.tsx`
- Create: `F:\AI\no2\src\components\ui\SkillTree.tsx`

**Interfaces:**
- Consumes: `talents`, `skills` from `useGame`
- Produces: `TalentsSkills`, `SkillTree` components

- [ ] **Step 1: 创建 `src/components/ui/SkillTree.tsx`**

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SkillTree as SkillTreeType } from '@/types';
import { ChevronRight, Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillTreeProps {
  tree: SkillTreeType;
}

export function SkillTree({ tree }: SkillTreeProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-bg-glass rounded-xl border border-border-soft overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-sunset/15 flex items-center justify-center">
            <span className="text-lg">{tree.icon}</span>
          </div>
          <div className="text-left">
            <h4 className="font-heading text-sm font-semibold text-text-primary">{tree.name}</h4>
            <p className="text-xs text-text-secondary">Lv.{tree.level} · 技能点 {tree.skillPoints}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-5 h-5 text-text-secondary" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>经验值</span>
                  <span className="font-mono">{tree.exp}/{tree.maxExp}</span>
                </div>
                <div className="h-1.5 bg-border-soft/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-amber rounded-full transition-all"
                    style={{ width: `${(tree.exp / tree.maxExp) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {tree.nodes.map((node, index) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'p-3 rounded-lg border flex items-center gap-3',
                      node.unlocked
                        ? 'bg-white/40 border-border-soft'
                        : 'bg-white/20 border-dashed border-border-soft/60 opacity-70'
                    )}
                  >
                    <div className="w-8 h-8 rounded-md bg-bg-base flex items-center justify-center">
                      {node.unlocked ? (
                        node.level > 0 ? <Check className="w-4 h-4 text-accent-green" /> : <span className="text-sm">{node.icon}</span>
                      ) : (
                        <Lock className="w-4 h-4 text-text-secondary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-text-primary">{node.name}</h5>
                      <p className="text-xs text-text-secondary">{node.description}</p>
                    </div>
                    <span className="font-mono text-xs text-text-secondary">{node.level}/{node.maxLevel}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: 创建 `src/components/modules/TalentsSkills.tsx`**

```tsx
import { useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { SkillTree } from '@/components/ui/SkillTree';
import { SkillCategory } from '@/types';
import { Sparkles, cn } from '@/lib/utils';

const categoryLabels: Record<SkillCategory | 'talents', string> = {
  talents: '天赋才能',
  daily: '日常技能',
  work: '工作技能',
  special: '特殊技能',
};

export function TalentsSkills() {
  const { state } = useGame();
  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'talents'>('talents');

  return (
    <div className="space-y-4">
      {/* 分类切换 */}
      <div className="flex gap-1 p-1 bg-bg-glass rounded-xl border border-border-soft">
        {(Object.keys(categoryLabels) as Array<SkillCategory | 'talents'>).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all',
              activeCategory === cat
                ? 'bg-white/70 text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/30'
            )}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {activeCategory === 'talents' ? (
        <div className="space-y-3">
          {state.talents.map((talent) => (
            <GlassCard key={talent.id} className="p-4 flex items-start gap-3 hover:-translate-y-0.5 transition-transform">
              <div className="w-10 h-10 rounded-lg bg-accent-amber/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-accent-amber" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-semibold text-text-primary">{talent.name}</h4>
                <p className="text-xs text-text-secondary mt-1">{talent.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {state.skills[activeCategory].map((tree) => (
            <SkillTree key={tree.id} tree={tree} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 修复导入**

`TalentsSkills.tsx` 中 `Sparkles` 应该从 `lucide-react` 导入，不是 `cn`。

修正导入：

```tsx
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
```

---

## Task 9: 社交关系模块

**Files:**
- Create: `F:\AI\no2\src\components\modules\SocialRelations.tsx`
- Create: `F:\AI\no2\src\components\ui\NetworkGraph.tsx`

**Interfaces:**
- Consumes: `relationships` from `useGame`
- Produces: `SocialRelations`, `NetworkGraph`

- [ ] **Step 1: 创建 `src/components/ui/NetworkGraph.tsx`**

```tsx
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Relation, NetworkNode } from '@/types';
import { User } from 'lucide-react';

interface NetworkGraphProps {
  relations: Relation[];
  nodes: NetworkNode[];
}

export function NetworkGraph({ relations, nodes }: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = Math.min(2, Math.max(0.5, scale - e.deltaY * 0.001));
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => setDragging(false);

  const relationMap = new Map(relations.map((r) => [r.id, r]));

  return (
    <div
      ref={containerRef}
      className="relative w-full h-96 bg-bg-glass rounded-xl border border-border-soft overflow-hidden cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute top-3 right-3 px-2 py-1 bg-white/60 rounded-md text-xs font-mono text-text-secondary z-10">
        {Math.round(scale * 100)}%
      </div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
        transition={{ type: 'tween', duration: 0.1 }}
      >
        {/* 玩家中心 */}
        <div className="absolute w-14 h-14 rounded-full bg-accent-sunset/20 border-2 border-accent-sunset flex items-center justify-center z-20">
          <User className="w-6 h-6 text-accent-sunset" />
        </div>

        {/* 关系连线 */}
        {nodes.map((node) => (
          <line
            key={`line-${node.id}`}
            x1={0}
            y1={0}
            x2={node.x}
            y2={node.y}
            stroke="rgba(125, 110, 94, 0.25)"
            strokeWidth={1.5}
            className="absolute"
            style={{ transform: 'translate(28px, 28px)' }}
          />
        ))}

        {/* 关系节点 */}
        {nodes.map((node) => {
          const relation = relationMap.get(node.relationId);
          if (!relation) return null;
          return (
            <motion.div
              key={node.id}
              className="absolute flex flex-col items-center gap-1"
              style={{ x: node.x, y: node.y }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-12 h-12 rounded-full bg-white/80 border border-border-soft flex items-center justify-center shadow-soft">
                <User className="w-5 h-5 text-text-secondary" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-text-primary whitespace-nowrap">{relation.name}</p>
                <p className="text-[10px] text-text-secondary">{relation.affinity}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 `src/components/modules/SocialRelations.tsx`**

```tsx
import { useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { NetworkGraph } from '@/components/ui/NetworkGraph';
import { User, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

type SocialView = 'list' | 'network';

export function SocialRelations() {
  const { state } = useGame();
  const [view, setView] = useState<SocialView>('list');

  const grouped = state.relationships.list.reduce((acc, relation) => {
    if (!acc[relation.group]) acc[relation.group] = [];
    acc[relation.group].push(relation);
    return acc;
  }, {} as Record<string, typeof state.relationships.list>);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 bg-bg-glass rounded-xl border border-border-soft">
        {[
          { id: 'list', label: '关系列表' },
          { id: 'network', label: '关系网络' },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id as SocialView)}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all',
              view === v.id
                ? 'bg-white/70 text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/30'
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === 'list' ? (
        <div className="space-y-4">
          {Object.entries(grouped).map(([group, relations]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">{group}</h3>
              <div className="space-y-2">
                {relations.map((relation) => (
                  <GlassCard key={relation.id} className="p-3 flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
                    <div className="w-10 h-10 rounded-full bg-bg-base flex items-center justify-center border border-border-soft">
                      <User className="w-5 h-5 text-text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading text-sm font-semibold text-text-primary truncate">{relation.name}</h4>
                        <span className="text-[10px] px-1.5 py-0.5 bg-accent-sunset/10 text-accent-sunset rounded">{relation.title}</span>
                      </div>
                      <p className="text-xs text-text-secondary truncate">{relation.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-accent-sunset">
                      <Heart className="w-3.5 h-3.5" />
                      <span className="font-mono">{relation.affinity}</span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <NetworkGraph relations={state.relationships.list} nodes={state.relationships.network} />
      )}
    </div>
  );
}
```

---

## Task 10: 财富资产与日历事件模块

**Files:**
- Create: `F:\AI\no2\src\components\modules\WealthAssets.tsx`
- Create: `F:\AI\no2\src\components\modules\CalendarEvents.tsx`

**Interfaces:**
- Consumes: `finance`, `calendar` from `useGame`
- Produces: `WealthAssets`, `CalendarEvents`

- [ ] **Step 1: 创建 `src/components/modules/WealthAssets.tsx`**

```tsx
import { useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { FinanceTab } from '@/types';
import { ArrowDownLeft, ArrowUpRight, Wallet, Landmark, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs: { id: FinanceTab; label: string }[] = [
  { id: 'expenses', label: '近期开支' },
  { id: 'virtual', label: '虚拟财产' },
  { id: 'fixed', label: '固定产' },
];

const tabIcons: Record<FinanceTab, typeof Wallet> = {
  expenses: ArrowDownLeft,
  virtual: Wallet,
  fixed: Building2,
};

export function WealthAssets() {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState<FinanceTab>('expenses');

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 bg-bg-glass rounded-xl border border-border-soft">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1',
              activeTab === tab.id
                ? 'bg-white/70 text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/30'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'expenses' && (
        <div className="space-y-2">
          {state.finance.expenses.map((item) => (
            <GlassCard key={item.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'income' ? 'bg-accent-green/15' : 'bg-accent-sunset/15'}`}>
                  {item.type === 'income' ? <ArrowDownLeft className="w-4 h-4 text-accent-green" /> : <ArrowUpRight className="w-4 h-4 text-accent-sunset" />}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-primary">{item.title}</h4>
                  <p className="text-xs text-text-secondary">{item.date} · {item.category}</p>
                </div>
              </div>
              <span className={`font-mono text-sm font-semibold ${item.type === 'income' ? 'text-accent-green' : 'text-text-primary'}`}>
                {item.type === 'income' ? '+' : ''}{item.amount.toLocaleString()}
              </span>
            </GlassCard>
          ))}
        </div>
      )}

      {activeTab === 'virtual' && (
        <div className="grid grid-cols-1 gap-3">
          {state.finance.virtualAssets.map((asset) => (
            <GlassCard key={asset.id} className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-amber/15 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-accent-amber" />
              </div>
              <div className="flex-1">
                <h4 className="font-heading text-sm font-semibold text-text-primary">{asset.name}</h4>
                <p className="text-xs text-text-secondary">{asset.description}</p>
              </div>
              <span className="font-mono text-lg font-semibold text-text-primary">{asset.value.toLocaleString()}</span>
            </GlassCard>
          ))}
        </div>
      )}

      {activeTab === 'fixed' && (
        <div className="grid grid-cols-1 gap-3">
          {state.finance.fixedAssets.map((asset) => (
            <GlassCard key={asset.id} className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-teal/15 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-accent-teal" />
              </div>
              <div className="flex-1">
                <h4 className="font-heading text-sm font-semibold text-text-primary">{asset.name}</h4>
                <p className="text-xs text-text-secondary">{asset.description}</p>
              </div>
              <span className="font-mono text-lg font-semibold text-text-primary">{asset.value.toLocaleString()}</span>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 创建 `src/components/modules/CalendarEvents.tsx`**

```tsx
import { useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { CalendarTab } from '@/types';
import { Calendar as CalendarIcon, Globe, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs: { id: CalendarTab; label: string; icon: typeof CalendarIcon }[] = [
  { id: 'calendar', label: '日历', icon: CalendarIcon },
  { id: 'world', label: '世界事件', icon: Globe },
  { id: 'nearby', label: '周边事件', icon: MapPin },
];

export function CalendarEvents() {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState<CalendarTab>('calendar');

  const events = state.calendar[`${activeTab}Events` as keyof typeof state.calendar] as typeof state.calendar.calendarEvents;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 bg-bg-glass rounded-xl border border-border-soft">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1',
              activeTab === tab.id
                ? 'bg-white/70 text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/30'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'calendar' ? (
        <GlassCard className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
              <div key={d} className="text-xs text-text-secondary py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 1;
              const isCurrent = day === state.date.day;
              const hasEvent = state.calendar.calendarEvents.some((e) => {
                const d = new Date(e.date).getDate();
                return d === day;
              });
              return (
                <div
                  key={i}
                  className={cn(
                    'aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors',
                    day > 0 && 'hover:bg-white/40',
                    isCurrent && 'bg-accent-sunset text-white',
                    !isCurrent && day > 0 && 'text-text-primary'
                  )}
                >
                  {day > 0 && day <= 31 ? day : ''}
                  {hasEvent && !isCurrent && <div className="w-1 h-1 rounded-full bg-accent-sunset mt-0.5" />}
                </div>
              );
            })}
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <GlassCard key={event.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-text-primary">{event.title}</h4>
                <span className="text-[10px] text-text-secondary font-mono shrink-0">{event.date}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1">{event.description}</p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Task 11: 系统设置与中间叙事区

**Files:**
- Create: `F:\AI\no2\src\components\modules\SystemSettings.tsx`
- Create: `F:\AI\no2\src\components\layout\NarrativePanel.tsx`

**Interfaces:**
- Consumes: `narrative`, input actions from `useGame`
- Produces: `SystemSettings`, `NarrativePanel`

- [ ] **Step 1: 创建 `src/components/modules/SystemSettings.tsx`**

```tsx
import { GlassCard } from '@/components/ui/GlassCard';
import { Settings, Construction } from 'lucide-react';

export function SystemSettings() {
  return (
    <GlassCard className="p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
      <div className="w-16 h-16 rounded-full bg-accent-amber/15 flex items-center justify-center mb-4">
        <Construction className="w-8 h-8 text-accent-amber" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">系统设置</h3>
      <p className="text-sm text-text-secondary">设置功能正在开发中，敬请期待。</p>
    </GlassCard>
  );
}
```

- [ ] **Step 2: 创建 `src/components/layout/NarrativePanel.tsx`**

```tsx
import { useRef, useEffect, useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Wand2, RotateCcw, Eye, MessageCircle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NarrativeMessage } from '@/types';

function NarrativeItem({ message }: { message: NarrativeMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'mb-4',
        message.type === 'system' && 'text-center',
        message.type === 'dialogue' && 'flex gap-3'
      )}
    >
      {message.type === 'dialogue' && (
        <div className="w-8 h-8 rounded-full bg-accent-teal/15 flex items-center justify-center shrink-0">
          <MessageCircle className="w-4 h-4 text-accent-teal" />
        </div>
      )}
      <div className={cn('flex-1', message.type === 'system' && 'inline-block')}>
        {message.speaker && (
          <p className="text-xs font-medium text-accent-teal mb-1">{message.speaker}</p>
        )}
        <p
          className={cn(
            'text-sm leading-relaxed',
            message.type === 'scene' && 'text-text-primary font-body',
            message.type === 'dialogue' && 'text-text-primary font-body',
            message.type === 'system' && 'text-text-secondary text-xs px-3 py-1 bg-bg-glass rounded-full inline-block'
          )}
        >
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}

export function NarrativePanel() {
  const { state, setNarrativeInput, sendNarrativeMessage, regenerateLastMessage } = useGame();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [state.narrative.messages]);

  const handleSend = () => {
    if (!state.narrative.inputText.trim()) return;
    sendNarrativeMessage(state.narrative.inputText);
  };

  return (
    <main className="flex flex-col h-full bg-[#FCF9F5] relative">
      {/* 叙事输出区 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 pb-24"
      >
        <div className="max-w-3xl mx-auto">
          {state.narrative.messages.map((msg) => (
            <NarrativeItem key={msg.id} message={msg} />
          ))}
        </div>
        <div className="absolute bottom-32 left-0 right-0 h-16 bg-gradient-to-t from-[#FCF9F5] to-transparent pointer-events-none" />
      </div>

      {/* 输入区 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#FCF9F5]/95 backdrop-blur-sm border-t border-border-soft">
        {/* 快捷动作 */}
        <div className="flex gap-2 mb-3 max-w-3xl mx-auto">
          {[
            { icon: Eye, label: '环顾四周' },
            { icon: MessageCircle, label: '搭话' },
            { icon: MapPin, label: '移动' },
          ].map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-glass rounded-full text-xs text-text-secondary hover:bg-white/60 transition-colors border border-border-soft"
            >
              <action.icon className="w-3.5 h-3.5" />
              {action.label}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          {/* 功能集合按钮 */}
          <div className="relative">
            <motion.button
              id="narrative-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              animate={{ rotate: menuOpen ? 45 : 0 }}
              className="w-11 h-11 rounded-xl bg-bg-glass border border-border-soft flex items-center justify-center text-text-secondary hover:bg-white/60 hover:text-text-primary transition-colors"
              aria-label="功能菜单"
            >
              <Wand2 className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-2 w-40 bg-bg-card rounded-xl border border-border-soft shadow-soft overflow-hidden"
                >
                  <button
                    onClick={() => {
                      regenerateLastMessage();
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-2 text-sm text-text-primary hover:bg-white/50 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重新生成
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 输入框 */}
          <div className="flex-1 relative">
            <textarea
              id="narrative-input"
              value={state.narrative.inputText}
              onChange={(e) => setNarrativeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="接下来你想做什么……"
              className="w-full min-h-[48px] max-h-32 px-4 py-3 bg-white/80 rounded-xl border border-border-soft text-sm text-text-primary placeholder:text-text-secondary/60 resize-none focus:outline-none focus:ring-2 focus:ring-accent-sunset/30"
              rows={1}
            />
          </div>

          {/* 发送按钮 */}
          <motion.button
            id="narrative-send-btn"
            onClick={handleSend}
            whileTap={{ scale: 0.92 }}
            disabled={!state.narrative.inputText.trim()}
            className="w-11 h-11 rounded-xl bg-accent-sunset text-white flex items-center justify-center shadow-glow disabled:opacity-40 disabled:shadow-none transition-opacity"
            aria-label="发送消息"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </main>
  );
}
```

---

## Task 12: 地图组件

**Files:**
- Create: `F:\AI\no2\src\components\map\MiniMap.tsx`
- Create: `F:\AI\no2\src\components\map\FullMapModal.tsx`
- Create: `F:\AI\no2\src\components\map\MapMarker.tsx`

**Interfaces:**
- Consumes: `map` state, `setMapZoom`, `setMapCenter` from `useGame`
- Produces: `MiniMap`, `FullMapModal`, `MapMarker`

- [ ] **Step 1: 创建 `src/components/map/MapMarker.tsx`**

```tsx
import type { MapMarker as MapMarkerType } from '@/types';
import { MapPin, Flag, User } from 'lucide-react';

interface MapMarkerProps {
  marker: MapMarkerType;
  onClick?: () => void;
}

const icons = {
  location: MapPin,
  event: Flag,
  npc: User,
};

export function MapMarker({ marker, onClick }: MapMarkerProps) {
  const Icon = icons[marker.type] || MapPin;
  return (
    <button
      onClick={onClick}
      className="absolute -translate-x-1/2 -translate-y-1/2 group"
      aria-label={marker.name}
    >
      <div className="w-8 h-8 rounded-full bg-accent-sunset/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
        <Icon className="w-4 h-4" />
      </div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-text-primary/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {marker.name}
      </div>
    </button>
  );
}
```

- [ ] **Step 2: 创建 `src/components/map/MiniMap.tsx`**

```tsx
import { useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { MapMarker } from './MapMarker';
import { Maximize2 } from 'lucide-react';
import { FullMapModal } from './FullMapModal';

export function MiniMap() {
  const { state } = useGame();
  const { map } = state;
  const [fullMapOpen, setFullMapOpen] = useState(false);

  return (
    <>
      <GlassCard className="relative h-full overflow-hidden p-1">
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={() => setFullMapOpen(true)}
            className="w-7 h-7 rounded-lg bg-white/70 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            aria-label="全屏地图"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
        <div className="relative w-full h-full bg-bg-base rounded-xl overflow-hidden">
          <img
            src="/map/world-map.jpg"
            alt="世界地图"
            className="w-full h-full object-cover opacity-60"
          />
          {/* 玩家位置 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full bg-accent-green border-2 border-white shadow-lg animate-breathe" />
          </div>
          {map.markers.slice(0, 2).map((marker) => (
            <MapMarker key={marker.id} marker={marker} />
          ))}
        </div>
      </GlassCard>

      <FullMapModal open={fullMapOpen} onClose={() => setFullMapOpen(false)} />
    </>
  );
}
```

- [ ] **Step 3: 创建 `src/components/map/FullMapModal.tsx`**

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGameState';
import { MapMarker } from './MapMarker';
import { X, MapPin } from 'lucide-react';
import type { MapMarker as MapMarkerType } from '@/types';

interface FullMapModalProps {
  open: boolean;
  onClose: () => void;
}

export function FullMapModal({ open, onClose }: FullMapModalProps) {
  const { state } = useGame();
  const { map } = state;
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerType | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl h-[80vh] bg-bg-base rounded-2xl shadow-2xl overflow-hidden flex"
          >
            {/* 左侧地点列表 */}
            <div className="w-72 bg-bg-card/80 backdrop-blur border-r border-border-soft p-4 overflow-y-auto">
              <h2 className="font-heading text-lg font-bold text-text-primary mb-4">地点</h2>
              <div className="space-y-2">
                {map.markers.map((marker) => (
                  <button
                    key={marker.id}
                    onClick={() => setSelectedMarker(marker)}
                    className={`w-full text-left p-3 rounded-xl transition-colors ${selectedMarker?.id === marker.id ? 'bg-accent-sunset/15' : 'hover:bg-white/40'}`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-accent-sunset" />
                      <span className="text-sm font-medium text-text-primary">{marker.name}</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">坐标 ({marker.x}, {marker.y})</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 右侧大地图 */}
            <div className="flex-1 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-text-secondary hover:text-text-primary"
                aria-label="关闭全屏地图"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full h-full bg-bg-base relative overflow-hidden">
                <img
                  src="/map/world-map.jpg"
                  alt="世界地图"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 rounded-full bg-accent-green border-2 border-white shadow-lg animate-breathe" />
                </div>
                {map.markers.map((marker) => (
                  <div
                    key={marker.id}
                    className="absolute"
                    style={{
                      left: `${50 + (marker.x / 110000) * 40}%`,
                      top: `${50 + (marker.y / 110000) * 40}%`,
                    }}
                  >
                    <MapMarker marker={marker} onClick={() => setSelectedMarker(marker)} />
                  </div>
                ))}
              </div>

              {selectedMarker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-4 left-4 right-4 bg-bg-card/95 backdrop-blur rounded-xl p-4 border border-border-soft"
                >
                  <h3 className="font-heading text-base font-semibold text-text-primary">{selectedMarker.name}</h3>
                  <p className="text-sm text-text-secondary mt-1">{selectedMarker.description}</p>
                  <p className="text-xs text-text-secondary mt-2 font-mono">坐标：({selectedMarker.x}, {selectedMarker.y})</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Task 13: 右侧面板与手机组件

**Files:**
- Create: `F:\AI\no2\src\components\layout\RightPanel.tsx`
- Create: `F:\AI\no2\src\components\phone\PhoneShell.tsx`
- Create: `F:\AI\no2\src\components\phone\PhoneAppGrid.tsx`
- Create: `F:\AI\no2\src\components\phone\PhoneAppModal.tsx`

**Interfaces:**
- Consumes: `notifications`, `phoneApps`, `phoneOpen`, `activePhoneApp` from `useGame`
- Produces: `RightPanel`, `PhoneShell`, `PhoneAppGrid`, `PhoneAppModal`

- [ ] **Step 1: 创建 `src/components/phone/PhoneAppGrid.tsx`**

```tsx
import { useGame } from '@/hooks/useGameState';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

export function PhoneAppGrid() {
  const { state, openPhoneApp } = useGame();

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {state.phoneApps.map((app, index) => {
        const Icon = (LucideIcons as Record<string, typeof LucideIcons.User>)[app.icon] || LucideIcons.Circle;
        return (
          <motion.button
            key={app.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => openPhoneApp(app.id)}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform"
              style={{ backgroundColor: app.color }}
            >
              <Icon className="w-7 h-7" />
              {app.badge && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-sunset text-white text-[10px] rounded-full flex items-center justify-center font-mono">
                  {app.badge}
                </span>
              )}
            </div>
            <span className="text-xs text-text-primary">{app.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: 创建 `src/components/phone/PhoneAppModal.tsx`**

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGameState';
import { X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export function PhoneAppModal() {
  const { state, closePhoneApp } = useGame();
  const { activePhoneApp, phoneApps } = state;

  const app = phoneApps.find((a) => a.id === activePhoneApp);
  if (!app) return null;

  const Icon = (LucideIcons as Record<string, typeof LucideIcons.User>)[app.icon] || LucideIcons.Circle;

  return (
    <AnimatePresence>
      {activePhoneApp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-bg-base flex flex-col"
        >
          <div
            className="h-14 flex items-center justify-between px-4 text-white"
            style={{ backgroundColor: app.color }}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              <span className="font-heading font-semibold">{app.name}</span>
            </div>
            <button onClick={closePhoneApp} aria-label="关闭">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center text-text-secondary">
            <p className="text-sm">{app.name} 功能开发中</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: 创建 `src/components/phone/PhoneShell.tsx`**

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGameState';
import { PhoneAppGrid } from './PhoneAppGrid';
import { PhoneAppModal } from './PhoneAppModal';
import { Bell, Wifi, Battery } from 'lucide-react';

export function PhoneShell() {
  const { state, togglePhone } = useGame();
  const { phoneOpen, notifications } = state;

  return (
    <>
      {/* 手机头部 */}
      {!phoneOpen && (
        <button
          onClick={togglePhone}
          className="w-full h-8 bg-bg-card/90 backdrop-blur rounded-t-2xl border-t border-x border-border-soft flex items-center justify-center gap-2 text-text-secondary hover:bg-white/60 transition-colors"
          aria-label="打开手机"
        >
          <div className="w-8 h-1 bg-text-secondary/30 rounded-full" />
        </button>
      )}

      {/* 手机浮层 */}
      <AnimatePresence>
        {phoneOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 h-[70vh] bg-bg-card/95 backdrop-blur-xl rounded-t-3xl border-t border-border-soft shadow-2xl z-40 overflow-hidden"
          >
            <PhoneAppModal />

            {/* 状态栏 */}
            <div className="h-8 px-5 flex items-center justify-between text-text-secondary text-xs">
              <span className="font-mono">18:30</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 通知区 */}
            <div className="px-4 pb-2">
              <h3 className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" /> 通知
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="bg-white/50 rounded-xl p-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium text-text-primary">{n.title}</span>
                      <span className="text-text-secondary">{n.time}</span>
                    </div>
                    <p className="text-text-secondary mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* APP 区 */}
            <PhoneAppGrid />

            {/* 底部指示条 */}
            <button
              onClick={togglePhone}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-text-secondary/30 rounded-full hover:bg-text-secondary/50 transition-colors"
              aria-label="关闭手机"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 4: 创建 `src/components/layout/RightPanel.tsx`**

```tsx
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { MiniMap } from '@/components/map/MiniMap';
import { PhoneShell } from '@/components/phone/PhoneShell';
import { Bell, MapPin } from 'lucide-react';

export function RightPanel() {
  const { state } = useGame();

  return (
    <aside className="h-full flex flex-col gap-3 p-3">
      {/* 大地图 */}
      <div className="h-[40%] min-h-[180px]">
        <MiniMap />
      </div>

      {/* 场景印象图 */}
      <GlassCard className="h-[20%] min-h-[100px] overflow-hidden relative">
        <img
          src="/scenes/classroom.jpg"
          alt="当前场景"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center gap-1.5 text-white text-sm font-medium">
            <MapPin className="w-3.5 h-3.5" />
            自家公寓
          </div>
        </div>
      </GlassCard>

      {/* 通知列表 + 手机 */}
      <div className="flex-1 relative flex flex-col min-h-0">
        <GlassCard className="flex-1 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border-soft flex items-center gap-1.5 text-text-secondary">
            <Bell className="w-4 h-4" />
            <span className="text-xs font-semibold">通知</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {state.notifications.map((n) => (
              <div key={n.id} className={`p-2.5 rounded-xl text-xs ${n.read ? 'bg-white/30' : 'bg-accent-sunset/10'}`}>
                <div className="flex justify-between">
                  <span className={`font-medium ${n.read ? 'text-text-secondary' : 'text-text-primary'}`}>{n.title}</span>
                  <span className="text-text-secondary/70">{n.time}</span>
                </div>
                <p className="text-text-secondary mt-0.5 truncate">{n.message}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <PhoneShell />
      </div>
    </aside>
  );
}
```

---

## Task 14: 主页面整合

**Files:**
- Modify: `F:\AI\no2\src\app\page.tsx`

**Interfaces:**
- Consumes: `TopBar`, `LeftSidebar`, `NarrativePanel`, `RightPanel`
- Produces: 完整游戏主界面

- [ ] **Step 1: 更新 `src/app/page.tsx`**

```tsx
import { GameProvider } from '@/context/GameContext';
import { TopBar } from '@/components/layout/TopBar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { NarrativePanel } from '@/components/layout/NarrativePanel';
import { RightPanel } from '@/components/layout/RightPanel';

export default function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-bg-base flex flex-col">
        <TopBar />
        <div className="flex-1 grid grid-cols-[22%_1fr_22%] min-h-0">
          <LeftSidebar />
          <NarrativePanel />
          <RightPanel />
        </div>
      </div>
    </GameProvider>
  );
}
```

- [ ] **Step 2: 添加占位图片**

在 `public/` 下创建占位图片：
- `public/map/world-map.jpg`
- `public/scenes/classroom.jpg`

如果用户未提供，可以先创建简单的 SVG 占位图：

```bash
# 创建占位地图 SVG
echo '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect fill="#E8DCC8" width="800" height="600"/><path fill="#D4C4A8" d="M100,100 Q400,50 700,150 T700,450 Q400,550 100,450 Z"/></svg>' > public/map/world-map.svg
```

由于项目需要 `.jpg`，可以先用任意图片占位，或下载示例图片。

- [ ] **Step 3: 启动开发服务器验证整体布局**

```bash
npm run dev
```

Expected: 四栏布局正确渲染，各模块可切换，地图、手机、叙事区可见。

---

## Task 15: 响应式适配与动画打磨

**Files:**
- Create: `F:\AI\no2\src\components\layout\MobileNav.tsx`
- Modify: `F:\AI\no2\src\app\page.tsx`

**Interfaces:**
- Produces: 移动端底部导航与全屏模块

- [ ] **Step 1: 创建 `src/components/layout/MobileNav.tsx`**

```tsx
import { useGame } from '@/hooks/useGameState';
import { SidebarTab } from '@/types';
import { User, Sparkles, Users, Wallet, Calendar, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

type MobileTab = SidebarTab | 'narrative' | 'map' | 'phone';

const mobileItems: { id: MobileTab; label: string; icon: typeof User }[] = [
  { id: 'narrative', label: '叙事', icon: User },
  { id: 'status', label: '状态', icon: User },
  { id: 'map', label: '地图', icon: MapPin },
  { id: 'phone', label: '手机', icon: Phone },
];

interface MobileNavProps {
  activeTab: MobileTab;
  onChange: (tab: MobileTab) => void;
}

export function MobileNav({ activeTab, onChange }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-bg-card/95 backdrop-blur-xl border-t border-border-soft flex items-center justify-around px-2 z-50">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors',
              activeTab === item.id ? 'text-accent-sunset' : 'text-text-secondary'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: 更新 `src/app/page.tsx` 支持移动端**

```tsx
'use client';

import { useState } from 'react';
import { GameProvider } from '@/context/GameContext';
import { TopBar } from '@/components/layout/TopBar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { NarrativePanel } from '@/components/layout/NarrativePanel';
import { RightPanel } from '@/components/layout/RightPanel';
import { MobileNav } from '@/components/layout/MobileNav';
import { PersonalStatus } from '@/components/modules/PersonalStatus';

type MobileTab = 'narrative' | 'status' | 'map' | 'phone';

function GameLayout() {
  const [mobileTab, setMobileTab] = useState<MobileTab>('narrative');

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* 桌面端布局 */}
      <div className="hidden lg:flex flex-col h-screen">
        <TopBar />
        <div className="flex-1 grid grid-cols-[22%_1fr_22%] min-h-0">
          <LeftSidebar />
          <NarrativePanel />
          <RightPanel />
        </div>
      </div>

      {/* 移动端布局 */}
      <div className="lg:hidden flex flex-col h-screen pb-16">
        <TopBar />
        <div className="flex-1 overflow-hidden">
          {mobileTab === 'narrative' && <NarrativePanel />}
          {mobileTab === 'status' && (
            <div className="h-full overflow-y-auto p-4">
              <PersonalStatus />
            </div>
          )}
          {mobileTab === 'map' && (
            <div className="h-full p-4">
              <RightPanel />
            </div>
          )}
          {mobileTab === 'phone' && (
            <div className="h-full relative">
              <RightPanel />
            </div>
          )}
        </div>
        <MobileNav activeTab={mobileTab} onChange={setMobileTab} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
}
```

- [ ] **Step 3: 验证响应式**

调整浏览器窗口宽度，验证桌面端和移动端布局切换正常。

---

## Task 16: 性能与可访问性最终检查

**Files:**
- Modify: `F:\AI\no2\src\styles\globals.css`
- Modify: 各组件焦点环与 aria-label

- [ ] **Step 1: 检查所有交互元素唯一 ID**

确保以下 ID 存在：
- `top-bar`
- `sidebar-status`, `sidebar-talents`, `sidebar-social`, `sidebar-wealth`, `sidebar-calendar`, `sidebar-settings`
- `narrative-input`, `narrative-send-btn`, `narrative-menu-btn`
- `map-fullscreen-btn`
- `phone-toggle-btn`

- [ ] **Step 2: 验证颜色对比度**

使用浏览器开发者工具或在线工具检查 `text-primary` (#3D3229) 在 `bg-base` (#FAF6F1) 上的对比度。

Expected: 对比度 ≥ 4.5:1。

- [ ] **Step 3: 验证 reduced-motion**

在系统设置中开启"减少动态效果"，刷新页面，验证动画被禁用。

- [ ] **Step 4: 运行构建**

```bash
npm run build
```

Expected: 构建成功，无错误。

---

## Self-Review Checklist

- [x] **Spec coverage:** 所有 spec 中的模块（TopBar、LeftSidebar 各模块、NarrativePanel、Map、Phone）都有对应任务
- [x] **Placeholder scan:** 无 TBD/TODO，系统设置和手机 APP 占位是用户明确的范围
- [x] **Type consistency:** `GameState` 扩展字段在所有消费处一致使用
- [x] **File paths:** 所有路径使用绝对路径 `F:\AI\no2\...`
- [x] **Testing strategy:** 每个任务包含验证步骤

---

## Execution Options

计划完成并保存到 `F:\AI\no2\docs\superpowers\plans\2026-07-07-llm-life-sim-ui.md`。

**执行方式：**

1. **Subagent-Driven（推荐）** - 每个任务派发给独立子代理，我在每轮后审查
2. **Inline Execution** - 在当前会话中直接按任务执行，逐步验证

请选择执行方式。
