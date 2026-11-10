import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';
import { isNativeApp } from './native';

export const useNetworkStatus = (): boolean => {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (!isNativeApp()) return;
    let active = true;
    let removeListener: (() => void) | null = null;

    Network.getStatus()
      .then((status) => {
        if (active) setOnline(status.connected);
      })
      .catch(() => undefined);

    Network.addListener('networkStatusChange', (status) => {
      if (active) setOnline(status.connected);
    })
      .then((handle) => {
        if (active) {
          removeListener = () => {
            handle.remove();
          };
        } else {
          handle.remove();
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
      if (removeListener) removeListener();
    };
  }, []);

  return online;
};