import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.almalacarra.aurabox',
  appName: 'AuraBox',
  webDir: 'build',
  backgroundColor: '#FBF4E9',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#1F3350',
      showSpinner: false,
    },
    SystemBars: {
      insetsHandling: 'css',
      style: 'DARK',
    },
  },
};

export default config;