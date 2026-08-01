import { useState, useCallback } from 'react';
import { useGame } from '@/hooks/useGameState';
import {
  Wifi, Bluetooth, Radio, Bell, Globe, Info,
  Accessibility, ImageIcon, ChevronRight, Palette,
  ArrowLeft, Trash2, Check,
} from 'lucide-react';

/* ─────────── 辅助组件 ─────────── */

function Toggle({ value, onChange, color }: { value: boolean; onChange?: (v: boolean) => void; color: string }) {
  return (
    <button type="button" onClick={() => onChange?.(!value)}
      className="relative w-[42px] h-[26px] rounded-full transition-colors duration-200 shrink-0"
      style={{ backgroundColor: value ? color : '#d1d5db' }}>
      <div className={`absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-[19px]' : 'translate-x-[3px]'}`} />
    </button>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-1 pt-5 pb-1.5 first:pt-3">{children}</h4>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-white overflow-hidden">{children}</div>;
}

function ArrowRow({ icon: Icon, label, detail, onClick }: { icon?: React.ComponentType<{ className?: string }>; label: string; detail: string; onClick?: () => void }) {
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
  return onClick ? <button type="button" onClick={onClick} className="w-full text-left">{content}</button> : content;
}

function ToggleRow({ icon: Icon, label, value, onChange, hint, color }: { icon?: React.ComponentType<{ className?: string }>; label: string; value: boolean; onChange?: (v: boolean) => void; hint?: string; color: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon className="w-[18px] h-[18px] text-slate-500 shrink-0" />}
        <div className="min-w-0"><span className="text-[13px] text-slate-800">{label}</span>{hint && <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>}</div>
      </div>
      <Toggle value={value} onChange={onChange} color={color} />
    </div>
  );
}

function SliderRow({ label, value, onChange, suffix }: { label: string; value: number; onChange?: (v: number) => void; suffix?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-[13px] text-slate-800">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        {suffix && <span className="text-[12px] text-slate-400 w-10 text-right">{suffix}</span>}
        <input type="range" min="0" max="100" value={value} onChange={(e) => onChange?.(Number(e.target.value))} className="w-20 h-1.5 rounded-full appearance-none bg-slate-200 accent-slate-600" />
      </div>
    </div>
  );
}

function Divider() { return <div className="h-px bg-slate-100 mx-4" />; }

/* ─────────── 色系球（RGB 调整器） ─────────── */

