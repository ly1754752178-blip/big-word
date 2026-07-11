import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import type {
  GameState,
  SidebarTab,
  NarrativeMessage,
  PhoneAppId,
  OverlayViewType,
  DateMark,
  InAppNotification,
} from '@/types';
import { mockGameState } from '@/data/mockData';
import { useLLM } from '@/hooks/useLLM';

interface GameContextValue {
  state: GameState;
  setActiveTab: (tab: SidebarTab) => void;
  setPreviewTab: (tab: SidebarTab) => void;
  setNarrativeInput: (text: string) => void;
  sendNarrativeMessage: (content: string) => void;
  appendNarrativeMessage: (msg: NarrativeMessage) => void;
  selectNarrativeOption: (optionId: string) => void;
  regenerateLastMessage: () => void;
  branchNarrativeTo: (messageId: string) => void;
  setMapZoom: (zoom: number) => void;
  setMapCenter: (center: { x: number; y: number }) => void;
  setSelectedMarker: (id: string | null) => void;
  openPhoneApp: (appId: PhoneAppId) => void;
  closePhoneApp: () => void;
  expandPhone: () => void;
  collapsePhone: () => void;
  openOverlayView: (type: OverlayViewType, payload?: Record<string, unknown>) => void;
  closeOverlayView: () => void;
  setDateMark: (date: string, mark: DateMark) => void;
  clearDateMark: (date: string) => void;
  addInAppNotification: (notification: Omit<InAppNotification, 'id'>) => void;
  removeInAppNotification: (id: string) => void;
  buyShopItem: (itemId: string) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

type Action =
  | { type: 'SET_ACTIVE_TAB'; payload: SidebarTab }
  | { type: 'SET_PREVIEW_TAB'; payload: SidebarTab }
  | { type: 'SET_NARRATIVE_INPUT'; payload: string }
  | { type: 'ADD_NARRATIVE_MESSAGE'; payload: NarrativeMessage }
  | { type: 'SET_NARRATIVE_GENERATING'; payload: boolean }
  | { type: 'SELECT_NARRATIVE_OPTION'; payload: string }
  | { type: 'BRANCH_NARRATIVE_TO'; payload: string }
  | { type: 'REGENERATE_LAST_MESSAGE' }
  | { type: 'SET_MAP_ZOOM'; payload: number }
  | { type: 'SET_MAP_CENTER'; payload: { x: number; y: number } }
  | { type: 'SET_SELECTED_MARKER'; payload: string | null }
  | { type: 'TOGGLE_PHONE' }
  | { type: 'EXPAND_PHONE' }
  | { type: 'COLLAPSE_PHONE' }
  | { type: 'OPEN_PHONE_APP'; payload: PhoneAppId }
  | { type: 'CLOSE_PHONE_APP' }
  | { type: 'OPEN_OVERLAY_VIEW'; payload: OverlayViewType; meta?: Record<string, unknown> }
  | { type: 'CLOSE_OVERLAY_VIEW' }
  | { type: 'SET_DATE_MARK'; payload: DateMark }
  | { type: 'CLEAR_DATE_MARK'; payload: string }
  | { type: 'ADD_IN_APP_NOTIFICATION'; payload: InAppNotification }
  | { type: 'REMOVE_IN_APP_NOTIFICATION'; payload: string }
  | { type: 'BUY_SHOP_ITEM'; payload: string };

const overlayTitles: Record<OverlayViewType, string> = {
  status: '个人状态',
  social: '社交关系',
  wealth: '财富资产',
  calendar: '日历事件',
  settings: '系统设置',
  skills: '技能',
  network: '关系网络',
  history: '叙事历史',
  calendarFull: '完整日历',
  characters: '角色图鉴',
  characterDetail: '角色详情',
  creativeWorkshop: '创作工坊',
  shop: '商店与衣柜',
  memories: '回忆相册',
  achievements: '成就',
};

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_PREVIEW_TAB':
      return { ...state, previewTab: action.payload };
    case 'SET_NARRATIVE_INPUT':
      return { ...state, narrative: { ...state.narrative, inputText: action.payload } };
    case 'ADD_NARRATIVE_MESSAGE': {
      const messages = [...state.narrative.messages, action.payload];
      return { ...state, narrative: { ...state.narrative, messages, inputText: '' } };
    }
    case 'SET_NARRATIVE_GENERATING':
      return { ...state, narrative: { ...state.narrative, isGenerating: action.payload } };
    case 'SELECT_NARRATIVE_OPTION': {
      const optionLabel =
        state.narrative.messages
          .flatMap((m) => m.options ?? [])
          .find((o) => o.id === action.payload)?.label ?? '';
      const userMsg: NarrativeMessage = {
        id: `msg-${Date.now()}`,
        type: 'system',
        content: `你选择了：${optionLabel}`,
        timestamp: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      return {
        ...state,
        narrative: {
          ...state.narrative,
          messages: [...state.narrative.messages, userMsg],
          inputText: '',
        },
      };
    }
    case 'BRANCH_NARRATIVE_TO': {
      const index = state.narrative.messages.findIndex((m) => m.id === action.payload);
      if (index < 0) return state;
      return {
        ...state,
        narrative: {
          ...state.narrative,
          messages: state.narrative.messages.slice(0, index + 1),
          branchRootId: action.payload,
          isGenerating: false,
        },
      };
    }
    case 'REGENERATE_LAST_MESSAGE': {
      const messages = state.narrative.messages.slice(0, -1);
      const regenerated: NarrativeMessage = {
        id: `msg-${Date.now()}`,
        type: 'scene',
        content:
          '（故事重新展开……你再次睁开眼睛，黄昏的光线似乎比刚才更柔和了一些。）',
        timestamp: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      return { ...state, narrative: { ...state.narrative, messages: [...messages, regenerated] } };
    }
    case 'SET_MAP_ZOOM':
      return { ...state, map: { ...state.map, zoom: action.payload } };
    case 'SET_MAP_CENTER':
      return { ...state, map: { ...state.map, center: action.payload } };
    case 'SET_SELECTED_MARKER':
      return { ...state, selectedMarkerId: action.payload };
    case 'TOGGLE_PHONE':
      return { ...state, phoneExpanded: !state.phoneExpanded };
    case 'EXPAND_PHONE':
      return { ...state, phoneExpanded: true };
    case 'COLLAPSE_PHONE':
      return { ...state, phoneExpanded: false, activePhoneApp: null };
    case 'OPEN_PHONE_APP':
      return { ...state, activePhoneApp: action.payload, phoneExpanded: true };
    case 'CLOSE_PHONE_APP':
      return { ...state, activePhoneApp: null };
    case 'OPEN_OVERLAY_VIEW':
      return {
        ...state,
        detailView: {
          type: action.payload,
          title: overlayTitles[action.payload],
          payload: action.meta,
        },
      };
    case 'CLOSE_OVERLAY_VIEW':
      return { ...state, detailView: null };
    case 'SET_DATE_MARK': {
      const date = action.payload.date;
      return {
        ...state,
        dateMarks: { ...state.dateMarks, [date]: action.payload },
      };
    }
    case 'CLEAR_DATE_MARK': {
      const date = action.payload;
      const next = { ...state.dateMarks };
      delete next[date];
      return { ...state, dateMarks: next };
    }
    case 'ADD_IN_APP_NOTIFICATION': {
      return {
        ...state,
        inAppNotifications: [...state.inAppNotifications, action.payload],
      };
    }
    case 'REMOVE_IN_APP_NOTIFICATION': {
      return {
        ...state,
        inAppNotifications: state.inAppNotifications.filter((n) => n.id !== action.payload),
      };
    }
    case 'BUY_SHOP_ITEM': {
      const item = state.shopItems.find((i) => i.id === action.payload);
      if (!item || state.finance.cash < item.price) return state;

      const existing = state.inventory.find((i) => i.id === item.id);
      const nextInventory = existing
        ? state.inventory.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...state.inventory, { ...item, quantity: 1 }];

      return {
        ...state,
        finance: { ...state.finance, cash: state.finance.cash - item.price },
        inventory: nextInventory,
      };
    }
    default:
      return state;
  }
}

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, mockGameState);
  const llm = useLLM();

  const timestamp = useCallback(
    () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    []
  );

  const generateNarrative = useCallback(
    async (input: string) => {
      dispatch({ type: 'SET_NARRATIVE_GENERATING', payload: true });
      const location = state.locations.find((l) => l.id === state.activeLocationId);
      try {
        const result = await llm.send(input, {
          locationName: location?.name || '未知地点',
          time: `${String(state.time.hour).padStart(2, '0')}:${String(state.time.minute).padStart(2, '0')}`,
          playerName: state.player.name,
          charactersPresent:
            location?.charactersPresent
              .map((id) => state.characters.find((c) => c.id === id)?.name)
              .filter((name): name is string => Boolean(name)) ?? [],
          history: state.narrative.messages.slice(-8).map((m) => m.content),
        });

        const now = timestamp();
        const baseId = Date.now();
        const messages: NarrativeMessage[] = [];
        if (result.scene) {
          messages.push({
            id: `msg-${baseId}-scene`,
            type: 'scene',
            content: result.scene,
            timestamp: now,
          });
        }
        result.dialogues.forEach((d, i) =>
          messages.push({
            id: `msg-${baseId}-dlg-${i}`,
            type: 'dialogue',
            content: d.content,
            speaker: d.speaker,
            timestamp: now,
          })
        );
        if (result.options.length > 0) {
          messages.push({
            id: `msg-${baseId}-opt`,
            type: 'option',
            content: '你要怎么做？',
            options: result.options,
            timestamp: now,
          });
        }
        messages.forEach((m) => dispatch({ type: 'ADD_NARRATIVE_MESSAGE', payload: m }));
      } finally {
        dispatch({ type: 'SET_NARRATIVE_GENERATING', payload: false });
      }
    },
    [state, llm, timestamp]
  );

  const appendNarrativeMessage = useCallback(
    (msg: NarrativeMessage) => {
      dispatch({ type: 'ADD_NARRATIVE_MESSAGE', payload: msg });
    },
    []
  );

  const sendNarrativeMessage = useCallback(
    async (content: string) => {
      const userMsg: NarrativeMessage = {
        id: `msg-${Date.now()}`,
        type: 'dialogue',
        content,
        timestamp: timestamp(),
      };
      dispatch({ type: 'ADD_NARRATIVE_MESSAGE', payload: userMsg });
      await generateNarrative(content);
    },
    [generateNarrative, timestamp]
  );

  const selectNarrativeOption = useCallback(
    (optionId: string) => {
      const label =
        state.narrative.messages
          .flatMap((m) => m.options ?? [])
          .find((o) => o.id === optionId)?.label ?? '';
      dispatch({ type: 'SELECT_NARRATIVE_OPTION', payload: optionId });
      generateNarrative(label);
    },
    [state.narrative.messages, generateNarrative]
  );

  const branchNarrativeTo = useCallback(
    (messageId: string) => dispatch({ type: 'BRANCH_NARRATIVE_TO', payload: messageId }),
    []
  );

  const regenerateLastMessage = useCallback(async () => {
    const messages = state.narrative.messages;
    const reverseIdx = [...messages].reverse().findIndex(
      (m) => m.type === 'dialogue' && !m.speaker
    );
    if (reverseIdx < 0) return;
    const idx = messages.length - 1 - reverseIdx;
    const input = messages[idx].content;
    dispatch({ type: 'BRANCH_NARRATIVE_TO', payload: messages[idx].id });
    await generateNarrative(input);
  }, [state.narrative.messages, generateNarrative]);

  const value: GameContextValue = {
    state,
    setActiveTab: (tab) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
    setPreviewTab: (tab) => dispatch({ type: 'SET_PREVIEW_TAB', payload: tab }),
    setNarrativeInput: (text) => dispatch({ type: 'SET_NARRATIVE_INPUT', payload: text }),
    sendNarrativeMessage,
    appendNarrativeMessage,
    selectNarrativeOption,
    regenerateLastMessage,
    branchNarrativeTo,
    setMapZoom: (zoom) => dispatch({ type: 'SET_MAP_ZOOM', payload: zoom }),
    setMapCenter: (center) => dispatch({ type: 'SET_MAP_CENTER', payload: center }),
    setSelectedMarker: (id) => dispatch({ type: 'SET_SELECTED_MARKER', payload: id }),
    openPhoneApp: (appId) => dispatch({ type: 'OPEN_PHONE_APP', payload: appId }),
    closePhoneApp: () => dispatch({ type: 'CLOSE_PHONE_APP' }),
    expandPhone: () => dispatch({ type: 'TOGGLE_PHONE' }),
    collapsePhone: () => dispatch({ type: 'COLLAPSE_PHONE' }),
    openOverlayView: (type, payload) => dispatch({ type: 'OPEN_OVERLAY_VIEW', payload: type, meta: payload }),
    closeOverlayView: () => dispatch({ type: 'CLOSE_OVERLAY_VIEW' }),
    setDateMark: (date, mark) => dispatch({ type: 'SET_DATE_MARK', payload: { ...mark, date } }),
    clearDateMark: (date) => dispatch({ type: 'CLEAR_DATE_MARK', payload: date }),
    addInAppNotification: (notification) => dispatch({
      type: 'ADD_IN_APP_NOTIFICATION',
      payload: { ...notification, id: `notif-${Date.now()}` },
    }),
    removeInAppNotification: (id) => dispatch({ type: 'REMOVE_IN_APP_NOTIFICATION', payload: id }),
    buyShopItem: (itemId) => dispatch({ type: 'BUY_SHOP_ITEM', payload: itemId }),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
