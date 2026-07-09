import { GameProvider } from '@/context/GameContext';
import { TopBar } from '@/components/layout/TopBar';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { SidebarPreviewPanel } from '@/components/layout/SidebarPreviewPanel';
import { RightPanel } from '@/components/layout/RightPanel';
import { Phone } from '@/components/layout/Phone';
import { NarrativePanel } from '@/components/modules/NarrativePanel';
import { OverlayRenderer } from '@/components/overlays/OverlayRenderer';
import { NotificationContainer } from '@/components/ui/NotificationContainer';

export default function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-cream-50 text-slate-800 font-body selection:bg-sky-200/40">
        {/* 背景装饰 */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-sky-200/30 blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full bg-coral-200/30 blur-3xl" />
          <div className="absolute -bottom-40 right-1/4 w-[450px] h-[450px] rounded-full bg-mint-200/30 blur-3xl" />
          <div className="absolute inset-0 grain-overlay" />
        </div>

        {/* 主布局：全屏紧凑分区 */}
        <div className="relative z-10 flex flex-col h-screen">
          <TopBar />
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[auto_1fr_320px]">
            <aside className="hidden lg:flex min-h-0 overflow-hidden">
              <LeftSidebar />
              <SidebarPreviewPanel />
            </aside>
            <main className="min-h-0 overflow-hidden">
              <NarrativePanel />
            </main>
            <aside className="hidden lg:block min-h-0 overflow-hidden">
              <RightPanel />
            </aside>
          </div>
        </div>

        <Phone />

        {/* 游戏内通知 */}
        <NotificationContainer />

        {/* 全局全屏浮层 */}
        <OverlayRenderer />
      </div>
    </GameProvider>
  );
}