function ColorSphere({ label, color, onChange }: { label: string; color: string; onChange: (hex: string) => void }) {
  const parseHex = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return { r, g, b };
  };
  const { r, g, b } = parseHex(color);

  const update = (nr: number, ng: number, nb: number) => {
    const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
    onChange(`#${toHex(nr)}${toHex(ng)}${toHex(nb)}`);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: color }} />
        <div>
          <span className="text-[13px] font-semibold text-slate-800">{label}</span>
          <span className="text-[11px] text-slate-400 ml-2">{color.toUpperCase()}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {[{ key: 'r', val: r, label: 'R' }, { key: 'g', val: g, label: 'G' }, { key: 'b', val: b, label: 'B' }].map((ch) => (
          <div key={ch.key} className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 w-3">{ch.label}</span>
            <input type="range" min="0" max="255" value={ch.val}
              onChange={(e) => update(ch.key === 'r' ? +e.target.value : r, ch.key === 'g' ? +e.target.value : g, ch.key === 'b' ? +e.target.value : b)}
              className="flex-1 h-1.5 rounded-full appearance-none"
              style={{ accentColor: color }} />
            <input type="number" min="0" max="255" value={ch.val}
              onChange={(e) => update(ch.key === 'r' ? +e.target.value : r, ch.key === 'g' ? +e.target.value : g, ch.key === 'b' ? +e.target.value : b)}
              className="w-10 text-[10px] text-center border border-slate-200 rounded px-1 py-0.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────── 壁纸管理子页面 ─────────── */

function WallpaperPicker({
  onBack,
  accentColor,
}: {
  onBack: () => void;
  accentColor: string;
}) {
  const { state, addWallpaper, setActiveWallpaper, removeWallpapers } = useGame();
  const { wallpapers, activeWallpaperIndex } = state;
  const [deleteMode, setDeleteMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const currentWallpaper = activeWallpaperIndex >= 0 ? wallpapers[activeWallpaperIndex] : null;

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => addWallpaper(reader.result as string);
    reader.readAsDataURL(file);
  }, [addWallpaper]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const file = e.clipboardData?.files?.[0];
    if (file) { e.preventDefault(); processFile(file); }
  }, [processFile]);

  const toggleSelect = (i: number) => {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i); else next.add(i);
    setSelected(next);
  };

  const handleDelete = () => {
    if (selected.size === 0) return;
    removeWallpapers(Array.from(selected));
    setSelected(new Set());
    setDeleteMode(false);
  };

  return (
    <div className="min-h-full pb-6" style={{ backgroundColor: '#F2F0F5' }}>
      {/* 标题栏 */}
      <div className="flex items-center gap-3 px-1 pt-2 pb-4">
        <button type="button" onClick={onBack} className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10">
          <ArrowLeft className="w-4 h-4 text-slate-700" />
        </button>
        <span className="text-base font-bold text-slate-800 flex-1">壁纸</span>
        {wallpapers.length > 0 && (
          <button type="button" onClick={() => { setDeleteMode(!deleteMode); setSelected(new Set()); }}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg ${deleteMode ? 'bg-slate-200 text-slate-700' : 'bg-rose-50 text-rose-500'}`}>
            {deleteMode ? '取消' : '编辑'}
          </button>
        )}
      </div>

      {/* 拖放区域 */}
      <div
        className="w-full h-32 rounded-2xl border-2 border-dashed flex items-center justify-center mb-4 bg-cover bg-center transition-colors"
        style={{
          borderColor: accentColor + '55',
          backgroundImage: currentWallpaper ? `url(${currentWallpaper})` : undefined,
          backgroundColor: currentWallpaper ? undefined : '#ffffff',
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        tabIndex={0}
        onPaste={handlePaste}
      >
        {!currentWallpaper && (
          <div className="text-center">
            <ImageIcon className="w-6 h-6 text-slate-300 mx-auto mb-1" />
            <span className="text-[11px] text-slate-400">拖放图片到此处 或 Ctrl+V 粘贴</span>
          </div>
        )}
      </div>

      {/* 方案库 */}
      {wallpapers.length > 0 && (
        <>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-1 mb-2">
            方案库 ({wallpapers.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {/* 默认 */}
            <button
              type="button"
              onClick={() => deleteMode ? toggleSelect(-1) : setActiveWallpaper(-1)}
              className={`relative aspect-[9/19] rounded-xl border-2 bg-[#FAF6F1] ${activeWallpaperIndex === -1 ? 'border-blue-400' : 'border-slate-200'}`}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400">默认</span>
              {activeWallpaperIndex === -1 && <Check className="absolute top-1 right-1 w-3.5 h-3.5 text-blue-400" />}
            </button>
            {wallpapers.map((wp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => deleteMode ? toggleSelect(i) : setActiveWallpaper(i)}
                className={`relative aspect-[9/19] rounded-xl border-2 bg-cover bg-center ${activeWallpaperIndex === i ? 'border-blue-400' : 'border-slate-200'}`}
                style={{ backgroundImage: `url(${wp})` }}
              >
                {deleteMode && (
                  <div className={`absolute top-1.5 right-1.5 w-4 h-4 rounded border-2 flex items-center justify-center ${selected.has(i) ? 'bg-rose-500 border-rose-500' : 'border-white bg-black/30'}`}>
                    {selected.has(i) && <Check className="w-3 h-3 text-white" />}
                  </div>
                )}
                {!deleteMode && activeWallpaperIndex === i && <Check className="absolute top-1 right-1 w-3.5 h-3.5 text-blue-400" />}
              </button>
            ))}
          </div>
        </>
      )}

      {/* 删除按钮 */}
      {deleteMode && selected.size > 0 && (
        <button type="button" onClick={handleDelete}
          className="mt-3 w-full py-2 rounded-xl bg-rose-500 text-white text-[13px] font-semibold flex items-center justify-center gap-2">
          <Trash2 className="w-4 h-4" /> 删除 ({selected.size})
        </button>
      )}
    </div>
  );
}

