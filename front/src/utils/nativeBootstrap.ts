import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { isNativeApp } from './native';

const ROOT_PATHS = ['/', '/explore', '/cart', '/customer/orders', '/customer/profile'];

export const initNativeApp = () => {
  if (!isNativeApp()) return;

  document.documentElement.classList.add('native-app');

  App.addListener('backButton', () => {
    const atRoot = ROOT_PATHS.includes(window.location.pathname) || window.history.length <= 1;
    if (atRoot) {
      App.exitApp();
      return;
    }
    window.history.back();
  });

  window.setTimeout(() => {
    SplashScreen.hide({ fadeOutDuration: 250 }).catch(() => undefined);
  }, 400);
};