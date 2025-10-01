export interface Subscription {
  id: string;
  userId: string;
  clubId: string;
  status: 'active' | 'paused' | 'cancelled';
  startDate: string;
  nextBillingDate: string;
  deliveryFrequency: string;
  lastBoxReceived: string;
  paymentMethod: string;
  planId: string; 
  history: Array<{
    month: string;
    boxContent: string;
    rating: number;
  }>;
}