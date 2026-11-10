import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';
import { UserRole } from '../../types/user';
import { onCartChanged } from '../../utils/cartEvents';
import { tapFeedback } from '../../utils/native';
import { TabKey, tabForPath } from './nativeRoutes';

interface BottomTabBarProps {
  isAuthenticated: boolean;
  userRole: UserRole | null;
}

interface TabDefinition {
  key: TabKey;
  label: string;
  to: string;
  icon: string;
}

const ICONS: Record<TabKey, string> = {
  home: 'M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  explore: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
  cart: 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z',
  orders: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
  account: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
};

const BottomTabBar: React.FC<BottomTabBarProps> = ({ isAuthenticated, userRole }) => {
  const { pathname } = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const isCustomer = isAuthenticated && userRole === 'customer';
  const activeTab = tabForPath(pathname);

  useEffect(() => onCartChanged(() => setRefreshKey((value) => value + 1)), []);

  useEffect(() => {
    if (!isCustomer) {
      setCartCount(0);
      return;
    }
    let active = true;
    api
      .get('/cart-items')
      .then((response: unknown) => {
        const data = getResponseData(response);
        if (active) setCartCount(Array.isArray(data) ? data.length : 0);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [isCustomer, pathname, refreshKey]);

  const tabs: TabDefinition[] = [
    { key: 'home', label: 'Inicio', to: '/', icon: ICONS.home },
    { key: 'explore', label: 'Explorar', to: '/explore', icon: ICONS.explore },
    { key: 'cart', label: 'Carrito', to: '/cart', icon: ICONS.cart },
    { key: 'orders', label: 'Pedidos', to: '/customer/orders', icon: ICONS.orders },
    {
      key: 'account',
      label: isCustomer ? 'Cuenta' : 'Ingresar',
      to: isCustomer ? '/customer/profile' : '/login',
      icon: ICONS.account,
    },
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-aurora-navy/10 bg-white/95 backdrop-blur-md safe-bottom safe-x"
    >
      <ul className="grid h-16 grid-cols-5">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <li key={tab.key}>
              <Link
                to={tab.to}
                onClick={() => {
                  tapFeedback();
                }}
                aria-current={active ? 'page' : undefined}
                className={`relative flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
                  active ? 'text-aurora-terracotta' : 'text-aurora-navy/60'
                }`}
              >
                <span className="relative">
                  <svg
                    className="h-6 w-6"
                    fill={active && tab.key !== 'explore' ? 'currentColor' : 'none'}
                    fillOpacity={active ? 0.12 : 0}
                    stroke="currentColor"
                    strokeWidth={active ? 2 : 1.7}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                  </svg>
                  {tab.key === 'cart' && cartCount > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-aurora-terracotta px-1 text-[10px] font-bold leading-none text-white">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </span>
                {tab.label}
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-aurora-terracotta" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomTabBar;