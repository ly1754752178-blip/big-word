import { useState } from 'react';
import { useGame } from '@/hooks/useGameState';
import { PhoneFrame } from './PhoneFrame';
import { PhoneAppGrid } from './PhoneAppGrid';
import { PhoneAppScreen } from './PhoneAppScreen';
import { PhoneFolderView } from './PhoneFolderView';
import { Wifi, Battery } from 'lucide-react';
import type { PhoneHomeFolder, PhoneTheme } from '@/types';

// 主题完整色值（与 PhoneSettingsApp 共用）
const THEME_COLORS: Record<PhoneTheme, { statusBg: string; statusText: string; accent: string; pageBg: string }> = {
  vinyl:   { statusBg: '#1a1814', statusText: '#f5f0e8', accent: '#D4A853', pageBg: '#f0ede5' },
  modern:  { statusBg: 'transparent', statusText: '#1e293b', accent: '#3B82F6', pageBg: '#F2F0F5' },
  school:  { statusBg: '#fef1f5', statusText: '#9D174D', accent: '#EC4899', pageBg: '#fce7f0' },
  starry:  { statusBg: '#0f172a', statusText: '#e2e8f0', accent: '#6366F1', pageBg: '#0f172a' },
};

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
  const { phoneExpanded, activePhoneApp, phoneApps, phoneHomeLayout, time, accessibilityMode, wallpaper, phoneTheme } = state;
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);

  const activeApp = phoneApps.find((app) => app.id === activePhoneApp);
  const openFolder = openFolderId
    ? (phoneHomeLayout.find(
        (item): item is PhoneHomeFolder => item.type === 'folder' && item.id === openFolderId
      ) ?? null)
    : null;

  const handleOpenFolder = (folder: PhoneHomeFolder) => setOpenFolderId(folder.id);
  const handleCloseFolder = () => setOpenFolderId(null);

  const handleFolderAppClick = (appId: string) => {
    setOpenFolderId(null);
    openPhoneApp(appId as Parameters<typeof openPhoneApp>[0]);
  };

  const handleRemoveFromFolder = (appId: string) => {
    if (!openFolderId) return;
    const folderIndex = phoneHomeLayout.findIndex(
      (item) => item.type === 'folder' && item.id === openFolderId
    );
    if (folderIndex >= 0) {
      removeAppFromFolder(folderIndex, appId as Parameters<typeof removeAppFromFolder>[1]);
    }
  };

  const tc = THEME_COLORS[phoneTheme];

  return (
    <PhoneFrame
      expanded={phoneExpanded}
      onHeadClick={expandPhone}
      onCollapse={collapsePhone}
      wallpaper={wallpaper}
      screenBg={tc.pageBg}
    >
      <div className="flex flex-col h-full">
        {/* 状态栏 —— 始终可见，收起时正是这一行露出屏幕 */}
        <div
          className="flex items-center justify-between px-5 pt-3 pb-1 shrink-0 z-20 rounded-t-[36px]"
          style={{
            backgroundColor: tc.statusBg,
            color: tc.statusText,
          }}
        >
          <span className="text-xs font-semibold tracking-tight" style={{ color: tc.statusText }}>
            {String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-1.5" style={{ color: tc.statusText }}>
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
                  layout={phoneHomeLayout}
                  apps={phoneApps}
                  onAppClick={openPhoneApp}
                  onOpenFolder={handleOpenFolder}
                  reorderPhoneHome={reorderPhoneHome}
                  createPhoneFolder={createPhoneFolder}
                  addAppToFolder={addAppToFolder}
                  accessibilityMode={accessibilityMode}
                />
                {openFolder && (
                  <PhoneFolderView
                    folder={openFolder}
                    apps={phoneApps}
                    onAppClick={handleFolderAppClick}
                    onClose={handleCloseFolder}
                    onRemoveApp={handleRemoveFromFolder}
                    accessibilityMode={accessibilityMode}
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
