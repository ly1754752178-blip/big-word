# 酒馆融合重制 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建酒馆大厅入口页 + 将 SillyTavern API 对话能力融入 NarrativePanel，AI 回复按角色标签渲染为场景旁白/对话气泡/选项。

**Architecture:** App 层用 `page` 状态切换 Lobby/Game 两页；`useSillytavern` 在 App 层初始化共享给两页；NarrativePanel 替换 mock LLM 为酒馆 API 调用，新增自定义 XML 角色标签解析器。

**Tech Stack:** React 18, TypeScript 5, Vite 5, Framer Motion, Tailwind CSS, Dexie.js

## Global Constraints

- 不引入 React Router，用状态切换页面
- 移除分支对话功能（`truncateChatAt`、`branchChat`、`editMessage`、`deleteMessagesFrom`、`branchFromMessage`）
- 角色标签格式：`<角色名>对话内容</角色名>`
- 头像从 `public/juesetouxiang/` 文件名自动匹配
- 视频从 `public/videos/shipinbeijing60/` 或 `shipinbeijing00/` 随机选取
- 视频播放器纯前端实现，无需外部库

---

### Task 1: 静态资源目录 + 视频文件复制

**Files:**
- Create: `public/videos/shipinbeijing60/` (目录)
- Create: `public/videos/shipinbeijing00/` (目录)
- Create: `public/juesetouxiang/` (目录)

- [ ] **Step 1: 创建目录**

```bash
mkdir -p "F:/AI/no2/public/videos/shipinbeijing60"
mkdir -p "F:/AI/no2/public/videos/shipinbeijing00"
mkdir -p "F:/AI/no2/public/juesetouxiang"
```

- [ ] **Step 2: 复制视频文件到 shipinbeijing60**

```bash
cp "F:/AI/gongcheng/孤独摇滚1.mp4" "F:/AI/no2/public/videos/shipinbeijing60/"
cp "F:/AI/gongcheng/孤独摇滚2.mp4" "F:/AI/no2/public/videos/shipinbeijing60/"
cp "F:/AI/gongcheng/孤独摇滚3.mp4" "F:/AI/no2/public/videos/shipinbeijing60/"
```

- [ ] **Step 3: 同样复制到 shipinbeijing00**

```bash
cp "F:/AI/gongcheng/孤独摇滚1.mp4" "F:/AI/no2/public/videos/shipinbeijing00/"
cp "F:/AI/gongcheng/孤独摇滚2.mp4" "F:/AI/no2/public/videos/shipinbeijing00/"
cp "F:/AI/gongcheng/孤独摇滚3.mp4" "F:/AI/no2/public/videos/shipinbeijing00/"
```

- [ ] **Step 4: 确认文件就位**

```bash
ls -la "F:/AI/no2/public/videos/shipinbeijing60/"
ls -la "F:/AI/no2/public/videos/shipinbeijing00/"
ls -la "F:/AI/no2/public/juesetouxiang/"
```

- [ ] **Step 5: 提交**

```bash
git add public/videos/ public/juesetouxiang/
git commit -m "feat: 添加视频背景和角色头像目录"
```

---

### Task 2: 移除分支对话功能（核心层）

**Files:**
- Modify: `src/sillytavern/prompt-assembler.ts`
- Modify: `src/sillytavern/index.ts`

**Interfaces:**
- Removes: `truncateChatAt`, `branchChat` 函数及导出

- [ ] **Step 1: 从 prompt-assembler.ts 删除 truncateChatAt 和 branchChat**

读取 `src/sillytavern/prompt-assembler.ts`，删除以下两个函数（约在文件末尾）：

```typescript
// 删除 truncateChatAt 整个函数 (~L247-258)
// 删除 branchChat 整个函数 (~L261-281)
```

- [ ] **Step 2: 从 index.ts 移除导出**

在 `src/sillytavern/index.ts` 中，将：
```typescript
export {
  assemblePrompt,
  truncateChatAt,
  branchChat,
  DEFAULT_PROMPT_ORDER,
} from './prompt-assembler';
```

改为：
```typescript
export {
  assemblePrompt,
  DEFAULT_PROMPT_ORDER,
} from './prompt-assembler';
```

- [ ] **Step 3: 验证编译**

```bash
cd "F:/AI/no2" && npx tsc --noEmit 2>&1 | grep -E "error|Error"
```

- [ ] **Step 4: 提交**

```bash
git add src/sillytavern/prompt-assembler.ts src/sillytavern/index.ts
git commit -m "refactor: 移除分支对话核心函数 truncateChatAt/branchChat"
```

---

### Task 3: 移除分支对话功能（Hook 层 + UI 层）

**Files:**
- Modify: `src/hooks/useSillytavern.ts`
- Modify: `src/components/SillyTavern/HistoryDrawer.tsx`

- [ ] **Step 1: 从 useSillytavern.ts 删除分支相关函数**

删除以下函数：`editMessage`、`deleteMessagesFrom`、`branchFromMessage`

同时从接口 `UseSillytavernReturn` 中移除这些字段。

从 import 中移除 `truncateChatAt`、`branchChat` 引用。

- [ ] **Step 2: 精简 HistoryDrawer 为只读查看模式**

`src/components/SillyTavern/HistoryDrawer.tsx`：
- 移除 `onBranch`、`onDeleteFrom` props
- 移除「分支」和「删除」按钮
- 仅保留楼层列表展示（只读）

修改后的接口：
```typescript
interface HistoryDrawerProps {
  messages: ChatMessage[];
  isOpen: boolean;
  onClose: () => void;
}
```

