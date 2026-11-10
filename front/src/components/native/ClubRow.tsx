import React from 'react';
import { Link } from 'react-router-dom';
import SafeImage from '../common/SafeImage';
import { tapFeedback } from '../../utils/native';

interface ClubRowProps {
  id: string | number;
  name: string;
  slogan?: string;
  logoUrl?: string;
  rating: number;
  reviewsCount: number;
  categories?: string[];
  index: number;
}

const ClubRow: React.FC<ClubRowProps> = ({ id, name, slogan, logoUrl, rating, reviewsCount, categories = [], index }) => (
  <Link
    to={`/club/${id}`}
    onClick={() => {
      tapFeedback();
    }}
    className="flex animate-fadeInUp items-center gap-4 rounded-3xl bg-white p-3 shadow-aurora-sm ring-1 ring-aurora-navy/5 transition-transform duration-200 active:scale-[0.98]"
    style={{ animationDelay: `${Math.min(index, 8) * 45}ms`, animationFillMode: 'both' }}
  >
    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-aurora-cream">
      <SafeImage src={logoUrl} alt={name} className="h-full w-full object-cover" />
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="truncate font-display text-lg font-bold leading-tight text-aurora-navy">{name}</h3>
      <p className="mt-0.5 line-clamp-2 text-sm italic text-aurora-navy/55">{slogan || ''}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="badge-gold">
          <span aria-hidden="true">★</span>
          {rating > 0 ? rating.toFixed(1) : '—'}
        </span>
        <span className="text-xs text-aurora-navy/50">
          {reviewsCount} {reviewsCount === 1 ? 'reseña' : 'reseñas'}
        </span>
      </div>
      {categories.length > 0 && (
        <div className="mt-2 flex gap-1.5 overflow-hidden">
          {categories.slice(0, 2).map((category) => (
            <span key={category} className="truncate rounded-full bg-aurora-cream px-2.5 py-0.5 text-[11px] font-semibold text-aurora-navy/70">
              {category}
            </span>
          ))}
        </div>
      )}
    </div>
    <svg className="h-5 w-5 shrink-0 text-aurora-navy/30" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  </Link>
);

export default ClubRow;