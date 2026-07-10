import { useGame } from '@/hooks/useGameState';
import { PhoneFrame } from './PhoneFrame';
import { PhoneAppGrid } from './PhoneAppGrid';
import { PhoneAppScreen } from './PhoneAppScreen';
import { Wifi, Battery } from 'lucide-react';

export function Phone() {
  const { state, expandPhone, openPhoneApp, closePhoneApp } = useGame();
  const { phoneExpanded, activePhoneApp, phoneApps, time } = state;

  const activeApp = phoneApps.find((app) => app.id === activePhoneApp);

  return (
    <PhoneFrame expanded={phoneExpanded} onHeadClick={expandPhone}>
      {phoneExpanded && (
        <div className="flex flex-col h-full">
          {/* 状态栏 */}
          <div className="flex items-center justify-between px-4 pt-2 pb-1 shrink-0">
            <span className="text-xs font-number text-slate-700/80">
              {String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1.5 text-slate-700/70">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeApp ? (
              <PhoneAppScreen app={activeApp} onBack={closePhoneApp} />
            ) : (
              <PhoneAppGrid apps={phoneApps} onAppClick={openPhoneApp} />
            )}
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}
