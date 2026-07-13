import { useState, useEffect, useMemo } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatCurrency } from '@/lib/finance';
import { motion } from 'framer-motion';
import type { AssetCategory } from '@/types';

// ─── 分类元数据 ─────────────────────────────────────────

const CAT = {
  liquid:     { label: '流动资金', emoji: '💵', color: '#22C55E', bg: '#F0FDF4', ring: '#BBF7D0', desc: '现金、银行卡、电子钱包等随时可用' },
  realEstate: { label: '固定资产', emoji: '🏠', color: '#D4AF37', bg: '#FFFDF5', ring: '#FDE68A', desc: '房屋、土地、商铺、车库等不动产' },
  movable:    { label: '动产资产', emoji: '🚗', color: '#F59E0B', bg: '#FFFBF0', ring: '#FCD34D', desc: '汽车、摩托、家具、珠宝、收藏品' },
  financial:  { label: '金融资产', emoji: '📈', color: '#3B82F6', bg: '#F5F9FF', ring: '#BFDBFE', desc: '股票、基金、债券、加密货币' },
  business:   { label: '经营资产', emoji: '💼', color: '#8B5CF6', bg: '#F9F7FF', ring: '#DDD6FE', desc: '公司、店铺、工厂、IP、品牌、专利' },
} as const;

const TABS = Object.keys(CAT) as AssetCategory[];

const ASSET_ICON: Record<string, string> = {
  'credit-card': '💳', smartphone: '📱', laptop: '💻', bike: '🚲',
  'trending-up': '📈', coins: '⭐',
};

// ─── 动画变体 ───────────────────────────────────────────

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] },
});

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
};

// ─── 净值 Hero ──────────────────────────────────────────

function NetWorthHero({ netWorth, cash, assetsTotal }: { netWorth: number; cash: number; assetsTotal: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative overflow-hidden rounded-3xl p-6 text-center"
      style={{
        background: 'linear-gradient(145deg, #1C1C1E 0%, #2C2C2E 40%, #1C1C1E 100%)',
        boxShadow: '0 0 60px rgba(212,175,55,0.08), 0 8px 32px rgba(0,0,0,0.18)',
      }}
    >
      {/* 背景光晕 */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)' }} />

      <span className="relative text-xs font-medium tracking-[0.2em] uppercase text-white/40">Net Worth</span>
      <div className="relative mt-2">
        <motion.span
          key={netWorth}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="font-number text-5xl font-bold text-white tracking-tight"
          style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif" }}
        >
          ¥{formatCurrency(netWorth)}
        </motion.span>
      </div>
      <div className="relative mt-4 flex justify-center gap-8">
        <div className="text-center">
          <span className="text-[11px] text-white/35">现金</span>
          <p className="font-number text-sm font-semibold text-white/80 mt-0.5">¥{formatCurrency(cash)}</p>
        </div>
        <div className="w-px bg-white/10" />
        <div className="text-center">
          <span className="text-[11px] text-white/35">资产</span>
          <p className="font-number text-sm font-semibold text-white/80 mt-0.5">¥{formatCurrency(assetsTotal)}</p>
        </div>
      </div>
    </motion.section>
  );
}

// ─── 分类标签栏 ─────────────────────────────────────────

