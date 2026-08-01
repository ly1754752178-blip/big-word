import { useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { ChevronRight, Wifi, Bluetooth, Moon, Bell, Globe, Info, Accessibility } from 'lucide-react';

/** 纯展示开关组件 */
function ToggleRow({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-slate-500" />}
        <span className="text-sm text-slate-800">{label}</span>
      </div>
      <button
        type="button"
        onClick={() => onChange?.(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          value ? 'bg-emerald-400' : 'bg-slate-300'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            value ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

/** 纯展示行（无开关，仅有值和箭头） */
function InfoRow({
  icon: Icon,
  label,
  detail,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-slate-500" />}
        <span className="text-sm text-slate-800">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-400">{detail}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
      </div>
    </div>
  );
}

/** 分隔线 */
function SectionDivider() {
  return <div className="h-px bg-slate-100" />;
}

/** 区块标题 */
function SectionHeader({ title }: { title: string }) {
  return (
    <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-1 pt-4 pb-1">
      {title}
    </h4>
  );
}

export function PhoneSettingsApp() {
  const { state, toggleAccessibilityMode } = useGame();
  const { accessibilityMode } = state;

  // 纯展示用的本地状态
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [mobileData, setMobileData] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [brightness, setBrightness] = useState(70);
  const [fontSize] = useState('标准');

  return (
    <div className="space-y-0 pb-8">
      {/* ── 网络与连接 ── */}
      <SectionHeader title="网络与连接" />
      <div className="rounded-2xl bg-white/90 border border-slate-100 overflow-hidden">
        <ToggleRow icon={Wifi} label="Wi-Fi" value={wifi} onChange={setWifi} />
        <SectionDivider />
        <ToggleRow icon={Bluetooth} label="蓝牙" value={bluetooth} onChange={setBluetooth} />
        <SectionDivider />
        <ToggleRow label="移动数据" value={mobileData} onChange={setMobileData} />
      </div>

      {/* ── 显示与亮度 ── */}
      <SectionHeader title="显示与亮度" />
      <div className="rounded-2xl bg-white/90 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between py-3 px-1">
          <span className="text-sm text-slate-800">亮度</span>
          <div className="flex items-center gap-2 w-28">
            <input
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-slate-200 accent-slate-600"
            />
          </div>
        </div>
        <SectionDivider />
        <ToggleRow icon={Moon} label="深色模式" value={darkMode} onChange={setDarkMode} />
      </div>

      {/* ── 声音与振动 ── */}
      <SectionHeader title="声音与振动" />
      <div className="rounded-2xl bg-white/90 border border-slate-100 overflow-hidden">
        <InfoRow label="铃声" detail="开场曲" />
        <SectionDivider />
        <div className="flex items-center justify-between py-3 px-1">
          <span className="text-sm text-slate-800">媒体音量</span>
          <div className="flex items-center gap-2 w-28">
            <input
              type="range"
              min="0"
              max="100"
              value={50}
              readOnly
              className="w-full h-1.5 rounded-full appearance-none bg-slate-200 accent-slate-600"
            />
          </div>
        </div>
      </div>

      {/* ── 通知 ── */}
      <SectionHeader title="通知" />
      <div className="rounded-2xl bg-white/90 border border-slate-100 overflow-hidden">
        <ToggleRow icon={Bell} label="允许通知" value={notifications} onChange={setNotifications} />
      </div>

      {/* ── 通用 ── */}
      <SectionHeader title="通用" />
      <div className="rounded-2xl bg-white/90 border border-slate-100 overflow-hidden">
        <InfoRow icon={Globe} label="语言" detail="中文（简体）" />
        <SectionDivider />
        <InfoRow label="日期与时间" detail="自动设置" />
      </div>

      {/* ── 辅助功能 ── */}
      <SectionHeader title="辅助功能" />
      <div className="rounded-2xl bg-white/90 border border-slate-100 overflow-hidden">
        {/* 无障碍模式 —— 唯一有实际功能的开关 */}
        <div className="flex items-center justify-between py-3 px-1">
          <div className="flex items-center gap-3">
            <Accessibility className="w-4 h-4 text-blue-500" />
            <div>
              <span className="text-sm text-slate-800">
                当前手机浏览模式
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {accessibilityMode ? '无障碍模式：APP名称为中文' : '正常模式：APP名称为原文'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleAccessibilityMode}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              accessibilityMode ? 'bg-blue-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                accessibilityMode ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>
        <SectionDivider />
        <InfoRow label="字体大小" detail={fontSize} />
      </div>

      {/* ── 关于本机 ── */}
      <SectionHeader title="关于本机" />
      <div className="rounded-2xl bg-white/90 border border-slate-100 overflow-hidden">
        <InfoRow icon={Info} label="设备名称" detail="综漫手机" />
        <SectionDivider />
        <InfoRow label="系统版本" detail="LifeSimOS 1.0" />
      </div>
    </div>
  );
}
