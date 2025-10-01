import React from 'react';
import { Link } from 'react-router-dom';

interface ExploreClubCardProps {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
}

const ExploreClubCard: React.FC<ExploreClubCardProps> = ({
  id,
  name,
  category,
  description,
  image,
  rating,
  reviewsCount,
}) => {
  return (
    <Link to={`/club/${id}`} className="block">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer h-full flex flex-col">
        <img src={image} alt={name} className="w-full h-48 object-cover" />
        <div className="p-6 flex flex-col flex-grow">
          <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2 self-start">
            {category}
          </span>
          <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">{name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{description}</p>
          <div className="flex items-center mt-auto">
            <span className="text-yellow-500 font-bold text-lg mr-1">{rating}</span>
            <span className="text-gray-500 text-sm">({reviewsCount} reseñas)</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ExploreClubCard;