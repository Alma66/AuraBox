export type UserRole = 'customer' | 'entrepreneur' | 'admin';

export interface UserActivity {
  id: string;
  type: 'login' | 'password_change' | '2fa_change' | 'profile_update' | 'account_deletion_request' | 'club_update' | 'subscription_management';
  timestamp: string;
  details: string;
  ipAddress?: string;
  device?: string;
  location?: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface User {
  // Campos comunes (token + BD)
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  registeredDate: string;
  lastLogin: string;

  // Campos personales (BD)
  birthDate?: string;
  documentType?: string;
  documentNumber?: string | number;
  phoneNumber?: string | number;

  // Dirección — User (BD: streetAddress, addressNumber, etc.)
  streetAddress?: string;
  addressNumber?: number | string;
  floorNumber?: string;
  addressDetails?: string;
  city?: string;
  province?: string;
  postalCode?: string;

  // Campos legacy que usan los componentes (mapeados desde BD)
  country?: string;
  locality?: string;
  street?: string;
  streetNumber?: string;
  floor?: string;
  details?: string;

  // Financiero
  balanceAvailable?: string;

  // Preferencias
  gender?: string;
  is2FAEnabled?: boolean;
  showGenderPublicly?: boolean;
  receivePromoEmails?: boolean;
  userActivityLog?: UserActivity[];
  activeSessions?: ActiveSession[];

  // Emprendedor
  managedClubId?: string;
  cuitCuil?: string;
  legalName?: string;
  taxId?: string;
  businessAddress?: string;
  businessDetails?: string;
}

export interface ClubTeamUser extends User {
  role: Exclude<UserRole, 'customer'> | 'administrador_del_club' |
    'gestor_de_suscripciones' |
    'coordinador_de_entregas' |
    'delivery_rider' |
    'encargado_de_marketing_y_contenido' |
    'moderador_de_resenas' |
    'analista_de_datos_del_club' |
    'administrador_financiero' |
    'planificador_de_inventario' |
    'coordinador_de_eventos_y_comunidad' |
    'encargado_de_atencion_post_venta' |
    'administrador_de_seguridad_y_accesos';
}

declare module 'leaflet';