import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api, { getResponseData } from '../api/config';
import { useAuth } from '../App';
import { Club, SubscriptionPlan } from '../types/club';
import { Review, ReviewEligibility, ReviewSummary } from '../types/review';

const REVIEWS_PAGE_SIZE = 5;
const MAX_MEDIA = 5;

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

  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

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
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewFiles, setReviewFiles] = useState<File[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [cr, pr] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/subscription-types/${planId}`),
        ]);
        const clubData = getResponseData(cr);
        const rawPlan = getResponseData(pr);
        setClub(clubData);
        if (rawPlan) {
          setPlan({
            planId: String(rawPlan.id),
            name: rawPlan.name ?? '',
            description: rawPlan.description ?? '',
            price: Number(rawPlan.basePrice ?? rawPlan.price ?? 0),
            currency: 'ARS',
            image: rawPlan.imageUrl ?? rawPlan.image ?? '/assets/default-plan.jpg',
            deliveryFrequency: rawPlan.frequency ?? rawPlan.deliveryFrequency ?? '',
            includes: rawPlan.includes ?? [],
            shippingAreas: rawPlan.shippingAreas ?? '',
            specifications: rawPlan.specifications ?? [],
            descuentoTransferencia: rawPlan.transferDiscount ? Number(rawPlan.transferDiscount) : 0,
            descuentoEfectivo: rawPlan.cashDiscount ? Number(rawPlan.cashDiscount) : 0,
            activo: rawPlan.active ?? true,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (clubId && planId) fetch();
  }, [clubId, planId]);

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
      await api.post('/user-subscriptions', { idSubscriptionTypes: Number(planId) });
      setSubscribeSuccess(true);
      fetchEligibility();
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
      setReviewRating(5);
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
    <div className="min-h-screen flex items-center justify-center bg-aurora-cream">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
    </div>
  );

  if (!club || !plan) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4 bg-aurora-cream">
      <div>
        <p className="text-2xl font-display font-bold text-aurora-navy mb-4">Plan no encontrado</p>
        <Link to={`/club/${clubId}`} className="text-aurora-terracotta hover:underline text-sm">Volver al club</Link>
      </div>
    </div>
  );

  const descuento = Math.max(plan.descuentoTransferencia ?? 0, plan.descuentoEfectivo ?? 0);
  const precioFinal = plan.price * (1 - descuento / 100);
  const canSubscribe = plan.activo !== false;
  const canShowReviewForm = eligibility?.eligible && !showReviewForm && !reviewSuccess;

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div className="bg-white border-b border-aurora-navy/10">
        <div className="container mx-auto px-4 py-5 flex items-center gap-3">
          <Link to={`/club/${clubId}`} className="text-aurora-navy/40 hover:text-aurora-navy transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <p className="text-xs text-aurora-navy/50 uppercase tracking-wide font-medium">{club.name}</p>
            <h1 className="font-display text-2xl font-bold text-aurora-navy">{plan.name}</h1>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="card-surface overflow-hidden">
          <div className="relative">
            <img src={plan.image} alt={plan.name} className="w-full h-72 object-cover" />
            {!plan.activo && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Inactivo
              </div>
            )}
            {descuento > 0 && (
              <div className="absolute top-4 right-4 bg-aurora-terracotta text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-aurora-sm">
                -{descuento}% OFF
              </div>
            )}
          </div>
          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
              <div>
                <h2 className="font-display text-3xl font-bold text-aurora-navy mb-1">{plan.name}</h2>
                <p className="text-sm text-aurora-terracotta font-medium">{plan.deliveryFrequency}</p>
              </div>
              <div className="text-right shrink-0">
                {descuento > 0 ? (
                  <>
                    <p className="text-aurora-navy/40 line-through text-lg">ARS {plan.price.toLocaleString('es-AR')}</p>
                    <p className="font-display text-3xl font-bold text-green-600">ARS {precioFinal.toLocaleString('es-AR')}</p>
                    <p className="text-xs text-aurora-navy/50">Ahorrás {descuento}%</p>
                  </>
                ) : (
                  <p className="font-display text-3xl font-bold text-aurora-navy">ARS {plan.price.toLocaleString('es-AR')}</p>
                )}
              </div>
            </div>
            {reviewSummary && reviewSummary.count > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <StarsDisplay rating={reviewSummary.average} />
                <span className="text-sm font-semibold text-aurora-navy">{reviewSummary.average.toFixed(1)}</span>
                <span className="text-xs text-aurora-navy/40">({reviewSummary.count} reseña{reviewSummary.count !== 1 ? 's' : ''})</span>
              </div>
            )}
            {plan.description && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-aurora-navy/50 uppercase tracking-wide mb-2">Descripción</h3>
                <p className="text-aurora-navy/75 leading-relaxed">{plan.description}</p>
              </div>
            )}
            {(plan.includes ?? []).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-aurora-navy/50 uppercase tracking-wide mb-3">¿Qué incluye?</h3>
                <ul className="space-y-2">
                  {plan.includes.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-aurora-navy/75 text-sm">
                      <svg className="w-4 h-4 text-aurora-terracotta shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(plan.specifications ?? []).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-aurora-navy/50 uppercase tracking-wide mb-3">Especificaciones</h3>
                <div className="flex flex-wrap gap-2">
                  {plan.specifications.map((spec, i) => (
                    <span key={i} className="bg-aurora-cream text-aurora-navy/75 px-3 py-1 rounded-full text-xs font-medium">
                      {spec.type}: {spec.value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {plan.shippingAreas && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-aurora-navy/50 uppercase tracking-wide mb-2">Zonas de envío</h3>
                <p className="text-aurora-navy/75 text-sm">{plan.shippingAreas}</p>
              </div>
            )}
            {descuento > 0 && (
              <div className="bg-aurora-gold/10 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-aurora-terracottaDark mb-1">Descuentos disponibles</p>
                {(plan.descuentoTransferencia ?? 0) > 0 && (
                  <p className="text-sm text-aurora-terracottaDark">• {plan.descuentoTransferencia}% pagando por transferencia</p>
                )}
                {(plan.descuentoEfectivo ?? 0) > 0 && (
                  <p className="text-sm text-aurora-terracottaDark">• {plan.descuentoEfectivo}% pagando en efectivo</p>
                )}
              </div>
            )}

            {subscribeError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                {subscribeError}
              </div>
            )}
            {cartError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                {cartError}
              </div>
            )}
            {subscribeSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-4">
                ¡Listo! Te suscribiste correctamente a {plan.name}. Podés ver el estado de tu suscripción en tu perfil.
              </div>
            )}
            {addedToCart && !subscribeSuccess && (
              <div className="bg-aurora-navy/5 border border-aurora-navy/15 text-aurora-navy text-sm rounded-xl px-4 py-3 mb-4">
                Agregado a tu carrito. Podés seguir explorando o{' '}
                <Link to="/cart" className="underline font-semibold">ir al carrito</Link>.
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-aurora-navy/10">
              <Link
                to={`/club/${clubId}`}
                className="btn-outline flex-1 !py-3 text-sm"
              >
                Volver al club
              </Link>
              {subscribeSuccess ? (
                <Link
                  to="/customer/profile"
                  className="flex-1 text-center px-6 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition"
                >
                  Ver mi perfil
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || subscribing || !canSubscribe}
                    className="flex-1 px-6 py-3 text-sm font-semibold text-aurora-navy border-2 border-aurora-navy/20 rounded-full hover:bg-aurora-cream disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {addingToCart ? 'Agregando...' : addedToCart ? 'Agregado ✓' : 'Agregar al carrito'}
                  </button>
                  <button
                    onClick={handleSubscribeNow}
                    disabled={subscribing || addingToCart || !canSubscribe}
                    className="btn-primary flex-1 !py-3 text-sm disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {!canSubscribe ? 'Plan no disponible' : subscribing ? 'Procesando...' : 'Suscribirme ahora'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card-surface mt-8 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-aurora-navy">Reseñas</h3>
            {reviewSummary && reviewSummary.count > 0 && (
              <div className="flex items-center gap-2">
                <StarsDisplay rating={reviewSummary.average} />
                <span className="text-sm font-semibold text-aurora-navy">{reviewSummary.average.toFixed(1)}</span>
                <span className="text-xs text-aurora-navy/40">({reviewSummary.count})</span>
              </div>
            )}
          </div>

          {reviewSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-6">
              ¡Gracias por tu reseña!
            </div>
          )}

          {eligibility?.alreadyReviewed && !reviewSuccess && (
            <div className="bg-aurora-cream border border-aurora-navy/10 text-aurora-navy/70 text-sm rounded-xl px-4 py-3 mb-6">
              Ya dejaste una reseña para esta suscripción. Podés editarla desde{' '}
              <Link to="/customer/reviews" className="underline font-semibold">Mis Reseñas</Link>.
            </div>
          )}

          {isAuthenticated && userRole === 'customer' && eligibility && !eligibility.eligible && !eligibility.alreadyReviewed && (
            <div className="bg-aurora-cream border border-aurora-navy/10 text-aurora-navy/70 text-sm rounded-xl px-4 py-3 mb-6">
              Solo podés dejar una reseña si estás suscripto a este plan, o si cancelaste tu suscripción hace menos de 30 días.
            </div>
          )}

          {canShowReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="btn-primary !py-2.5 text-sm mb-6"
            >
              Dejar una reseña
            </button>
          )}

          {showReviewForm && (
            <div className="bg-aurora-cream rounded-xl border border-aurora-navy/10 p-5 mb-6">
              {reviewError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                  {reviewError}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-aurora-navy mb-2">Calificación</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setReviewRating(n)}>
                      <svg
                        className={`w-8 h-8 ${n <= reviewRating ? 'text-aurora-gold fill-current' : 'text-aurora-navy/15'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-aurora-navy mb-1">Título (opcional)</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  maxLength={120}
                  className="input-aurora bg-white"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-aurora-navy mb-1">Comentario</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  className="input-aurora bg-white resize-none"
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-aurora-navy mb-2">
                  Fotos y videos ({reviewFiles.length} / {MAX_MEDIA})
                </label>
                {reviewFiles.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {reviewFiles.map((file, i) => (
                      <div key={i} className="relative">
                        <img src={URL.createObjectURL(file)} alt="Nuevo" className="w-20 h-20 object-cover rounded-lg" />
                        <button
                          onClick={() => handleRemoveReviewFile(i)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
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
                  className="flex-1 px-4 py-2.5 rounded-full border border-aurora-navy/15 text-aurora-navy/70 text-sm font-medium hover:bg-white disabled:opacity-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="btn-primary flex-1 !py-2.5 text-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submittingReview ? 'Publicando...' : 'Publicar reseña'}
                </button>
              </div>
            </div>
          )}

          {loadingReviews ? (
            <div className="text-center py-8 text-aurora-navy/40 text-sm">Cargando reseñas...</div>
          ) : reviews.length === 0 ? (
            <p className="text-aurora-navy/50 text-sm">Todavía no hay reseñas para esta suscripción.</p>
          ) : (
            <div className="space-y-5">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-aurora-navy/10 pb-5 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <StarsDisplay rating={review.rating} />
                    <span className="text-xs text-aurora-navy/40">
                      {new Date(review.reviewDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  {review.title && <p className="font-semibold text-aurora-navy mb-1">{review.title}</p>}
                  {review.comment && <p className="text-aurora-navy/75 text-sm leading-relaxed">{review.comment}</p>}
                  {review.media && review.media.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {review.media.map((m) => (
                        m.mediaType === 'Video' ? (
                          <video key={m.id} src={m.mediaUrl} controls className="w-24 h-24 object-cover rounded-lg" />
                        ) : (
                          <img key={m.id} src={m.mediaUrl} alt="Reseña" className="w-24 h-24 object-cover rounded-lg" />
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {reviewsOffset < reviewsTotal && (
                <div className="text-center pt-2">
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
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlanDetailPage;