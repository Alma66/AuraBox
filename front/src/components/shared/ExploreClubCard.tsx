import React from 'react';
import { useNavigate } from 'react-router-dom';
import SafeImage from '../common/SafeImage';
import { clubAccent } from '../../utils/clubAccent';

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
      className="group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-aurora-navy/10 bg-white shadow-aurora-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-aurora-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-terracotta"
    >
      <span className={`absolute inset-x-0 top-0 z-10 h-1 ${clubAccent(id)}`} aria-hidden="true" />
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-aurora-cream">
        <SafeImage
          src={image}
          alt={name}
          className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-4 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-aurora-navy shadow-sm">
          <span className="text-aurora-gold" aria-hidden="true">★</span>
          {displayRating}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="truncate font-display text-xl font-medium text-aurora-navy">{name}</h3>
        <p className="mt-1 line-clamp-1 min-h-[1.25rem] text-sm text-aurora-navy/60">{slogan || ''}</p>
        <div className="mt-4 flex items-center justify-between border-t border-aurora-navy/10 pt-3 text-xs">
          <span className="text-aurora-navy/55">
            {reviewsCount} {reviewsCount === 1 ? 'reseña' : 'reseñas'}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-aurora-terracotta">
            <span className="hidden sm:inline">Ver club</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExploreClubCard;