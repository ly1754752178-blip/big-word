# 主页面日式 Galgame UI 重制实现规划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将点击光球后进入的 TavernLobby 主菜单页全面改造成日式 Galgame + 人生模拟风格，并把右上角视频背景播放器改造成左侧预览图 + 右侧控制区的横向矩形播放器。

**Architecture：** 保留现有视频/音频播放逻辑与弹窗路由，仅改造视觉层。通过新增 CSS 工具类统一奶油/木色/樱花风格，TavernLobby 负责整体布局与菜单，VideoBackground 负责播放器控件，二者共享同一套视觉 token。

**Tech Stack：** React 18 + TypeScript + Vite + Tailwind CSS 3 + Framer Motion + Lucide React

## Global Constraints

- 全中文界面，禁用 emoji，使用 Lucide 图标。
- 文字对比度 ≥ 4.5:1，确保可读。
- 不改动开场光球 `OpeningOrb`、路由与状态流转、SillyTavern 弹窗内容、游戏内 `BgmPlayer`。
- 保留现有视频/音频播放、切换、静音记忆、洗牌逻辑。
- 仅使用 transform / opacity 动画，尊重 `prefers-reduced-motion`。
- 交付前必须在本地 dev server 做视觉与交互自检。

---

## File Structure

| 文件 | 职责 |
|---|---|
| `src/styles/globals.css` | 新增 Galgame 风格工具类（奶油卡片、木色按钮、标题横幅、信息面板、播放器容器） |
| `tailwind.config.ts` | 补充少量色值/阴影 token（如 `--gal-cream`、`--gal-wood`、`--gal-sakura`） |
| `src/app/TavernLobby.tsx` | 主页面布局：标题横幅、左侧菜单、右侧信息面板、装饰层 |
| `src/components/lobby/VideoBackground.tsx` | 改造播放器控件：左侧预览方框 + 右侧控制区；保留播放逻辑 |

---

### Task 1: 新增 Galgame 风格 CSS 工具类与 Token

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `tailwind.config.ts`

**Interfaces:**
- Produces: `.gal-card`、`.gal-btn`、`.gal-title-banner`、`.gal-info-panel`、`.gal-player` 等工具类，供后续任务使用。

- [ ] **Step 1: 在 globals.css 新增 token 与工具类**

在文件末尾 `@layer utilities` 之后追加：

```css
@layer components {
  /* 日式 Galgame 风格组件 */
  .gal-card {
    background: rgba(255, 248, 240, 0.85);
    backdrop-filter: blur(16px) saturate(1.1);
    border: 1px solid rgba(218, 195, 175, 0.55);
    border-radius: 20px;
    box-shadow:
      0 4px 20px rgba(90, 74, 61, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  .gal-btn {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 24px;
    min-width: 220px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(255, 251, 244, 0.95) 0%, rgba(248, 240, 230, 0.95) 100%);
    border: 1px solid rgba(200, 175, 155, 0.55);
    color: #5A4A3D;
    font-size: 1.05rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-out;
    box-shadow:
      0 2px 8px rgba(90, 74, 61, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.7);
  }

  .gal-btn:hover {
    transform: translateX(6px);
    background: linear-gradient(135deg, rgba(255, 245, 235, 0.98) 0%, rgba(240, 225, 210, 0.98) 100%);
    border-color: rgba(232, 141, 79, 0.5);
    box-shadow:
      0 6px 20px rgba(232, 141, 79, 0.14),
      0 0 0 1px rgba(248, 195, 205, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .gal-btn:active {
    transform: translateX(6px) scale(0.98);
  }

  .gal-title-banner {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 14px 36px;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(255, 250, 244, 0.95) 0%, rgba(248, 238, 228, 0.95) 100%);
    border: 1px solid rgba(200, 175, 155, 0.55);
    box-shadow:
      0 6px 24px rgba(90, 74, 61, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.7);
    font-family: 'M PLUS Rounded 1c', 'Noto Sans JP', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #5A4A3D;
    letter-spacing: 0.08em;
  }

  .gal-title-banner::before,
  .gal-title-banner::after {
    content: '🌸';
    content: '';
    display: block;
    width: 22px;
    height: 22px;
    background: radial-gradient(circle at 30% 30%, #F8C3CD 0%, #E89BAA 100%);
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    opacity: 0.75;
  }

  .gal-title-banner::before { margin-right: 14px; }
  .gal-title-banner::after { margin-left: 14px; transform: rotate(135deg); }

  .gal-info-panel {
    composes: gal-card;
    padding: 20px;
    width: 260px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .gal-info-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .gal-info-label {
    font-size: 0.75rem;
    color: #9A8B7A;
    letter-spacing: 0.05em;
  }

  .gal-info-value {
    font-size: 0.95rem;
    color: #5A4A3D;
    font-weight: 500;
  }

  .gal-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(200, 175, 155, 0.4) 50%, transparent 100%);
    border: none;
  }

  .gal-player {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 14px;
    border-radius: 16px;
    background: rgba(255, 248, 240, 0.88);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(218, 195, 175, 0.55);
    box-shadow:
      0 4px 18px rgba(90, 74, 61, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.7);
  }

  .gal-player-cover {
    width: 84px;
    height: 84px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    background: linear-gradient(135deg, #F8E8D8 0%, #F0D8C0 100%);
    border: 1px solid rgba(200, 175, 155, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gal-player-cover img,
  .gal-player-cover canvas {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .gal-player-btn {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 251, 244, 0.9);
    border: 1px solid rgba(200, 175, 155, 0.45);
    color: #7D6E5E;
    cursor: pointer;
    transition: all 0.15s ease-out;
  }

  .gal-player-btn:hover {
    background: rgba(255, 245, 235, 0.95);
    border-color: rgba(232, 141, 79, 0.5);
    color: #5A4A3D;
    transform: translateY(-1px);
  }

  .gal-player-btn:active {
    transform: translateY(0) scale(0.96);
  }

  .gal-player-title {
    font-size: 0.85rem;
    color: #5A4A3D;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
  }

  .gal-player-volume {
    width: 70px;
    accent-color: #E88D4F;
  }
}
```

- [ ] **Step 2: 在 tailwind.config.ts 补充色值**

在 `theme.extend.colors` 内追加：

```ts
gal: {
  cream: '#FFF8F0',
  wood: '#E8D5C4',
  sakura: '#F8C3CD',
  ink: '#5A4A3D',
  border: 'rgba(190, 170, 150, 0.5)',
},
```

- [ ] **Step 3: 本地验证 CSS 无语法错误**

Run: `npm run build`（或 `npx tsc --noEmit` 检查 TS，Vite build 会编译 CSS）
Expected: 无报错。

- [ ] **Step 4: Commit**

```bash
git add src/styles/globals.css tailwind.config.ts
git commit -m "feat: 新增 Galgame 风格 CSS 工具类与 token"
```

---

### Task 2: 重制 TavernLobby 主菜单布局与样式

**Files:**
- Modify: `src/app/TavernLobby.tsx`

**Interfaces:**
- Consumes: `.gal-title-banner`、`.gal-btn`、`.gal-info-panel`（Task 1）
- Produces: 新的 TavernLobby JSX 结构；菜单按钮可点击，弹窗逻辑不变。

- [ ] **Step 1: 改写 TavernLobby 渲染结构**

将 `TavernLobby` 的 JSX 替换为以下结构（保留所有状态与事件处理函数）：

