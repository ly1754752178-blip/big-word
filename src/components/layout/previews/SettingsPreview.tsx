import { Settings, Save, FolderOpen, Volume2, Monitor, Bell } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

const items = [
  { icon: Save, label: '保存进度', color: 'text-sky-500 bg-sky-50' },
  { icon: FolderOpen, label: '读取存档', color: 'text-lavender-500 bg-lavender-50' },
  { icon: Volume2, label: '音量设置', color: 'text-coral-500 bg-coral-50' },
  { icon: Monitor, label: '显示设置', color: 'text-mint-500 bg-mint-50' },
  { icon: Bell, label: '通知设置', color: 'text-amber-500 bg-amber-50' },
];

export function SettingsPreview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">系统设置</span>
        <Settings className="w-4 h-4 text-slate-400" />
      </div>

      <div className="grid grid-cols-1 gap-2">
        {items.map(({ icon: Icon, label, color }) => (
          <button
            key={label}
            type="button"
            className="w-full text-left"
          >
            <GlassCard variant="default" className="p-2.5 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">{label}</span>
            </GlassCard>
          </button>
        ))}
      </div>
    </div>
  );
}
