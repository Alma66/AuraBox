import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../api/config';
import { useAuth } from '../../App';
import SafeImage from '../../components/common/SafeImage';
import { notifyCartChanged } from '../../utils/cartEvents';
import { getErrorMessage } from '../../utils/format';
import { formatMoney } from '../../utils/money';
import { tapFeedback } from '../../utils/native';

interface WishlistPlan {
  planId: number;
  name: string;
  price: number;
  deliveryFrequency: string;
  image: string;
  active: boolean;
  cashDiscount: number;
  transferDiscount: number;
}

interface WishlistClub {
  id: number;
  name: string;
}

interface WishlistEntry {
  favoriteId: number;
  idSubscriptionTypes: number;
  plan: WishlistPlan;
  club: WishlistClub;
}

const HEART_PATH =
  'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z';

const NativeWishlistPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;
  const [entries, setEntries] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState('');
  const [clubFilter, setClubFilter] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let active = true;
    const load = async () => {
      setLoading(true);
      setFailed(false);
      try {
        const response = await api.get(`/favorites/by-user/${userId}`);
        const data = getResponseData(response);
        if (active) setEntries(Array.isArray(data) ? data : []);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [userId, reloadKey]);

  const clubs = useMemo(() => {
    const map = new Map<number, WishlistClub>();
    entries.forEach((entry) => map.set(entry.club.id, entry.club));
    return Array.from(map.values());
  }, [entries]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter((entry) => {
      if (clubFilter !== null && entry.club.id !== clubFilter) return false;
      if (!term) return true;
      return entry.plan.name.toLowerCase().includes(term) || entry.club.name.toLowerCase().includes(term);
    });
  }, [entries, search, clubFilter]);

  const handleRemove = async (entry: WishlistEntry) => {
    if (removingId !== null) return;
    tapFeedback();
    setRemovingId(entry.favoriteId);
    try {
      await api.post(`/favorites/toggle/${entry.idSubscriptionTypes}`);
      setEntries((previous) => previous.filter((item) => item.favoriteId !== entry.favoriteId));
      toast.success('Quitado de tus favoritos');
    } catch {
      toast.error('No pudimos quitar el plan. Intentá de nuevo.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (entry: WishlistEntry) => {
    tapFeedback();
    if (addedIds.has(entry.idSubscriptionTypes)) {
      navigate('/cart');
      return;
    }
    if (addingId !== null) return;
    setAddingId(entry.idSubscriptionTypes);
    try {
      await api.post('/cart-items', { idSubscriptionTypes: entry.idSubscriptionTypes });
      notifyCartChanged();
      setAddedIds((previous) => new Set(previous).add(entry.idSubscriptionTypes));
      toast.success('Agregado a tu carrito');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'No pudimos agregar el plan.'));
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 px-4 py-6" role="status" aria-label="Cargando favoritos">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-3xl bg-white shadow-aurora-sm" />
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <div role="alert" className="px-6 py-16 text-center">
        <p className="text-5xl" aria-hidden="true">📡</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-aurora-navy">No pudimos cargar tus favoritos</h1>
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

  if (entries.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-aurora-terracotta shadow-aurora-sm">
          <svg className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={HEART_PATH} />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-aurora-navy">Todavía no tenés favoritos</h1>
        <p className="mt-2 text-sm text-aurora-navy/60">Tocá el corazón en los planes que te gusten y los vas a encontrar acá.</p>
        <button type="button" onClick={() => navigate('/explore')} className="btn-primary mt-6">
          Explorar clubes
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 pt-5">
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar por plan o club"
        aria-label="Buscar en favoritos"
        className="input-aurora"
      />

      {clubs.length > 1 && (
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          <button
            type="button"
            onClick={() => {
              tapFeedback();
              setClubFilter(null);
            }}
            className={`min-h-[40px] shrink-0 rounded-full px-4 text-sm font-semibold ${
              clubFilter === null ? 'bg-aurora-navy text-white' : 'bg-white text-aurora-navy/70 ring-1 ring-aurora-navy/10'
            }`}
          >
            Todos
          </button>
          {clubs.map((club) => (
            <button
              key={club.id}
              type="button"
              onClick={() => {
                tapFeedback();
                setClubFilter(club.id);
              }}
              className={`min-h-[40px] shrink-0 rounded-full px-4 text-sm font-semibold ${
                clubFilter === club.id ? 'bg-aurora-navy text-white' : 'bg-white text-aurora-navy/70 ring-1 ring-aurora-navy/10'
              }`}
            >
              {club.name}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="mt-10 text-center text-sm text-aurora-navy/60">No hay resultados para tu búsqueda.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {visible.map((entry, index) => {
            const discount = Math.max(entry.plan.cashDiscount ?? 0, entry.plan.transferDiscount ?? 0);
            const image = entry.plan.image && !entry.plan.image.includes('/assets/') ? entry.plan.image : '';
            const inCart = addedIds.has(entry.idSubscriptionTypes);
            return (
              <li
                key={entry.favoriteId}
                className={`relative flex animate-fadeInUp gap-3 rounded-3xl bg-white p-3 shadow-aurora-sm ring-1 ring-aurora-navy/5 transition-opacity ${
                  removingId === entry.favoriteId ? 'opacity-50' : ''
                }`}
                style={{ animationDelay: `${Math.min(index, 6) * 60}ms`, animationFillMode: 'both' }}
              >
                <Link
                  to={`/club/${entry.club.id}/plan/${entry.plan.planId}`}
                  onClick={() => {
                    tapFeedback();
                  }}
                  className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-aurora-cream"
                >
                  <SafeImage src={image} alt={entry.plan.name} fallbackIcon="📦" className="h-full w-full object-cover" />
                  {discount > 0 && entry.plan.active && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-aurora-terracotta px-2 py-0.5 text-[10px] font-bold text-white">
                      -{discount}%
                    </span>
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link to={`/club/${entry.club.id}`} className="truncate pr-10 text-xs font-bold uppercase tracking-wide text-aurora-terracotta">
                    {entry.club.name}
                  </Link>
                  <Link
                    to={`/club/${entry.club.id}/plan/${entry.plan.planId}`}
                    className="truncate pr-10 font-display text-lg font-bold leading-tight text-aurora-navy"
                  >
                    {entry.plan.name}
                  </Link>
                  <p className="text-xs text-aurora-navy/55">{entry.plan.deliveryFrequency}</p>
                  <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                    <p className="font-display text-lg font-bold text-aurora-navy">{formatMoney(entry.plan.price)}</p>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(entry)}
                      disabled={!entry.plan.active || addingId === entry.idSubscriptionTypes}
                      className="min-h-[40px] shrink-0 rounded-full bg-aurora-navy px-4 text-xs font-bold text-white transition-transform active:scale-95 disabled:opacity-50"
                    >
                      {!entry.plan.active ? 'No disponible' : inCart ? 'Ver carrito' : addingId === entry.idSubscriptionTypes ? 'Agregando…' : 'Al carrito'}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(entry)}
                  disabled={removingId === entry.favoriteId}
                  aria-label={`Quitar ${entry.plan.name} de favoritos`}
                  className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-aurora-terracotta transition-transform active:scale-90 disabled:opacity-50"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d={HEART_PATH} />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default NativeWishlistPage;