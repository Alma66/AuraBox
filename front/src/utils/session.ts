import { User } from '../types/user';

export const userFromToken = (token: string): User => {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  const payload = JSON.parse(json);

  return {
    id: payload.sub?.toString() || '',
    firstName: payload.firstName || '',
    lastName: payload.lastName || '',
    email: payload.email || '',
    role: (payload.role?.toLowerCase() || 'customer') as 'customer' | 'entrepreneur' | 'admin',
    registeredDate: payload.registeredDate || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    managedClubId: payload.managedClubId?.toString() || undefined,
  };
};