```tsx
return (
  <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000', overflow: 'hidden' }}>
    <VideoBackground />

    {/* 开场光球 */}
    <AnimatePresence>
      {showOrb && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ position: 'fixed', inset: 0, zIndex: 100000 }}
        >
          <OpeningOrb onClick={handleOrbClick} />
        </motion.div>
      )}
    </AnimatePresence>

    {/* 背景暗角与氛围遮罩 */}
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(60,45,35,0.55) 0%, rgba(60,45,35,0.15) 40%, rgba(0,0,0,0) 100%)',
      }}
    />

    {/* 主内容层 */}
    <AnimatePresence>
      {!showOrb && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '40px 48px 60px',
          }}
        >
          {/* 顶部标题横幅 */}
          <div style={{ pointerEvents: 'auto', alignSelf: 'flex-start' }}>
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="gal-title-banner">综漫日本生活模拟器</div>
            </motion.div>
          </div>

          {/* 中部：左侧菜单 + 右侧信息面板 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              width: '100%',
              flex: 1,
              marginTop: 80,
            }}
          >
            {/* 左侧菜单 */}
            <motion.nav
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                pointerEvents: 'auto',
              }}
            >
              {menuItems.map((item, idx) => (
                <motion.button
                  key={item.key}
                  className="gal-btn"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1 + idx * 0.08 }}
                  onClick={props[item.onClick as keyof LobbyMenuProps] as () => void}
                >
                  <item.icon size={20} style={{ opacity: 0.85 }} />
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </motion.nav>

            {/* 右侧信息面板 */}
            <motion.aside
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.1, ease: 'easeOut' }}
              className="gal-info-panel"
              style={{ pointerEvents: 'auto' }}
            >
              <div className="gal-info-section">
                <span className="gal-info-label">最新存档</span>
                <span className="gal-info-value">3月14日 15:30</span>
              </div>
              <div className="gal-divider" />
              <div className="gal-info-section">
                <span className="gal-info-label">通知</span>
                <span className="gal-info-value">春のイベント開催中</span>
              </div>
              <div className="gal-divider" />
              <div className="gal-info-section">
                <span className="gal-info-label">BGM</span>
                <span className="gal-info-value">放課後の風</span>
              </div>
            </motion.aside>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* 弹窗 Portal 保持不变 */}
    {showChats && createPortal(
      <ChatModal chats={st.chats} activeChatId={st.activeChatId}
        onCreate={async (name) => { const id = await st.createChat(name); setShowChats(false); onEnterGame(); return id; }}
        onSelect={handleSelectChat} onDelete={st.removeChat} onClose={() => setShowChats(false)} />,
      document.body
    )}

    {showLorebooks && createPortal(
      <LorebookModal lorebooks={st.lorebooks} activeIds={st.activeLorebookIds}
        onToggle={st.toggleLorebook} onAdd={st.addLorebook} onUpdate={st.updateLorebook}
        onDelete={st.removeLorebook} onClose={() => setShowLorebooks(false)} />,
      document.body
    )}

    {showApiConfig && st.settings && createPortal(
      <div className="modal-overlay" onClick={() => setShowApiConfig(false)}>
        <div className="modal modal--settings" onClick={(e) => e.stopPropagation()}>
          <div className="modal__header"><h2>API 配置</h2><button onClick={() => setShowApiConfig(false)}><X size={20} /></button></div>
          <div className="modal__body">
            <ApiConfigForm config={st.settings.api} onChange={(api) => st.updateSettings({ api })} label="主 API" />
            <ApiConfigForm config={st.settings.secondaryApi} onChange={(s: any) => st.updateSettings({ secondaryApi: s })} label="次 API" />
          </div>
          <div className="modal__footer">
            <button onClick={() => setShowApiConfig(false)} className="btn-ghost">取消</button>
            <button onClick={() => setShowApiConfig(false)} className="btn-primary"><Save size={14} /> 完成</button>
          </div>
        </div>
      </div>,
      document.body
    )}

    {showPresets && createPortal(
      <PresetModal presets={st.presets} settings={st.settings}
        onAdd={st.addPreset} onUpdate={st.updatePreset} onDelete={st.deletePreset}
        onSetActive={(id) => st.updateSettings({ activePresetId: id })} onClose={() => setShowPresets(false)} />,
      document.body
    )}

    {showSettings && st.settings && createPortal(
      <SettingsModal settings={st.settings} onSave={st.updateSettings} onClose={() => setShowSettings(false)} />,
      document.body
    )}
  </div>
);
```

