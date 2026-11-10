import React from 'react';

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

interface StarRatingProps {
  value: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ value, className = 'h-4 w-4' }) => (
  <div className="flex" role="img" aria-label={`${value.toFixed(1)} de 5 estrellas`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <svg
        key={n}
        aria-hidden="true"
        className={`${className} ${n <= Math.round(value) ? 'text-aurora-gold' : 'text-aurora-navy/15'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d={STAR_PATH} />
      </svg>
    ))}
  </div>
);

export default StarRating;