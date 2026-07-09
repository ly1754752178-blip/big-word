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

export function SystemSettingsOverlay() {
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
    { icon: <Volume2 className="w-5 h-5" />, label: '音效音量', value: '70%' },
    { icon: <Monitor className="w-5 h-5" />, label: '显示模式', value: '窗口化' },
    { icon: <Languages className="w-5 h-5" />, label: '语言', value: '简体中文' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <GlassCard variant="cream" className="p-6">
        <h3 className="font-heading text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <Settings className="w-6 h-6 text-sky-500" /> 系统设置
        </h3>

        <div className="space-y-3 mb-6">
          {settingItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex items-center justify-between rounded-2xl bg-white border border-slate-100 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center text-sky-500">
                  {item.icon}
                </div>
                <span className="text-base text-slate-700 font-medium">{item.label}</span>
              </div>
              <span className="text-base font-medium text-slate-500">{item.value}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-600 py-3 text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" /> 保存
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-2 rounded-xl bg-mint-100 hover:bg-mint-200 text-mint-600 py-3 text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> 导出
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-600 py-3 text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" /> 导入
          </button>
          <button
            type="button"
            onClick={() => showMessage('已重置为默认状态（演示模式）')}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 py-3 text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> 重置
          </button>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-sm text-coral-500 font-medium"
          >
            {message}
          </motion.div>
        )}
      </GlassCard>
    </div>
  );
}
