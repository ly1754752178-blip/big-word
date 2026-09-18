export type SkyType = 'sunny' | 'cloudy' | 'sunset' | 'night' | 'rain';
export type SidebarTab = 'status' | 'talents' | 'social' | 'wealth' | 'calendar' | 'settings';
export type SkillCategory = 'daily' | 'work' | 'special';
export type FinanceTab = 'expenses' | 'virtual' | 'fixed';
export type CalendarTab = 'calendar' | 'world' | 'nearby';
export type PhoneAppId =
  | 'line'
  | 'x'
  | 'instagram'
  | 'paypay'
  | 'google-maps'
  | 'yahoo-japan'
  | 'timetree'
  | 'gmail'
  | 'settings'
  | 'youtube'
  | 'tiktok';

/** 手机 UI 风格（五种预设，仅作用于顶部状态栏 + 系统设置界面） */
export type PhoneUiStyleId = 'classic' | 'dark' | 'sakura' | 'mint' | 'neon';

/** 当前壁纸来源：默认（数字图随机）/ 内置（非数字图手动选）/ 自定义（玩家导入） */
export type WallpaperKind = 'default' | 'builtin' | 'custom';

/** 玩家导入的自定义壁纸（存于 IndexedDB，blobUrl 为会话级对象 URL） */
export interface CustomWallpaper {
  id: string;
  fileName: string;
  mimeType: string;
  createdAt: number;
  blobUrl: string;
}

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

export interface CategoryExp {
  exp: number;
  maxExp: number;
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

/** 真实地理坐标 */
export interface LatLon {
  lat: number;
  lon: number;
}

/** 玩家选定的目的地（含反查出的地名） */
export interface Destination extends LatLon {
  name: string;
}

/** 出行方式（transit=电车） */
export type TravelMode = 'walking' | 'driving' | 'cycling' | 'transit';

/** 路线中的一段（步行/驾车/骑行/电车） */
export interface RouteLeg {
  mode: 'walking' | 'driving' | 'cycling' | 'train';
  fromName: string;
  toName: string;
  /** 电车线路名（仅 train 腿） */
  line?: string;
  distanceMeters: number;
  durationSeconds: number;
}

/** 路线结果 */
export interface RouteResult {
  mode: TravelMode;
  distanceMeters: number;
  durationSeconds: number;
  /** GeoJSON LineString 坐标（[lon, lat][]），供地图画线 */
  geometry: [number, number][];
  legs: RouteLeg[];
  /** 人类可读摘要，供 UI 与 LLM 使用 */
  summary: string;
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

/** 桌面上的单个 APP 项 */
export type PhoneHomeApp = { type: 'app'; appId: PhoneAppId };

/** 桌面上的 APP 文件夹 */
export interface PhoneHomeFolder {
  type: 'folder';
  id: string;
  name: string;
  appIds: PhoneAppId[];
}

/** 桌面网格中的每一项，可能是单个 APP 或文件夹 */
export type PhoneHomeItem = PhoneHomeApp | PhoneHomeFolder;

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
  /** 分类泛用经验值：满后可转换为该分类下任意技能树的技能点 */
  categoryExp: Record<SkillCategory, CategoryExp>;
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
  phoneHomeLayout: PhoneHomeItem[];
  /** 无障碍模式：切换后 APP 名称显示为中文 */
  accessibilityMode: boolean;
  /** 当前手机 UI 风格 */
  phoneUiStyle: PhoneUiStyleId;
  /** 当前壁纸来源 */
  wallpaperKind: WallpaperKind;
  /** 壁纸键：builtin=文件名，custom=IndexedDB 记录 id，default 恒为空字符串 */
  wallpaperKey: string;
  /** 本次进入游戏随机抽到的默认壁纸文件名（会话级，不持久化） */
  rolledDefaultWallpaper: string | null;
  /** 玩家导入的自定义壁纸列表（含会话级 blobUrl） */
  customWallpapers: CustomWallpaper[];
  /** bizhi 目录：数字命名的默认壁纸文件名 */
  bizhiDefaults: string[];
  /** bizhi 目录：非数字命名的内置壁纸文件名 */
  bizhiBuiltins: string[];
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
  /** 玩家当前真实坐标 */
  playerPosition: LatLon;
  /** 玩家选定的目的地（未选定为 null） */
  destination: Destination | null;
  /** 当前已计算的路线（未计算为 null） */
  route: RouteResult | null;
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
