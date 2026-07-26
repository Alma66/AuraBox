import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';
import { useAuth } from '../../App';

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

const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({ plan, clubName, detailsLink, promoEspecial }) => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullIncludes, setShowFullIncludes] = useState(false);
  const [showFullSpecs, setShowFullSpecs] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [ratingSummary, setRatingSummary] = useState<{ average: number; count: number } | null>(null);

  const includes = plan.includes ?? [];
  const specifications = plan.specifications ?? [];
  const description = plan.description ?? '';

  const isActive = plan.activo ?? plan.active ?? true;
  const descuento = Math.max(
    plan.cashDiscount ?? plan.descuentoEfectivo ?? 0,
    plan.transferDiscount ?? plan.descuentoTransferencia ?? 0,
  );
  const precioFinal = plan.price * (1 - descuento / 100);

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
    try {
      const res = await api.post(`/favorites/toggle/${plan.planId}`);
      setIsFavorite(getResponseData(res)?.isFavorite ?? false);
    } catch {
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <div className="relative card-surface overflow-hidden flex flex-col animate-fadeInUp hover:shadow-aurora transition-all duration-300 transform hover:-translate-y-1">
      {!isActive && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
          Inactivo
        </div>
      )}
      {descuento > 0 && (
        <div className="absolute top-2 right-2 bg-aurora-terracotta text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-aurora-sm">
          -{descuento}%
        </div>
      )}
      <div className="relative">
        <img src={plan.image} alt={plan.name} className="w-full h-48 object-cover" />
        <button
          onClick={handleToggleFavorite}
          disabled={favoriteLoading}
          className={`absolute top-3 right-3 bg-white p-2 rounded-full shadow-aurora-sm hover:scale-110 transition-all duration-200 disabled:opacity-50 ${isFavorite ? 'text-aurora-terracotta' : 'text-aurora-navy/40 hover:text-aurora-terracotta'}`}
          aria-label={`${isFavorite ? 'Quitar' : 'Añadir'} ${plan.name} de favoritos`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isFavorite ? 0 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="font-display text-2xl font-bold text-aurora-navy mb-2">{plan.name}</h3>
        {ratingSummary && ratingSummary.count > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <svg className="w-4 h-4 text-aurora-gold fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-aurora-navy">{ratingSummary.average.toFixed(1)}</span>
            <span className="text-xs text-aurora-navy/40">({ratingSummary.count})</span>
          </div>
        )}
        <p className="text-aurora-navy/65 text-sm mb-3">Frecuencia: <span className="font-semibold text-aurora-navy">{plan.deliveryFrequency}</span></p>
        <div className="mb-4">
          <p className="text-aurora-navy/75 text-sm leading-relaxed">
            {showFullDescription ? description : `${description.substring(0, 120)}${description.length > 120 ? '...' : ''}`}
            {description.length > 120 && (
              <button onClick={() => setShowFullDescription(!showFullDescription)} className="text-aurora-terracotta hover:underline ml-1 text-xs font-semibold">
                {showFullDescription ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </p>
        </div>
        <div className="mb-4">
          <h4 className="text-md font-semibold text-aurora-navy mb-2">¿Qué incluye?</h4>
          <ul className="list-disc list-inside text-aurora-navy/75 text-sm space-y-0.5">
            {includes.slice(0, showFullIncludes ? includes.length : 2).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
            {includes.length > 2 && (
              <button onClick={() => setShowFullIncludes(!showFullIncludes)} className="text-aurora-terracotta hover:underline ml-1 text-xs font-semibold">
                {showFullIncludes ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </ul>
        </div>
        {specifications.length > 0 && (
          <div className="mb-4">
            <h4 className="text-md font-semibold text-aurora-navy mb-2">Especificaciones:</h4>
            <div className="flex flex-wrap gap-2 text-sm">
              {specifications.slice(0, showFullSpecs ? specifications.length : 3).map((spec, index) => (
                <span key={index} className="bg-aurora-cream text-aurora-navy/80 px-2 py-1 rounded-full text-xs font-medium">
                  {spec.type}: {spec.value}
                </span>
              ))}
              {specifications.length > 3 && (
                <button onClick={() => setShowFullSpecs(!showFullSpecs)} className="text-aurora-terracotta hover:underline ml-1 text-xs font-semibold">
                  {showFullSpecs ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
          </div>
        )}
        <div className="mb-4">
          <h4 className="text-md font-semibold text-aurora-navy mb-2">Zonas de Envío:</h4>
          <p className="text-aurora-navy/75 text-sm">{plan.shippingAreas}</p>
        </div>
        {promoEspecial && (
          <div className="mb-4 p-3 bg-aurora-gold/10 rounded-lg border-l-4 border-aurora-gold">
            <p className="text-aurora-terracottaDark font-semibold text-sm">{promoEspecial}</p>
          </div>
        )}
        <div className="mt-auto flex justify-between items-center border-t border-aurora-navy/10 pt-4">
          <div>
            <span className={`text-3xl font-display font-bold ${descuento > 0 ? 'text-aurora-navy/40 line-through' : 'text-aurora-navy'}`}>
              {plan.currency} {plan.price.toLocaleString('es-AR')}
            </span>
            {descuento > 0 && (
              <span className="text-3xl font-display font-bold text-aurora-terracotta ml-2">
                {plan.currency} {precioFinal.toLocaleString('es-AR')}
              </span>
            )}
            {descuento > 0 && (
              <p className="text-xs text-aurora-navy/50">Ahorrás {descuento}%</p>
            )}
          </div>
          {detailsLink ? (
            <Link to={detailsLink} className="btn-primary !px-6 !py-3 text-md">
              Ver Detalles
            </Link>
          ) : (
            <button disabled className="bg-aurora-navy/20 text-white px-6 py-3 rounded-full font-bold text-md cursor-not-allowed">
              Ver Detalles
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlanCard;