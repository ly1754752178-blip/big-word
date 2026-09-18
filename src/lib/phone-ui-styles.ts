import type { PhoneUiStyleId } from '@/types';

/** 手机 UI 风格设计令牌（仅作用于顶部状态栏 + 系统设置界面 + 播放列表弹窗） */
export interface PhoneUiStyle {
  id: PhoneUiStyleId;
  name: string;
  desc: string;
  /** 顶部状态栏底色 */
  statusBarBg: string;
  /** 顶部状态栏文字/图标颜色 */
  statusBarText: string;
  /** 无壁纸时的屏幕兜底底色 */
  screenBg: string;
  /** 设置页面底色 */
  settingsBg: string;
  /** 卡片底色 */
  cardBg: string;
  /** 卡片描边（强化卡片边界） */
  cardBorder: string;
  /** 行分隔线 */
  divider: string;
  /** 主文字（行标题/页面标题） */
  textPrimary: string;
  /** 次要文字（行详情/占位符） */
  textSecondary: string;
  /** 分组小标题 */
  sectionLabel: string;
  /** 行图标颜色 */
  icon: string;
  /** 右箭头颜色 */
  chevron: string;
  /** 强调色（开关、选中描边、按钮） */
  accent: string;
  /** 强调色浅底（选中/高亮背景） */
  accentSoft: string;
  /** 中性悬停底色 */
  hoverBg: string;
  /** 返回/关闭按钮底色 */
  backBtnBg: string;
  /** 返回按钮图标色 */
  backBtnIcon: string;
  /** 开关关闭态底色 */
  toggleOff: string;
  /** 删除/危险色 */
  danger: string;
}

export const PHONE_UI_STYLES: PhoneUiStyle[] = [
  {
    id: 'classic',
    name: '经典浅色',
    desc: 'iOS 设置风，白卡灰底清爽',
    statusBarBg: '#F2F2F7',
    statusBarText: '#1C1C1E',
    screenBg: '#F2F2F7',
    settingsBg: '#F2F2F7',
    cardBg: '#FFFFFF',
    cardBorder: '#E5E5EA',
    divider: '#C7C7CC',
    textPrimary: '#1C1C1E',
    textSecondary: '#6E6E73',
    sectionLabel: '#6E6E73',
    icon: '#6E6E73',
    chevron: '#C7C7CC',
    accent: '#007AFF',
    accentSoft: 'rgba(0,122,255,0.12)',
    hoverBg: 'rgba(0,0,0,0.045)',
    backBtnBg: 'rgba(0,0,0,0.06)',
    backBtnIcon: '#1C1C1E',
    toggleOff: '#C7C7CC',
    danger: '#FF3B30',
  },
  {
    id: 'dark',
    name: '深夜深色',
    desc: 'iOS 深色，纯黑护眼沉浸',
    statusBarBg: '#1C1C1E',
    statusBarText: '#FFFFFF',
    screenBg: '#000000',
    settingsBg: '#000000',
    cardBg: '#1C1C1E',
    cardBorder: '#2C2C2E',
    divider: '#38383A',
    textPrimary: '#FFFFFF',
    textSecondary: '#AEAEB2',
    sectionLabel: '#AEAEB2',
    icon: '#AEAEB2',
    chevron: '#48484A',
    accent: '#0A84FF',
    accentSoft: 'rgba(10,132,255,0.16)',
    hoverBg: 'rgba(255,255,255,0.07)',
    backBtnBg: 'rgba(255,255,255,0.12)',
    backBtnIcon: '#FFFFFF',
    toggleOff: '#39393D',
    danger: '#FF453A',
  },
  {
    id: 'sakura',
    name: '樱花粉',
    desc: '樱花玫粉，柔和分明',
    statusBarBg: '#FCE4EC',
    statusBarText: '#6E1F35',
    screenBg: '#FDF2F6',
    settingsBg: '#FBEAF0',
    cardBg: '#FFFFFF',
    cardBorder: '#F5C6D6',
    divider: '#F0B9CC',
    textPrimary: '#43141F',
    textSecondary: '#9C5567',
    sectionLabel: '#B06A7E',
    icon: '#C25C7C',
    chevron: '#E7A9BC',
    accent: '#E0245E',
    accentSoft: 'rgba(224,36,94,0.12)',
    hoverBg: 'rgba(224,36,94,0.06)',
    backBtnBg: 'rgba(224,36,94,0.10)',
    backBtnIcon: '#6E1F35',
    toggleOff: '#F3C7D5',
    danger: '#D11A46',
  },
  {
    id: 'mint',
    name: '薄荷清新',
    desc: '薄荷青绿，清爽自然',
    statusBarBg: '#D7F2E8',
    statusBarText: '#0A3A2C',
    screenBg: '#F0FAF6',
    settingsBg: '#E7F6F0',
    cardBg: '#FFFFFF',
    cardBorder: '#C6E8DB',
    divider: '#B5E0D0',
    textPrimary: '#0E3A2C',
    textSecondary: '#4E7A6A',
    sectionLabel: '#5F8B7C',
    icon: '#2E8B72',
    chevron: '#A9D8C7',
    accent: '#0D9488',
    accentSoft: 'rgba(13,148,136,0.12)',
    hoverBg: 'rgba(13,148,136,0.06)',
    backBtnBg: 'rgba(13,148,136,0.10)',
    backBtnIcon: '#0A3A2C',
    toggleOff: '#C6E8DB',
    danger: '#E11D48',
  },
  {
    id: 'neon',
    name: '赛博霓虹',
    desc: '紫青霓虹，未来科幻',
    statusBarBg: '#0B0B1A',
    statusBarText: '#22D3EE',
    screenBg: '#07070F',
    settingsBg: '#0A0A16',
    cardBg: '#15152B',
    cardBorder: '#2A2A4A',
    divider: '#2A2A4A',
    textPrimary: '#EDEFFC',
    textSecondary: '#9BA3C7',
    sectionLabel: '#7C8BD4',
    icon: '#A5B4FC',
    chevron: '#3F3F66',
    accent: '#A855F7',
    accentSoft: 'rgba(168,85,247,0.16)',
    hoverBg: 'rgba(168,85,247,0.10)',
    backBtnBg: 'rgba(168,85,247,0.14)',
    backBtnIcon: '#C4B5FD',
    toggleOff: '#2E2E4D',
    danger: '#FB7185',
  },
];

export const DEFAULT_UI_STYLE: PhoneUiStyleId = 'classic';

export function getPhoneUiStyle(id: PhoneUiStyleId): PhoneUiStyle {
  return PHONE_UI_STYLES.find((s) => s.id === id) ?? PHONE_UI_STYLES[0];
}
