import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';
import { useAuth } from '../../App';
import SafeImage from '../common/SafeImage';

interface Specification {
  type: string;
  value: string;
}

export interface SubscriptionPlan {
  planId: string;
  name: string;
  image: string;
  description: string;
  price: number;
  currency: string;
  deliveryFrequency: string;
  includes: string[];
  shippingAreas: string;
  specifications: Specification[];
  descuentoTransferencia?: number;
  descuentoEfectivo?: number;
  activo?: boolean;
  cashDiscount?: number;
  transferDiscount?: number;
  active?: boolean;
}

export interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  clubName: string;
  detailsLink?: string;
  promoEspecial?: string;
}

const money = (value: number, currency: string) =>
  `${currency || 'ARS'} ${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;

const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({ plan, clubName, detailsLink, promoEspecial }) => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullIncludes, setShowFullIncludes] = useState(false);
  const [showFullSpecs, setShowFullSpecs] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState('');
  const [ratingSummary, setRatingSummary] = useState<{ average: number; count: number } | null>(null);

  const includes = plan.includes ?? [];
  const specifications = plan.specifications ?? [];
  const description = plan.description ?? '';

  const isActive = plan.activo ?? plan.active ?? true;
  const cashDiscount = plan.cashDiscount ?? plan.descuentoEfectivo ?? 0;
  const transferDiscount = plan.transferDiscount ?? plan.descuentoTransferencia ?? 0;
  const bestDiscount = Math.max(cashDiscount, transferDiscount);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!isAuthenticated || userRole !== 'customer') return;
      try {
        const res = await api.get(`/favorites/check/${plan.planId}`);
        setIsFavorite(getResponseData(res)?.isFavorite ?? false);
      } catch {}
    };
    checkFavorite();
  }, [isAuthenticated, userRole, plan.planId]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get(`/reviews/summary/by-subscription-type/${plan.planId}`);
        setRatingSummary(getResponseData(res));
      } catch {}
    };
    fetchSummary();
  }, [plan.planId]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(detailsLink || '/')}`);
      return;
    }
    if (userRole !== 'customer') return;
    setFavoriteLoading(true);
    setFavoriteError('');
    try {
      const res = await api.post(`/favorites/toggle/${plan.planId}`);
      setIsFavorite(getResponseData(res)?.isFavorite ?? false);
    } catch {
      setFavoriteError('No se pudo actualizar tus favoritos. Intentá de nuevo.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-aurora-sm ring-1 ring-aurora-navy/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-aurora-lg">
      <div className="relative overflow-hidden">
        <SafeImage src={plan.image} alt={plan.name} fallbackIcon="📦" className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-aurora-navyDark/40 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
          {!isActive && (
            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-aurora-sm">Inactivo</span>
          )}
          {bestDiscount > 0 && (
            <span className="rounded-full bg-aurora-terracotta px-3 py-1 text-xs font-bold text-white shadow-aurora-sm">Hasta -{bestDiscount}%</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={favoriteLoading}
          aria-pressed={isFavorite}
          className={`absolute right-3 top-3 rounded-full bg-white/95 p-2 shadow-aurora-sm transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-terracotta disabled:opacity-50 ${isFavorite ? 'text-aurora-terracotta' : 'text-aurora-navy/40 hover:text-aurora-terracotta'}`}
          aria-label={`${isFavorite ? 'Quitar' : 'Añadir'} ${plan.name} ${isFavorite ? 'de' : 'a'} favoritos`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isFavorite ? 0 : 2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      <div className="flex flex-grow flex-col p-6">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl font-medium leading-snug text-aurora-navy">{plan.name}</h3>
          {ratingSummary && ratingSummary.count > 0 && (
            <div className="flex flex-shrink-0 items-center gap-1 rounded-full bg-aurora-gold/15 px-2.5 py-1">
              <svg className="h-3.5 w-3.5 fill-current text-aurora-gold" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-bold text-aurora-navy">{ratingSummary.average.toFixed(1)}</span>
              <span className="text-xs text-aurora-navy/50">({ratingSummary.count})</span>
            </div>
          )}
        </div>
        {favoriteError && (
          <p role="alert" className="mb-2 text-xs text-red-600">{favoriteError}</p>
        )}
        {plan.deliveryFrequency && (
          <p className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-aurora-cream px-3 py-1 text-xs font-semibold text-aurora-navy/80">
            <svg className="h-3.5 w-3.5 text-aurora-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {plan.deliveryFrequency}
          </p>
        )}
        <p className="mb-4 text-sm leading-relaxed text-aurora-navy/70">
          {showFullDescription ? description : `${description.substring(0, 120)}${description.length > 120 ? '...' : ''}`}
          {description.length > 120 && (
            <button type="button" onClick={() => setShowFullDescription(!showFullDescription)} className="ml-1 text-xs font-semibold text-aurora-terracotta hover:underline">
              {showFullDescription ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </p>
        {includes.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-aurora-navy/55">Qué incluye</h4>
            <ul className="space-y-1.5">
              {includes.slice(0, showFullIncludes ? includes.length : 3).map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-aurora-navy/80">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-aurora-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {includes.length > 3 && (
              <button type="button" onClick={() => setShowFullIncludes(!showFullIncludes)} className="mt-1.5 text-xs font-semibold text-aurora-terracotta hover:underline">
                {showFullIncludes ? 'Ver menos' : `Ver ${includes.length - 3} más`}
              </button>
            )}
          </div>
        )}
        {specifications.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-aurora-navy/55">Especificaciones</h4>
            <div className="flex flex-wrap items-center gap-2">
              {specifications.slice(0, showFullSpecs ? specifications.length : 3).map((spec, index) => (
                <span key={index} className="rounded-full bg-aurora-cream px-2.5 py-1 text-xs font-medium text-aurora-navy/80">
                  {spec.type}: {spec.value}
                </span>
              ))}
              {specifications.length > 3 && (
                <button type="button" onClick={() => setShowFullSpecs(!showFullSpecs)} className="text-xs font-semibold text-aurora-terracotta hover:underline">
                  {showFullSpecs ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
          </div>
        )}
        {plan.shippingAreas && plan.shippingAreas.trim() && (
          <div className="mb-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-aurora-navy/55">Zonas de envío</h4>
            <p className="text-sm text-aurora-navy/75">{plan.shippingAreas}</p>
          </div>
        )}
        {promoEspecial && (
          <div className="mb-4 rounded-xl border-l-4 border-aurora-gold bg-aurora-gold/10 p-3">
            <p className="text-sm font-semibold text-aurora-terracottaDark">{promoEspecial}</p>
          </div>
        )}
        <div className="mt-auto border-t border-aurora-navy/10 pt-5">
          <div className="mb-4">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-medium text-aurora-navy">{money(plan.price, plan.currency)}</span>
            </div>
            {cashDiscount > 0 && (
              <p className="mt-1 text-xs font-medium text-green-700">
                Efectivo (-{cashDiscount}%): {money(plan.price * (1 - cashDiscount / 100), plan.currency)}
              </p>
            )}
            {transferDiscount > 0 && (
              <p className="text-xs font-medium text-green-700">
                Transferencia (-{transferDiscount}%): {money(plan.price * (1 - transferDiscount / 100), plan.currency)}
              </p>
            )}
          </div>
          {detailsLink ? (
            <Link to={detailsLink} aria-label={`Ver detalles de ${plan.name} de ${clubName}`} className="btn-primary btn-shine w-full justify-center">
              Ver detalles
            </Link>
          ) : (
            <button type="button" disabled className="w-full cursor-not-allowed rounded-full bg-aurora-navy/20 px-6 py-3 font-semibold text-white">
              Ver detalles
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlanCard;