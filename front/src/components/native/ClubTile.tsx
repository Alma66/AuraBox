import React from 'react';
import { Link } from 'react-router-dom';
import SafeImage from '../common/SafeImage';
import { tapFeedback } from '../../utils/native';

interface ClubTileProps {
  id: string | number;
  name: string;
  slogan?: string;
  logoUrl?: string;
  averageRating?: number | null;
}

const ClubTile: React.FC<ClubTileProps> = ({ id, name, slogan, logoUrl, averageRating }) => {
  const rating = averageRating ? Number(averageRating).toFixed(1) : '—';

  return (
    <Link
      to={`/club/${id}`}
      onClick={() => {
        tapFeedback();
      }}
      className="relative block w-[62vw] max-w-[240px] shrink-0 snap-start overflow-hidden rounded-3xl bg-white shadow-aurora-sm ring-1 ring-aurora-navy/5 transition-transform duration-200 active:scale-[0.97]"
    >
      <div className="relative h-24 overflow-hidden bg-gradient-to-br from-aurora-navy via-aurora-navyLight to-aurora-terracotta">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-aurora-gold/30 blur-2xl" />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-aurora-navy shadow-sm">
          <span className="text-aurora-gold" aria-hidden="true">★</span>
          {rating}
        </span>
      </div>
      <div className="px-4 pb-4">
        <div className="-mt-10 mb-3 h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-aurora-sm">
          <SafeImage src={logoUrl} alt={name} className="h-full w-full object-cover" />
        </div>
        <h3 className="truncate font-display text-lg font-bold text-aurora-navy">{name}</h3>
        <p className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm italic text-aurora-navy/55">{slogan || ''}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-aurora-terracotta">
          Ver club
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </span>
      </div>
    </Link>
  );
};

export default ClubTile;