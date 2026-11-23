import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ExploreClubCard from '../components/shared/ExploreClubCard';
import api, { getResponseData } from '../api/config';
import { Link, useSearchParams } from 'react-router-dom';
import { categoryIdsForGroup } from '../utils/categoryGroups';
import { Club } from '../types/club';
import Reveal from '../components/common/Reveal';

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

interface FilterDropdownProps {
  label: string;
  activeLabel?: string;
  children: (close: () => void) => React.ReactNode;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, activeLabel, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
          activeLabel
            ? 'border-aurora-terracotta bg-aurora-terracotta/10 text-aurora-terracottaDark'
            : 'border-aurora-navy/15 bg-white text-aurora-navy hover:border-aurora-terracotta/50'
        }`}
      >
        {activeLabel || label}
        <svg className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 min-w-[13rem] animate-fadeInUp rounded-2xl bg-white p-2 opacity-0 shadow-aurora-lg ring-1 ring-aurora-navy/10">
          {children(close)}
        </div>
      )}
    </div>
  );
};

interface DropdownOptionProps {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

const DropdownOption: React.FC<DropdownOptionProps> = ({ selected, onSelect, children }) => (
  <button
    type="button"
    role="option"
    aria-selected={selected}
    onClick={onSelect}
    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
      selected ? 'bg-aurora-terracotta/10 font-semibold text-aurora-terracottaDark' : 'text-aurora-navy/80 hover:bg-aurora-cream'
    }`}
  >
    <span className="flex items-center gap-1.5">{children}</span>
    {selected && (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.6} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    )}
  </button>
);

const ExploreClubsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const groupParam = searchParams.get('group') ?? searchParams.get('category');
  const initialSearch = searchParams.get('search') ?? '';
  const appliedGroup = useRef<string | null | undefined>(undefined);
  const [clubs, setClubs] = useState<ClubWithCategories[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch.trim());
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

  const ratingLabel = minRating > 0 ? `${minRating}★ o más` : undefined;
  const reviewsLabel = minReviews > 0 ? `${minReviews}+ reseñas` : undefined;
  const sortLabel = SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label ?? 'Ordenar';

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div className="hero-mesh grain relative isolate overflow-hidden px-4 pb-24 pt-16 text-center">
        <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-72 w-72 animate-blobMove rounded-full bg-aurora-sun/30 blur-3xl" />
        <div
          className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-72 w-72 animate-blobMove rounded-full bg-aurora-coral/40 blur-3xl"
          style={{ animationDelay: '-8s' }}
        />
        <span className="glass mb-5 inline-block animate-fadeInUp rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
          Catálogo completo
        </span>
        <h1 className="mb-3 animate-fadeInUp font-display text-4xl font-normal text-white md:text-6xl">Explorá todos los <em className="italic text-aurora-goldLight">clubes</em></h1>
        <p className="mx-auto mb-9 max-w-xl text-lg text-white/85">
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
            className="w-full rounded-full border-0 bg-white py-4 pl-12 pr-12 text-aurora-navy shadow-aurora-lg placeholder:text-aurora-navy/40 focus:outline-none focus:ring-4 focus:ring-aurora-sun/60"
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
        <svg className="absolute bottom-[-1px] left-0 block h-10 w-full text-aurora-cream md:h-14" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,48 C240,96 480,0 720,32 C960,64 1200,96 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>

      <div className="hidden border-b border-aurora-navy/5 bg-aurora-cream/90 backdrop-blur lg:sticky lg:top-16 lg:z-20 lg:block">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="no-scrollbar -mx-1 flex flex-1 items-center gap-2 overflow-x-auto px-1 py-1">
              <button
                type="button"
                onClick={() => setSelectedCategoryIds([])}
                aria-pressed={selectedCategoryIds.length === 0}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  selectedCategoryIds.length === 0
                    ? 'bg-aurora-navy text-white shadow-aurora-sm'
                    : 'bg-white text-aurora-navy ring-1 ring-aurora-navy/10 hover:ring-aurora-terracotta/50'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => {
                const selected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    aria-pressed={selected}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      selected
                        ? 'bg-aurora-terracotta text-white shadow-aurora-glow'
                        : 'bg-white text-aurora-navy ring-1 ring-aurora-navy/10 hover:-translate-y-0.5 hover:ring-aurora-terracotta/50'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
            <span className="h-6 w-px shrink-0 bg-aurora-navy/10" aria-hidden="true" />
            <div className="flex shrink-0 items-center gap-2">
              <FilterDropdown label="Calificación" activeLabel={ratingLabel}>
                {(close) =>
                  RATING_OPTIONS.map((opt) => (
                    <DropdownOption
                      key={opt.value}
                      selected={minRating === opt.value}
                      onSelect={() => {
                        setMinRating(opt.value);
                        close();
                      }}
                    >
                      {opt.value > 0 && <StarIcon />}
                      {opt.label}
                    </DropdownOption>
                  ))
                }
              </FilterDropdown>
              <FilterDropdown label="Reseñas" activeLabel={reviewsLabel}>
                {(close) =>
                  REVIEW_OPTIONS.map((opt) => (
                    <DropdownOption
                      key={opt.value}
                      selected={minReviews === opt.value}
                      onSelect={() => {
                        setMinReviews(opt.value);
                        close();
                      }}
                    >
                      {opt.label}
                    </DropdownOption>
                  ))
                }
              </FilterDropdown>
              <FilterDropdown label={sortLabel}>
                {(close) =>
                  SORT_OPTIONS.map((opt) => (
                    <DropdownOption
                      key={opt.value}
                      selected={sortBy === opt.value}
                      onSelect={() => {
                        setSortBy(opt.value);
                        close();
                      }}
                    >
                      {opt.label}
                    </DropdownOption>
                  ))
                }
              </FilterDropdown>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-2 text-sm font-semibold text-aurora-terracotta transition-colors hover:text-aurora-terracottaDark"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-aurora-navy/60" aria-live="polite">
            {loading && clubs.length === 0
              ? 'Buscando clubes...'
              : `${sortedClubs.length} ${sortedClubs.length === 1 ? 'club encontrado' : 'clubes encontrados'}`}
          </p>
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 rounded-full border border-aurora-navy/15 bg-white px-4 py-2 text-sm font-semibold text-aurora-navy transition-colors hover:border-aurora-terracotta/50"
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
          <div className="mb-5 flex flex-wrap items-center gap-2 lg:hidden">
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-aurora-navy/10" />
              ))}
            </div>
          ) : sortedClubs.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {sortedClubs.map((club, index) => (
                <div key={club.id} className="animate-fadeInUp opacity-0" style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}>
                  <ExploreClubCard
                    id={String(club.id)}
                    name={club.name}
                    slogan={club.slogan || ''}
                    description={club.shortDescription || club.slogan || ''}
                    image={club.logoUrl || '/assets/default-club.svg'}
                    rating={Number(club.averageRating) || 0}
                    reviewsCount={club.totalReviews || 0}
                  />
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <div className="rounded-3xl bg-white py-16 text-center shadow-aurora-sm ring-1 ring-aurora-navy/5">
                <p className="mb-4 text-5xl">🔍</p>
                <p className="font-display text-2xl font-semibold text-aurora-navy">No encontramos clubes con esos filtros.</p>
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

        <Reveal className="mt-20">
          <section className="hero-mesh grain relative isolate overflow-hidden rounded-3xl px-6 py-16 text-center text-white shadow-aurora-lg">
            <div className="pointer-events-none absolute -left-10 -top-10 -z-10 h-56 w-56 animate-blobMove rounded-full bg-aurora-sun/30 blur-3xl" />
            <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">¿Tenés un club de suscripción?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/85">
              Unite a AuraBox y profesionalizá tu negocio. Llegá a nuevos suscriptores y gestioná todo de forma sencilla.
            </p>
            <Link
              to="/register/entrepreneur"
              className="btn-shine inline-flex items-center rounded-full bg-white px-10 py-4 text-lg font-bold text-aurora-terracottaDark shadow-aurora-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-aurora-cream"
            >
              Registrá tu club hoy
            </Link>
          </section>
        </Reveal>
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