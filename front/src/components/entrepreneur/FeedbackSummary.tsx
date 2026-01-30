import React from 'react';
import { Club } from '../../types/club';

interface FeedbackSummaryProps {
  avgRating: number;
  totalReviews: number;
  approvedReviews: number;
  club: Club;
}

const FeedbackSummary: React.FC<FeedbackSummaryProps> = ({ avgRating, totalReviews, approvedReviews, club }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-6 rounded-xl shadow-lg">
      <div className="text-center">
        <p className="text-3xl font-bold text-yellow-600">{avgRating.toFixed(1)} ★</p>
        <p className="text-gray-600 mt-1">Rating Promedio</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-gray-900">{totalReviews.toLocaleString()}</p>
        <p className="text-gray-600 mt-1">Reseñas Totales</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-green-600">{approvedReviews.toLocaleString()}</p>
        <p className="text-gray-600 mt-1">Aprobadas</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-red-600">{(totalReviews - approvedReviews).toLocaleString()}</p>
        <p className="text-gray-600 mt-1">Pendientes/Bloqueadas</p>
      </div>
    </div>
  );
};

export default FeedbackSummary;