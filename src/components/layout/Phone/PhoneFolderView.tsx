import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PhoneApp, PhoneAppId, PhoneHomeFolder } from '@/types';

interface PhoneFolderViewProps {
  folder: PhoneHomeFolder;
  apps: PhoneApp[];
  onAppClick: (appId: PhoneAppId) => void;
  onClose: () => void;
  onRemoveApp: (appId: PhoneAppId) => void;
}

const DRAG_OUT_THRESHOLD = 14;

export function PhoneFolderView({
  folder,
  apps,
  onAppClick,
  onClose,
  onRemoveApp,
}: PhoneFolderViewProps) {
  const folderApps = folder.appIds
    .map((id) => apps.find((a) => a.id === id))
    .filter((a): a is PhoneApp => Boolean(a));

  const [draggingAppId, setDraggingAppId] = useState<PhoneAppId | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [willRemove, setWillRemove] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didDragRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const endDrag = useCallback(() => {
    clearTimer();
    startPosRef.current = null;
    setDraggingAppId(null);
    setDragPos(null);
    setWillRemove(false);
    didDragRef.current = false;
  }, [clearTimer]);

  const checkOutsideCard = useCallback((clientX: number, clientY: number) => {
    if (!cardRef.current) return false;
    const rect = cardRef.current.getBoundingClientRect();
    return (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    );
  }, []);

  const handleAppPointerDown = useCallback(
    (e: React.PointerEvent, appId: PhoneAppId) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      startPosRef.current = { x: e.clientX, y: e.clientY };
      didDragRef.current = false;

      longPressTimerRef.current = setTimeout(() => {
        setDraggingAppId(appId);
        setDragPos({ x: e.clientX, y: e.clientY });
        didDragRef.current = true;
      }, 420);
    },
    []
  );

  const handleAppPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (startPosRef.current === null) return;
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;

      if (draggingAppId === null) {
        if (Math.abs(dx) > DRAG_OUT_THRESHOLD || Math.abs(dy) > DRAG_OUT_THRESHOLD) {
          clearTimer();
          startPosRef.current = null;
        }
        return;
      }

      e.preventDefault();
      setDragPos({ x: e.clientX, y: e.clientY });
      setWillRemove(checkOutsideCard(e.clientX, e.clientY));
    },
    [clearTimer, draggingAppId, checkOutsideCard]
  );

  const handleAppPointerUp = useCallback(
    (e: React.PointerEvent, appId: PhoneAppId) => {
      clearTimer();
      const wasDragging = draggingAppId !== null;
      if (wasDragging) {
        if (willRemove) {
          onRemoveApp(appId);
        }
        endDrag();
      } else if (startPosRef.current !== null) {
        // 未触发拖动，视为打开 APP
        onAppClick(appId);
      }
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // 忽略
      }
    },
    [clearTimer, draggingAppId, willRemove, onRemoveApp, onAppClick, endDrag]
  );

  const handleAppPointerCancel = useCallback(() => {
    endDrag();
  }, [endDrag]);

  useEffect(() => {
    // 文件夹内 APP 少于 2 个时，由父级自动解散并关闭本视图
    if (folderApps.length < 2) {
      onClose();
    }
  }, [folderApps.length, onClose]);

  return (
    <AnimatePresence>
      {folderApps.length >= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
          onPointerDown={(e) => {
            // 点击空白处关闭
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={cardRef}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="relative w-full max-w-[220px] rounded-3xl bg-[#F2F2F7]/92 backdrop-blur-md p-5 shadow-xl"
          >
            <div className="grid grid-cols-3 gap-x-3 gap-y-4">
              {folderApps.map((app) => (
                <motion.button
                  key={app.id}
                  type="button"
                  onPointerDown={(e) => handleAppPointerDown(e, app.id)}
                  onPointerMove={handleAppPointerMove}
                  onPointerUp={(e) => handleAppPointerUp(e, app.id)}
                  onPointerCancel={handleAppPointerCancel}
                  onLostPointerCapture={handleAppPointerCancel}
                  className="flex flex-col items-center gap-1 outline-none"
                  style={{ touchAction: 'none', opacity: draggingAppId === app.id ? 0.4 : 1 }}
                >
                  <div className="relative w-14 h-14 rounded-[22%] overflow-hidden shadow-sm">
                    <img
                      src={app.icon}
                      alt={app.name}
                      className="w-full h-full object-cover scale-110"
                      draggable={false}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-700/90 text-center leading-tight max-w-full px-1 truncate">
                    {app.name}
                  </span>
                </motion.button>
              ))}
            </div>

            {draggingAppId && dragPos && cardRef.current && (
              <div
                className="pointer-events-none"
                style={{
                  position: 'absolute',
                  left: dragPos.x - cardRef.current.getBoundingClientRect().left - 28,
                  top: dragPos.y - cardRef.current.getBoundingClientRect().top - 28,
                  width: 56,
                  zIndex: 50,
                }}
              >
                {(() => {
                  const app = folderApps.find((a) => a.id === draggingAppId);
                  if (!app) return null;
                  return (
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={[
                          'w-14 h-14 rounded-[22%] overflow-hidden shadow-sm',
                          willRemove ? 'ring-2 ring-red-400' : '',
                        ].join(' ')}
                      >
                        <img
                          src={app.icon}
                          alt={app.name}
                          className="w-full h-full object-cover scale-110"
                          draggable={false}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-xs font-semibold text-slate-700">{folder.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">长按拖动到外部可移出</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
