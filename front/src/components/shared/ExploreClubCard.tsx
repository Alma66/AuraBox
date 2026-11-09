import React from 'react';
import { useNavigate } from 'react-router-dom';
import SafeImage from '../common/SafeImage';

interface ExploreClubCardProps {
  id: string;
  name: string;
  slogan?: string;
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
}

const ExploreClubCard: React.FC<ExploreClubCardProps> = ({ id, name, slogan, image, rating, reviewsCount }) => {
  const navigate = useNavigate();
  const displayRating = rating ? rating.toFixed(1) : '—';

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/club/${id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/club/${id}`);
        }
      }}
      aria-label={`Ver club ${name}`}
      className="group flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-aurora-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-aurora focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-terracotta"
    >
      <div className="relative aspect-[4/3] w-full bg-white">
        <SafeImage
          src={image}
          alt={name}
          className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-aurora-navyDark/0 transition-colors duration-300 group-hover:bg-aurora-navyDark/40">
          <span className="translate-y-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-aurora-navy opacity-0 shadow-aurora-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            Ver Club
          </span>
        </div>
      </div>
      <div className="bg-aurora-navy p-3">
        <h3 className="truncate font-display text-base font-bold text-white">{name}</h3>
        <p className="mt-0.5 truncate text-xs italic text-white/70">{slogan || ' '}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm text-aurora-gold" aria-hidden="true">★</span>
          <span className="text-sm font-semibold text-white">{displayRating}</span>
          <span className="text-xs text-white/55">({reviewsCount} reseñas)</span>
        </div>
      </div>
    </div>
  );
};

export default ExploreClubCard;