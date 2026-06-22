export type PromotionType =
  | 'Descuento_Temporal'
  | 'Combo_Suscripciones'
  | 'Descuento_Por_Cantidad'
  | 'Envio_Gratis'
  | 'Cupon_Proxima'
  | 'Descuento_Primeros_Meses';

export interface Promotion {
  id: number;
  idClub: number;
  name: string;
  description?: string | null;
  promotionType: PromotionType;
  discountPercentage?: string | null;
  idSubscriptionTypes?: number | null;
  comboSubscriptionIds?: string | null;
  minSubscriptionsQty?: number | null;
  freeShipping: boolean;
  couponCode?: string | null;
  durationMonths?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  active: boolean;
  createdAt: string;
  createdBy?: number | null;
}