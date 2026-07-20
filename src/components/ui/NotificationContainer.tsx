import { AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGameState';
import { InAppNotification } from './InAppNotification';

export function NotificationContainer() {
  const { state, dismissNotification } = useGame();
  const notifications = state.inAppNotifications;

  return (
    <div
      id="notification-container"
      className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 w-80"
      aria-label="应用内通知"
    >
      <AnimatePresence>
        {notifications.map((n) => (
          <InAppNotification
            key={n.id}
            notification={n}
            onClose={() => dismissNotification(n.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
