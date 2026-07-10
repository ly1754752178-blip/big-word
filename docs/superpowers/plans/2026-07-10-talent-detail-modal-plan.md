# 天赋详情悬停提示与弹窗实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为天赋才能列表添加 hover 简要介绍与点击详情弹窗，展示名称、稀有度、等级、介绍、效果、获得时间。

**Architecture:** 扩展 `Talent` 类型与 mock 数据；新建 `TalentDetailModal` 专用小模态框；改造 `TalentsPreview` 中的 `TalentItem` 以支持点击打开弹窗并优化 hover 提示。

**Tech Stack:** React + TypeScript + Tailwind CSS + Framer Motion + Vite

## Global Constraints

- `Talent` 类型新增可选字段：`level?: number`、`effect?: string`、`acquiredAt?: string`。
- 弹窗使用 `GlassCard` 风格，小尺寸居中，点击遮罩或关闭按钮可关闭。
- hover 提示显示名称 + 简要介绍。
- 缺失字段不渲染或显示「未知」。

---

### Task 1: 扩展 Talent 类型

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Consumes: 无
- Produces: 扩展后的 `Talent` 接口

- [ ] **Step 1: 修改 Talent 接口**

在 `src/types/index.ts` 中，将：

```ts
export interface Talent {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
```

替换为：

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

- [ ] **Step 2: 运行 TypeScript 类型检查**

```bash
cd "F:\AI\no2" && npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 3: Commit**

```bash
cd "F:\AI\no2" && git add src/types/index.ts && git commit -m "types: add level, effect, acquiredAt to Talent"
```

---

### Task 2: 补全 Mock 天赋数据

**Files:**
- Modify: `src/data/mockData.ts`

**Interfaces:**
- Consumes: 扩展后的 `Talent` 接口
- Produces: 包含完整字段的 mock 天赋数据

- [ ] **Step 1: 修改 talents 数组**

在 `src/data/mockData.ts` 中，将 `talents` 数组：

```ts
  talents: [
    {
      id: 't1',
      name: '共感者',
      description: '更容易理解他人的情绪与想法，社交事件中获得额外好感度',
      icon: 'heart',
      rarity: 'rare',
    },
    {
      id: 't2',
      name: '夜猫子',
      description: '夜晚行动时精神与创造力提升，熬夜惩罚减少',
      icon: 'moon',
      rarity: 'common',
    },
    {
      id: 't3',
      name: '过目不忘',
      description: '阅读与学习技能时经验获取提升，复习事件有概率触发',
      icon: 'book-open',
      rarity: 'epic',
    },
  ],
```

替换为：

```ts
  talents: [
    {
      id: 't1',
      name: '共感者',
      description: '更容易理解他人的情绪与想法，社交事件中获得额外好感度',
      icon: 'heart',
      rarity: 'rare',
      level: 1,
      effect: '社交事件中好感度获取 +15%，更易触发深度对话选项',
      acquiredAt: '2026-04-06',
    },
    {
      id: 't2',
      name: '夜猫子',
      description: '夜晚行动时精神与创造力提升，熬夜惩罚减少',
      icon: 'moon',
      rarity: 'common',
      level: 1,
      effect: '夜间行动时精神消耗 -20%，创造力相关事件成功率提升',
      acquiredAt: '2026-04-06',
    },
    {
      id: 't3',
      name: '过目不忘',
      description: '阅读与学习技能时经验获取提升，复习事件有概率触发',
      icon: 'book-open',
      rarity: 'epic',
      level: 1,
      effect: '阅读与学习技能经验获取 +25%，复习事件触发概率 +10%',
      acquiredAt: '2026-04-06',
    },
  ],
```

- [ ] **Step 2: 运行 TypeScript 类型检查**

```bash
cd "F:\AI\no2" && npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 3: Commit**

```bash
cd "F:\AI\no2" && git add src/data/mockData.ts && git commit -m "data: add level, effect, acquiredAt to mock talents"
```

---

### Task 3: 创建 TalentDetailModal 组件