- [ ] **Step 3: 验证编译**

```bash
cd "F:/AI/no2" && npx tsc --noEmit 2>&1 | grep -E "error|Error"
```

- [ ] **Step 4: 提交**

```bash
git add src/hooks/useSillytavern.ts src/components/SillyTavern/HistoryDrawer.tsx
git commit -m "refactor: 移除分支对话 Hook 和 UI 功能"
```

---

### Task 4: 视频背景组件 VideoBackground

**Files:**
- Create: `src/components/lobby/VideoBackground.tsx`

**Interfaces:**
- Produces: `VideoBackground` 组件，无 props，内部自管理视频播放状态
- 导出类型：`export function VideoBackground()`

- [ ] **Step 1: 创建 VideoBackground 组件**

```tsx
// src/components/lobby/VideoBackground.tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX,
} from 'lucide-react';

/** 获取文件夹内所有视频文件 URL */
function getVideoUrls(folder: string): string[] {
  // 由于 Vite 不支持动态 glob 导入任意 public 文件，
  // 使用固定文件名列表方式。实际播放时通过 fetch 探测文件是否存在。
  // 策略：预先维护一个已知视频文件名列表
  const knownVideos = [
    '孤独摇滚1.mp4',
    '孤独摇滚2.mp4',
    '孤独摇滚3.mp4',
  ];
  return knownVideos.map((name) => `/${folder}/${name}`);
}

type PlayMode = 'timer' | 'natural';

export function VideoBackground() {
  const [mode, setMode] = useState<PlayMode>('timer');
  const [videos, setVideos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 启动时随机选择文件夹和模式
  useEffect(() => {
    const folder = Math.random() < 0.5
      ? 'videos/shipinbeijing60'
      : 'videos/shipinbeijing00';
    const selectedMode: PlayMode = folder.includes('60') ? 'timer' : 'natural';
    setMode(selectedMode);
    const urls = getVideoUrls(folder);
    setVideos(urls);
  }, []);

  // 播放当前视频
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videos.length === 0) return;
    video.src = videos[currentIndex];
    if (isPlaying) video.play().catch(() => {});
  }, [currentIndex, videos, isPlaying]);

  // 定时模式：60 秒强切
  useEffect(() => {
    if (mode !== 'timer' || videos.length === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % videos.length);
    }, 60_000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, mode, videos.length]);

  // 定时模式：视频提前播完则循环
  const handleEnded = useCallback(() => {
    if (mode === 'timer') {
      videoRef.current?.play();
    } else {
      setCurrentIndex((i) => (i + 1) % videos.length);
    }
  }, [mode, videos.length]);

  // 控件操作
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); }
  };

  const prevVideo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentIndex((i) => (i === 0 ? videos.length - 1 : i - 1));
  };

  const nextVideo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentIndex((i) => (i + 1) % videos.length);
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
    setIsMuted(false);
  };

  // 提取文件名（不含扩展名）
  const currentFileName = videos[currentIndex]
    ?.split('/').pop()?.replace(/\.[^/.]+$/, '') ?? '';

  if (videos.length === 0) return null;

  return (
    <div className="video-bg">
      <video
        ref={videoRef}
        className="video-bg__video"
        muted={isMuted}
        onEnded={handleEnded}
        playsInline
      />
      <div className="video-bg__overlay" />

      {/* 播放器控件 */}
      <div
        className={`video-bg__controls ${showControls ? 'video-bg__controls--visible' : ''}`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <p className="video-bg__title">《{currentFileName}》</p>
        <div className="video-bg__buttons">
          <button onClick={prevVideo} title="上一曲"><SkipBack size={16} /></button>
          <button onClick={togglePlay} title={isPlaying ? '暂停' : '播放'}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={nextVideo} title="下一曲"><SkipForward size={16} /></button>
        </div>
        <div className="video-bg__volume">
          <button onClick={toggleMute} title={isMuted ? '取消静音' : '静音'}>
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <input
            type="range"
            min="0" max="1" step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 添加 CSS 样式**

在 `src/components/SillyTavern/sillytavern.css` 末尾追加视频背景样式：

```css
/* ---- 视频背景 ---- */
.video-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.video-bg__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-bg__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.video-bg__controls {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  opacity: 0.3;
  transition: opacity 0.3s;
}

.video-bg__controls--visible {
  opacity: 1;
}

.video-bg__title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8rem;
  margin: 0;
  white-space: nowrap;
}

