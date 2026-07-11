import { TopBar } from '@/components/layout/TopBar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { SidebarPreviewPanel } from '@/components/layout/SidebarPreviewPanel';
import { RightPanel } from '@/components/layout/RightPanel';
import { NarrativePanel } from '@/components/modules/NarrativePanel';
import { OverlayRenderer } from '@/components/overlays/OverlayRenderer';
import { NotificationContainer } from '@/components/ui/NotificationContainer';

interface GameLayoutProps {
  onBackToLobby: () => void;
}

export function GameLayout({ onBackToLobby }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-cream-50 text-slate-800 font-body selection:bg-sky-200/40">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-coral-200/30 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[450px] h-[450px] rounded-full bg-mint-200/30 blur-3xl" />
        <div className="absolute inset-0 grain-overlay" />
      </div>

      {/* 主布局 */}
      <div className="relative z-10 flex flex-col h-screen">
        <TopBar onBackToLobby={onBackToLobby} />
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[auto_1fr_320px]">
          <aside className="hidden lg:flex min-h-0 overflow-hidden bg-[#F5F0EA] shadow-[inset_-1px_0_0_rgba(218,205,190,0.3)]">
            <LeftSidebar />
            <SidebarPreviewPanel />
          </aside>
          <main className="min-h-0 overflow-hidden bg-[#FDFAF5] border-x border-[#E8DFD3] shadow-[inset_0_0_30px_rgba(61,50,41,0.03)]">
            <NarrativePanel />
          </main>
          <aside className="hidden lg:block min-h-0 overflow-hidden bg-[#F3EEE7] shadow-[inset_1px_0_0_rgba(218,205,190,0.3)]">
            <RightPanel />
          </aside>
        </div>
      </div>

      <NotificationContainer />
      <OverlayRenderer />
    </div>
  );
}
