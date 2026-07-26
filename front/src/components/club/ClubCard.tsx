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
    <div className="card-surface overflow-hidden hover:shadow-aurora transition-shadow duration-300 animate-fadeInUp">
      <Link to={`/club/${id}`} className="block relative overflow-hidden group">
        <img src={image} alt={name} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" />
      </Link>
      <div className="p-6">
        <span className="badge-gold mb-3">
          {category}
        </span>
        <h3 className="font-display text-2xl font-bold text-aurora-navy mb-2">{name}</h3>
        <p className="text-aurora-navy/65 text-sm mb-4">{description}</p>
        <div className="flex items-center mb-4 gap-1">
          <span className="text-aurora-gold">⭐</span>
          <span className="text-aurora-navy font-bold">{rating}</span>
          <span className="text-aurora-navy/50 text-sm">({reviewsCount} reseñas)</span>
        </div>
        {price !== undefined && currency !== undefined && (
          <p className="text-xl font-semibold text-aurora-navy mb-4">
            Desde {currency} {price.toLocaleString('es-AR')}
          </p>
        )}
        <Link
          to={`/club/${id}`}
          className="btn-primary w-full !rounded-lg"
        >
          Ver Club
        </Link>
      </div>
    </div>
  );
};

export default ClubCard;