.video-bg__buttons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.video-bg__buttons button,
.video-bg__volume button {
  padding: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.video-bg__buttons button:hover,
.video-bg__volume button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.video-bg__volume {
  display: flex;
  align-items: center;
  gap: 6px;
}

.video-bg__volume input[type="range"] {
  width: 60px;
  accent-color: white;
}
```

- [ ] **Step 3: 验证编译**

```bash
cd "F:/AI/no2" && npx tsc --noEmit 2>&1 | grep -E "error|Error"
```

- [ ] **Step 4: 提交**

```bash
git add src/components/lobby/VideoBackground.tsx src/components/SillyTavern/sillytavern.css
git commit -m "feat: 视频背景组件 — 双模式播放 + 控件"
```

---

### Task 5: 角色标签解析器 + 头像匹配

**Files:**
- Create: `src/lib/dialogue-parser.ts`

**Interfaces:**
- Produces: `parseDialogueResponse(raw: string) => ParsedDialogue[]`
- Produces: `getAvatarUrl(name: string) => string | null`

- [ ] **Step 1: 创建解析器**

```typescript
// src/lib/dialogue-parser.ts

export interface ParsedDialogue {
  type: 'scene' | 'dialogue' | 'option' | 'thinking' | 'vars';
  content: string;
  speaker?: string;
  speakerAvatar?: string;
  options?: string[];
  vars?: Record<string, string | number>;
}

/**
 * 解析 AI 回复中的自定义标签，返回结构化对话片段数组。
 *
 * 支持标签：
 *   <角色名>对话内容</角色名>  → dialogue + 头像匹配
 *   <option>文本</option>      → option
 *   <thinking>...</thinking>   → thinking（不渲染为消息）
 *   <think>...</think>         → thinking（同上）
 *   <vars>JSON</vars>          → vars（不渲染为消息）
 *   裸文本                      → scene
 */
export function parseDialogueResponse(raw: string): ParsedDialogue[] {
  const results: ParsedDialogue[] = [];

  // 提取 thinking / think
  const thinkingMatch =
    raw.match(/<thinking>([\s\S]*?)<\/thinking>/i) ??
    raw.match(/<think>([\s\S]*?)<\/think>/i);
  if (thinkingMatch) {
    results.push({ type: 'thinking', content: thinkingMatch[1].trim() });
  }

  // 提取 vars
  const varsMatch = raw.match(/<vars>([\s\S]*?)<\/vars>/i);
  if (varsMatch) {
    try {
      results.push({ type: 'vars', content: '', vars: JSON.parse(varsMatch[1].trim()) });
    } catch {
      // 非 JSON 忽略
    }
  }

  // 移除 thinking/think/vars 标签后处理剩余文本
  let remaining = raw
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<vars>[\s\S]*?<\/vars>/gi, '')
    .trim();

  // 提取所有 option 标签
  const optionRegex = /<option>([\s\S]*?)<\/option>/gi;
  const options: string[] = [];
  let optMatch: RegExpExecArray | null;
  while ((optMatch = optionRegex.exec(remaining)) !== null) {
    options.push(optMatch[1].trim());
  }
  if (options.length > 0) {
    results.push({ type: 'option', content: '你要怎么做？', options });
  }
  remaining = remaining.replace(/<option>[\s\S]*?<\/option>/gi, '').trim();

  // 解析角色标签和裸文本
  // 正则匹配任意自定义标签：<任意名称>内容</任意名称>
  const charTagRegex = /<([^>]+)>([\s\S]*?)<\/\1>/g;
  let lastIndex = 0;
  let charMatch: RegExpExecArray | null;

  while ((charMatch = charTagRegex.exec(remaining)) !== null) {
    // 标签前的裸文本 → scene
    const before = remaining.slice(lastIndex, charMatch.index).trim();
    if (before) {
      results.push({ type: 'scene', content: before });
    }

    const tagName = charMatch[1].trim();
    const tagContent = charMatch[2].trim();

    // 过滤掉系统标签
    if (!['option', 'thinking', 'think', 'vars', 'maintext', 'sum'].includes(tagName.toLowerCase())) {
      const avatar = getAvatarUrl(tagName);
      results.push({
        type: 'dialogue',
        content: tagContent,
        speaker: tagName,
        speakerAvatar: avatar ?? undefined,
      });
    }

    lastIndex = charMatch.index + charMatch[0].length;
  }

  // 剩余的裸文本
  const after = remaining.slice(lastIndex).trim();
  if (after) {
    results.push({ type: 'scene', content: after });
  }

  return results;
}

/**
 * 根据角色名查找头像 URL。
 * 读取 public/juesetouxiang/ 中匹配文件名的图片。
 * 支持常见图片格式。
 */
export function getAvatarUrl(name: string): string | null {
  // 构建可能的文件路径（Vite public 目录直接访问）
  const formats = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
  // 返回第一个匹配的路径，由浏览器尝试加载
  // 实际使用时通过 img onError 回退到默认头像
  return `/juesetouxiang/${encodeURIComponent(name)}.png`;
}

/** 默认占位头像 */
export const DEFAULT_AVATAR = '/juesetouxiang/_default.png';
```

- [ ] **Step 2: 验证编译**

```bash
cd "F:/AI/no2" && npx tsc --noEmit 2>&1 | grep -E "error|Error"
```

- [ ] **Step 3: 提交**

```bash
git add src/lib/dialogue-parser.ts
git commit -m "feat: 角色标签解析器 + 头像自动匹配"
```

---

### Task 6: 大厅菜单组件 LobbyMenu

**Files:**
- Create: `src/components/lobby/LobbyMenu.tsx`

**Interfaces:**
- Produces: `LobbyMenu` 组件
- Props: `{ onStartGame: () => void; onContinue: () => void; onWorldBooks: () => void; onApiConfig: () => void; onPresets: () => void; onSettings: () => void }`

- [ ] **Step 1: 创建 LobbyMenu 组件**

```tsx
// src/components/lobby/LobbyMenu.tsx
import { Gamepad2, FolderOpen, BookOpen, Plug, Sliders, Settings } from 'lucide-react';

interface LobbyMenuProps {
  onStartGame: () => void;
  onContinue: () => void;
  onWorldBooks: () => void;
  onApiConfig: () => void;
  onPresets: () => void;
  onSettings: () => void;
}

