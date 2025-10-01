// FileName: src/pages/entrepreneur/FeedbackTrendsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../../App';
import { User } from '../../../../types/user';
import { Club } from '../../../../types/club';
import AdminToolsSidebar from '../../../../components/entrepreneur/AdminToolsSidebar';
import FeedbackSummary from '../../../../components/entrepreneur/FeedbackSummary';
import RatingDistribution from '../../../../components/entrepreneur/RatingDistribution';
import ReviewsTable from '../../../../components/entrepreneur/ReviewsTable';
import SuggestionsPanel from '../../../../components/entrepreneur/SuggestionsPanel';

// Datos simulados (agrega reviews.json si no existe; aquí simulo)
import clubsData from '../../../../data/clubs.json';
import usersData from '../../../../data/user.json';

// Simular reviews (basado en club.rating y reviewsCount)
const simulateReviews = (club: Club) => {
  const reviews: { id: string; userId: string; rating: number; comment: string; date: string; status: 'approved' | 'pending' | 'blocked' }[] = [];
  for (let i = 0; i < club.reviewsCount; i++) {
    reviews.push({
      id: `review-${club.id}-${i}`,
      userId: (usersData as User[])[Math.floor(Math.random() * (usersData as User[]).length)].id,
      rating: Math.floor(Math.random() * 5) + 1, // Simula ratings alrededor de club.rating
      comment: `Reseña simulada ${i + 1} para ${club.name}. ${Math.random() > 0.5 ? '¡Excelente experiencia!' : 'Buena, pero podría mejorar.'}`,
      date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: Math.random() > 0.2 ? 'approved' : (Math.random() > 0.5 ? 'pending' : 'blocked')
    });
  }
  return reviews;
};

const FeedbackTrendsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, userRole } = useAuth();
  const [managedClub, setManagedClub] = useState<Club | null>(null);
  const [clubReviews, setClubReviews] = useState<any[]>([]);

  useEffect(() => {
    if (userRole !== 'entrepreneur' || !user?.managedClubId) {
      window.location.href = '/';
      return;
    }

    const club = (clubsData as Club[]).find(c => c.id === user.managedClubId);
    if (club && club.id === clubId) {
      setManagedClub(club);
      setClubReviews(simulateReviews(club)); // Simulado; cambia a fetch('/api/reviews?clubId=' + clubId)
    } else {
      window.location.href = '/';
    }
  }, [clubId, userRole, user]);

  // Métricas calculadas
  const approvedReviews = useMemo(() => clubReviews.filter(r => r.status === 'approved'), [clubReviews]);
  const avgRating = useMemo(() => clubReviews.reduce((sum, r) => sum + r.rating, 0) / (clubReviews.length || 1), [clubReviews]);
  const positiveWords = useMemo(() => {
    // Simular palabras positivas de comments (backend: análisis NLP)
    return ['excelente', 'recomendable', 'sorprendente', 'calidad', 'genial'].filter(word => 
      clubReviews.some(r => r.comment.toLowerCase().includes(word))
    );
  }, [clubReviews]);
  const negativeWords = useMemo(() => {
    // Simular palabras negativas
    return ['tarde', 'roto', 'decepcionante', 'malo', 'poco'].filter(word => 
      clubReviews.some(r => r.comment.toLowerCase().includes(word))
    );
  }, [clubReviews]);

  if (!managedClub) {
    return <div className="text-center py-20">Cargando feedback y tendencias...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      {/* Header/Breadcrumbs */}
      <div className="mb-8">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/entrepreneur/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                Dashboard Emprendedor
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link to={`/entrepreneur/club/${clubId}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                  {managedClub.name}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Feedback y Tendencias</span>
              </div>
            </li>
          </ol>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900">Feedback y Tendencias - {managedClub.name}</h1>
        <p className="text-gray-600 mt-2">Analiza reseñas, ratings y patrones para mejorar tu club. Identifica oportunidades basadas en el feedback de tus suscriptores.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar (opcional) */}
        <div className="lg:w-1/4 hidden lg:block">
            <AdminToolsSidebar activeSection="feedback" setActiveSection={() => {}} clubId={clubId!} /> {/* ← CORREGIDO: clubId! */}
        </div>

        {/* Contenido Principal */}
        <div className="lg:w-3/4 space-y-8">
          {/* Resumen de Feedback */}
          <FeedbackSummary 
            avgRating={avgRating} 
            totalReviews={clubReviews.length} 
            approvedReviews={approvedReviews.length} 
            club={managedClub} 
          />

          {/* Distribución de Ratings */}
          <RatingDistribution reviews={clubReviews} />

          {/* Palabras Clave y Tendencias */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Palabras Positivas Comunes</h3>
              <div className="flex flex-wrap gap-2">
                {positiveWords.map((word) => (
                  <span key={word} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {word}
                  </span>
                ))}
                {positiveWords.length === 0 && <p className="text-gray-500">No se detectaron palabras positivas destacadas.</p>}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Palabras Negativas Comunes</h3>
              <div className="flex flex-wrap gap-2">
                {negativeWords.map((word) => (
                  <span key={word} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                    {word}
                  </span>
                ))}
                {negativeWords.length === 0 && <p className="text-gray-500">No se detectaron palabras negativas destacadas.</p>}
              </div>
            </div>
          </div>

          {/* Tabla de Reseñas Recientes */}
          <ReviewsTable reviews={clubReviews.slice(0, 10)} usersData={usersData as User[]} clubId={clubId!} /> {/* ← AGREGADO: clubId={clubId!} */}


          {/* Sugerencias Automáticas */}
          <SuggestionsPanel positiveWords={positiveWords} negativeWords={negativeWords} avgRating={avgRating} />
        </div>
      </div>
    </div>
  );
};

export default FeedbackTrendsPage;