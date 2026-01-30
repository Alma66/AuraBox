import React from 'react';
import { Link } from 'react-router-dom';

interface ClubCardProps {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
  price?: number;
  currency?: string;
}

const ClubCard: React.FC<ClubCardProps> = ({
  id,
  name,
  category,
  description,
  image,
  rating,
  reviewsCount,
  price,
  currency,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-fadeInUp">
      <Link to={`/club/${id}`}>
        <img src={image} alt={name} className="w-full h-48 object-cover" />
      </Link>
      <div className="p-6">
        <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
          {category}
        </span>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-700 text-sm mb-4">{description}</p>
        <div className="flex items-center mb-4">
          <span className="text-yellow-500 font-bold mr-1">{rating}</span>
          <span className="text-gray-500 text-sm">({reviewsCount} reseñas)</span>
        </div>
        {price !== undefined && currency !== undefined && (
          <p className="text-xl font-semibold text-gray-800 mb-4">
            Desde {currency} {price.toLocaleString('es-AR')}
          </p>
        )}
        <Link
          to={`/club/${id}`}
          className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Ver Club
        </Link>
      </div>
    </div>
  );
};

export default ClubCard;