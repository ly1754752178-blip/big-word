import { useGame } from '@/hooks/useGameState';
import { TrendingUp, TrendingDown, Banknote, CreditCard, Coins, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { getDailySummary, formatCurrency } from '@/lib/finance';

export function WealthPreview() {
  const { state, openOverlayView } = useGame();
  const today = `${state.date.year}-${String(state.date.month).padStart(2, '0')}-${String(state.date.day).padStart(2, '0')}`;
  const daily = getDailySummary(state.finance.expenses, today);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 rounded-full bg-mint-100 text-mint-600 text-sm font-medium">财富资产</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <GlassCard variant="mint" className="p-2.5">
          <div className="flex items-center gap-1 text-[10px] text-mint-600">
            <TrendingUp className="w-3 h-3" /> 今日收入
          </div>
          <div className="mt-1 font-number text-sm font-bold text-slate-700">+¥{formatCurrency(daily.income)}</div>
        </GlassCard>
        <GlassCard variant="coral" className="p-2.5">
          <div className="flex items-center gap-1 text-[10px] text-coral-500">
            <TrendingDown className="w-3 h-3" /> 今日支出
          </div>
          <div className="mt-1 font-number text-sm font-bold text-slate-700">-¥{formatCurrency(Math.abs(daily.expense))}</div>
        </GlassCard>
      </div>

      <GlassCard variant="cream" className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">现金</span>
          <Banknote className="w-4 h-4 text-sky-500" />
        </div>
        <div className="mt-1 font-number text-lg font-bold text-slate-800">¥{formatCurrency(state.finance.cash)}</div>
      </GlassCard>

      <div className="space-y-2">
        {state.finance.virtualAssets
          .filter((a) => a.name !== '现金')
          .slice(0, 2)
          .map((asset) => (
            <GlassCard key={asset.id} variant="default" className="p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cream-100 flex items-center justify-center text-sky-500">
                  {asset.name === '银行账户' ? <CreditCard className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                </div>
                <span className="text-xs text-slate-700">{asset.name}</span>
              </div>
              <span className="text-xs font-number text-slate-700">¥{formatCurrency(asset.value)}</span>
            </GlassCard>
          ))}
      </div>

      <button
        type="button"
        id="preview-wealth-detail"
        onClick={() => openOverlayView('wealth')}
        className="w-full py-2.5 rounded-xl bg-mint-100 border border-mint-200 text-mint-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-mint-200 transition-colors"
      >
        财产详情 <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
