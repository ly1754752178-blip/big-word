// src/components/overlays/SkillsOverlay/node-animations.ts
// 技能大界面共享动画变体定义
import type { Variants, Transition } from 'framer-motion';

/** 技能卡牌 hover/tap 动画 */
export const cardVariants: Variants = {
  idle: { scale: 1, y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  hover: { scale: 1.04, y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)', transition: { type: 'spring', stiffness: 400, damping: 25 } },
  tap: { scale: 0.97, transition: { type: 'spring', stiffness: 600, damping: 30 } },
};

/** 技能树节点弹出动画——快速弹出 */
export const nodeVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 500, damping: 24, delay: i * 0.025 },
  }),
  exit: { scale: 0, opacity: 0, transition: { duration: 0.12 } },
};

/** 卡牌网格容器动画 */
export const gridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/** 详情面板滑入 */
export const panelVariants: Variants = {
  hidden: { x: 30, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { x: 30, opacity: 0, transition: { duration: 0.15 } },
};

/** 标签内容区滑动过渡 */
export const tabContentTransition: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 28,
};

/** 共享过渡配置 */
export const overlayTransition: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 30,
};
