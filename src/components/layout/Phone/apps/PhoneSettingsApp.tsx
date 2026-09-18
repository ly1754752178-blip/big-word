import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { useGame } from '@/hooks/useGameState';
import {
  Wifi, Bluetooth, Radio, Bell, Globe, Info,
  Accessibility, ImageIcon, ChevronRight, Palette,
  ArrowLeft, Trash2, Check, Upload, Download, Archive, FolderUp, RefreshCw,
} from 'lucide-react';
import { PHONE_UI_STYLES, getPhoneUiStyle, type PhoneUiStyle } from '@/lib/phone-ui-styles';
import { bizhiUrl } from '@/lib/phone-bizhi';
import { exportWallpapersAsZip, parseWallpaperZip } from '@/lib/wallpaperStore';

/* ─────────── 风格上下文（供同文件内子组件读取当前 UI 风格令牌） ─────────── */
const StyleContext = createContext<PhoneUiStyle>(PHONE_UI_STYLES[0]);
const useStyle = () => useContext(StyleContext);

/* ─────────── 辅助组件（全部风格化） ─────────── */

function Toggle({ value, onChange }: { value: boolean; onChange?: (v: boolean) => void }) {
  const s = useStyle();
  return (
    <button type="button" onClick={() => onChange?.(!value)}
      className="relative w-[42px] h-[26px] rounded-full transition-colors duration-200 shrink-0"
      style={{ backgroundColor: value ? s.accent : s.toggleOff }}>
      <div className={`absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-[19px]' : 'translate-x-[3px]'}`} />
    </button>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  const s = useStyle();
  return <h4 className="text-[11px] font-semibold uppercase tracking-wide px-1 pt-5 pb-1.5 first:pt-3" style={{ color: s.sectionLabel }}>{children}</h4>;
}

function Card({ children }: { children: ReactNode }) {
  const s = useStyle();
  return <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: s.cardBg, border: `1px solid ${s.cardBorder}` }}>{children}</div>;
}

function Divider() {
  const s = useStyle();
  return <div className="h-px mx-4" style={{ backgroundColor: s.divider }} />;
}

function ArrowRow({ icon: Icon, label, detail, onClick }: { icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; detail: string; onClick?: () => void }) {
  const s = useStyle();
  const content = (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon className="w-[18px] h-[18px] shrink-0" style={{ color: s.icon }} />}
        <span className="text-[13px] truncate" style={{ color: s.textPrimary }}>{label}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[12px]" style={{ color: s.textSecondary }}>{detail}</span>
        <ChevronRight className="w-3.5 h-3.5" style={{ color: s.chevron }} />
      </div>
    </div>
  );
  return onClick ? <button type="button" onClick={onClick} className="w-full text-left">{content}</button> : content;
}

function ToggleRow({ icon: Icon, label, value, onChange, hint }: { icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; value: boolean; onChange?: (v: boolean) => void; hint?: string }) {
  const s = useStyle();
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon className="w-[18px] h-[18px] shrink-0" style={{ color: s.icon }} />}
        <div className="min-w-0">
          <span className="text-[13px]" style={{ color: s.textPrimary }}>{label}</span>
          {hint && <p className="text-[10px] mt-0.5" style={{ color: s.textSecondary }}>{hint}</p>}
        </div>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function SliderRow({ label, value, onChange, suffix }: { label: string; value: number; onChange?: (v: number) => void; suffix?: string }) {
  const s = useStyle();
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-[13px]" style={{ color: s.textPrimary }}>{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        {suffix && <span className="text-[12px] w-10 text-right" style={{ color: s.textSecondary }}>{suffix}</span>}
        <input type="range" min="0" max="100" value={value} onChange={(e) => onChange?.(Number(e.target.value))}
          className="w-20 h-1.5 rounded-full appearance-none bg-slate-200" style={{ accentColor: s.accent }} />
      </div>
    </div>
  );
}

/* ─────────── 界面风格选择子页面 ─────────── */

function StylePicker({ onBack }: { onBack: () => void }) {
  const { state, setPhoneUiStyle } = useGame();
  const s = useStyle();
  const current = state.phoneUiStyle;

  return (
    <div className="min-h-full pb-6" style={{ backgroundColor: s.settingsBg }}>
      <div className="flex items-center gap-3 px-1 pt-2 pb-4">
        <button type="button" onClick={onBack} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: s.backBtnBg }}>
          <ArrowLeft className="w-4 h-4" style={{ color: s.backBtnIcon }} />
        </button>
        <span className="text-base font-bold flex-1" style={{ color: s.textPrimary }}>界面风格</span>
      </div>

      <div className="space-y-3">
        {PHONE_UI_STYLES.map((st) => {
          const active = st.id === current;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setPhoneUiStyle(st.id)}
              className="w-full rounded-2xl p-3 flex items-center gap-3 text-left border-2 transition-colors"
              style={{ backgroundColor: st.cardBg, borderColor: active ? st.accent : 'transparent' }}
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden flex flex-col shrink-0" style={{ backgroundColor: st.settingsBg, border: `1px solid ${st.divider}` }}>
                <div className="h-3 shrink-0" style={{ backgroundColor: st.statusBarBg }} />
                <div className="flex-1 flex items-center justify-center" style={{ color: st.textPrimary }}>
                  <span className="text-[10px]">Aa</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold" style={{ color: st.textPrimary }}>{st.name}</span>
                  {active && <Check className="w-4 h-4 shrink-0" style={{ color: st.accent }} />}
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: st.textSecondary }}>{st.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── 壁纸管理子页面 ─────────── */

function WallpaperPicker({ onBack }: { onBack: () => void }) {
  const { state, setActiveWallpaper, rollDefaultWallpaper, importWallpaper, deleteWallpapers, replaceWallpapers } = useGame();
  const s = useStyle();
  const { wallpaperKind, wallpaperKey, customWallpapers, bizhiBuiltins, rolledDefaultWallpaper } = state;

  const [deleteMode, setDeleteMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // 当前壁纸 URL
  const currentUrl = (() => {
    if (wallpaperKind === 'default') return rolledDefaultWallpaper ? bizhiUrl(rolledDefaultWallpaper) : null;
    if (wallpaperKind === 'builtin') return wallpaperKey ? bizhiUrl(wallpaperKey) : null;
    return customWallpapers.find((w) => w.id === wallpaperKey)?.blobUrl ?? null;
  })();
  const currentKindLabel = wallpaperKind === 'builtin' ? '内置壁纸' : wallpaperKind === 'custom' ? '我的壁纸' : '默认壁纸';

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const imgs = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imgs.length === 0) return;
    setBusy(true);
    try {
      await Promise.all(imgs.map((f) => importWallpaper(f, f.name, f.type)));
    } finally {
      setBusy(false);
    }
  }, [importWallpaper]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (e.clipboardData?.files?.length) { e.preventDefault(); processFiles(e.clipboardData.files); }
  }, [processFiles]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFiles(e.target.files);
    e.target.value = '';
  };

  const handleUseDefault = () => {
    rollDefaultWallpaper();
    setActiveWallpaper('default', '');
  };

  const handleExportCurrent = () => {
    const cw = customWallpapers.find((w) => w.id === wallpaperKey);
    if (!cw) return;
    const a = document.createElement('a');
    a.href = cw.blobUrl;
    a.download = cw.fileName || 'wallpaper.png';
    a.click();
  };

  const handleExportAll = async () => {
    if (customWallpapers.length === 0) return;
    setBusy(true);
    try {
      const blob = await exportWallpapersAsZip(customWallpapers);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `手机壁纸备份-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      setBusy(false);
    }
  };

  const handleImportBackup = async (file: File) => {
    setBusy(true);
    try {
      const items = await parseWallpaperZip(file);
      if (items.length > 0) {
        await replaceWallpapers(items);
        rollDefaultWallpaper();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleBackupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImportBackup(file);
    e.target.value = '';
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleDelete = async () => {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      await deleteWallpapers(Array.from(selected));
    } finally {
      setBusy(false);
    }
    setSelected(new Set());
    setDeleteMode(false);
  };

  return (
    <div className="min-h-full pb-6" style={{ backgroundColor: s.settingsBg }}>
      {/* 标题栏 */}
      <div className="flex items-center gap-3 px-1 pt-2 pb-4">
        <button type="button" onClick={onBack} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: s.backBtnBg }}>
          <ArrowLeft className="w-4 h-4" style={{ color: s.backBtnIcon }} />
        </button>
        <span className="text-base font-bold flex-1" style={{ color: s.textPrimary }}>壁纸</span>
        {customWallpapers.length > 0 && (
          <button type="button" onClick={() => { setDeleteMode(!deleteMode); setSelected(new Set()); }}
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg"
            style={{ backgroundColor: deleteMode ? s.divider : s.accent, color: deleteMode ? s.textPrimary : '#ffffff' }}>
            {deleteMode ? '取消' : '编辑'}
          </button>
        )}
      </div>

      {/* 当前壁纸预览 */}
      <div
        className="w-full h-36 rounded-2xl border-2 flex items-end justify-between p-3 mb-4 bg-cover bg-center relative overflow-hidden"
        style={{ borderColor: s.accent, backgroundImage: currentUrl ? `url(${currentUrl})` : undefined, backgroundColor: currentUrl ? undefined : s.cardBg }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="relative text-[11px] font-semibold text-white drop-shadow">当前壁纸 · {currentKindLabel}</span>
      </div>

      {/* 拖放 / 粘贴 / 选择图片 */}
      <div
        className="w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-5 mb-5 transition-colors"
        style={{ borderColor: s.chevron, backgroundColor: s.cardBg }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        tabIndex={0}
        onPaste={handlePaste}
      >
        <Upload className="w-6 h-6" style={{ color: s.icon }} />
        <span className="text-[11px]" style={{ color: s.textSecondary }}>拖放图片到此处，或 Ctrl+V 粘贴</span>
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="px-3 py-1.5 text-[12px] font-semibold rounded-lg text-white"
          style={{ backgroundColor: s.accent }}
        >
          选择图片导入
        </button>
      </div>

      {/* 默认壁纸 */}
      <SectionLabel>默认壁纸</SectionLabel>
      <button
        type="button"
        onClick={handleUseDefault}
        className="relative w-full aspect-[9/19] max-h-44 rounded-2xl border-2 bg-cover bg-center overflow-hidden"
        style={{
          borderColor: wallpaperKind === 'default' ? s.accent : s.chevron,
          backgroundImage: rolledDefaultWallpaper ? `url(${bizhiUrl(rolledDefaultWallpaper)})` : undefined,
          backgroundColor: rolledDefaultWallpaper ? undefined : s.cardBg,
        }}
      >
        {!rolledDefaultWallpaper && (
          <span className="absolute inset-0 flex items-center justify-center text-[11px]" style={{ color: s.textSecondary }}>暂无默认壁纸</span>
        )}
        <span className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-semibold text-white bg-black/40 rounded-full px-2 py-0.5">
          <RefreshCw className="w-3 h-3" /> 使用默认（随机）
        </span>
        {wallpaperKind === 'default' && <Check className="absolute top-1.5 right-1.5 w-4 h-4 text-white drop-shadow" />}
      </button>

      {/* 内置壁纸 */}
      {bizhiBuiltins.length > 0 && (
        <>
          <SectionLabel>内置壁纸 ({bizhiBuiltins.length})</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {bizhiBuiltins.map((name) => {
              const active = wallpaperKind === 'builtin' && wallpaperKey === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setActiveWallpaper('builtin', name)}
                  className="relative aspect-[9/19] rounded-xl border-2 bg-cover bg-center"
                  style={{ borderColor: active ? s.accent : s.chevron, backgroundImage: `url(${bizhiUrl(name)})` }}
                >
                  {active && <Check className="absolute top-1 right-1 w-3.5 h-3.5 text-white drop-shadow" />}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* 我的壁纸（自定义） */}
      {customWallpapers.length > 0 && (
        <>
          <SectionLabel>我的壁纸 ({customWallpapers.length})</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {customWallpapers.map((w) => {
              const active = wallpaperKind === 'custom' && wallpaperKey === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => deleteMode ? toggleSelect(w.id) : setActiveWallpaper('custom', w.id)}
                  className="relative aspect-[9/19] rounded-xl border-2 bg-cover bg-center"
                  style={{ borderColor: active ? s.accent : s.chevron, backgroundImage: `url(${w.blobUrl})` }}
                >
                  {deleteMode && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded border-2 flex items-center justify-center"
                      style={{ backgroundColor: selected.has(w.id) ? s.danger : 'rgba(0,0,0,0.3)', borderColor: selected.has(w.id) ? s.danger : '#ffffff' }}>
                      {selected.has(w.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                  )}
                  {!deleteMode && active && <Check className="absolute top-1 right-1 w-3.5 h-3.5 text-white drop-shadow" />}
                </button>
              );
            })}
          </div>

          {/* 我的壁纸 操作区 */}
          {!deleteMode && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button type="button" onClick={handleExportCurrent} disabled={wallpaperKind !== 'custom' || busy}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold text-white disabled:opacity-40"
                style={{ backgroundColor: s.accent }}>
                <Download className="w-3.5 h-3.5" /> 导出当前
              </button>
              <button type="button" onClick={handleExportAll} disabled={busy}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold text-white disabled:opacity-40"
                style={{ backgroundColor: s.accent }}>
                <Archive className="w-3.5 h-3.5" /> 导出全部(.zip)
              </button>
              <button type="button" onClick={() => backupInputRef.current?.click()} disabled={busy}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold col-span-2"
                style={{ backgroundColor: s.backBtnBg, color: s.textPrimary }}>
                <FolderUp className="w-3.5 h-3.5" /> 导入备份(.zip，覆盖现有)
              </button>
            </div>
          )}

          {/* 删除按钮 */}
          {deleteMode && selected.size > 0 && (
            <button type="button" onClick={handleDelete} disabled={busy}
              className="mt-3 w-full py-2 rounded-xl text-white text-[13px] font-semibold flex items-center justify-center gap-2"
              style={{ backgroundColor: s.danger }}>
              <Trash2 className="w-4 h-4" /> 删除 ({selected.size})
            </button>
          )}
        </>
      )}

      {customWallpapers.length === 0 && (
        <p className="text-[11px] px-1 mt-1" style={{ color: s.textSecondary }}>还没有自定义壁纸，可通过上方「选择图片导入」添加。</p>
      )}

      {/* 隐藏的文件输入 */}
      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
      <input ref={backupInputRef} type="file" accept=".zip,application/zip" className="hidden" onChange={handleBackupChange} />
    </div>
  );
}

/* ─────────── 主设置页面 ─────────── */

function SettingsContent() {
  const { state, toggleAccessibilityMode } = useGame();
  const style = useStyle();
  const { accessibilityMode, wallpaperKind, phoneUiStyle } = state;

  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [mobileData, setMobileData] = useState(true);
  const [brightness, setBrightness] = useState(70);
  const [mediaVolume, setMediaVolume] = useState(50);
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [showStyle, setShowStyle] = useState(false);

  if (showStyle) return <StylePicker onBack={() => setShowStyle(false)} />;
  if (showWallpaper) return <WallpaperPicker onBack={() => setShowWallpaper(false)} />;

  const wallpaperDetail = wallpaperKind === 'builtin' ? '内置壁纸' : wallpaperKind === 'custom' ? '我的壁纸' : '默认壁纸';

  return (
    <div className="min-h-full pb-6" style={{ backgroundColor: style.settingsBg }}>
      <SectionLabel>外观</SectionLabel>
      <Card>
        <ArrowRow icon={ImageIcon} label="壁纸" detail={wallpaperDetail} onClick={() => setShowWallpaper(true)} />
        <Divider />
        <ArrowRow icon={Palette} label="界面风格" detail={getPhoneUiStyle(phoneUiStyle).name} onClick={() => setShowStyle(true)} />
      </Card>

      <SectionLabel>网络与通信</SectionLabel>
      <Card>
        <ToggleRow icon={Wifi} label="Wi-Fi" value={wifi} onChange={setWifi} />
        <Divider />
        <ToggleRow icon={Bluetooth} label="蓝牙" value={bluetooth} onChange={setBluetooth} />
        <Divider />
        <ToggleRow icon={Radio} label="移动数据" value={mobileData} onChange={setMobileData} />
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
          hint={accessibilityMode ? '无障碍模式：APP名称为中文' : '正常模式：APP名称为原文'} />
      </Card>

      <SectionLabel>系统</SectionLabel>
      <Card>
        <ArrowRow icon={Globe} label="语言" detail="中文（简体）" />
        <Divider />
        <ArrowRow label="日期与时间" detail="自动设置" />
        <Divider />
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Info className="w-[18px] h-[18px] shrink-0" style={{ color: style.icon }} />
            <div>
              <span className="text-[13px]" style={{ color: style.textPrimary }}>关于本机</span>
              <p className="text-[10px] mt-0.5" style={{ color: style.textSecondary }}>综漫手机 · LifeSimOS 1.0</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: style.chevron }} />
        </div>
      </Card>
    </div>
  );
}

export function PhoneSettingsApp() {
  const { state } = useGame();
  const style = getPhoneUiStyle(state.phoneUiStyle);
  return (
    <StyleContext.Provider value={style}>
      <SettingsContent />
    </StyleContext.Provider>
  );
}
