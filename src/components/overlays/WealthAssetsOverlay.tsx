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
      ? 'text-wealth-emerald'
      : type === 'expense'
        ? 'text-status-coral'
        : isPositive
          ? 'text-wealth-emerald'
          : 'text-status-coral';
  const Icon = type === 'income' ? TrendingUp : type === 'expense' ? TrendingDown : Wallet;

  return (
    <GlassCard variant="elevated" className="p-4 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          type === 'income'
            ? 'bg-wealth-emerald/15 text-wealth-emerald'
            : type === 'expense'
              ? 'bg-status-coral/15 text-status-coral'
              : 'bg-wealth-gold/15 text-wealth-gold'
        }`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-text-muted block">{label}</span>
        <div className={`font-number text-xl font-bold ${colorClass}`}>
          {isPositive && type !== 'net' ? '+' : ''}¥{formatCurrency(Math.abs(amount))}
        </div>
      </div>
    </GlassCard>
  );
}

function TransactionItem({ tx }: { tx: Transaction }) {
  const Icon = tx.type === 'income' ? TrendingUp : TrendingDown;

  return (
    <GlassCard variant="default" className="p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            tx.type === 'income'
              ? 'bg-wealth-emerald/15 text-wealth-emerald'
              : 'bg-status-coral/15 text-status-coral'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-text-primary">{tx.title}</span>
          <span className="text-[10px] text-text-secondary">{tx.date} · {tx.category}</span>
        </div>
      </div>
      <span
        className={`font-number text-sm font-bold ${
          tx.type === 'income' ? 'text-wealth-emerald' : 'text-status-coral'
        }`}
      >
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
    <GlassCard variant="default" className="p-5 module-card-wealth">
      <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-wealth-emerald" /> {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {assets.map((asset) => {
          const Icon = iconMap[asset.name] ?? Wallet;
          return (
            <GlassCard key={asset.id} variant="elevated" className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-wealth-gold/15 flex items-center justify-center text-wealth-gold">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-text-primary block truncate">{asset.name}</span>
                <span className="font-number text-base text-text-primary font-bold">
                  {isPoints ? '' : '¥'}{formatCurrency(asset.value)}
                </span>
                <p className="text-[10px] text-text-secondary mt-0.5 truncate">{asset.description}</p>
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
      {/* 今日收支概览 */}
      <GlassCard variant="floating" className="p-5 module-card-wealth">
        <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-wealth-emerald" /> 今日流水 + 收支概览
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard label="今日收入" amount={daily.income} type="income" />
          <SummaryCard label="今日支出" amount={daily.expense} type="expense" />
          <SummaryCard label="今日结余" amount={daily.income - daily.expense} type="net" />
        </div>

        <div className="mt-5 pt-5 border-t border-border-soft/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-text-primary">钱包现金</span>
            <span className="font-number text-xl font-bold text-text-primary">¥{formatCurrency(state.finance.cash)}</span>
          </div>
          <div className="space-y-2">
            {todayTransactions.length === 0 && (
              <p className="text-sm text-text-secondary">今日暂无流水记录</p>
            )}
            {todayTransactions.map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </div>
        </div>
      </GlassCard>

      {/* 虚拟资产 */}
      <AssetList
        title="虚拟资产"
        assets={state.finance.virtualAssets.filter((a) => a.name !== '现金')}
        iconMap={virtualIconMap}
      />

      {/* 固定资产 */}
      <AssetList title="固定资产" assets={state.finance.fixedAssets} iconMap={fixedIconMap} />

      {/* 财产详情按钮 */}
      <button
        type="button"
        className="w-full py-3 rounded-2xl bg-wealth-emerald/10 border border-wealth-emerald/20 text-wealth-emerald text-sm font-bold flex items-center justify-center gap-1 hover:bg-wealth-emerald/20 transition-colors"
      >
        财产详情（银行卡、虚拟财产、不动产、权益类）<ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
