# 酒馆融合重制 — 设计方案

日期：2026-07-12

---

## 1. 目标

1. **酒馆对话与故事界面融合**：将 SillyTavern API 对话能力接入 NarrativePanel，AI 回复直接渲染为场景旁白、角色气泡、选项按钮。
2. **酒馆大厅作为入口**：用户先进入配置大厅，创建/选择对话后进入游戏主界面。大厅和游戏可随时切换。

---

## 2. 架构变更

### 2.1 双页面状态

不引入 React Router，用 `useState` 切换：

```
App.tsx (GameProvider 包裹)
  ├── page === 'lobby' → TavernLobby
  └── page === 'game'  → GameLayout (现有 TopBar + LeftSidebar + NarrativePanel + RightPanel)
```

- 酒馆状态（`useSillytavern`）在 App 层初始化，lobby 和 game 共享。
- TopBar 新增「返回大厅」按钮（游戏内可见）。
- 现有全屏浮层 `OverlayRenderer` 在 game 模式下保留不变。

### 2.2 分支对话移除

- `prompt-assembler.ts` 中移除 `truncateChatAt`、`branchChat` 导出
- `useSillytavern.ts` 中移除 `editMessage`、`deleteMessagesFrom`、`branchFromMessage`
- UI 组件 `HistoryDrawer` 仅保留查看功能，移除分支/删除按钮

---

## 3. 酒馆大厅（TavernLobby）

### 3.1 布局

```
┌──────────────────────────────────────────────────────┐
│                视频背景（全屏 object-fit: cover）     │
│                                        ┌───────────┐│
│                                        │《孤独摇滚1》││
│                                        │ ⏮  ▶/⏸  ⏭││
│                                        │ 🔊 ──────  ││
│                                        └───────────┘│
│                                                      │
│  ┌─────────────────┐                                 │
│  │ 🎮 开始游戏      │                                 │
│  │ 📂 继续游戏      │                                 │
│  │ 📚 世界书        │                                 │
│  │ 🔌 API 配置      │                                 │
│  │ ⚙️ 预设          │                                 │
│  │ 🎭 设置          │                                 │
│  └─────────────────┘                                 │
└──────────────────────────────────────────────────────┘
```

### 3.2 视频背景

**源文件夹：**
- `public/videos/shipinbeijing60/` — 定时轮换模式
- `public/videos/shipinbeijing00/` — 自然播放模式

**选择规则：**
- 每次启动项目进入主页面，**随机**选择上述两个文件夹之一
- 播放选中文件夹内的所有视频文件

**播放模式：**

| 文件夹 | 切换规则 | 视频提前播完 | 60 秒到时 |
|---|---|---|---|
| `shipinbeijing60` | 每 60 秒强制切换下一个 | 循环重复当前视频 | 直接截断，切到下一个 |
| `shipinbeijing00` | 无倒计时，播完自然切换 | — | 不适用 |

- 视频铺满全屏，`object-fit: cover`
- 叠加半透明暗色遮罩确保文字可读
- 所有视频循环遍历

### 3.3 视频播放器控件（右上角）

- 顶部显示当前视频文件名，用《》包裹（如《孤独摇滚1》）
- 控制栏排列：`⏮ 上一曲` → `▶/⏸ 播放/暂停`（同一按钮 toggle）→ `⏭ 下一曲`
- 下方为音量滑块
- 半透明磨砂玻璃风格，悬停时完全显示
- 纯前端实现

### 3.4 左侧菜单

- 竖排罗列 6 个选项，3A 大作经典主菜单风格
- 选中/悬停高亮（发光边框）
- 「🎮 开始游戏」：
  - 始终直接创建新对话并进入游戏（不弹列表）
- 「📂 继续游戏」：
  - 弹出「存档列表」对话框，列出已有对话
  - 可选择继续某个存档
  - 无存档时显示空列表提示
- 「📚 世界书」→ 弹出 `LorebookModal`
- 「🔌 API 配置」→ 弹出 API 配置面板
- 「⚙️ 预设」→ 弹出 `PresetModal`
- 「🎭 设置」→ 弹出 `SettingsModal`

---

## 4. 游戏界面

### 4.1 NarrativePanel 融合

`NarrativePanel` 作为酒馆对话主界面，替换使用 mock LLM 的 `useLLM`，改用 SillyTavern 的 `routeApiCall`。

### 4.2 AI 输出解析规则

| 标签 | 渲染方式 |
|---|---|
| `<角色名>内容</角色名>` | 对话气泡 + `public/juesetouxiang/角色名.png` 头像 |
| 无标签包裹的裸文本 | 居中场景旁白（scene 类型） |
| `<option>A</option>` | 可点击选项按钮 |
| `<thinking>...</thinking>` | 隐藏，通过 SkyOrb 点击 toggle 展开 |
| `<think>...</think>` | 同 thinking |
| `<vars>{JSON}</vars>` | 变量自动更新，不显示 |

### 4.3 角色头像匹配

- 头像图片放在 `public/juesetouxiang/` 目录
- 文件名（不含扩展名）即角色名
- 例如 `public/juesetouxiang/雪之下雪乃.png` 匹配 `<雪之下雪乃>你好</雪之下雪乃>`
- 未匹配到时显示默认占位头像

