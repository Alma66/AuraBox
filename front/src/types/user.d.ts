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
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  registeredDate: string;
  lastLogin: string;
  gender?: string;
  birthDate?: string;
  documentType?: string;
  documentNumber?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  locality?: string;
  postalCode?: string;
  street?: string;
  streetNumber?: string;
  floor?: string;
  details?: string;
  is2FAEnabled?: boolean;
  showGenderPublicly?: boolean;
  receivePromoEmails?: boolean;
  userActivityLog?: UserActivity[];
  activeSessions?: ActiveSession[];

  managedClubId?: string; 
  legalName?: string; 
  taxId?: string; 
  businessAddress?: string;
  businessDetails?: string; 

}
export interface ClubTeamUser  extends User {
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