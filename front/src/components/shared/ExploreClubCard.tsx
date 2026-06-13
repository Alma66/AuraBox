import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ExploreClubCardProps {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
}

const ExploreClubCard: React.FC<ExploreClubCardProps> = ({ id, name, image, rating }) => {
  const navigate = useNavigate();
  const displayRating = rating ? rating.toFixed(1) : '—';

  return (
    <div className="group relative aspect-square w-full overflow-hidden rounded-xl shadow-md
                    bg-gray-100 cursor-pointer transition-all duration-300 hover:shadow-2xl">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-10">
        <h3 className="text-white font-bold text-base truncate">{name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-yellow-400 text-sm">⭐</span>
          <span className="text-white text-sm font-semibold">{displayRating}</span>
        </div>
      </div>

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300
                      flex items-center justify-center">
        <button
          onClick={() => navigate(`/club/${id}`)}
          className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                     transition-all duration-300 bg-white text-gray-900 font-semibold
                     px-5 py-2 rounded-full shadow-lg hover:bg-purple-600 hover:text-white"
        >
          Ver Club
        </button>
      </div>
    </div>
  );
};

export default ExploreClubCard;