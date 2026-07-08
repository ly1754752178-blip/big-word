import { Settings, Save, FolderOpen, Volume2, Monitor, Bell } from 'lucide-react';

export function SettingsPreview() {
  const items = [
    { icon: Save, label: '保存进度' },
    { icon: FolderOpen, label: '读取存档' },
    { icon: Volume2, label: '音量设置' },
    { icon: Monitor, label: '显示设置' },
    { icon: Bell, label: '通知设置' },
  ];

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
        <Settings className="w-4 h-4" /> 系统设置
      </div>

      <div className="grid grid-cols-1 gap-2">
        {items.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            className="w-full p-2.5 rounded-xl bg-white/60 border border-border-soft flex items-center gap-3 text-left hover:bg-white/80 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-text-secondary/10 flex items-center justify-center text-text-secondary">
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs text-text-primary">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
