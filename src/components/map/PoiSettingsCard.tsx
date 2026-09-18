import { useEffect, useState } from 'react';
import { Settings, X } from 'lucide-react';
import type { PoiSettings, ZoneSettings } from '@/lib/poiSelection';

interface PoiSettingsCardProps {
  settings: PoiSettings;
  onChange: (s: PoiSettings) => void;
}

type TabKey = keyof PoiSettings; // 'icon' | 'label'

const SPACING_PRESETS = [100, 200, 300, 400, 500];
const EXTRA_PRESETS = [500, 1000, 2000, 3000];
const RADIUS_PRESETS = [500, 1000, 1500, 2000, 3000];

const TABS: { key: TabKey; title: string }[] = [
  { key: 'icon', title: '地点图标设置' },
  { key: 'label', title: '地名设置' },
];

// 各 Tab 的字段文案
const TAB_COPY: Record<TabKey, { radius: string; baseSpacing: string; extraSpacing: string; hideOutside: string }> = {
  icon: {
    radius: '显示半径(以你为中心)',
    baseSpacing: '图标间距(低于该间距则只显示一个图标)',
    extraSpacing: '半径之外的图标显示(数字越大越稀疏)',
    hideOutside: '半径之外完全隐藏(超出显示半径则不显示地点图标)',
  },
  label: {
    radius: '显示半径(以你为中心)',
    baseSpacing: '名称间距(低于该间距则只显示一个名称)',
    extraSpacing: '半径之外的名称显示(数字越大越稀疏)',
    hideOutside: '半径之外完全隐藏(超出显示半径则不显示地点名称)',
  },
};

function formatMeters(v: number): string {
  return v >= 1000 ? `${v / 1000}km` : `${v}m`;
}

function Chips({ values, current, onPick }: { values: number[]; current: number; onPick: (v: number) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
            current === v ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {formatMeters(v)}
        </button>
      ))}
    </div>
  );
}

function NumberField({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => {
    setDraft(String(value));
  }, [value]);
  const commit = () => {
    const n = Number(draft);
    if (Number.isFinite(n) && n > 0) onCommit(Math.round(n));
    else setDraft(String(value));
  };
  return (
    <label className="flex items-center gap-1 text-[11px] text-slate-400">
      <input
        className="w-16 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-slate-700 text-[11px] focus:outline-none focus:border-sky-400"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
      />
      <span className="shrink-0">米</span>
    </label>
  );
}

function ZoneControls({ zone, copy, onPatch }: { zone: ZoneSettings; copy: (typeof TAB_COPY)['icon']; onPatch: (p: Partial<ZoneSettings>) => void }) {
  return (
    <>
      {/* 显示半径 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-600">{copy.radius}</span>
          <NumberField value={zone.radius} onCommit={(v) => onPatch({ radius: v })} />
        </div>
        <Chips values={RADIUS_PRESETS} current={zone.radius} onPick={(v) => onPatch({ radius: v })} />
      </div>

      {/* 圈内间距 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-600">{copy.baseSpacing}</span>
          <NumberField value={zone.baseSpacing} onCommit={(v) => onPatch({ baseSpacing: v })} />
        </div>
        <Chips values={SPACING_PRESETS} current={zone.baseSpacing} onPick={(v) => onPatch({ baseSpacing: v })} />
      </div>

      {/* 圈外额外间距 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-600">{copy.extraSpacing}</span>
          <NumberField value={zone.extraSpacing} onCommit={(v) => onPatch({ extraSpacing: v })} />
        </div>
        <Chips values={EXTRA_PRESETS} current={zone.extraSpacing} onPick={(v) => onPatch({ extraSpacing: v })} />
      </div>

      {/* 圈外完全隐藏 */}
      <button
        type="button"
        onClick={() => onPatch({ hideOutside: !zone.hideOutside })}
        className="flex items-center gap-2 w-full rounded-xl bg-slate-50 hover:bg-slate-100 px-3 py-2 transition-colors"
      >
        <span
          className={`relative inline-flex h-4 w-8 shrink-0 rounded-full transition-colors ${
            zone.hideOutside ? 'bg-coral-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
              zone.hideOutside ? 'translate-x-[18px]' : 'translate-x-0.5'
            }`}
          />
        </span>
        <span className="text-xs font-semibold text-slate-600">{copy.hideOutside}</span>
      </button>
    </>
  );
}

export function PoiSettingsCard({ settings, onChange }: PoiSettingsCardProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>('icon');

  const zone = settings[tab];
  const copy = TAB_COPY[tab];
  const onPatch = (p: Partial<ZoneSettings>) => onChange({ ...settings, [tab]: { ...zone, ...p } });

  return (
    <div className="absolute top-2 right-2 z-20 flex flex-col items-end">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="地图标注设置"
        className={`w-11 h-11 rounded-full border shadow-soft flex items-center justify-center transition-colors ${
          open ? 'bg-sky-500 text-white border-sky-500' : 'bg-white/95 text-slate-600 border-slate-200 hover:bg-white'
        }`}
      >
        <Settings className="w-5 h-5" />
      </button>

      {open && (
        <div className="mt-2 w-80 rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200 shadow-soft p-4 text-slate-700">
          {/* 顶部 Tab 切换 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex rounded-lg bg-slate-100 p-0.5">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                    tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.title}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="关闭"
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <ZoneControls zone={zone} copy={copy} onPatch={onPatch} />

          <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
            以你为中心，显示半径内按「{tab === 'icon' ? '图标' : '名称'}间距」显示，半径之外自动更稀疏。勾选「完全隐藏」后，半径之外不再显示对应元素。
          </p>
        </div>
      )}
    </div>
  );
}
