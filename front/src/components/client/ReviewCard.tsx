import React from 'react';
import { Review } from '../../types/review';
import { Club } from '../../types/club';

interface ReviewCardProps {
  review: Review;
  club?: Partial<Club>;
  onDelete: () => void;
  onEdit?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, club, onDelete, onEdit }) => {
  const Stars = ({ rating }: { rating: number }) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  const statusLabel = review.isHidden ? 'Oculta' : review.active ? 'Activa' : 'Inactiva';
  const statusColor = review.isHidden
    ? 'bg-red-100 text-red-800'
    : review.active
    ? 'bg-green-100 text-green-800'
    : 'bg-yellow-100 text-yellow-800';
  const hiddenText = review.isHidden
    ? ` (${review.hiddenReason || 'Oculta por moderación'})`
    : '';

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-gray-800">{club?.name || 'Club Desconocido'}</h4>
          <p className="text-sm text-gray-500">
            {new Date(review.reviewDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Stars rating={review.rating} />
      </div>
      {review.title && <p className="font-semibold text-gray-800 mb-1">{review.title}</p>}
      <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
      {review.media && review.media.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.media.map((m) => (
            m.mediaType === 'Video' ? (
              <video key={m.id} src={m.mediaUrl} controls className="w-24 h-24 object-cover rounded-lg" />
            ) : (
              <img key={m.id} src={m.mediaUrl} alt="Reseña" className="w-24 h-24 object-cover rounded-lg" />
            )
          ))}
        </div>
      )}
      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColor} mb-4`}>
        {statusLabel}{hiddenText}
      </div>
      <div className="flex space-x-2">
        {!review.isHidden && onEdit && (
          <button
            onClick={onEdit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Editar
          </button>
        )}
        <button
          onClick={onDelete}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;