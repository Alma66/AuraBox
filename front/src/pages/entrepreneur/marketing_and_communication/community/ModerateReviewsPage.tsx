import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../../api/config';
import ModerateReviewsSidebar from '../../../../components/entrepreneur/ModerateReviewsSidebar';
import ModerateReviewsContent from '../../../../components/entrepreneur/ModerateReviewsContent';
import { Club } from '../../../../types/club';
import { Review } from '../../../../types/review';
import { useAuth } from '../../../../App';

const ModerateReviewsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [activeSection, setActiveSection] = useState<string>('visibles');
  const [club, setClub] = useState<Club | null>(null);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userRole, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!clubId || userRole !== 'entrepreneur') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [clubRes, hiddenRes] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/reviews/hidden-by-club/${clubId}`),
        ]);
        setClub(getResponseData(clubRes));
        const hidden: Review[] = getResponseData(hiddenRes) || [];
        setHiddenCount(hidden.length);
      } catch (error) {
        console.error('Error fetching club:', error);
        navigate('/entrepreneur/profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId, userRole, authLoading, navigate]);

  if (authLoading || loading) {
    return <div className="text-center py-20 text-gray-500">Cargando reseñas...</div>;
  }

  if (!club) {
    return <div className="text-center py-20 text-gray-500">Club no encontrado</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Moderar Reseñas</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <ModerateReviewsSidebar activeSection={activeSection} setActiveSection={setActiveSection} hiddenCount={hiddenCount} />
        </div>
        <div className="lg:w-3/4 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <ModerateReviewsContent activeSection={activeSection} club={club} />
        </div>
      </div>
    </div>
  );
};

export default ModerateReviewsPage;