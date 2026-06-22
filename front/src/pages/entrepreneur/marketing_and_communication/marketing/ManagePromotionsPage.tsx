import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../../api/config';
import ManagePromotionsSidebar from '../../../../components/entrepreneur/ManagePromotionsSidebar';
import ManagePromotionsContent from '../../../../components/entrepreneur/ManagePromotionsContent';
import { Club } from '../../../../types/club';
import { useAuth } from '../../../../App';

const ManagePromotionsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [activeSection, setActiveSection] = useState<string>('activas');
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userRole, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!clubId || userRole !== 'entrepreneur') {
      navigate('/login');
      return;
    }

    const fetchClub = async () => {
      try {
        const response = await api.get(`/clubs/${clubId}`);
        setClub(getResponseData(response));
      } catch (error) {
        console.error('Error fetching club:', error);
        navigate('/entrepreneur/profile');
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [clubId, userRole, authLoading, navigate]);

  if (authLoading || loading) {
    return <div className="text-center py-20 text-gray-500">Cargando promociones...</div>;
  }

  if (!club) {
    return <div className="text-center py-20 text-gray-500">Club no encontrado</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Promociones</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <ManagePromotionsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>
        <div className="lg:w-3/4 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <ManagePromotionsContent activeSection={activeSection} club={club} onUpdateClub={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default ManagePromotionsPage;