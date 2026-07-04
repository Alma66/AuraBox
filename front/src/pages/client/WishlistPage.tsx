import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import api, { getResponseData } from '../../api/config';

interface WishlistPlan {
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

interface WishlistEntry {
  favoriteId: number;
  idClub: number;
  dateAdded: string;
  club: {
    id: number;
    name: string;
    logoUrl: string;
    slogan: string | null;
    averageRating: string | null;
    totalReviews: number;
    clubStatus: string;
  };
  plans: WishlistPlan[];
}

const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get(`/favorites/by-user/${user.id}`);
        const data = getResponseData(response);
        setEntries(Array.isArray(data) ? data : []);
      } catch {
        setError('Error al cargar tu lista de deseos.');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user]);

  const handleRemove = async (idClub: number) => {
    setRemovingId(idClub);
    try {
      await api.delete(`/favorites/by-club/${idClub}`);
      setEntries((prev) => prev.filter((e) => e.idClub !== idClub));
    } catch {
      setError('No se pudo quitar el club de favoritos.');
    } finally {
      setRemovingId(null);
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (selectedClubId !== null && entry.idClub !== selectedClubId) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const clubMatch = entry.club.name.toLowerCase().includes(term) || (entry.club.slogan || '').toLowerCase().includes(term);
      const planMatch = entry.plans.some((p) => p.name.toLowerCase().includes(term));
      return clubMatch || planMatch;
    });
  }, [entries, searchTerm, selectedClubId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu lista de deseos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mi Lista de Deseos</h1>
          <p className="text-gray-600">
            {user ? `Hola, ${user.firstName}! ` : ''}Estos son los clubes que marcaste con corazón, junto a sus planes disponibles.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6 text-center">
            {error}
          </div>
        )}

        {entries.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-8 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar por club o nombre de plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedClubId ?? ''}
              onChange={(e) => setSelectedClubId(e.target.value ? Number(e.target.value) : null)}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los clubes</option>
              {entries.map((entry) => (
                <option key={entry.idClub} value={entry.idClub}>{entry.club.name}</option>
              ))}
            </select>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-inner">
            <svg className="mx-auto h-20 w-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Todavía no marcaste ningún club</h3>
            <p className="text-gray-500 mb-4">Explorá clubes y tocá el corazón en los que te gusten.</p>
            <button
              onClick={() => navigate('/explore')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explorar Clubes
            </button>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-inner">
            <p className="text-lg text-gray-600 font-medium">No hay resultados para tu búsqueda.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEntries.map((entry) => (
              <div key={entry.favoriteId} className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => navigate(`/club/${entry.idClub}`)}
                  >
                    <img
                      src={entry.club.logoUrl || '/assets/default-club.jpg'}
                      alt={entry.club.name}
                      className="w-14 h-14 rounded-full object-cover border border-gray-100"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors">{entry.club.name}</h3>
                      {entry.club.slogan && <p className="text-sm text-gray-500 italic">{entry.club.slogan}</p>}
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-400 text-sm">⭐</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {entry.club.averageRating ? Number(entry.club.averageRating).toFixed(1) : '—'}
                        </span>
                        <span className="text-xs text-gray-400">({entry.club.totalReviews} reseñas)</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(entry.idClub)}
                    disabled={removingId === entry.idClub}
                    className="text-red-400 hover:text-red-600 transition-colors p-2 disabled:opacity-50"
                    title="Quitar de favoritos"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4.5 4.5 0 015.656 0L10 6.343l1.172-1.171a4.5 4.5 0 115.656 5.656L10 17.657l-6.828-6.829a4.5 4.5 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                {entry.plans.length > 0 ? (
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {entry.plans.map((plan) => {
                      const descuento = Math.max(plan.cashDiscount ?? 0, plan.transferDiscount ?? 0);
                      return (
                        <button
                          key={plan.planId}
                          onClick={() => navigate(`/club/${entry.idClub}/plan/${plan.planId}`)}
                          className="text-left border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-gray-50"
                        >
                          <img
                            src={plan.image || 'https://placehold.co/400x160/e2e8f0/94a3b8?text=Sin+imagen'}
                            alt={plan.name}
                            className="w-full h-28 object-cover"
                          />
                          <div className="p-3">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">{plan.name}</h4>
                            <p className="text-xs text-gray-500 mb-1">{plan.deliveryFrequency}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-indigo-700 text-sm">ARS {plan.price.toLocaleString('es-AR')}</span>
                              {descuento > 0 && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">-{descuento}%</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic px-5 py-4">Este club todavía no tiene planes activos.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;