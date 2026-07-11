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
          onCreate={async (name) => { const id = await st.createChat(name); setShowChats(false); onEnterGame(); return id; }}
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
