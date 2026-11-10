import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const isNativeApp = () => Capacitor.isNativePlatform();

export const tapFeedback = () => {
  if (!isNativeApp()) return;
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
};