注意：由于 `menuItems` 原本只在 `LobbyMenu.tsx` 中定义，需要把该数组迁移到 `TavernLobby.tsx` 顶部（与 `menuItemStyle` 同区域），或直接在 JSX 中内联。为保持清晰，迁移到文件顶部：

```tsx
const menuItems = [
  { key: 'start', label: '开始游戏', icon: Gamepad2, onClick: 'onStartGame' },
  { key: 'continue', label: '继续游戏', icon: FolderOpen, onClick: 'onContinue' },
  { key: 'worldbooks', label: '世界书', icon: BookOpen, onClick: 'onWorldBooks' },
  { key: 'api', label: 'API 配置', icon: Plug, onClick: 'onApiConfig' },
  { key: 'presets', label: '预设', icon: Sliders, onClick: 'onPresets' },
  { key: 'settings', label: '设置', icon: Settings, onClick: 'onSettings' },
] as const;
```

并删除原内联的 `<nav>` 菜单按钮与 `menuItemStyle`（不再使用）。

- [ ] **Step 2: 验证菜单与弹窗**

Run: `npm run dev`
Expected: 启动后点击光球进入主菜单，6 个按钮可见、可 hover、可点击打开对应弹窗。

- [ ] **Step 3: Commit**

```bash
git add src/app/TavernLobby.tsx
git commit -m "feat: 重制 TavernLobby 为日式 Galgame 主菜单布局"
```

---

### Task 3: 重制右上角视频背景播放器

**Files:**
- Modify: `src/components/lobby/VideoBackground.tsx`

**Interfaces:**
- Consumes: `.gal-player`、`.gal-player-cover`、`.gal-player-btn`、`.gal-player-title`、`.gal-player-volume`（Task 1）
- Produces: 新的播放器控件 JSX；播放/暂停/上一曲/下一曲/静音/音量功能保持可用。

- [ ] **Step 1: 新增封面预览状态与 canvas 捕获逻辑**

在组件 state 附近新增：

```tsx
const [coverUrl, setCoverUrl] = useState<string | null>(null);
const canvasRef = useRef<HTMLCanvasElement>(null);
```

在 `useEffect` 初始化视频事件处，追加 `loadeddata` 捕获首帧：

```tsx
const onLoadedData = () => {
  const v = videoRef.current;
  const c = canvasRef.current;
  if (!v || !c) return;
  try {
    c.width = 168;
    c.height = 168;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, 168, 168);
    setCoverUrl(c.toDataURL('image/jpeg', 0.85));
  } catch {
    // 忽略跨域/截图失败
  }
};

video.addEventListener('loadeddata', onLoadedData);

return () => {
  // ... 原有移除
  video.removeEventListener('loadeddata', onLoadedData);
};
```

- [ ] **Step 2: 替换控件栏 JSX**

将当前 `ctrlBar` 区域替换为：

```tsx
{/* 播放器 */}
<div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, pointerEvents: 'auto' }}>
  <motion.div
    className="gal-player"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
  >
    {/* 左侧预览方框 */}
    <div className="gal-player-cover">
      {coverUrl ? (
        <img src={coverUrl} alt={displayName} />
      ) : (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C4A98C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M2 10l4-3 5 4 6-7 4 5" />
        </svg>
      )}
    </div>

    {/* 右侧控制区 */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      <span className="gal-player-title" title={displayName}>
        {currentTrack ? `《${displayName}》` : '未在播放'}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button type="button" className="gal-player-btn" onClick={prevTrack} title="上一曲">
          <SkipBack size={16} />
        </button>
        <button type="button" className="gal-player-btn" onClick={togglePlay} title={isPlaying ? '暂停' : '播放'}>
          {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
        </button>
        <button type="button" className="gal-player-btn" onClick={nextTrack} title="下一曲">
          <SkipForward size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button type="button" className="gal-player-btn" onClick={toggleMute} title={isMuted ? '取消静音' : '静音'}>
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleVolume}
          className="gal-player-volume"
          aria-label="音量"
        />
      </div>
    </div>
  </motion.div>
</div>

{/* 隐藏的 canvas，用于截取视频帧 */}
<canvas ref={canvasRef} style={{ display: 'none' }} />
```

