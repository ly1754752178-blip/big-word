// ============================================================
// SettingsModal — 全局设置面板（含主/副 API 配置）
// ============================================================
import { useState } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import type { AppSettings } from '../../sillytavern';
import { createDefaultSettings } from '../../sillytavern';
import { ApiConfigForm, SecondaryApiConfigForm } from './ApiConfigForm';

interface SettingsModalProps {
  settings: AppSettings | null;
  onSave: (settings: AppSettings) => Promise<void>;
  onClose: () => void;
}

export function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [draft, setDraft] = useState<AppSettings>(
    settings ?? createDefaultSettings(),
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDraft(createDefaultSettings());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--settings" onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className="modal__header">
          <h2>全局设置</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        {/* 内容 */}
        <div className="modal__body">
          {/* 角色信息 */}
          <section className="settings-section">
            <h3>角色信息</h3>
            <div className="form-row">
              <label>角色名</label>
              <input
                value={draft.characterName}
                onChange={(e) =>
                  setDraft({ ...draft, characterName: e.target.value })
                }
              />
            </div>
            <div className="form-row">
              <label>用户名</label>
              <input
                value={draft.userName}
                onChange={(e) =>
                  setDraft({ ...draft, userName: e.target.value })
                }
              />
            </div>
            <div className="form-row">
              <label>UI 模式</label>
              <select
                value={draft.uiMode}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    uiMode: e.target.value as 'game' | 'chat',
                  })
                }
              >
                <option value="game">游戏模式</option>
                <option value="chat">聊天模式</option>
              </select>
            </div>
          </section>

          {/* 主 API */}
          <section className="settings-section">
            <ApiConfigForm
              config={draft.api}
              onChange={(api) => setDraft({ ...draft, api })}
              label="主 API 配置（剧情生成）"
            />
          </section>

          {/* 次 API */}
          <section className="settings-section">
            <SecondaryApiConfigForm
              config={draft.secondaryApi}
              onChange={(secondaryApi) =>
                setDraft({ ...draft, secondaryApi })
              }
            />
          </section>

          {/* 其他 */}
          <section className="settings-section">
            <h3>其他</h3>
            <div className="form-row">
              <label>自动流式输出</label>
              <input
                type="checkbox"
                checked={draft.autoStream}
                onChange={(e) =>
                  setDraft({ ...draft, autoStream: e.target.checked })
                }
              />
            </div>
          </section>
        </div>

        {/* 底部 */}
        <div className="modal__footer">
          <button onClick={handleReset} className="btn-ghost">
            <RotateCcw size={14} /> 重置
          </button>
          <div className="modal__footer-right">
            <button onClick={onClose} className="btn-ghost">取消</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              <Save size={14} /> {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
