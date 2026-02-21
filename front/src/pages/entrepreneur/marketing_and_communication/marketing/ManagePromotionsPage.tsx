import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../../api/config';
import ManagePromotionsSidebar from '../../../../components/entrepreneur/ManagePromotionsSidebar';
import ManagePromotionsContent from '../../../../components/entrepreneur/ManagePromotionsContent';
import { Club } from '../../../../types/club';
import { useAuth } from '../../../../App';

const ManagePromotionsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [activeSection, setActiveSection] = useState<string>('promociones');
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  useEffect(() => {
    const fetchClub = async () => {
      if (!clubId || userRole !== 'entrepreneur' || user?.managedClubId !== clubId) {
        navigate('/login');
        return;
      }

      try {
        const response = await api.get(`/clubs/${clubId}`);
        const clubData = getResponseData(response);
        setClub(clubData);
      } catch (error) {
        console.error("Error fetching club:", error);
        navigate('/entrepreneur/profile');
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [clubId, user, userRole, navigate]);

  if (loading) {
    return <div className="text-center py-20">Cargando promociones...</div>;
  }

  if (!club) {
    return <div className="text-center py-20">Club no encontrado</div>;
  }

  const updateClub = async (updatedClub: Club) => {
    try {
      await api.put(`/clubs/${clubId}`, updatedClub);
      setClub(updatedClub);
    } catch (error) {
      console.error("Error updating club:", error);
      alert('Error al actualizar promociones');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Administrar Promociones</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <ManagePromotionsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>
        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg p-8">
          <ManagePromotionsContent activeSection={activeSection} club={club} onUpdateClub={updateClub} />
        </div>
      </div>
    </div>
  );
};

export default ManagePromotionsPage;