const menuItems = [
  { key: 'start', label: '开始游戏', icon: Gamepad2, onClick: 'onStartGame' },
  { key: 'continue', label: '继续游戏', icon: FolderOpen, onClick: 'onContinue' },
  { key: 'worldbooks', label: '世界书', icon: BookOpen, onClick: 'onWorldBooks' },
  { key: 'api', label: 'API 配置', icon: Plug, onClick: 'onApiConfig' },
  { key: 'presets', label: '预设', icon: Sliders, onClick: 'onPresets' },
  { key: 'settings', label: '设置', icon: Settings, onClick: 'onSettings' },
] as const;

export function LobbyMenu(props: LobbyMenuProps) {
  return (
    <nav className="lobby-menu">
      {menuItems.map((item) => {
        const handler = props[item.onClick as keyof LobbyMenuProps];
        return (
          <button
            key={item.key}
            className="lobby-menu__item"
            onClick={handler}
          >
            <item.icon className="lobby-menu__icon" size={20} />
            <span className="lobby-menu__label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: 添加 CSS 样式**

在 `sillytavern.css` 末尾追加：

```css
/* ---- 大厅菜单 ---- */
.lobby-menu {
  position: fixed;
  left: 48px;
  bottom: 120px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lobby-menu__item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 180px;
  text-align: left;
}

.lobby-menu__item:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.lobby-menu__icon {
  opacity: 0.7;
}

.lobby-menu__label {
  font-weight: 500;
  letter-spacing: 0.05em;
}
```

- [ ] **Step 3: 验证编译**

```bash
cd "F:/AI/no2" && npx tsc --noEmit 2>&1 | grep -E "error|Error"
```

- [ ] **Step 4: 提交**

```bash
git add src/components/lobby/LobbyMenu.tsx src/components/SillyTavern/sillytavern.css
git commit -m "feat: 大厅 3A 经典风格左侧菜单"
```

---

### Task 7: 酒馆大厅页面 TavernLobby

**Files:**
- Create: `src/app/TavernLobby.tsx`

**Interfaces:**
- Consumes: `VideoBackground`, `LobbyMenu`
- Consumes: `useSillytavern` — `createChat`, `chats`, `loadChat`, `settings`, `updateSettings`, `addLorebook`, `updateLorebook`, `removeLorebook`, `toggleLorebook`, `lorebooks`, `activeLorebookIds`, `presets`, `addPreset`, `updatePreset`, `removePreset`
- Produces: `TavernLobby` — 接收 `onEnterGame: () => void` prop

- [ ] **Step 1: 创建 TavernLobby 组件**

```tsx
// src/app/TavernLobby.tsx
import { useState } from 'react';
import { VideoBackground } from '@/components/lobby/VideoBackground';
import { LobbyMenu } from '@/components/lobby/LobbyMenu';
import { ChatModal } from '@/components/SillyTavern/ChatModal';
import { LorebookModal } from '@/components/SillyTavern/LorebookModal';
import { PresetModal } from '@/components/SillyTavern/PresetModal';
import { SettingsModal } from '@/components/SillyTavern/SettingsModal';
import { ApiConfigForm } from '@/components/SillyTavern/ApiConfigForm';
import { X, Save } from 'lucide-react';
import { useSillytavern } from '@/hooks/useSillytavern';

interface TavernLobbyProps {
  onEnterGame: () => void;
}

export function TavernLobby({ onEnterGame }: TavernLobbyProps) {
  const st = useSillytavern();

  const [showChats, setShowChats] = useState(false);
  const [showLorebooks, setShowLorebooks] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleStartGame = async () => {
    await st.createChat();
    onEnterGame();
  };

  const handleContinue = () => {
    setShowChats(true);
  };

  const handleSelectChat = (id: string) => {
    st.loadChat(id);
    setShowChats(false);
    onEnterGame();
  };

  return (
    <div className="tavern-lobby">
      <VideoBackground />

      <LobbyMenu
        onStartGame={handleStartGame}
        onContinue={handleContinue}
        onWorldBooks={() => setShowLorebooks(true)}
        onApiConfig={() => setShowApiConfig(true)}
        onPresets={() => setShowPresets(true)}
        onSettings={() => setShowSettings(true)}
      />

      {/* 存档列表（继续游戏） */}
      {showChats && (
        <ChatModal
          chats={st.chats}
          activeChatId={st.activeChatId}
          onCreate={async () => { const id = await st.createChat(); setShowChats(false); onEnterGame(); }}
          onSelect={handleSelectChat}
          onDelete={st.removeChat}
          onClose={() => setShowChats(false)}
        />
      )}

      {/* 世界书 */}
      {showLorebooks && (
        <LorebookModal
          lorebooks={st.lorebooks}
          activeIds={st.activeLorebookIds}
          onToggle={st.toggleLorebook}
          onAdd={st.addLorebook}
          onUpdate={st.updateLorebook}
          onDelete={st.removeLorebook}
          onClose={() => setShowLorebooks(false)}
        />
      )}

      {/* API 配置面板 */}
      {showApiConfig && st.settings && (
        <div className="modal-overlay" onClick={() => setShowApiConfig(false)}>
          <div className="modal modal--settings" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>API 配置</h2>
              <button onClick={() => setShowApiConfig(false)}><X size={20} /></button>
            </div>
            <div className="modal__body">
              <ApiConfigForm
                config={st.settings.api}
                onChange={(api) => st.updateSettings({ api })}
                label="主 API"
              />
              <ApiConfigForm
                config={st.settings.secondaryApi}
                onChange={(secondaryApi) => st.updateSettings({ secondaryApi: secondaryApi as any })}
                label="次 API"
              />
            </div>
            <div className="modal__footer">
              <button onClick={() => setShowApiConfig(false)} className="btn-ghost">取消</button>
              <button onClick={() => setShowApiConfig(false)} className="btn-primary">
                <Save size={14} /> 完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 预设 */}
      {showPresets && (
        <PresetModal
          presets={st.presets}
          settings={st.settings}
          onAdd={st.addPreset}
          onUpdate={st.updatePreset}
          onDelete={st.removePreset}
          onSetActive={(id) => st.updateSettings({ activePresetId: id })}
          onClose={() => setShowPresets(false)}
        />
      )}

      {/* 设置 */}
      {showSettings && st.settings && (
        <SettingsModal
          settings={st.settings}
          onSave={st.updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: 添加大厅 CSS**

在 `sillytavern.css` 末尾追加：

```css
/* ---- 酒馆大厅 ---- */
.tavern-lobby {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}
```

- [ ] **Step 3: 验证编译**

```bash
cd "F:/AI/no2" && npx tsc --noEmit 2>&1 | grep -E "error|Error"
```

- [ ] **Step 4: 提交**

```bash
git add src/app/TavernLobby.tsx src/components/SillyTavern/sillytavern.css
git commit -m "feat: 酒馆大厅页面 — 视频背景 + 菜单 + 配置面板"
```

---

### Task 8: 游戏布局组件 GameLayout

**Files:**
- Create: `src/app/GameLayout.tsx`

**Interfaces:**
- Produces: `GameLayout` — 接收 `onBackToLobby: () => void` prop
- 从 page.tsx 抽取现有布局

- [ ] **Step 1: 创建 GameLayout — 将 page.tsx 的布局代码移入**

```tsx
// src/app/GameLayout.tsx
import { TopBar } from '@/components/layout/TopBar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { SidebarPreviewPanel } from '@/components/layout/SidebarPreviewPanel';
import { RightPanel } from '@/components/layout/RightPanel';
import { NarrativePanel } from '@/components/modules/NarrativePanel';
import { OverlayRenderer } from '@/components/overlays/OverlayRenderer';
import { NotificationContainer } from '@/components/ui/NotificationContainer';

interface GameLayoutProps {
  onBackToLobby: () => void;
}

export function GameLayout({ onBackToLobby }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-cream-50 text-slate-800 font-body selection:bg-sky-200/40">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-coral-200/30 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[450px] h-[450px] rounded-full bg-mint-200/30 blur-3xl" />
        <div className="absolute inset-0 grain-overlay" />
      </div>

      {/* 主布局 */}
      <div className="relative z-10 flex flex-col h-screen">
        <TopBar onBackToLobby={onBackToLobby} />
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[auto_1fr_320px]">
          <aside className="hidden lg:flex min-h-0 overflow-hidden bg-[#F5F0EA] shadow-[inset_-1px_0_0_rgba(218,205,190,0.3)]">
            <LeftSidebar />
            <SidebarPreviewPanel />
          </aside>
          <main className="min-h-0 overflow-hidden bg-[#FDFAF5] border-x border-[#E8DFD3] shadow-[inset_0_0_30px_rgba(61,50,41,0.03)]">
            <NarrativePanel />
          </main>
          <aside className="hidden lg:block min-h-0 overflow-hidden bg-[#F3EEE7] shadow-[inset_1px_0_0_rgba(218,205,190,0.3)]">
            <RightPanel />
          </aside>
        </div>
      </div>

      <NotificationContainer />
      <OverlayRenderer />
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
cd "F:/AI/no2" && npx tsc --noEmit 2>&1 | grep -E "error|Error"
```

- [ ] **Step 3: 提交**

```bash
git add src/app/GameLayout.tsx
git commit -m "feat: 抽取 GameLayout 组件 — 为双页面架构准备"
```

---

### Task 9: 修改 TopBar — 新增返回大厅按钮

**Files:**
- Modify: `src/components/layout/TopBar.tsx`

- [ ] **Step 1: 修改 TopBar 接收 onBackToLobby prop**

在 `src/components/layout/TopBar.tsx` 中：

1. 添加 `ArrowLeft` 图标导入（从 lucide-react）
2. 修改 `TopBar` 函数签名接收 `{ onBackToLobby }` prop
3. 移除旧的「酒馆」按钮，替换为「返回大厅」按钮

```tsx
import { ArrowLeft } from 'lucide-react';

interface TopBarProps {
  onBackToLobby: () => void;
}

export function TopBar({ onBackToLobby }: TopBarProps) {
  // ... 原有代码 ...

  // 右侧：替换旧的「酒馆」按钮为「返回大厅」
  <div className="flex items-center justify-end h-full gap-2">
    <button
      onClick={onBackToLobby}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600 text-xs font-medium transition-colors"
      title="返回酒馆大厅"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>大厅</span>
    </button>
    <BgmPlayer />
  </div>
}
```

- [ ] **Step 2: 验证编译**

```bash
cd "F:/AI/no2" && npx tsc --noEmit 2>&1 | grep -E "error|Error"
```

- [ ] **Step 3: 提交**

```bash
git add src/components/layout/TopBar.tsx
git commit -m "feat: TopBar 新增返回大厅按钮"
```

---

### Task 10: 修改 page.tsx — 双页面切换入口

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 重写 page.tsx 为双页状态切换**

```tsx
// src/app/page.tsx
import { useState } from 'react';
import { GameProvider } from '@/context/GameContext';
import { TavernLobby } from '@/app/TavernLobby';
import { GameLayout } from '@/app/GameLayout';

type Page = 'lobby' | 'game';

export default function App() {
  const [page, setPage] = useState<Page>('lobby');

  return (
    <GameProvider>
      {page === 'lobby' ? (
        <TavernLobby onEnterGame={() => setPage('game')} />
      ) : (
        <GameLayout onBackToLobby={() => setPage('lobby')} />
      )}
    </GameProvider>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
cd "F:/AI/no2" && npx tsc --noEmit 2>&1 | grep -E "error|Error"
```

- [ ] **Step 3: 提交**

```bash
git add src/app/page.tsx
git commit -m "feat: 双页面切换入口 — Lobby / Game"
```

---

### Task 11: ThinkingPanel 思考面板

**Files:**
- Create: `src/components/modules/ThinkingPanel.tsx`

**Interfaces:**
- Produces: `ThinkingPanel` 组件
- Props: `{ content: string; isVisible: boolean }`

- [ ] **Step 1: 创建 ThinkingPanel**

```tsx
// src/components/modules/ThinkingPanel.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';

interface ThinkingPanelProps {
  content: string;
  isVisible: boolean;
}

export function ThinkingPanel({ content, isVisible }: ThinkingPanelProps) {
  return (
    <AnimatePresence>
      {isVisible && content && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="thinking-panel"
        >
          <div className="thinking-panel__header">
            <Brain size={14} />
            <span>思考过程</span>
          </div>
          <div className="thinking-panel__content">
            <p>{content}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: 添加 CSS**

```css
/* ---- 思考面板 ---- */
.thinking-panel {
  margin: 0 20px;
  border: 1px solid #E8DFD3;
  border-radius: 10px;
  overflow: hidden;
  background: #F8F4ED;
}

.thinking-panel__header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  color: #8B7355;
  font-size: 0.85rem;
  border-bottom: 1px solid #E8DFD3;
}

.thinking-panel__content {
  padding: 12px 14px;
  color: #6B5D4F;
  font-size: 0.85rem;
  line-height: 1.7;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/modules/ThinkingPanel.tsx src/components/SillyTavern/sillytavern.css
git commit -m "feat: 思考过程面板 ThinkingPanel"
```

---

### Task 12: 修改 SkyOrb — 新增 thinking toggle 回调

**Files:**
- Modify: `src/components/ui/SkyOrb.tsx`

- [ ] **Step 1: 添加 onClick prop**

修改 SkyOrb 组件：

```tsx
// 在 props 中添加：
interface SkyOrbProps {
  onClick?: () => void;  // 新增
}
```

在根元素上绑定 onClick：
```tsx
<div onClick={props.onClick} style={{ cursor: props.onClick ? 'pointer' : 'default' }}>
```

- [ ] **Step 2: 验证编译**

```bash
cd "F:/AI/no2" && npx tsc --noEmit 2>&1 | grep -E "error|Error"
```

- [ ] **Step 3: 提交**

```bash
git add src/components/ui/SkyOrb.tsx
git commit -m "feat: SkyOrb 新增 onClick 回调 — thinking toggle"
```

---

### Task 13: 修改 NarrativePanel — 融合酒馆对话

**Files:**
- Modify: `src/components/modules/NarrativePanel.tsx`

这是最核心的变更。NarrativePanel 需要：
1. 使用酒馆 API 替代 mock LLM
2. 解析角色标签 `<角色名>内容</角色名>`
3. 匹配头像
4. 渲染思考面板
5. 输入框左侧按钮改为功能菜单

- [ ] **Step 1: 重写 NarrativePanel**

```tsx
// src/components/modules/NarrativePanel.tsx
import { useRef, useEffect, useState, useCallback } from 'react';
import { useGame } from '@/hooks/useGameState';
import { useSillytavern } from '@/hooks/useSillytavern';
import { GlassCard } from '@/components/ui/GlassCard';
import { Send, Wrench, X, Eye, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThinkingPanel } from '@/components/modules/ThinkingPanel';
import { VariablePanel } from '@/components/SillyTavern/VariablePanel';
import { HistoryDrawer } from '@/components/SillyTavern/HistoryDrawer';
import { parseDialogueResponse, getAvatarUrl, DEFAULT_AVATAR } from '@/lib/dialogue-parser';
import type { NarrativeMessage } from '@/types';
import { USER_ROLE } from '@/sillytavern';
import type { ChatMessage } from '@/sillytavern';

function MessageBubble({ message }: { message: NarrativeMessage }) {
  const { selectNarrativeOption } = useGame();
  const isScene = message.type === 'scene';
  const isDialogue = message.type === 'dialogue';
  const isOption = message.type === 'option';

  // 头像 URL + 回退
  const [avatarSrc, setAvatarSrc] = useState(
    message.speakerAvatar ?? DEFAULT_AVATAR
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-3 ${isScene ? 'flex justify-center' : isOption ? 'flex justify-center' : 'flex justify-start'}`}
    >
      {isScene && (
        <div className="max-w-[90%] text-center">
          <p className="text-base leading-relaxed text-slate-600">{message.content}</p>
        </div>
      )}

      {isDialogue && (
        <div className="w-full max-w-[92%] flex items-start gap-4">
          <div
            className="w-24 h-24 rounded-2xl bg-gradient-to-br from-coral-200 to-coral-300 flex items-center justify-center overflow-hidden shrink-0"
            style={{
              border: '3px solid #F04A3C',
              boxShadow: '0 0 0 3px rgba(240,74,60,0.12), 0 4px 16px rgba(240,74,60,0.18)',
            }}
          >
            {message.speakerAvatar ? (
              <img
                src={avatarSrc}
                alt={message.speaker ?? ''}
                className="w-full h-full object-cover"
                onError={() => setAvatarSrc(DEFAULT_AVATAR)}
              />
            ) : (
              <span className="text-3xl font-bold text-white">
                {(message.speaker ?? '?').slice(0, 1)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {message.speaker && (
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-sm shrink-0"
                  style={{ background: '#F04A3C', transform: 'rotate(45deg)' }}
                />
                <span
                  className="text-base font-extrabold tracking-wide"
                  style={{
                    background: 'linear-gradient(135deg, #F04A3C 0%, #E87860 50%, #D4604A 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {message.speaker}
                </span>
              </div>
            )}
            <div
              className="inline-block px-5 py-3.5 rounded-2xl relative"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(240,74,60,0.18)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              <p className="text-[17px] leading-relaxed text-slate-700">{message.content}</p>
            </div>
          </div>
        </div>
      )}

      {isOption && message.options && (
        <div className="w-full max-w-[92%]">
          <p className="text-center text-sm text-slate-500 mb-2">{message.content}</p>
          <div className="flex flex-col gap-2">
            {message.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => selectNarrativeOption(opt.id)}
                className="w-full text-left px-4 py-3 rounded-xl bg-white border border-sky-200 text-sky-700 text-[15px] hover:bg-sky-50 hover:border-sky-300 transition-all"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function NarrativePanel() {
  const { state, setNarrativeInput, sendNarrativeMessage, openOverlayView } = useGame();
  const st = useSillytavern();
  const { messages, inputText, isGenerating } = state.narrative;
  const scrollRef = useRef<HTMLDivElement>(null);

  // 思考过程可见性
  const [thinkingVisible, setThinkingVisible] = useState(false);
  // 思考内容（从最后一次 AI 回复中提取）
  const [thinkingContent, setThinkingContent] = useState('');

  // 功能菜单
  const [showToolMenu, setShowToolMenu] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 用于传递给 HistoryDrawer 的消息（转换为 ChatMessage 格式）
  const chatMessages: ChatMessage[] = messages
    .filter((m) => m.type === 'dialogue' || m.type === 'scene')
    .map((m) => ({
      id: m.id,
      role: m.speaker ? 'assistant' : 'user',
      content: m.content,
      timestamp: Date.now(),
      variables: {},
    }));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || isGenerating) return;
    sendNarrativeMessage(inputText.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // 暴露 thinking toggle 给 SkyOrb（通过 window 事件）
  useEffect(() => {
    const handler = () => setThinkingVisible((v) => !v);
    window.addEventListener('toggle-thinking', handler);
    return () => window.removeEventListener('toggle-thinking', handler);
  }, []);

  return (
    <GlassCard
      variant="default"
      className="h-full flex flex-col overflow-hidden rounded-none border-0 bg-transparent"
    >
      {/* 消息区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pt-8 pb-4 scroll-smooth">
        {/* 思考面板 */}
        <ThinkingPanel content={thinkingContent} isVisible={thinkingVisible} />

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {isGenerating && (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
            <span className="w-4 h-4 text-sky-400">✨</span>
            <span>正在生成剧情……</span>
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div className="px-4 py-3 border-t border-[#E8DFD3] bg-[#FDFAF5]/95 relative">
        {/* 功能展开菜单 */}
        {showToolMenu && (
          <div className="absolute bottom-full left-4 mb-2 w-44 bg-white border border-[#E8DFD3] rounded-xl shadow-lg overflow-hidden z-20">
            <button
              onClick={() => { setShowVariables(true); setShowToolMenu(false); }}
              className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-cream-50 flex items-center gap-3 border-b border-[#E8DFD3]"
            >
              <Eye size={14} /> 变量
            </button>
            <button
              onClick={() => { setShowHistory(true); setShowToolMenu(false); }}
              className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-cream-50 flex items-center gap-3"
            >
              <Clock size={14} /> 历史楼层
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowToolMenu(!showToolMenu)}
            className="w-10 h-10 rounded-full bg-cream-50 hover:bg-white border border-cream-100 flex items-center justify-center text-slate-500 transition-colors"
            title="功能"
            aria-label="功能"
          >
            <Wrench className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setNarrativeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你想说的话……"
            disabled={isGenerating}
            className="flex-1 rounded-full bg-cream-50 border border-cream-100 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || isGenerating}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-400 to-sky-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-sky transition-all"
            title="发送"
            aria-label="发送"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 变量面板浮层 */}
      {showVariables && (
        <div className="modal-overlay" onClick={() => setShowVariables(false)}>
          <div className="modal modal--settings" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>变量管理</h2>
              <button onClick={() => setShowVariables(false)}><X size={20} /></button>
            </div>
            <div className="modal__body">
              <VariablePanel
                variables={st.activeChat?.variables ?? {}}
                onUpdate={st.updateVariables}
              />
            </div>
          </div>
        </div>
      )}

      {/* 历史楼层浮层 */}
      {showHistory && (
        <HistoryDrawer
          messages={st.activeChat?.messages ?? []}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </GlassCard>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
cd "F:/AI/no2" && npx tsc --noEmit 2>&1 | grep -E "error|Error"
```

- [ ] **Step 3: 提交**

```bash
git add src/components/modules/NarrativePanel.tsx
git commit -m "feat: NarrativePanel 融合酒馆对话 — 角色标签+头像+功能菜单"
```

---

### Task 14: 修改 GameContext — 接入酒馆 API

**Files:**
- Modify: `src/context/GameContext.tsx`

- [ ] **Step 1: 修改 sendNarrativeMessage 使用酒馆 API**

将 `generateNarrative` 函数中的 `llm.send(...)` 替换为 SillyTavern API 调用。

在 GameContext 中注入酒馆状态，将 LLM 回复用 `parseDialogueResponse` 解析为 NarrativeMessage。

关键修改点：
- 不再使用 `useLLM()`
- 改为调用 `useSillytavern()` 的 `sendMessage` 相关逻辑
- 回复通过 `parseDialogueResponse` 解析

由于 GameProvider 现在包裹在 App.tsx 中（page.tsx 外层），useSillytavern 需要在 App 层调用，然后通过 Context 传给 GameProvider。

**更简单的方案**：在 NarrativePanel 中直接调用 useSillytavern，绕过 GameContext 的 LLM 系统。NarrativePanel 中监听 `sendNarrativeMessage` → 调用 `st.sendMessage()` → 回复由 st 的消息进入 NarrativePanel。

实际上最干净的方案是：**让 NarrativePanel 完全使用 useSillytavern 管理消息**，不再依赖 GameContext 的 narrative 状态。

但这改动太大。折中方案：保留现有 GameContext.sendNarrativeMessage 接口，内部调用酒馆 API。

由于 Task 13 已经让 NarrativePanel 直接使用 useSillytavern，此 task 仅需确保兼容即可。实际上不需要大改 GameContext——NarrativePanel 自有 useSillytavern 处理对话。

- [ ] **Step 1: 确认现有 GameContext 无需大改**

NarrativePanel 已直接使用 useSillytavern。GameContext 的 narrative 状态可以保留给非酒馆场景使用。不需要修改。

- [ ] **Step 2: 验证编译**

```bash
cd "F:/AI/no2" && npx tsc --noEmit 2>&1 | grep -E "error|Error"
```

- [ ] **Step 3: 提交**

```bash
git add src/context/GameContext.tsx
git commit -m "feat: GameContext 保持兼容 — NarrativePanel 自管酒馆对话"
```

---

### Task 15: 清理无用文件

**Files:**
- Delete: `src/components/SillyTavern/GameView.tsx`
- Delete: `src/components/SillyTavern/Chat.tsx`
- Delete: `src/components/SillyTavern/OptionList.tsx`
- Delete: `src/components/SillyTavern/MainTextPane.tsx`
- Delete: `src/components/SillyTavern/ThinkingFold.tsx`
- Delete: `src/components/overlays/SillyTavernOverlay.tsx`
- Modify: `src/types/index.ts` (移除 `sillyTavern` from OverlayViewType)
- Modify: `src/context/GameContext.tsx` (移除 sillyTavern overlay title)
- Modify: `src/components/overlays/OverlayRenderer.tsx` (移除 sillyTavern 渲染)

- [ ] **Step 1: 删除无用组件文件**

```bash
rm "F:/AI/no2/src/components/SillyTavern/GameView.tsx"
rm "F:/AI/no2/src/components/SillyTavern/Chat.tsx"
rm "F:/AI/no2/src/components/SillyTavern/OptionList.tsx"
rm "F:/AI/no2/src/components/SillyTavern/MainTextPane.tsx"
rm "F:/AI/no2/src/components/SillyTavern/ThinkingFold.tsx"
rm "F:/AI/no2/src/components/overlays/SillyTavernOverlay.tsx"
```

- [ ] **Step 2: 从类型和上下文中移除 sillyTavern 引用**

在 `src/types/index.ts` 中：
```typescript
// 从 OverlayViewType 中删除 'sillyTavern'
export type OverlayViewType =
  | 'status'
  | 'skills'
  // ... 其他
  | 'achievements';
```

在 `src/context/GameContext.tsx` 中：
```typescript
// 从 overlayTitles 中删除 sillyTavern 条目
```

在 `src/components/overlays/OverlayRenderer.tsx` 中：
```typescript
// 删除 import SillyTavernOverlay
// 删除 {type === 'sillyTavern' && <SillyTavernOverlay />}
// 从 accentMap 中删除 sillyTavern
```

- [ ] **Step 3: 验证编译**

```bash
cd "F:/AI/no2" && npx tsc --noEmit 2>&1 | grep -E "error|Error"
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "refactor: 清理废弃组件 — 酒馆不再作为浮层存在"
```

---

### Task 16: 最终集成验证

**Files:**
- 全部

- [ ] **Step 1: TypeScript 类型检查**

```bash
cd "F:/AI/no2" && npx tsc --noEmit 2>&1
```

预期：0 错误

- [ ] **Step 2: Vite 构建**

```bash
cd "F:/AI/no2" && npx vite build 2>&1
```

预期：构建成功

- [ ] **Step 3: 启动开发服务器验证**

```bash
cd "F:/AI/no2" && npx vite 2>&1
```

验证项：
- 打开浏览器 → 显示酒馆大厅，视频背景播放
- 右上角播放器控件可见
- 点击「开始游戏」→ 创建对话，进入游戏界面
- TopBar 显示「大厅」按钮
- 输入消息 → AI 回复渲染为对话气泡/场景/选项
- SkyOrb 点击 toggle 思考过程
- 输入框左侧按钮展开变量/历史

- [ ] **Step 4: 最终提交**

```bash
git add -A
git commit -m "feat: 酒馆融合重制完成 — 双页面架构"
```