function CategoryTabs({ active, onChange }: { active: AssetCategory; onChange: (cat: AssetCategory) => void }) {
  return (
    <nav
      aria-label="资产分类"
      className="flex gap-1.5 p-1.5 rounded-2xl bg-cream-50/80 backdrop-blur-sm border border-cream-100"
    >
      {TABS.map((key) => {
        const meta = CAT[key];
        const isActive = active === key;
        return (
          <button
            key={key}
            id={`tab-${key}`}
            type="button"
            onClick={() => onChange(key)}
            className={`
              flex-1 relative px-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300
              ${isActive
                ? 'text-slate-800'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="property-tab"
                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100"
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              <motion.span
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="text-base"
              >
                {meta.emoji}
              </motion.span>
              <span className="hidden sm:inline">{meta.label}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── 资产行 ─────────────────────────────────────────────

function AssetRow({ asset, index }: { asset: { id: string; name: string; value: number; icon: string; description: string }; index: number }) {
  return (
    <motion.div
      {...stagger(index)}
      id={`asset-${asset.id}`}
      className="group flex items-center gap-4 py-3 px-3 -mx-1 rounded-xl transition-all duration-200 hover:bg-cream-50/70"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
        style={{ background: 'linear-gradient(135deg, #FFFBF0 0%, #FEF3C7 100%)' }}
      >
        {ASSET_ICON[asset.icon] ?? '📦'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">{asset.name}</p>
        <p className="text-[11px] text-slate-400 truncate">{asset.description}</p>
      </div>
      <motion.span
        className="font-number text-sm font-bold text-slate-800 shrink-0 tabular-nums"
        whileHover={{ scale: 1.04 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        ¥{formatCurrency(asset.value)}
      </motion.span>
    </motion.div>
  );
}

// ─── 分类汇总进度条 ─────────────────────────────────────

function CategoryBar({ category, total, maxTotal }: { category: AssetCategory; total: number; maxTotal: number }) {
  const meta = CAT[category];
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

  return (
    <div
      id={`summary-${category}`}
      className="group flex items-center gap-3 py-2 px-2 -mx-1 rounded-lg transition-colors hover:bg-white/40"
    >
      <span className="text-base w-7 text-center">{meta.emoji}</span>
      <span className="text-xs text-slate-600 w-16 shrink-0">{meta.label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full transition-colors"
          style={{ backgroundColor: meta.color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
      <span className="text-xs font-number text-slate-500 w-20 text-right tabular-nums">
        {total > 0 ? `¥${formatCurrency(total)}` : '—'}
      </span>
    </div>
  );
}

// ─── 主组件 ─────────────────────────────────────────────

export function PropertyDetailOverlay() {
  const { state, updateOverlayTitle } = useGame();
  const cash = state.finance.cash;
  const assets = useMemo(() => state.finance.assets ?? [], [state.finance.assets]);

  const initCat: AssetCategory = (state.detailView?.payload?.category as AssetCategory) ?? 'liquid';
  const [category, setCategory] = useState<AssetCategory>(initCat);

  // 动态标题
  useEffect(() => {
    const meta = CAT[category];
    updateOverlayTitle(`财产详情 · ${meta.label}`);
  }, [category, updateOverlayTitle]);

  // 当前分类数据
  const catAssets = useMemo(() => assets.filter((a) => a.category === category), [assets, category]);
  const catTotal = useMemo(() => catAssets.reduce((s, a) => s + a.value, 0), [catAssets]);

  // 总净值
  const assetsTotal = useMemo(() => assets.reduce((s, a) => s + a.value, 0), [assets]);
  const netWorth = cash + assetsTotal;
  const maxCatTotal = useMemo(() => Math.max(...TABS.map((k) => assets.filter((a) => a.category === k).reduce((s, a) => s + a.value, 0)), 1), [assets]);

  const meta = CAT[category];

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── 净值 Hero ── */}
      <NetWorthHero netWorth={netWorth} cash={cash} assetsTotal={assetsTotal} />

      {/* ── 分类标签 ── */}
      <CategoryTabs active={category} onChange={setCategory} />

      {/* ── 当前分类详情 ── */}
      <motion.section
        key={category}
        {...fadeUp}
        aria-label={`${meta.label}详情`}
      >
        <GlassCard variant="cream" className="overflow-hidden">
          {/* 标题栏 */}
          <div
            className="px-5 py-4 flex items-center justify-between border-b"
            style={{ borderColor: meta.ring, background: `linear-gradient(135deg, ${meta.bg} 0%, transparent 100%)` }}
          >
            <div>
              <h2 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2">
                <motion.span
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-xl"
                >
                  {meta.emoji}
                </motion.span>
                {meta.label}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">{meta.desc}</p>
            </div>
            <div className="text-right shrink-0">
              <motion.p
                key={catTotal}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-number text-xl font-bold text-slate-800 tabular-nums"
              >
                ¥{formatCurrency(catTotal)}
              </motion.p>
              <span className="text-[10px] text-slate-400">{catAssets.length} 项资产</span>
            </div>
          </div>

          {/* 资产列表 */}
          <div className="px-2 py-3">
            {catAssets.length === 0 ? (
              <div className="py-12 text-center">
                <motion.span
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-5xl opacity-30 inline-block"
                >
                  {meta.emoji}
                </motion.span>
                <p className="text-sm text-slate-400 mt-3 font-medium">
                  暂无{meta.label}
                </p>
                <p className="text-[11px] text-slate-300 mt-1">
                  此分类的资产将随游戏进程逐渐解锁
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {catAssets.map((asset, i) => (
                  <AssetRow key={asset.id} asset={asset} index={i} />
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </motion.section>

      {/* ── 各分类占比 ── */}
      <GlassCard variant="default" className="p-5">
        <h3 className="font-heading text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
          资产分布
        </h3>
        <div className="space-y-1">
          {TABS.map((key) => {
            const total = assets.filter((a) => a.category === key).reduce((s, a) => s + a.value, 0);
            return (
              <CategoryBar key={key} category={key} total={total} maxTotal={maxCatTotal} />
            );
          })}
        </div>
      </GlassCard>

    </div>
  );
}
