import { useGame } from '@/hooks/useGameState';

export function WalletApp() {
  const { state } = useGame();

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-mint-50 border border-mint-100 p-4 text-center">
        <div className="text-xs text-slate-500">当前现金</div>
        <div className="mt-1 text-2xl font-number font-bold text-slate-800">
          ¥{state.finance.cash.toLocaleString()}
        </div>
      </div>
      <div className="space-y-2">
        {state.finance.expenses.slice(0, 5).map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between text-xs rounded-xl bg-white border border-slate-100 p-2.5"
          >
            <span className="text-slate-700 truncate">{tx.title}</span>
            <span
              className={`font-number ${tx.type === 'income' ? 'text-mint-500' : 'text-coral-500'}`}
            >
              {tx.type === 'income' ? '+' : ''}{tx.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