- [ ] **Step 3: 移除旧 ctrlBar 样式对象**

删除文件末尾定义的 `ctrlBar`、`ctrlTitle`、`ctrlRow`、`btn` 四个样式对象。

- [ ] **Step 4: 验证播放器功能**

Run: `npm run dev`
Expected:
- 右上角出现横向矩形播放器，左侧为方框预览，右侧为控制按钮。
- 播放/暂停、上一曲/下一曲、静音、音量滑块正常工作。
- 视频切换时预览图更新（若跨域允许）。

- [ ] **Step 5: Commit**

```bash
git add src/components/lobby/VideoBackground.tsx
git commit -m "feat: 将视频背景播放器重制为 Galgame 风格横向矩形播放器"
```

---

### Task 4: 清理未使用代码与最终视觉验证

**Files:**
- Modify: `src/app/TavernLobby.tsx`
- Modify: `src/components/lobby/VideoBackground.tsx`（如 Step 3 已完成则无需再改）

- [ ] **Step 1: 删除 TavernLobby 中废弃的 menuItemStyle 与旧菜单 JSX**

确认 `menuItemStyle` 与旧的 `<nav>` 菜单块已删除，且无 TS 错误。

- [ ] **Step 2: 启动 dev server 做最终视觉检查**

Run: `npm run dev`
Checklist:
- [ ] 视频背景全屏正常播放。
- [ ] 标题横幅、左侧菜单、右侧信息面板位置合理，无遮挡。
- [ ] 菜单 6 项 hover 有上浮 + 光晕效果。
- [ ] 右侧信息面板文字可读，分区清晰。
- [ ] 右上角播放器矩形正常，左侧预览方框、右侧按钮排布整齐。
- [ ] 播放器按钮可点击，功能正常。
- [ ] 点击「继续游戏」「世界书」「API 配置」「预设」「设置」弹窗正常弹出与关闭。
- [ ] 点击「开始游戏」可进入 GameLayout。
- [ ] 窗口缩放（1920/1440/1280/移动端宽度）下无严重错位。
- [ ] 控制台无新报错。

- [ ] **Step 3: 运行构建**

Run: `npm run build`
Expected: 构建成功，无 TS/ESLint 错误。

- [ ] **Step 4: Commit 并推送**

```bash
git add -A
git commit -m "style: TavernLobby 与视频播放器 Galgame 风格重制完成"
git push origin feature/talent-detail-modal
```

---

## Self-Review

- **Spec coverage:**
  - 主菜单 Galgame 风格 → Task 2
  - 右侧信息面板 → Task 2
  - 标题横幅装饰 → Task 1 + Task 2
  - 右上角矩形播放器（左侧预览 + 右侧控制）→ Task 3
  - 保留播放逻辑 → Task 3 明确只改 UI 层
  - 视觉自检 → Task 4
- **Placeholder scan:** 无 TBD/TODO；所有代码块为可直接运行的示例。
- **Type consistency:** `menuItems` 数组迁移后类型与 `LobbyMenuProps` 保持一致；`coverUrl` 为 `string | null`。

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-28-tavern-lobby-galgame-redesign-plan.md`.

Given the user requested to finish in one go without back-and-forth questions, proceed with **Inline Execution** using `superpowers:executing-plans`.
