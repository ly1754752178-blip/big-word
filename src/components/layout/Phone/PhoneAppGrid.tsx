import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { PhoneApp, PhoneAppId, PhoneHomeItem, PhoneHomeFolder } from '@/types';
import { getAppDisplayName } from './PhoneAppScreen';

interface PhoneAppGridProps {
  layout: PhoneHomeItem[];
  apps: PhoneApp[];
  onAppClick: (appId: PhoneAppId) => void;
  onOpenFolder: (folder: PhoneHomeFolder) => void;
  reorderPhoneHome: (fromIndex: number, toIndex: number) => void;
  createPhoneFolder: (sourceIndex: number, targetIndex: number, name?: string) => void;
  addAppToFolder: (appIndex: number, folderIndex: number) => void;
  accessibilityMode: boolean;
}

const LONG_PRESS_MS = 420;
const MERGE_HOLD_MS = 520;
const DRAG_THRESHOLD = 10;

export function PhoneAppGrid({
  layout,
  apps,
  onAppClick,
  onOpenFolder,
  reorderPhoneHome,
  createPhoneFolder,
  addAppToFolder,
  accessibilityMode,
}: PhoneAppGridProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const dragStartIndexRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mergeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasDraggingRef = useRef(false);

  const getApp = useCallback(
    (id: PhoneAppId) => apps.find((a) => a.id === id),
    [apps]
  );

  const clearTimers = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (mergeTimerRef.current) {
      clearTimeout(mergeTimerRef.current);
      mergeTimerRef.current = null;
    }
  }, []);

  const endDrag = useCallback(() => {
    clearTimers();
    dragStartIndexRef.current = null;
    startPosRef.current = null;
    setDraggingIndex(null);
    setHoverIndex(null);
    setDragPos(null);
    // 让 click 事件有机会读取后，再重置
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 50);
  }, [clearTimers]);

  const handleMerge = useCallback(
    (sourceIndex: number, targetIndex: number) => {
      const target = layout[targetIndex];
      if (!target || sourceIndex === targetIndex) return;
      if (target.type === 'app') {
        createPhoneFolder(sourceIndex, targetIndex);
      } else {
        addAppToFolder(sourceIndex, targetIndex);
      }
      endDrag();
    },
    [layout, createPhoneFolder, addAppToFolder, endDrag]
  );

  const resolveHoverIndex = useCallback((clientX: number, clientY: number) => {
    const el = document.elementFromPoint(clientX, clientY);
    const cell = el?.closest('[data-phone-index]');
    if (!cell) return null;
    const idx = Number(cell.getAttribute('data-phone-index'));
    return Number.isNaN(idx) ? null : idx;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, index: number) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      startPosRef.current = { x: e.clientX, y: e.clientY };
      dragStartIndexRef.current = index;
      wasDraggingRef.current = false;

      longPressTimerRef.current = setTimeout(() => {
        setDraggingIndex(index);
        setDragPos({ x: e.clientX, y: e.clientY });
        setHoverIndex(index);
        wasDraggingRef.current = true;
      }, LONG_PRESS_MS);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const startIndex = dragStartIndexRef.current;
      if (startIndex === null || startPosRef.current === null) return;

      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;

      if (draggingIndex === null) {
        // 尚未进入拖动：若移动超出阈值，取消本次长按
        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
          clearTimers();
          dragStartIndexRef.current = null;
          startPosRef.current = null;
        }
        return;
      }

      e.preventDefault();
      setDragPos({ x: e.clientX, y: e.clientY });

      const nextHover = resolveHoverIndex(e.clientX, e.clientY);
      if (nextHover !== hoverIndex) {
        setHoverIndex(nextHover);
        if (mergeTimerRef.current) clearTimeout(mergeTimerRef.current);
        if (nextHover !== null && nextHover !== draggingIndex) {
          mergeTimerRef.current = setTimeout(() => {
            handleMerge(draggingIndex, nextHover);
          }, MERGE_HOLD_MS);
        }
      }
    },
    [clearTimers, draggingIndex, hoverIndex, resolveHoverIndex, handleMerge]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent, item: PhoneHomeItem) => {
      const startIndex = dragStartIndexRef.current;
      if (startIndex === null) return;

      if (draggingIndex !== null && hoverIndex !== null && hoverIndex !== draggingIndex) {
        // 在另一个位置上松开：执行重新排序（挤开/插入）
        reorderPhoneHome(draggingIndex, hoverIndex);
      } else if (draggingIndex === null) {
        // 没有触发拖动，视为点击
        if (item.type === 'app') {
          onAppClick(item.appId);
        } else {
          onOpenFolder(item);
        }
      }

      endDrag();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // 忽略已经释放的情况
      }
    },
    [draggingIndex, hoverIndex, onAppClick, onOpenFolder, reorderPhoneHome, endDrag]
  );

  const handlePointerCancel = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const renderIcon = (item: PhoneHomeItem, index: number, isGhost = false) => {
    const isFolder = item.type === 'folder';
    const isTarget = hoverIndex === index && draggingIndex !== null && draggingIndex !== index;

    return (
      <motion.button
        key={isGhost ? 'ghost' : `${item.type}-${isFolder ? item.id : item.appId}-${index}`}
        data-phone-index={isGhost ? undefined : index}
        data-phone-dragging={isGhost ? 'true' : undefined}
        type="button"
        initial={isGhost ? undefined : { opacity: 0, scale: 0.8 }}
        animate={
          isGhost
            ? undefined
            : { opacity: draggingIndex === index ? 0.3 : 1, scale: isTarget ? 1.15 : 1 }
        }
        transition={{ delay: isGhost ? 0 : index * 0.03 }}
        onPointerDown={isGhost ? undefined : (e) => handlePointerDown(e, index)}
        onPointerMove={isGhost ? undefined : handlePointerMove}
        onPointerUp={isGhost ? undefined : (e) => handlePointerUp(e, item)}
        onPointerCancel={isGhost ? undefined : handlePointerCancel}
        onLostPointerCapture={isGhost ? undefined : handlePointerCancel}
        className="flex flex-col items-center gap-1.5 group outline-none"
        style={{ touchAction: 'none' }}
      >
        {isFolder ? (
          <FolderPreview folder={item} apps={apps} isTarget={isTarget} />
        ) : (
          <AppIcon app={getApp(item.appId)} />
        )}
        <span className="text-[10px] font-medium text-slate-700/90 text-center leading-tight max-w-full px-1 truncate">
          {isFolder ? item.name : (getApp(item.appId) ? getAppDisplayName(getApp(item.appId)!, accessibilityMode) : '')}
        </span>
      </motion.button>
    );
  };

  const ghostItem = draggingIndex !== null ? layout[draggingIndex] : null;
  let ghostStyle: React.CSSProperties | undefined;
  if (ghostItem && dragPos && gridRef.current) {
    const rect = gridRef.current.getBoundingClientRect();
    ghostStyle = {
      position: 'absolute',
      left: dragPos.x - rect.left - 28,
      top: dragPos.y - rect.top - 28,
      width: 56,
      zIndex: 60,
      pointerEvents: 'none',
    };
  }

  return (
    <div ref={gridRef} className="relative grid grid-cols-3 gap-x-2 gap-y-4 p-5 pt-6">
      {layout.map((item, index) => renderIcon(item, index))}
      {ghostItem && dragPos && (
        <div style={ghostStyle}>{renderIcon(ghostItem, draggingIndex!, true)}</div>
      )}
    </div>
  );
}

