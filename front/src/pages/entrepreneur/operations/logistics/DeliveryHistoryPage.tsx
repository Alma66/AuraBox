import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import api, { getResponseData } from '../../../../api/config';
import ShipmentsListView from '../../../../components/entrepreneur/customerLogistics/ShipmentsListView';
import { Club } from '../../../../types/club';

const DeliveryHistoryPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClub = async () => {
      if (!clubId || userRole !== 'entrepreneur' || user?.managedClubId !== clubId) {
        navigate('/login');
        return;
      }
      try {
        const res = await api.get(`/clubs/${clubId}`);
        setClub(getResponseData(res));
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el club.');
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [clubId, user, userRole, navigate]);

  if (loading) return <div className="text-center py-16 text-gray-500">Cargando...</div>;
  if (error || !club || !clubId) return <div className="text-center py-16 text-red-500">{error || 'Club no encontrado.'}</div>;

  return <ShipmentsListView clubId={clubId} clubName={club.name} title="Historial de Entregas" defaultRangeDays={null} />;
};

export default DeliveryHistoryPage;