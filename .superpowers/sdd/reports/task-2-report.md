# Task 2 报告：GameContext 扩展 In-App Notification 状态管理

## 修改文件

1. `src/context/GameContext.tsx`
2. `src/components/ui/NotificationContainer.tsx`

## 修改内容详情

### `src/context/GameContext.tsx`

- **第 36-38 行**：`GameContextValue` 接口中
  - 将 `addInAppNotification` 重命名为 `addNotification`
  - 将 `removeInAppNotification` 重命名为 `dismissNotification`
  - 新增 `clearNotifications: () => void`

- **第 67-68 行**：`Action` 联合类型中
  - 将 `REMOVE_IN_APP_NOTIFICATION` 重命名为 `DISMISS_IN_APP_NOTIFICATION`
  - 新增 `CLEAR_IN_APP_NOTIFICATIONS` action

- **第 195-218 行**：`gameReducer` 中
  - `ADD_IN_APP_NOTIFICATION`：添加新通知后，若总数超过 3 条则移除最早的一条（`shift`），保证最多保留最近 3 条
  - `DISMISS_IN_APP_NOTIFICATION`：按 `id` 过滤移除指定通知
  - `CLEAR_IN_APP_NOTIFICATIONS`：将 `inAppNotifications` 重置为空数组

- **第 376-387 行**：`value` 对象中
  - `addNotification`：生成 ID 格式为 `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  - `dismissNotification`：dispatch `DISMISS_IN_APP_NOTIFICATION`
  - `clearNotifications`：dispatch `CLEAR_IN_APP_NOTIFICATIONS`

### `src/components/ui/NotificationContainer.tsx`

- **第 6 行**：解构方法由 `removeInAppNotification` 改为 `dismissNotification`
- **第 16 行**：关闭回调由 `removeInAppNotification(n.id)` 改为 `dismissNotification(n.id)`

## 实现方式

`GameContext` 采用 `useReducer` 模式。新增通知相关逻辑通过扩展 `Action` 联合类型与 `gameReducer` 分支实现，未引入额外状态管理库或复杂架构。

## 方法签名

```ts
addNotification: (notification: Omit<InAppNotification, 'id'>) => void;
dismissNotification: (id: string) => void;
clearNotifications: () => void;
```

## 初始状态

`src/data/mockData.ts` 第 1132 行已存在 `inAppNotifications: []`，无需补充。

## 类型检查

运行命令：

```bash
npx tsc --noEmit
```

输出：无输出，表示通过，无类型错误。

## Git 提交

提交信息：`feat: GameContext 增加 InAppNotification 状态管理`
