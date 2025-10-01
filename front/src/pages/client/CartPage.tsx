// src/pages/client/CartPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';
import clubPlansData from '../../data/clubPlans.json';
import PlanCard from '../../components/client/PlanCard';
import { SubscriptionPlan } from '../../types/club';

const CartPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedPlanId, setAddedPlanId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const addedId = urlParams.get('added');
    setAddedPlanId(addedId || null);

    // Inicializa carrito simulado (planes fijos, ej. 2-4 de JSON)
    const simulatedCart = (clubPlansData as SubscriptionPlan[]).slice(1, 4);
    setCartItems(simulatedCart);
    setLoading(false);
  }, [location.search]);

  const handleRemove = (planId: string) => {
    setCartItems(prev => prev.filter(item => item.planId !== planId));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Tu carrito está vacío. Agrega planes primero.');
      return;
    }
    navigate('/checkout');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const shipping = 0; // Simulado gratis
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mi Carrito de Compras</h1>
          <p className="text-gray-600">
            {user ? `Hola, ${user.firstName}!` : 'Revisa tus planes seleccionados.'}
            {addedPlanId && <span className="block text-green-600 mt-1">¡Nuevo plan agregado al carrito!</span>}
          </p>
        </div>

        {/* Lista de Items */}
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7.5M7 13l-1.5 7.5M17 13l1.5 7.5M17 13l4-8m-8 4h8M9 4h6m-6 0h6a2 2 0 002-2V2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
            <p className="text-gray-500 mb-4">¡Agrega planes de tu wishlist o explora clubes!</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/customer/wishlist')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver Wishlist
              </button>
              <button
                onClick={() => navigate('/explore')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Explorar Clubes
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((plan) => (
                  <PlanCard
                    key={plan.planId}
                    plan={plan}
                    onRemove={() => handleRemove(plan.planId)}
                    isInCart={true}
                  />
                ))}
              </div>

              {/* Resumen de Precios */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen del Pedido</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                      <span className="font-semibold">${subtotal.toLocaleString()} ARS</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envío</span>
                      <span className="text-green-600 font-semibold">Gratis</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                      <span>Total</span>
                      <span>${total.toLocaleString()} ARS</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                  >
                    Proceder al Pago
                  </button>
                  <div className="mt-4 text-xs text-gray-500 text-center">
                    Seguro y confidencial
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer de página */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/explore')}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Seguir Comprando
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;