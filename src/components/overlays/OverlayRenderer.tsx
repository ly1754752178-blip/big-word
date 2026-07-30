import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGame } from '@/hooks/useGameState';
import { FullscreenOverlay } from '@/components/ui/FullscreenOverlay';
import type { SkillTree } from '@/types';
import { PersonalStatusOverlay } from './PersonalStatusOverlay';
import { SocialRelationsOverlay } from './SocialRelationsOverlay';
import { WealthAssetsOverlay } from './WealthAssetsOverlay';
import { CalendarEventsOverlay } from './CalendarEventsOverlay';
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
import { PropertyDetailOverlay } from './PropertyDetailOverlay';

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
  propertyDetail: 'wealth',
};

export function OverlayRenderer() {
  const { state, closeOverlayView } = useGame();
  const { detailView } = state;
  const isOpen = detailView !== null;
  const type = detailView?.type;

  // 技能树需要在弹窗标题栏统一控制返回，因此把选中状态提升到本层
  const [selectedSkill, setSelectedSkill] = useState<SkillTree | null>(null);

  // 全部使用奶油卡片模式（统一暖色标准）
  const seamless = false;

  const skillsHeaderLeft = selectedSkill ? (
    <button
      type="button"
      onClick={() => setSelectedSkill(null)}
      className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
      aria-label="返回"
    >
      <ArrowLeft className="w-5 h-5 text-slate-500" />
    </button>
  ) : null;

  return (
    <FullscreenOverlay
      title={detailView?.title ?? ''}
      isOpen={isOpen}
      onClose={() => { setSelectedSkill(null); closeOverlayView(); }}
      accent={type ? accentMap[type] : 'default'}
      seamless={seamless}
      headerLeft={type === 'skills' ? skillsHeaderLeft : undefined}
    >
      {type === 'status' && <PersonalStatusOverlay />}
      {type === 'skills' && (
        <SkillsOverlay selectedSkill={selectedSkill} onSelectSkill={setSelectedSkill} />
      )}
      {type === 'social' && <SocialRelationsOverlay />}
      {type === 'network' && <NetworkOverlay />}
      {type === 'wealth' && <WealthAssetsOverlay />}
      {type === 'calendar' && <CalendarEventsOverlay />}
      {type === 'history' && <HistoryOverlay />}
      {type === 'calendarFull' && <CalendarOverlay />}
      {type === 'characters' && <CharacterGalleryOverlay />}
      {type === 'characterDetail' && <CharacterDetailOverlay />}
      {type === 'creativeWorkshop' && <CreativeWorkshopOverlay />}
      {type === 'shop' && <ShopOverlay />}
      {type === 'memories' && <MemoriesOverlay />}
      {type === 'achievements' && <AchievementsOverlay />}
      {type === 'propertyDetail' && <PropertyDetailOverlay />}
    </FullscreenOverlay>
  );
}
