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
