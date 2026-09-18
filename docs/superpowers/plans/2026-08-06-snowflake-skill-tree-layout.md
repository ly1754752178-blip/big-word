# 雪花式放射技能树布局实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `SkillTreeView.tsx` 的布局算法替换为可移植后端的雪花式放射生成器，支持多级展开/收拢、自动防重叠、右上角玻璃详情面板，并建立文件化技能树导入模板。

**Architecture:** 新增纯函数 `generateSnowflakeLayout` 负责全部坐标计算；`SkillTreeView` 仅负责渲染与交互；技能数据拆分为独立文件以便本地编辑；用 Vitest 对纯函数做单元测试。

**Tech Stack:** React + TypeScript + Vite + Framer Motion + Tailwind CSS + Vitest

## Global Constraints

- 仅修改布局算法与相关渲染，不改动 `SkillsOverlay` 总览/详情切换架构。
- 节点颜色保持现有配色，只按层级调整大小。
- 新增技能树只需填写 `parentIds`，无需手写 `position`。
- 布局函数必须是纯函数，不依赖 React / DOM / 浏览器 API。
- 所有父子连线必须是直线，节点中心到节点中心，禁止弯折。
- 每次展开/收拢后自动缩放平移，确保完整可见。
- 点击已展开节点时，递归收起其下所有后代节点。
- A 节点始终展开且居中。

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `src/lib/skillTreeLayout.ts` | 纯函数生成器：根据 `SkillNode[]` 与 `expandedIds` 计算雪花放射坐标 |
| `src/lib/skillTreeLayout.test.ts` | Vitest 单元测试：覆盖不同 B 数量、多级展开、小型放射中心、可见性 |
| `src/data/skills/index.ts` | 统一导出所有技能树 |
| `src/data/skills/_template.ts` | 新增技能树时复制的模板 |
| `src/data/skills/cooking.ts` | 料理技能树（从 `mockData.ts` 拆分） |
| `src/data/skills/cleaning.ts` | 打扫技能树（从 `mockData.ts` 拆分） |
| `src/data/skills/programming.ts` | 编程技能树（从 `mockData.ts` 拆分） |
| `src/data/skills/magic.ts` | 魔术技能树（从 `mockData.ts` 拆分） |
| `src/data/mockData.ts` | 改为从 `src/data/skills/index.ts` 导入技能树 |
| `src/components/overlays/SkillsOverlay/SkillTreeView.tsx` | 使用新布局算法、Set 展开状态、直线连线、层级大小 |
| `src/components/overlays/SkillsOverlay/SkillNodeDetail.tsx` | 改为右上角固定玻璃面板 |

---

### Task 1: 安装 Vitest 并配置测试脚本

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

**Interfaces:**
- Consumes: 无
- Produces: `npm test` 可运行 Vitest

- [ ] **Step 1: 安装 Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: 在 `package.json` 添加 test 脚本**

将 `scripts` 改为：

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest"
}
```

- [ ] **Step 3: 创建 `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
});
```

- [ ] **Step 4: 运行测试确认命令可用**

```bash
npx vitest --run
```

Expected: 显示 `No test files found` 并退出码 0。

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest for unit testing layout algorithm

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: 实现雪花放射布局纯函数

**Files:**
- Create: `src/lib/skillTreeLayout.ts`
- Create: `src/lib/skillTreeLayout.test.ts`

**Interfaces:**
- Consumes: `SkillNode` from `@/types`
- Produces:
  - `generateSnowflakeLayout(nodes: SkillNode[], expandedIds: Set<string>): SnowflakeLayout`
  - `type SnowflakeLayout = { nodes: LayoutNode[]; bounds: Bounds }`
  - `type LayoutNode = SkillNode & { pos: { x: number; y: number }; depth: number }`

- [ ] **Step 1: 编写失败测试**

创建 `src/lib/skillTreeLayout.test.ts`：

```ts
import { describe, it, expect } from 'vitest';
import type { SkillNode } from '@/types';
import { generateSnowflakeLayout } from './skillTreeLayout';

