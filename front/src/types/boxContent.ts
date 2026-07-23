export interface BoxContentItem {
  id: number;
  idSubscriptionTypes: number;
  deliveryMonthYear: string;
  productName: string;
  productDescription: string;
  usageInstructions?: string | null;
  productExpirationDate?: string | null;
  productImageUrl?: string | null;
  productVideoUrl?: string | null;
  additionalNotes?: string | null;
  publicationDate?: string | null;
  ageRestriction: boolean;
  originLocation?: string | null;
  containsAllergens: boolean;
  allergensDetail?: string | null;
  isDangerousItem: boolean;
  dangerDetail?: string | null;
  requiresCleaning: boolean;
  cleaningInstructions?: string | null;
  updatedAt?: string | null;
}