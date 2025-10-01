import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../../types/user'; // Ajusta la ruta según tu estructura

interface PrivateRouteProps {
  isAuthenticated: boolean;
  allowedRoles: UserRole[];
  userRole: UserRole | null;
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isAuthenticated, allowedRoles, userRole, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default PrivateRoute;