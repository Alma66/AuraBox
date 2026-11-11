import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../api/config';
import { useAuth } from '../../App';
import SafeImage from '../../components/common/SafeImage';
import BottomSheet from '../../components/native/BottomSheet';
import Reveal from '../../components/native/Reveal';
import StarRating from '../../components/native/StarRating';
import { Club, SubscriptionPlan } from '../../types/club';
import { Review, ReviewEligibility, ReviewSummary } from '../../types/review';
import { notifyCartChanged } from '../../utils/cartEvents';
import { formatMoney } from '../../utils/money';
import { tapFeedback } from '../../utils/native';

const REVIEWS_PAGE_SIZE = 5;
const MAX_MEDIA = 5;
const HEART_PATH =
  'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z';

const extractMessage = (error: any, fallback: string): string => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join(', ');
  return typeof message === 'string' && message ? message : fallback;
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Reveal>
    <h2 className="mb-3 font-display text-xl font-bold text-aurora-navy">{title}</h2>
    {children}
  </Reveal>
);

const NativePlanDetailPage: React.FC = () => {
  const { clubId, planId } = useParams<{ clubId: string; planId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userRole } = useAuth();
  const isCustomer = isAuthenticated && userRole === 'customer';

  const [club, setClub] = useState<Club | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState<'cart' | 'subscribe' | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsFailed, setReviewsFailed] = useState(false);
  const [reviewsReloadKey, setReviewsReloadKey] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewFiles, setReviewFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (!clubId || !planId) return;
    let active = true;
    const loadPlan = async () => {
      setLoading(true);
      setLoadFailed(false);
      setAddedToCart(false);
      try {
        const [clubResponse, planResponse] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/subscription-types/${planId}`),
        ]);
        if (!active) return;
        const rawPlan = getResponseData(planResponse);
        setClub(getResponseData(clubResponse));
        if (rawPlan && String(rawPlan.idClub ?? clubId) === String(clubId)) {
          setPlan({
            planId: String(rawPlan.id),
            name: rawPlan.name ?? '',
            description: rawPlan.description ?? '',
            price: Number(rawPlan.basePrice ?? rawPlan.price ?? 0),
            currency: 'ARS',
            image: rawPlan.imageUrl ?? rawPlan.image ?? '',
            deliveryFrequency: rawPlan.frequency ?? rawPlan.deliveryFrequency ?? '',
            includes: rawPlan.includes ?? [],
            shippingAreas: rawPlan.shippingAreas ?? '',
            specifications: rawPlan.specifications ?? [],
            descuentoTransferencia: rawPlan.transferDiscount ? Number(rawPlan.transferDiscount) : 0,
            descuentoEfectivo: rawPlan.cashDiscount ? Number(rawPlan.cashDiscount) : 0,
            activo: rawPlan.active ?? true,
          });
        } else {
          setPlan(null);
        }
      } catch (err: any) {
        if (active) {
          setPlan(null);
          if (err?.response?.status !== 404) setLoadFailed(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadPlan();
    return () => {
      active = false;
    };
  }, [clubId, planId, reloadKey]);

  const fetchReviewsPage = useCallback(
    async (offset: number) => {
      const response = await api.get(`/reviews/by-subscription-type/${planId}?limit=${REVIEWS_PAGE_SIZE}&offset=${offset}`);
      return getResponseData(response) as { reviews: Review[]; total: number };
    },
    [planId],
  );

  useEffect(() => {
    if (!planId) return;
    let active = true;
    const loadReviews = async () => {
      setReviewsLoading(true);
      setReviewsFailed(false);
      try {
        const [summaryResponse, page] = await Promise.all([
          api.get(`/reviews/summary/by-subscription-type/${planId}`),
          fetchReviewsPage(0),
        ]);
        if (!active) return;
        setReviewSummary(getResponseData(summaryResponse));
        setReviews(page.reviews);
        setReviewsTotal(page.total);
      } catch {
        if (active) setReviewsFailed(true);
      } finally {
        if (active) setReviewsLoading(false);
      }
    };
    loadReviews();
    return () => {
      active = false;
    };
  }, [planId, fetchReviewsPage, reviewsReloadKey]);

  const fetchEligibility = useCallback(async () => {
    if (!planId || !isCustomer) {
      setEligibility(null);
      return;
    }
    try {
      const response = await api.get(`/reviews/eligibility/${planId}`);
      setEligibility(getResponseData(response));
    } catch {
      setEligibility(null);
    }
  }, [planId, isCustomer]);

  useEffect(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  useEffect(() => {
    if (!planId || !isCustomer) {
      setFavorite(false);
      return;
    }
    let active = true;
    const checkFavorite = async () => {
      try {
        const response = await api.get(`/favorites/check/${planId}`);
        if (active) setFavorite(Boolean(getResponseData(response)?.isFavorite));
      } catch {
        if (active) setFavorite(false);
      }
    };
    checkFavorite();
    return () => {
      active = false;
    };
  }, [planId, isCustomer]);

  const previews = useMemo(
    () => reviewFiles.map((file) => ({ url: URL.createObjectURL(file), isVideo: file.type.startsWith('video/') })),
    [reviewFiles],
  );

  useEffect(
    () => () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    },
    [previews],
  );

  const goToLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
  };

  const requireCustomer = (): boolean => {
    if (!isAuthenticated) {
      goToLogin();
      return false;
    }
    if (userRole !== 'customer') {
      toast.error('Solo los clientes pueden suscribirse a un plan.');
      return false;
    }
    return true;
  };

  const addPlanToCart = async (): Promise<boolean> => {
    try {
      await api.post('/cart-items', { idSubscriptionTypes: Number(planId) });
      notifyCartChanged();
      return true;
    } catch (err: any) {
      toast.error(extractMessage(err, 'No pudimos agregar el plan. Intentá nuevamente.'));
      return false;
    }
  };

  const handleAddToCart = async () => {
    tapFeedback();
    if (addedToCart) {
      navigate('/cart');
      return;
    }
    if (busy || !requireCustomer()) return;
    setBusy('cart');
    const ok = await addPlanToCart();
    setBusy(null);
    if (ok) {
      setAddedToCart(true);
      toast.success('Agregado a tu carrito');
    }
  };

  const handleSubscribe = async () => {
    tapFeedback();
    if (busy || !requireCustomer()) return;
    setBusy('subscribe');
    const ok = await addPlanToCart();
    setBusy(null);
    if (ok) navigate('/checkout');
  };

  const handleToggleFavorite = async () => {
    tapFeedback();
    if (!isAuthenticated) {
      goToLogin();
      return;
    }
    if (!isCustomer || favoriteBusy) return;
    setFavoriteBusy(true);
    try {
      const response = await api.post(`/favorites/toggle/${planId}`);
      setFavorite(Boolean(getResponseData(response)?.isFavorite));
    } catch {
      toast.error('No pudimos actualizar tus favoritos. Intentá de nuevo.');
    } finally {
      setFavoriteBusy(false);
    }
  };

  const loadMoreReviews = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchReviewsPage(reviews.length);
      setReviews((previous) => [...previous, ...page.reviews]);
      setReviewsTotal(page.total);
    } catch {
      toast.error('No pudimos cargar más reseñas.');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (reviewFiles.length + files.length > MAX_MEDIA) {
      setReviewError(`Como máximo se permiten ${MAX_MEDIA} archivos por reseña.`);
      return;
    }
    setReviewError('');
    setReviewFiles((previous) => [...previous, ...files]);
  };

  const handleSubmitReview = async () => {
    if (!planId || submitting) return;
    if (reviewRating < 1) {
      setReviewError('Elegí una calificación de 1 a 5 estrellas para publicar tu reseña.');
      return;
    }
    setSubmitting(true);
    setReviewError('');
    try {
      const response = await api.post('/reviews', {
        idSubscriptionTypes: Number(planId),
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      const created: Review = getResponseData(response);
      if (reviewFiles.length > 0) {
        const formData = new FormData();
        reviewFiles.forEach((file) => formData.append('files', file));
        await api.post(`/reviews/${created.id}/media`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setReviewSuccess(true);
      setSheetOpen(false);
      setReviewTitle('');
      setReviewComment('');
      setReviewFiles([]);
      setReviewRating(0);
      toast.success('¡Gracias por tu reseña!');
      fetchEligibility();
      setReviewsReloadKey((value) => value + 1);
    } catch (err: any) {
      setReviewError(extractMessage(err, 'No pudimos publicar tu reseña. Intentá de nuevo.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !plan) {
    return (
      <div className="animate-pulse">
        <div className="h-72 bg-aurora-navy/10" />
        <div className="space-y-3 px-4 pt-6">
          <div className="h-8 w-2/3 rounded-lg bg-aurora-navy/10" />
          <div className="h-6 w-1/3 rounded bg-aurora-navy/10" />
          <div className="h-32 rounded-3xl bg-aurora-navy/10" />
        </div>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div role="alert" className="px-6 py-16 text-center">
        <p className="text-5xl" aria-hidden="true">📡</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-aurora-navy">No pudimos cargar el plan</h1>
        <p className="mt-2 text-sm text-aurora-navy/60">Revisá tu conexión e intentá de nuevo.</p>
        <button
          type="button"
          onClick={() => {
            tapFeedback();
            setReloadKey((value) => value + 1);
          }}
          className="btn-primary mt-6"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!club || !plan) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-5xl" aria-hidden="true">🔎</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-aurora-navy">Plan no encontrado</h1>
        <p className="mt-2 text-sm text-aurora-navy/60">Puede que ya no esté disponible.</p>
        <Link to={`/club/${clubId}`} className="btn-primary mt-6">
          Volver al club
        </Link>
      </div>
    );
  }

  const cash = plan.descuentoEfectivo ?? 0;
  const transfer = plan.descuentoTransferencia ?? 0;
  const best = Math.max(cash, transfer);
  const available = plan.activo !== false;
  const includes = plan.includes ?? [];
  const specifications = plan.specifications ?? [];
  const planImage = plan.image && !plan.image.includes('/assets/') ? plan.image : '';
  const canReview = Boolean(eligibility?.eligible) && !reviewSuccess;

  return (
    <div className="bg-aurora-cream pb-28">
      <section className="relative">
        <div className="h-72 bg-aurora-cream">
          <SafeImage src={planImage} alt={plan.name} fallbackIcon="📦" className="h-full w-full object-cover" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-aurora-navyDark/40 via-transparent to-transparent" />
        {best > 0 && available && (
          <span className="absolute left-4 top-4 rounded-full bg-aurora-terracotta px-3.5 py-1.5 text-sm font-bold text-white shadow-aurora-sm">
            Hasta -{best}%
          </span>
        )}
        {!available && (
          <span className="absolute left-4 top-4 rounded-full bg-aurora-navyDark/85 px-3.5 py-1.5 text-sm font-bold text-white">
            No disponible
          </span>
        )}
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={favoriteBusy}
          aria-pressed={favorite}
          aria-label={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className={`absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-aurora-sm transition-transform active:scale-90 disabled:opacity-60 ${
            favorite ? 'text-aurora-terracotta' : 'text-aurora-navy/40'
          }`}
        >
          <svg className="h-6 w-6" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={favorite ? 0 : 2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={HEART_PATH} />
          </svg>
        </button>
      </section>

      <div className="relative -mt-7 rounded-t-[2rem] bg-aurora-cream px-4 pt-7">
        <Link
          to={`/club/${club.id}`}
          onClick={() => {
            tapFeedback();
          }}
          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-aurora-terracotta"
        >
          {club.name}
          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight text-aurora-navy">{plan.name}</h1>
        {plan.deliveryFrequency && (
          <span className="mt-2 inline-flex rounded-full bg-aurora-gold/15 px-3 py-1 text-xs font-bold text-aurora-terracottaDark">
            {plan.deliveryFrequency}
          </span>
        )}
        {reviewSummary && reviewSummary.count > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <StarRating value={reviewSummary.average} className="h-5 w-5" />
            <span className="text-sm font-bold text-aurora-navy">{reviewSummary.average.toFixed(1)}</span>
            <span className="text-sm text-aurora-navy/50">
              ({reviewSummary.count} {reviewSummary.count === 1 ? 'reseña' : 'reseñas'})
            </span>
          </div>
        )}

        <div className="mt-5 rounded-3xl bg-white p-5 shadow-aurora-sm ring-1 ring-aurora-navy/5">
          <p className="font-display text-4xl font-bold text-aurora-navy">{formatMoney(plan.price)}</p>
          {cash > 0 && (
            <p className="mt-1 text-sm font-semibold text-green-700">
              Efectivo -{cash}%: {formatMoney(plan.price * (1 - cash / 100))}
            </p>
          )}
          {transfer > 0 && (
            <p className="mt-0.5 text-sm font-semibold text-green-700">
              Transferencia -{transfer}%: {formatMoney(plan.price * (1 - transfer / 100))}
            </p>
          )}
        </div>

        <div className="mt-10 space-y-10">
          {plan.description && (
            <Section title="Descripción">
              <p className="selectable text-[15px] leading-relaxed text-aurora-navy/75">{plan.description}</p>
            </Section>
          )}

          {includes.length > 0 && (
            <Section title="¿Qué incluye?">
              <ul className="space-y-2.5 rounded-3xl bg-white p-5 shadow-aurora-sm ring-1 ring-aurora-navy/5">
                {includes.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex items-start gap-3 text-[15px] text-aurora-navy/80">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-aurora-terracotta/10 text-aurora-terracotta">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3.2} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {specifications.length > 0 && (
            <Section title="Especificaciones">
              <div className="flex flex-wrap gap-2">
                {specifications.map((spec, index) => (
                  <span key={`${spec.type}-${index}`} className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-aurora-navy/75 shadow-aurora-sm ring-1 ring-aurora-navy/5">
                    {spec.type}: {spec.value}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {plan.shippingAreas && plan.shippingAreas.trim() && (
            <Section title="Zonas de envío">
              <p className="text-[15px] leading-relaxed text-aurora-navy/75">{plan.shippingAreas}</p>
            </Section>
          )}

          {best > 0 && (
            <Reveal>
              <div className="rounded-3xl bg-aurora-gold/15 p-5 ring-1 ring-aurora-gold/30">
                <p className="font-display text-lg font-bold text-aurora-terracottaDark">Descuentos disponibles</p>
                {transfer > 0 && <p className="mt-1 text-sm text-aurora-terracottaDark">{transfer}% pagando por transferencia</p>}
                {cash > 0 && <p className="mt-0.5 text-sm text-aurora-terracottaDark">{cash}% pagando en efectivo</p>}
              </div>
            </Reveal>
          )}

          <Section title="Reseñas">
            {reviewSuccess && (
              <p role="status" className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
                ¡Gracias por tu reseña!
              </p>
            )}
            {eligibility?.alreadyReviewed && !reviewSuccess && (
              <p className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm text-aurora-navy/70 ring-1 ring-aurora-navy/10">
                Ya dejaste una reseña para esta suscripción. Podés editarla desde{' '}
                <Link to="/customer/reviews" className="font-semibold text-aurora-terracotta">
                  Mis reseñas
                </Link>
                .
              </p>
            )}
            {isCustomer && eligibility && !eligibility.eligible && !eligibility.alreadyReviewed && (
              <p className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm text-aurora-navy/70 ring-1 ring-aurora-navy/10">
                Solo podés dejar una reseña si estás suscripto a este plan, o si cancelaste tu suscripción hace menos de 30 días.
              </p>
            )}
            {canReview && (
              <button
                type="button"
                onClick={() => {
                  tapFeedback();
                  setReviewError('');
                  setSheetOpen(true);
                }}
                className="btn-primary mb-5 w-full !py-3"
              >
                Dejar una reseña
              </button>
            )}

            {reviewsLoading ? (
              <div className="space-y-3">
                {[0, 1].map((item) => (
                  <div key={item} className="h-28 animate-pulse rounded-3xl bg-white shadow-aurora-sm" />
                ))}
              </div>
            ) : reviewsFailed ? (
              <div role="alert" className="rounded-3xl bg-white p-6 text-center shadow-aurora-sm ring-1 ring-aurora-navy/5">
                <p className="text-sm text-aurora-navy/70">No pudimos cargar las reseñas.</p>
                <button
                  type="button"
                  onClick={() => {
                    tapFeedback();
                    setReviewsReloadKey((value) => value + 1);
                  }}
                  className="btn-outline mt-3 !px-5 !py-2 !text-sm"
                >
                  Reintentar
                </button>
              </div>
            ) : reviews.length === 0 ? (
              <p className="rounded-3xl bg-white p-6 text-center text-sm text-aurora-navy/60 shadow-aurora-sm ring-1 ring-aurora-navy/5">
                Todavía no hay reseñas para este plan.
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => {
                  const author = `${review.customerFirstName ?? 'Cliente'} ${review.customerLastName ? `${review.customerLastName.charAt(0)}.` : ''}`.trim();
                  return (
                    <article key={review.id} className="rounded-3xl bg-white p-5 shadow-aurora-sm ring-1 ring-aurora-navy/5">
                      <div className="flex items-center justify-between gap-3">
                        <StarRating value={review.rating} />
                        <time className="text-xs text-aurora-navy/45" dateTime={review.reviewDate}>
                          {new Date(review.reviewDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </time>
                      </div>
                      {review.title && <p className="mt-3 font-semibold text-aurora-navy">{review.title}</p>}
                      {review.comment && <p className="selectable mt-1 text-sm leading-relaxed text-aurora-navy/70">{review.comment}</p>}
                      {review.media && review.media.length > 0 && (
                        <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1">
                          {review.media.map((item) =>
                            item.mediaType === 'Video' ? (
                              <video key={item.id} src={item.mediaUrl} controls className="h-24 w-24 shrink-0 rounded-2xl object-cover" />
                            ) : (
                              <img key={item.id} src={item.mediaUrl} alt="Foto de la reseña" loading="lazy" className="h-24 w-24 shrink-0 rounded-2xl object-cover" />
                            ),
                          )}
                        </div>
                      )}
                      <p className="mt-3 text-xs text-aurora-navy/50">{author}</p>
                    </article>
                  );
                })}
                {reviews.length < reviewsTotal && (
                  <button
                    type="button"
                    onClick={() => {
                      tapFeedback();
                      loadMoreReviews();
                    }}
                    disabled={loadingMore}
                    className="btn-outline w-full !py-3 disabled:opacity-50"
                  >
                    {loadingMore ? 'Cargando…' : 'Ver más reseñas'}
                  </button>
                )}
              </div>
            )}
          </Section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-aurora-navy/10 bg-white/95 px-4 pt-3 backdrop-blur-md">
        <div className="safe-bottom">
          <div className="flex items-center gap-3 pb-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-aurora-navy/55">{plan.deliveryFrequency || 'Suscripción'}</p>
              <p className="truncate font-display text-xl font-bold text-aurora-navy">{formatMoney(plan.price)}</p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!available || busy !== null}
              className="flex h-12 items-center justify-center rounded-full border-2 border-aurora-navy/20 px-4 text-sm font-semibold text-aurora-navy transition-transform active:scale-95 disabled:opacity-50"
            >
              {addedToCart ? 'Ver carrito' : busy === 'cart' ? 'Agregando…' : 'Al carrito'}
            </button>
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={!available || busy !== null}
              className="btn-primary h-12 !px-5 !text-sm"
            >
              {!available ? 'No disponible' : busy === 'subscribe' ? 'Un momento…' : 'Suscribirme'}
            </button>
          </div>
        </div>
      </div>

      <BottomSheet
        open={sheetOpen}
        title="Tu reseña"
        onClose={() => setSheetOpen(false)}
        footer={
          <button type="button" onClick={handleSubmitReview} disabled={submitting} className="btn-primary min-h-[48px] w-full disabled:opacity-60">
            {submitting ? 'Publicando…' : 'Publicar reseña'}
          </button>
        }
      >
        {reviewError && (
          <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {reviewError}
          </p>
        )}
        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-bold text-aurora-navy">
            Calificación <span className="text-aurora-terracotta" aria-hidden="true">*</span>
          </legend>
          
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} ${value === 1 ? 'estrella' : 'estrellas'}`}
                aria-pressed={value === reviewRating}
                onClick={() => {
                  tapFeedback();
                  setReviewRating(value);
                  setReviewError('');
                }}
                className="flex h-11 w-11 items-center justify-center"
              >
                <svg className={`h-9 w-9 ${value <= reviewRating ? 'text-aurora-gold' : 'text-aurora-navy/15'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </fieldset>
        <label className="mb-1 block text-sm font-bold text-aurora-navy" htmlFor="review-title">
          Título (opcional)
        </label>
        <input
          id="review-title"
          type="text"
          value={reviewTitle}
          onChange={(event) => setReviewTitle(event.target.value)}
          maxLength={120}
          className="input-aurora mb-4"
        />
        <label className="mb-1 block text-sm font-bold text-aurora-navy" htmlFor="review-comment">
          Comentario
        </label>
        <textarea
          id="review-comment"
          value={reviewComment}
          onChange={(event) => setReviewComment(event.target.value)}
          maxLength={2000}
          rows={4}
          className="input-aurora mb-4 resize-none"
        />
        <p className="mb-2 text-sm font-bold text-aurora-navy">
          Fotos y videos ({reviewFiles.length} / {MAX_MEDIA})
        </p>
        {previews.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {previews.map((preview, index) => (
              <div key={preview.url} className="relative">
                {preview.isVideo ? (
                  <video src={preview.url} muted className="h-20 w-20 rounded-2xl object-cover" />
                ) : (
                  <img src={preview.url} alt="Archivo adjunto" className="h-20 w-20 rounded-2xl object-cover" />
                )}
                <button
                  type="button"
                  aria-label="Quitar archivo"
                  onClick={() => setReviewFiles((previous) => previous.filter((_, position) => position !== index))}
                  className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {reviewFiles.length < MAX_MEDIA && (
          <label className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-aurora-navy/20 text-sm font-semibold text-aurora-navy/70 active:bg-aurora-cream">
            Agregar fotos o videos
            <input type="file" accept="image/*,video/*" multiple onChange={handleFilesSelected} className="hidden" />
          </label>
        )}
      </BottomSheet>
    </div>
  );
};

export default NativePlanDetailPage;