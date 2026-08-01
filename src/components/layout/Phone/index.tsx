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
    openPhoneApp,
    closePhoneApp,
    reorderPhoneHome,
    createPhoneFolder,
    addAppToFolder,
    removeAppFromFolder,
  } = useGame();
  const { phoneExpanded, activePhoneApp, phoneApps, phoneHomeLayout, time } = state;
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

  return (
    <PhoneFrame expanded={phoneExpanded} onHeadClick={expandPhone}>
      {phoneExpanded && (
        <div className="flex flex-col h-full">
          {/* 状态栏 */}
          <div className="flex items-center justify-between px-5 pt-3 pb-1 shrink-0 z-20">
            <span className="text-xs font-semibold text-slate-800 tracking-tight">
              {String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1.5 text-slate-800">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

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
                />
                {openFolder && (
                  <PhoneFolderView
                    folder={openFolder}
                    apps={phoneApps}
                    onAppClick={handleFolderAppClick}
                    onClose={handleCloseFolder}
                    onRemoveApp={handleRemoveFromFolder}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}
