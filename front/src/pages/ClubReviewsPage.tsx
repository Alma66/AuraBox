import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getResponseData } from '../api/config';

interface PublicReviewMedia {
  id: number;
  mediaUrl: string;
  mediaType: string;
}

interface PublicReview {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  reviewDate: string;
  customerName: string;
  planName: string | null;
  media: PublicReviewMedia[];
}

interface ReviewsSummary {
  average: number;
  count: number;
  distribution: Record<number, number>;
}

interface ReviewsPage {
  reviews: PublicReview[];
  total: number;
  summary: ReviewsSummary;
}

const PAGE_SIZE = 10;

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

const Stars: React.FC<{ rating: number; size?: string }> = ({ rating, size = 'w-4 h-4' }) => (
  <div className="flex" role="img" aria-label={`${rating.toFixed(1)} de 5 estrellas`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <svg
        key={n}
        className={`${size} ${n <= Math.round(rating) ? 'text-aurora-gold' : 'text-aurora-navy/15'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d={STAR_PATH} />
      </svg>
    ))}
  </div>
);

const ClubReviewsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [clubName, setClubName] = useState('');
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<ReviewsSummary | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (offset: number, filter: number | null) => {
      const query = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
      if (filter) query.set('rating', String(filter));
      const res = await api.get(`/reviews/public/by-club/${clubId}?${query.toString()}`);
      return getResponseData(res) as ReviewsPage;
    },
    [clubId],
  );

  const loadFirst = useCallback(
    async (filter: number | null) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPage(0, filter);
        setReviews(data.reviews);
        setTotal(data.total);
        setSummary(data.summary);
      } catch (err) {
        console.error(err);
        setError('No pudimos cargar las reseñas de este club.');
      } finally {
        setLoading(false);
      }
    },
    [fetchPage],
  );

  useEffect(() => {
    loadFirst(rating);
  }, [loadFirst, rating]);

  useEffect(() => {
    const loadClub = async () => {
      try {
        const res = await api.get(`/clubs/${clubId}`);
        setClubName(getResponseData(res)?.name ?? '');
      } catch {
        setClubName('');
      }
    };
    if (clubId) loadClub();
  }, [clubId]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await fetchPage(reviews.length, rating);
      setReviews((prev) => [...prev, ...data.reviews]);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      setError('No pudimos cargar más reseñas.');
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleRating = (star: number) => {
    setRating((current) => (current === star ? null : star));
  };

  const maxCount = summary ? Math.max(1, ...Object.values(summary.distribution)) : 1;

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div className="border-b border-aurora-navy/10 bg-white">
        <div className="container mx-auto flex items-center gap-3 px-4 py-5">
          <Link
            to={`/club/${clubId}`}
            aria-label="Volver al club"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-aurora-navy/40 transition hover:text-aurora-navy"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            {clubName && (
              <p className="text-xs font-medium uppercase tracking-wide text-aurora-navy/50">{clubName}</p>
            )}
            <h1 className="font-display text-2xl font-bold text-aurora-navy">Todas las reseñas</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl space-y-6 px-4 py-10">
        {error && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => loadFirst(rating)}
              className="mt-3 min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {summary && summary.count > 0 && (
          <section className="card-surface grid grid-cols-1 gap-8 p-6 sm:grid-cols-3 sm:p-8">
            <div className="text-center sm:col-span-1">
              <p className="font-display text-5xl font-bold text-aurora-navy">{summary.average.toFixed(1)}</p>
              <div className="mt-2 flex justify-center">
                <Stars rating={summary.average} size="w-5 h-5" />
              </div>
              <p className="mt-2 text-sm text-aurora-navy/60">
                {summary.count} reseña{summary.count !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.distribution[star] ?? 0;
                const active = rating === star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => toggleRating(star)}
                    aria-pressed={active}
                    className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-2 text-sm transition-colors ${
                      active ? 'bg-aurora-terracotta/10' : 'hover:bg-aurora-cream'
                    }`}
                  >
                    <span className="w-10 flex-shrink-0 text-left font-semibold text-aurora-navy">{star} ★</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-aurora-navy/10">
                      <span
                        className="block h-full rounded-full bg-aurora-gold"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </span>
                    <span className="w-8 flex-shrink-0 text-right text-aurora-navy/60">{count}</span>
                  </button>
                );
              })}
              {rating && (
                <button
                  type="button"
                  onClick={() => setRating(null)}
                  className="min-h-[44px] px-2 text-sm font-semibold text-aurora-terracotta hover:underline"
                >
                  Quitar filtro de {rating} estrellas
                </button>
              )}
            </div>
          </section>
        )}

        {loading ? (
          <div className="animate-pulse space-y-4" aria-busy="true">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-32 rounded-2xl bg-aurora-navy/10" />
            ))}
          </div>
        ) : reviews.length === 0 && !error ? (
          <div className="card-surface px-6 py-16 text-center text-sm text-aurora-navy/60">
            {rating
              ? `No hay reseñas de ${rating} estrellas.`
              : 'Este club todavía no tiene reseñas.'}
          </div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="card-surface p-6">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <Stars rating={review.rating} />
                  <span className="text-xs text-aurora-navy/40">
                    {new Date(review.reviewDate).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {review.title && <p className="mb-1 font-semibold text-aurora-navy">{review.title}</p>}
                {review.comment && (
                  <p className="text-sm leading-relaxed text-aurora-navy/75">{review.comment}</p>
                )}
                {review.media.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.media.map((item) =>
                      item.mediaType === 'Video' ? (
                        <video
                          key={item.id}
                          src={item.mediaUrl}
                          controls
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                      ) : (
                        <a key={item.id} href={item.mediaUrl} target="_blank" rel="noopener noreferrer">
                          <img
                            src={item.mediaUrl}
                            alt="Foto de la reseña"
                            className="h-24 w-24 rounded-lg object-cover"
                          />
                        </a>
                      ),
                    )}
                  </div>
                )}
                <p className="mt-4 text-xs text-aurora-navy/50">
                  <span className="font-semibold text-aurora-navy/70">{review.customerName}</span>
                  {review.planName ? ` · ${review.planName}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}

        {!loading && reviews.length < total && (
          <div className="text-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="btn-outline !py-3 text-sm disabled:opacity-50"
            >
              {loadingMore ? 'Cargando...' : 'Ver más reseñas'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubReviewsPage;