/* ─────────── 主设置页面 ─────────── */

export function PhoneSettingsApp() {
  const { state, toggleAccessibilityMode, setPrimaryColor, setAccentColor } = useGame();
  const { accessibilityMode, wallpapers, activeWallpaperIndex, primaryColor: pc, accentColor: ac } = state;

  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [mobileData, setMobileData] = useState(true);
  const [brightness, setBrightness] = useState(70);
  const [mediaVolume, setMediaVolume] = useState(50);
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [showTheme, setShowTheme] = useState(false);

  const currentWallpaper = activeWallpaperIndex >= 0 ? wallpapers[activeWallpaperIndex] : null;
  const wallpaperDetail = currentWallpaper ? `方案 ${activeWallpaperIndex + 1}` : '默认';

  // 主题色系调整子页面
  if (showTheme) {
    return (
      <div className="min-h-full pb-6" style={{ backgroundColor: '#F2F0F5' }}>
        <div className="flex items-center gap-3 px-1 pt-2 pb-4">
          <button type="button" onClick={() => setShowTheme(false)} className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10">
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </button>
          <span className="text-base font-bold text-slate-800">配色方案</span>
        </div>
        <div className="rounded-2xl bg-white p-4 space-y-6">
          <ColorSphere label="主色调" color={pc} onChange={setPrimaryColor} />
          <div className="h-px bg-slate-100" />
          <ColorSphere label="强调色" color={ac} onChange={setAccentColor} />
        </div>
      </div>
    );
  }

  // 壁纸管理子页面
  if (showWallpaper) {
    return <WallpaperPicker onBack={() => setShowWallpaper(false)} accentColor={ac} />;
  }

  return (
    <div className="min-h-full pb-6" style={{ backgroundColor: '#F2F0F5' }}>
      <SectionLabel>外观</SectionLabel>
      <Card>
        <ArrowRow icon={ImageIcon} label="壁纸" detail={wallpaperDetail} onClick={() => setShowWallpaper(true)} />
        <Divider />
        <ArrowRow icon={Palette} label="配色方案" detail={`主色 ${pc}  强调 ${ac}`} onClick={() => setShowTheme(true)} />
      </Card>

      <SectionLabel>网络与通信</SectionLabel>
      <Card>
        <ToggleRow icon={Wifi} label="Wi-Fi" value={wifi} onChange={setWifi} color={ac} />
        <Divider />
        <ToggleRow icon={Bluetooth} label="蓝牙" value={bluetooth} onChange={setBluetooth} color={ac} />
        <Divider />
        <ToggleRow icon={Radio} label="移动数据" value={mobileData} onChange={setMobileData} color={ac} />
      </Card>

      <SectionLabel>显示与声音</SectionLabel>
      <Card>
        <SliderRow label="亮度" value={brightness} onChange={setBrightness} suffix={`${brightness}%`} />
        <Divider />
        <SliderRow label="媒体音量" value={mediaVolume} onChange={setMediaVolume} suffix={`${mediaVolume}%`} />
        <Divider />
        <ArrowRow icon={Bell} label="铃声" detail="开场曲" />
      </Card>

      <SectionLabel>辅助功能</SectionLabel>
      <Card>
        <ToggleRow icon={Accessibility} label="当前手机浏览模式" value={accessibilityMode} onChange={toggleAccessibilityMode}
          hint={accessibilityMode ? '无障碍模式：APP名称为中文' : '正常模式：APP名称为原文'} color={ac} />
      </Card>

      <SectionLabel>系统</SectionLabel>
      <Card>
        <ArrowRow icon={Globe} label="语言" detail="中文（简体）" />
        <Divider />
        <ArrowRow label="日期与时间" detail="自动设置" />
        <Divider />
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Info className="w-[18px] h-[18px] text-slate-500 shrink-0" />
            <div><span className="text-[13px] text-slate-800">关于本机</span><p className="text-[10px] text-slate-400 mt-0.5">综漫手机 · LifeSimOS 1.0</p></div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        </div>
      </Card>
    </div>
  );
}
