// ============================================================
// 手机自定义壁纸持久层 — IndexedDB（Dexie）+ 旧 localStorage 迁移
// 玩家导入的图片仅存于本浏览器，不会上传到 GitHub / Vercel
// ============================================================
import Dexie, { type Table } from 'dexie';
import JSZip from 'jszip';
import type { CustomWallpaper, WallpaperKind } from '@/types';

interface WallpaperRecord {
  id: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
  createdAt: number;
}

class PhoneWallpaperDB extends Dexie {
  wallpapers!: Table<WallpaperRecord, string>;

  constructor() {
    super('phone-wallpapers-db');
    this.version(1).stores({ wallpapers: 'id, createdAt' });
  }
}

const db = new PhoneWallpaperDB();

function toCustomWallpaper(rec: WallpaperRecord): CustomWallpaper {
  return {
    id: rec.id,
    fileName: rec.fileName,
    mimeType: rec.mimeType,
    createdAt: rec.createdAt,
    blobUrl: URL.createObjectURL(rec.blob),
  };
}

/** base64 data URL → Blob（旧 localStorage 数据迁移用） */
function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(',');
  const mime = /^data:(.*?);base64$/.exec(meta)?.[1] ?? 'image/png';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function extForMime(mimeType: string): string {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/gif') return 'gif';
  if (mimeType === 'image/svg+xml') return 'svg';
  return 'png';
}

async function addRecord(blob: Blob, fileName: string, mimeType: string): Promise<string> {
  const id = `wp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await db.wallpapers.add({ id, blob, fileName, mimeType, createdAt: Date.now() });
  return id;
}

export async function listCustomWallpapers(): Promise<CustomWallpaper[]> {
  const recs = await db.wallpapers.orderBy('createdAt').toArray();
  return recs.map(toCustomWallpaper);
}

export async function addCustomWallpaper(blob: Blob, fileName: string, mimeType: string): Promise<CustomWallpaper> {
  const id = await addRecord(blob, fileName, mimeType);
  const rec = await db.wallpapers.get(id);
  return toCustomWallpaper(rec!);
}

export async function removeCustomWallpapers(ids: string[]): Promise<void> {
  await db.wallpapers.bulkDelete(ids);
}

export async function clearCustomWallpapers(): Promise<void> {
  await db.wallpapers.clear();
}

export async function getCustomWallpaperBlob(id: string): Promise<Blob | undefined> {
  const rec = await db.wallpapers.get(id);
  return rec?.blob;
}

const MIGRATED_KEY = 'phone-wallpaper-migrated-v2';

/** 一次性迁移：旧 localStorage 的 base64 壁纸 → IndexedDB */
async function migrateLegacy(): Promise<{ kind: WallpaperKind; key: string } | null> {
  if (typeof localStorage === 'undefined') return null;
  if (localStorage.getItem(MIGRATED_KEY)) return null;

  const raw = localStorage.getItem('phone-wallpapers');
  const activeRaw = localStorage.getItem('phone-active-wallpaper');
  let migratedActive: { kind: WallpaperKind; key: string } | null = null;

  if (raw) {
    try {
      const arr = JSON.parse(raw) as string[];
      const ids: string[] = [];
      for (let i = 0; i < arr.length; i++) {
        const dataUrl = arr[i];
        if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
          const blob = dataUrlToBlob(dataUrl);
          const name = `导入的壁纸 ${i + 1}.${extForMime(blob.type)}`;
          ids.push(await addRecord(blob, name, blob.type));
        }
      }
      let oldActive = -1;
      if (activeRaw && /^-?\d+$/.test(activeRaw)) oldActive = parseInt(activeRaw, 10);
      migratedActive =
        oldActive >= 0 && oldActive < ids.length
          ? { kind: 'custom', key: ids[oldActive] }
          : { kind: 'default', key: '' };
    } catch {
      migratedActive = null;
    }
  }

  localStorage.removeItem('phone-wallpapers');
  localStorage.removeItem('phone-primary-color');
  localStorage.removeItem('phone-accent-color');
  localStorage.setItem(MIGRATED_KEY, '1');
  return migratedActive;
}

/** 应用启动时初始化：迁移旧数据 + 加载自定义壁纸 */
export async function initWallpaperStore(): Promise<{
  customWallpapers: CustomWallpaper[];
  migratedActive: { kind: WallpaperKind; key: string } | null;
}> {
  const migratedActive = await migrateLegacy();
  const customWallpapers = await listCustomWallpapers();
  return { customWallpapers, migratedActive };
}

/** 将全部自定义壁纸打包为 .zip（用于备份导出） */
export async function exportWallpapersAsZip(wallpapers: CustomWallpaper[]): Promise<Blob> {
  const zip = new JSZip();
  const used = new Set<string>();
  for (const w of wallpapers) {
    const blob = await getCustomWallpaperBlob(w.id);
    if (!blob) continue;
    let name = w.fileName || `wallpaper.${extForMime(w.mimeType)}`;
    // 文件名去重，避免 zip 内重名
    let candidate = name;
    let n = 1;
    while (used.has(candidate)) {
      const dot = name.lastIndexOf('.');
      candidate = dot > 0 ? `${name.slice(0, dot)} (${n})${name.slice(dot)}` : `${name} (${n})`;
      n++;
    }
    used.add(candidate);
    zip.file(candidate, blob);
  }
  return zip.generateAsync({ type: 'blob' });
}

/** 解析 .zip 备份，返回其中的图片（用于覆盖恢复） */
export async function parseWallpaperZip(file: File): Promise<{ blob: Blob; fileName: string; mimeType: string }[]> {
  const zip = await JSZip.loadAsync(file);
  const out: { blob: Blob; fileName: string; mimeType: string }[] = [];
  const entries = Object.values(zip.files).filter((e) => !e.dir);
  for (const entry of entries) {
    const blob = await entry.async('blob');
    if (!blob.type.startsWith('image/')) continue;
    out.push({ blob, fileName: entry.name.split('/').pop() || entry.name, mimeType: blob.type });
  }
  return out;
}
