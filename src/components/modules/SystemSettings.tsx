import { useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  Settings,
  Save,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  Monitor,
  Languages,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function SystemSettings() {
  const { state } = useGame();
  const [message, setMessage] = useState('');

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 2000);
  };

  const handleSave = () => {
    localStorage.setItem('llm-life-sim-save', JSON.stringify(state));
    showMessage('存档已保存');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-sim-save-${state.date.year}-${state.date.month}-${state.date.day}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('存档已导出');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          JSON.parse(reader.result as string);
          showMessage('存档已读取（演示模式不写入状态）');
        } catch {
          showMessage('存档格式错误');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const settingItems = [
    { icon: <Volume2 className="w-4 h-4" />, label: '音效音量', value: '70%' },
    { icon: <Monitor className="w-4 h-4" />, label: '显示模式', value: '窗口化' },
    { icon: <Languages className="w-4 h-4" />, label: '语言', value: '简体中文' },
  ];

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <GlassCard variant="raised" className="p-4">
        <h3 className="font-heading text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2 mb-4">
          <Settings className="w-3.5 h-3.5" /> 系统设置
        </h3>

        <div className="space-y-2 mb-4">
          {settingItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex items-center justify-between rounded-xl bg-bg-glass border border-border-soft p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-amber/15 flex items-center justify-center text-text-primary">
                  {item.icon}
                </div>
                <span className="text-sm text-text-primary">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-text-secondary">{item.value}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-accent-sunset/15 hover:bg-accent-sunset/25 text-accent-sunset py-2 text-xs font-medium transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> 保存
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-accent-teal/15 hover:bg-accent-teal/25 text-accent-teal py-2 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> 导出
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-accent-amber/15 hover:bg-accent-amber/25 text-accent-amber py-2 text-xs font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> 导入
          </button>
          <button
            type="button"
            onClick={() => showMessage('已重置为默认状态（演示模式）')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-bg-glass hover:bg-white/60 text-text-secondary py-2 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 重置
          </button>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center text-xs text-accent-sunset font-medium"
          >
            {message}
          </motion.div>
        )}
      </GlassCard>
    </div>
  );
}
