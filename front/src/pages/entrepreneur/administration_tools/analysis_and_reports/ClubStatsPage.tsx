import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import api, { getResponseData } from '../../../../api/config';
import ClubStatsSidebar from '../../../../components/entrepreneur/ClubStatsSidebar';
import ClubStatsContent from '../../../../components/entrepreneur/ClubStatsContent';
import { ClubStatsData } from '../../../../types/analystics';

type StatsSection = 'resumen' | 'logistica' | 'reputacion' | 'suscripciones';

const ClubStatsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<StatsSection>('resumen');
  const [data, setData] = useState<ClubStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!clubId || userRole !== 'entrepreneur') {
      navigate('/login');
      return;
    }
    const fetch = async () => {
      try {
        const res = await api.get(`/analytics/club-stats/${clubId}`);
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
    return <div className="text-center py-20 text-gray-500">Cargando estadísticas...</div>;
  }

  if (!data) {
    return <div className="text-center py-20 text-gray-500">No se pudieron cargar las estadísticas.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Estadísticas del Club</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/5">
          <ClubStatsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>
        <div className="lg:w-4/5 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <ClubStatsContent activeSection={activeSection} data={data} clubId={clubId!} />
        </div>
      </div>
    </div>
  );
};

export default ClubStatsPage;