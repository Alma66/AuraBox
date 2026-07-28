import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../App';
import api, { getResponseData } from '../../../../api/config';
import ClubStatsSidebar from '../../../../components/entrepreneur/ClubStatsSidebar';
import ClubStatsContent from '../../../../components/entrepreneur/ClubStatsContent';
import { ClubStatsData } from '../../../../types/analystics';
import { Club } from '../../../../types/club';

type StatsSection = 'resumen' | 'evolucion' | 'logistica' | 'reputacion' | 'planes';

const ClubStatsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<StatsSection>('resumen');
  const [club, setClub] = useState<Club | null>(null);
  const [data, setData] = useState<ClubStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const managedClubId = clubId || user?.managedClubId;

  useEffect(() => {
    if (authLoading) return;
    if (!managedClubId || userRole !== 'entrepreneur') {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const [clubRes, statsRes] = await Promise.all([
          api.get(`/clubs/${managedClubId}`),
          api.get(`/analytics/club-stats/${managedClubId}`),
        ]);
        setClub(getResponseData(clubRes));
        setData(getResponseData(statsRes));
      } catch {
        navigate('/entrepreneur/profile');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [managedClubId, userRole, authLoading, navigate]);

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-aurora-cream">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
    </div>
  );

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-aurora-navy/50 bg-aurora-cream">No se pudieron cargar las estadísticas.</div>;
  }

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div className="bg-white border-b border-aurora-navy/10">
        <div className="container mx-auto px-4 py-5">
          <nav className="text-xs text-aurora-navy/50 mb-1 flex items-center gap-1">
            <Link to="/entrepreneur/profile" className="hover:text-aurora-terracotta">Mi Club</Link>
            <span>›</span>
            <Link to={`/entrepreneur/club/${managedClubId}`} className="hover:text-aurora-terracotta">{club?.name || 'Club'}</Link>
            <span>›</span>
            <span className="text-aurora-navy/70">Estadísticas</span>
          </nav>
          <h1 className="font-display text-2xl font-bold text-aurora-navy">Estadísticas del Club</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/5">
            <ClubStatsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
          <div className="lg:w-4/5 bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6">
            <ClubStatsContent activeSection={activeSection} data={data} clubId={managedClubId!} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubStatsPage;