export type UserRole = 'customer' | 'entrepreneur' | 'admin';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  documentType?: string;
  documentNumber?: number;
  registrationDate?: string;
  birthDate?: string | null;
  balanceAvailable?: string | null;
  phoneNumber?: number | null;
  streetAddress?: string | null;
  addressNumber?: number | null;
  floorNumber?: string | null;
  addressDetails?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  active?: boolean;
  managedClubId?: string;
  registeredDate?: string;
  lastLogin?: string;
  gender?: string;
  country?: string;
  locality?: string;
  street?: string;
  streetNumber?: string;
  floor?: string;
  details?: string;
  acceptsNewsletter?: boolean;
  showGenderPublicly?: boolean;
  homeLatitude?: string | null;
  homeLongitude?: string | null;
  cuitCuil?: string;
}