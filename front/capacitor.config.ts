import type { CapacitorConfig } from '@capacitor/cli';

declare const process: { env: Record<string, string | undefined> };

const liveUrl = process.env.CAP_BUNDLED === '1' ? undefined : 'https://aura-box-blond.vercel.app';

const config: CapacitorConfig = {
  appId: 'com.almalacarra.aurabox',
  appName: 'AuraBox',
  webDir: 'build',
  backgroundColor: '#FBF4E9',
  server: liveUrl ? { url: liveUrl } : undefined,
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