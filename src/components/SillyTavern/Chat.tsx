// ============================================================
// Chat — 聊天模式主组件
// ============================================================
import { useState } from 'react';
import { Send } from 'lucide-react';
import { useSillytavern } from '../../hooks/useSillytavern';
import { VariablePanel } from './VariablePanel';
import { USER_ROLE } from '../../sillytavern';

export function Chat() {
  const {
    activeChat,
    isSending,
    sendMessage,
    updateVariables,
  } = useSillytavern();

  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    await sendMessage(input);
    setInput('');
  };

  if (!activeChat) {
    return (
      <div className="chat chat--empty">
        <p>选择一个聊天或创建新对话</p>
      </div>
    );
  }

  return (
    <div className="chat">
      <VariablePanel
        variables={activeChat.variables ?? {}}
        onUpdate={updateVariables}
        disabled={isSending}
      />

      <div className="chat__messages">
        {activeChat.messages.map((msg) => (
          <div key={msg.id} className={`chat__message chat__message--${msg.role}`}>
            <div className="chat__bubble">{msg.content}</div>
            <div className="chat__msg-actions">
              {msg.role === USER_ROLE && (
                <span className="chat__user-label">用户</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="chat__input-bar">
        <input
          className="chat__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) handleSend();
          }}
          disabled={isSending}
          placeholder="输入消息..."
        />
        <button
          className="chat__send"
          onClick={handleSend}
          disabled={isSending || !input.trim()}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
