import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SendNewsletterSidebar from '../../../../components/entrepreneur/SendNewsletterSidebar';
import SendNewsletterContent from '../../../../components/entrepreneur/SendNewsletterContent';
import { Club } from '../../../../types/club';
import clubsData from '../../../../data/clubs.json';

const SendNewsletterPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [activeSection, setActiveSection] = useState<string>('nuevo');
  const [club, setClub] = useState<Club | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!clubId) {
      navigate('/entrepreneur/profile');
      return;
    }
    const foundClub = (clubsData as Club[]).find(c => c.id === clubId);
    if (foundClub) {
      setClub(foundClub);
    } else {
      navigate('/entrepreneur/profile');
    }
  }, [clubId, navigate]);

  if (!club) {
    return <div className="text-center py-20">Cargando newsletters...</div>;
  }

  const updateClub = (updatedClub: Club) => {
    setClub(updatedClub);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Enviar Newsletters</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <SendNewsletterSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>
        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg p-8">
          <SendNewsletterContent activeSection={activeSection} club={club} onUpdateClub={updateClub} />
        </div>
      </div>
    </div>
  );
};

export default SendNewsletterPage;