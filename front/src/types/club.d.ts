import { LegalSection } from './legalSection'; // Asumiendo que existe; si no, quítalo y define inline

// Nueva definición faltante para resolver mismatch de 'type'
export type LegalSectionType = "title" | "paragraph" | "list" | "image";

export interface ShippingInfo {
  coverage: string;
  details: string;
}

export interface LegalSection {
  id: string;
  type: LegalSectionType; // Ahora usa el type definido arriba
  content: string | string[];
}

export interface SubscriptionPlan {
  planId: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  image: string; // Cambiado a obligatorio para evitar undefined
  deliveryFrequency: string; // Cambiado a obligatorio para evitar undefined
  includes: string[]; // Cambiado a obligatorio para evitar undefined
  shippingAreas: string; // Cambiado a obligatorio para evitar undefined
  specifications: { type: string; value: string }[]; // Cambiado a obligatorio para evitar undefined

  // Nuevas propiedades para edición y estado
  descuentoTransferencia?: number;
  descuentoEfectivo?: number;
  activo?: boolean;
}

export interface FeaturedReview {
  id: string;
  rating: number;
  text: string;
  author: string;
}

// Actualización: Ahora contendrá contenido estructurado
export interface LegalInfo {
  termsAndConditionsSections?: LegalSection[];
  privacyAndSecurityPolicySections?: LegalSection[];
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  website?: string;
  tiktok?: string;
}

// --- Nuevas interfaces para elementos editables ---
export interface HistoryMoment {
  id: string; // Para identificar cada momento
  image: string;
  description: string;
}

export interface Milestone {
  id: string; // Para identificar cada hito
  year: number;
  description: string;
}

export interface KeyFigure {
  id: string; // Para identificar cada cifra
  title: string;
  value: string; // Puede ser un número o texto como "25.000 suscriptores"
}

export interface TeamMember {
  id: string; // Para identificar cada miembro
  name: string;
  role: string;
  bio: string;
  image: string;
}
// --- Fin Nuevas interfaces ---

export interface Club {
  id: string;
  name: string;
  category: string;
  mainImage: string;
  slogan: string;
  bannerImages: string[]; // Se mantiene, pero ahora se usará para el slider general
  logoImage: string;
  shortDescription: string;
  fullHistory: string;
  historyBanner: string; // Se mantiene para el banner principal de la página de historia
  socialMedia: SocialMediaLinks;
  paymentMethods: string[];
  shippingInfo: ShippingInfo;
  legalInfo: LegalInfo; // Ahora contiene contenido estructurado
  rating: number;
  reviewsCount: number;
  featuredReviews: FeaturedReview[];
  subscriptionPlans: SubscriptionPlan[];
  ownerId: string;
  creationDate: string;
  totalSubscribers: number;
  monthlyBoxesSent: number;

  // --- Nuevos campos para la edición del emprendedor ---
  historyMoments?: HistoryMoment[];
  milestones?: Milestone[];
  keyFigures?: KeyFigure[];
  teamMembers?: TeamMember[];
  communityText?: string;
}