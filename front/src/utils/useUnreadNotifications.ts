import { useCallback, useEffect, useState } from 'react';
import { fetchUnreadCount, onNotificationsChanged } from './notifications';

const POLL_MS = 60000;

export const useUnreadNotifications = (enabled: boolean): number => {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    fetchUnreadCount()
      .then(setCount)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setCount(0);
      return;
    }
    refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    const off = onNotificationsChanged(refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      off();
    };
  }, [enabled, refresh]);

  return count;
};