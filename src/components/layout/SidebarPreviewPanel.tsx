import { useGame } from '@/hooks/useGameState';
import type { SidebarTab } from '@/types';
import { StatusPreview } from './previews/StatusPreview';
import { TalentsPreview } from './previews/TalentsPreview';
import { SocialPreview } from './previews/SocialPreview';
import { WealthPreview } from './previews/WealthPreview';
import { CalendarPreview } from './previews/CalendarPreview';
import { SettingsPreview } from './previews/SettingsPreview';

const previewMap: Record<SidebarTab, React.FC> = {
  status: StatusPreview,
  talents: TalentsPreview,
  social: SocialPreview,
  wealth: WealthPreview,
  calendar: CalendarPreview,
  settings: SettingsPreview,
};

export function SidebarPreviewPanel() {
  const { state } = useGame();
  const Preview = previewMap[state.previewTab];

  return (
    <section
      id="sidebar-preview-panel"
      className="w-[260px] h-full bg-[#F5F0EA] border-r border-[#E8DFD3] overflow-y-auto px-2.5 py-3"
    >
      <Preview />
    </section>
  );
}
