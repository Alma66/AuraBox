
export interface Review {
  id: string;
  clubId: string;
  userId: string;
  rating: number; 
  comment: string;
  date: string; 
  status: 'pending' | 'approved'; 
  isBlockedBySystem: boolean; 
}

export type ReviewStatus = 'pending' | 'approved';

export interface FeaturedReview {
  id: string;
  rating: number;
  text: string;
  author: string;
}