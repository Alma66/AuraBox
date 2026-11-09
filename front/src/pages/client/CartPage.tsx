import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import api, { getResponseData } from '../../api/config';
import SafeImage from '../../components/common/SafeImage';

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
      <div className="min-h-screen bg-aurora-cream py-12 px-4">
        <div className="max-w-4xl mx-auto text-center" role="status">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aurora-terracotta mx-auto mb-4"></div>
          <p className="text-aurora-navy/70">Cargando tu carrito...</p>
        </div>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="min-h-screen bg-aurora-cream py-12 px-4">
        <div role="alert" className="max-w-md mx-auto card-surface shadow-aurora p-8 text-center">
          <h1 className="font-display text-2xl font-bold text-aurora-navy mb-2">No pudimos cargar tu carrito</h1>
          <p className="text-aurora-navy/60 mb-6">Revisá tu conexión e intentá de nuevo.</p>
          <button type="button" onClick={fetchCart} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurora-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-aurora-navy mb-2">Mi Carrito</h1>
          <p className="text-aurora-navy/70">{user ? `Hola, ${user.firstName}. Revisá tus planes antes de pagar.` : 'Revisá tus planes seleccionados.'}</p>
        </div>

        {actionError && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6 text-center">
            {actionError}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12 card-surface shadow-aurora-sm">
            <svg className="mx-auto h-20 w-20 text-aurora-navy/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-aurora-navy mb-2">Tu carrito está vacío</h2>
            <p className="text-aurora-navy/60 mb-6">Agregá planes desde el perfil de un club.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => navigate('/customer/wishlist')} className="btn-outline">
                Ver mi lista de deseos
              </button>
              <button type="button" onClick={() => navigate('/explore')} className="btn-primary">
                Explorar clubes
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ul className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const discount = bestDiscount(item.plan);
                const isRemoving = removingId === item.idSubscriptionTypes;
                return (
                  <li
                    key={item.cartItemId}
                    className={`bg-white rounded-xl shadow-aurora-sm border p-4 flex gap-4 items-center transition-shadow duration-200 hover:shadow-md ${
                      item.plan.active ? 'border-aurora-navy/10' : 'border-red-200 bg-red-50/40'
                    }`}
                  >
                    <SafeImage
                      src={item.plan.image}
                      alt={item.plan.name}
                      fallbackIcon="📦"
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-grow min-w-0">
                      <Link to={`/club/${item.club.id}`} className="text-xs text-aurora-navy/50 hover:text-aurora-terracotta">
                        {item.club.name}
                      </Link>
                      <h3 className="font-bold text-aurora-navy truncate">{item.plan.name}</h3>
                      <p className="text-sm text-aurora-navy/60">{item.plan.deliveryFrequency}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="font-bold text-aurora-terracotta">{money(item.plan.price)}</span>
                        {discount > 0 && item.plan.active && (
                          <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-full px-2 py-0.5">
                            Hasta {discount}% off pagando en efectivo o transferencia
                          </span>
                        )}
                        {!item.plan.active && (
                          <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
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
                      className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6 lg:sticky lg:top-24">
                <h2 className="font-display text-xl font-bold text-aurora-navy mb-4">Resumen del pedido</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-aurora-navy/60">
                      {items.length} {items.length === 1 ? 'plan' : 'planes'}
                    </span>
                    <span className="font-semibold text-aurora-navy">{money(total)}</span>
                  </div>
                  <div className="border-t border-aurora-navy/10 pt-3 flex justify-between text-lg font-bold text-aurora-navy">
                    <span>Total estimado</span>
                    <span>{money(total)}</span>
                  </div>
                  {possibleSavings > 0 && (
                    <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
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
                  className="btn-primary w-full !py-3 text-lg disabled:opacity-50"
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