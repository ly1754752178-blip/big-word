import { useGame } from '@/hooks/useGameState';
import { FullscreenOverlay } from '@/components/ui/FullscreenOverlay';
import { PersonalStatusOverlay } from './PersonalStatusOverlay';
import { SocialRelationsOverlay } from './SocialRelationsOverlay';
import { WealthAssetsOverlay } from './WealthAssetsOverlay';
import { CalendarEventsOverlay } from './CalendarEventsOverlay';
import { SystemSettingsOverlay } from './SystemSettingsOverlay';
import { HistoryOverlay } from './HistoryOverlay';
import { NetworkOverlay } from './NetworkOverlay';
import { SkillsOverlay } from './SkillsOverlay';
import { CalendarOverlay } from './CalendarOverlay';
import { CharacterGalleryOverlay } from './CharacterGalleryOverlay';
import { CharacterDetailOverlay } from './CharacterDetailOverlay';
import { CreativeWorkshopOverlay } from './CreativeWorkshopOverlay';
import { ShopOverlay } from './ShopOverlay';
import { MemoriesOverlay } from './MemoriesOverlay';
import { AchievementsOverlay } from './AchievementsOverlay';

const accentMap: Record<import('@/types').OverlayViewType, NonNullable<React.ComponentProps<typeof FullscreenOverlay>['accent']>> = {
  status: 'status',
  social: 'social',
  wealth: 'wealth',
  calendar: 'calendar',
  settings: 'default',
  skills: 'talent',
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

export function OverlayRenderer() {
  const { state, closeOverlayView } = useGame();
  const { detailView } = state;
  const isOpen = detailView !== null;
  const type = detailView?.type;

  return (
    <FullscreenOverlay
      title={detailView?.title ?? ''}
      isOpen={isOpen}
      onClose={closeOverlayView}
      accent={type ? accentMap[type] : 'default'}
      seamless={type === 'skills'}
    >
      {type === 'status' && <PersonalStatusOverlay />}
      {type === 'skills' && <SkillsOverlay />}
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
