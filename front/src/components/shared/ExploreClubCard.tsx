import React from 'react';
import { useNavigate } from 'react-router-dom';

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
      onClick={() => navigate(`/club/${id}`)}
      className="group relative aspect-square w-full overflow-hidden rounded-2xl shadow-aurora-sm
                    bg-aurora-navy/5 cursor-pointer transition-all duration-300 hover:shadow-aurora"
    >
      <img
        src={image || '/assets/default-club.jpg'}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-aurora-navyDark/90 via-aurora-navyDark/45 to-transparent p-3 pt-14">
        <h3 className="text-white font-display font-bold text-base truncate">{name}</h3>
        {slogan && <p className="text-white/75 text-xs italic truncate mt-0.5">{slogan}</p>}
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex items-center gap-1">
            <span className="text-aurora-gold text-sm">⭐</span>
            <span className="text-white text-sm font-semibold">{displayRating}</span>
          </div>
          <span className="text-white/55 text-xs">({reviewsCount} reseñas)</span>
        </div>
      </div>
      <div className="absolute inset-0 bg-aurora-navyDark/0 group-hover:bg-aurora-navyDark/50 transition-colors duration-300
                      flex items-center justify-center">
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/club/${id}`); }}
          className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                     transition-all duration-300 bg-white text-aurora-navy font-semibold
                     px-5 py-2 rounded-full shadow-aurora-sm hover:bg-aurora-terracotta hover:text-white"
        >
          Ver Club
        </button>
      </div>
    </div>
  );
};

export default ExploreClubCard;