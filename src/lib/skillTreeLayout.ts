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
// 节点半径按层级（与 SkillTreeView.tsx 保持一致）
const RADIUS_BY_DEPTH = [5.5, 4.2, 3.2, 2.2];
// 字体大小按层级（与 SkillTreeView.tsx 保持一致）
const FONT_SIZE_BY_DEPTH = [2.4, 2.0, 1.8, 1.5];

function getNodeRadius(depth: number): number {
  return RADIUS_BY_DEPTH[Math.min(depth, RADIUS_BY_DEPTH.length - 1)];
}

function getFontSize(depth: number): number {
  return FONT_SIZE_BY_DEPTH[Math.min(depth, FONT_SIZE_BY_DEPTH.length - 1)];
}

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

  function record(node: SkillNode, pos: Point, depth: number) {
    result.push({ ...node, pos, depth });
  }

  function updateBounds(bounds: Bounds, node: SkillNode, pos: Point, depth: number): Bounds {
    const r = getNodeRadius(depth);
    const fontSize = getFontSize(depth);
    // 粗略估算文字标签宽度（中文字符按正方形估算，并留一定边距）
    const labelWidth = node.name.length * fontSize * 1.2;
    const labelHeight = fontSize * 2 + 1.2; // 名称 + 等级两行
    return {
      minX: Math.min(bounds.minX, pos.x - r - labelWidth / 2),
      maxX: Math.max(bounds.maxX, pos.x + r + labelWidth / 2),
      minY: Math.min(bounds.minY, pos.y - r),
      maxY: Math.max(bounds.maxY, pos.y + r + labelHeight),
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
    let nextBounds = updateBounds(bounds, node, pos, depth);

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

  let bounds = updateBounds(emptyBounds(), root, { x: CX, y: CY }, 0);
  record(root, { x: CX, y: CY }, 0);

  rootChildren.forEach((child, i) => {
    const angle = rootAngles[i];
    const dist = LEVEL_DISTANCES[1];
    const pos = { x: CX + Math.cos(angle) * dist, y: CY + Math.sin(angle) * dist };
    bounds = layoutNode(child, pos, angle, angle - Math.PI / rootChildren.length, angle + Math.PI / rootChildren.length, bounds);
  });

  return { nodes: result, bounds };
}
