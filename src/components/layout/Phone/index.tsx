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
          <div className="flex items-center justify-between px-5 pt-3 pb-1 shrink-0 z-20">
            <span className="text-xs font-semibold text-slate-800 tracking-tight">
              {String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1.5 text-slate-800">
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
