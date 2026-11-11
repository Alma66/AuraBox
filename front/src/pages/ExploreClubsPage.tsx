import React, { useState, useEffect, useMemo, useRef } from 'react';
import ExploreClubCard from '../components/shared/ExploreClubCard';
import api, { getResponseData } from '../api/config';
import { Link, useSearchParams } from 'react-router-dom';
import { categoryIdsForGroup } from '../utils/categoryGroups';
import { Club } from '../types/club';

interface Category {
  id: number;
  name: string;
  description: string;
}

interface ClubWithCategories extends Club {
  categories?: { id: number; name: string }[];
}

type SortOption = 'newest' | 'rating' | 'reviews';

const REVIEW_OPTIONS = [
  { label: 'Todas', value: 0 },
  { label: '5 o más', value: 5 },
  { label: '10 o más', value: 10 },
  { label: '25 o más', value: 25 },
];

const RATING_OPTIONS = [
  { label: 'Todas', value: 0 },
  { label: '3 o más', value: 3 },
  { label: '4 o más', value: 4 },
  { label: '4.5 o más', value: 4.5 },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Más nuevos', value: 'newest' },
  { label: 'Mejor calificados', value: 'rating' },
  { label: 'Más reseñados', value: 'reviews' },
];

const StarIcon: React.FC = () => (
  <svg className="h-4 w-4 text-aurora-gold" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

interface OptionRowProps {
  type: 'radio' | 'checkbox';
  name: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}

const OptionRow: React.FC<OptionRowProps> = ({ type, name, checked, onChange, children }) => (
  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-aurora-navy/80 transition-colors hover:bg-aurora-cream hover:text-aurora-navy">
    <input
      type={type}
      name={name}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 flex-shrink-0 accent-aurora-terracotta"
    />
    <span className={`flex items-center gap-1.5 ${checked ? 'font-semibold text-aurora-navy' : ''}`}>{children}</span>
  </label>
);

interface FilterPanelProps {
  idPrefix: string;
  categories: Category[];
  selectedCategoryIds: number[];
  minRating: number;
  minReviews: number;
  activeCount: number;
  onToggleCategory: (id: number) => void;
  onRating: (value: number) => void;
  onReviews: (value: number) => void;
  onClear: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  idPrefix,
  categories,
  selectedCategoryIds,
  minRating,
  minReviews,
  activeCount,
  onToggleCategory,
  onRating,
  onReviews,
  onClear,
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="font-display text-lg font-bold text-aurora-navy">Filtros</h2>
      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold text-aurora-terracotta transition-colors hover:text-aurora-terracottaDark"
        >
          Limpiar
        </button>
      )}
    </div>

    {categories.length > 0 && (
      <fieldset>
        <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-aurora-navy/50">Categorías</legend>
        <div className="max-h-64 space-y-0.5 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <OptionRow
              key={cat.id}
              type="checkbox"
              name={`${idPrefix}-category-${cat.id}`}
              checked={selectedCategoryIds.includes(cat.id)}
              onChange={() => onToggleCategory(cat.id)}
            >
              {cat.name}
            </OptionRow>
          ))}
        </div>
      </fieldset>
    )}

    <fieldset>
      <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-aurora-navy/50">Calificación</legend>
      <div className="space-y-0.5">
        {RATING_OPTIONS.map((opt) => (
          <OptionRow
            key={opt.value}
            type="radio"
            name={`${idPrefix}-rating`}
            checked={minRating === opt.value}
            onChange={() => onRating(opt.value)}
          >
            {opt.value > 0 && <StarIcon />}
            {opt.label}
          </OptionRow>
        ))}
      </div>
    </fieldset>

    <fieldset>
      <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-aurora-navy/50">Cantidad de reseñas</legend>
      <div className="space-y-0.5">
        {REVIEW_OPTIONS.map((opt) => (
          <OptionRow
            key={opt.value}
            type="radio"
            name={`${idPrefix}-reviews`}
            checked={minReviews === opt.value}
            onChange={() => onReviews(opt.value)}
          >
            {opt.label}
          </OptionRow>
        ))}
      </div>
    </fieldset>
  </div>
);

const ExploreClubsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const groupParam = searchParams.get('group') ?? searchParams.get('category');
  const appliedGroup = useRef<string | null | undefined>(undefined);
  const [clubs, setClubs] = useState<ClubWithCategories[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [minReviews, setMinReviews] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        const data = getResponseData(response);
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length === 0 || appliedGroup.current === groupParam) return;
    appliedGroup.current = groupParam;
    const ids = categoryIdsForGroup(groupParam, categories);
    if (ids.length > 0) setSelectedCategoryIds(ids);
  }, [categories, groupParam]);

  const categoryKey = useMemo(
    () => selectedCategoryIds.slice().sort((a, b) => a - b).join(','),
    [selectedCategoryIds],
  );

  useEffect(() => {
    let cancelled = false;
    const fetchClubs = async () => {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (categoryKey) params.set('category', categoryKey);
        if (minRating > 0) params.set('minRating', String(minRating));
        if (minReviews > 0) params.set('minReviews', String(minReviews));
        const response = await api.get(`/clubs?${params.toString()}`);
        if (cancelled) return;
        const clubsData = getResponseData(response);
        setClubs(Array.isArray(clubsData) ? clubsData : []);
      } catch {
        if (!cancelled) setError('Error al cargar los clubes. Intentá más tarde.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchClubs();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, categoryKey, minRating, minReviews]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [drawerOpen]);

  const sortedClubs = useMemo(() => {
    const list = [...clubs];
    if (sortBy === 'rating') {
      list.sort((a, b) => (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0));
    } else if (sortBy === 'reviews') {
      list.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0));
    } else {
      list.sort((a, b) => {
        const dateA = a.creationDate ? new Date(a.creationDate).getTime() : 0;
        const dateB = b.creationDate ? new Date(b.creationDate).getTime() : 0;
        return dateB - dateA;
      });
    }
    return list;
  }, [clubs, sortBy]);

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const clearFilters = () => {
    setSearchInput('');
    setSelectedCategoryIds([]);
    setMinRating(0);
    setMinReviews(0);
    setSortBy('newest');
  };

  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (searchInput.trim()) {
    chips.push({ key: 'search', label: `“${searchInput.trim()}”`, onRemove: () => setSearchInput('') });
  }
  selectedCategoryIds.forEach((id) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) chips.push({ key: `cat-${id}`, label: cat.name, onRemove: () => toggleCategory(id) });
  });
  if (minRating > 0) {
    chips.push({ key: 'rating', label: `${minRating} estrellas o más`, onRemove: () => setMinRating(0) });
  }
  if (minReviews > 0) {
    chips.push({ key: 'reviews', label: `${minReviews}+ reseñas`, onRemove: () => setMinReviews(0) });
  }
  const activeCount = chips.length;

  const panelProps = {
    categories,
    selectedCategoryIds,
    minRating,
    minReviews,
    activeCount,
    onToggleCategory: toggleCategory,
    onRating: setMinRating,
    onReviews: setMinReviews,
    onClear: clearFilters,
  };

  const showSkeleton = loading && clubs.length === 0;

  return (
    <div className="bg-aurora-cream min-h-screen">
      <div className="bg-aurora-navy px-4 py-12 text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-aurora-gold/10 rounded-full blur-3xl" />
        <span className="section-eyebrow !text-aurora-gold">Catálogo completo</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3 animate-fadeInUp">
          Explorá Todos los Clubes
        </h1>
        <p className="text-white/70 max-w-xl mx-auto mb-8">
          Encontrá el club perfecto para vos entre todos los emprendimientos de AuraBox.
        </p>
        <div className="relative mx-auto max-w-2xl">
          <svg className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-aurora-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            aria-label="Buscar clubes"
            placeholder="Buscar clubes por nombre, slogan o descripción"
            className="w-full rounded-full border-0 bg-white py-3.5 pl-12 pr-12 text-aurora-navy shadow-aurora placeholder:text-aurora-navy/40 focus:outline-none focus:ring-2 focus:ring-aurora-gold"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              aria-label="Borrar búsqueda"
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-aurora-navy/50 transition-colors hover:bg-aurora-cream hover:text-aurora-navy"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-aurora-navy/5 bg-white p-5 shadow-aurora-sm">
              <FilterPanel idPrefix="desktop" {...panelProps} />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-aurora-navy/60" aria-live="polite">
                {loading && clubs.length === 0
                  ? 'Buscando clubes...'
                  : `${sortedClubs.length} ${sortedClubs.length === 1 ? 'club' : 'clubes'}`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-2 rounded-full border border-aurora-navy/15 bg-white px-4 py-2 text-sm font-semibold text-aurora-navy transition-colors hover:border-aurora-terracotta/50 lg:hidden"
                >
                  Filtros
                  {activeCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-aurora-terracotta text-xs text-white">
                      {activeCount}
                    </span>
                  )}
                </button>
                <label className="flex items-center gap-2 text-sm text-aurora-navy/60">
                  <span className="hidden sm:inline">Ordenar por</span>
                  <select
                    className="rounded-full border border-aurora-navy/15 bg-white px-4 py-2 text-sm font-semibold text-aurora-navy transition-colors hover:border-aurora-terracotta/50 focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {chips.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={`Quitar filtro ${chip.label}`}
                    className="flex items-center gap-1.5 rounded-full bg-aurora-terracotta/10 px-3 py-1 text-sm font-medium text-aurora-terracottaDark transition-colors hover:bg-aurora-terracotta/20"
                  >
                    {chip.label}
                    <span aria-hidden="true">✕</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-2 text-sm font-semibold text-aurora-navy/60 underline transition-colors hover:text-aurora-navy"
                >
                  Limpiar todo
                </button>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-red-600" role="alert">
                {error}
              </div>
            )}

            <section className={loading && !showSkeleton ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              {showSkeleton ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-square animate-pulse rounded-2xl bg-aurora-navy/10" />
                  ))}
                </div>
              ) : sortedClubs.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                  {sortedClubs.map((club) => (
                    <ExploreClubCard
                      key={club.id}
                      id={String(club.id)}
                      name={club.name}
                      slogan={club.slogan || ''}
                      description={club.shortDescription || club.slogan || ''}
                      image={club.logoUrl || '/assets/default-club.svg'}
                      rating={Number(club.averageRating) || 0}
                      reviewsCount={club.totalReviews || 0}
                    />
                  ))}
                </div>
              ) : (
                !loading && (
                  <div className="rounded-2xl border border-aurora-navy/5 bg-white py-16 text-center shadow-aurora-sm">
                    <p className="mb-4 text-5xl">🔍</p>
                    <p className="font-display text-2xl font-semibold text-aurora-navy">
                      No encontramos clubes con esos filtros.
                    </p>
                    <p className="mt-2 text-aurora-navy/50">Probá con otra palabra o quitá algún filtro.</p>
                    {activeCount > 0 && (
                      <button type="button" onClick={clearFilters} className="btn-primary mt-6">
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                )
              )}
            </section>
          </div>
        </div>

        <section className="text-center py-16 px-6 bg-gradient-to-br from-aurora-navy to-aurora-navyDark text-white rounded-2xl shadow-aurora transform transition-all duration-500 hover:scale-[1.005] mt-16 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-56 h-56 bg-aurora-gold/10 rounded-full blur-3xl" />
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">¿Tenés un Club de Suscripción?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-white/75">
            Unite a AuraBox y profesionalizá tu negocio. Llegá a miles de nuevos suscriptores y gestioná todo de forma sencilla.
          </p>
          <Link to="/register/entrepreneur" className="btn-primary !px-10 !py-4 !text-xl">
            Registrá tu Club Hoy
          </Link>
        </section>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <button
            type="button"
            aria-label="Cerrar filtros"
            className="absolute inset-0 bg-aurora-navy/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-aurora animate-fadeInUp">
            <div className="flex-1 overflow-y-auto p-5">
              <FilterPanel idPrefix="mobile" {...panelProps} />
            </div>
            <div className="border-t border-aurora-navy/10 p-4">
              <button type="button" onClick={() => setDrawerOpen(false)} className="btn-primary w-full">
                Ver {sortedClubs.length} {sortedClubs.length === 1 ? 'club' : 'clubes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreClubsPage;