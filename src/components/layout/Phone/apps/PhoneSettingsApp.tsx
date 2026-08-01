import { useState, useRef, useCallback } from 'react';
import { useGame } from '@/hooks/useGameState';
import {
  Wifi,
  Bluetooth,
  Radio,
  Bell,
  Globe,
  Info,
  Accessibility,
  Image,
  ChevronRight,
  Palette,
  Volume2,
} from 'lucide-react';

/* ─────────── 微型组件 ─────────── */

/** iOS 风格开关 */
function Toggle({ value, onChange }: { value: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!value)}
      className={`relative w-[42px] h-[26px] rounded-full transition-colors duration-200 shrink-0 ${
        value ? 'bg-emerald-400' : 'bg-slate-300'
      }`}
    >
      <div
        className={`absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white shadow transition-transform duration-200 ${
          value ? 'translate-x-[19px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  );
}

/** 分区标题 */
function SectionLabel({ children }: { children: string }) {
  return (
    <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-1 pt-5 pb-1.5 first:pt-3">
      {children}
    </h4>
  );
}

/** 白色圆角卡片容器 */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white overflow-hidden">{children}</div>
  );
}

/** 分隔行（箭头尾缀） */
function ArrowRow({
  icon: Icon,
  label,
  detail,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
}) {
  return (
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
}

/** 开关行 */
function ToggleRow({
  icon: Icon,
  label,
  value,
  onChange,
  hint,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: boolean;
  onChange?: (v: boolean) => void;
  hint?: string;
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
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

/** 滑块行 */
function SliderRow({
  icon: Icon,
  label,
  value,
  onChange,
  suffix,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  onChange?: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon className="w-[18px] h-[18px] text-slate-500 shrink-0" />}
        <span className="text-[13px] text-slate-800">{label}</span>
      </div>
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

/** 行间分隔 */
function Divider() {
  return <div className="h-px bg-slate-100 mx-4" />;
}

/* ─────────── 主组件 ─────────── */

export function PhoneSettingsApp() {
  const { state, toggleAccessibilityMode, setWallpaper } = useGame();
  const { accessibilityMode, wallpaper } = state;

  // 展示用本地状态
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [mobileData, setMobileData] = useState(true);
  const [brightness, setBrightness] = useState(70);
  const [mediaVolume, setMediaVolume] = useState(50);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleWallpaperImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setWallpaper(reader.result as string);
      };
      reader.readAsDataURL(file);
      // 重置 input 以便重复选择同一文件
      e.target.value = '';
    },
    [setWallpaper]
  );

  const handleClearWallpaper = useCallback(() => {
    setWallpaper(null);
  }, [setWallpaper]);

  return (
    <div className="min-h-full pb-6" style={{ backgroundColor: '#F2F0F5' }}>
      {/* ═══ 外观 ═══ */}
      <SectionLabel>外观</SectionLabel>
      <Card>
        {/* 壁纸 */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Image className="w-[18px] h-[18px] text-slate-500 shrink-0" />
            <span className="text-[13px] text-slate-800">壁纸</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* 壁纸缩略图 */}
            {wallpaper ? (
              <div
                className="w-8 h-8 rounded-lg bg-cover bg-center border border-slate-200"
                style={{ backgroundImage: `url(${wallpaper})` }}
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#FAF6F1] border border-slate-200" />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={handleWallpaperImport}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              导入
            </button>
            {wallpaper && (
              <button
                type="button"
                onClick={handleClearWallpaper}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
              >
                清除
              </button>
            )}
          </div>
        </div>
        <Divider />
        {/* 主题 */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Palette className="w-[18px] h-[18px] text-slate-500 shrink-0" />
            <span className="text-[13px] text-slate-800">主题</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[12px] text-slate-400">浅色</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>
      </Card>

      {/* ═══ 网络与通信 ═══ */}
      <SectionLabel>网络与通信</SectionLabel>
      <Card>
        <ToggleRow icon={Wifi} label="Wi-Fi" value={wifi} onChange={setWifi} />
        <Divider />
        <ToggleRow icon={Bluetooth} label="蓝牙" value={bluetooth} onChange={setBluetooth} />
        <Divider />
        <ToggleRow icon={Radio} label="移动数据" value={mobileData} onChange={setMobileData} />
      </Card>

      {/* ═══ 显示与声音 ═══ */}
      <SectionLabel>显示与声音</SectionLabel>
      <Card>
        <SliderRow label="亮度" value={brightness} onChange={setBrightness} suffix={`${brightness}%`} />
        <Divider />
        <SliderRow icon={Volume2} label="媒体音量" value={mediaVolume} onChange={setMediaVolume} suffix={`${mediaVolume}%`} />
        <Divider />
        <ArrowRow icon={Bell} label="铃声" detail="开场曲" />
      </Card>

      {/* ═══ 辅助功能 ═══ */}
      <SectionLabel>辅助功能</SectionLabel>
      <Card>
        <ToggleRow
          icon={Accessibility}
          label="当前手机浏览模式"
          value={accessibilityMode}
          onChange={toggleAccessibilityMode}
          hint={accessibilityMode ? '无障碍模式：APP名称为中文' : '正常模式：APP名称为原文'}
        />
      </Card>

      {/* ═══ 系统 ═══ */}
      <SectionLabel>系统</SectionLabel>
      <Card>
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
