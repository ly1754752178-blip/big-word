// ============================================================
// LorebookModal — 世界书管理面板
// ============================================================
import { useState, useRef } from 'react';
import { X, Plus, Trash2, Edit3, Upload, Download, Check } from 'lucide-react';
import type { Lorebook } from '../../sillytavern';
import {
  createDefaultLorebook,
  importLorebook,
  exportLorebook,
} from '../../sillytavern';
import { LorebookEditorModal } from './LorebookEditorModal';

interface LorebookModalProps {
  lorebooks: Lorebook[];
  activeIds: string[];
  onToggle: (id: string) => Promise<void>;
  onAdd: (book: Lorebook) => Promise<void>;
  onUpdate: (book: Lorebook) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export function LorebookModal({
  lorebooks,
  activeIds,
  onToggle,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}: LorebookModalProps) {
  const [editingBook, setEditingBook] = useState<Lorebook | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    const name = prompt('世界书名称:');
    if (!name) return;
    await onAdd(createDefaultLorebook(name));
  };

  const handleImport = async () => {
    fileRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const book = importLorebook(text);
      await onAdd(book);
    } catch (err) {
      alert('导入失败：' + (err as Error).message);
    }
    // 重置 input
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleExport = (book: Lorebook) => {
    const json = exportLorebook(book);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定删除此世界书？')) {
      await onDelete(id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lorebooks" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>世界书管理</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal__body">
          <div className="lorebook-modal__actions">
            <button onClick={handleCreate} className="btn-primary">
              <Plus size={16} /> 新建
            </button>
            <button onClick={handleImport} className="btn-ghost">
              <Upload size={16} /> 导入
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="lorebook-modal__list">
            {lorebooks.length === 0 && (
              <p className="lorebook-modal__empty">暂无世界书</p>
            )}

            {lorebooks.map((book) => (
              <div
                key={book.id}
                className={`lorebook-modal__item ${
                  activeIds.includes(book.id) ? 'lorebook-modal__item--active' : ''
                }`}
              >
                <div className="lorebook-modal__item-info">
                  <span className="lorebook-modal__item-name">{book.name}</span>
                  <span className="lorebook-modal__item-meta">
                    {book.entries.length} 条目
                  </span>
                </div>
                <div className="lorebook-modal__item-actions">
                  <button
                    onClick={() => onToggle(book.id)}
                    title={activeIds.includes(book.id) ? '已激活' : '未激活'}
                    className={activeIds.includes(book.id) ? 'btn-active' : ''}
                  >
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingBook(book)} title="编辑条目">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleExport(book)} title="导出">
                    <Download size={14} />
                  </button>
                  <button onClick={() => handleDelete(book.id)} title="删除">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 条目编辑器 */}
        {editingBook && (
          <LorebookEditorModal
            book={editingBook}
            onSave={async (updated) => {
              await onUpdate(updated);
              setEditingBook(null);
            }}
            onClose={() => setEditingBook(null)}
          />
        )}
      </div>
    </div>
  );
}
