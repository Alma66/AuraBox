import React from 'react';
import { Link } from 'react-router-dom';
import SafeImage from '../common/SafeImage';
import { clubAccent } from '../../utils/clubAccent';

interface FeaturedClubCardProps {
  id: string | number;
  name: string;
  slogan?: string;
  logoUrl?: string;
  averageRating?: number | null;
  totalReviews?: number | null;
}

const FeaturedClubCard: React.FC<FeaturedClubCardProps> = ({ id, name, slogan, logoUrl, averageRating, totalReviews }) => {
  const rating = averageRating ? Number(averageRating).toFixed(1) : '—';
  const reviews = totalReviews ?? 0;

  return (
    <Link
      to={`/club/${id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-aurora-navy/10 bg-white p-6 shadow-aurora-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-aurora-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-terracotta"
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${clubAccent(id)}`} aria-hidden="true" />
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-aurora-cream ring-1 ring-aurora-navy/5 transition-transform duration-300 group-hover:scale-105">
        <SafeImage src={logoUrl} alt={name} className="h-full w-full object-contain p-1.5" />
      </div>
      <h3 className="mt-5 truncate font-display text-2xl font-medium text-aurora-navy">{name}</h3>
      <p className="mt-1.5 line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-aurora-navy/60">{slogan || ''}</p>
      <div className="mt-5 flex items-center justify-between border-t border-aurora-navy/10 pt-4 text-sm">
        <span className="text-aurora-navy/60">
          <b className="font-semibold text-aurora-navy">★ {rating}</b> · {reviews}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-aurora-terracotta">
          Ver club
          <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
};

export default FeaturedClubCard;