// ============================================================
// VariablePanel — 变量查看/编辑面板
// ============================================================
import { useState } from 'react';
import { Edit3, X, Plus, Save } from 'lucide-react';

interface VariablePanelProps {
  variables: Record<string, string | number>;
  onUpdate: (updates: Record<string, string | number>) => Promise<void>;
  disabled?: boolean;
}

export function VariablePanel({
  variables,
  onUpdate,
  disabled = false,
}: VariablePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const startEdit = () => {
    setDraft(
      Object.fromEntries(
        Object.entries(variables).map(([k, v]) => [k, String(v)]),
      ),
    );
    setIsOpen(true);
  };

  const save = async () => {
    const updates: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(draft)) {
      if (k.trim()) {
        const num = Number(v);
        updates[k.trim()] = Number.isNaN(num) ? v : num;
      }
    }
    await onUpdate(updates);
    setIsOpen(false);
  };

  const addRow = () => {
    setDraft((prev) => ({ ...prev, '': '' }));
  };

  const removeRow = (key: string) => {
    setDraft((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const varCount = Object.keys(variables).length;

  return (
    <div className="variable-panel">
      <button
        className="variable-panel__toggle"
        onClick={() => (isOpen ? setIsOpen(false) : startEdit())}
      >
        {isOpen ? (
          <X size={14} />
        ) : (
          <Edit3 size={14} />
        )}
        <span>变量{varCount > 0 ? ` (${varCount})` : ''}</span>
      </button>

      {isOpen && (
        <div className="variable-panel__editor">
          {Object.entries(draft).map(([key, value], idx) => (
            <div key={idx} className="variable-panel__row">
              <input
                value={key}
                onChange={(e) => {
                  const next = { ...draft };
                  const oldKey = Object.keys(draft)[idx];
                  delete next[oldKey];
                  next[e.target.value] = value;
                  setDraft(next);
                }}
                placeholder="变量名"
                disabled={disabled}
              />
              <input
                value={value}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, [key]: e.target.value }))
                }
                placeholder="值"
                disabled={disabled}
              />
              <button
                onClick={() => removeRow(key)}
                disabled={disabled}
                title="删除"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <div className="variable-panel__actions">
            <button onClick={addRow} disabled={disabled}>
              <Plus size={14} /> 添加
            </button>
            <button onClick={save} disabled={disabled}>
              <Save size={14} /> 保存
            </button>
          </div>
        </div>
      )}

      {!isOpen && varCount > 0 && (
        <div className="variable-panel__summary">
          {Object.entries(variables).map(([k, v]) => (
            <span key={k} className="variable-panel__badge">
              {k}: {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
