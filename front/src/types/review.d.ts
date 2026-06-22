export type ContentType = 'Imagen' | 'Video';

export interface Review {
  id: number;
  idUser: number;
  idClub: number;
  idSubscriptionTypes?: number | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  reviewDate: string;
  lastEditDate?: string | null;
  active: boolean;
  isHidden: boolean;
  hiddenReason?: string | null;
  mediaUrl?: string | null;
  mediaType?: ContentType | null;
}

export interface ForbiddenWord {
  id: number;
  idClub: number;
  word: string;
  active: boolean;
  createdAt: string;
}