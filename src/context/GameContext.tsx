import { createContext, useContext, useReducer, ReactNode } from 'react';
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

interface GameContextValue {
  state: GameState;
  setActiveTab: (tab: SidebarTab) => void;
  setPreviewTab: (tab: SidebarTab) => void;
  setNarrativeInput: (text: string) => void;
  sendNarrativeMessage: (content: string) => void;
  regenerateLastMessage: () => void;
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
  | { type: 'REGENERATE_LAST_MESSAGE' }
  | { type: 'SET_MAP_ZOOM'; payload: number }
  | { type: 'SET_MAP_CENTER'; payload: { x: number; y: number } }
  | { type: 'SET_SELECTED_MARKER'; payload: string | null }
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
  talents: '天赋才能',
  social: '社交关系',
  wealth: '财富资产',
  calendar: '日历事件',
  settings: '系统设置',
  skillTree: '技能树',
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

  const value: GameContextValue = {
    state,
    setActiveTab: (tab) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
    setPreviewTab: (tab) => dispatch({ type: 'SET_PREVIEW_TAB', payload: tab }),
    setNarrativeInput: (text) => dispatch({ type: 'SET_NARRATIVE_INPUT', payload: text }),
    sendNarrativeMessage: (content) => {
      const message: NarrativeMessage = {
        id: `msg-${Date.now()}`,
        type: 'dialogue',
        content,
        timestamp: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      dispatch({ type: 'ADD_NARRATIVE_MESSAGE', payload: message });
    },
    regenerateLastMessage: () => dispatch({ type: 'REGENERATE_LAST_MESSAGE' }),
    setMapZoom: (zoom) => dispatch({ type: 'SET_MAP_ZOOM', payload: zoom }),
    setMapCenter: (center) => dispatch({ type: 'SET_MAP_CENTER', payload: center }),
    setSelectedMarker: (id) => dispatch({ type: 'SET_SELECTED_MARKER', payload: id }),
    openPhoneApp: (appId) => dispatch({ type: 'OPEN_PHONE_APP', payload: appId }),
    closePhoneApp: () => dispatch({ type: 'CLOSE_PHONE_APP' }),
    expandPhone: () => dispatch({ type: 'EXPAND_PHONE' }),
    collapsePhone: () => dispatch({ type: 'COLLAPSE_PHONE' }),
    openOverlayView: (type, payload) =>
      dispatch({ type: 'OPEN_OVERLAY_VIEW', payload: type, meta: payload }),
    closeOverlayView: () => dispatch({ type: 'CLOSE_OVERLAY_VIEW' }),
    setDateMark: (date, mark) =>
      dispatch({ type: 'SET_DATE_MARK', payload: { ...mark, date } }),
    clearDateMark: (date) => dispatch({ type: 'CLEAR_DATE_MARK', payload: date }),
    addInAppNotification: (notification) =>
      dispatch({
        type: 'ADD_IN_APP_NOTIFICATION',
        payload: { ...notification, id: `notif-${Date.now()}` },
      }),
    removeInAppNotification: (id) =>
      dispatch({ type: 'REMOVE_IN_APP_NOTIFICATION', payload: id }),
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
