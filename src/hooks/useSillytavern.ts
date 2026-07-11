// ============================================================
// useSillytavern — 主状态管理 Hook
// 管理世界书、预设、设置、聊天会话的全部状态
// ============================================================
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  // 数据库
  initializeDatabase,
  getLorebooks,
  saveLorebook as dbSaveLorebook,
  deleteLorebook as dbDeleteLorebook,
  getPresets,
  savePreset as dbSavePreset,
  deletePreset as dbDeletePreset,
  getSettings,
  saveSettings as dbSaveSettings,
  getChats,
  saveChat as dbSaveChat,
  deleteChat as dbDeleteChat,
  ensureSettings,
  // 变量
  extractVariables,
  mergeVariables,
  // 路由
  routeApiCall,
  // 类型
  USER_ROLE,
  createDefaultSettings,
  type Lorebook,
  type ChatPreset,
  type AppSettings,
  type ChatSession,
  type ChatMessage,
  type StreamParseResult,
} from '../sillytavern';

// ---- Hook 返回类型 ----
export interface UseSillytavernReturn {
  // 数据
  lorebooks: Lorebook[];
  presets: ChatPreset[];
  settings: AppSettings | null;
  chats: ChatSession[];
  activeChatId: string | null;
  activeChat: ChatSession | null;
  activeLorebookIds: string[];
  isSending: boolean;
  isLoading: boolean;

  // 流式解析
  streamResult: StreamParseResult | null;

  // 世界书操作
  toggleLorebook: (id: string) => Promise<void>;
  addLorebook: (book: Lorebook) => Promise<void>;
  removeLorebook: (id: string) => Promise<void>;
  updateLorebook: (book: Lorebook) => Promise<void>;

  // 预设操作
  addPreset: (preset: ChatPreset) => Promise<void>;
  removePreset: (id: string) => Promise<void>;
  updatePreset: (preset: ChatPreset) => Promise<void>;

  // 设置操作
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;

  // 聊天操作
  createChat: (name?: string) => Promise<string>;
  loadChat: (id: string) => void;
  removeChat: (id: string) => Promise<void>;

