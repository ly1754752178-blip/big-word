// ============================================================
// HistoryDrawer — 历史楼层抽屉（变量快照回溯）
// ============================================================
import { Clock, X } from 'lucide-react';
import type { ChatMessage } from '../../sillytavern';

interface HistoryDrawerProps {
  messages: ChatMessage[];
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryDrawer({
  messages,
  isOpen,
  onClose,
}: HistoryDrawerProps) {
  if (!isOpen) return null;

  // 按楼层拆分（每条 assistant 消息 = 一个楼层）
  const floors = messages.filter((m) => m.role === 'assistant');

  return (
    <div className="history-drawer-overlay" onClick={onClose}>
      <div
        className="history-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="history-drawer__header">
          <h3><Clock size={16} /> 历史楼层</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="history-drawer__list">
          {floors.length === 0 && (
            <p className="history-drawer__empty">暂无楼层</p>
          )}

          {floors.map((floor, idx) => {
            const preview = floor.content.slice(0, 60) + (floor.content.length > 60 ? '...' : '');
            const varCount = Object.keys(floor.variables ?? {}).length;

            return (
              <div key={floor.id} className="history-drawer__floor">
                <div className="history-drawer__floor-header">
                  <span className="history-drawer__floor-num">楼层 {idx + 1}</span>
                  {varCount > 0 && (
                    <span className="history-drawer__floor-vars">{varCount} 变量</span>
                  )}
                </div>
                <p className="history-drawer__floor-preview">{preview}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
