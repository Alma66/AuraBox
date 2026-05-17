import React, { useState, useEffect, useMemo } from 'react';
import ExploreClubCard from '../components/shared/ExploreClubCard';
import api, { getResponseData } from '../api/config';
import { Link } from 'react-router-dom';
import { Club } from '../types/club';

const ExploreClubsPage: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/clubs');
        const clubsData = getResponseData(response);
        setClubs(Array.isArray(clubsData) ? clubsData : []);
      } catch (err: any) {
        console.error("Error fetching clubs:", err);
        setError('Error al cargar los clubes. Intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const filteredClubs = useMemo(() => {
    return clubs.filter(club => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        club.name.toLowerCase().includes(searchLower) ||
        (club.shortDescription || '').toLowerCase().includes(searchLower) ||
        (club.slogan || '').toLowerCase().includes(searchLower);
      const clubRating = club.averageRating || 0;
      const matchesRating = clubRating >= minRating;
      return matchesSearch && matchesRating;
    });
  }, [clubs, searchTerm, minRating]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-12 animate-fadeInDown">
        Explora Todos los Clubes
      </h1>

      <section className="mb-12 p-6 bg-white rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 animate-fadeInUp">
        <input
          type="text"
          placeholder="Buscar clubes por nombre o descripción..."
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-lg"
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
        >
          <option value={0}>Cualquier Rating</option>
          <option value={4}>4 Estrellas o más</option>
          <option value={4.5}>4.5 Estrellas o más</option>
        </select>
      </section>

      <section>
        {filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredClubs.map((club) => (
              <ExploreClubCard
                key={club.id}
                id={String(club.id)}
                name={club.name}
                category={club.category || ''}
                description={club.shortDescription || club.slogan || ''}
                image={club.logoUrl || '/assets/default-club.jpg'}
                rating={club.averageRating || 0}
                reviewsCount={club.totalReviews || 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-100 rounded-lg shadow-inner">
            <p className="text-2xl text-gray-600 font-semibold">
              No se encontraron clubes que coincidan con tu búsqueda.
            </p>
            <p className="text-gray-500 mt-4">Intenta ajustar tus filtros o términos de búsqueda.</p>
          </div>
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