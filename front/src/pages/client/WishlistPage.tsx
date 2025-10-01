// src/pages/client/WishlistPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import clubPlansData from '../../data/clubPlans.json'; // Importa planes simulados
import PlanCard from '../../components/client/PlanCard';
import { SubscriptionPlan } from '../../types/club';

const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Simula carga de wishlist del usuario (fija, de JSON)
  useEffect(() => {
    // Filtra planes para este usuario (simulado: toma los primeros 3)
    const simulatedWishlist = (clubPlansData as SubscriptionPlan[]).slice(0, 3);
    setWishlistItems(simulatedWishlist);
    setLoading(false);
  }, []);

  const handleRemove = (planId: string) => {
    setWishlistItems(prev => prev.filter(item => item.planId !== planId));
    // En backend: PATCH /api/wishlist/remove
  };

  const handleAddToCart = (plan: SubscriptionPlan) => {
    // Simula adición: Navega a cart con el plan (en real: POST /api/cart/add)
    navigate(`/cart?added=${plan.planId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu lista de deseos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mi Lista de Deseos</h1>
          <p className="text-gray-600">
            {user ? `Hola, ${user.firstName}!` : 'Descubre planes increíbles.'} Aquí están tus planes favoritos. Puedes agregarlos al carrito cuando quieras.
          </p>
        </div>

        {/* Contenido */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7.5M7 13l-1.5 7.5M17 13l1.5 7.5M17 13l4-8m-8 4h8M9 4h6m-6 0h6a2 2 0 002-2V2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tu lista está vacía</h3>
            <p className="text-gray-500 mb-4">¡Explora clubes y agrega planes que te gusten!</p>
            <button
              onClick={() => navigate('/explore')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explorar Clubes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((plan) => (
              <PlanCard
                key={plan.planId}
                plan={plan}
                onRemove={() => handleRemove(plan.planId)}
                onAddToCart={() => handleAddToCart(plan)}
                isInCart={false}
              />
            ))}
          </div>
        )}

        {/* Footer de página */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/explore')}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Continuar Explorando
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;