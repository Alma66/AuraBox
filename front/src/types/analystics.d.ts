export interface SubscriberEvolutionPoint {
  month: string;
  count: number;
}

export interface ShipmentStatusPoint {
  status: string;
  count: number;
}

export interface ReputationSummary {
  avgRating: number;
  totalReviews: number;
  withMediaPercent: number;
  hiddenCount: number;
}

export interface TopSubscriptionType {
  name: string;
  activeCount: number;
}

export interface ClubStatsData {
  activeSubscribers: number;
  newThisMonth: number;
  cancelledThisMonth: number;
  retentionRate: number;
  avgTicket: string;
  mrr: string;
  subscriberEvolution: SubscriberEvolutionPoint[];
  shipmentStatusBreakdown: ShipmentStatusPoint[];
  reputationSummary: ReputationSummary;
  topSubscriptionTypes: TopSubscriptionType[];
}

export interface MonthlyRevenuePoint {
  month: string;
  current: number;
  previous: number;
}

export interface ByMethodPoint {
  method: string;
  amount: number;
}

export interface ByTypePoint {
  name: string;
  amount: number;
}

export interface PaymentRow {
  id: number;
  paymentDate: string | null;
  idUser: number;
  idUserSubscription: number;
  idPaymentMethods: number | null;
  totalAmountPaid: string;
  clubAmount: string;
  commissionAmount: string;
  paymentStatus: string;
  idGatewayTransaction: string | null;
}

export interface SalesReportData {
  totalRevenue: string;
  successfulPaymentsCount: number;
  avgTicket: string;
  monthlyRevenue: MonthlyRevenuePoint[];
  byPaymentMethod: ByMethodPoint[];
  bySubscriptionType: ByTypePoint[];
  payments: PaymentRow[];
  totalCount: number;
}

export interface RatingEvolutionPoint {
  month: string;
  avgRating: number;
}

export interface SubscriberFluxPoint {
  month: string;
  newSubs: number;
  cancelledSubs: number;
}

export interface ReviewHighlight {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  reviewDate: string | null;
  idUser: number;
  mediaUrl: string | null;
}

export interface FrequentWord {
  word: string;
  count: number;
}

export interface FeedbackTrendsData {
  ratingEvolution: RatingEvolutionPoint[];
  reviewConversionRate: number;
  subscriberFlux: SubscriberFluxPoint[];
  topReviews: ReviewHighlight[];
  bottomReviews: ReviewHighlight[];
  frequentWords: FrequentWord[];
}