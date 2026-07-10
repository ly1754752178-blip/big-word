import { useGame } from '@/hooks/useGameState';
import { FullscreenOverlay } from '@/components/ui/FullscreenOverlay';
import { PersonalStatusOverlay } from './PersonalStatusOverlay';
import { TalentsSkillsOverlay } from './TalentsSkillsOverlay';
import { SocialRelationsOverlay } from './SocialRelationsOverlay';
import { WealthAssetsOverlay } from './WealthAssetsOverlay';
import { CalendarEventsOverlay } from './CalendarEventsOverlay';
import { SystemSettingsOverlay } from './SystemSettingsOverlay';
import { HistoryOverlay } from './HistoryOverlay';
import { NetworkOverlay } from './NetworkOverlay';
import { SkillTreeOverlay } from './SkillTreeOverlay';
import { CalendarOverlay } from './CalendarOverlay';
import { CharacterGalleryOverlay } from './CharacterGalleryOverlay';
import { CharacterDetailOverlay } from './CharacterDetailOverlay';
import { CreativeWorkshopOverlay } from './CreativeWorkshopOverlay';
import { ShopOverlay } from './ShopOverlay';
import { MemoriesOverlay } from './MemoriesOverlay';
import { AchievementsOverlay } from './AchievementsOverlay';

const accentMap: Record<import('@/types').OverlayViewType, NonNullable<React.ComponentProps<typeof FullscreenOverlay>['accent']>> = {
  status: 'status',
  talents: 'talent',
  social: 'social',
  wealth: 'wealth',
  calendar: 'calendar',
  settings: 'default',
  skills: 'talent',
  skillTree: 'talent',
  network: 'social',
  history: 'default',
  calendarFull: 'calendar',
  characters: 'talent',
  characterDetail: 'talent',
  creativeWorkshop: 'talent',
  shop: 'wealth',
  memories: 'calendar',
  achievements: 'wealth',
};

const talentsCategoryLabels: Record<string, string> = {
  daily: '日常技能',
  work: '工作技能',
  special: '特殊技能',
};

export function OverlayRenderer() {
  const { state, closeOverlayView } = useGame();
  const { detailView } = state;
  const isOpen = detailView !== null;
  const type = detailView?.type;

  // 天赋/技能分类界面使用分类名作为标题，而非固定的"天赋才能"
  let title = detailView?.title ?? '';
  if (type === 'talents' && detailView?.payload?.category) {
    title = talentsCategoryLabels[detailView.payload.category as string] ?? title;
  }

  return (
    <FullscreenOverlay
      title={title}
      isOpen={isOpen}
      onClose={closeOverlayView}
      accent={type ? accentMap[type] : 'default'}
    >
      {type === 'status' && <PersonalStatusOverlay />}
      {type === 'talents' && <TalentsSkillsOverlay />}
      {type === 'skillTree' && <SkillTreeOverlay />}
      {type === 'social' && <SocialRelationsOverlay />}
      {type === 'network' && <NetworkOverlay />}
      {type === 'wealth' && <WealthAssetsOverlay />}
      {type === 'calendar' && <CalendarEventsOverlay />}
      {type === 'settings' && <SystemSettingsOverlay />}
      {type === 'history' && <HistoryOverlay />}
      {type === 'calendarFull' && <CalendarOverlay />}
      {type === 'characters' && <CharacterGalleryOverlay />}
      {type === 'characterDetail' && <CharacterDetailOverlay />}
      {type === 'creativeWorkshop' && <CreativeWorkshopOverlay />}
      {type === 'shop' && <ShopOverlay />}
      {type === 'memories' && <MemoriesOverlay />}
      {type === 'achievements' && <AchievementsOverlay />}
    </FullscreenOverlay>
  );
}
