import { useState, useEffect } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatCurrency } from '@/lib/finance';
import { motion } from 'framer-motion';
import type { AssetCategory } from '@/types';

// ─── 分类元数据 ─────────────────────────────────────────

const categoryMeta: Record<AssetCategory, { label: string; emoji: string; color: string; desc: string }> = {
  liquid:     { label: '流动资金', emoji: '💵', color: '#22C55E', desc: '现金、银行卡、电子钱包等随时可用的资金' },
  realEstate: { label: '固定资产', emoji: '🏠', color: '#D4AF37', desc: '房屋、土地、商铺、车库等不动产' },
  movable:    { label: '动产资产', emoji: '🚗', color: '#F59E0B', desc: '汽车、摩托、家具、珠宝、收藏品等可移动资产' },
  financial:  { label: '金融资产', emoji: '📈', color: '#3B82F6', desc: '股票、基金、债券、加密货币、保险现金价值' },
  business:   { label: '经营资产', emoji: '💼', color: '#8B5CF6', desc: '公司、店铺、工厂、知识产权、品牌、版权、专利' },
};

const tabs = Object.keys(categoryMeta) as AssetCategory[];

// 资产图标映射
const iconMap: Record<string, string> = {
  'credit-card': '💳', smartphone: '📱', laptop: '💻', bike: '🚲',
  'trending-up': '📈', coins: '⭐',
};

// ─── 分类标签栏 ─────────────────────────────────────────

function CategoryTabs({ active, onChange }: { active: AssetCategory; onChange: (cat: AssetCategory) => void }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-[#FDFAF5] border border-cream-100 overflow-x-auto">
      {tabs.map((key) => {
        const meta = categoryMeta[key];
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex-1 relative px-1.5 py-2.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              isActive ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="property-tab-active"
                className="absolute inset-0 bg-white rounded-lg border border-slate-100 shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1">
              <span className="text-sm">{meta.emoji}</span>
              <span className="hidden sm:inline">{meta.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── 主组件 ─────────────────────────────────────────────

export function PropertyDetailOverlay() {
  const { state, updateOverlayTitle } = useGame();
  const cash = state.finance.cash;
  const assets = state.finance.assets ?? [];

  const initCat: AssetCategory = (state.detailView?.payload?.category as AssetCategory) ?? 'liquid';
  const [category, setCategory] = useState<AssetCategory>(initCat);

  // 动态标题
  useEffect(() => {
    const meta = categoryMeta[category];
    updateOverlayTitle(`财产详情 · ${meta.emoji} ${meta.label}`);
  }, [category, updateOverlayTitle]);

  // 当前分类
  const catAssets = assets.filter((a) => a.category === category);
  const catTotal = catAssets.reduce((sum, a) => sum + a.value, 0);

  // 总净值
  const allAssetsValue = assets.reduce((sum, a) => sum + a.value, 0);
  const netWorth = cash + allAssetsValue;

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* ── 净值总览 ── */}
      <GlassCard variant="elevated" className="p-4 text-center">
        <span className="text-[10px] text-slate-400 tracking-wide">总资产净值</span>
        <div className="font-number text-3xl font-bold text-slate-800 mt-0.5">¥{formatCurrency(netWorth)}</div>
        <div className="flex justify-center gap-5 mt-2 text-[11px] text-slate-400">
          <span>💵 现金 ¥{formatCurrency(cash)}</span>
          <span>📦 资产 ¥{formatCurrency(allAssetsValue)}</span>
        </div>
      </GlassCard>

      {/* ── 分类标签 ── */}
      <CategoryTabs active={category} onChange={setCategory} />

      {/* ── 当前分类详情 ── */}
      <GlassCard variant="cream" className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>{categoryMeta[category].emoji}</span>
              {categoryMeta[category].label}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{categoryMeta[category].desc}</p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <div className="font-number text-lg font-bold text-slate-800">¥{formatCurrency(catTotal)}</div>
            <span className="text-[10px] text-slate-400">{catAssets.length} 项</span>
          </div>
        </div>

        {catAssets.length === 0 ? (
          <div className="py-10 text-center">
            <span className="text-4xl">{categoryMeta[category].emoji}</span>
            <p className="text-sm text-slate-400 mt-3">暂无{categoryMeta[category].label}</p>
            <p className="text-[10px] text-slate-300 mt-1">随游戏进程推进，资产将逐渐累积</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 -mx-1">
            {catAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between py-2.5 px-1 hover:bg-white/40 rounded-lg transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center text-base shrink-0">
                    {iconMap[asset.icon] ?? '📦'}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-slate-700 block truncate">{asset.name}</span>
                    <span className="text-[10px] text-slate-400 truncate block">{asset.description}</span>
                  </div>
                </div>
                <span className="font-number text-sm font-bold text-slate-800 shrink-0 ml-3">¥{formatCurrency(asset.value)}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* ── 各分类汇总 ── */}
      <GlassCard variant="default" className="p-4">
        <h3 className="text-xs font-bold text-slate-500 mb-3">📊 各分类汇总</h3>
        <div className="space-y-2">
          {tabs.map((key) => {
            const items = assets.filter((a) => a.category === key);
            const total = items.reduce((s, a) => s + a.value, 0);
            const meta = categoryMeta[key];
            return (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span>{meta.emoji}</span> {meta.label}
                  <span className="text-[10px] text-slate-400">({items.length}项)</span>
                </span>
                <span className="font-number text-slate-700">{total > 0 ? `¥${formatCurrency(total)}` : '—'}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

    </div>
  );
}
