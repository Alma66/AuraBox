import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import api, { getResponseData } from '../../api/config';
import SafeImage from '../../components/common/SafeImage';
import Reveal from '../../components/common/Reveal';

interface CartPlan {
  planId: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  deliveryFrequency: string;
  image: string;
  active: boolean;
  cashDiscount: number;
  transferDiscount: number;
}

interface CartClub {
  id: number;
  name: string;
  logoUrl: string;
  slogan: string | null;
}

interface CartEntry {
  cartItemId: number;
  idSubscriptionTypes: number;
  addedAt: string;
  plan: CartPlan;
  club: CartClub;
}

const money = (value: number) =>
  value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const bestDiscount = (plan: CartPlan) => Math.max(plan.cashDiscount ?? 0, plan.transferDiscount ?? 0);

const CartPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [actionError, setActionError] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const response = await api.get('/cart-items');
      const data = getResponseData(response);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchCart();
    else setLoading(false);
  }, [user, fetchCart]);

  const handleRemove = async (idSubscriptionTypes: number) => {
    if (removingId !== null) return;
    setRemovingId(idSubscriptionTypes);
    setActionError('');
    try {
      await api.delete(`/cart-items/${idSubscriptionTypes}`);
      setItems((prev) => prev.filter((item) => item.idSubscriptionTypes !== idSubscriptionTypes));
    } catch {
      setActionError('No se pudo quitar el plan del carrito. Intentá de nuevo.');
    } finally {
      setRemovingId(null);
    }
  };

  const unavailable = items.filter((item) => !item.plan.active);
  const canCheckout = items.length > 0 && unavailable.length === 0;

  const handleCheckout = () => {
    if (!canCheckout) {
      setActionError(
        items.length === 0
          ? 'Tu carrito está vacío. Agregá planes primero.'
          : 'Quitá los planes que ya no están disponibles para continuar.',
      );
      return;
    }
    navigate('/checkout');
  };

  const total = items.reduce((sum, item) => sum + item.plan.price, 0);
  const possibleSavings = items.reduce((sum, item) => sum + (item.plan.price * bestDiscount(item.plan)) / 100, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora-cream px-4 py-16">
        <div className="mx-auto max-w-4xl text-center" role="status">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
          <p className="text-aurora-navy/70">Cargando tu carrito...</p>
        </div>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="min-h-screen bg-aurora-cream px-4 py-16">
        <div role="alert" className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-aurora ring-1 ring-aurora-navy/5">
          <h1 className="mb-2 font-display text-3xl font-medium text-aurora-navy">No pudimos cargar tu carrito</h1>
          <p className="mb-6 text-aurora-navy/60">Revisá tu conexión e intentá de nuevo.</p>
          <button type="button" onClick={fetchCart} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div className="hero-mesh grain relative overflow-hidden">
        <div className="container relative mx-auto px-4 pb-24 pt-12 md:pb-28">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-aurora-goldLight">Tu carrito</span>
          <h1 className="font-display text-4xl font-normal leading-tight text-white md:text-6xl">Mi carrito</h1>
          <p className="mt-3 max-w-xl text-lg text-white/80">
            {user ? `Hola, ${user.firstName}. Revisá tus planes antes de pagar.` : 'Revisá tus planes seleccionados.'}
          </p>
        </div>
      </div>

      <div className="container mx-auto -mt-14 px-4 pb-16 md:-mt-16">
        {actionError && (
          <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {actionError}
          </div>
        )}

        {items.length === 0 ? (
          <Reveal>
            <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-aurora ring-1 ring-aurora-navy/5">
              <span className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-aurora-cream text-aurora-terracotta">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
              <h2 className="mb-2 font-display text-3xl font-medium text-aurora-navy">Tu carrito está vacío</h2>
              <p className="mb-8 text-aurora-navy/60">Agregá planes desde el perfil de un club.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => navigate('/customer/wishlist')} className="btn-outline">
                  Ver mi lista de deseos
                </button>
                <button type="button" onClick={() => navigate('/explore')} className="btn-primary btn-shine">
                  Explorar clubes
                </button>
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <ul className="space-y-4 lg:col-span-2">
              {items.map((item) => {
                const discount = bestDiscount(item.plan);
                const isRemoving = removingId === item.idSubscriptionTypes;
                return (
                  <li
                    key={item.cartItemId}
                    className={`flex items-center gap-4 rounded-3xl p-4 shadow-aurora-sm ring-1 transition-shadow duration-200 hover:shadow-aurora md:gap-5 md:p-5 ${
                      item.plan.active ? 'bg-white ring-aurora-navy/5' : 'bg-red-50/60 ring-red-200'
                    }`}
                  >
                    <SafeImage
                      src={item.plan.image}
                      alt={item.plan.name}
                      fallbackIcon="📦"
                      className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover md:h-28 md:w-28"
                    />
                    <div className="min-w-0 flex-grow">
                      <Link to={`/club/${item.club.id}`} className="text-xs font-semibold uppercase tracking-wider text-aurora-navy/50 transition-colors hover:text-aurora-terracotta">
                        {item.club.name}
                      </Link>
                      <h3 className="truncate font-display text-xl font-medium text-aurora-navy">{item.plan.name}</h3>
                      {item.plan.deliveryFrequency && <p className="text-sm text-aurora-navy/60">{item.plan.deliveryFrequency}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="font-display text-2xl font-medium text-aurora-navy">{money(item.plan.price)}</span>
                        {discount > 0 && item.plan.active && (
                          <span className="rounded-full border border-green-100 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                            Hasta {discount}% off pagando en efectivo o transferencia
                          </span>
                        )}
                        {!item.plan.active && (
                          <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                            Ya no está disponible
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.idSubscriptionTypes)}
                      disabled={isRemoving}
                      aria-label={`Quitar ${item.plan.name} del carrito`}
                      className="rounded-full p-2 text-aurora-navy/35 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="lg:col-span-1">
              <div className="rounded-3xl bg-white p-6 shadow-aurora-lg ring-1 ring-aurora-navy/5 md:p-8 lg:sticky lg:top-24">
                <h2 className="mb-5 font-display text-2xl font-medium text-aurora-navy">Resumen del pedido</h2>
                <div className="mb-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-aurora-navy/60">
                      {items.length} {items.length === 1 ? 'plan' : 'planes'}
                    </span>
                    <span className="font-semibold text-aurora-navy">{money(total)}</span>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-aurora-navy/10 pt-4">
                    <span className="font-semibold text-aurora-navy">Total estimado</span>
                    <span className="font-display text-3xl font-medium text-aurora-navy">{money(total)}</span>
                  </div>
                  {possibleSavings > 0 && (
                    <p className="rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-700">
                      Podés ahorrar hasta {money(possibleSavings)} si elegís efectivo o transferencia en el próximo paso.
                    </p>
                  )}
                  <p className="text-xs text-aurora-navy/50">
                    El envío y el descuento final se calculan en el checkout, según tu medio de pago.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!canCheckout}
                  className="btn-primary btn-shine w-full disabled:opacity-50"
                >
                  Continuar al pago
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <button type="button" onClick={() => navigate('/explore')} className="btn-outline">
            Seguir explorando
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;