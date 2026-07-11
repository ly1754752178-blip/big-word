// ============================================================
// GameView — 游戏模式主界面（正文+选项）
// 整合正文面板、思考折叠、选项列表、变量面板、历史抽屉
// ============================================================
import { useState, useCallback, useMemo } from 'react';
import {
  History,
  MessageSquare,
  Settings,
  BookOpen,
  Sliders,
  Plus,
} from 'lucide-react';
import { useSillytavern } from '../../hooks/useSillytavern';
import { createSimpleStreamParser } from '../../sillytavern';
import { ThinkingFold } from './ThinkingFold';
import { MainTextPane } from './MainTextPane';
import { OptionList } from './OptionList';
import { VariablePanel } from './VariablePanel';
import { HistoryDrawer } from './HistoryDrawer';
import { SettingsModal } from './SettingsModal';
import { LorebookModal } from './LorebookModal';
import { PresetModal } from './PresetModal';
import { ChatModal } from './ChatModal';

export function GameView() {
  const st = useSillytavern();

  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLorebooks, setShowLorebooks] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showChats, setShowChats] = useState(false);

  // 解析当前回复
  const parsed = useMemo(() => {
    const lastMessage = st.activeChat?.messages.filter(
      (m) => m.role === 'assistant',
    ).slice(-1)[0];
    const parsedContent = lastMessage?.content ?? '';
    const parser = createSimpleStreamParser();
    parser.append(parsedContent);
    return parser.getResult();
  }, [st.activeChat?.messages]);

  const options = parsed.option
    ? parsed.option.split('\n').filter((o: string) => o.trim())
    : [];

  const handleOptionSelect = useCallback(
    async (option: string) => {
      await st.sendMessage(option);
    },
    [st],
  );

  if (st.isLoading) {
    return (
      <div className="game-view game-view--loading">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="game-view">
      {/* 顶部工具栏 */}
      <div className="game-view__toolbar">
        <div className="game-view__toolbar-left">
          <h2 className="game-view__title">
            {st.settings?.characterName ?? '未命名'}
          </h2>
        </div>
        <div className="game-view__toolbar-right">
          <button
            onClick={() => setShowChats(!showChats)}
            title="对话列表"
          >
            <MessageSquare size={18} />
          </button>
          <button
            onClick={() => setShowHistory(true)}
            title="历史楼层"
          >
            <History size={18} />
          </button>
          <button
            onClick={() => setShowPresets(true)}
            title="预设"
          >
            <Sliders size={18} />
          </button>
          <button
            onClick={() => setShowLorebooks(true)}
            title="世界书"
          >
            <BookOpen size={18} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            title="设置"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="game-view__content">
        {/* 变量面板 */}
        <VariablePanel
          variables={st.activeChat?.variables ?? {}}
          onUpdate={st.updateVariables}
          disabled={st.isSending}
        />

        {/* 思考过程 */}
        <ThinkingFold content={parsed.thinking} />

        {/* 正文面板 */}
        <MainTextPane
          content={parsed.maintext || ''}
          isStreaming={st.isSending}
        />

        {/* 选项 */}
        <OptionList
          options={options}
          onSelect={handleOptionSelect}
          disabled={st.isSending}
          allowFreeInput={true}
        />
      </div>

      {/* 无活跃聊天时显示创建入口 */}
      {!st.activeChat && (
        <div className="game-view__no-chat">
          <p>没有活跃对话</p>
          <button
            onClick={() => st.createChat()}
            className="btn-primary"
          >
            <Plus size={16} /> 创建新对话
          </button>
        </div>
      )}

      {/* 各模态框 */}
      {showHistory && st.activeChat && (
        <HistoryDrawer
          messages={st.activeChat.messages}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={st.settings}
          onSave={st.updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

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

      {showPresets && (
        <PresetModal
          presets={st.presets}
          settings={st.settings}
          onAdd={st.addPreset}
          onUpdate={st.updatePreset}
          onDelete={st.removePreset}
          onSetActive={(id) =>
            st.updateSettings({ activePresetId: id })
          }
          onClose={() => setShowPresets(false)}
        />
      )}

      {showChats && (
        <ChatModal
          chats={st.chats}
          activeChatId={st.activeChatId}
          onCreate={st.createChat}
          onSelect={st.loadChat}
          onDelete={st.removeChat}
          onClose={() => setShowChats(false)}
        />
      )}
    </div>
  );
}
