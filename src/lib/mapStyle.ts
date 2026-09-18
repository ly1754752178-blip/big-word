import type { StyleSpecification, ExpressionSpecification } from 'maplibre-gl';

// OpenMapTiles schema 的日本地图样式（配合 japan.pmtiles）
// 视觉基调：冷色「工具底图」风（近似百度地图）：道路白/黄/蓝分档、建筑浅灰+描边、
// 水系浅蓝、绿地浅绿、POI 用 emoji 分类标记。
const GLYPHS = 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf';

// 地图瓦片地址：本地默认 /japan.pmtiles；部署到对象存储时用 VITE_PMTILES_URL 指向远程 URL。
const PMTILES_URL = import.meta.env.VITE_PMTILES_URL || '/japan.pmtiles';

// —— 冷色底图配色 ——
const C = {
  background: '#EDEDED',
  water: '#9FC9F2',
  landcover: '#C6E3BC',
  landusePark: '#CBE6C0',
  landuseBuiltup: '#EDEBE5',
  boundaryMajor: '#A9A29A',
  boundaryMinor: '#BDB6AE',
  roadCasing: '#C4C2BE',
  motorway: '#6EA6DE', // 高速：蓝（一眼识别）
  trunk: '#F0C24E', // 主干/国道：黄
  primary: '#FFFFFF',
  secondary: '#FFFFFF',
  minorRoad: '#F5F5F5',
  rail: '#A9A9A9',
  transit: '#8FA9BE',
  building: '#DCD9D0',
  buildingOutline: '#B6B2A8',
  text: '#3B3B3B',
  textSub: '#6B6B6B',
  textFaint: '#7C7C7C',
  poiText: '#4A4A4A',
  textHalo: 'rgba(255,255,255,0.88)',
};

// 地名标注：优先简体中文（name:zh-Hans）→ 本地名 name（未转换的名字本就是简体）→ 通用中文（name:zh，多为繁体兜底）。
const NAME_FIELD: ExpressionSpecification = ['coalesce', ['get', 'name:zh-Hans'], ['get', 'name'], ['get', 'name:zh']];

// —— POI 分类 emoji（class 为主；subclass 用于铁路/商店等需要细分的场合）——
const CLASS_EMOJI: Record<string, string> = {
  // 餐饮
  restaurant: '🍽️',
  fast_food: '🍔',
  cafe: '☕',
  coffee_shop: '☕',
  bar: '🍺',
  pub: '🍺',
  biergarten: '🍺',
  nightclub: '🍸',
  ice_cream: '🍦',
  // 购物
  supermarket: '🛒',
  grocery: '🛒',
  convenience: '🏪',
  marketplace: '🛒',
  shop: '🛍️',
  department_store: '🏬',
  mall: '🏬',
  clothes: '👕',
  clothing_store: '👕',
  shoes: '👟',
  electronics: '📱',
  mobile_phone: '📱',
  books: '📚',
  bookstore: '📚',
  jewelry: '💍',
  florist: '💐',
  gift: '🎁',
  furniture: '🛋️',
  hardware: '🔧',
  pet: '🐾',
  car: '🚗',
  bicycle: '🚲',
  doityourself: '🔨',
  beauty: '💅',
  hairdresser: '💇',
  chemist: '💊',
  // 医疗
  pharmacy: '💊',
  hospital: '🏥',
  clinic: '🏥',
  doctors: '🩺',
  dentist: '🦷',
  veterinary: '🐾',
  // 教育
  school: '🏫',
  university: '🎓',
  college: '🎓',
  kindergarten: '🧸',
  library: '📚',
  // 文娱
  museum: '🏛️',
  art_gallery: '🎨',
  gallery: '🎨',
  theatre: '🎭',
  cinema: '🎬',
  arts_centre: '🎨',
  attraction: '🎡',
  theme_park: '🎢',
  zoo: '🦁',
  aquarium: '🐬',
  amusement_ride: '🎢',
  // 交通
  railway: '🚉',
  bus: '🚌',
  bus_station: '🚌',
  parking: '🅿️',
  bicycle_parking: '🅿️',
  bicycle_rental: '🚲',
  taxi: '🚕',
  fuel: '⛽',
  gas_station: '⛽',
  ferry_terminal: '⛴️',
  // 金融/服务
  bank: '🏦',
  atm: '🏧',
  post: '📮',
  post_office: '📮',
  // 住宿
  hotel: '🏨',
  motel: '🏨',
  hostel: '🛏️',
  guest_house: '🛏️',
  lodging: '🏨',
  // 办公
  office: '🏢',
  company: '🏢',
  // 公共/市政
  police: '👮',
  fire_station: '🚒',
  townhall: '🏛️',
  government: '🏛️',
  courthouse: '⚖️',
  embassy: '🏛️',
  prison: '⛓️',
  // 宗教
  place_of_worship: '⛪',
  // 其它
  cemetery: '🪦',
  grave_yard: '🪦',
  park: '🌳',
  playground: '🛝',
  pitch: '⚽',
  sports_centre: '⚽',
  stadium: '🏟️',
  golf_course: '⛳',
  swimming_pool: '🏊',
  fountain: '⛲',
  information: 'ℹ️',
  viewpoint: '🔭',
  picnic_site: '🧺',
  campsite: '⛺',
  caravan_site: '⛺',
  tower: '🗼',
  castle: '🏰',
  ruins: '🏛️',
  monument: '🏛️',
  memorial: '🪦',
  lighthouse: '🗼',
  entrance: '🚪',
  toilet: '🚻',
  drinking_water: '🚰',
  factory: '🏭',
  warehouse: '🏭',
  power: '⚡',
  substation: '⚡',
  recycling: '♻️',
  car_wash: '🚿',
  car_repair: '🔧',
  marina: '⛵',
};