function makeNode(
  id: string,
  parentIds: string[] = [],
  overrides: Partial<SkillNode> = {}
): SkillNode {
  return {
    id,
    name: id,
    description: '',
    level: 0,
    maxLevel: 1,
    unlocked: true,
    icon: 'box',
    parentIds,
    ...overrides,
  };
}

describe('generateSnowflakeLayout', () => {
  it('places root at center', () => {
    const nodes = [makeNode('A')];
    const { nodes: laid } = generateSnowflakeLayout(nodes, new Set());
    expect(laid).toHaveLength(1);
    expect(laid[0].pos).toEqual({ x: 100, y: 100 });
  });

  it('places 2 children left and right', () => {
    const nodes = [makeNode('A'), makeNode('B1', ['A']), makeNode('B2', ['A'])];
    const { nodes: laid } = generateSnowflakeLayout(nodes, new Set());
    const b1 = laid.find(n => n.id === 'B1')!;
    const b2 = laid.find(n => n.id === 'B2')!;
    expect(b1.pos.x).toBeLessThan(100);
    expect(b2.pos.x).toBeGreaterThan(100);
    expect(b1.pos.y).toBeCloseTo(100, 0);
    expect(b2.pos.y).toBeCloseTo(100, 0);
  });

  it('hides children when parent is not expanded', () => {
    const nodes = [makeNode('A'), makeNode('B1', ['A']), makeNode('C1', ['B1'])];
    const { nodes: laid } = generateSnowflakeLayout(nodes, new Set());
    expect(laid.find(n => n.id === 'C1')).toBeUndefined();
  });

  it('shows children when parent is expanded', () => {
    const nodes = [makeNode('A'), makeNode('B1', ['A']), makeNode('C1', ['B1'])];
    const { nodes: laid } = generateSnowflakeLayout(nodes, new Set(['B1']));
    expect(laid.find(n => n.id === 'C1')).toBeDefined();
  });

  it('creates mini radial center for 4 children', () => {
    const nodes = [
      makeNode('A'),
      makeNode('B1', ['A']),
      ...Array.from({ length: 4 }, (_, i) => makeNode(`C${i}`, ['B1'])),
    ];
    const { nodes: laid } = generateSnowflakeLayout(nodes, new Set(['B1']));
    const b1 = laid.find(n => n.id === 'B1')!;
    const children = laid.filter(n => n.id.startsWith('C'));
    expect(children).toHaveLength(4);
    for (const c of children) {
      const dx = c.pos.x - b1.pos.x;
      const dy = c.pos.y - b1.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      expect(dist).toBeLessThan(30);
    }
  });

  it('collapses whole subtree when ancestor collapses', () => {
    const nodes = [
      makeNode('A'),
      makeNode('B1', ['A']),
      makeNode('C1', ['B1']),
      makeNode('D1', ['C1']),
    ];
    const expanded = new Set(['B1', 'C1']);
    const { nodes: laid } = generateSnowflakeLayout(nodes, expanded);
    expect(laid.find(n => n.id === 'D1')).toBeDefined();

    expanded.delete('B1');
    const { nodes: collapsed } = generateSnowflakeLayout(nodes, expanded);
    expect(collapsed.find(n => n.id === 'C1')).toBeUndefined();
    expect(collapsed.find(n => n.id === 'D1')).toBeUndefined();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest --run src/lib/skillTreeLayout.test.ts
```

Expected: 全部失败，提示 `generateSnowflakeLayout` 未定义。

- [ ] **Step 3: 实现布局函数**

创建 `src/lib/skillTreeLayout.ts`：

```ts
import type { SkillNode } from '@/types';

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface LayoutNode extends SkillNode {
  pos: Point;
  depth: number;
}

export interface SnowflakeLayout {
  nodes: LayoutNode[];
  bounds: Bounds;
}

const CX = 100;
const CY = 100;

// 每一层到父节点的距离
const LEVEL_DISTANCES = [0, 38, 28, 22, 18, 15, 13, 12];
// 小型放射中心子节点到父节点的紧凑距离
const MINI_RADIAL_DISTANCE = 16;

function getVisibleChildren(nodeId: string, all: SkillNode[], expandedIds: Set<string>, byId: Map<string, SkillNode>): SkillNode[] {
  const children = all.filter(n => n.parentIds?.[0] === nodeId);
  return children.filter(c => isVisible(c, expandedIds, byId));
}

function isVisible(node: SkillNode, expandedIds: Set<string>, byId: Map<string, SkillNode>): boolean {
  if (!node.parentIds?.length) return true;
  const parentId = node.parentIds[0];
  const parent = byId.get(parentId);
  if (!parent) return false;
  // A 节点（根）始终视为展开；其余节点必须在 expandedIds 中
  const parentExpanded = !parent.parentIds?.length || expandedIds.has(parentId);
  return parentExpanded && isVisible(parent, expandedIds, byId);
}

function computeDepth(node: SkillNode, byId: Map<string, SkillNode>): number {
  if (!node.parentIds?.length) return 0;
  const parent = byId.get(node.parentIds[0]);
  return parent ? computeDepth(parent, byId) + 1 : 0;
}

function subtreeSize(node: SkillNode, all: SkillNode[], expandedIds: Set<string>, byId: Map<string, SkillNode>): number {
  if (!isVisible(node, expandedIds, byId)) return 0;
  const children = getVisibleChildren(node.id, all, expandedIds, byId);
  if (children.length === 0) return 1;
  return 1 + children.reduce((sum, c) => sum + subtreeSize(c, all, expandedIds, byId), 0);
}

function distributeRootChildren(count: number): number[] {
  if (count === 1) return [-Math.PI / 2];
  if (count === 2) return [Math.PI, 0]; // 左右对称
  if (count === 3) return [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6]; // 三角形
  const step = (2 * Math.PI) / count;
  const start = -Math.PI / 2;
  return Array.from({ length: count }, (_, i) => start + i * step);
}

function emptyBounds(): Bounds {
  return { minX: CX, maxX: CX, minY: CY, maxY: CY };
}

export function generateSnowflakeLayout(
  nodes: SkillNode[],
  expandedIds: Set<string>
): SnowflakeLayout {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const root = nodes.find(n => !n.parentIds?.length);
  if (!root) {
    return { nodes: [], bounds: emptyBounds() };
  }

  const result: LayoutNode[] = [];
  const labelHeight = 6; // 预留文字标签高度

  function record(node: SkillNode, pos: Point, depth: number) {
    result.push({ ...node, pos, depth });
  }

  function updateBounds(bounds: Bounds, pos: Point): Bounds {
    return {
      minX: Math.min(bounds.minX, pos.x),
      maxX: Math.max(bounds.maxX, pos.x),
      minY: Math.min(bounds.minY, pos.y),
      maxY: Math.max(bounds.maxY, pos.y + labelHeight),
    };
  }

  function layoutNode(
    node: SkillNode,
    pos: Point,
    direction: number,
    sectorStart: number,
    sectorEnd: number,
    bounds: Bounds
  ): Bounds {
    const depth = computeDepth(node, byId);
    record(node, pos, depth);
    let nextBounds = updateBounds(bounds, pos);

    const children = getVisibleChildren(node.id, nodes, expandedIds, byId);
    if (children.length === 0) return nextBounds;

    const totalSize = children.reduce((sum, c) => sum + subtreeSize(c, nodes, expandedIds, byId), 0);
    let currentAngle = sectorStart;

    children.forEach((child, i) => {
      const childSize = subtreeSize(child, nodes, expandedIds, byId);
      const childSectorSize = totalSize > 0 ? (childSize / totalSize) * (sectorEnd - sectorStart) : 0;
      const childSectorStart = currentAngle;
      const childSectorEnd = currentAngle + childSectorSize;

      let childDirection: number;
      let childDist: number;

      if (children.length < 4) {
        // 普通分叉：沿父节点方向继续向外，在扇区内对称散开
        childDist = LEVEL_DISTANCES[depth + 1] ?? 12;
        const spread = Math.min(childSectorSize * 0.8, Math.PI / 3);
        const offset =
          children.length === 1
            ? 0
            : (i - (children.length - 1) / 2) * (spread / Math.max(1, children.length - 1));
        childDirection = direction + offset;
      } else {
        // 小型放射中心：子节点围绕父节点紧凑均匀分布
        childDist = MINI_RADIAL_DISTANCE;
        const miniSpread = Math.min(childSectorSize * 0.9, Math.PI / 2);
        const offset =
          (i - (children.length - 1) / 2) * (miniSpread / Math.max(1, children.length - 1));
        childDirection = direction + offset;
      }

      const childPos = {
        x: pos.x + Math.cos(childDirection) * childDist,
        y: pos.y + Math.sin(childDirection) * childDist,
      };

      nextBounds = layoutNode(child, childPos, childDirection, childSectorStart, childSectorEnd, nextBounds);
      currentAngle += childSectorSize;
    });

    return nextBounds;
  }

  const rootChildren = getVisibleChildren(root.id, nodes, expandedIds, byId);
  const rootAngles = distributeRootChildren(rootChildren.length);

  let bounds = updateBounds(emptyBounds(), { x: CX, y: CY });
  record(root, { x: CX, y: CY }, 0);

  rootChildren.forEach((child, i) => {
    const angle = rootAngles[i];
    const dist = LEVEL_DISTANCES[1];
    const pos = { x: CX + Math.cos(angle) * dist, y: CY + Math.sin(angle) * dist };
    bounds = layoutNode(child, pos, angle, angle - Math.PI / rootChildren.length, angle + Math.PI / rootChildren.length, bounds);
  });

  return { nodes: result, bounds };
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest --run src/lib/skillTreeLayout.test.ts
```

Expected: 全部 PASS。

- [ ] **Step 5: Commit**

```bash
git add src/lib/skillTreeLayout.ts src/lib/skillTreeLayout.test.ts
git commit -m "feat: add snowflake radial skill tree layout generator with tests

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: 拆分技能数据为文件化结构

**Files:**
- Create: `src/data/skills/_template.ts`
- Create: `src/data/skills/cooking.ts`
- Create: `src/data/skills/cleaning.ts`
- Create: `src/data/skills/programming.ts`
- Create: `src/data/skills/magic.ts`
- Create: `src/data/skills/index.ts`
- Modify: `src/data/mockData.ts`

**Interfaces:**
- Consumes: `SkillTree` from `@/types`
- Produces: `src/data/skills/index.ts` 导出所有技能树；`mockData.ts` 从 index 导入

- [ ] **Step 1: 创建模板文件 `src/data/skills/_template.ts`**

```ts
import type { SkillTree } from '@/types';

// 复制本文件并改名，然后按层级填写 parentIds 即可
// 不需要填写 position，坐标由雪花放射布局算法自动生成
export const exampleSkillTree: SkillTree = {
  id: 'example',
  name: '示例技能',
  icon: 'star',
  category: 'daily', // 'daily' | 'work' | 'special'
  level: 1,
  maxLevel: 10,
  exp: 0,
  maxExp: 1000,
  skillPoints: 0,
  nodes: [
    // A 节点：技能总等级核心，居中，不可加点
    {
      id: 'ex-root',
      name: '示例核心',
      description: '示例技能的核心',
      level: 1,
      maxLevel: 3,
      unlocked: true,
      icon: 'box',
      parentIds: [], // A 节点 parentIds 为空
    },
    // B 节点：一级技能
    {
      id: 'ex-b1',
      name: '示例分支一',
      description: '一级技能',
      level: 0,
      maxLevel: 1,
      unlocked: false,
      icon: 'box',
      parentIds: ['ex-root'], // 指向 A 节点
    },
    // C 节点：二级技能
    {
      id: 'ex-c1',
      name: '示例子技能',
      description: '二级技能',
      level: 0,
      maxLevel: 3,
      unlocked: false,
      icon: 'box',
      parentIds: ['ex-b1'], // 指向 B 节点
    },
  ],
};
```

- [ ] **Step 2: 从 `mockData.ts` 提取料理技能树到 `src/data/skills/cooking.ts`**

复制 `mockData.ts` 中 `daily[0]` 的整个对象，删除所有 `position` 字段（如果保留则算法会忽略，但为清晰起见删除），导出为 `cookingSkillTree`。

示例头部：

```ts
import type { SkillTree } from '@/types';

export const cookingSkillTree: SkillTree = {
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
    // ... 原节点，删除 position ...
  ],
};
```

- [ ] **Step 3: 同样提取打扫、编程、魔术到各自文件**

- `src/data/skills/cleaning.ts` 导出 `cleaningSkillTree`
- `src/data/skills/programming.ts` 导出 `programmingSkillTree`
- `src/data/skills/magic.ts` 导出 `magicSkillTree`

均删除 `position` 字段。

- [ ] **Step 4: 创建 `src/data/skills/index.ts`**

```ts
export { cookingSkillTree } from './cooking';
export { cleaningSkillTree } from './cleaning';
export { programmingSkillTree } from './programming';
export { magicSkillTree } from './magic';
```

- [ ] **Step 5: 修改 `src/data/mockData.ts` 使用新导出**

在文件顶部添加：

```ts
import {
  cookingSkillTree,
  cleaningSkillTree,
  programmingSkillTree,
  magicSkillTree,
} from './skills';
```

将 `skills` 字段替换为：

```ts
skills: {
  daily: [cookingSkillTree, cleaningSkillTree],
  work: [programmingSkillTree],
  special: [magicSkillTree],
},
```

删除原内联定义的 `daily`、`work`、`special` 技能数组。

- [ ] **Step 6: 运行 TypeScript 检查**

```bash
npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 7: Commit**

```bash
git add src/data/skills/ src/data/mockData.ts
git commit -m "refactor: split skill trees into file-based modules with template

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: 重构 SkillTreeView 使用新布局算法

**Files:**
- Modify: `src/components/overlays/SkillsOverlay/SkillTreeView.tsx`

**Interfaces:**
- Consumes: `generateSnowflakeLayout` from `@/lib/skillTreeLayout`
- Produces: 新渲染管线：Set 展开状态、直线连线、层级大小、自动缩放

- [ ] **Step 1: 更新导入并添加布局函数引用**

在文件顶部添加：

```ts
import { generateSnowflakeLayout, type LayoutNode } from '@/lib/skillTreeLayout';
```

移除以下不再使用的函数定义：`branchPath`、`childPos`、`isVis`、`computeNodeBounds`。

- [ ] **Step 2: 替换状态 `expId` 为 `expandedIds`**

```ts
const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
const [selId, setSelId] = useState<string | null>(null);
```

删除 `expId` 状态。

- [ ] **Step 3: 用 `generateSnowflakeLayout` 替换节点计算 useMemo**

```ts
const { nodes, bounds } = useMemo(() => {
  return generateSnowflakeLayout(skill.nodes, expandedIds);
}, [skill.nodes, expandedIds]);
```

`nodes` 类型改为 `LayoutNode[]`。

- [ ] **Step 4: 更新自适应缩放逻辑**

移除旧的 `computeNodeBounds` 调用，改用 `bounds`：

```ts
useEffect(() => {
  const rect = canvasRef.current?.getBoundingClientRect();
  const w = rect?.width || containerSizeRef.current.w;
  const h = rect?.height || containerSizeRef.current.h;
  if (!w || !h) return;

  const bw = bounds.maxX - bounds.minX;
  const bh = bounds.maxY - bounds.minY;
  if (bw <= 0 || bh <= 0) return;

  const pad = 22;
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  const unitPx = w / V;
  const targetZoom = Math.min(
    w / (bw * unitPx + pad * 2),
    h / (bh * unitPx + pad * 2)
  );

  const timer = setTimeout(() => {
    setZoom(targetZoom);
    setPan({
      x: w * 0.5 - cx * unitPx * targetZoom,
      y: h * 0.5 - cy * unitPx * targetZoom,
    });
  }, 80);
  return () => clearTimeout(timer);
}, [bounds]);
```

- [ ] **Step 5: 更新点击展开/收拢逻辑**

```ts
const onSelect = useCallback((node: LayoutNode) => {
  const hasChildren = skill.nodes.some(n => n.parentIds?.[0] === node.id);
  if (hasChildren) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(node.id)) {
        // 收起该节点及其所有后代
        const toRemove = new Set<string>();
        const collect = (id: string) => {
          toRemove.add(id);
          skill.nodes.filter(n => n.parentIds?.[0] === id).forEach(child => collect(child.id));
        };
        collect(node.id);
        for (const id of toRemove) next.delete(id);
      } else {
        next.add(node.id);
      }
      return next;
    });
  }
  setSelId(prev => (prev === node.id ? null : node.id));
  if (node.pos) panTo(node.pos.x, node.pos.y);
}, [skill.nodes, panTo]);
```

- [ ] **Step 6: 更新连线为单一直线**

替换原连线 `<g>` 实现为：

```tsx
<g>
  {nodes.map(node => {
    if (!node.parentIds?.length) return null;
    const parent = nodes.find(n => n.id === node.parentIds[0]);
    if (!parent?.pos || !node.pos) return null;
    const lit = node.unlocked && parent.unlocked;
    return (
      <line
        key={`line-${node.id}`}
        x1={parent.pos.x}
        y1={parent.pos.y}
        x2={node.pos.x}
        y2={node.pos.y}
        stroke={lit ? INK : 'rgba(180,160,140,0.25)'}
        strokeWidth={lit ? '0.6' : '0.3'}
        strokeDasharray={lit ? undefined : '2 4'}
        strokeLinecap="round"
      />
    );
  })}
</g>
```

- [ ] **Step 7: 更新节点渲染按深度调整大小**

在节点渲染部分，替换半径和文字大小逻辑：

```tsx
const isR = node.depth === 0;
const r = isR ? ROOT_R : node.depth === 1 ? MAJOR_R : node.depth === 2 ? CHILD_R : LEAF_W;
```

移除 `isM` 和 `isLeaf` 判断，改为深度驱动：

```tsx
const fontSize = isR ? 2.4 : node.depth === 1 ? 2.0 : node.depth === 2 ? 1.8 : 1.5;
```

- [ ] **Step 8: 更新选中弹出层计算**

`selPopup` 和 `SkillNodeDetail` 调用保持不变，但下一任务会改为玻璃面板。

- [ ] **Step 9: 运行 TypeScript 检查**

```bash
npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 10: Commit**

```bash
git add src/components/overlays/SkillsOverlay/SkillTreeView.tsx
git commit -m "refactor: use snowflake radial layout in SkillTreeView

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: 将节点详情改为右上角玻璃面板

**Files:**
- Modify: `src/components/overlays/SkillsOverlay/SkillNodeDetail.tsx`
- Modify: `src/components/overlays/SkillsOverlay/SkillTreeView.tsx`

**Interfaces:**
- Consumes: `SkillNode` + 选中状态
- Produces: 固定右上角玻璃面板组件

- [ ] **Step 1: 修改 `SkillNodeDetail.tsx` 为固定面板**

保留 props 但改为固定布局：

```tsx
import type { SkillNode } from '@/types';

interface Props {
  node: SkillNode;
  color: string;
  onClose: () => void;
}

export function SkillNodeDetail({ node, color, onClose }: Props) {
  return (
    <div
      className="fixed top-4 right-4 z-50 w-80 max-h-[80vh] overflow-auto rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-md"
      style={{ color: '#5D4037' }}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold" style={{ color }}>{node.name}</h3>
        <button
          onClick={onClose}
          className="ml-2 rounded-full p-1 hover:bg-white/20"
          aria-label="关闭"
        >
          ✕
        </button>
      </div>
      <p className="mt-2 text-sm opacity-80">{node.description}</p>
      <div className="mt-3 flex items-center gap-2 text-sm font-medium">
        <span>等级</span>
        <span>Lv.{node.level}/{node.maxLevel}</span>
      </div>
      <div className="mt-4 flex gap-2">
        {node.unlocked ? (
          <button
            className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white shadow"
            style={{ background: color }}
          >
            升级
          </button>
        ) : (
          <button
            disabled
            className="flex-1 rounded-lg bg-stone-300 px-3 py-2 text-sm font-semibold text-stone-600"
          >
            未解锁
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 在 `SkillTreeView.tsx` 中移除浮动定位逻辑**

删除 `selPopup` useMemo。

在 SVG 容器之后直接渲染玻璃面板：

```tsx
{selNode && (
  <SkillNodeDetail
    node={selNode}
    color={color}
    onClose={() => setSelId(null)}
  />
)}
```

- [ ] **Step 3: 运行 TypeScript 检查**

```bash
npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 4: Commit**

```bash
git add src/components/overlays/SkillsOverlay/SkillNodeDetail.tsx src/components/overlays/SkillsOverlay/SkillTreeView.tsx
git commit -m "feat: move skill node detail to top-right glass panel

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: 视觉验证与调整

**Files:**
- 不新增文件，仅验证

**Interfaces:**
- Consumes: 运行中的 dev server
- Produces: 验证报告

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 打开技能树并检查结构**

在浏览器中打开应用，进入「天赋才能 → 料理」技能树：

- [ ] A 节点（厨艺）位于画布中心。
- [ ] 8 个 B 节点均匀放射分布。
- [ ] 连线为直线，无弯折。
- [ ] 点击 B 节点后，C 节点沿 B 方向直线生长。
- [ ] 含有 ≥4 子节点的 C/D 节点形成小型放射花。

- [ ] **Step 3: 检查展开/收拢交互**

- [ ] 初始状态只显示 A 和 B。
- [ ] 点击任意 B 展开 C。
- [ ] 点击 C 展开 D，B 保持展开。
- [ ] 再次点击 B，B 下所有节点一次性收拢。
- [ ] 多次展开/收拢后状态不混乱。

- [ ] **Step 4: 检查防重叠与自适应**

- [ ] 每次展开后整棵树完整显示在屏幕内。
- [ ] 节点圆与文字标签不重叠。
- [ ] 展开「料理 → 烹饪工艺」等子节点多的分支，观察小型放射花是否侵入相邻分支。
- [ ] 如果某分支拥挤，回到 `src/lib/skillTreeLayout.ts` 微调 `LEVEL_DISTANCES` 或 `MINI_RADIAL_DISTANCE`，然后重复检查。

- [ ] **Step 5: 检查玻璃面板**

- [ ] 点击节点后右上角出现玻璃面板。
- [ ] 面板显示节点名称、描述、等级、解锁/升级按钮。
- [ ] 关闭按钮生效。
- [ ] 面板不遮挡技能树主体。

- [ ] **Step 6: 检查其他技能树**

依次打开打扫、编程、魔术技能树，确认：

- [ ] 小树（B 数量少）也能对称分布。
- [ ] 无报错。

- [ ] **Step 7: 记录调整并 Commit**

如果做了任何参数微调，提交：

```bash
git add src/lib/skillTreeLayout.ts
git commit -m "tweak: adjust layout distances after visual verification

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: 全量类型检查与构建

**Files:**
- 不新增文件

- [ ] **Step 1: 运行 Vitest**

```bash
npx vitest --run
```

Expected: 全部 PASS。

- [ ] **Step 2: 运行 TypeScript 检查**

```bash
npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 3: 运行生产构建**

```bash
npm run build
```

Expected: 构建成功，无报错。

- [ ] **Step 4: Commit（如有变更）**

如果无变更则跳过。如果有修复，提交：

```bash
git add -A
git commit -m "fix: resolve type/build issues

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

### Spec Coverage

| 设计文档章节 | 实现任务 |
|--------------|----------|
| 1.1 纯函数接口 | Task 2 |
| 1.2 算法步骤 | Task 2 |
| 1.3 小型放射中心 | Task 2 |
| 2. 展开/收拢状态机 | Task 4 Step 5 |
| 3. 自适应缩放与防重叠 | Task 2 + Task 4 Step 4 |
| 4. 与现有代码集成 | Task 4 |
| 5. 玻璃详情面板 | Task 5 |
| 6. 文件化导入 | Task 3 |
| 7. 视觉自检 | Task 6 |
| 8. 依赖与风险 | Task 1 + Task 7 |
| 9. 成功标准 | Task 6 + Task 7 |

### Placeholder Scan

- 无 TBD/TODO。
- 所有步骤包含实际代码或命令。
- 测试用例包含具体断言。

### Type Consistency

- `generateSnowflakeLayout` 签名在 Task 2 定义，Task 4 消费。
- `LayoutNode` 类型在 Task 2 定义，Task 4 使用。
- `SkillNodeDetail` props 在 Task 5 调整，`SkillTreeView` 同步调整。

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-06-snowflake-skill-tree-layout.md`.

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
