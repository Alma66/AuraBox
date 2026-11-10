import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../api/config';
import { formatMoney } from '../../utils/money';
import { tapFeedback } from '../../utils/native';
import SafeImage from '../common/SafeImage';

export interface PlanTileData {
  planId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  deliveryFrequency?: string;
  cashDiscount?: number;
  transferDiscount?: number;
  active?: boolean;
}

interface PlanTileProps {
  clubId: string | number;
  plan: PlanTileData;
  favorite: boolean;
  canFavorite: boolean;
  onFavoriteChange: (planId: string, value: boolean) => void;
  onRequireLogin: () => void;
  index: number;
}

const HEART_PATH =
  'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z';

const PlanTile: React.FC<PlanTileProps> = ({ clubId, plan, favorite, canFavorite, onFavoriteChange, onRequireLogin, index }) => {
  const [busy, setBusy] = useState(false);
  const cash = plan.cashDiscount ?? 0;
  const transfer = plan.transferDiscount ?? 0;
  const best = Math.max(cash, transfer);
  const available = plan.active !== false;

  const toggleFavorite = async () => {
    tapFeedback();
    if (!canFavorite) {
      onRequireLogin();
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const response = await api.post(`/favorites/toggle/${plan.planId}`);
      onFavoriteChange(plan.planId, Boolean(getResponseData(response)?.isFavorite));
    } catch {
      toast.error('No pudimos actualizar tus favoritos. Intentá de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="relative animate-fadeInUp"
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms`, animationFillMode: 'both' }}
    >
      <Link
        to={`/club/${clubId}/plan/${plan.planId}`}
        onClick={() => {
          tapFeedback();
        }}
        className="block overflow-hidden rounded-3xl bg-white shadow-aurora-sm ring-1 ring-aurora-navy/5 transition-transform duration-200 active:scale-[0.98]"
      >
        <div className="relative h-44 bg-aurora-cream">
          <SafeImage src={plan.image} alt={plan.name} fallbackIcon="📦" className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-aurora-navyDark/40 via-transparent to-transparent" />
          {best > 0 && available && (
            <span className="absolute left-3 top-3 rounded-full bg-aurora-terracotta px-3 py-1 text-xs font-bold text-white shadow-aurora-sm">
              Hasta -{best}%
            </span>
          )}
          {!available && (
            <span className="absolute left-3 top-3 rounded-full bg-aurora-navyDark/85 px-3 py-1 text-xs font-bold text-white">
              No disponible
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-display text-xl font-bold leading-tight text-aurora-navy">{plan.name}</h3>
          {plan.deliveryFrequency && <p className="mt-0.5 text-sm font-semibold text-aurora-terracotta">{plan.deliveryFrequency}</p>}
          {plan.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-aurora-navy/65">{plan.description}</p>}
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-2xl font-bold text-aurora-navy">{formatMoney(plan.price)}</p>
              {cash > 0 && (
                <p className="text-xs font-semibold text-green-700">
                  Efectivo -{cash}%: {formatMoney(plan.price * (1 - cash / 100))}
                </p>
              )}
              {transfer > 0 && (
                <p className="text-xs font-semibold text-green-700">
                  Transferencia -{transfer}%: {formatMoney(plan.price * (1 - transfer / 100))}
                </p>
              )}
            </div>
            <span className="inline-flex shrink-0 items-center rounded-full bg-aurora-navy px-4 py-2 text-sm font-semibold text-white">
              Ver plan
            </span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={busy}
        aria-pressed={favorite}
        aria-label={`${favorite ? 'Quitar' : 'Agregar'} ${plan.name} ${favorite ? 'de' : 'a'} favoritos`}
        className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-aurora-sm transition-transform active:scale-90 disabled:opacity-60 ${
          favorite ? 'text-aurora-terracotta' : 'text-aurora-navy/40'
        }`}
      >
        <svg className="h-6 w-6" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={favorite ? 0 : 2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d={HEART_PATH} />
        </svg>
      </button>
    </div>
  );
};

export default PlanTile;