// 需要按 OSM subclass 进一步细分的（class 常为「railway」「shop」等）
const SUBCLASS_EMOJI: Record<string, string> = {
  station: '🚉', // JR/火车站
  subway: '🚇', // 地铁
  tram_stop: '🚋', // 有轨电车
  light_rail: '🚈',
  monorail: '🚝',
  bakery: '🥐',
  butcher: '🥩',
  seafood: '🐟',
  greengrocer: '🥬',
  confectionery: '🍬',
  alcohol: '🍷',
  wine: '🍷',
  coffee: '☕',
  tea: '🍵',
  chocolate: '🍫',
  deli: '🥪',
  kiosk: '🛒',
  stationery: '✏️',
  optician: '👓',
  laundry: '🧺',
  travel_agency: '✈️',
  ticket: '🎫',
  toys: '🧸',
  video_games: '🎮',
  newsagent: '📰',
  garden_centre: '🪴',
  sports: '🏀',
  outdoor: '🏕️',
  copyshop: '🖨️',
};

const FALLBACK_EMOJI = '📍';

// 所有需要用到的唯一 emoji（供运行时渲染成图标）
export const POI_EMOJI_LIST: string[] = Array.from(
  new Set([...Object.values(CLASS_EMOJI), ...Object.values(SUBCLASS_EMOJI), FALLBACK_EMOJI]),
);

// 根据 class/subclass 返回对应 emoji（运行时选中 POI 后由前端直接算图标名）
export function poiEmoji(cls?: string, sub?: string): string {
  if (sub && SUBCLASS_EMOJI[sub]) return SUBCLASS_EMOJI[sub];
  if (cls && CLASS_EMOJI[cls]) return CLASS_EMOJI[cls];
  return FALLBACK_EMOJI;
}

