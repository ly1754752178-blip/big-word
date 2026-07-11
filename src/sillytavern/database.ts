// ============================================================
// IndexedDB 持久层 — 基于 Dexie.js
// ============================================================
import Dexie, { type Table } from 'dexie';
import type {
  Lorebook,
  ChatPreset,
  AppSettings,
  ChatSession,
} from './types';
import { createDefaultSettings } from './types';

// ---- 数据库定义 ----
class SillyTavernDB extends Dexie {
  lorebooks!: Table<Lorebook, string>;
  presets!: Table<ChatPreset, string>;
  settings!: Table<AppSettings, string>;
  chats!: Table<ChatSession, string>;

  constructor() {
    super('SillyTavernDB');
    this.version(1).stores({
      lorebooks: 'id, name, updatedAt',
      presets: 'id, name, updatedAt',
      settings: 'id',
      chats: 'id, name, characterName, updatedAt',
    });
  }
}

const db = new SillyTavernDB();

// ---- 初始化 ----
let initialized = false;

export async function initializeDatabase(): Promise<void> {
  if (initialized) return;
  await db.open();
  initialized = true;
}

// ---- 世界书 CRUD ----
export async function getLorebooks(): Promise<Lorebook[]> {
  await initializeDatabase();
  return db.lorebooks.orderBy('updatedAt').reverse().toArray();
}

export async function getLorebook(id: string): Promise<Lorebook | undefined> {
  await initializeDatabase();
  return db.lorebooks.get(id);
}

export async function saveLorebook(book: Lorebook): Promise<void> {
  await initializeDatabase();
  book.updatedAt = Date.now();
  await db.lorebooks.put(book);
}

export async function deleteLorebook(id: string): Promise<void> {
  await initializeDatabase();
  await db.lorebooks.delete(id);
}

// ---- 预设 CRUD ----
export async function getPresets(): Promise<ChatPreset[]> {
  await initializeDatabase();
  return db.presets.orderBy('updatedAt').reverse().toArray();
}

export async function getPreset(id: string): Promise<ChatPreset | undefined> {
  await initializeDatabase();
  return db.presets.get(id);
}

export async function savePreset(preset: ChatPreset): Promise<void> {
  await initializeDatabase();
  preset.updatedAt = Date.now();
  await db.presets.put(preset);
}

export async function deletePreset(id: string): Promise<void> {
  await initializeDatabase();
  await db.presets.delete(id);
}

// ---- 设置 CRUD ----
const SETTINGS_KEY = 'app_settings';

export async function getSettings(): Promise<AppSettings | null> {
  await initializeDatabase();
  const s = await db.settings.get(SETTINGS_KEY);
  return s ?? null;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await initializeDatabase();
  await db.settings.put({ ...settings, id: SETTINGS_KEY } as AppSettings & { id: string });
}

// ---- 聊天 CRUD ----
export async function getChats(): Promise<ChatSession[]> {
  await initializeDatabase();
  return db.chats.orderBy('updatedAt').reverse().toArray();
}

export async function getChat(id: string): Promise<ChatSession | undefined> {
  await initializeDatabase();
  return db.chats.get(id);
}

export async function saveChat(chat: ChatSession): Promise<void> {
  await initializeDatabase();
  chat.updatedAt = Date.now();
  await db.chats.put(chat);
}

export async function deleteChat(id: string): Promise<void> {
  await initializeDatabase();
  await db.chats.delete(id);
}

// ---- 辅助：确保设置有默认值 ----
export async function ensureSettings(): Promise<AppSettings> {
  const existing = await getSettings();
  if (existing) return existing;
  const defaults = createDefaultSettings();
  await saveSettings(defaults);
  return defaults;
}
