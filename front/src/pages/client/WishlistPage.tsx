import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import api, { getResponseData } from '../../api/config';
import SafeImage from '../../components/common/SafeImage';
import Reveal from '../../components/common/Reveal';

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
      <div className="min-h-screen bg-aurora-cream px-4 py-16">
        <div role="status" className="mx-auto max-w-6xl text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
          <p className="text-aurora-navy/70">Cargando tu lista de deseos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div className="hero-mesh grain relative overflow-hidden">
        <div className="container relative mx-auto px-4 pb-24 pt-12 md:pb-28">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-aurora-goldLight">Tus favoritos</span>
          <h1 className="font-display text-4xl font-normal leading-tight text-white md:text-6xl">Mi lista de deseos</h1>
          <p className="mt-3 max-w-xl text-lg text-white/80">
            {user ? `Hola, ${user.firstName}. ` : ''}Estos son los planes que marcaste con corazón, agrupados por club.
          </p>
          {entries.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="glass rounded-full px-4 py-1.5 text-sm font-semibold text-white">
                {entries.length} {entries.length === 1 ? 'plan' : 'planes'}
              </span>
              <span className="glass rounded-full px-4 py-1.5 text-sm text-white">
                {clubOptions.length} {clubOptions.length === 1 ? 'club' : 'clubes'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto -mt-14 px-4 pb-16 md:-mt-16">
        {error && (
          <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {entries.length > 0 && (
          <div className="mb-8 flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-aurora ring-1 ring-aurora-navy/5 md:flex-row md:p-5">
            <input
              type="text"
              aria-label="Buscar por club o nombre de plan"
              placeholder="Buscar por club o nombre de plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-aurora flex-grow"
            />
            <select
              aria-label="Filtrar por club"
              value={selectedClubId ?? ''}
              onChange={(e) => setSelectedClubId(e.target.value ? Number(e.target.value) : null)}
              className="input-aurora md:w-64"
            >
              <option value="">Todos los clubes</option>
              {clubOptions.map((club) => (
                <option key={club.id} value={club.id}>{club.name}</option>
              ))}
            </select>
          </div>
        )}

        {entries.length === 0 ? (
          <Reveal>
            <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-aurora ring-1 ring-aurora-navy/5">
              <span className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-aurora-cream text-aurora-terracotta">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </span>
              <h2 className="mb-2 font-display text-3xl font-medium text-aurora-navy">Todavía no marcaste ningún plan</h2>
              <p className="mb-8 text-aurora-navy/60">Explorá clubes y tocá el corazón en los planes que te gusten.</p>
              <button onClick={() => navigate('/explore')} className="btn-primary btn-shine">
                Explorar clubes
              </button>
            </div>
          </Reveal>
        ) : groupedByClub.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-aurora-sm ring-1 ring-aurora-navy/5">
            <p className="text-lg font-medium text-aurora-navy/70">No hay resultados para tu búsqueda.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedByClub.map((group) => (
              <Reveal key={group.club.id}>
                <section className="overflow-hidden rounded-3xl bg-white shadow-aurora-sm ring-1 ring-aurora-navy/5">
                  <Link
                    to={`/club/${group.club.id}`}
                    className="group flex items-center gap-4 border-b border-aurora-navy/10 p-5 transition-colors hover:bg-aurora-cream/60 md:p-6"
                  >
                    <img
                      src={group.club.logoUrl || '/assets/default-club.svg'}
                      alt={group.club.name}
                      className="h-16 w-16 flex-shrink-0 rounded-2xl border border-aurora-navy/10 bg-white object-cover"
                    />
                    <div className="min-w-0 flex-grow">
                      <h2 className="truncate font-display text-2xl font-medium text-aurora-navy transition-colors group-hover:text-aurora-terracotta">{group.club.name}</h2>
                      {group.club.slogan && <p className="truncate text-sm italic text-aurora-navy/55">{group.club.slogan}</p>}
                    </div>
                    <span className="hidden text-sm font-semibold text-aurora-terracotta sm:inline">Ver club →</span>
                  </Link>
                  <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 md:p-6">
                    {group.entries.map((entry) => {
                      const descuento = Math.max(entry.plan.cashDiscount ?? 0, entry.plan.transferDiscount ?? 0);
                      return (
                        <div key={entry.favoriteId} className="group/card relative overflow-hidden rounded-2xl bg-aurora-cream ring-1 ring-aurora-navy/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-aurora">
                          <button
                            onClick={() => handleRemove(entry.favoriteId)}
                            disabled={removingId === entry.favoriteId}
                            aria-label={`Quitar ${entry.plan.name} de favoritos`}
                            title="Quitar de favoritos"
                            className="absolute right-3 top-3 z-10 rounded-full bg-white/95 p-2 text-aurora-terracotta shadow-aurora-sm transition-all hover:scale-110 hover:text-red-600 disabled:opacity-50"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M3.172 5.172a4.5 4.5 0 015.656 0L10 6.343l1.172-1.171a4.5 4.5 0 115.656 5.656L10 17.657l-6.828-6.829a4.5 4.5 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </button>
                          {descuento > 0 && (
                            <span className="absolute left-3 top-3 z-10 rounded-full bg-aurora-terracotta px-2.5 py-1 text-xs font-bold text-white shadow-aurora-sm">
                              -{descuento}%
                            </span>
                          )}
                          <button
                            onClick={() => navigate(`/club/${group.club.id}/plan/${entry.plan.planId}`)}
                            className="w-full text-left"
                          >
                            <SafeImage
                              src={entry.plan.image}
                              alt={entry.plan.name}
                              fallbackIcon="📦"
                              className="h-36 w-full object-cover"
                            />
                            <div className="p-4">
                              <h3 className="truncate font-display text-xl font-medium text-aurora-navy">{entry.plan.name}</h3>
                              {entry.plan.deliveryFrequency && <p className="mb-2 text-xs text-aurora-navy/55">{entry.plan.deliveryFrequency}</p>}
                              <span className="font-display text-2xl font-medium text-aurora-navy">ARS {entry.plan.price.toLocaleString('es-AR')}</span>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;