export const JAPAN_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: 'japan',
  glyphs: GLYPHS,
  sources: {
    japan: {
      type: 'vector',
      // 直接用 tiles 数组（绕过 TileJSON 请求），让 MapLibre 直接按 z/x/y 取瓦片
      tiles: [`pmtiles://${PMTILES_URL}/{z}/{x}/{y}`],
      minzoom: 0,
      maxzoom: 14,
    },
  },
  layers: [
    // —— 背景 ——
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': C.background },
    },

    // —— 绿地/土地利用（先画，水与道路盖在上面）——
    {
      id: 'landcover',
      type: 'fill',
      source: 'japan',
      'source-layer': 'landcover',
      filter: ['in', ['get', 'class'], ['literal', ['wood', 'grass', 'forest']]],
      paint: { 'fill-color': C.landcover, 'fill-opacity': 0.7 },
    },
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'japan',
      'source-layer': 'landuse',
      filter: ['in', ['get', 'class'], ['literal', ['park', 'cemetery', 'school', 'hospital']]],
      paint: { 'fill-color': C.landusePark, 'fill-opacity': 0.7 },
    },
    {
      id: 'landuse-builtup',
      type: 'fill',
      source: 'japan',
      'source-layer': 'landuse',
      filter: ['in', ['get', 'class'], ['literal', ['residential', 'commercial', 'industrial']]],
      paint: { 'fill-color': C.landuseBuiltup, 'fill-opacity': 0.35 },
    },

    // —— 水域（盖在绿地之上）——
    {
      id: 'water',
      type: 'fill',
      source: 'japan',
      'source-layer': 'water',
      paint: { 'fill-color': C.water },
    },
    {
      id: 'waterway',
      type: 'line',
      source: 'japan',
      'source-layer': 'waterway',
      minzoom: 8,
      paint: { 'line-color': C.water, 'line-width': 0.8 },
    },

    // —— 行政边界（县/道 在低缩放可见）——
    {
      id: 'boundary-admin-2',
      type: 'line',
      source: 'japan',
      'source-layer': 'boundary',
      filter: ['all', ['==', ['get', 'admin_level'], 2], ['!', ['has', 'maritime']]],
      paint: { 'line-color': C.boundaryMajor, 'line-width': 1 },
    },
    {
      id: 'boundary-admin-4',
      type: 'line',
      source: 'japan',
      'source-layer': 'boundary',
      filter: ['all', ['==', ['get', 'admin_level'], 4], ['!', ['has', 'maritime']]],
      minzoom: 4,
      maxzoom: 11,
      paint: { 'line-color': C.boundaryMinor, 'line-width': 0.8, 'line-dasharray': [2, 2] },
    },

    // —— 建筑（2D 平面 + 描边；画在道路之下）——
    {
      id: 'building',
      type: 'fill',
      source: 'japan',
      'source-layer': 'building',
      minzoom: 13,
      paint: {
        'fill-color': C.building,
        'fill-opacity': 0.92,
        'fill-outline-color': C.buildingOutline,
      },
    },

    // —— 道路（城市视图，画在建筑之上）——
    {
      id: 'road-casing-major',
      type: 'line',
      source: 'japan',
      'source-layer': 'transportation',
      minzoom: 6,
      filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary']]],
      paint: { 'line-color': C.roadCasing, 'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.7, 14, 6.4] },
    },
    {
      id: 'road-major',
      type: 'line',
      source: 'japan',
      'source-layer': 'transportation',
      minzoom: 6,
      filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary']]],
      paint: {
        'line-color': ['match', ['get', 'class'], 'motorway', C.motorway, 'trunk', C.trunk, C.primary],
        'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.4, 14, 3.6],
      },
    },
    {
      id: 'road-secondary',
      type: 'line',
      source: 'japan',
      'source-layer': 'transportation',
      minzoom: 9,
      filter: ['in', ['get', 'class'], ['literal', ['secondary', 'tertiary']]],
      paint: {
        'line-color': C.secondary,
        'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.4, 14, 2.2],
      },
    },
    {
      id: 'road-minor',
      type: 'line',
      source: 'japan',
      'source-layer': 'transportation',
      minzoom: 12,
      filter: ['in', ['get', 'class'], ['literal', ['minor', 'service']]],
      paint: { 'line-color': C.minorRoad, 'line-width': 0.8 },
    },

    // —— 铁路 ——
    {
      id: 'rail',
      type: 'line',
      source: 'japan',
      'source-layer': 'transportation',
      minzoom: 6,
      filter: ['in', ['get', 'class'], ['literal', ['rail', 'transit']]],
      paint: {
        'line-color': ['match', ['get', 'class'], 'rail', C.rail, C.transit],
        'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.3, 14, 1.4],
        'line-dasharray': [1, 1.4],
      },
    },

    // —— 地名（县名在低缩放，城市/街区名在高缩放）——
    {
      id: 'place-state',
      type: 'symbol',
      source: 'japan',
      'source-layer': 'place',
      filter: ['==', ['get', 'class'], 'state'],
      minzoom: 4,
      maxzoom: 9,
      layout: {
        'text-field': NAME_FIELD,
        'text-font': ['Noto Sans Bold'],
        'text-size': 13,
        'text-letter-spacing': 0.08,
      },
      paint: {
        'text-color': '#555555',
        'text-halo-color': C.textHalo,
        'text-halo-width': 1.2,
      },
    },
    {
      id: 'place-city',
      type: 'symbol',
      source: 'japan',
      'source-layer': 'place',
      filter: ['in', ['get', 'class'], ['literal', ['city', 'town']]],
      minzoom: 7,
      maxzoom: 15,
      layout: {
        'text-field': NAME_FIELD,
        'text-font': ['Noto Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 7, 11, 14, 13],
      },
      paint: {
        'text-color': C.text,
        'text-halo-color': C.textHalo,
        'text-halo-width': 1.2,
      },
    },
    {
      id: 'place-neighbourhood',
      type: 'symbol',
      source: 'japan',
      'source-layer': 'place',
      filter: ['in', ['get', 'class'], ['literal', ['suburb', 'quarter', 'neighbourhood', 'village', 'hamlet']]],
      minzoom: 11,
      layout: {
        'text-field': NAME_FIELD,
        'text-font': ['Noto Sans Regular'],
        'text-size': 12,
      },
      paint: {
        'text-color': C.textSub,
        'text-halo-color': C.textHalo,
        'text-halo-width': 1.1,
      },
    },

    // —— 道路名（城市视图）——
    {
      id: 'road-name',
      type: 'symbol',
      source: 'japan',
      'source-layer': 'transportation_name',
      minzoom: 12,
      filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary']]],
      layout: {
        'text-field': NAME_FIELD,
        'text-font': ['Noto Sans Regular'],
        'text-size': 10,
        'symbol-placement': 'line',
        'text-rotation-alignment': 'map',
      },
      paint: {
        'text-color': C.textFaint,
        'text-halo-color': 'rgba(255,255,255,0.9)',
        'text-halo-width': 1.2,
      },
    },
  ],
};