  // 消息操作
  sendMessage: (content: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessagesFrom: (messageId: string) => Promise<void>;
  branchFromMessage: (messageId: string, name?: string) => Promise<string>;

  // 变量操作
  updateVariables: (updates: Record<string, string | number>) => Promise<void>;

  // 加载
  loadAll: () => Promise<void>;
}

// ---- Hook 实现 ----
export function useSillytavern(): UseSillytavernReturn {
  const [lorebooks, setLorebooks] = useState<Lorebook[]>([]);
  const [presets, setPresets] = useState<ChatPreset[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streamResult, setStreamResult] = useState<StreamParseResult | null>(null);

  // 使用 ref 跟踪最新值，避免闭包问题
  const settingsRef = useRef<AppSettings | null>(null);
  const chatsRef = useRef<ChatSession[]>([]);
  const activeChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    settingsRef.current = settings;
    chatsRef.current = chats;
    activeChatIdRef.current = activeChatId;
  });

  // ---- 数据加载 ----
  const loadAll = useCallback(async () => {
    setIsLoading(true);
    await initializeDatabase();
    const [l, p, s, c] = await Promise.all([
      getLorebooks(),
      getPresets(),
      getSettings(),
      getChats(),
    ]);
    setLorebooks(l);
    setPresets(p);
    setSettings(s);
    setChats(c);
    setIsLoading(false);
  }, []);

  // 初始加载
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---- 世界书 ----
  const toggleLorebook = useCallback(async (id: string) => {
    const current = settingsRef.current;
    if (!current) return;
    const newIds = current.activeLorebookIds.includes(id)
      ? current.activeLorebookIds.filter((i) => i !== id)
      : [...current.activeLorebookIds, id];
    const newSettings = { ...current, activeLorebookIds: newIds };
    await dbSaveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  const addLorebook = useCallback(async (book: Lorebook) => {
    await dbSaveLorebook(book);
    setLorebooks((prev) => [book, ...prev]);
  }, []);

  const removeLorebook = useCallback(async (id: string) => {
    await dbDeleteLorebook(id);
    setLorebooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const updateLorebook = useCallback(async (book: Lorebook) => {
    await dbSaveLorebook(book);
    setLorebooks((prev) => prev.map((b) => (b.id === book.id ? book : b)));
  }, []);

  // ---- 预设 ----
  const addPreset = useCallback(async (preset: ChatPreset) => {
    await dbSavePreset(preset);
    setPresets((prev) => [preset, ...prev]);
  }, []);

  const removePreset = useCallback(async (id: string) => {
    await dbDeletePreset(id);
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePreset = useCallback(async (preset: ChatPreset) => {
    await dbSavePreset(preset);
    setPresets((prev) => prev.map((p) => (p.id === preset.id ? preset : p)));
  }, []);

  // ---- 设置 ----
  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const current = settingsRef.current;
    if (!current) return;
    const newSettings = { ...current, ...updates };
    await dbSaveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  // ---- 聊天 ----
  const createChat = useCallback(async (name?: string) => {
    let s = settingsRef.current;
    if (!s) {
      // 自动初始化默认设置（首次使用）
      s = createDefaultSettings();
      await dbSaveSettings(s);
      setSettings(s);
    }
    const chatCount = chatsRef.current.filter(
      (c) => c.characterName === s.characterName,
    ).length;
    const chatName = name ?? `${s.characterName} - 新对话 ${chatCount + 1}`;
    const newChat: ChatSession = {
      id: crypto.randomUUID(),
      name: chatName,
      messages: [],
      characterName: s.characterName,
      userName: s.userName,
      presetId: s.activePresetId ?? presets[0]?.id ?? null,
      lorebookIds: [...s.activeLorebookIds],
      variables: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await dbSaveChat(newChat);
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat.id;
  }, [presets]);

  const loadChat = useCallback((id: string) => {
    setActiveChatId(id);
  }, []);

  const removeChat = useCallback(async (id: string) => {
    await dbDeleteChat(id);
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatIdRef.current === id) setActiveChatId(null);
  }, []);

  // ---- 变量 ----
  const updateVariables = useCallback(async (updates: Record<string, string | number>) => {
    const chat = chatsRef.current.find((c) => c.id === activeChatIdRef.current);
    if (!chat) return;
    const merged = mergeVariables(chat.variables, updates);
    const updatedChat = { ...chat, variables: merged, updatedAt: Date.now() };
    await dbSaveChat(updatedChat);
    setChats((prev) => prev.map((c) => (c.id === updatedChat.id ? updatedChat : c)));
  }, []);

  // ---- 发送消息 ----
  const sendMessage = useCallback(async (content: string) => {
    const s = settingsRef.current;
    const chatId = activeChatIdRef.current;
    const currentChat = chatsRef.current.find((c) => c.id === chatId);

    if (!s || !currentChat) {
      throw new Error('没有活跃聊天或设置未加载');
    }

    const activePreset = presets.find((p) => p.id === s.activePresetId) ?? presets[0];
    if (!activePreset) throw new Error('没有可用预设');

    setIsSending(true);
    setStreamResult(null);

    try {
      const activeBooks = lorebooks.filter((b) => s.activeLorebookIds.includes(b.id));
      const currentVariables = currentChat.variables ?? {};

      // 添加用户消息
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: USER_ROLE,
        content,
        timestamp: Date.now(),
        variables: { ...currentVariables },
      };

      const updatedMessages = [...currentChat.messages, userMessage];
      let updatedChat = { ...currentChat, messages: updatedMessages, updatedAt: Date.now() };

      // 调用 API 路由
      const { rawReply, sum: _sum, vars } = await routeApiCall(
        s,
        {
          userInput: content,
          history: updatedMessages,
          preset: activePreset,
          lorebooks: activeBooks,
          userName: s.userName,
          characterName: s.characterName,
          variables: currentVariables,
        },
        {
          onStreamChunk: (_chunk) => {
            // 流式更新可在这里处理
          },
        },
      );

      // 提取变量
      const { cleanedText: reply, updates: extractedVars } = extractVariables(rawReply);
      const nextVariables = mergeVariables(
        mergeVariables(currentVariables, extractedVars),
        vars,
      );

      // 添加助手消息
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
        variables: { ...nextVariables },
      };

      updatedChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        variables: nextVariables,
      };

      await dbSaveChat(updatedChat);
      setChats((prev) =>
        prev.map((c) => (c.id === updatedChat.id ? updatedChat : c)),
      );
    } finally {
      setIsSending(false);
    }
  }, [lorebooks, presets]);

  // ---- 编辑消息 ----
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    const chat = chatsRef.current.find((c) => c.id === activeChatIdRef.current);
    if (!chat) return;
    const idx = chat.messages.findIndex((m) => m.id === messageId);
    if (idx === -1) return;
    if (chat.messages[idx].role !== USER_ROLE) return;

    const updatedChat = {
      ...chat,
      messages: chat.messages.slice(0, idx),
      variables: chat.messages[idx]?.variables ?? {},
      updatedAt: Date.now(),
    };
    await dbSaveChat(updatedChat);
    setChats((prev) => prev.map((c) => (c.id === updatedChat.id ? updatedChat : c)));

    // 重新发送
    await sendMessage(newContent);
  }, [sendMessage]);

  // ---- 删除后续消息 ----
  const deleteMessagesFrom = useCallback(async (messageId: string) => {
    const chat = chatsRef.current.find((c) => c.id === activeChatIdRef.current);
    if (!chat) return;
    const idx = chat.messages.findIndex((m) => m.id === messageId);
    if (idx === -1) return;

    const updatedChat = {
      ...chat,
      messages: chat.messages.slice(0, idx),
      variables: chat.messages[idx - 1]?.variables ?? {},
      updatedAt: Date.now(),
    };
    await dbSaveChat(updatedChat);
    setChats((prev) => prev.map((c) => (c.id === updatedChat.id ? updatedChat : c)));
  }, []);

  // ---- 分支对话 ----
  const branchFromMessage = useCallback(async (messageId: string, name?: string) => {
    const s = settingsRef.current;
    const chat = chatsRef.current.find((c) => c.id === activeChatIdRef.current);
    if (!chat || !s) throw new Error('没有活跃聊天');

    const idx = chat.messages.findIndex((m) => m.id === messageId);
    if (idx === -1) throw new Error('消息未找到');

    const branchCount = chatsRef.current.filter(
      (c) => c.characterName === s.characterName,
    ).length;
    const branchName = name ?? `${s.characterName} - 分支 ${branchCount + 1}`;

    const truncatedMessages = chat.messages.slice(0, idx + 1);
    const newChat = {
      id: crypto.randomUUID(),
      name: branchName,
      messages: truncatedMessages,
      characterName: chat.characterName,
      userName: chat.userName,
      presetId: s.activePresetId ?? presets[0]?.id ?? null,
      lorebookIds: [...s.activeLorebookIds],
      variables: chat.messages[idx].variables,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await dbSaveChat(newChat);
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat.id;
  }, [presets]);

  // ---- 计算属性 ----
  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;
  const activeLorebookIds = settings?.activeLorebookIds ?? [];

  return {
    lorebooks,
    presets,
    settings,
    chats,
    activeChatId,
    activeChat,
    activeLorebookIds,
    isSending,
    isLoading,
    streamResult,
    toggleLorebook,
    addLorebook,
    removeLorebook,
    updateLorebook,
    addPreset,
    removePreset,
    updatePreset,
    updateSettings,
    createChat,
    loadChat,
    removeChat,
    sendMessage,
    editMessage,
    deleteMessagesFrom,
    branchFromMessage,
    updateVariables,
    loadAll,
  };
}
