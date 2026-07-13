import { useState, useEffect, useMemo, useCallback } from 'react';
import { useGame } from '@/hooks/useGameState';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatCurrency } from '@/lib/finance';
import { motion } from 'framer-motion';
import type { AssetCategory } from '@/types';

// ─── 分类元数据 ─────────────────────────────────────────

const CAT = {
  liquid:     { label: '流动资金', emoji: '💵', color: '#22C55E', bg: '#F0FDF4', ring: '#BBF7D0', desc: '手元の現金、銀行口座、電子マネーなど即時利用可能な資金', short: '現金・口座' },
  realEstate: { label: '固定资产', emoji: '🏠', color: '#D4AF37', bg: '#FFFDF5', ring: '#FDE68A', desc: '住宅、土地、店舗、駐車場などの不動産', short: '不動産' },
  movable:    { label: '动产资产', emoji: '🚗', color: '#F59E0B', bg: '#FFFBF0', ring: '#FCD34D', desc: '自動車、家具、宝飾品、コレクションなど', short: '動産' },
  financial:  { label: '金融资产', emoji: '📈', color: '#3B82F6', bg: '#F5F9FF', ring: '#BFDBFE', desc: '株式、投資信託、債券、暗号資産、保険', short: '金融' },
  business:   { label: '经营资产', emoji: '💼', color: '#8B5CF6', bg: '#F9F7FF', ring: '#DDD6FE', desc: '会社、店舗、工場、知的財産、ブランド、特許', short: '経営' },
} as const;

const TABS = Object.keys(CAT) as AssetCategory[];

const ASSET_ICON: Record<string, string> = {
  'credit-card': '💳', smartphone: '📱', laptop: '💻', bike: '🚲',
  'trending-up': '📈', coins: '⭐', wallet: '👛',
};

// ─── 动画 ───────────────────────────────────────────────

const spring = { type: 'spring' as const, stiffness: 380, damping: 28 };

const rowStagger = (i: number) => ({
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] },
});

// ─── 净值 Hero ──────────────────────────────────────────

function NetWorthHero({ netWorth, cash, assetsTotal }: { netWorth: number; cash: number; assetsTotal: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative overflow-hidden rounded-[28px] p-7 text-center"
      style={{
        background: 'linear-gradient(155deg, #1A1A1C 0%, #262628 35%, #1E1E20 100%)',
        boxShadow: '0 0 80px rgba(212,175,55,0.06), 0 12px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* 微点纹理 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      {/* 光晕 */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, rgba(52,211,153,0.03) 40%, transparent 70%)' }} />

      <span className="relative text-[11px] font-medium tracking-[0.22em] uppercase text-white/35">Total Net Worth</span>
      <div className="relative mt-1.5">
        <motion.span
          key={netWorth}
          initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-number text-6xl font-extrabold text-white tracking-tighter"
          style={{ fontFamily: "'Inter', 'SF Pro Display', 'Helvetica Neue', system-ui, sans-serif" }}
        >
          ¥{formatCurrency(netWorth)}
        </motion.span>
      </div>
      <div className="relative mt-5 flex justify-center gap-10">
        <div className="text-center">
          <span className="text-[10px] text-white/30 tracking-wider">現金</span>
          <p className="font-number text-sm font-semibold text-white/75 mt-1">¥{formatCurrency(cash)}</p>
        </div>
        <div className="w-px bg-white/8" />
        <div className="text-center">
          <span className="text-[10px] text-white/30 tracking-wider">保有資産</span>
          <p className="font-number text-sm font-semibold text-white/75 mt-1">¥{formatCurrency(assetsTotal)}</p>
        </div>
      </div>
    </motion.section>
  );
}

// ─── 分类标签栏 ─────────────────────────────────────────

