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

interface WishlistClub {
  id: number;
  name: string;
  logoUrl: string;
  slogan: string | null;
}

interface WishlistEntry {
  favoriteId: number;
  idSubscriptionTypes: number;
  dateAdded: string;
  plan: WishlistPlan;
  club: WishlistClub;
}

interface GroupedByClub {
  club: WishlistClub;
  entries: WishlistEntry[];
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

  const handleRemove = async (favoriteId: number) => {
    const entry = entries.find((e) => e.favoriteId === favoriteId);
    if (!entry) return;
    setRemovingId(favoriteId);
    try {
      await api.post(`/favorites/toggle/${entry.idSubscriptionTypes}`);
      setEntries((prev) => prev.filter((e) => e.favoriteId !== favoriteId));
    } catch {
      setError('No se pudo quitar el plan de favoritos.');
    } finally {
      setRemovingId(null);
    }
  };

  const clubOptions = useMemo(() => {
    const map = new Map<number, WishlistClub>();
    entries.forEach((e) => map.set(e.club.id, e.club));
    return Array.from(map.values());
  }, [entries]);

  const groupedByClub = useMemo<GroupedByClub[]>(() => {
    const filtered = entries.filter((entry) => {
      if (selectedClubId !== null && entry.club.id !== selectedClubId) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const clubMatch = entry.club.name.toLowerCase().includes(term) || (entry.club.slogan || '').toLowerCase().includes(term);
      const planMatch = entry.plan.name.toLowerCase().includes(term);
      return clubMatch || planMatch;
    });

    const groups = new Map<number, GroupedByClub>();
    filtered.forEach((entry) => {
      const existing = groups.get(entry.club.id);
      if (existing) {
        existing.entries.push(entry);
      } else {
        groups.set(entry.club.id, { club: entry.club, entries: [entry] });
      }
    });
    return Array.from(groups.values());
  }, [entries, searchTerm, selectedClubId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora-cream py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aurora-terracotta mx-auto mb-4"></div>
          <p className="text-aurora-navy/70">Cargando tu lista de deseos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurora-cream py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-aurora-navy mb-2">Mi Lista de Deseos</h1>
          <p className="text-aurora-navy/70">
            {user ? `Hola, ${user.firstName}! ` : ''}Estos son los planes que marcaste con corazón, agrupados por club.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6 text-center">
            {error}
          </div>
        )}

        {entries.length > 0 && (
          <div className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-5 mb-8 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar por club o nombre de plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow p-3 border border-aurora-navy/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-aurora-terracotta"
            />
            <select
              value={selectedClubId ?? ''}
              onChange={(e) => setSelectedClubId(e.target.value ? Number(e.target.value) : null)}
              className="p-3 border border-aurora-navy/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-aurora-terracotta"
            >
              <option value="">Todos los clubes</option>
              {clubOptions.map((club) => (
                <option key={club.id} value={club.id}>{club.name}</option>
              ))}
            </select>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10">
            <svg className="mx-auto h-20 w-20 text-aurora-navy/15 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-aurora-navy mb-2">Todavía no marcaste ningún plan</h3>
            <p className="text-aurora-navy/60 mb-4">Explorá clubes y tocá el corazón en los planes que te gusten.</p>
            <button
              onClick={() => navigate('/explore')}
              className="bg-aurora-terracotta text-white px-6 py-3 rounded-xl hover:bg-aurora-terracottaDark transition-colors font-semibold"
            >
              Explorar Clubes
            </button>
          </div>
        ) : groupedByClub.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10">
            <p className="text-lg text-aurora-navy/70 font-medium">No hay resultados para tu búsqueda.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedByClub.map((group) => (
              <div key={group.club.id} className="bg-white rounded-2xl shadow-aurora-sm border border-aurora-navy/10 overflow-hidden">
                <div
                  className="flex items-center gap-4 p-5 border-b border-aurora-navy/10 cursor-pointer"
                  onClick={() => navigate(`/club/${group.club.id}`)}
                >
                  <img
                    src={group.club.logoUrl || '/assets/default-club.jpg'}
                    alt={group.club.name}
                    className="w-14 h-14 rounded-full object-cover border border-aurora-navy/10"
                  />
                  <div>
                    <h3 className="font-bold text-aurora-navy text-lg hover:text-aurora-terracotta transition-colors">{group.club.name}</h3>
                    {group.club.slogan && <p className="text-sm text-aurora-navy/50 italic">{group.club.slogan}</p>}
                  </div>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.entries.map((entry) => {
                    const descuento = Math.max(entry.plan.cashDiscount ?? 0, entry.plan.transferDiscount ?? 0);
                    return (
                      <div key={entry.favoriteId} className="relative border border-aurora-navy/10 rounded-xl overflow-hidden bg-aurora-cream hover:shadow-md transition-shadow duration-200">
                        <button
                          onClick={() => handleRemove(entry.favoriteId)}
                          disabled={removingId === entry.favoriteId}
                          className="absolute top-2 right-2 z-10 bg-white/90 text-red-500 hover:text-red-700 p-1.5 rounded-full shadow-md transition-colors disabled:opacity-50"
                          title="Quitar de favoritos"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4.5 4.5 0 015.656 0L10 6.343l1.172-1.171a4.5 4.5 0 115.656 5.656L10 17.657l-6.828-6.829a4.5 4.5 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => navigate(`/club/${group.club.id}/plan/${entry.plan.planId}`)}
                          className="w-full text-left"
                        >
                          <img
                            src={entry.plan.image || 'https://placehold.co/400x160/FBF4E9/1F3350?text=Sin+imagen'}
                            alt={entry.plan.name}
                            className="w-full h-28 object-cover"
                          />
                          <div className="p-3">
                            <h4 className="font-semibold text-aurora-navy text-sm truncate pr-6">{entry.plan.name}</h4>
                            <p className="text-xs text-aurora-navy/50 mb-1">{entry.plan.deliveryFrequency}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-aurora-terracotta text-sm">ARS {entry.plan.price.toLocaleString('es-AR')}</span>
                              {descuento > 0 && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">-{descuento}%</span>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;