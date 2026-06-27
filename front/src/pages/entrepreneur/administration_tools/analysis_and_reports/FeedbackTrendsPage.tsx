import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import api, { getResponseData } from '../../../../api/config';
import FeedbackTrendsSidebar from '../../../../components/entrepreneur/FeedbackTrendsSidebar';
import FeedbackTrendsContent from '../../../../components/entrepreneur/FeedbackTrendsContent';
import { FeedbackTrendsData } from '../../../../types/analystics';

type FeedbackSection = 'rating' | 'altas-bajas' | 'destacadas' | 'palabras';

const FeedbackTrendsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<FeedbackSection>('rating');
  const [data, setData] = useState<FeedbackTrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!clubId || userRole !== 'entrepreneur') {
      navigate('/login');
      return;
    }
    const fetch = async () => {
      try {
        const res = await api.get(`/analytics/feedback-trends/${clubId}`);
        setData(getResponseData(res));
      } catch {
        navigate('/entrepreneur/profile');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [clubId, userRole, authLoading, navigate]);

  if (authLoading || loading) {
    return <div className="text-center py-20 text-gray-500">Cargando feedback y tendencias...</div>;
  }

  if (!data) {
    return <div className="text-center py-20 text-gray-500">No se pudieron cargar los datos.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Feedback y Tendencias</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/5">
          <FeedbackTrendsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>
        <div className="lg:w-4/5 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <FeedbackTrendsContent activeSection={activeSection} data={data} clubId={clubId!} />
        </div>
      </div>
    </div>
  );
};

export default FeedbackTrendsPage;