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

const accentMap: Record<import('@/types').OverlayViewType, NonNullable<React.ComponentProps<typeof FullscreenOverlay>['accent']>> = {
  status: 'status',
  talents: 'talent',
  social: 'social',
  wealth: 'wealth',
  calendar: 'calendar',
  settings: 'default',
  skillTree: 'talent',
  network: 'social',
  history: 'default',
  calendarFull: 'calendar',
};

export function OverlayRenderer() {
  const { state, closeOverlayView } = useGame();
  const { detailView } = state;
  const isOpen = detailView !== null;
  const type = detailView?.type;
  const title = detailView?.title ?? '';

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
    </FullscreenOverlay>
  );
}
