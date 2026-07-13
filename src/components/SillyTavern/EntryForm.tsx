// ============================================================
// EntryForm — 世界书条目编辑表单
// ============================================================
import type { LorebookEntry } from '../../sillytavern';

interface EntryFormProps {
  entry: LorebookEntry;
  onChange: (entry: LorebookEntry) => void;
  disabled?: boolean;
}

export function EntryForm({ entry, onChange, disabled = false }: EntryFormProps) {
  const update = (partial: Partial<LorebookEntry>) => {
    onChange({ ...entry, ...partial });
  };

  return (
    <div className="entry-form">
      {/* 关键词 */}
      <div className="entry-form__field">
        <label>主关键词（逗号分隔）</label>
        <input
          type="text"
          value={entry.keys.join(', ')}
          onChange={(e) =>
            update({
              keys: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          placeholder="关键词1, 关键词2"
          disabled={disabled}
        />
      </div>

      {/* 次级关键词 */}
      <div className="entry-form__field">
        <label>次级关键词（逗号分隔）</label>
        <input
          type="text"
          value={entry.secondaryKeys.join(', ')}
          onChange={(e) =>
            update({
              secondaryKeys: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          placeholder="次级关键词1, 次级关键词2"
          disabled={disabled}
        />
      </div>

      {/* 内容 */}
      <div className="entry-form__field">
        <label>注入内容</label>
        <textarea
          value={entry.content}
          onChange={(e) => update({ content: e.target.value })}
          rows={4}
          placeholder="当关键词触发时，这段文本将被注入到 Prompt 中..."
          disabled={disabled}
        />
      </div>

      {/* 基本设置 */}
      <div className="entry-form__row">
        <div className="entry-form__field entry-form__field--inline">
          <label>优先级</label>
          <input
            type="number"
            value={entry.insertionOrder}
            onChange={(e) =>
              update({ insertionOrder: Number(e.target.value) || 100 })
            }
            disabled={disabled}
          />
        </div>
        <div className="entry-form__field entry-form__field--inline">
          <label>插入位置</label>
          <select
            value={entry.insertionPosition}
            onChange={(e) =>
              update({
                insertionPosition: e.target.value as LorebookEntry['insertionPosition'],
              })
            }
            disabled={disabled}
          >
            <option value="before_character">角色定义前</option>
            <option value="after_character">角色定义后</option>
            <option value="in_chat">聊天顶部</option>
          </select>
        </div>
      </div>

      {/* 高级设置 */}
      <details className="entry-form__advanced">
        <summary>高级设置</summary>
        <div className="entry-form__advanced-body">
          <div className="entry-form__row">
            <div className="entry-form__field entry-form__field--inline">
              <label>选择性</label>
              <select
                value={entry.selective}
                onChange={(e) =>
                  update({
                    selective: e.target.value as 'primary' | 'both',
                  })
                }
                disabled={disabled}
              >
                <option value="primary">仅主关键词</option>
                <option value="both">主 + 次级</option>
              </select>
            </div>
            <div className="entry-form__field entry-form__field--inline">
              <label>常量深度</label>
              <input
                type="number"
                value={entry.constantDepth}
                onChange={(e) =>
                  update({ constantDepth: Number(e.target.value) || 0 })
                }
                min={0}
                max={10}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="entry-form__row">
            <div className="entry-form__field entry-form__field--inline">
              <label>
                <input
                  type="checkbox"
                  checked={entry.caseSensitive}
                  onChange={(e) =>
                    update({ caseSensitive: e.target.checked })
                  }
                  disabled={disabled}
                />{' '}
                大小写敏感
              </label>
            </div>
            <div className="entry-form__field entry-form__field--inline">
              <label>
                <input
                  type="checkbox"
                  checked={entry.enabled}
                  onChange={(e) =>
                    update({ enabled: e.target.checked })
                  }
                  disabled={disabled}
                />{' '}
                启用
              </label>
            </div>
          </div>

          <div className="entry-form__field">
            <label>备注</label>
            <input
              type="text"
              value={entry.comment}
              onChange={(e) => update({ comment: e.target.value })}
              placeholder="可选备注"
              disabled={disabled}
            />
          </div>
        </div>
      </details>
    </div>
  );
}
