import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import { User } from '../../../../types/user';
import { Club } from '../../../../types/club';
import AdminToolsSidebar from '../../../../components/entrepreneur/AdminToolsSidebar';
import FeedbackSummary from '../../../../components/entrepreneur/FeedbackSummary';
import RatingDistribution from '../../../../components/entrepreneur/RatingDistribution';
import ReviewsTable from '../../../../components/entrepreneur/ReviewsTable';
import SuggestionsPanel from '../../../../components/entrepreneur/SuggestionsPanel';
import api, { getResponseData } from '../../../../api/config';

const FeedbackTrendsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [managedClub, setManagedClub] = useState<Club | null>(null);
  const [clubReviews, setClubReviews] = useState<any[]>([]);
  const [usersData, setUsersData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (userRole !== 'entrepreneur' || !user?.managedClubId) {
        navigate('/');
        return;
      }

      try {
        const clubIdToUse = clubId || user.managedClubId;

        const [clubResponse, reviewsResponse, usersResponse] = await Promise.all([
          api.get(`/clubs/${clubIdToUse}`),
          api.get('/reviews'),
          api.get('/users')
        ]);

        const clubData = getResponseData(clubResponse);
        const allReviews = getResponseData(reviewsResponse);
        const allUsers = getResponseData(usersResponse);

        if (String(clubData.id) === String(clubIdToUse)) {
          setManagedClub(clubData);
          const clubRevs = allReviews.filter((r: any) => r.clubId === clubData.id || r.club?.id === clubData.id);
          setClubReviews(clubRevs);
        } else {
          navigate('/');
        }

        setUsersData(allUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clubId, userRole, user, navigate]);

  const approvedReviews = useMemo(() => clubReviews.filter(r => r.status === 'approved'), [clubReviews]);
  const avgRating = useMemo(() => {
    if (clubReviews.length === 0) return 0;
    return clubReviews.reduce((sum, r) => sum + r.rating, 0) / clubReviews.length;
  }, [clubReviews]);

  const positiveWords = useMemo(() => {
    return ['excelente', 'recomendable', 'sorprendente', 'calidad', 'genial'].filter(word => 
      clubReviews.some(r => r.comment?.toLowerCase().includes(word))
    );
  }, [clubReviews]);

  const negativeWords = useMemo(() => {
    return ['tarde', 'roto', 'decepcionante', 'malo', 'poco'].filter(word => 
      clubReviews.some(r => r.comment?.toLowerCase().includes(word))
    );
  }, [clubReviews]);

  if (loading) {
    return <div className="text-center py-20">Cargando feedback y tendencias...</div>;
  }

  if (!managedClub) {
    return <div className="text-center py-20">Cargando feedback y tendencias...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
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
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link to={`/entrepreneur/club/${clubId}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                  {managedClub.name}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Feedback y Tendencias</span>
              </div>
            </li>
          </ol>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900">Feedback y Tendencias - {managedClub.name}</h1>
        <p className="text-gray-600 mt-2">Analiza reseñas, ratings y patrones para mejorar tu club.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4 hidden lg:block">
            <AdminToolsSidebar activeSection="feedback" setActiveSection={() => {}} clubId={clubId!} />
        </div>

        <div className="lg:w-3/4 space-y-8">
          <FeedbackSummary 
            avgRating={avgRating} 
            totalReviews={clubReviews.length} 
            approvedReviews={approvedReviews.length} 
            club={managedClub} 
          />

          <RatingDistribution reviews={clubReviews} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Palabras Positivas Comunes</h3>
              <div className="flex flex-wrap gap-2">
                {positiveWords.map((word) => (
                  <span key={word} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {word}
                  </span>
                ))}
                {positiveWords.length === 0 && <p className="text-gray-500">No se detectaron palabras positivas.</p>}
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
                {negativeWords.length === 0 && <p className="text-gray-500">No se detectaron palabras negativas.</p>}
              </div>
            </div>
          </div>

          <ReviewsTable reviews={clubReviews.slice(0, 10)} usersData={usersData} clubId={clubId!} />

          <SuggestionsPanel positiveWords={positiveWords} negativeWords={negativeWords} avgRating={avgRating} />
        </div>
      </div>
    </div>
  );
};

export default FeedbackTrendsPage;