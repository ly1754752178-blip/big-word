# Task 2: 在 GameContext 中扩展通知状态

## 目标
在 `GameContext` 中增加全局 In-App Notification 的状态管理能力，为后续 UI 组件提供数据与操作接口。

## 必改文件
1. `src/context/GameContext.tsx` —— 增加 `inAppNotifications` 状态、`addNotification`、`dismissNotification`、`clearNotifications` 方法。
2. `src/hooks/useGameState.ts`（如需要）—— 确保 hook 返回上述方法。

## 接口要求
新增的 Context 方法签名：

```ts
addNotification: (notification: Omit<InAppNotification, 'id'>) => void;
dismissNotification: (id: string) => void;
clearNotifications: () => void;
```

`InAppNotification` 类型已存在于 `src/types/index.ts`：

```ts
export interface InAppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
}
```

## 行为要求
- `addNotification` 自动生成唯一 `id`（建议 `notif-${timestamp}-${random}`）。
- `addNotification` 最多保留最近 3 条通知（超出时移除最早的）。
- `dismissNotification` 按 id 移除指定通知。
- `clearNotifications` 清空所有通知。
- 初始状态 `inAppNotifications: []`。

## 实现提示
- 先阅读 `src/context/GameContext.tsx` 与 `src/hooks/useGameState.ts` 的现有实现模式（useState / useReducer）。
- 如果 GameContext 使用 useState + setState，按示例实现即可。
- 如果使用 useReducer，需要新增 action 类型。

## 验证命令
```bash
npx tsc --noEmit
```
必须无类型错误。

## 提交
```
feat: GameContext 增加 InAppNotification 状态管理
```

## 全局约束
- 不使用 emoji。
- 代码清晰可维护，避免过度复杂。
- 关键逻辑显式可追踪。
