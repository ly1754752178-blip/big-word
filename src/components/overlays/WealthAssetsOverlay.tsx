import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Banknote,
  CreditCard,
  Coins,
  Bike,
  Laptop,
  ChevronRight,
} from 'lucide-react';
import type { Asset, Transaction } from '@/types';
import { getDailySummary, formatCurrency } from '@/lib/finance';

const virtualIconMap: Record<string, typeof Banknote> = {
  现金: Banknote,
  银行账户: CreditCard,
  积分: Coins,
};

const fixedIconMap: Record<string, typeof Bike> = {
  二手自行车: Bike,
  笔记本电脑: Laptop,
};

function SummaryCard({
  label,
  amount,
  type,
}: {
  label: string;
  amount: number;
  type: 'income' | 'expense' | 'net';
}) {
  const isPositive = amount >= 0;
  const colorClass =
    type === 'income'
      ? 'text-mint-600'
      : type === 'expense'
        ? 'text-coral-500'
        : isPositive
          ? 'text-mint-600'
          : 'text-coral-500';
  const Icon = type === 'income' ? TrendingUp : type === 'expense' ? TrendingDown : Wallet;
  const bgClass =
    type === 'income'
      ? 'bg-mint-100 text-mint-500'
      : type === 'expense'
        ? 'bg-coral-100 text-coral-500'
        : 'bg-sky-100 text-sky-500';

  return (
    <GlassCard variant="elevated" className="p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-slate-400 block">{label}</span>
        <div className={`font-number text-xl font-bold ${colorClass}`}>
          {isPositive && type !== 'net' ? '+' : ''}¥{formatCurrency(Math.abs(amount))}
        </div>
      </div>
    </GlassCard>
  );
}

function TransactionItem({ tx }: { tx: Transaction }) {
  const Icon = tx.type === 'income' ? TrendingUp : TrendingDown;
  const bgClass = tx.type === 'income' ? 'bg-mint-100 text-mint-500' : 'bg-coral-100 text-coral-500';
  const textClass = tx.type === 'income' ? 'text-mint-600' : 'text-coral-500';

  return (
    <GlassCard variant="default" className="p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bgClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{tx.title}</span>
          <span className="text-[10px] text-slate-400">{tx.date} · {tx.category}</span>
        </div>
      </div>
      <span className={`font-number text-sm font-bold ${textClass}`}>
        {tx.type === 'income' ? '+' : ''}¥{formatCurrency(tx.amount)}
      </span>
    </GlassCard>
  );
}

function AssetList({
  title,
  assets,
  iconMap,
  isPoints,
}: {
  title: string;
  assets: Asset[];
  iconMap: Record<string, typeof Banknote>;
  isPoints?: boolean;
}) {
  return (
    <GlassCard variant="mint" className="p-5">
      <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-mint-500" /> {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {assets.map((asset) => {
          const Icon = iconMap[asset.name] ?? Wallet;
          return (
            <GlassCard key={asset.id} variant="elevated" className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-500">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-slate-700 block truncate">{asset.name}</span>
                <span className="font-number text-base text-slate-700 font-bold">
                  {isPoints ? '' : '¥'}{formatCurrency(asset.value)}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{asset.description}</p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </GlassCard>
  );
}

export function WealthAssetsOverlay() {
  const { state } = useGame();
  const { expenses } = state.finance;
  const today = `${state.date.year}-${String(state.date.month).padStart(2, '0')}-${String(state.date.day).padStart(2, '0')}`;

  const daily = getDailySummary(expenses, today);
  const todayTransactions = expenses.filter((tx) => tx.date === today);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <GlassCard variant="cream" className="p-5">
        <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-mint-500" /> 今日流水 + 收支概览
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard label="今日收入" amount={daily.income} type="income" />
          <SummaryCard label="今日支出" amount={daily.expense} type="expense" />
          <SummaryCard label="今日结余" amount={daily.income - daily.expense} type="net" />
        </div>

        <div className="mt-5 pt-5 border-t border-cream-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-700">钱包现金</span>
            <span className="font-number text-xl font-bold text-slate-800">¥{formatCurrency(state.finance.cash)}</span>
          </div>
          <div className="space-y-2">
            {todayTransactions.length === 0 && (
              <p className="text-sm text-slate-500">今日暂无流水记录</p>
            )}
            {todayTransactions.map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </div>
        </div>
      </GlassCard>

      <AssetList
        title="虚拟资产"
        assets={state.finance.virtualAssets.filter((a) => a.name !== '现金')}
        iconMap={virtualIconMap}
      />

      <AssetList title="固定资产" assets={state.finance.fixedAssets} iconMap={fixedIconMap} />

      <button
        type="button"
        className="w-full py-3 rounded-2xl bg-mint-100 border border-mint-200 text-mint-700 text-sm font-bold flex items-center justify-center gap-1 hover:bg-mint-200 transition-colors"
      >
        财产详情（银行卡、虚拟财产、不动产、权益类）<ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
