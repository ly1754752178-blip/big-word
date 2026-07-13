import { useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  TrendingUp, TrendingDown, Banknote, CreditCard, Coins, ChevronRight, Wallet,
} from 'lucide-react';
import { getDailySummary, getWeeklySummary, formatCurrency } from '@/lib/finance';

// ─── 内部组件 ────────────────────────────────────────────

function FlowRow({ tx }: { tx: { title: string; amount: number; type: 'income' | 'expense'; date: string; category: string } }) {
  const isIncome = tx.type === 'income';
  return (
    <div className="flex items-center gap-3 py-2 px-1 hover:bg-white/40 rounded-lg transition-colors">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isIncome ? 'bg-mint-100 text-mint-500' : 'bg-coral-100 text-coral-500'}`}>
        {isIncome ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      </div>
      <span className="flex-1 text-xs text-slate-700 truncate">{tx.title}</span>
      <span className="text-[10px] text-slate-400 shrink-0">{tx.date.slice(-5)}</span>
      <span className={`text-xs font-number font-bold shrink-0 ${isIncome ? 'text-mint-600' : 'text-coral-500'}`}>
        {isIncome ? '+' : '-'}¥{formatCurrency(Math.abs(tx.amount))}
      </span>
    </div>
  );
}

function SavingRow({ icon: Icon, name, value, isPoints }: { icon: typeof Banknote; name: string; value: number; isPoints?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-1">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-cream-100 flex items-center justify-center text-sky-500">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs text-slate-600">{name}</span>
      </div>
      <span className="text-xs font-number text-slate-700">
        {isPoints ? '' : '¥'}{formatCurrency(value)}
      </span>
    </div>
  );
}

// ─── 主组件 ──────────────────────────────────────────────

export function WealthAssetsOverlay() {
  const { state, openOverlayView } = useGame();
  const today = `${state.date.year}-${String(state.date.month).padStart(2, '0')}-${String(state.date.day).padStart(2, '0')}`;
  const [tab, setTab] = useState<'today' | 'week'>('today');

  const daily = getDailySummary(state.finance.expenses, today);
  const weekly = getWeeklySummary(state.finance.expenses, today);
  const todayTx = state.finance.expenses.filter((tx) => tx.date === today);
  const weekTx = state.finance.expenses.filter((tx) => {
    const d = new Date(tx.date);
    const monday = new Date(today);
    const day = monday.getDay();
    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
    return d >= monday && d <= new Date(today);
  });

  // 储蓄 = virtualAssets 除去"现金"
  const savings = state.finance.virtualAssets.filter((a) => a.name !== '现金');

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* ── Tab 切换 ── */}
      <div className="flex bg-cream-50 rounded-xl p-1 gap-1">
        {(['today', 'week'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t
                ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t === 'today' ? '📋 今日流水' : '📊 本周概览'}
          </button>
        ))}
      </div>

      {/* ── 今日 ── */}
      {tab === 'today' && (
        <>
          <GlassCard variant="cream" className="p-4">
            <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-mint-500" /> 今日流水
            </h3>
            {todayTx.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-3">今日暂无收支记录</p>
            )}
            <div className="divide-y divide-slate-100">
              {todayTx.map((tx) => <FlowRow key={tx.id} tx={tx} />)}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
              <span className="text-mint-600 font-bold">收入 +¥{formatCurrency(daily.income)}</span>
              <span className="text-coral-500 font-bold">支出 -¥{formatCurrency(Math.abs(daily.expense))}</span>
              <span className={`font-bold ${daily.income - daily.expense >= 0 ? 'text-slate-700' : 'text-coral-500'}`}>
                净额 {daily.income - daily.expense >= 0 ? '+' : ''}¥{formatCurrency(daily.income - daily.expense)}
              </span>
            </div>
          </GlassCard>

          {/* 随身现金 */}
          <GlassCard variant="elevated" className="p-4 text-center">
            <span className="text-[10px] text-slate-400 tracking-wide">随身现金</span>
            <div className="font-number text-3xl font-bold text-slate-800 mt-1">¥{formatCurrency(state.finance.cash)}</div>
            <span className="text-[10px] text-slate-400">随今日流水实时变动</span>
          </GlassCard>
        </>
      )}

      {/* ── 本周 ── */}
      {tab === 'week' && (
        <GlassCard variant="cream" className="p-4">
          <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5">
            📊 本周 ({weekly.startDate} ~ {weekly.endDate})
          </h3>
          <div className="flex justify-between text-sm font-number font-bold mb-3">
            <span className="text-mint-600">收入 +¥{formatCurrency(weekly.income)}</span>
            <span className="text-coral-500">支出 -¥{formatCurrency(Math.abs(weekly.expense))}</span>
            <span className={weekly.net >= 0 ? 'text-slate-700' : 'text-coral-500'}>
              净额 {weekly.net >= 0 ? '+' : ''}¥{formatCurrency(weekly.net)}
            </span>
          </div>
          {weekTx.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-3">本周暂无收支记录</p>
          )}
          <div className="divide-y divide-slate-100">
            {weekTx.map((tx) => <FlowRow key={tx.id} tx={tx} />)}
          </div>
        </GlassCard>
      )}

      {/* ── 储蓄（始终可见） ── */}
      <GlassCard variant="mint" className="p-4">
        <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5">
          🏦 储蓄
        </h3>
        {savings.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">暂无储蓄</p>
        )}
        {savings.map((a) => (
          <SavingRow
            key={a.id}
            icon={a.name === '银行账户' ? CreditCard : a.name === '积分' ? Coins : Banknote}
            name={a.name}
            value={a.value}
            isPoints={a.name === '积分'}
          />
        ))}
      </GlassCard>

      {/* ── 财产详情按钮 ── */}
      <button
        type="button"
        onClick={() => openOverlayView('propertyDetail')}
        className="w-full py-3 rounded-2xl bg-mint-100 border border-mint-200 text-mint-700 text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-mint-200 transition-colors"
      >
        <Wallet className="w-4 h-4" /> 财产详情（分类资产总览）<ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
