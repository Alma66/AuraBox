import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api, { getResponseData } from '../api/config';
import { useAuth } from '../App';
import { Club, SubscriptionPlan } from '../types/club';
import { Review, ReviewEligibility, ReviewSummary } from '../types/review';
import SafeImage from '../components/common/SafeImage';
import Reveal from '../components/common/Reveal';

const REVIEWS_PAGE_SIZE = 5;
const MAX_MEDIA = 5;
const money = (value: number) => `ARS ${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;

const StarsDisplay: React.FC<{ rating: number; size?: string }> = ({ rating, size = 'w-4 h-4' }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`${size} ${i < Math.round(rating) ? 'text-aurora-gold fill-current' : 'text-aurora-navy/15'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const SubscriptionPlanDetailPage: React.FC = () => {
  const { clubId, planId } = useParams<{ clubId: string; planId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userRole } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);

  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsOffset, setReviewsOffset] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewFiles, setReviewFiles] = useState<File[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setLoadFailed(false);
      try {
        const [cr, pr] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/subscription-types/${planId}`),
        ]);
        const clubData = getResponseData(cr);
        const rawPlan = getResponseData(pr);
        setClub(clubData);
        if (rawPlan && String(rawPlan.idClub ?? clubId) === String(clubId)) {
          setPlan({
            planId: String(rawPlan.id),
            name: rawPlan.name ?? '',
            description: rawPlan.description ?? '',
            price: Number(rawPlan.basePrice ?? rawPlan.price ?? 0),
            currency: 'ARS',
            image: rawPlan.imageUrl ?? rawPlan.image ?? '/assets/default-plan.svg',
            deliveryFrequency: rawPlan.frequency ?? rawPlan.deliveryFrequency ?? '',
            includes: rawPlan.includes ?? [],
            shippingAreas: rawPlan.shippingAreas ?? '',
            specifications: rawPlan.specifications ?? [],
            descuentoTransferencia: rawPlan.transferDiscount ? Number(rawPlan.transferDiscount) : 0,
            descuentoEfectivo: rawPlan.cashDiscount ? Number(rawPlan.cashDiscount) : 0,
            activo: rawPlan.active ?? true,
          });
        }
      } catch (e: any) {
        if (e?.response?.status !== 404) setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    };
    if (clubId && planId) fetch();
  }, [clubId, planId, reloadKey]);

  const fetchReviewsPage = useCallback(async (offset: number) => {
    if (!planId) return;
    const res = await api.get(`/reviews/by-subscription-type/${planId}?limit=${REVIEWS_PAGE_SIZE}&offset=${offset}`);
    return getResponseData(res) as { reviews: Review[]; total: number };
  }, [planId]);

  useEffect(() => {
    const loadInitialReviews = async () => {
      if (!planId) return;
      setLoadingReviews(true);
      try {
        const [summaryRes, reviewsData] = await Promise.all([
          api.get(`/reviews/summary/by-subscription-type/${planId}`),
          fetchReviewsPage(0),
        ]);
        setReviewSummary(getResponseData(summaryRes));
        if (reviewsData) {
          setReviews(reviewsData.reviews);
          setReviewsTotal(reviewsData.total);
          setReviewsOffset(reviewsData.reviews.length);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingReviews(false);
      }
    };
    loadInitialReviews();
  }, [planId, fetchReviewsPage]);

  const loadMoreReviews = async () => {
    setLoadingMoreReviews(true);
    try {
      const data = await fetchReviewsPage(reviewsOffset);
      if (data) {
        setReviews((prev) => [...prev, ...data.reviews]);
        setReviewsOffset((prev) => prev + data.reviews.length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMoreReviews(false);
    }
  };

  const fetchEligibility = useCallback(async () => {
    if (!planId || !isAuthenticated || userRole !== 'customer') {
      setEligibility(null);
      return;
    }
    try {
      const res = await api.get(`/reviews/eligibility/${planId}`);
      setEligibility(getResponseData(res));
    } catch {
      setEligibility(null);
    }
  }, [planId, isAuthenticated, userRole]);

  useEffect(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  const handleSubscribeNow = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (userRole !== 'customer') {
      setSubscribeError('Solo los clientes pueden suscribirse a un plan.');
      return;
    }
    if (!planId) return;
    setSubscribing(true);
    setSubscribeError('');
    try {
      await api.post('/cart-items', { idSubscriptionTypes: Number(planId) });
      navigate('/checkout');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setSubscribeError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al suscribirte. Intentá nuevamente.'));
    } finally {
      setSubscribing(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (userRole !== 'customer') {
      setCartError('Solo los clientes pueden agregar planes al carrito.');
      return;
    }
    if (!planId) return;
    setAddingToCart(true);
    setCartError('');
    try {
      await api.post('/cart-items', { idSubscriptionTypes: Number(planId) });
      setAddedToCart(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setCartError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al agregar al carrito. Intentá nuevamente.'));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (reviewFiles.length + files.length > MAX_MEDIA) {
      setReviewError(`Como máximo se permiten ${MAX_MEDIA} archivos por reseña.`);
      e.target.value = '';
      return;
    }
    setReviewFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const handleRemoveReviewFile = (index: number) => {
    setReviewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!planId) return;
    if (reviewRating < 1) {
      setReviewError('Elegí una calificación de 1 a 5 estrellas para publicar tu reseña.');
      return;
    }
    setSubmittingReview(true);
    setReviewError('');
    try {
      const res = await api.post('/reviews', {
        idSubscriptionTypes: Number(planId),
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      const created: Review = getResponseData(res);

      if (reviewFiles.length > 0) {
        const formData = new FormData();
        reviewFiles.forEach((file) => formData.append('files', file));
        await api.post(`/reviews/${created.id}/media`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setReviewSuccess(true);
      setShowReviewForm(false);
      setReviewTitle('');
      setReviewComment('');
      setReviewFiles([]);
      setReviewRating(0);
      fetchEligibility();

      const summaryRes = await api.get(`/reviews/summary/by-subscription-type/${planId}`);
      setReviewSummary(getResponseData(summaryRes));
      const reviewsData = await fetchReviewsPage(0);
      if (reviewsData) {
        setReviews(reviewsData.reviews);
        setReviewsTotal(reviewsData.total);
        setReviewsOffset(reviewsData.reviews.length);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setReviewError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al publicar tu reseña.'));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-aurora-cream">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
    </div>
  );

  if (loadFailed) return (
    <div role="alert" className="flex min-h-screen items-center justify-center bg-aurora-cream px-4 text-center">
      <div>
        <p className="mb-2 font-display text-4xl font-medium text-aurora-navy">No pudimos cargar el plan</p>
        <p className="mb-6 text-aurora-navy/60">Revisá tu conexión e intentá de nuevo.</p>
        <button type="button" onClick={() => setReloadKey((current) => current + 1)} className="btn-primary">
          Reintentar
        </button>
      </div>
    </div>
  );

  if (!club || !plan) return (
    <div className="flex min-h-screen items-center justify-center bg-aurora-cream px-4 text-center">
      <div>
        <p className="mb-4 font-display text-4xl font-medium text-aurora-navy">Plan no encontrado</p>
        <Link to={`/club/${clubId}`} className="btn-outline">Volver al club</Link>
      </div>
    </div>
  );

  const descuento = Math.max(plan.descuentoTransferencia ?? 0, plan.descuentoEfectivo ?? 0);
  const cashDiscount = plan.descuentoEfectivo ?? 0;
  const transferDiscount = plan.descuentoTransferencia ?? 0;

  const canSubscribe = plan.activo !== false;
  const canShowReviewForm = eligibility?.eligible && !showReviewForm && !reviewSuccess;

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div className="hero-mesh grain relative overflow-hidden">
        <div className="container relative mx-auto px-4 pb-24 pt-10 md:pb-28">
          <nav aria-label="Ruta" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/70">
            <Link to="/explore" className="transition-colors hover:text-white">Explorar</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/club/${clubId}`} className="transition-colors hover:text-white">{club.name}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">{plan.name}</span>
          </nav>
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-aurora-goldLight">{club.name}</span>
          <h1 className="font-display text-4xl font-normal leading-tight text-white md:text-6xl">{plan.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {plan.deliveryFrequency && (
              <span className="glass rounded-full px-4 py-1.5 text-sm font-semibold text-white">{plan.deliveryFrequency}</span>
            )}
            {reviewSummary && reviewSummary.count > 0 && (
              <span className="glass flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-white">
                <StarsDisplay rating={reviewSummary.average} />
                <span className="font-semibold">{reviewSummary.average.toFixed(1)}</span>
                <span className="text-white/70">({reviewSummary.count} reseña{reviewSummary.count !== 1 ? 's' : ''})</span>
              </span>
            )}
            {!plan.activo && (
              <span className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-bold text-white">Inactivo</span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto -mt-16 px-4 pb-16 md:-mt-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-aurora-lg ring-1 ring-aurora-navy/5">
              <SafeImage src={plan.image} alt={plan.name} fallbackIcon="📦" className="h-72 w-full object-cover md:h-[26rem]" />
              {descuento > 0 && (
                <span className="absolute right-4 top-4 rounded-full bg-aurora-terracotta px-4 py-1.5 text-sm font-bold text-white shadow-aurora-glow">
                  Hasta -{descuento}%
                </span>
              )}
            </div>

            <div className="space-y-8 rounded-3xl bg-white p-6 shadow-aurora-sm ring-1 ring-aurora-navy/5 md:p-10">
              {plan.description && (
                <section>
                  <h2 className="mb-3 font-display text-3xl font-medium text-aurora-navy">Sobre este plan</h2>
                  <p className="whitespace-pre-line leading-relaxed text-aurora-navy/75">{plan.description}</p>
                </section>
              )}
              {(plan.includes ?? []).length > 0 && (
                <section>
                  <h2 className="mb-4 font-display text-3xl font-medium text-aurora-navy">Qué incluye</h2>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {plan.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-2xl bg-aurora-cream p-4 text-sm text-aurora-navy/80">
                        <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-aurora-terracotta/15 text-aurora-terracotta">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {(plan.specifications ?? []).length > 0 && (
                <section>
                  <h2 className="mb-4 font-display text-3xl font-medium text-aurora-navy">Especificaciones</h2>
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {plan.specifications.map((spec, i) => (
                      <div key={i} className="rounded-2xl border border-aurora-navy/10 px-4 py-3">
                        <dt className="text-xs font-semibold uppercase tracking-wider text-aurora-navy/50">{spec.type}</dt>
                        <dd className="mt-0.5 font-medium text-aurora-navy">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
              {plan.shippingAreas && (
                <section>
                  <h2 className="mb-3 font-display text-3xl font-medium text-aurora-navy">Zonas de envío</h2>
                  <p className="text-aurora-navy/75">{plan.shippingAreas}</p>
                </section>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="rounded-3xl bg-white p-6 shadow-aurora-lg ring-1 ring-aurora-navy/5 md:p-8 lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-widest text-aurora-navy/50">Precio del plan</p>
              <p className="mt-1 font-display text-5xl font-medium text-aurora-navy">{money(plan.price)}</p>
              {plan.deliveryFrequency && <p className="mt-1 text-sm text-aurora-navy/60">{plan.deliveryFrequency}</p>}

              {descuento > 0 && (
                <div className="mt-5 rounded-2xl bg-aurora-gold/10 p-4">
                  <p className="mb-2 text-sm font-semibold text-aurora-terracottaDark">Pagando de otra forma, ahorrás</p>
                  {cashDiscount > 0 && (
                    <p className="flex items-center justify-between gap-2 text-sm text-aurora-navy/80">
                      <span>Efectivo (-{cashDiscount}%)</span>
                      <span className="font-semibold text-green-700">{money(plan.price * (1 - cashDiscount / 100))}</span>
                    </p>
                  )}
                  {transferDiscount > 0 && (
                    <p className="mt-1 flex items-center justify-between gap-2 text-sm text-aurora-navy/80">
                      <span>Transferencia (-{transferDiscount}%)</span>
                      <span className="font-semibold text-green-700">{money(plan.price * (1 - transferDiscount / 100))}</span>
                    </p>
                  )}
                </div>
              )}

              {subscribeError && (
                <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {subscribeError}
                </div>
              )}
              {cartError && (
                <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {cartError}
                </div>
              )}
              {addedToCart && (
                <div role="status" className="mt-5 rounded-xl border border-aurora-navy/15 bg-aurora-navy/5 px-4 py-3 text-sm text-aurora-navy">
                  Agregado a tu carrito. Podés seguir explorando o{' '}
                  <Link to="/cart" className="font-semibold underline">ir al carrito</Link>.
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={handleSubscribeNow}
                  disabled={subscribing || addingToCart || !canSubscribe}
                  className="btn-primary btn-shine w-full disabled:pointer-events-none disabled:opacity-50"
                >
                  {!canSubscribe ? 'Plan no disponible' : subscribing ? 'Redirigiendo...' : 'Suscribirme ahora'}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || subscribing || !canSubscribe}
                  className="btn-outline w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addingToCart ? 'Agregando...' : addedToCart ? 'Agregado ✓' : 'Agregar al carrito'}
                </button>
                <Link to={`/club/${clubId}`} className="pt-1 text-center text-sm font-semibold text-aurora-terracotta transition-colors hover:text-aurora-terracottaDark">
                  Volver a {club.name}
                </Link>
              </div>
            </div>
          </aside>
        </div>

        <Reveal className="mt-10">
          <section className="rounded-3xl bg-white p-6 shadow-aurora-sm ring-1 ring-aurora-navy/5 md:p-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="section-eyebrow">Opiniones</span>
                <h2 className="font-display text-3xl font-medium text-aurora-navy md:text-4xl">Reseñas de este plan</h2>
              </div>
              {reviewSummary && reviewSummary.count > 0 && (
                <div className="flex items-center gap-3 rounded-2xl bg-aurora-cream px-5 py-3">
                  <span className="font-display text-4xl font-medium text-aurora-navy">{reviewSummary.average.toFixed(1)}</span>
                  <div>
                    <StarsDisplay rating={reviewSummary.average} />
                    <span className="text-xs text-aurora-navy/60">{reviewSummary.count} reseña{reviewSummary.count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}
            </div>

            {reviewSuccess && (
              <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                ¡Gracias por tu reseña!
              </div>
            )}

            {eligibility?.alreadyReviewed && !reviewSuccess && (
              <div className="mb-6 rounded-xl border border-aurora-navy/10 bg-aurora-cream px-4 py-3 text-sm text-aurora-navy/70">
                Ya dejaste una reseña para esta suscripción. Podés editarla desde{' '}
                <Link to="/customer/reviews" className="font-semibold underline">Mis Reseñas</Link>.
              </div>
            )}

            {isAuthenticated && userRole === 'customer' && eligibility && !eligibility.eligible && !eligibility.alreadyReviewed && (
              <div className="mb-6 rounded-xl border border-aurora-navy/10 bg-aurora-cream px-4 py-3 text-sm text-aurora-navy/70">
                Solo podés dejar una reseña si estás suscripto a este plan, o si cancelaste tu suscripción hace menos de 30 días.
              </div>
            )}

            {canShowReviewForm && (
              <button onClick={() => setShowReviewForm(true)} className="btn-primary mb-6 !py-2.5 text-sm">
                Dejar una reseña
              </button>
            )}

            {showReviewForm && (
              <div className="mb-6 rounded-2xl border border-aurora-navy/10 bg-aurora-cream p-5 md:p-6">
                {reviewError && (
                  <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {reviewError}
                  </div>
                )}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-aurora-navy">
                    Calificación <span className="text-aurora-terracotta" aria-hidden="true">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
                        aria-pressed={n === reviewRating}
                        onClick={() => {
                          setReviewRating(n);
                          setReviewError('');
                        }}
                        className="transition-transform hover:scale-110"
                      >
                        <svg
                          className={`h-8 w-8 ${n <= reviewRating ? 'fill-current text-aurora-gold' : 'text-aurora-navy/15'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-aurora-navy/50">
                      {reviewRating > 0 ? `${reviewRating} de 5` : 'Tocá una estrella'}
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="review-title" className="mb-1 block text-sm font-semibold text-aurora-navy">Título (opcional)</label>
                  <input
                    id="review-title"
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    maxLength={120}
                    className="input-aurora bg-white"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="review-comment" className="mb-1 block text-sm font-semibold text-aurora-navy">Comentario</label>
                  <textarea
                    id="review-comment"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    className="input-aurora resize-none bg-white"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-aurora-navy">
                    Fotos y videos ({reviewFiles.length} / {MAX_MEDIA})
                  </label>
                  {reviewFiles.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-3">
                      {reviewFiles.map((file, i) => (
                        <div key={i} className="relative">
                          <img src={URL.createObjectURL(file)} alt="Nuevo" className="h-20 w-20 rounded-lg object-cover" />
                          <button
                            onClick={() => handleRemoveReviewFile(i)}
                            aria-label="Quitar archivo"
                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {reviewFiles.length < MAX_MEDIA && (
                    <input type="file" accept="image/*,video/*" multiple onChange={handleReviewFilesSelected} className="text-sm text-aurora-navy/70" />
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReviewForm(false)}
                    disabled={submittingReview}
                    className="btn-outline flex-1 !py-2.5 text-sm disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="btn-primary flex-1 !py-2.5 text-sm disabled:pointer-events-none disabled:opacity-50"
                  >
                    {submittingReview ? 'Publicando...' : 'Publicar reseña'}
                  </button>
                </div>
              </div>
            )}

            {loadingReviews ? (
              <div className="py-8 text-center text-sm text-aurora-navy/40">Cargando reseñas...</div>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-aurora-navy/50">Todavía no hay reseñas para esta suscripción.</p>
            ) : (
              <div className="space-y-5">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-2xl bg-aurora-cream p-5 md:p-6">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <StarsDisplay rating={review.rating} />
                      <span className="text-xs text-aurora-navy/50">
                        {new Date(review.reviewDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    {review.title && <p className="mb-1 font-semibold text-aurora-navy">{review.title}</p>}
                    {review.comment && <p className="text-sm leading-relaxed text-aurora-navy/75">{review.comment}</p>}
                    {review.media && review.media.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {review.media.map((m) => (
                          m.mediaType === 'Video' ? (
                            <video key={m.id} src={m.mediaUrl} controls className="h-24 w-24 rounded-lg object-cover" />
                          ) : (
                            <img key={m.id} src={m.mediaUrl} alt="Reseña" className="h-24 w-24 rounded-lg object-cover" />
                          )
                        ))}
                      </div>
                    )}
                  </article>
                ))}
                {reviewsOffset < reviewsTotal && (
                  <div className="pt-2 text-center">
                    <button
                      onClick={loadMoreReviews}
                      disabled={loadingMoreReviews}
                      className="btn-outline !py-2 text-sm disabled:opacity-50"
                    >
                      {loadingMoreReviews ? 'Cargando...' : 'Ver más reseñas'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </Reveal>
      </div>
    </div>
  );
};

export default SubscriptionPlanDetailPage;