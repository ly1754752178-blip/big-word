export type SkyType = 'sunny' | 'cloudy' | 'sunset' | 'night' | 'rain';
export type SidebarTab = 'status' | 'talents' | 'social' | 'wealth' | 'calendar' | 'settings';
export type SkillCategory = 'daily' | 'work' | 'special';
export type FinanceTab = 'expenses' | 'virtual' | 'fixed';
export type CalendarTab = 'calendar' | 'world' | 'nearby';
export type PhoneAppId =
  | 'news'
  | 'schedule'
  | 'messages'
  | 'travel'
  | 'mail'
  | 'gallery'
  | 'chat'
  | 'sns'
  | 'wallet';

/** 全屏浮层视图类型：左侧六个模块 + 关系网/叙事历史 + 生活系统 */
export type OverlayViewType =
  | 'status'
  | 'skills'
  | 'social'
  | 'wealth'
  | 'calendar'
  | 'propertyDetail'
  | 'settings'
  | 'network'
  | 'history'
  | 'calendarFull'
  | 'characters'
  | 'characterDetail'
  | 'creativeWorkshop'
  | 'shop'
  | 'memories'
  | 'achievements';

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
  level?: number;
  effect?: string;
  acquiredAt?: string;
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
  /** 大技能节点：上限1级，可折叠/展开其子节点 */
  isMajor?: boolean;
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

export type AssetCategory = 'liquid' | 'realEstate' | 'movable' | 'financial' | 'business';

export interface Asset {
  id: string;
  name: string;
  value: number;
  icon: string;
  description: string;
  category?: AssetCategory;
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

export interface NarrativeOption {
  id: string;
  label: string;
  impact?: string;
}

export interface NarrativeMessage {
  id: string;
  type: 'scene' | 'dialogue' | 'option' | 'system';
  content: string;
  speaker?: string;
  speakerAvatar?: string;
  timestamp: string;
  options?: NarrativeOption[];
}

export interface Character {
  id: string;
  name: string;
  sourceWork: string;
  avatar: string;
  age: number;
  identity: string;
  school?: string;
  occupation?: string;
  address?: string;
  personality: string[];
  likes: string[];
  dislikes: string[];
  currentMood: string;
  currentLocationId: string;
  relationshipStage: 'stranger' | 'acquaintance' | 'friend' | 'close' | 'lover';
  affection: number;
  trust: number;
  lastInteractionAt: string;
  socialCircle: 'school' | 'work' | 'neighbor' | 'interest';
}

export interface Location {
  id: string;
  name: string;
  type: 'home' | 'school' | 'company' | 'shop' | 'restaurant' | 'park' | 'station' | 'other';
  description: string;
  image: string;
  coordinates: { x: number; y: number };
  charactersPresent: string[];
  eventsAvailable: string[];
}

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  locationId: string;
  type: 'class' | 'work' | 'appointment' | 'event' | 'deadline' | 'personal';
  description?: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  type: 'novel' | 'manga' | 'game' | 'video' | 'music';
  progress: number;
  maxProgress: number;
  deadline: string;
  memberIds: string[];
  tasks: { id: string; title: string; completed: boolean }[];
  inspiration: number;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'gift' | 'outfit' | 'furniture' | 'consumable' | 'book';
  price: number;
  effect: string;
  description: string;
  icon: string;
}

export interface InventoryItem extends ShopItem {
  quantity: number;
}

export interface Memory {
  id: string;
  title: string;
  date: string;
  description: string;
  image?: string;
  characterIds: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
  icon: string;
}

export interface ChatThread {
  id: string;
  characterId: string;
  messages: { id: string; role: 'user' | 'character'; content: string; timestamp: string }[];
}

export interface SNSPost {
  id: string;
  characterId: string;
  content: string;
  image?: string;
  likes: number;
  timestamp: string;
}

export interface InAppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
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
    /** 五类统合资产（流动资金/固定/动产/金融/经营） */
    assets: Asset[];
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
    isGenerating: boolean;
    branchRootId: string | null;
  };
  activeTab: SidebarTab;
  previewTab: SidebarTab;
  phoneExpanded: boolean;
  activePhoneApp: PhoneAppId | null;
  detailView: DetailViewState | null;
  selectedMarkerId: string | null;
  /** 玩家自定义日历标记，key 为 YYYY-MM-DD */
  dateMarks: Record<string, DateMark>;

  // Phase 2+ 新增数据层
  characters: Character[];
  locations: Location[];
  scheduleEvents: ScheduleEvent[];
  projects: Project[];
  shopItems: ShopItem[];
  inventory: InventoryItem[];
  memories: Memory[];
  achievements: Achievement[];
  chatThreads: ChatThread[];
  snsPosts: SNSPost[];
  activeCharacterId: string | null;
  activeLocationId: string;

  // 内部临时通知
  inAppNotifications: InAppNotification[];
}
