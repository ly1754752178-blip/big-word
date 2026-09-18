import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { PhoneFrame } from './PhoneFrame';
import { PhoneAppGrid } from './PhoneAppGrid';
import { PhoneAppScreen } from './PhoneAppScreen';
import { PhoneFolderView } from './PhoneFolderView';
import { Wifi, Battery } from 'lucide-react';
import { getPhoneUiStyle } from '@/lib/phone-ui-styles';
import { bizhiUrl } from '@/lib/phone-bizhi';
import type { PhoneHomeFolder } from '@/types';

export function Phone() {
  const {
    state,
    expandPhone,
    collapsePhone,
    openPhoneApp,
    closePhoneApp,
    reorderPhoneHome,
    createPhoneFolder,
    addAppToFolder,
    removeAppFromFolder,
    rollDefaultWallpaper,
  } = useGame();
  const {
    phoneExpanded, activePhoneApp, phoneApps, phoneHomeLayout, time,
    accessibilityMode, phoneUiStyle, wallpaperKind, wallpaperKey,
    rolledDefaultWallpaper, customWallpapers, bizhiDefaults,
  } = state;
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);

  const style = getPhoneUiStyle(phoneUiStyle);
  const activeApp = phoneApps.find((app) => app.id === activePhoneApp);
  const openFolder = openFolderId
    ? (phoneHomeLayout.find((item): item is PhoneHomeFolder => item.type === 'folder' && item.id === openFolderId) ?? null)
    : null;

  // 进入游戏正文（手机挂载）时，若处于「默认壁纸」态，则从数字图中随机抽一张
  const rolledRef = useRef(false);
  useEffect(() => {
    if (wallpaperKind !== 'default' || rolledRef.current) return;
    if (bizhiDefaults.length === 0) return;
    rollDefaultWallpaper();
    rolledRef.current = true;
  }, [wallpaperKind, bizhiDefaults, rollDefaultWallpaper]);

  const handleOpenFolder = (folder: PhoneHomeFolder) => setOpenFolderId(folder.id);
  const handleCloseFolder = () => setOpenFolderId(null);
  const handleFolderAppClick = (appId: string) => { setOpenFolderId(null); openPhoneApp(appId as Parameters<typeof openPhoneApp>[0]); };
  const handleRemoveFromFolder = (appId: string) => {
    if (!openFolderId) return;
    const fi = phoneHomeLayout.findIndex((item) => item.type === 'folder' && item.id === openFolderId);
    if (fi >= 0) removeAppFromFolder(fi, appId as Parameters<typeof removeAppFromFolder>[1]);
  };

  // 解析当前壁纸 URL（仅主屏幕显示壁纸，打开 APP 时用纯色底）
  const wallpaperUrl = (() => {
    if (wallpaperKind === 'default') return rolledDefaultWallpaper ? bizhiUrl(rolledDefaultWallpaper) : null;
    if (wallpaperKind === 'builtin') return wallpaperKey ? bizhiUrl(wallpaperKey) : null;
    if (wallpaperKind === 'custom') return customWallpapers.find((w) => w.id === wallpaperKey)?.blobUrl ?? null;
    return null;
  })();
  const wallpaper = activeApp ? null : wallpaperUrl;
  const screenBg = style.screenBg;

  return (
    <PhoneFrame
      expanded={phoneExpanded}
      onHeadClick={expandPhone}
      onCollapse={collapsePhone}
      wallpaper={wallpaper}
      screenBg={screenBg}
    >
      <div className="flex flex-col h-full">
        {/* 状态栏（时间 + Wifi + 电量） */}
        <div
          className="flex items-center justify-between px-5 pt-3 pb-1 shrink-0 z-20 rounded-t-[36px]"
          style={{ backgroundColor: style.statusBarBg, color: style.statusBarText }}
        >
          <span className="text-xs font-semibold tracking-tight">
            {String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {phoneExpanded && (
          <div className="flex-1 overflow-y-auto relative">
            {activeApp ? (
              <PhoneAppScreen app={activeApp} onBack={closePhoneApp} />
            ) : (
              <>
                <PhoneAppGrid
                  layout={phoneHomeLayout} apps={phoneApps}
                  onAppClick={openPhoneApp} onOpenFolder={handleOpenFolder}
                  reorderPhoneHome={reorderPhoneHome} createPhoneFolder={createPhoneFolder}
                  addAppToFolder={addAppToFolder} accessibilityMode={accessibilityMode}
                />
                {openFolder && (
                  <PhoneFolderView
                    folder={openFolder} apps={phoneApps}
                    onAppClick={handleFolderAppClick} onClose={handleCloseFolder}
                    onRemoveApp={handleRemoveFromFolder} accessibilityMode={accessibilityMode}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