function CategoryTabs({ active, onChange, counts }: { active: AssetCategory; onChange: (cat: AssetCategory) => void; counts: Record<AssetCategory, number> }) {
  return (
    <nav aria-label="資産分類" className="flex gap-1 p-1.5 rounded-2xl bg-cream-50/70 backdrop-blur-sm border border-cream-100/80">
      {TABS.map((key) => {
        const meta = CAT[key];
        const isActive = active === key;
        const n = counts[key] ?? 0;
        return (
          <button
            key={key}
            id={`tab-${key}`}
            type="button"
            onClick={() => onChange(key)}
            className={`
              flex-1 relative px-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300
              ${isActive
                ? 'text-slate-800'
                : `text-slate-400 hover:text-slate-600 ${n === 0 ? 'opacity-50' : ''}`
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="property-tab"
                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100/80"
                transition={spring}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1">
              <motion.span
                animate={{ scale: isActive ? 1.18 : 1 }}
                transition={spring}
                className="text-base"
              >
                {meta.emoji}
              </motion.span>
              <span className="hidden sm:inline">{meta.short}</span>
              {n > 0 && (
                <motion.span
                  animate={{ scale: isActive ? 1 : 0.85, opacity: isActive ? 1 : 0.6 }}
                  className="text-[9px] font-number bg-slate-100 rounded-full px-1.5 py-0.5 leading-none"
                >
                  {n}
                </motion.span>
              )}
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
      {...rowStagger(index)}
      id={`asset-${asset.id}`}
      className="group flex items-center gap-4 py-3 px-3 -mx-1 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-cream-50/60 hover:to-transparent"
    >
      <motion.div
        whileHover={{ scale: 1.08, rotate: -3 }}
        transition={spring}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-shadow duration-300 group-hover:shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #FFFDF7 0%, #FFF7E0 100%)',
          boxShadow: '0 2px 8px rgba(180,150,80,0.08)',
        }}
      >
        {ASSET_ICON[asset.icon] ?? '📦'}
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate transition-colors group-hover:text-slate-900">{asset.name}</p>
        <p className="text-[11px] text-slate-400 truncate transition-colors group-hover:text-slate-500">{asset.description}</p>
      </div>
      <motion.span
        className="font-number text-sm font-bold text-slate-800 shrink-0 tabular-nums"
        whileHover={{ scale: 1.06 }}
        transition={spring}
      >
        ¥{formatCurrency(asset.value)}
      </motion.span>
    </motion.div>
  );
}

// ─── 分类占比条（可点击跳转） ────────────────────────────

function CategoryBar({ category, total, maxTotal, onClick, isActive }: { category: AssetCategory; total: number; maxTotal: number; onClick: () => void; isActive: boolean }) {
  const meta = CAT[category];
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

  return (
    <button
      type="button"
      id={`summary-${category}`}
      onClick={onClick}
      className={`w-full group flex items-center gap-3 py-2.5 px-3 -mx-1 rounded-xl transition-all duration-300 hover:bg-white/50 ${isActive ? 'bg-cream-50/80' : ''}`}
    >
      <span className="text-base w-7 text-center transition-transform duration-300 group-hover:scale-115">{meta.emoji}</span>
      <span className="text-xs text-slate-600 w-14 shrink-0 font-bold">{meta.short}</span>
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: meta.color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
      <motion.span
        className={`text-xs font-number w-20 text-right tabular-nums shrink-0 ${total > 0 ? 'text-slate-700 font-bold' : 'text-slate-300'}`}
        whileHover={{ scale: 1.04 }}
        transition={spring}
      >
        {total > 0 ? `¥${formatCurrency(total)}` : '—'}
      </motion.span>
    </button>
  );
}

// ─── 主组件 ─────────────────────────────────────────────

export function PropertyDetailOverlay() {
  const { state, updateOverlayTitle } = useGame();
  const cash = state.finance.cash;
  const assets = useMemo(() => state.finance.assets ?? [], [state.finance.assets]);

  const initCat: AssetCategory = (state.detailView?.payload?.category as AssetCategory) ?? 'liquid';
  const [category, setCategory] = useState<AssetCategory>(initCat);

  useEffect(() => {
    updateOverlayTitle(`財産詳細 · ${CAT[category].label}`);
  }, [category, updateOverlayTitle]);

  const catAssets = useMemo(() => assets.filter((a) => a.category === category), [assets, category]);
  const catTotal = useMemo(() => catAssets.reduce((s, a) => s + a.value, 0), [catAssets]);
  const assetsTotal = useMemo(() => assets.reduce((s, a) => s + a.value, 0), [assets]);
  const netWorth = cash + assetsTotal;

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const k of TABS) counts[k] = assets.filter((a) => a.category === k).length;
    return counts as Record<AssetCategory, number>;
  }, [assets]);

  const catTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const k of TABS) totals[k] = assets.filter((a) => a.category === k).reduce((s, a) => s + a.value, 0);
    return totals as Record<AssetCategory, number>;
  }, [assets]);

  const maxCatTotal = useMemo(() => Math.max(...Object.values(catTotals), 1), [catTotals]);

  const switchCategory = useCallback((cat: AssetCategory) => setCategory(cat), []);

  const meta = CAT[category];

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── 净值 Hero ── */}
      <NetWorthHero netWorth={netWorth} cash={cash} assetsTotal={assetsTotal} />

      {/* ── 分类标签 ── */}
      <CategoryTabs active={category} onChange={switchCategory} counts={catCounts} />

      {/* ── 当前分类详情 ── */}
      <motion.section
        key={category}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        aria-label={`${meta.label}の詳細`}
      >
        <GlassCard variant="cream" className="overflow-hidden">
          {/* 头部 */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{
              background: `linear-gradient(135deg, ${meta.bg} 0%, rgba(255,255,255,0) 100%)`,
              borderBottom: `1px solid ${meta.ring}`,
            }}
          >
            <div>
              <h2 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2">
                <motion.span
                  key={`hdr-${category}`}
                  animate={{ rotate: [0, -6, 6, 0] }}
                  transition={{ duration: 0.5, delay: 0.05 }}
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
                key={`val-${catTotal}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-number text-xl font-bold text-slate-800 tabular-nums"
              >
                ¥{formatCurrency(catTotal)}
              </motion.p>
              <span className="text-[10px] text-slate-400">{catAssets.length} 件の資産</span>
            </div>
          </div>

          {/* 资产列表 / 空分类 */}
          <div className="px-2 py-3">
            {catAssets.length === 0 ? (
              <div className="py-14 text-center">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-6xl opacity-25 inline-block select-none"
                >
                  {meta.emoji}
                </motion.div>
                <p className="text-sm text-slate-500 mt-4 font-medium">
                  この分類に資産はまだありません
                </p>
                <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed max-w-xs mx-auto">
                  ゲームの進行に伴い、{meta.label}は自然に蓄積されていきます
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50/80">
                {catAssets.map((asset, i) => (
                  <AssetRow key={asset.id} asset={asset} index={i} />
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </motion.section>

      {/* ── 各分類の分布 ── */}
      <GlassCard variant="default" className="p-5">
        <h3 className="font-heading text-sm font-bold text-slate-700 mb-4 flex items-center gap-2.5">
          <span className="w-1 h-4 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
          資産分布
        </h3>
        <div className="space-y-0.5">
          {TABS.map((key) => (
            <CategoryBar
              key={key}
              category={key}
              total={catTotals[key]}
              maxTotal={maxCatTotal}
              onClick={() => setCategory(key)}
              isActive={category === key}
            />
          ))}
        </div>
      </GlassCard>

    </div>
  );
}
