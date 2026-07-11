// ============================================================
// LorebookEditorModal — 单本世界书条目编辑器
// ============================================================
import { useState } from 'react';
import { X, Plus, Save, ArrowLeft } from 'lucide-react';
import type { Lorebook, LorebookEntry } from '../../sillytavern';
import {
  createDefaultEntry,
  updateEntry,
  removeEntry,
} from '../../sillytavern';
import { EntryForm } from './EntryForm';

interface LorebookEditorModalProps {
  book: Lorebook;
  onSave: (book: Lorebook) => Promise<void>;
  onClose: () => void;
}

export function LorebookEditorModal({
  book,
  onSave,
  onClose,
}: LorebookEditorModalProps) {
  const [draft, setDraft] = useState<Lorebook>({ ...book });
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(
    draft.entries[0]?.id ?? null,
  );
  const [saving, setSaving] = useState(false);

  const selectedEntry = draft.entries.find((e) => e.id === selectedEntryId) ?? null;

  const handleAddEntry = () => {
    const newEntry = createDefaultEntry();
    setDraft((prev) => ({
      ...prev,
      entries: [...prev.entries, newEntry],
    }));
    setSelectedEntryId(newEntry.id);
  };

  const handleUpdateEntry = (updated: LorebookEntry) => {
    setDraft((prev) => updateEntry(prev, updated.id, updated));
  };

  const handleRemoveEntry = (id: string) => {
    if (confirm('确定删除此条目？')) {
      setDraft((prev) => removeEntry(prev, id));
      if (selectedEntryId === id) {
        setSelectedEntryId(draft.entries.find((e) => e.id !== id)?.id ?? null);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal--lorebook-editor"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <button onClick={onClose} className="btn-ghost">
            <ArrowLeft size={16} /> 返回
          </button>
          <h2>编辑：{draft.name}</h2>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save size={14} /> {saving ? '保存中...' : '保存'}
          </button>
        </div>

        <div className="modal__body lorebook-editor__body">
          {/* 条目列表 */}
          <div className="lorebook-editor__sidebar">
            <button onClick={handleAddEntry} className="btn-primary btn-block">
              <Plus size={14} /> 添加条目
            </button>

            <div className="lorebook-editor__entry-list">
              {draft.entries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`lorebook-editor__entry-item ${
                    entry.id === selectedEntryId
                      ? 'lorebook-editor__entry-item--active'
                      : ''
                  }`}
                  onClick={() => setSelectedEntryId(entry.id)}
                >
                  <span className="lorebook-editor__entry-index">
                    #{idx + 1}
                  </span>
                  <span className="lorebook-editor__entry-label">
                    {entry.keys[0] || '(无关键词)'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveEntry(entry.id);
                    }}
                    title="删除"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {draft.entries.length === 0 && (
                <p className="lorebook-editor__empty">暂无条目，点击上方添加</p>
              )}
            </div>
          </div>

          {/* 条目编辑区 */}
          <div className="lorebook-editor__main">
            {selectedEntry ? (
              <EntryForm
                entry={selectedEntry}
                onChange={handleUpdateEntry}
              />
            ) : (
              <p className="lorebook-editor__placeholder">
                选择一个条目进行编辑
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
