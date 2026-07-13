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

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px',
  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
  background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)', color: 'white', fontSize: '1.05rem',
  fontWeight: 500, cursor: 'pointer', minWidth: 200, width: '100%',
};

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

  const handleSelectChat = (id: string) => {
    st.loadChat(id); setShowChats(false); onEnterGame();
  };

  const menuHoverIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(124,58,237,0.45)';
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
    e.currentTarget.style.transform = 'translateX(6px)';
    e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.2)';
  };
  const menuHoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(0,0,0,0.35)';
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
    e.currentTarget.style.transform = 'translateX(0)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
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


      {/* 菜单 — 光球点击后渐显 */}
      <AnimatePresence>
        {!showOrb && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            style={{ position: 'fixed', left: 48, bottom: 60, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button style={menuItemStyle} onClick={handleStartGame} onMouseEnter={menuHoverIn} onMouseLeave={menuHoverOut}>
          <Gamepad2 size={20} style={{ opacity: 0.8 }} /><span>开始游戏</span>
        </button>
        <button style={menuItemStyle} onClick={handleContinue} onMouseEnter={menuHoverIn} onMouseLeave={menuHoverOut}>
          <FolderOpen size={20} style={{ opacity: 0.8 }} /><span>继续游戏</span>
        </button>
        <button style={menuItemStyle} onClick={handleWorldBooks} onMouseEnter={menuHoverIn} onMouseLeave={menuHoverOut}>
          <BookOpen size={20} style={{ opacity: 0.8 }} /><span>世界书</span>
        </button>
        <button style={menuItemStyle} onClick={handleApiConfig} onMouseEnter={menuHoverIn} onMouseLeave={menuHoverOut}>
          <Plug size={20} style={{ opacity: 0.8 }} /><span>API 配置</span>
        </button>
        <button style={menuItemStyle} onClick={handlePresets} onMouseEnter={menuHoverIn} onMouseLeave={menuHoverOut}>
          <Sliders size={20} style={{ opacity: 0.8 }} /><span>预设</span>
        </button>
        <button style={menuItemStyle} onClick={handleSettings} onMouseEnter={menuHoverIn} onMouseLeave={menuHoverOut}>
          <Settings size={20} style={{ opacity: 0.8 }} /><span>设置</span>
        </button>
      </motion.nav>)}</AnimatePresence>

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
