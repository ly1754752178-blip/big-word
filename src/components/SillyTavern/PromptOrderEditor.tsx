// ============================================================
// PromptOrderEditor — Prompt 块排序编辑器
// ============================================================
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { PromptOrderItem } from '../../sillytavern';
import { movePromptItem } from '../../sillytavern';

interface PromptOrderEditorProps {
  items: PromptOrderItem[];
  onChange: (items: PromptOrderItem[]) => void;
  disabled?: boolean;
}

export function PromptOrderEditor({
  items,
  onChange,
  disabled = false,
}: PromptOrderEditorProps) {
  const sorted = [...items].sort((a, b) => a.order - b.order);

  const toggleEnabled = (id: string) => {
    onChange(
      items.map((i) =>
        i.id === id ? { ...i, enabled: !i.enabled } : i,
      ),
    );
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    onChange(movePromptItem(items, index, index - 1));
  };

  const moveDown = (index: number) => {
    if (index >= items.length - 1) return;
    onChange(movePromptItem(items, index, index + 1));
  };

  return (
    <div className="prompt-order-editor">
      {sorted.map((item, idx) => (
        <div
          key={item.id}
          className={`prompt-order-editor__item ${
            !item.enabled ? 'prompt-order-editor__item--disabled' : ''
          }`}
        >
          <div className="prompt-order-editor__move">
            <button
              onClick={() => moveUp(idx)}
              disabled={disabled || idx === 0}
            >
              <ChevronUp size={12} />
            </button>
            <button
              onClick={() => moveDown(idx)}
              disabled={disabled || idx === sorted.length - 1}
            >
              <ChevronDown size={12} />
            </button>
          </div>

          <label className="prompt-order-editor__label">
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={() => toggleEnabled(item.id)}
              disabled={disabled}
            />
            <span>{item.label}</span>
          </label>
        </div>
      ))}
    </div>
  );
}
