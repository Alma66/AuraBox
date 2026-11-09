import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';

interface PublicReview {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  customerName: string;
  planName: string | null;
}

interface ReviewsPreview {
  reviews: PublicReview[];
  total: number;
  summary: { average: number; count: number };
}

interface ClubFeaturedReviewsProps {
  clubName: string;
  clubId: string;
}

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.729c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z';

const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex" role="img" aria-label={`${rating.toFixed(1)} de 5 estrellas`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <svg
        key={n}
        aria-hidden="true"
        className={`h-5 w-5 ${n <= Math.round(rating) ? 'text-yellow-400' : 'text-aurora-navy/20'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d={STAR_PATH} />
      </svg>
    ))}
  </div>
);

const ClubFeaturedReviews: React.FC<ClubFeaturedReviewsProps> = ({ clubName, clubId }) => {
  const [data, setData] = useState<ReviewsPreview | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await api.get(`/reviews/public/by-club/${clubId}?limit=2&offset=0`);
        if (active) setData(getResponseData(res) as ReviewsPreview);
      } catch {
        if (active) setData(null);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [clubId]);

  if (!data || data.total === 0) return null;

  return (
    <section
      aria-labelledby="club-reviews-heading"
      className="mb-8 animate-fadeInUp rounded-xl border border-aurora-navy/10 bg-white p-8 shadow-aurora-sm"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="club-reviews-heading" className="text-2xl font-bold text-aurora-navy">
          Reseñas de los clientes
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-aurora-navy">{data.summary.average.toFixed(1)}</span>
          <Stars rating={data.summary.average} />
          <span className="text-sm text-aurora-navy/60">
            ({data.summary.count} {data.summary.count === 1 ? 'reseña' : 'reseñas'})
          </span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {data.reviews.slice(0, 2).map((review) => (
          <div key={review.id} className="rounded-lg border border-aurora-navy/10 bg-aurora-cream p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Stars rating={review.rating} />
              {review.planName && <span className="text-xs text-aurora-navy/60">{review.planName}</span>}
            </div>
            {review.title && <p className="mb-1 font-semibold text-aurora-navy">{review.title}</p>}
            {review.comment && <p className="mb-2 font-medium text-aurora-navy">"{review.comment}"</p>}
            <p className="text-sm text-aurora-navy/60">- {review.customerName}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          to={`/club/${clubId}/reviews`}
          className="text-lg font-semibold text-aurora-terracotta transition-colors duration-200 hover:text-aurora-terracottaDark hover:underline"
        >
          Ver {data.total === 1 ? 'la reseña' : `las ${data.total} reseñas`} de {clubName}
        </Link>
      </div>
    </section>
  );
};

export default ClubFeaturedReviews;