function AppIcon({ app }: { app?: PhoneApp }) {
  if (!app) return <div className="w-14 h-14 rounded-[22%] bg-slate-200" />;
  const isTikTok = app.id === 'tiktok';
  return (
    <div className={`relative w-14 h-14 rounded-[22%] overflow-hidden shadow-sm ${isTikTok ? 'bg-black' : ''}`}>
      <img
        src={app.icon}
        alt={app.name}
        className="w-full h-full object-cover scale-110"
        style={isTikTok ? { mixBlendMode: 'multiply', filter: 'contrast(1.1)' } : undefined}
        draggable={false}
      />
      {app.badge && app.badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F43F5E] text-white text-[10px] font-bold flex items-center justify-center border border-white"
        >
          {app.badge > 99 ? '99+' : app.badge}
        </span>
      )}
    </div>
  );
}

function FolderPreview({
  folder,
  apps,
  isTarget,
}: {
  folder: PhoneHomeFolder;
  apps: PhoneApp[];
  isTarget?: boolean;
}) {
  const folderApps = folder.appIds
    .map((id) => apps.find((a) => a.id === id))
    .filter((a): a is PhoneApp => Boolean(a));
  const count = folderApps.length;

  // 始终渲染 4 个格子：不足的用半透明占位填满，避免碎裂感
  const cells: (PhoneApp | null)[] = [null, null, null, null];
  for (let i = 0; i < Math.min(count, 4); i += 1) {
    cells[i] = folderApps[i];
  }

  return (
    <div
      className={[
        'w-14 h-14 rounded-[22%] overflow-hidden p-1.5 grid grid-cols-2 grid-rows-2 gap-0.5',
        'bg-slate-200/80 shadow-sm backdrop-blur-sm transition-transform',
        isTarget ? 'scale-110 ring-2 ring-white/70' : '',
      ].join(' ')}
    >
      {cells.map((app, i) => (
        <div key={app ? app.id : `placeholder-${i}`} className="rounded-[20%] overflow-hidden bg-slate-300/50">
          {app && (
            <img
              src={app.icon}
              alt={app.name}
              className="w-full h-full object-cover scale-110"
              draggable={false}
            />
          )}
        </div>
      ))}
    </div>
  );
}
