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
      {/* 财富资产 —— 居中标题横栏 */}
      <div className="-mx-2.5 -mt-3 px-3 py-3 bg-gradient-to-r from-mint-50 via-mint-100/40 to-mint-50 border-b border-mint-100/60 text-center">
        <span className="text-base font-bold text-slate-800 tracking-wide">财富资产</span>
        <div className="mt-1 mx-auto w-8 h-0.5 rounded-full" style={{ backgroundColor: '#22C55E' }} />
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
