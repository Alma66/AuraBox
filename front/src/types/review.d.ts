// FileName: /src/types/review.d.ts
// Interfaz para Review, inferida de data/reviews.json

export interface Review {
  id: string;
  clubId: string;
  userId: string;
  rating: number; // 1-5 estrellas
  comment: string;
  date: string; // ISO string, ej. "2024-06-25T10:00:00Z"
  status: 'pending' | 'approved'; // Estado de moderación
  isBlockedBySystem: boolean; // Si fue bloqueada automáticamente (ej. por lenguaje ofensivo)
}

// Opcional: Type para Status (puedes usarlo en lugar de string literal)
export type ReviewStatus = 'pending' | 'approved';

// Opcional: Interfaz para FeaturedReview (de clubs.json, si lo necesitas en otras páginas)
export interface FeaturedReview {
  id: string;
  rating: number;
  text: string;
  author: string;
}