### 4.4 输入框左侧功能按钮

- 原「历史」按钮替换为「🔧」综合功能按钮
- 点击**向上展开**小矩形面板
- 面板内仅 2 项：
  - **变量** — 查看/编辑当前对话变量
  - **历史楼层** — 查看历史消息列表（只读，无分支/删除）

### 4.5 SkyOrb 交互

- 点击 toggle 展开/折叠 `<thinking>` 思考过程
- 展开后再点击即折叠，反之亦然
- 思考内容渲染在 NarrativePanel 消息区顶部

### 4.6 正文滚动

- NarrativePanel 消息区支持垂直滚动
- 新消息自动滚动到底部
- 用户手动上翻时不强制滚动

---

## 5. 数据流

```
用户输入 → NarrativePanel 输入框
    ↓
GameContext.sendNarrativeMessage(input)
    ↓
useSillytavern → assemblePrompt (世界书+预设+变量)
    ↓
routeApiCall (主 API，可选次 API)
    ↓
LLM 流式回复 → stream-parser 实时解析
    ↓
解析结果 → 转换为 NarrativeMessage[]
    ├── <角色名>对话</角色名> → { type: 'dialogue', speaker, content, speakerAvatar }
    ├── 裸文本               → { type: 'scene', content }
    ├── <option>             → { type: 'option', options }
    ├── <thinking>           → 存入 thinkingContent 状态（SkyOrb 控制显示）
    └── <vars>               → updateVariables (不产生消息)
```

---

## 6. 文件变更清单

### 6.1 新增文件

| 文件 | 说明 |
|---|---|
| `src/app/TavernLobby.tsx` | 酒馆大厅主组件 |
| `src/app/GameLayout.tsx` | 游戏布局组件（从 page.tsx 抽取） |
| `src/components/lobby/VideoBackground.tsx` | 视频背景 + 播放器控件 |
| `src/components/lobby/LobbyMenu.tsx` | 左侧菜单列表 |
| `src/components/modules/ThinkingPanel.tsx` | 思考过程展开面板 |

### 6.2 修改文件

| 文件 | 变更 |
|---|---|
| `src/app/page.tsx` | 改为双页状态切换入口 |
| `src/components/modules/NarrativePanel.tsx` | 替换 useLLM → useSillytavern，新增角色标签解析 |
| `src/components/layout/TopBar.tsx` | 新增「返回大厅」按钮 |
| `src/components/layout/LeftSidebar.tsx` | 移除旧酒馆入口（如有） |
| `src/components/ui/SkyOrb.tsx` | 新增点击 toggle thinking 逻辑 |
| `src/hooks/useSillytavern.ts` | 移除分支相关函数 |
| `src/sillytavern/prompt-assembler.ts` | 移除 truncateChatAt、branchChat |
| `src/components/SillyTavern/HistoryDrawer.tsx` | 仅保留查看模式 |
| `src/components/SillyTavern/GameView.tsx` | 不再需要（被 NarrativePanel 取代） |

### 6.3 静态资源

| 操作 | 路径 |
|---|---|
| 新建目录（视频） | `public/videos/shipinbeijing60/` |
| 新建目录（视频） | `public/videos/shipinbeijing00/` |
| 新建目录（头像） | `public/juesetouxiang/`（用户自行放入头像） |

### 6.4 可以移除/不再使用的文件

| 文件 | 原因 |
|---|---|
| `src/components/SillyTavern/GameView.tsx` | 被 NarrativePanel 取代 |
| `src/components/SillyTavern/Chat.tsx` | 被 NarrativePanel 取代 |
| `src/components/SillyTavern/ChatModal.tsx` | 对话列表移入大厅 |
| `src/components/SillyTavern/OptionList.tsx` | NarrativePanel 已有选项渲染 |
| `src/components/SillyTavern/MainTextPane.tsx` | NarrativePanel 已有正文渲染 |
| `src/components/SillyTavern/ThinkingFold.tsx` | 被 ThinkingPanel 取代 |
| `src/components/overlays/SillyTavernOverlay.tsx` | 酒馆不再是浮层 |

---

## 7. 验收标准

- [ ] 启动项目进入酒馆大厅，视频背景随机选择 shipinbeijing60 或 00 文件夹播放
- [ ] shipinbeijing60 模式：定时 60 秒强切，提前播完则循环
- [ ] shipinbeijing00 模式：自然播完切下一个
- [ ] 视频播放器控件显示《文件名》、暂停/播放 toggle、上下曲、音量
- [ ] 点击「开始游戏」→ 无对话时直接创建并进入
- [ ] 有对话时弹出列表，选择后进入
- [ ] 大厅其他菜单项弹出对应配置面板
- [ ] 游戏内 NarrativePanel 发送消息 → 调用酒馆 API
- [ ] AI 回复按角色标签正确渲染气泡 + 头像
- [ ] 裸文本渲染为居中场景旁白
- [ ] 选项渲染为可点击按钮
- [ ] SkyOrb 点击展开/折叠思考过程
- [ ] 输入框左侧按钮展开变量 + 历史楼层
- [ ] TopBar「返回大厅」按钮可切回大厅
- [ ] TypeScript 编译零错误
- [ ] Vite 构建成功
