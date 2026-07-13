/**
 * SettingsPreview — 系统设置预览面板
 * 复制/导出/导入聊天 + 检查更新 + 返回主菜单
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Upload, RefreshCw, Home, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { duplicateActiveChat, exportActiveChat, importChatFromJSON } from '@/lib/st-bridge';
import { goToLobby } from '@/app/GameLayout';

const C = {
  card: '#FFFBF7', border: '#E8DFD3', bg: '#FDFAF5',
  txt: '#4A3728', sub: '#8B7560', dim: '#B8A898',
};

type MsgType = { text: string; ok: boolean };

export function SettingsPreview() {
  const [msg, setMsg] = useState<MsgType | null>(null);
  const show = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 2000); };

  const handleSave = async () => {
    try { const name = await duplicateActiveChat(); show(`已保存：${name}`); }
    catch { show('无活跃对话可保存', false); }
  };

  const handleExport = () => {
    const json = exportActiveChat();
    if (!json) { show('无活跃对话可导出', false); return; }
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    show('对话已导出');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const name = await importChatFromJSON(text);
        show(`已导入：${name}`);
      } catch (err: any) { show(err.message || '导入失败', false); }
    };
    input.click();
  };

  const actions = [
    { icon: Copy,      label: '保存进度', desc: '复制当前对话为副本',   onClick: handleSave,   tone: '#C4953A' },
    { icon: Download,  label: '导出存档', desc: '导出当前对话为 JSON',  onClick: handleExport,  tone: '#5B9E8A' },
    { icon: Upload,    label: '导入存档', desc: '从 JSON 文件导入对话', onClick: handleImport,  tone: '#8B7EC8' },
    { icon: RefreshCw, label: '检查更新', desc: '当前为最新版本',       onClick: () => show('已是最新版本'), tone: '#B8A898' },
  ];

  return (
    <div className="space-y-3">
      {/* 标题 */}
      <div className="-mx-2.5 -mt-3 px-3 py-3 bg-gradient-to-r from-slate-50 via-slate-100/40 to-slate-50 border-b border-slate-200/60 text-center">
        <span className="text-base font-bold text-slate-800 tracking-wide">系统设置</span>
        <div className="mt-1 mx-auto w-8 h-0.5 rounded-full bg-slate-400" />
      </div>

      {/* 操作列表 */}
      <div className="space-y-2">
        {actions.map(({ icon: Icon, label, desc, onClick, tone }) => (
          <motion.button
            key={label} type="button" onClick={onClick} whileTap={{ scale: 0.97 }}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:shadow-sm"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${tone}14` }}>
              <Icon className="w-4 h-4" style={{ color: tone }} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-sm font-semibold block" style={{ color: C.txt }}>{label}</span>
              <span className="text-[10px] block" style={{ color: C.dim }}>{desc}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: C.dim }} />
          </motion.button>
        ))}
      </div>

      {/* 返回主菜单 */}
      <motion.button type="button" onClick={goToLobby} whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
        style={{ background: '#C4953A', color: 'white' }}>
        <Home className="w-4 h-4" /> 返回主菜单
      </motion.button>

      {/* 消息提示 */}
      {msg && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs font-medium flex items-center justify-center gap-1"
          style={{ color: msg.ok ? C.sub : '#E8574A' }}>
          {msg.ok ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {msg.text}
        </motion.div>
      )}
    </div>
  );
}
