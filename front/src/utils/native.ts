import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Browser } from '@capacitor/browser';

export const isNativeApp = () => Capacitor.isNativePlatform();

export const tapFeedback = () => {
  if (!isNativeApp()) return;
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
};

export const openPaymentPage = async (url: string): Promise<boolean> => {
  if (isNativeApp()) {
    await Browser.open({ url });
    return true;
  }
  window.location.assign(url);
  return false;
};