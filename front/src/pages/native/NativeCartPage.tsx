import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../api/config';
import SafeImage from '../../components/common/SafeImage';
import { notifyCartChanged } from '../../utils/cartEvents';
import { formatMoney } from '../../utils/money';
import { tapFeedback } from '../../utils/native';

interface CartPlan {
  planId: number;
  name: string;
  price: number;
  deliveryFrequency: string;
  image: string;
  active: boolean;
  cashDiscount: number;
  transferDiscount: number;
}

interface CartEntry {
  cartItemId: number;
  idSubscriptionTypes: number;
  plan: CartPlan;
  club: { id: number; name: string };
}

const bestDiscount = (plan: CartPlan) => Math.max(plan.cashDiscount ?? 0, plan.transferDiscount ?? 0);

const NativeCartPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchCart = useCallback(async (isActive: () => boolean) => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const response = await api.get('/cart-items');
      const data = getResponseData(response);
      if (isActive()) setItems(Array.isArray(data) ? data : []);
    } catch {
      if (isActive()) setLoadFailed(true);
    } finally {
      if (isActive()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchCart(() => active);
    return () => {
      active = false;
    };
  }, [fetchCart, reloadKey]);

  const handleRemove = async (idSubscriptionTypes: number) => {
    if (removingId !== null) return;
    tapFeedback();
    setRemovingId(idSubscriptionTypes);
    try {
      await api.delete(`/cart-items/${idSubscriptionTypes}`);
      setItems((previous) => previous.filter((item) => item.idSubscriptionTypes !== idSubscriptionTypes));
      notifyCartChanged();
    } catch {
      toast.error('No pudimos quitar el plan. Intentá de nuevo.');
    } finally {
      setRemovingId(null);
    }
  };

  const unavailable = items.filter((item) => !item.plan.active);
  const canCheckout = items.length > 0 && unavailable.length === 0;
  const total = items.reduce((sum, item) => sum + item.plan.price, 0);
  const savings = items.reduce((sum, item) => sum + (item.plan.price * bestDiscount(item.plan)) / 100, 0);

  const handleCheckout = () => {
    tapFeedback();
    if (!canCheckout) {
      toast.error(
        items.length === 0
          ? 'Tu carrito está vacío.'
          : 'Quitá los planes que ya no están disponibles para continuar.',
      );
      return;
    }
    navigate('/checkout');
  };

  if (loading && items.length === 0) {
    return (
      <div className="space-y-4 px-4 py-6" role="status" aria-label="Cargando tu carrito">
        {[0, 1, 2].map((item) => (
          <div key={item} className="flex animate-pulse gap-4 rounded-3xl bg-white p-4 shadow-aurora-sm">
            <div className="h-24 w-24 shrink-0 rounded-2xl bg-aurora-navy/10" />
            <div className="flex-1 space-y-3 py-2">
              <div className="h-3 w-1/3 rounded bg-aurora-navy/10" />
              <div className="h-5 w-3/4 rounded bg-aurora-navy/10" />
              <div className="h-4 w-1/2 rounded bg-aurora-navy/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div role="alert" className="px-6 py-16 text-center">
        <p className="text-5xl" aria-hidden="true">📡</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-aurora-navy">No pudimos cargar tu carrito</h1>
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

  if (items.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-aurora-sm" aria-hidden="true">
          🛒
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-aurora-navy">Tu carrito está vacío</h1>
        <p className="mt-2 text-sm text-aurora-navy/60">Encontrá un club que te guste y sumá tu primera caja.</p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => {
              tapFeedback();
              navigate('/explore');
            }}
            className="btn-primary w-full max-w-xs"
          >
            Explorar clubes
          </button>
          <button
            type="button"
            onClick={() => {
              tapFeedback();
              navigate('/customer/wishlist');
            }}
            className="btn-outline w-full max-w-xs"
          >
            Ver mis favoritos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-44 pt-6">
      <div className="mb-5 flex items-end justify-between">
        <h1 className="font-display text-3xl font-bold text-aurora-navy">Mi carrito</h1>
        <span className="text-sm font-semibold text-aurora-navy/55">
          {items.length} {items.length === 1 ? 'plan' : 'planes'}
        </span>
      </div>

      {unavailable.length > 0 && (
        <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          Hay planes que ya no están disponibles. Quitalos para poder continuar.
        </p>
      )}

      <ul className="space-y-4">
        {items.map((item, index) => {
          const discount = bestDiscount(item.plan);
          const removing = removingId === item.idSubscriptionTypes;
          const image = item.plan.image && !item.plan.image.includes('/assets/') ? item.plan.image : '';
          return (
            <li
              key={item.cartItemId}
              className={`animate-fadeInUp rounded-3xl p-3 shadow-aurora-sm ring-1 transition-opacity ${
                item.plan.active ? 'bg-white ring-aurora-navy/5' : 'bg-red-50/60 ring-red-200'
              } ${removing ? 'opacity-50' : ''}`}
              style={{ animationDelay: `${Math.min(index, 6) * 60}ms`, animationFillMode: 'both' }}
            >
              <div className="flex gap-3">
                <Link
                  to={`/club/${item.club.id}/plan/${item.plan.planId}`}
                  onClick={() => {
                    tapFeedback();
                  }}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-aurora-cream"
                >
                  <SafeImage src={image} alt={item.plan.name} fallbackIcon="📦" className="h-full w-full object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/club/${item.club.id}`} className="block truncate text-xs font-bold uppercase tracking-wide text-aurora-terracotta">
                    {item.club.name}
                  </Link>
                  <h2 className="truncate font-display text-lg font-bold leading-tight text-aurora-navy">{item.plan.name}</h2>
                  <p className="text-xs text-aurora-navy/55">{item.plan.deliveryFrequency}</p>
                  <p className="mt-1 font-display text-xl font-bold text-aurora-navy">{formatMoney(item.plan.price)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(item.idSubscriptionTypes)}
                  disabled={removing}
                  aria-label={`Quitar ${item.plan.name} del carrito`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-aurora-navy/40 transition-transform active:scale-90 active:bg-red-50 active:text-red-600 disabled:opacity-50"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              </div>
              {discount > 0 && item.plan.active && (
                <p className="mt-2 rounded-xl bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  Hasta {discount}% off pagando en efectivo o transferencia
                </p>
              )}
              {!item.plan.active && (
                <p className="mt-2 rounded-xl bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">Ya no está disponible</p>
              )}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => {
          tapFeedback();
          navigate('/explore');
        }}
        className="btn-outline mt-6 w-full !py-3"
      >
        Seguir explorando
      </button>

      <div
        className="fixed inset-x-0 z-30 border-t border-aurora-navy/10 bg-white/95 px-4 pt-3 backdrop-blur-md"
        style={{ bottom: 'calc(4rem + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))' }}
      >
        <div className="flex items-center gap-4 pb-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-aurora-navy/55">Total estimado</p>
            <p className="truncate font-display text-2xl font-bold text-aurora-navy">{formatMoney(total)}</p>
            {savings > 0 && (
              <p className="truncate text-xs font-semibold text-green-700">Ahorrás hasta {formatMoney(savings)} al pagar</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={!canCheckout}
            className="btn-primary h-12 shrink-0 !px-6 disabled:opacity-50"
          >
            Continuar al pago
          </button>
        </div>
      </div>
    </div>
  );
};

export default NativeCartPage;