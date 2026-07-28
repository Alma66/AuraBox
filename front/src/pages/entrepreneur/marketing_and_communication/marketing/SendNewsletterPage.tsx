import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../../api/config';
import SendNewsletterSidebar from '../../../../components/entrepreneur/SendNewsletterSidebar';
import SendNewsletterContent from '../../../../components/entrepreneur/SendNewsletterContent';
import { Club } from '../../../../types/club';
import { useAuth } from '../../../../App';

const SendNewsletterPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [activeSection, setActiveSection] = useState<string>('nuevo');
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
    return <div className="text-center py-20 text-aurora-navy/60">Cargando newsletters...</div>;
  }

  if (!club) {
    return <div className="text-center py-20 text-aurora-navy/60">Club no encontrado</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-2xl font-serif font-bold text-aurora-navy mb-8">Newsletters</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <SendNewsletterSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>
        <div className="lg:w-3/4 bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6">
          <SendNewsletterContent activeSection={activeSection} club={club} />
        </div>
      </div>
    </div>
  );
};

export default SendNewsletterPage;