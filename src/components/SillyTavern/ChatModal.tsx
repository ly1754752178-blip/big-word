// ============================================================
// ChatModal — 对话列表管理器
// ============================================================
import { useState } from 'react';
import { X, Plus, MessageSquare, Trash2 } from 'lucide-react';
import type { ChatSession } from '../../sillytavern';

interface ChatModalProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onCreate: (name?: string) => Promise<string>;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export function ChatModal({
  chats,
  activeChatId,
  onCreate,
  onSelect,
  onDelete,
  onClose,
}: ChatModalProps) {
  const [newName, setNewName] = useState('');

  const handleCreate = async () => {
    await onCreate(newName || undefined);
    setNewName('');
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定删除此对话？')) {
      await onDelete(id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--chats" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2><MessageSquare size={18} /> 对话列表</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal__body">
          {/* 新建 */}
          <div className="chat-modal__create">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
              placeholder="对话名称（可选）"
            />
            <button onClick={handleCreate} className="btn-primary">
              <Plus size={16} /> 新建
            </button>
          </div>

          {/* 列表 */}
          <div className="chat-modal__list">
            {chats.length === 0 && (
              <p className="chat-modal__empty">暂无对话，创建一个开始吧</p>
            )}

            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-modal__item ${
                  chat.id === activeChatId ? 'chat-modal__item--active' : ''
                }`}
                onClick={() => {
                  onSelect(chat.id);
                  onClose();
                }}
              >
                <div className="chat-modal__item-info">
                  <span className="chat-modal__item-name">{chat.name}</span>
                  <span className="chat-modal__item-meta">
                    {chat.messages.length} 条消息 ·{' '}
                    {new Date(chat.updatedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDelete(chat.id, e)}
                  title="删除"
                  className="chat-modal__item-delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
