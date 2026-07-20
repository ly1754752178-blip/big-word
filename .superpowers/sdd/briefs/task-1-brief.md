# Task 1: 清理 fatigue 数据模型

## 目标
从项目中彻底移除 `PlayerBodyState.fatigue` 数据字段，包括类型定义、mock 数据以及所有代码/文本引用。

## 必改文件
1. `src/types/index.ts` —— 删除 `PlayerBodyState` 中的 `fatigue: number`。
2. `src/data/mockData.ts` —— 删除 `player.bodyState` 中的 `fatigue` 键值对。

## 检查项
执行全局搜索，确保以下位置无 `fatigue` / `疲劳` 残留：
- 所有 `.ts` / `.tsx` 源文件
- `ui-showcase.html`
- 任何工具函数、组件、mock 数据、类型定义

## 验证命令
```bash
npx tsc --noEmit
```
必须无类型错误。

## 提交
使用清晰的 commit message，例如：
```
refactor: 彻底移除 PlayerBodyState.fatigue 数据模型
```

## 全局约束
- 禁用 emoji，使用 Lucide SVG 图标。
- 文本全中文化（logo / 纯视觉元素除外）。
- 所有交互元素需有唯一、描述性的 `id`。
- 使用语义化 HTML。
