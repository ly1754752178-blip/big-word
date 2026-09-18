import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, FolderOpen, BookOpen, Plug, Sliders, Settings, X, Save } from 'lucide-react';
import { OpeningOrb } from '@/components/lobby/OpeningOrb';
import { VideoBackground } from '@/components/lobby/VideoBackground';
import { ChatModal } from '@/components/SillyTavern/ChatModal';
import { LorebookModal } from '@/components/SillyTavern/LorebookModal';
import { PresetModal } from '@/components/SillyTavern/PresetModal';
import { SettingsModal } from '@/components/SillyTavern/SettingsModal';
import { ApiConfigForm } from '@/components/SillyTavern/ApiConfigForm';
import { useSillytavern } from '@/hooks/useSillytavern';
import { injectSTBridge } from '@/lib/st-bridge';
import '@/components/SillyTavern/sillytavern.css';

interface TavernLobbyProps {
  onEnterGame: () => void;
  /** 为 true 时跳过光球界面，直接显示菜单 */
  skipOrb?: boolean;
}

const menuItems = [
  { key: 'start', label: '开始游戏', icon: Gamepad2, onClick: 'onStartGame' as const },
  { key: 'continue', label: '继续游戏', icon: FolderOpen, onClick: 'onContinue' as const },
  { key: 'worldbooks', label: '世界书', icon: BookOpen, onClick: 'onWorldBooks' as const },
  { key: 'api', label: 'API 配置', icon: Plug, onClick: 'onApiConfig' as const },
  { key: 'presets', label: '预设', icon: Sliders, onClick: 'onPresets' as const },
  { key: 'settings', label: '设置', icon: Settings, onClick: 'onSettings' as const },
] as const;

type MenuHandlerKey = typeof menuItems[number]['onClick'];

export function TavernLobby({ onEnterGame, skipOrb = false }: TavernLobbyProps) {
  const st = useSillytavern();
  const [showOrb, setShowOrb] = useState(!skipOrb);

  // 将 ST 聊天列表桥接到全局，供 SettingsPreview 等组件使用
  useEffect(() => {
    injectSTBridge(st.chats, st.activeChatId);
  }, [st.chats, st.activeChatId]);

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'visible';
    return () => { document.body.style.overflow = orig; };
  }, []);

  const handleOrbClick = () => {
    // 全屏
    document.documentElement.requestFullscreen?.().catch(() => {});
    // 解静音 + 启动视频
    window.dispatchEvent(new Event('orb-clicked'));
    setShowOrb(false);
  };

  const [showChats, setShowChats] = useState(false);
  const [showLorebooks, setShowLorebooks] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => { if (showChats) console.log('📂 继续游戏弹窗打开'); }, [showChats]);
  useEffect(() => { if (showLorebooks) console.log('📚 世界书弹窗打开'); }, [showLorebooks]);
  useEffect(() => { if (showApiConfig) console.log('🔌 API配置弹窗打开'); }, [showApiConfig]);
  useEffect(() => { if (showPresets) console.log('⚙️ 预设弹窗打开'); }, [showPresets]);
  useEffect(() => { if (showSettings) console.log('🎭 设置弹窗打开'); }, [showSettings]);

  const closeAll = () => {
    setShowChats(false); setShowLorebooks(false); setShowApiConfig(false);
    setShowPresets(false); setShowSettings(false);
  };

  const handleStartGame = async () => {
    await st.createChat();
    onEnterGame();
  };
  const handleContinue = () => { console.log('🖱️ 继续游戏 被点击'); closeAll(); setShowChats(true); };
  const handleWorldBooks = () => { console.log('🖱️ 世界书 被点击'); closeAll(); setShowLorebooks(true); };
  const handleApiConfig = () => { console.log('🖱️ API配置 被点击'); closeAll(); setShowApiConfig(true); };
  const handlePresets = () => { console.log('🖱️ 预设 被点击'); closeAll(); setShowPresets(true); };
  const handleSettings = () => { console.log('🖱️ 设置 被点击'); closeAll(); setShowSettings(true); };

  const handlerMap: Record<MenuHandlerKey, () => void> = {
    onStartGame: handleStartGame,
    onContinue: handleContinue,
    onWorldBooks: handleWorldBooks,
    onApiConfig: handleApiConfig,
    onPresets: handlePresets,
    onSettings: handleSettings,
  };

  const handleSelectChat = (id: string) => {
    st.loadChat(id); setShowChats(false); onEnterGame();
  };

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
                    type="button"
                    className="gal-btn"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1 + idx * 0.08 }}
                    onClick={handlerMap[item.onClick]}
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

      {/* 所有弹窗通过 Portal 渲染到 body，彻底跳出层叠上下文 */}
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
          onAdd={st.addPreset} onUpdate={st.updatePreset} onDelete={st.removePreset}
          onSetActive={(id) => st.updateSettings({ activePresetId: id })} onClose={() => setShowPresets(false)} />,
        document.body
      )}

      {showSettings && st.settings && createPortal(
        <SettingsModal settings={st.settings} onSave={st.updateSettings} onClose={() => setShowSettings(false)} />,
        document.body
      )}
    </div>
  );
}
