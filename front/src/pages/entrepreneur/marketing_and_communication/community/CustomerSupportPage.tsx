import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../../api/config';
import CustomerSupportSidebar from '../../../../components/entrepreneur/CustomerSupportSidebar';
import CustomerSupportContent from '../../../../components/entrepreneur/CustomerSupportContent';
import { Club } from '../../../../types/club';
import { SupportConversation } from '../../../../types/support';
import { useAuth } from '../../../../App';

const CustomerSupportPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [activeSection, setActiveSection] = useState<string>('abiertas');
  const [club, setClub] = useState<Club | null>(null);
  const [openCount, setOpenCount] = useState(0);
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
        const [clubRes, convRes] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/support/conversations/by-club/${clubId}`, { params: { status: 'Abierta' } }),
        ]);
        setClub(getResponseData(clubRes));
        const convs: SupportConversation[] = getResponseData(convRes) || [];
        setOpenCount(convs.filter((c) => c.hasUnreadForEntrepreneur).length);
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
    return <div className="text-center py-20 text-gray-500">Cargando atención al cliente...</div>;
  }

  if (!club) {
    return <div className="text-center py-20 text-gray-500">Club no encontrado</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Atención Post-Venta</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/5">
          <CustomerSupportSidebar activeSection={activeSection} setActiveSection={setActiveSection} openCount={openCount} />
        </div>
        <div className="lg:w-4/5 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <CustomerSupportContent activeSection={activeSection} club={club} />
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportPage;