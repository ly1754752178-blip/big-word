import { useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { PhoneFrame } from './PhoneFrame';
import { PhoneAppGrid } from './PhoneAppGrid';
import { PhoneAppScreen } from './PhoneAppScreen';
import { PhoneFolderView } from './PhoneFolderView';
import { Wifi, Battery } from 'lucide-react';
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
  } = useGame();
  const {
    phoneExpanded, activePhoneApp, phoneApps, phoneHomeLayout, time,
    accessibilityMode, wallpapers, activeWallpaperIndex, primaryColor,
  } = state;
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);

  const activeApp = phoneApps.find((app) => app.id === activePhoneApp);
  const openFolder = openFolderId
    ? (phoneHomeLayout.find((item): item is PhoneHomeFolder => item.type === 'folder' && item.id === openFolderId) ?? null)
    : null;

  const handleOpenFolder = (folder: PhoneHomeFolder) => setOpenFolderId(folder.id);
  const handleCloseFolder = () => setOpenFolderId(null);
  const handleFolderAppClick = (appId: string) => { setOpenFolderId(null); openPhoneApp(appId as Parameters<typeof openPhoneApp>[0]); };
  const handleRemoveFromFolder = (appId: string) => {
    if (!openFolderId) return;
    const fi = phoneHomeLayout.findIndex((item) => item.type === 'folder' && item.id === openFolderId);
    if (fi >= 0) removeAppFromFolder(fi, appId as Parameters<typeof removeAppFromFolder>[1]);
  };

  // 壁纸仅在主屏幕（无APP打开）时显示
  const hasCustomWallpaper = activeWallpaperIndex >= 0;
  const wallpaper = (hasCustomWallpaper && !activeApp) ? wallpapers[activeWallpaperIndex] : null;
  // 无壁纸时用主色调作为屏幕背景，有APP时也用主色调
  const screenBg = !activeApp ? (wallpaper ? undefined : primaryColor) : primaryColor;

  return (
    <PhoneFrame
      expanded={phoneExpanded}
      onHeadClick={expandPhone}
      onCollapse={collapsePhone}
      wallpaper={wallpaper}
      screenBg={screenBg}
    >
      <div className="flex flex-col h-full">
        {/* 状态栏 */}
        <div
          className="flex items-center justify-between px-5 pt-3 pb-1 shrink-0 z-20 rounded-t-[36px]"
          style={{ backgroundColor: primaryColor + '30', color: '#1e293b' }}
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
