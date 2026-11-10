import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';
import { useAuth } from '../../App';
import ClubSocialMedia, { SocialMediaLinks } from '../../components/club/ClubSocialMedia';
import LegalContentRenderer from '../../components/club/LegalContentRenderer';
import SafeImage from '../../components/common/SafeImage';
import BottomSheet from '../../components/native/BottomSheet';
import PlanTile, { PlanTileData } from '../../components/native/PlanTile';
import Reveal from '../../components/native/Reveal';
import StarRating from '../../components/native/StarRating';
import { Club } from '../../types/club';
import { LegalSection } from '../../types/legalSection';
import { tapFeedback } from '../../utils/native';

interface SocialNetworkRaw {
  id: number;
  networkType: string;
  profileUrl: string;
}

interface ClubData extends Club {
  categories?: { id: number; name: string }[];
  socialNetworksRaw?: SocialNetworkRaw[];
}

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

interface LegalContent {
  termsAndConditions: LegalSection[];
  privacyAndSecurityPolicy: LegalSection[];
}

const EMPTY_LEGAL: LegalContent = { termsAndConditions: [], privacyAndSecurityPolicy: [] };

const SectionHeading: React.FC<{ eyebrow: string; title: string }> = ({ eyebrow, title }) => (
  <div className="mb-4">
    <span className="section-eyebrow !mb-1 !text-xs">{eyebrow}</span>
    <h2 className="font-display text-2xl font-bold leading-tight text-aurora-navy">{title}</h2>
  </div>
);

const NativeClubDetailPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, userRole } = useAuth();
  const isCustomer = isAuthenticated && userRole === 'customer';
  const plansRef = useRef<HTMLElement>(null);

  const [club, setClub] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'' | 'not-found' | 'load'>('');
  const [reloadKey, setReloadKey] = useState(0);
  const [legal, setLegal] = useState<LegalContent>(EMPTY_LEGAL);
  const [reviewsPreview, setReviewsPreview] = useState<ReviewsPreview | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [bannerIndex, setBannerIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [openLegal, setOpenLegal] = useState<'terms' | 'privacy' | null>(null);

  useEffect(() => {
    if (!clubId) return;
    let active = true;
    const loadClub = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/clubs/${clubId}`);
        if (active) setClub(getResponseData(response));
      } catch (err: any) {
        if (active) setError(err?.response?.status === 404 ? 'not-found' : 'load');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadClub();
    return () => {
      active = false;
    };
  }, [clubId, reloadKey]);

  useEffect(() => {
    if (!clubId) return;
    let active = true;
    const loadExtras = async () => {
      try {
        const response = await api.get(`/club-legal-content/by-club/${clubId}`);
        const data = getResponseData(response);
        if (active) {
          setLegal({
            termsAndConditions: data?.termsAndConditions ?? [],
            privacyAndSecurityPolicy: data?.privacyAndSecurityPolicy ?? [],
          });
        }
      } catch {
        if (active) setLegal(EMPTY_LEGAL);
      }
      try {
        const response = await api.get(`/reviews/public/by-club/${clubId}?limit=3&offset=0`);
        if (active) setReviewsPreview(getResponseData(response) as ReviewsPreview);
      } catch {
        if (active) setReviewsPreview(null);
      }
    };
    loadExtras();
    return () => {
      active = false;
    };
  }, [clubId]);

  useEffect(() => {
    if (!isCustomer || !user?.id) {
      setFavorites(new Set());
      return;
    }
    let active = true;
    const loadFavorites = async () => {
      try {
        const response = await api.get(`/favorites/by-user/${user.id}`);
        const data = getResponseData(response);
        if (active) {
          setFavorites(new Set((Array.isArray(data) ? data : []).map((item: { idSubscriptionTypes: number }) => String(item.idSubscriptionTypes))));
        }
      } catch {
        if (active) setFavorites(new Set());
      }
    };
    loadFavorites();
    return () => {
      active = false;
    };
  }, [isCustomer, user?.id]);

  const handleFavoriteChange = (planId: string, value: boolean) => {
    setFavorites((previous) => {
      const next = new Set(previous);
      if (value) next.add(planId);
      else next.delete(planId);
      return next;
    });
  };

  const requireLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(`/club/${clubId}`)}`);
  };

  const handleBannerScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const node = event.currentTarget;
    if (node.clientWidth > 0) setBannerIndex(Math.round(node.scrollLeft / node.clientWidth));
  };

  if (loading && !club) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-aurora-navy/10" />
        <div className="space-y-3 px-4 pt-6">
          <div className="h-8 w-2/3 rounded-lg bg-aurora-navy/10" />
          <div className="h-4 w-1/2 rounded bg-aurora-navy/10" />
          <div className="h-40 rounded-3xl bg-aurora-navy/10" />
        </div>
      </div>
    );
  }

  if (error || !club) {
    const notFound = error === 'not-found';
    return (
      <div role="alert" className="px-6 py-16 text-center">
        <p className="text-5xl" aria-hidden="true">{notFound ? '🔎' : '📡'}</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-aurora-navy">
          {notFound ? 'Club no encontrado' : 'No pudimos cargar el club'}
        </h1>
        <p className="mt-2 text-sm text-aurora-navy/60">
          {notFound ? 'El club que buscás no existe o fue eliminado.' : 'Revisá tu conexión e intentá de nuevo.'}
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          {!notFound && (
            <button
              type="button"
              onClick={() => {
                tapFeedback();
                setReloadKey((value) => value + 1);
              }}
              className="btn-primary"
            >
              Reintentar
            </button>
          )}
          <button type="button" onClick={() => navigate('/explore')} className="btn-outline">
            Explorar clubes
          </button>
        </div>
      </div>
    );
  }

  const bannerList = (club.bannerImagesRaw ?? []).map((banner) => banner.imageUrl);
  const logoSrc = club.logoUrl || club.logoImage || '';
  const historyImage = club.historyImageRaw?.[0]?.imageUrl || '';
  const hasHistory = Boolean(club.history || club.fullHistory || historyImage);
  const summary = reviewsPreview?.summary;
  const rating = summary && summary.count > 0 ? summary.average : Number(club.averageRating) || 0;
  const ratingCount = summary ? summary.count : club.totalReviews || 0;
  const description = club.shortDescription || 'Este club todavía no cargó una descripción.';
  const longDescription = description.length > 220;
  const plans: PlanTileData[] = (club.subscriptionPlans ?? []).map((plan) => ({
    planId: plan.planId,
    name: plan.name,
    description: plan.description,
    price: Number(plan.price) || 0,
    image: plan.image && !plan.image.includes('/assets/') ? plan.image : '',
    deliveryFrequency: plan.deliveryFrequency,
    cashDiscount: plan.cashDiscount ?? plan.descuentoEfectivo ?? 0,
    transferDiscount: plan.transferDiscount ?? plan.descuentoTransferencia ?? 0,
    active: plan.active ?? plan.activo ?? true,
  }));
  const socialMedia: SocialMediaLinks = (club.socialNetworksRaw ?? []).reduce(
    (acc, network) => ({ ...acc, [network.networkType.toLowerCase()]: network.profileUrl }),
    {} as SocialMediaLinks,
  );
  const hasSocial = Object.values(socialMedia).some(Boolean);
  const hasLegal = legal.termsAndConditions.length > 0 || legal.privacyAndSecurityPolicy.length > 0;
  const paymentMethods = club.paymentMethods ?? [];

  return (
    <div className="bg-aurora-cream">
      <section className="relative">
        {bannerList.length > 0 ? (
          <div onScroll={handleBannerScroll} className="no-scrollbar flex h-64 snap-x snap-mandatory overflow-x-auto">
            {bannerList.map((source, index) => (
              <div key={`${source}-${index}`} className="h-full w-full shrink-0 snap-center">
                <SafeImage src={source} alt={`${club.name}, imagen ${index + 1}`} fallbackIcon="📦" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-br from-aurora-navy via-aurora-navyLight to-aurora-terracotta" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-aurora-navyDark/55 via-transparent to-transparent" />
        {bannerList.length > 1 && (
          <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1.5" aria-hidden="true">
            {bannerList.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === bannerIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/55'}`}
              />
            ))}
          </div>
        )}
      </section>

      <div className="relative -mt-8 rounded-t-[2rem] bg-aurora-cream px-4 pb-8">
        <div className="-mt-12 flex items-end gap-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-aurora-cream bg-white shadow-aurora-sm">
            <SafeImage src={logoSrc} alt={`Logo de ${club.name}`} className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="mt-4">
          <h1 className="font-display text-3xl font-bold leading-tight text-aurora-navy">{club.name}</h1>
          {club.slogan && <p className="mt-1 text-[15px] italic text-aurora-navy/60">{club.slogan}</p>}
          {ratingCount > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <StarRating value={rating} className="h-5 w-5" />
              <span className="text-sm font-bold text-aurora-navy">{rating.toFixed(1)}</span>
              <span className="text-sm text-aurora-navy/50">
                ({ratingCount} {ratingCount === 1 ? 'reseña' : 'reseñas'})
              </span>
            </div>
          )}
          {(club.categories ?? []).length > 0 && (
            <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
              {(club.categories ?? []).map((category) => (
                <span
                  key={category.id}
                  className="shrink-0 rounded-full bg-aurora-gold/15 px-3 py-1.5 text-xs font-semibold text-aurora-terracottaDark ring-1 ring-aurora-gold/30"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
          {plans.length > 0 && (
            <button
              type="button"
              onClick={() => {
                tapFeedback();
                plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="btn-primary mt-5 w-full !py-3.5"
            >
              Ver planes de suscripción
            </button>
          )}
        </div>

        <div className="mt-10 space-y-12">
          <Reveal>
            <SectionHeading eyebrow="Conocelos" title="Sobre nosotros" />
            <p className={`selectable text-[15px] leading-relaxed text-aurora-navy/75 ${descriptionExpanded ? '' : 'line-clamp-4'}`}>
              {description}
            </p>
            {longDescription && (
              <button
                type="button"
                onClick={() => setDescriptionExpanded((value) => !value)}
                className="mt-2 text-sm font-semibold text-aurora-terracotta"
              >
                {descriptionExpanded ? 'Leer menos' : 'Leer más'}
              </button>
            )}
            {hasHistory && (
              <Link
                to={`/club/${club.id}/history`}
                onClick={() => {
                  tapFeedback();
                }}
                className="relative mt-5 block h-36 overflow-hidden rounded-3xl shadow-aurora-sm transition-transform active:scale-[0.98]"
              >
                {historyImage ? (
                  <img src={historyImage} alt="" aria-hidden="true" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-aurora-navy to-aurora-terracotta" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-aurora-navyDark/75 via-aurora-navyDark/10 to-transparent" />
                <span className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-display text-lg font-bold text-white">
                  Conocé nuestra historia
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </span>
              </Link>
            )}
          </Reveal>

          <section ref={plansRef} className="scroll-mt-20">
            <SectionHeading eyebrow="Elegí tu caja" title="Planes de suscripción" />
            {plans.length > 0 ? (
              <div className="space-y-4">
                {plans.map((plan, index) => (
                  <PlanTile
                    key={plan.planId}
                    clubId={club.id}
                    plan={plan}
                    favorite={favorites.has(plan.planId)}
                    canFavorite={isCustomer}
                    onFavoriteChange={handleFavoriteChange}
                    onRequireLogin={requireLogin}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-white p-6 text-center text-sm text-aurora-navy/60 shadow-aurora-sm ring-1 ring-aurora-navy/5">
                Este club todavía no publicó planes de suscripción.
              </div>
            )}
          </section>

          {(paymentMethods.length > 0 || club.shippingInfo) && (
            <Reveal>
              <SectionHeading eyebrow="Antes de comprar" title="Pagos y envíos" />
              <div className="space-y-4 rounded-3xl bg-white p-5 shadow-aurora-sm ring-1 ring-aurora-navy/5">
                {paymentMethods.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-aurora-navy">Métodos de pago</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {paymentMethods.map((method) => (
                        <span key={method} className="rounded-full bg-aurora-terracotta/10 px-3 py-1.5 text-xs font-semibold text-aurora-terracottaDark">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {club.shippingInfo && (
                  <div className={paymentMethods.length > 0 ? 'border-t border-aurora-navy/5 pt-4' : ''}>
                    <h3 className="text-sm font-bold text-aurora-navy">Zonas de envío</h3>
                    {club.shippingInfo.coverage && (
                      <p className="mt-1 text-sm font-semibold text-aurora-navy/80">{club.shippingInfo.coverage}</p>
                    )}
                    {club.shippingInfo.details && (
                      <p className="mt-1 text-sm leading-relaxed text-aurora-navy/65">{club.shippingInfo.details}</p>
                    )}
                  </div>
                )}
              </div>
            </Reveal>
          )}

          {reviewsPreview && reviewsPreview.total > 0 && (
            <Reveal>
              <SectionHeading eyebrow="Opiniones" title="Reseñas de clientes" />
              <div className="-mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 no-scrollbar">
                {reviewsPreview.reviews.slice(0, 3).map((review) => (
                  <figure
                    key={review.id}
                    className="w-[80vw] max-w-sm shrink-0 snap-center rounded-3xl bg-white p-5 shadow-aurora-sm ring-1 ring-aurora-navy/5"
                  >
                    <StarRating value={review.rating} className="h-5 w-5" />
                    {review.title && <p className="mt-3 font-semibold text-aurora-navy">{review.title}</p>}
                    {review.comment && (
                      <blockquote className="selectable mt-1 line-clamp-5 text-sm leading-relaxed text-aurora-navy/70">“{review.comment}”</blockquote>
                    )}
                    <figcaption className="mt-3 text-xs text-aurora-navy/50">
                      {review.customerName}
                      {review.planName ? ` · ${review.planName}` : ''}
                    </figcaption>
                  </figure>
                ))}
              </div>
              <Link
                to={`/club/${club.id}/reviews`}
                onClick={() => {
                  tapFeedback();
                }}
                className="btn-outline w-full !py-3"
              >
                Ver {reviewsPreview.total === 1 ? 'la reseña' : `las ${reviewsPreview.total} reseñas`}
              </Link>
            </Reveal>
          )}

          {hasSocial && (
            <Reveal>
              <SectionHeading eyebrow="Seguilos" title="Redes sociales" />
              <ClubSocialMedia socialMedia={socialMedia} />
            </Reveal>
          )}

          {hasLegal && (
            <Reveal>
              <div className="overflow-hidden rounded-3xl bg-white shadow-aurora-sm ring-1 ring-aurora-navy/5">
                {legal.termsAndConditions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      tapFeedback();
                      setOpenLegal('terms');
                    }}
                    className="flex min-h-[52px] w-full items-center justify-between px-5 text-left text-[15px] font-semibold text-aurora-navy active:bg-aurora-cream"
                  >
                    Términos y condiciones
                    <svg className="h-4 w-4 text-aurora-navy/35" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                )}
                {legal.privacyAndSecurityPolicy.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      tapFeedback();
                      setOpenLegal('privacy');
                    }}
                    className={`flex min-h-[52px] w-full items-center justify-between px-5 text-left text-[15px] font-semibold text-aurora-navy active:bg-aurora-cream ${
                      legal.termsAndConditions.length > 0 ? 'border-t border-aurora-navy/5' : ''
                    }`}
                  >
                    Seguridad y devoluciones
                    <svg className="h-4 w-4 text-aurora-navy/35" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                )}
              </div>
            </Reveal>
          )}
        </div>
      </div>

      <BottomSheet
        open={openLegal !== null}
        title={openLegal === 'terms' ? 'Términos y condiciones' : 'Seguridad y devoluciones'}
        onClose={() => setOpenLegal(null)}
      >
        <LegalContentRenderer sections={openLegal === 'terms' ? legal.termsAndConditions : legal.privacyAndSecurityPolicy} />
      </BottomSheet>
    </div>
  );
};

export default NativeClubDetailPage;