import { AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGameState';
import { InAppNotification } from './InAppNotification';

export function NotificationContainer() {
  const { state, dismissNotification } = useGame();
  const notifications = state.inAppNotifications;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 w-80">
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