**Files:**
- Create: `src/components/ui/TalentDetailModal.tsx`

**Interfaces:**
- Consumes: `Talent` 类型、`GlassCard` 组件
- Produces: `TalentDetailModal` 组件，接收 `talent` 和 `onClose`

- [ ] **Step 1: 创建组件文件**

创建 `src/components/ui/TalentDetailModal.tsx`，内容如下：

```tsx
import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Talent } from '@/types';

interface TalentDetailModalProps {
  talent: Talent | null;
  onClose: () => void;
}

const rarityMeta: Record<Talent['rarity'], { label: string; color: string; bg: string }> = {
  common: { label: '普通', color: 'text-slate-600', bg: 'bg-slate-100' },
  rare: { label: '稀有', color: 'text-sky-600', bg: 'bg-sky-100' },
  epic: { label: '史诗', color: 'text-purple-600', bg: 'bg-purple-100' },
  legendary: { label: '传说', color: 'text-amber-600', bg: 'bg-amber-100' },
};

export function TalentDetailModal({ talent, onClose }: TalentDetailModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!talent) return;
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [talent, handleEscape]);

  if (!talent) return null;

  const rarity = rarityMeta[talent.rarity];

  return (
    <AnimatePresence>
      {talent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm"
          >
            <GlassCard variant="lavender" className="p-5 overflow-hidden">
              {/* 关闭按钮 */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center transition-colors"
                aria-label="关闭"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>

              {/* 头部 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender-300 to-lavender-500 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-800 truncate">{talent.name}</h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${rarity.bg} ${rarity.color}`}>
                    {rarity.label}
                  </span>
                </div>
              </div>

              {/* 详情字段 */}
              <div className="space-y-3">
                {typeof talent.level === 'number' && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">等级</span>
                    <span className="text-sm font-bold text-slate-700">Lv.{talent.level}</span>
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-500 mb-0.5">介绍</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{talent.description}</p>
                </div>

                {talent.effect && (
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">效果</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{talent.effect}</p>
                  </div>
                )}

                {talent.acquiredAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">获得时间</span>
                    <span className="text-sm text-slate-700 font-number">{talent.acquiredAt}</span>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: 运行 TypeScript 类型检查**

```bash
cd "F:\AI\no2" && npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 3: Commit**

```bash
cd "F:\AI\no2" && git add src/components/ui/TalentDetailModal.tsx && git commit -m "feat: add TalentDetailModal component"
```

---

### Task 4: 改造 TalentItem 组件

**Files:**
- Modify: `src/components/layout/previews/TalentsPreview.tsx`

**Interfaces:**
- Consumes: `TalentDetailModal` 组件
- Produces: 点击天赋打开详情弹窗，hover 显示简要介绍

- [ ] **Step 1: 引入 TalentDetailModal 并添加状态**

在 `src/components/layout/previews/TalentsPreview.tsx` 顶部添加：

```tsx
import { useState } from 'react';
```

以及：

```tsx
import { TalentDetailModal } from '@/components/ui/TalentDetailModal';
```

- [ ] **Step 2: 修改 TalentItem 组件**

将 `TalentItem` 组件改为：

```tsx
function TalentItem({ talent, onClick }: { talent: Talent; onClick: (talent: Talent) => void }) {
  const Icon = talentIconMap[talent.icon] ?? Sparkles;

  return (
    <button
      type="button"
      onClick={() => onClick(talent)}
      className="group relative flex flex-col items-center gap-1 px-2 py-2 min-w-[56px] rounded-xl bg-white/60 border border-lavender-100 cursor-pointer hover:bg-white/80 transition-colors"
    >
      <Icon className="w-4 h-4 text-lavender-500" />
      <span className="text-[10px] text-slate-700 whitespace-nowrap font-medium">{talent.name}</span>

      {/* hover 提示 */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-44 p-2.5 rounded-xl bg-white border border-slate-100 shadow-soft opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
        <p className="text-xs text-slate-800 font-bold">{talent.name}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-3">{talent.description}</p>
        {talent.rarity && (
          <span className="inline-block mt-1 px-1.5 py-0.5 rounded-md bg-lavender-100 text-lavender-600 text-[10px]">
            {talent.rarity === 'legendary' ? '传说' : talent.rarity === 'epic' ? '史诗' : talent.rarity === 'rare' ? '稀有' : '普通'}
          </span>
        )}
      </div>
    </button>
  );
}
```

- [ ] **Step 3: 在 TalentsPreview 中管理弹窗状态**

将 `TalentsPreview` 函数改为：

```tsx
export function TalentsPreview() {
  const { state } = useGame();
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);

  return (
    <div className="space-y-2">
      {/* 天赋才能 —— 居中标题横栏 */}
      <div className="-mx-2.5 -mt-3 px-3 py-3 bg-gradient-to-r from-lavender-50 via-lavender-100/40 to-lavender-50 border-b border-lavender-100/60 text-center">
        <span className="text-base font-bold text-slate-800 tracking-wide">天赋才能</span>
        <div className="mt-1 mx-auto w-8 h-0.5 rounded-full" style={{ backgroundColor: '#8B5CF6' }} />
      </div>

      {/* 天赋列表 —— hover显示简介 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {state.talents.map((talent: Talent) => (
          <TalentItem key={talent.id} talent={talent} onClick={setSelectedTalent} />
        ))}
      </div>

      {/* 三个分类卡片 —— 九宫格图标 */}
      <div className="space-y-2 mt-1">
        {(['daily', 'work', 'special'] as SkillCategory[]).map((cat) => (
          <CategoryCard key={cat} category={cat} />
        ))}
      </div>

      <TalentDetailModal talent={selectedTalent} onClose={() => setSelectedTalent(null)} />
    </div>
  );
}
```

- [ ] **Step 4: 运行 TypeScript 类型检查**

```bash
cd "F:\AI\no2" && npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 5: Commit**

```bash
cd "F:\AI\no2" && git add src/components/layout/previews/TalentsPreview.tsx && git commit -m "feat: add talent hover tooltip and detail modal"
```

---

### Task 5: 验证页面效果

**Files:**
- 无需修改代码，使用 Playwright 验证

**Interfaces:**
- Consumes: 已启动的 Vite 开发服务器（http://localhost:5173）

- [ ] **Step 1: 确认开发服务器正在运行**

```bash
cat /tmp/vite-dev.log | grep -E "VITE|5173"
```

Expected: 显示 `http://localhost:5173/`。

- [ ] **Step 2: 打开天赋才能浮层**

导航至 `http://localhost:5173`，点击左侧「天赋才能」按钮打开浮层。

- [ ] **Step 3: 悬停并点击天赋验证**

- 悬停在天赋上，确认出现 hover 提示。
- 点击天赋，确认弹出详情模态框，显示名称、稀有度、等级、介绍、效果、获得时间。
- 点击关闭按钮或遮罩，确认模态框关闭。

- [ ] **Step 4: 截图保存**

保存截图为 `talent-detail-modal-verification.png`。

- [ ] **Step 5: Commit 验证截图（可选）**

```bash
cd "F:\AI\no2" && git add talent-detail-modal-verification.png && git commit -m "docs: add talent detail modal verification screenshot"
```

---

## Self-Review

**1. Spec coverage:**
- hover 简要介绍 → Task 4 优化 `TalentItem` hover 提示。
- 点击弹窗 → Task 4 调用 `setSelectedTalent`，Task 3 提供 `TalentDetailModal`。
- 名称/稀有度/等级/介绍/效果/获得时间 → Task 3 模态框展示，Task 1/2 提供数据。
- 扩展 Talent 类型 → Task 1。
- 补全 mock 数据 → Task 2。

**2. Placeholder scan:**
- 无 TBD/TODO。
- 每个代码步骤均给出完整代码。
- 命令与预期输出明确。

**3. Type consistency:**
- `Talent` 新增字段在 Task 1 中定义，Task 2 mock 数据、Task 3 模态框、Task 4 组件均一致使用。

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-10-talent-detail-modal-plan.md`. Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
