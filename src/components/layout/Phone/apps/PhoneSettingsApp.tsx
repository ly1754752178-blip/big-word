import { useState, useCallback } from 'react';
import { useGame } from '@/hooks/useGameState';
import type { PhoneTheme } from '@/types';
import {
  Wifi,
  Bluetooth,
  Radio,
  Bell,
  Globe,
  Info,
  Accessibility,
  ImageIcon,
  ChevronRight,
  Palette,
  Check,
  ArrowLeft,
} from 'lucide-react';

/* ─────────── 主题定义（导出供外部使用） ─────────── */

export interface ThemeConfig {
  name: string;
  desc: string;
  statusBarBg: string;
  statusBarText: string;
  accent: string;
  accentText: string;
  cardBg: string;
  pageBg: string;
  toggleOn: string;
  sectionText: string;
}

export const THEMES: Record<PhoneTheme, ThemeConfig> = {
  vinyl: {
    name: '黑胶会员',
    desc: '复古黑胶唱片的温暖质感',
    statusBarBg: '#1a1814',
    statusBarText: '#f5f0e8',
    accent: '#D4A853',
    accentText: '#ffffff',
    cardBg: '#faf8f3',
    pageBg: '#f0ede5',
    toggleOn: '#C49B3F',
    sectionText: '#8B7355',
  },
  modern: {
    name: '现代生活',
    desc: '清新简洁的当代风格',
    statusBarBg: 'transparent',
    statusBarText: '#1e293b',
    accent: '#3B82F6',
    accentText: '#ffffff',
    cardBg: '#ffffff',
    pageBg: '#F2F0F5',
    toggleOn: '#10B981',
    sectionText: '#94a3b8',
  },
  school: {
    name: '校园恋爱',
    desc: '樱花树下的青春悸动',
    statusBarBg: '#fef1f5',
    statusBarText: '#9D174D',
    accent: '#EC4899',
    accentText: '#ffffff',
    cardBg: '#fff5f7',
    pageBg: '#fce7f0',
    toggleOn: '#F472B6',
    sectionText: '#BE185D',
  },
  starry: {
    name: '星空黑夜',
    desc: '深邃夜空中的静谧星光',
    statusBarBg: '#0f172a',
    statusBarText: '#e2e8f0',
    accent: '#6366F1',
    accentText: '#ffffff',
    cardBg: '#1e293b',
    pageBg: '#0f172a',
    toggleOn: '#818CF8',
    sectionText: '#64748b',
  },
};

/* ─────────── 微型组件 ─────────── */

function Toggle({ value, onChange, accentColor }: { value: boolean; onChange?: (v: boolean) => void; accentColor: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!value)}
      className="relative w-[42px] h-[26px] rounded-full transition-colors duration-200 shrink-0"
      style={{ backgroundColor: value ? accentColor : '#d1d5db' }}
    >
      <div
        className={`absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white shadow transition-transform duration-200 ${
          value ? 'translate-x-[19px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  );
}

function SectionLabel({ children, color }: { children: string; color: string }) {
  return (
    <h4 className="text-[11px] font-semibold uppercase tracking-wide px-1 pt-5 pb-1.5 first:pt-3" style={{ color }}>
      {children}
    </h4>
  );
}

function Card({ children, bg }: { children: React.ReactNode; bg: string }) {
  return <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: bg }}>{children}</div>;
}

function ArrowRow({
  icon: Icon,
  label,
  detail,
  onClick,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
  onClick?: () => void;
}) {
  const content = (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon className="w-[18px] h-[18px] text-slate-500 shrink-0" />}
        <span className="text-[13px] text-slate-800 truncate">{label}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[12px] text-slate-400">{detail}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
      </div>
    </div>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }
  return content;
}

function ToggleRow({
  icon: Icon,
  label,
  value,
  onChange,
  hint,
  toggleColor,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: boolean;
  onChange?: (v: boolean) => void;
  hint?: string;
  toggleColor: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon className="w-[18px] h-[18px] text-slate-500 shrink-0" />}
        <div className="min-w-0">
          <span className="text-[13px] text-slate-800">{label}</span>
          {hint && <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>}
        </div>
      </div>
      <Toggle value={value} onChange={onChange} accentColor={toggleColor} />
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange?: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-[13px] text-slate-800">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        {suffix && <span className="text-[12px] text-slate-400 w-10 text-right">{suffix}</span>}
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="w-20 h-1.5 rounded-full appearance-none bg-slate-200 accent-slate-600"
        />
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-slate-100 mx-4" />;
}

/* ─────────── 主题选择子页面 ─────────── */

function ThemePicker({
  current,
  onSelect,
  onBack,
  theme,
}: {
  current: PhoneTheme;
  onSelect: (t: PhoneTheme) => void;
  onBack: () => void;
  theme: ThemeConfig;
}) {
  return (
    <div className="min-h-full pb-6" style={{ backgroundColor: theme.pageBg }}>
      {/* 标题栏 */}
      <div className="flex items-center gap-3 px-1 pt-2 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700" />
        </button>
        <span className="text-base font-bold text-slate-800">选择主题</span>
      </div>

      <div className="space-y-3">
        {(Object.entries(THEMES) as [PhoneTheme, ThemeConfig][]).map(([key, t]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
            style={{
              backgroundColor: t.cardBg,
              border: current === key ? `2px solid ${t.accent}` : '2px solid transparent',
            }}
          >
            {/* 色块预览 */}
            <div className="flex gap-1.5 shrink-0">
              <div className="w-7 h-7 rounded-full border border-white/20" style={{ backgroundColor: t.accent }} />
              <div className="w-7 h-7 rounded-full border border-slate-200" style={{ backgroundColor: t.pageBg }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-slate-800">{t.name}</span>
                {current === key && (
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: t.accent }}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────── 主设置列表 ─────────── */

export function PhoneSettingsApp() {
  const { state, toggleAccessibilityMode, setWallpaper, setPhoneTheme } = useGame();
  const { accessibilityMode, wallpaper, phoneTheme } = state;
  const theme = THEMES[phoneTheme];

  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [mobileData, setMobileData] = useState(true);
  const [brightness, setBrightness] = useState(70);
  const [mediaVolume, setMediaVolume] = useState(50);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setWallpaper(reader.result as string);
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [setWallpaper]
  );

  // 主题选择子页面
  if (showThemePicker) {
    return (
      <ThemePicker
        current={phoneTheme}
        onSelect={(t) => { setPhoneTheme(t); setShowThemePicker(false); }}
        onBack={() => setShowThemePicker(false)}
        theme={theme}
      />
    );
  }

  return (
    <div className="min-h-full pb-6" style={{ backgroundColor: theme.pageBg }}>
      {/* ═══ 外观 ═══ */}
      <SectionLabel color={theme.sectionText}>外观</SectionLabel>
      <Card bg={theme.cardBg}>
        {/* 壁纸 */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <ImageIcon className="w-[18px] h-[18px] text-slate-500 shrink-0" />
            <span className="text-[13px] text-slate-800">壁纸</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {wallpaper ? (
              <div
                className="w-8 h-8 rounded-lg bg-cover bg-center border border-slate-200"
                style={{ backgroundImage: `url(${wallpaper})` }}
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#FAF6F1] border border-slate-200" />
            )}
            {/* 用 label 包裹触发文件选择，比 ref+js 更可靠 */}
            <label
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-white cursor-pointer transition-colors hover:opacity-90"
              style={{ backgroundColor: theme.accent }}
            >
              导入
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {wallpaper && (
              <button
                type="button"
                onClick={() => setWallpaper(null)}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
              >
                清除
              </button>
            )}
          </div>
        </div>
        <Divider />
        {/* 主题 —— 点击进入子页面选择 */}
        <ArrowRow
          icon={Palette}
          label="主题"
          detail={theme.name}
          onClick={() => setShowThemePicker(true)}
        />
      </Card>

      {/* ═══ 网络与通信 ═══ */}
      <SectionLabel color={theme.sectionText}>网络与通信</SectionLabel>
      <Card bg={theme.cardBg}>
        <ToggleRow icon={Wifi} label="Wi-Fi" value={wifi} onChange={setWifi} toggleColor={theme.toggleOn} />
        <Divider />
        <ToggleRow icon={Bluetooth} label="蓝牙" value={bluetooth} onChange={setBluetooth} toggleColor={theme.toggleOn} />
        <Divider />
        <ToggleRow icon={Radio} label="移动数据" value={mobileData} onChange={setMobileData} toggleColor={theme.toggleOn} />
      </Card>

      {/* ═══ 显示与声音 ═══ */}
      <SectionLabel color={theme.sectionText}>显示与声音</SectionLabel>
      <Card bg={theme.cardBg}>
        <SliderRow label="亮度" value={brightness} onChange={setBrightness} suffix={`${brightness}%`} />
        <Divider />
        <SliderRow label="媒体音量" value={mediaVolume} onChange={setMediaVolume} suffix={`${mediaVolume}%`} />
        <Divider />
        <ArrowRow icon={Bell} label="铃声" detail="开场曲" />
      </Card>

      {/* ═══ 辅助功能 ═══ */}
      <SectionLabel color={theme.sectionText}>辅助功能</SectionLabel>
      <Card bg={theme.cardBg}>
        <ToggleRow
          icon={Accessibility}
          label="当前手机浏览模式"
          value={accessibilityMode}
          onChange={toggleAccessibilityMode}
          hint={accessibilityMode ? '无障碍模式：APP名称为中文' : '正常模式：APP名称为原文'}
          toggleColor={theme.toggleOn}
        />
      </Card>

      {/* ═══ 系统 ═══ */}
      <SectionLabel color={theme.sectionText}>系统</SectionLabel>
      <Card bg={theme.cardBg}>
        <ArrowRow icon={Globe} label="语言" detail="中文（简体）" />
        <Divider />
        <ArrowRow label="日期与时间" detail="自动设置" />
        <Divider />
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Info className="w-[18px] h-[18px] text-slate-500 shrink-0" />
            <div>
              <span className="text-[13px] text-slate-800">关于本机</span>
              <p className="text-[10px] text-slate-400 mt-0.5">综漫手机 · LifeSimOS 1.0</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        </div>
      </Card>
    </div>
  );
}
