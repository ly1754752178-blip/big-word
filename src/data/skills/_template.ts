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
