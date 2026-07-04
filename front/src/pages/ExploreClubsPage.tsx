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
        setError('Error al cargar los clubes. Intenta más tarde.');
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
      list.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
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

  const hasActiveFilters = searchInput || selectedCategoryIds.length > 0 || minRating > 0 || minReviews > 0;

  if (loading && clubs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-12 animate-fadeInDown">
        Explora Todos los Clubes
      </h1>
      <section className="mb-10 p-6 bg-white rounded-xl shadow-lg animate-fadeInUp">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-5">
          <input
            type="text"
            placeholder="Buscar clubes por nombre, slogan o descripción..."
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-lg"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <select
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-lg"
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
          >
            {RATING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-lg"
            value={minReviews}
            onChange={(e) => setMinReviews(Number(e.target.value))}
          >
            {REVIEW_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-lg"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-500 mr-1">Categorías:</span>
            {categories.map((cat) => {
              const isSelected = selectedCategoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-2 text-sm text-red-500 hover:text-red-700 font-medium underline"
              >
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
            <div className="text-center py-16 bg-gray-100 rounded-lg shadow-inner">
              <p className="text-2xl text-gray-600 font-semibold">
                No se encontraron clubes que coincidan con tu búsqueda.
              </p>
              <p className="text-gray-500 mt-4">Intenta ajustar tus filtros o términos de búsqueda.</p>
            </div>
          )
        )}
      </section>
      <section className="text-center py-16 bg-blue-600 text-white rounded-lg shadow-xl transform transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl mt-16">
        <h2 className="text-4xl font-bold mb-4 animate-pulse-subtle">¿Tienes un Club de Suscripción?</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto opacity-0 animate-fadeInUp delay-200">
          Únete a AuraBox y profesionaliza tu negocio. Llega a miles de nuevos suscriptores y gestiona todo de forma sencilla.
        </p>
        <Link
          to="/register"
          className="inline-block bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-xl
                     hover:bg-blue-100 hover:scale-105 transition-all duration-300 shadow-lg
                     focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-70 animate-bounce-once"
        >
          Registra tu Club Hoy
        </Link>
      </section>
    </div>
  );
};

export default ExploreClubsPage;