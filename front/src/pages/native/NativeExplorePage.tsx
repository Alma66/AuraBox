import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';
import BottomSheet from '../../components/native/BottomSheet';
import ClubRow from '../../components/native/ClubRow';
import { Club } from '../../types/club';
import { categoryIdsForGroup } from '../../utils/categoryGroups';
import { tapFeedback } from '../../utils/native';

interface Category {
  id: number;
  name: string;
}

interface ExploreClub extends Club {
  categories?: { id: number; name: string }[];
}

type SortOption = 'newest' | 'rating' | 'reviews';

const RATING_OPTIONS = [
  { label: 'Todos', value: 0 },
  { label: '3★ o más', value: 3 },
  { label: '4★ o más', value: 4 },
  { label: '4.5★ o más', value: 4.5 },
];

const REVIEW_OPTIONS = [
  { label: 'Todas', value: 0 },
  { label: '5 o más', value: 5 },
  { label: '10 o más', value: 10 },
  { label: '25 o más', value: 25 },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Más nuevos', value: 'newest' },
  { label: 'Mejor calificados', value: 'rating' },
  { label: 'Más reseñados', value: 'reviews' },
];

const STICKY_TOP = 'calc(3.5rem + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)))';

interface PillGroupProps<T extends string | number> {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

const PillGroup = <T extends string | number>({ label, options, value, onChange }: PillGroupProps<T>) => (
  <fieldset className="mb-6">
    <legend className="mb-3 text-sm font-bold text-aurora-navy">{label}</legend>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={selected}
            onClick={() => {
              tapFeedback();
              onChange(option.value);
            }}
            className={`min-h-[44px] rounded-full border px-4 text-sm font-semibold transition-colors ${
              selected
                ? 'border-aurora-terracotta bg-aurora-terracotta text-white'
                : 'border-aurora-navy/15 bg-white text-aurora-navy/70 active:bg-aurora-cream'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </fieldset>
);

const NativeExplorePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const groupParam = searchParams.get('group') ?? searchParams.get('category');
  const appliedGroup = useRef<string | null | undefined>(undefined);

  const [clubs, setClubs] = useState<ExploreClub[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [minReviews, setMinReviews] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      try {
        const response = await api.get('/categories');
        const data = getResponseData(response);
        if (active) setCategories(Array.isArray(data) ? data : []);
      } catch {
        if (active) setCategories([]);
      }
    };
    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (categories.length === 0 || appliedGroup.current === groupParam) return;
    appliedGroup.current = groupParam;
    const ids = categoryIdsForGroup(groupParam, categories);
    if (ids.length > 0) setSelectedCategoryIds(ids);
  }, [categories, groupParam]);

  const categoryKey = useMemo(() => selectedCategoryIds.slice().sort((a, b) => a - b).join(','), [selectedCategoryIds]);

  useEffect(() => {
    let active = true;
    const loadClubs = async () => {
      setLoading(true);
      setFailed(false);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (categoryKey) params.set('category', categoryKey);
        if (minRating > 0) params.set('minRating', String(minRating));
        if (minReviews > 0) params.set('minReviews', String(minReviews));
        const response = await api.get(`/clubs?${params.toString()}`);
        const data = getResponseData(response);
        if (active) setClubs(Array.isArray(data) ? data : []);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadClubs();
    return () => {
      active = false;
    };
  }, [debouncedSearch, categoryKey, minRating, minReviews, reloadKey]);

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
    tapFeedback();
    setSelectedCategoryIds((previous) => (previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]));
  };

  const clearAll = () => {
    tapFeedback();
    setSearchInput('');
    setSelectedCategoryIds([]);
    setMinRating(0);
    setMinReviews(0);
    setSortBy('newest');
  };

  const sheetFilterCount = [minRating > 0, minReviews > 0, sortBy !== 'newest'].filter(Boolean).length;
  const anyFilterActive = sheetFilterCount > 0 || selectedCategoryIds.length > 0 || searchInput.length > 0;
  const closeSheet = () => setSheetOpen(false);

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div
        className="sticky z-30 bg-aurora-cream/95 px-4 pb-3 pt-3 shadow-[0_1px_0_rgba(31,51,80,0.06)] backdrop-blur-md"
        style={{ top: STICKY_TOP }}
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-aurora-navy/40"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="search"
              enterKeyHint="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar clubes, cajas, categorías"
              aria-label="Buscar clubes"
              className="h-12 w-full rounded-2xl border border-aurora-navy/10 bg-white pl-11 pr-10 text-[15px] text-aurora-navy shadow-aurora-sm placeholder:text-aurora-navy/40 focus:border-aurora-terracotta focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/30"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                aria-label="Borrar búsqueda"
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-aurora-navy/45 active:bg-aurora-cream"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              tapFeedback();
              setSheetOpen(true);
            }}
            aria-label="Abrir filtros"
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-aurora-navy text-white shadow-aurora-sm transition-transform active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            {sheetFilterCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-aurora-terracotta text-[11px] font-bold text-white">
                {sheetFilterCount}
              </span>
            )}
          </button>
        </div>

        {categories.length > 0 && (
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
            <button
              type="button"
              aria-pressed={selectedCategoryIds.length === 0}
              onClick={() => {
                tapFeedback();
                setSelectedCategoryIds([]);
              }}
              className={`min-h-[40px] shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors ${
                selectedCategoryIds.length === 0
                  ? 'border-aurora-navy bg-aurora-navy text-white'
                  : 'border-aurora-navy/15 bg-white text-aurora-navy/70'
              }`}
            >
              Todos
            </button>
            {categories.map((category) => {
              const selected = selectedCategoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleCategory(category.id)}
                  className={`min-h-[40px] shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors ${
                    selected
                      ? 'border-aurora-terracotta bg-aurora-terracotta text-white'
                      : 'border-aurora-navy/15 bg-white text-aurora-navy/70'
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 pb-8 pt-4">
        {!failed && (
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-aurora-navy/60" aria-live="polite">
              {loading && clubs.length === 0
                ? 'Buscando…'
                : `${sortedClubs.length} ${sortedClubs.length === 1 ? 'club' : 'clubes'}`}
            </p>
            {anyFilterActive && (
              <button type="button" onClick={clearAll} className="text-sm font-semibold text-aurora-terracotta">
                Limpiar todo
              </button>
            )}
          </div>
        )}

        {failed ? (
          <div role="alert" className="rounded-3xl bg-white p-8 text-center shadow-aurora-sm ring-1 ring-aurora-navy/5">
            <p className="text-4xl" aria-hidden="true">📡</p>
            <p className="mt-3 font-display text-lg font-bold text-aurora-navy">No pudimos cargar los clubes</p>
            <p className="mt-1 text-sm text-aurora-navy/60">Revisá tu conexión e intentá de nuevo.</p>
            <button
              type="button"
              onClick={() => {
                tapFeedback();
                setReloadKey((value) => value + 1);
              }}
              className="btn-primary mt-5 !px-6 !py-2.5 !text-sm"
            >
              Reintentar
            </button>
          </div>
        ) : loading && clubs.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-[7.5rem] animate-pulse rounded-3xl bg-white shadow-aurora-sm" />
            ))}
          </div>
        ) : sortedClubs.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-aurora-sm ring-1 ring-aurora-navy/5">
            <p className="text-5xl" aria-hidden="true">🔍</p>
            <p className="mt-3 font-display text-lg font-bold text-aurora-navy">No encontramos clubes con eso</p>
            <p className="mt-1 text-sm text-aurora-navy/60">Probá con otra búsqueda o sacá algún filtro.</p>
            {anyFilterActive && (
              <button type="button" onClick={clearAll} className="btn-secondary mt-5 !px-6 !py-2.5 !text-sm">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className={`space-y-3 transition-opacity duration-200 ${loading ? 'opacity-60' : 'opacity-100'}`}>
            {sortedClubs.map((club, index) => (
              <ClubRow
                key={club.id}
                id={club.id}
                name={club.name}
                slogan={club.slogan || club.shortDescription || ''}
                logoUrl={club.logoUrl}
                rating={Number(club.averageRating) || 0}
                reviewsCount={club.totalReviews || 0}
                categories={club.categories?.map((category) => category.name)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      <BottomSheet
        open={sheetOpen}
        title="Filtros"
        onClose={closeSheet}
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={clearAll}
              className="min-h-[48px] flex-1 rounded-full border-2 border-aurora-navy/15 font-semibold text-aurora-navy active:bg-aurora-cream"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => {
                tapFeedback();
                closeSheet();
              }}
              className="btn-primary min-h-[48px] flex-[1.6]"
            >
              Ver {sortedClubs.length} {sortedClubs.length === 1 ? 'club' : 'clubes'}
            </button>
          </div>
        }
      >
        <PillGroup label="Ordenar por" options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />
        <PillGroup label="Calificación mínima" options={RATING_OPTIONS} value={minRating} onChange={setMinRating} />
        <PillGroup label="Cantidad de reseñas" options={REVIEW_OPTIONS} value={minReviews} onChange={setMinReviews} />
      </BottomSheet>
    </div>
  );
};

export default NativeExplorePage;