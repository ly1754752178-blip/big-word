// ============================================================
// PresetModal — 预设管理面板
// 支持采样参数、Prompt 文本、Prompt 排序、自定义插入
// ============================================================
import { useState } from 'react';
import { X, Plus, Save, Trash2, Check } from 'lucide-react';
import type { ChatPreset, AppSettings } from '../../sillytavern';
import { DEFAULT_PROMPT_ORDER } from '../../sillytavern';
import { PromptOrderEditor } from './PromptOrderEditor';

interface PresetModalProps {
  presets: ChatPreset[];
  settings: AppSettings | null;
  onAdd: (preset: ChatPreset) => Promise<void>;
  onUpdate: (preset: ChatPreset) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetActive: (id: string) => void;
  onClose: () => void;
}

function createDefaultPreset(name: string): ChatPreset {
  return {
    id: crypto.randomUUID(),
    name,
    settings: {
      temp_openai: 0.7,
      openai_max_tokens: 2048,
      top_p_openai: 0.9,
      stream_openai: true,
    },
    prompts: {
      systemPrompt: '',
      characterDescription: '',
      personaDescription: '',
      firstMessage: '',
      exampleMessages: '',
      scenario: '',
    },
    promptOrder: [...DEFAULT_PROMPT_ORDER],
    customInsertions: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function PresetModal({
  presets,
  settings,
  onAdd,
  onUpdate,
  onDelete,
  onSetActive,
  onClose,
}: PresetModalProps) {
  const [draft, setDraft] = useState<ChatPreset | null>(null);
  const [tab, setTab] = useState<'sampling' | 'prompts' | 'order' | 'custom'>(
    'sampling',
  );

  const handleCreate = async () => {
    const name = prompt('预设名称:');
    if (!name) return;
    const preset = createDefaultPreset(name);
    await onAdd(preset);
    setDraft(preset);
  };

  const handleSave = async () => {
    if (!draft) return;
    await onUpdate(draft);
    setDraft(null);
  };

  const activePresetId = settings?.activePresetId;

  // 编辑中的预设
  if (draft) {
    return (
      <div className="modal-overlay" onClick={() => setDraft(null)}>
        <div
          className="modal modal--preset-edit"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal__header">
            <h2>编辑预设：{draft.name}</h2>
            <button onClick={() => setDraft(null)}><X size={20} /></button>
          </div>

          {/* 标签页 */}
          <div className="preset-modal__tabs">
            {([
              ['sampling', '采样参数'],
              ['prompts', 'Prompt 文本'],
              ['order', 'Prompt 排序'],
              ['custom', '自定义插入'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                className={`preset-modal__tab ${tab === key ? 'preset-modal__tab--active' : ''}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="modal__body">
            {/* 采样参数 */}
            {tab === 'sampling' && (
              <div className="preset-form">
                <div className="form-row">
                  <label>Temperature</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={draft.settings.temp_openai ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        settings: {
                          ...draft.settings,
                          temp_openai: Number(e.target.value) || undefined,
                        },
                      })
                    }
                  />
                </div>
                <div className="form-row">
                  <label>Max Tokens</label>
                  <input
                    type="number"
                    value={draft.settings.openai_max_tokens ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        settings: {
                          ...draft.settings,
                          openai_max_tokens: Number(e.target.value) || undefined,
                        },
                      })
                    }
                  />
                </div>
                <div className="form-row">
                  <label>Top P</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={draft.settings.top_p_openai ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        settings: {
                          ...draft.settings,
                          top_p_openai: Number(e.target.value) || undefined,
                        },
                      })
                    }
                  />
                </div>
                <div className="form-row">
                  <label>Frequency Penalty</label>
                  <input
                    type="number"
                    step="0.1"
                    value={draft.settings.freq_pen_openai ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        settings: {
                          ...draft.settings,
                          freq_pen_openai: Number(e.target.value) || undefined,
                        },
                      })
                    }
                  />
                </div>
                <div className="form-row">
                  <label>Presence Penalty</label>
                  <input
                    type="number"
                    step="0.1"
                    value={draft.settings.pres_pen_openai ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        settings: {
                          ...draft.settings,
                          pres_pen_openai: Number(e.target.value) || undefined,
                        },
                      })
                    }
                  />
                </div>
                <div className="form-row">
                  <label>模型覆写</label>
                  <input
                    type="text"
                    value={draft.settings.openai_model ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        settings: {
                          ...draft.settings,
                          openai_model: e.target.value || undefined,
                        },
                      })
                    }
                    placeholder="留空使用全局设置"
                  />
                </div>
              </div>
            )}

            {/* Prompt 文本 */}
            {tab === 'prompts' && (
              <div className="preset-form">
                {[
                  ['systemPrompt', '系统主提示'],
                  ['characterDescription', '角色定义'],
                  ['personaDescription', '用户人设'],
                  ['scenario', '场景描述'],
                  ['firstMessage', '首条消息'],
                  ['exampleMessages', '示例对话'],
                ].map(([key, label]) => (
                  <div key={key} className="form-row">
                    <label>{label}</label>
                    <textarea
                      rows={3}
                      value={
                        (draft.prompts as unknown as Record<string, string>)[key] ?? ''
                      }
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          prompts: {
                            ...draft.prompts,
                            [key]: e.target.value,
                          },
                        })
                      }
                      placeholder={`输入${label}...`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Prompt 排序 */}
            {tab === 'order' && (
              <PromptOrderEditor
                items={draft.promptOrder}
                onChange={(order) => setDraft({ ...draft, promptOrder: order })}
              />
            )}

            {/* 自定义插入 */}
            {tab === 'custom' && (
              <div className="preset-form">
                <p className="form-hint">自定义文本块，可在 Prompt 排序中启用以插入任意内容</p>
                {Object.entries(draft.customInsertions).map(([key, value]) => (
                  <div key={key} className="form-row">
                    <div className="form-row__header">
                      <label>块名称</label>
                      <input
                        value={key}
                        onChange={(e) => {
                          const next = { ...draft.customInsertions };
                          delete next[key];
                          next[e.target.value] = value;
                          setDraft({
                            ...draft,
                            customInsertions: next,
                          });
                        }}
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={value}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          customInsertions: {
                            ...draft.customInsertions,
                            [key]: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                ))}
                <button
                  onClick={() =>
                    setDraft({
                      ...draft,
                      customInsertions: {
                        ...draft.customInsertions,
                        '': '',
                      },
                    })
                  }
                >
                  <Plus size={14} /> 添加块
                </button>
              </div>
            )}
          </div>

          <div className="modal__footer">
            <button onClick={() => setDraft(null)} className="btn-ghost">
              取消
            </button>
            <button onClick={handleSave} className="btn-primary">
              <Save size={14} /> 保存
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 列表视图
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--presets" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>预设管理</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal__body">
          <button onClick={handleCreate} className="btn-primary btn-block">
            <Plus size={16} /> 新建预设
          </button>

          <div className="preset-modal__list">
            {presets.length === 0 && (
              <p className="preset-modal__empty">暂无预设</p>
            )}

            {presets.map((preset) => (
              <div
                key={preset.id}
                className={`preset-modal__item ${
                  preset.id === activePresetId
                    ? 'preset-modal__item--active'
                    : ''
                }`}
              >
                <div className="preset-modal__item-info">
                  <span className="preset-modal__item-name">{preset.name}</span>
                  <span className="preset-modal__item-meta">
                    Temp: {preset.settings.temp_openai ?? '-'} · Max: {preset.settings.openai_max_tokens ?? '-'}
                  </span>
                </div>
                <div className="preset-modal__item-actions">
                  <button
                    onClick={() => onSetActive(preset.id)}
                    title="设为活跃"
                    className={
                      preset.id === activePresetId ? 'btn-active' : ''
                    }
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setDraft(preset)}
                    title="编辑"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('确定删除此预设？')) onDelete(preset.id);
                    }}
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
