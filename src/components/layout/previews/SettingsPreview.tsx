import { Save, FolderOpen, Volume2, Monitor, Bell } from 'lucide-react';
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
      {/* 系统设置 —— 居中标题横栏 */}
      <div className="-mx-2.5 -mt-3 px-3 py-3 bg-gradient-to-r from-slate-50 via-slate-100/40 to-slate-50 border-b border-slate-200/60 text-center">
        <span className="text-base font-bold text-slate-800 tracking-wide">系统设置</span>
        <div className="mt-1 mx-auto w-8 h-0.5 rounded-full bg-slate-400" />
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
