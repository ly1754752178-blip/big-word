export type SkyType = 'sunny' | 'cloudy' | 'sunset' | 'night' | 'rain';
export type SidebarTab = 'status' | 'talents' | 'social' | 'wealth' | 'calendar' | 'settings';
export type SkillCategory = 'daily' | 'work' | 'special';
export type FinanceTab = 'expenses' | 'virtual' | 'fixed';
export type CalendarTab = 'calendar' | 'world' | 'nearby';
export type PhoneAppId = 'news' | 'schedule' | 'messages' | 'travel' | 'mail' | 'gallery';

/** 全屏浮层视图类型：左侧六个模块 + 技能树/关系网/叙事历史 */
export type OverlayViewType =
  | SidebarTab
  | 'skillTree'
  | 'network'
  | 'history'
  | 'calendarFull';

/** 保留旧名以兼容历史代码，语义上等同于 OverlayViewType */
export type DetailViewType = OverlayViewType;

export interface GameDate {
  year: number;
  month: number;
  day: number;
  weekday: string;
  weekdayCn: string;
}

export interface GameTime {
  hour: number;
  minute: number;
  sky: SkyType;
}

export interface Festival {
  name: string;
  icon: string;
  description?: string;
}

export interface PlayerStatus {
  stamina: number;
  mental: number;
  health: number;
}

export interface PlayerBodyState {
  label: string;
  fatigue: number;
  mood: string;
  conditions: string[];
  description: string;
  height: number;
  weight: number;
  ageStage: string;
  physiological: string[];
  mental: string[];
}

export interface Player {
  name: string;
  avatar: string;
  age: number;
  gender: string;
  birthday: string;
  nationality: string;
  householdRegistration: string;
  nativeLanguage: string;
  socialIdentity: string;
  familyMembers: string;
  address: string;
  socialEvaluation: string;
  certificates: string[];
  awards: string[];
  status: PlayerStatus;
  bodyState: PlayerBodyState;
  info: {
    birth: string;
    origin: string;
    household: string;
  };
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  icon: string;
  /** 父节点 id 列表，用于绘制真正的分支树 */
  parentIds?: string[];
  /** 节点在技能树画布中的相对坐标（百分比 0–100） */
  position?: { x: number; y: number };
}

export interface SkillTree {
  id: string;
  name: string;
  icon: string;
  category: SkillCategory;
  level: number;
  maxLevel: number;
  exp: number;
  maxExp: number;
  skillPoints: number;
  nodes: SkillNode[];
}

export interface Relation {
  id: string;
  name: string;
  group: string;
  affinity: number;
  avatar: string;
  title: string;
  description: string;
}

export interface NetworkNode {
  id: string;
  relationId: string;
  x: number;
  y: number;
  angle: number;
  distance: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  icon: string;
  description: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'personal' | 'world' | 'nearby';
  description: string;
}

/** 玩家在日历上自定义的标记 */
export interface DateMark {
  date: string;
  note?: string;
  mark?: 'important' | 'anniversary' | 'sad' | 'custom';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'system' | 'social' | 'event';
}

export interface MapMarker {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'location' | 'event' | 'npc';
  description: string;
}

export interface Region {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface PhoneApp {
  id: PhoneAppId;
  name: string;
  icon: string;
  color: string;
  badge?: number;
}

/** 叙事消息严格限定为旁白/环境描写与角色对话两种 */
export interface NarrativeMessage {
  id: string;
  type: 'scene' | 'dialogue';
  speaker?: string;
  avatar?: string;
  content: string;
  timestamp: string;
}

export interface DetailViewState {
  type: OverlayViewType;
  title: string;
  /** 技能树/关系网等需要额外上下文时可携带 payload */
  payload?: Record<string, unknown>;
}

export interface GameState {
  date: GameDate;
  time: GameTime;
  festival: Festival | null;
  player: Player;
  talents: Talent[];
  skills: {
    daily: SkillTree[];
    work: SkillTree[];
    special: SkillTree[];
  };
  relationships: {
    list: Relation[];
    network: NetworkNode[];
  };
  finance: {
    cash: number;
    expenses: Transaction[];
    virtualAssets: Asset[];
    fixedAssets: Asset[];
  };
  calendar: {
    calendarEvents: CalendarEvent[];
    worldEvents: CalendarEvent[];
    nearbyEvents: CalendarEvent[];
  };
  notifications: Notification[];
  phoneApps: PhoneApp[];
  map: {
    center: { x: number; y: number };
    zoom: number;
    markers: MapMarker[];
    regions: Region[];
  };
  narrative: {
    messages: NarrativeMessage[];
    inputText: string;
  };
  activeTab: SidebarTab;
  previewTab: SidebarTab;
  phoneExpanded: boolean;
  activePhoneApp: PhoneAppId | null;
  detailView: DetailViewState | null;
  selectedMarkerId: string | null;
  /** 玩家自定义日历标记，key 为 YYYY-MM-DD */
  dateMarks: Record<string, DateMark>;
}
