// ============================================================
// ApiConfigForm — 主/副 API 配置表单
// 可在设置面板中自由调配
// ============================================================
import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import type { ApiConfig, SecondaryApiConfig } from '../../sillytavern';

// ---- 主 API 配置 ----
interface ApiConfigFormProps {
  config: ApiConfig;
  onChange: (config: ApiConfig) => void;
  label?: string;
  disabled?: boolean;
}

export function ApiConfigForm({
  config,
  onChange,
  label = 'API 配置',
  disabled = false,
}: ApiConfigFormProps) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="api-config">
      <h4 className="api-config__title">{label}</h4>

      <div className="api-config__field">
        <label>API 地址</label>
        <input
          type="text"
          value={config.baseUrl}
          onChange={(e) => onChange({ ...config, baseUrl: e.target.value })}
          placeholder="https://api.openai.com/v1"
          disabled={disabled}
        />
      </div>

      <div className="api-config__field">
        <label>API 密钥</label>
        <div className="api-config__secret">
          <input
            type={showKey ? 'text' : 'password'}
            value={config.apiKey}
            onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
            placeholder="sk-..."
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            disabled={disabled}
            className="api-config__toggle-key"
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="api-config__field">
        <label>模型名称</label>
        <input
          type="text"
          value={config.model}
          onChange={(e) => onChange({ ...config, model: e.target.value })}
          placeholder="gpt-4o"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// ---- 次 API 配置（含启用开关） ----
interface SecondaryApiConfigFormProps {
  config: SecondaryApiConfig;
  onChange: (config: SecondaryApiConfig) => void;
  disabled?: boolean;
}

export function SecondaryApiConfigForm({
  config,
  onChange,
  disabled = false,
}: SecondaryApiConfigFormProps) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="api-config api-config--secondary">
      <div className="api-config__header">
        <h4 className="api-config__title">次 API 配置（变量/总结分流）</h4>
        <label className="api-config__enable">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
            disabled={disabled}
          />
          <span>启用</span>
        </label>
      </div>

      {config.enabled && (
        <>
          <div className="api-config__hint">
            <AlertCircle size={14} />
            <span>次 API 负责提取总结和变量，可使用更便宜的模型以降低消耗</span>
          </div>

          <div className="api-config__field">
            <label>API 地址</label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => onChange({ ...config, baseUrl: e.target.value })}
              placeholder="https://api.openai.com/v1"
              disabled={disabled}
            />
          </div>

          <div className="api-config__field">
            <label>API 密钥</label>
            <div className="api-config__secret">
              <input
                type={showKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
                placeholder="sk-..."
                disabled={disabled}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                disabled={disabled}
                className="api-config__toggle-key"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="api-config__field">
            <label>模型名称</label>
            <input
              type="text"
              value={config.model}
              onChange={(e) => onChange({ ...config, model: e.target.value })}
              placeholder="gpt-4o-mini"
              disabled={disabled}
            />
          </div>

          <div className="api-config__field">
            <label>处理标签（逗号分隔）</label>
            <input
              type="text"
              value={config.handledTags.join(', ')}
              onChange={(e) =>
                onChange({
                  ...config,
                  handledTags: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="sum, vars"
              disabled={disabled}
            />
          </div>
        </>
      )}
    </div>
  );
}
