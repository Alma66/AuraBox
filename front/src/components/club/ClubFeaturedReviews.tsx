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
        className={`h-4 w-4 ${n <= Math.round(rating) ? 'text-aurora-gold' : 'text-aurora-navy/20'}`}
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
      className="rounded-3xl bg-white p-6 shadow-aurora-sm ring-1 ring-aurora-navy/5 md:p-10"
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="section-eyebrow">Opiniones reales</span>
          <h2 id="club-reviews-heading" className="font-display text-3xl font-medium text-aurora-navy md:text-4xl">
            Lo que dicen los suscriptores
          </h2>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-aurora-cream px-5 py-3">
          <span className="font-display text-4xl font-medium text-aurora-navy">{data.summary.average.toFixed(1)}</span>
          <div>
            <Stars rating={data.summary.average} />
            <span className="text-xs text-aurora-navy/60">
              {data.summary.count} {data.summary.count === 1 ? 'reseña' : 'reseñas'}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {data.reviews.slice(0, 2).map((review) => (
          <figure key={review.id} className="relative rounded-2xl bg-aurora-cream p-6">
            <span aria-hidden="true" className="absolute right-5 top-2 font-display text-6xl leading-none text-aurora-terracotta/25">
              &ldquo;
            </span>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Stars rating={review.rating} />
              {review.planName && (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-aurora-navy/70">{review.planName}</span>
              )}
            </div>
            {review.title && <p className="mb-1 font-semibold text-aurora-navy">{review.title}</p>}
            {review.comment && <blockquote className="mb-4 leading-relaxed text-aurora-navy/80">{review.comment}</blockquote>}
            <figcaption className="text-sm font-medium text-aurora-navy/60">{review.customerName}</figcaption>
          </figure>
        ))}
      </div>

      <div className="text-center">
        <Link
          to={`/club/${clubId}/reviews`}
          className="inline-flex items-center gap-2 font-semibold text-aurora-terracotta transition-colors duration-200 hover:text-aurora-terracottaDark"
        >
          Ver {data.total === 1 ? 'la reseña' : `las ${data.total} reseñas`} de {clubName}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
};

export default ClubFeaturedReviews;