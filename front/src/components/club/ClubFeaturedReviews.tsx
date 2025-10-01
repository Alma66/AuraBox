// src/components/ClubFeaturedReviews.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FeaturedReview } from '../../types/club'; // Importa la interfaz (ahora exportada)

interface ClubFeaturedReviewsProps {
  reviews: FeaturedReview[];
  clubName: string;
  clubId: string;
}

const ClubFeaturedReviews: React.FC<ClubFeaturedReviewsProps> = ({ reviews, clubName, clubId }) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-fadeInUp">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Reseñas Destacadas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {reviews.slice(0, 2).map((review) => ( // Mostrar solo 2-3 reseñas destacadas
          <div key={review.id} className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-2">
              <span className="text-yellow-500 text-xl font-bold mr-2">{review.rating}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.729c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-800 font-medium mb-2">"{review.text}"</p>
            <p className="text-gray-600 text-sm">- {review.author}</p>
          </div>
        ))}
      </div>
      {reviews.length > 2 && (
        <div className="text-center mt-6">
          <Link
            to={`/club/${clubId}/reviews`} // Ruta futura para todas las reseñas
            className="text-blue-600 hover:underline font-semibold text-lg transition-colors duration-200"
          >
            Ver todas las {reviews.length} reseñas de {clubName}
          </Link>
        </div>
      )}
    </div>
  );
};

export default ClubFeaturedReviews;