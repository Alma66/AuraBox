import React from 'react';
import { Link } from 'react-router-dom';

interface NotificationBellProps {
  count: number;
  className: string;
  onClick?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ count, className, onClick }) => {
  const label = count > 0 ? `Notificaciones, ${count} sin leer` : 'Notificaciones';
  return (
    <Link to="/customer/notifications" className={`relative ${className}`} aria-label={label} onClick={onClick}>
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-aurora-terracotta px-1 text-[10px] font-bold leading-none text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;