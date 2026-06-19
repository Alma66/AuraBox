import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../../types/user';

interface PrivateRouteProps {
  isAuthenticated: boolean;
  allowedRoles: UserRole[];
  userRole: UserRole | null;
  children: React.ReactNode;
  loading?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isAuthenticated, allowedRoles, userRole, children, loading }) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default PrivateRoute;