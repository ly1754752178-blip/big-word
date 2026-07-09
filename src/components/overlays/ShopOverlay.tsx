import { useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  Coffee,
  Cookie,
  BookOpen,
  Shirt,
  Lamp,
  ShoppingBag,
  Check,
} from 'lucide-react';
import type { ShopItem } from '@/types';

const categoryLabels: Record<ShopItem['category'], string> = {
  gift: '礼物',
  outfit: '服装',
  furniture: '家具',
  consumable: '消耗品',
  book: '书籍',
};

const categoryIcons: Record<ShopItem['category'], typeof Coffee> = {
  gift: Coffee,
  outfit: Shirt,
  furniture: Lamp,
  consumable: Cookie,
  book: BookOpen,
};

const categories: ShopItem['category'][] = ['gift', 'outfit', 'furniture', 'consumable', 'book'];

export function ShopOverlay() {
  const { state, buyShopItem } = useGame();
  const { shopItems, inventory, finance } = state;
  const [filter, setFilter] = useState<ShopItem['category'] | 'all'>('all');
  const [boughtId, setBoughtId] = useState<string | null>(null);

  const filtered =
    filter === 'all' ? shopItems : shopItems.filter((item) => item.category === filter);

  const handleBuy = (item: ShopItem) => {
    if (finance.cash < item.price) return;
    buyShopItem(item.id);
    setBoughtId(item.id);
    setTimeout(() => setBoughtId(null), 1200);
  };

  const getOwned = (itemId: string) => inventory.find((i) => i.id === itemId)?.quantity ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-sky-500" />
          <h3 className="text-lg font-bold text-slate-800">商店与衣柜</h3>
        </div>
        <div className="px-4 py-2 rounded-xl bg-mint-50 border border-mint-100 text-sm text-slate-700">
          现金：
          <span className="font-number font-bold text-mint-600">¥{finance.cash.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-sky-500 text-white'
              : 'bg-white text-slate-600 border border-slate-100 hover:bg-sky-50'
          }`}
        >
          全部
        </button>
        {categories.map((cat) => {
          const Icon = categoryIcons[cat];
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === cat
                  ? 'bg-sky-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-100 hover:bg-sky-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {categoryLabels[cat]}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const Icon = categoryIcons[item.category];
          const canAfford = finance.cash >= item.price;
          const owned = getOwned(item.id);
          const justBought = boughtId === item.id;

          return (
            <GlassCard key={item.id} variant="cream" className="p-4 flex flex-col">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-500"
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                  <p className="text-xs text-slate-500">{categoryLabels[item.category]}</p>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-600 leading-relaxed">{item.description}</p>
              <p className="mt-1 text-[10px] text-mint-600">{item.effect}</p>

              <div className="mt-auto pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-number text-coral-500 font-bold">¥{item.price.toLocaleString()}</span>
                  {owned > 0 && (
                    <span className="text-[10px] text-slate-400">持有 {owned}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleBuy(item)}
                  disabled={!canAfford || justBought}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    justBought
                      ? 'bg-mint-100 text-mint-700'
                      : canAfford
                        ? 'bg-sky-500 text-white hover:bg-sky-600'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {justBought ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> 已购
                    </>
                  ) : (
                    '购买'
                  )}
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
