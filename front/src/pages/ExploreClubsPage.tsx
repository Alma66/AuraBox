import React, { useState, useEffect, useMemo } from 'react';
import ExploreClubCard from '../components/shared/ExploreClubCard';
import api, { getResponseData } from '../api/config';
import { Link } from 'react-router-dom';
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
  { label: 'Cualquier cantidad de reseñas', value: 0 },
  { label: '5+ reseñas', value: 5 },
  { label: '10+ reseñas', value: 10 },
  { label: '25+ reseñas', value: 25 },
];

const RATING_OPTIONS = [
  { label: 'Cualquier rating', value: 0 },
  { label: '3 estrellas o más', value: 3 },
  { label: '4 estrellas o más', value: 4 },
  { label: '4.5 estrellas o más', value: 4.5 },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Más nuevos', value: 'newest' },
  { label: 'Mejor calificados', value: 'rating' },
  { label: 'Más reseñados', value: 'reviews' },
];

const ExploreClubsPage: React.FC = () => {
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
  const [showFilters, setShowFilters] = useState(false);

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

  const categoryKey = useMemo(
    () => selectedCategoryIds.slice().sort((a, b) => a - b).join(','),
    [selectedCategoryIds],
  );

  useEffect(() => {
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
        const clubsData = getResponseData(response);
        setClubs(Array.isArray(clubsData) ? clubsData : []);
      } catch {
        setError('Error al cargar los clubes. Intentá más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, [debouncedSearch, categoryKey, minRating, minReviews]);

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

  const activeFilterCount = [
    searchInput.length > 0,
    selectedCategoryIds.length > 0,
    minRating > 0,
    minReviews > 0,
  ].filter(Boolean).length;

  if (loading && clubs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-aurora-navy/10 rounded-lg w-1/3 mx-auto"></div>
          <div className="h-24 bg-aurora-navy/5 rounded-2xl"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square bg-aurora-navy/10 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-aurora-cream min-h-screen">
      <div className="bg-aurora-navy py-14 px-4 text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-aurora-gold/10 rounded-full blur-3xl" />
        <span className="section-eyebrow !text-aurora-gold">Catálogo completo</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3 animate-fadeInUp">
          Explorá Todos los Clubes
        </h1>
        <p className="text-white/70 max-w-xl mx-auto">
          Filtrá por categoría, rating y reseñas hasta encontrar el club perfecto para vos.
        </p>
      </div>

      <div className="container mx-auto px-4 py-10">
        <section className="mb-10 p-5 md:p-6 bg-white rounded-2xl shadow-aurora-sm border border-aurora-navy/5 -mt-10 relative z-10 animate-fadeInUp">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-4">
            <div className="relative flex-grow">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aurora-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar clubes por nombre, slogan o descripción..."
                className="input-aurora !pl-11"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="md:hidden flex items-center justify-center gap-2 input-aurora !w-auto px-4 font-semibold text-aurora-navy"
            >
              Filtros {activeFilterCount > 0 && <span className="bg-aurora-terracotta text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>}
            </button>
            <div className={`${showFilters ? 'grid' : 'hidden'} md:grid grid-cols-1 md:grid-cols-3 gap-3 md:contents`}>
              <select className="input-aurora" value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
                {RATING_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
              <select className="input-aurora" value={minReviews} onChange={(e) => setMinReviews(Number(e.target.value))}>
                {REVIEW_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
              <select className="input-aurora" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
                {SORT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-aurora-navy/50 mr-1">Categorías:</span>
              {categories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200 ${
                      isSelected
                        ? 'bg-aurora-terracotta text-white border-aurora-terracotta'
                        : 'bg-white text-aurora-navy/70 border-aurora-navy/15 hover:border-aurora-terracotta/50'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="ml-2 text-sm text-red-500 hover:text-red-700 font-medium underline">
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </section>

        {error && (
          <div className="text-center py-4 mb-6">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        )}

        <section>
          {sortedClubs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {sortedClubs.map((club) => (
                <ExploreClubCard
                  key={club.id}
                  id={String(club.id)}
                  name={club.name}
                  slogan={club.slogan || ''}
                  description={club.shortDescription || club.slogan || ''}
                  image={club.logoUrl || '/assets/default-club.jpg'}
                  rating={Number(club.averageRating) || 0}
                  reviewsCount={club.totalReviews || 0}
                />
              ))}
            </div>
          ) : (
            !loading && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-aurora-sm border border-aurora-navy/5">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-2xl text-aurora-navy font-display font-semibold">
                  No se encontraron clubes que coincidan con tu búsqueda.
                </p>
                <p className="text-aurora-navy/50 mt-2">Intentá ajustar tus filtros o términos de búsqueda.</p>
              </div>
            )
          )}
        </section>

        <section className="text-center py-16 px-6 bg-gradient-to-br from-aurora-navy to-aurora-navyDark text-white rounded-2xl shadow-aurora transform transition-all duration-500 hover:scale-[1.005] mt-16 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-56 h-56 bg-aurora-gold/10 rounded-full blur-3xl" />
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">¿Tenés un Club de Suscripción?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-white/75">
            Unite a AuraBox y profesionalizá tu negocio. Llegá a miles de nuevos suscriptores y gestioná todo de forma sencilla.
          </p>
          <Link to="/register" className="btn-primary !px-10 !py-4 !text-xl">
            Registrá tu Club Hoy
          </Link>
        </section>
      </div>
    </div>
  );
};

export default ExploreClubsPage;