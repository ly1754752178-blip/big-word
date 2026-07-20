# Task 6: 全局检查与收尾

## 目标
对个人状态重制进行全局检查，确保无残留、无错误、无 emoji，并验证构建。

## 检查项
1. **fatigue / 疲劳 残留检查**
   - 在 `src/**/*.ts`、`src/**/*.tsx`、根目录 `*.html` 中搜索 `fatigue` / `疲劳`。
   - 运行代码中必须无残留（历史设计文档可保留）。

2. **emoji 检查**
   - 在 Task 1-5 修改的文件中搜索 emoji 字符。
   - 必须无 emoji（Lucide SVG 图标除外）。

3. **中文文本检查**
   - 确认 `PersonalStatusOverlay` 和 `StatusPreview` 中所有可见文本为中文。

4. **类型检查**
   - 运行 `npx tsc --noEmit`。

5. **构建检查**
   - 运行 `npm run build`。

## 必改文件（如发现）
- 任何仍包含 `fatigue` / `疲劳` 的运行代码文件。
- 任何包含 emoji 的修改文件。

## 验证命令
```bash
grep -rE "fatigue|疲劳" --include="*.ts" --include="*.tsx" --include="*.html" src/ ui-showcase.html || echo "No fatigue references found"
npx tsc --noEmit
npm run build
```

## 提交
```
chore: 个人状态重制收尾检查
```

## 全局约束
- 禁用 emoji，使用 Lucide SVG 图标。
- 文本全中文化。
- 所有交互元素需有唯一、描述性的 `id`。
