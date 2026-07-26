import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import api, { getResponseData } from '../../api/config';

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

const CartPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart-items');
      const data = getResponseData(response);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('Error al cargar tu carrito.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCart();
    else setLoading(false);
  }, [user]);

  const handleRemove = async (idSubscriptionTypes: number) => {
    setRemovingId(idSubscriptionTypes);
    try {
      await api.delete(`/cart-items/${idSubscriptionTypes}`);
      setItems((prev) => prev.filter((i) => i.idSubscriptionTypes !== idSubscriptionTypes));
    } catch {
      setError('No se pudo quitar el plan del carrito.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      setError('Tu carrito está vacío. Agregá planes primero.');
      return;
    }
    navigate('/checkout');
  };

  const subtotal = items.reduce((sum, item) => {
    const descuento = Math.max(item.plan.cashDiscount ?? 0, item.plan.transferDiscount ?? 0);
    return sum + item.plan.price * (1 - descuento / 100);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora-cream py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aurora-terracotta mx-auto mb-4"></div>
          <p className="text-aurora-navy/70">Cargando tu carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurora-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-aurora-navy mb-2">Mi Carrito de Compras</h1>
          <p className="text-aurora-navy/70">{user ? `Hola, ${user.firstName}!` : 'Revisá tus planes seleccionados.'}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6 text-center">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-aurora-navy/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7.5M7 13l-1.5 7.5M17 13l1.5 7.5M17 13l4-8m-8 4h8M9 4h6m-6 0h6a2 2 0 002-2V2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-aurora-navy mb-2">Tu carrito está vacío</h3>
            <p className="text-aurora-navy/60 mb-4">¡Agregá planes desde el perfil de un club!</p>
            <div className="space-x-4">
              <button onClick={() => navigate('/customer/wishlist')} className="bg-aurora-navy text-white px-6 py-3 rounded-xl hover:bg-aurora-navy/90 transition-colors font-semibold">
                Ver Wishlist
              </button>
              <button onClick={() => navigate('/explore')} className="bg-aurora-terracotta text-white px-6 py-3 rounded-xl hover:bg-aurora-terracottaDark transition-colors font-semibold">
                Explorar Clubes
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const descuento = Math.max(item.plan.cashDiscount ?? 0, item.plan.transferDiscount ?? 0);
                const precioFinal = item.plan.price * (1 - descuento / 100);
                return (
                  <div key={item.cartItemId} className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-4 flex gap-4 items-center hover:shadow-md transition-shadow duration-200">
                    <img
                      src={item.plan.image || 'https://placehold.co/120x120/FBF4E9/1F3350?text=Sin+imagen'}
                      alt={item.plan.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-grow min-w-0">
                      <p className="text-xs text-aurora-navy/50">{item.club.name}</p>
                      <h3 className="font-bold text-aurora-navy truncate">{item.plan.name}</h3>
                      <p className="text-sm text-aurora-navy/60">{item.plan.deliveryFrequency}</p>
                      <div className="mt-1">
                        {descuento > 0 && (
                          <span className="text-xs text-aurora-navy/40 line-through mr-2">ARS {item.plan.price.toLocaleString('es-AR')}</span>
                        )}
                        <span className="font-bold text-aurora-terracotta">ARS {precioFinal.toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.idSubscriptionTypes)}
                      disabled={removingId === item.idSubscriptionTypes}
                      className="text-red-400 hover:text-red-600 p-2 disabled:opacity-50 transition-colors"
                      title="Quitar del carrito"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6 sticky top-8">
                <h2 className="text-xl font-serif font-bold text-aurora-navy mb-4">Resumen del Pedido</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-aurora-navy/60">Subtotal ({items.length} planes)</span>
                    <span className="font-semibold text-aurora-navy">${subtotal.toLocaleString('es-AR')} ARS</span>
                  </div>
                  <div className="border-t border-aurora-navy/10 pt-3 flex justify-between text-lg font-bold text-aurora-navy">
                    <span>Total</span>
                    <span>${subtotal.toLocaleString('es-AR')} ARS</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-aurora-terracotta text-white py-3 px-6 rounded-xl hover:bg-aurora-terracottaDark transition-colors font-semibold text-lg"
                >
                  Proceder al Pago
                </button>
                <div className="mt-4 text-xs text-aurora-navy/50 text-center">Seguro y confidencial</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <button onClick={() => navigate('/explore')} className="bg-aurora-navy text-white px-8 py-3 rounded-xl hover:bg-aurora-navy/90 transition-colors font-semibold">
            Seguir Comprando
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;