/**
 * st-bridge — 将 SillyTavern 聊天操作暴露给 UI 组件
 * TavernLobby 挂载时注入引用；直接操作 IndexedDB
 */
import type { ChatSession } from '@/sillytavern';
import { saveChat as dbSaveChat } from '@/sillytavern';

let _chats: ChatSession[] = [];
let _activeChatId: string | null = null;

/** TavernLobby 挂载时调用，注入当前聊天列表与活跃 ID */
export function injectSTBridge(
  chats: ChatSession[],
  activeChatId: string | null,
) {
  _chats = chats;
  _activeChatId = activeChatId;
}

/** 无活跃聊天时返回 null */
function activeChat(): ChatSession | null {
  return _chats.find(c => c.id === _activeChatId) ?? null;
}

/** 保存进度：复制当前聊天写入 IndexedDB */
export async function duplicateActiveChat(): Promise<string> {
  const chat = activeChat();
  if (!chat) throw new Error('无活跃聊天');
  const clone: ChatSession = {
    ...chat,
    id: crypto.randomUUID(),
    name: `${chat.name}（副本）`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: chat.messages.map(m => ({ ...m, id: crypto.randomUUID() })),
  };
  await dbSaveChat(clone);
  // 同步更新引用
  _chats = [clone, ..._chats];
  return clone.name;
}

/** 导出存档：当前聊天 → JSON 字符串 */
export function exportActiveChat(): string | null {
  const chat = activeChat();
  if (!chat) return null;
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    chat: {
      name: chat.name,
      characterName: chat.characterName,
      userName: chat.userName,
      messages: chat.messages,
      variables: chat.variables,
    },
  }, null, 2);
}

/** 导入存档：JSON → 写入 IndexedDB */
export async function importChatFromJSON(json: string): Promise<string> {
  let data: any;
  try { data = JSON.parse(json); } catch { throw new Error('JSON 格式错误'); }
  if (!data?.chat?.messages) throw new Error('无效的存档文件');

  const c = data.chat;
  const newChat: ChatSession = {
    id: crypto.randomUUID(),
    name: c.name ?? '导入的对话',
    characterName: c.characterName ?? '',
    userName: c.userName ?? '玩家',
    messages: c.messages ?? [],
    variables: c.variables ?? {},
    presetId: null,
    lorebookIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await dbSaveChat(newChat);
  _chats = [newChat, ..._chats];
  return newChat.name;
}
