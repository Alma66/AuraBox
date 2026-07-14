export type LegalSectionType = "title" | "paragraph" | "list" | "image";

export interface ShippingInfo {
  coverage: string;
  details: string;
}

export interface LegalSection {
  id: string;
  type: LegalSectionType;
  content: string | string[];
}

export interface SubscriptionPlan {
  planId: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  image: string;
  deliveryFrequency: string;
  includes: string[];
  shippingAreas: string;
  specifications: { type: string; value: string }[];
  descuentoTransferencia?: number;
  descuentoEfectivo?: number;
  activo?: boolean;
  active?: boolean;
  cashDiscount?: number;
  transferDiscount?: number;
}

export interface FeaturedReview {
  id: string;
  rating: number;
  text: string;
  author: string;
}

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

export interface HistoryMoment {
  id: string;
  image: string;
  description: string;
}

export interface Milestone {
  id?: string;
  year: number;
  description: string;
}

export interface KeyFigure {
  id: string;
  title: string;
  value: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface Club {
  id: string | number;
  name: string;
  logoUrl?: string;
  slogan?: string;
  history?: string;
  shortDescription?: string;
  contactEmail?: string;
  whatsappContact?: string;
  clubStatus?: string;
  creationDate?: string;
  averageRating?: number | null;
  totalReviews?: number;
  reviews?: { id: number; rating: number; title?: string; comment?: string }[];
  category?: string;
  mainImage?: string;
  logoImage?: string;
  bannerImages?: string[];
  bannerImagesRaw?: { id: number; imageUrl: string; description?: string }[];
  historyImageRaw?: { id: number; imageUrl: string }[];
  fullHistory?: string;
  historyBanner?: string;
  socialMedia?: SocialMediaLinks;
  paymentMethods?: string[];
  shippingInfo?: ShippingInfo;
  legalInfo?: LegalInfo;
  rating?: number;
  reviewsCount?: number;
  featuredReviews?: FeaturedReview[];
  subscriptionPlans?: SubscriptionPlan[];
  ownerId?: string;
  totalSubscribers?: number;
  monthlyBoxesSent?: number;
  historyMoments?: HistoryMoment[];
  milestones?: string;
  keyFigures?: KeyFigure[];
  teamMembers?: TeamMember[];
  communityText?: string;
  entrepreneurs?: { id: number; firstName: string; lastName: string; bio?: string | null }[];
  isOwner?: boolean;
}