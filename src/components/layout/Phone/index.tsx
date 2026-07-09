import { useGame } from '@/hooks/useGameState';
import { PhoneFrame } from './PhoneFrame';
import { PhoneAppGrid } from './PhoneAppGrid';
import { PhoneAppScreen } from './PhoneAppScreen';
import { NotificationItem } from '@/components/ui/NotificationItem';

export function Phone() {
  const { state, expandPhone, openPhoneApp, closePhoneApp } = useGame();
  const { phoneExpanded, activePhoneApp, phoneApps, notifications, time } = state;

  const activeApp = phoneApps.find((app) => app.id === activePhoneApp);

  return (
    <PhoneFrame expanded={phoneExpanded} onHeadClick={expandPhone}>
      <div className="flex-1 overflow-y-auto">
        {phoneExpanded && (
          <>
            {/* 状态栏 */}
            <div className="flex items-center justify-between px-5 pt-3 pb-2">
              <span className="text-xs font-number text-slate-700/80">
                {String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-1.5 text-slate-700/70">
                <span className="text-[10px]">5G</span>
              </div>
            </div>

            {activeApp ? (
              <PhoneAppScreen app={activeApp} onBack={closePhoneApp} />
            ) : (
              <>
                {/* 通知摘要 */}
                <div className="px-5 mb-2">
                  <h4 className="text-xs font-semibold text-slate-700/80 mb-2">通知</h4>
                  <div className="space-y-1.5">
                    {notifications.slice(0, 3).map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>

                {/* 应用网格 */}
                <PhoneAppGrid apps={phoneApps} onAppClick={openPhoneApp} />
              </>
            )}
          </>
        )}
      </div>
    </PhoneFrame>
  );
}
