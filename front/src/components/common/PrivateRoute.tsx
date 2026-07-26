import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '../../types/user';

interface PrivateRouteProps {
  isAuthenticated: boolean;
  allowedRoles: UserRole[];
  userRole: UserRole | null;
  children: React.ReactNode;
  loading?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isAuthenticated, allowedRoles, userRole, children, loading }) => {
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aurora-cream">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default PrivateRoute;