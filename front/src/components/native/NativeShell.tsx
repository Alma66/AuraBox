import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { UserRole } from '../../types/user';
import { useNetworkStatus } from '../../utils/useNetworkStatus';
import { clearLocalReminders, listenForReminderTaps, syncLocalReminders } from '../../utils/localReminders';
import BottomTabBar from './BottomTabBar';
import NativeHeader from './NativeHeader';
import { hidesTabBar } from './nativeRoutes';

interface NativeShellProps {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  children: React.ReactNode;
}

const NativeShell: React.FC<NativeShellProps> = ({ isAuthenticated, userRole, children }) => {
  const { pathname } = useLocation();
  const online = useNetworkStatus();
  const showTabs = !hidesTabBar(pathname);
  const isCustomer = isAuthenticated && userRole === 'customer';

  const navigate = useNavigate();

  useEffect(() => {
    if (!isCustomer) {
      if (!isAuthenticated) clearLocalReminders();
      return;
    }
    syncLocalReminders();
    let removed = false;
    let remove: (() => void) | null = null;
    CapApp.addListener('resume', () => {
      syncLocalReminders();
    })
      .then((handle) => {
        if (removed) handle.remove();
        else
          remove = () => {
            handle.remove();
          };
      })
      .catch(() => undefined);
    return () => {
      removed = true;
      if (remove) remove();
    };
  }, [isCustomer, isAuthenticated]);

  useEffect(() => listenForReminderTaps((route) => navigate(route)), [navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-aurora-cream">
      <NativeHeader isCustomer={isCustomer} />
      {!online && (
        <div role="status" className="bg-aurora-gold px-4 py-2 text-center text-sm font-semibold text-aurora-navyDark">
          Sin conexión. Revisá tu internet para ver información actualizada.
        </div>
      )}
      <main
        id="main-content"
        className="flex-1"
        style={
          showTabs
            ? { paddingBottom: 'calc(4rem + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))' }
            : { paddingBottom: 'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))' }
        }
      >
        {children}
      </main>
      {showTabs && <BottomTabBar isAuthenticated={isAuthenticated} userRole={userRole} />}
    </div>
  );
};

export default NativeShell;