import { useGame } from '@/hooks/useGameState';
import { TrendingUp, TrendingDown, Banknote, CreditCard, Coins, ChevronRight } from 'lucide-react';
import { getDailySummary, formatCurrency } from '@/lib/finance';

export function WealthPreview() {
  const { state, openOverlayView } = useGame();
  const today = `${state.date.year}-${String(state.date.month).padStart(2, '0')}-${String(state.date.day).padStart(2, '0')}`;
  const daily = getDailySummary(state.finance.expenses, today);

  return (
    <div className="p-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-xl bg-wealth-emerald/10 border border-wealth-emerald/20">
          <div className="flex items-center gap-1 text-[10px] text-wealth-emerald"><TrendingUp className="w-3 h-3" /> 今日收入</div>
          <div className="mt-1 font-number text-sm font-bold text-text-primary">+¥{formatCurrency(daily.income)}</div>
        </div>
        <div className="p-2 rounded-xl bg-status-coral/10 border border-status-coral/20">
          <div className="flex items-center gap-1 text-[10px] text-status-coral"><TrendingDown className="w-3 h-3" /> 今日支出</div>
          <div className="mt-1 font-number text-sm font-bold text-text-primary">-¥{formatCurrency(Math.abs(daily.expense))}</div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-white/60 border border-border-soft">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-secondary">现金</span>
          <Banknote className="w-4 h-4 text-wealth-gold" />
        </div>
        <div className="mt-1 font-number text-lg font-bold text-text-primary">¥{formatCurrency(state.finance.cash)}</div>
      </div>

      <div className="space-y-2">
        {state.finance.virtualAssets
          .filter((a) => a.name !== '现金')
          .slice(0, 2)
          .map((asset) => (
            <div key={asset.id} className="p-2 rounded-xl bg-white/60 border border-border-soft flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-wealth-gold/15 flex items-center justify-center text-wealth-gold">
                  {asset.name === '银行账户' ? <CreditCard className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                </div>
                <span className="text-xs text-text-primary">{asset.name}</span>
              </div>
              <span className="text-xs font-number text-text-primary">¥{formatCurrency(asset.value)}</span>
            </div>
          ))}
      </div>

      <button
        type="button"
        id="preview-wealth-detail"
        onClick={() => openOverlayView('wealth')}
        className="w-full py-2 rounded-xl bg-wealth-emerald/10 border border-wealth-emerald/20 text-wealth-emerald text-xs font-bold flex items-center justify-center gap-1 hover:bg-wealth-emerald/20 transition-colors"
      >
        财产详情 <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
