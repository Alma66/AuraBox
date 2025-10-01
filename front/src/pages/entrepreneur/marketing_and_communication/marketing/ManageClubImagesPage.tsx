import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ManageClubImagesSidebar from '../../../../components/entrepreneur/ManageClubImagesSidebar';
import ManageClubImagesContent from '../../../../components/entrepreneur/ManageClubImagesContent';
import { Club } from '../../../../types/club';
import clubsData from '../../../../data/clubs.json'; // Simulación

const ManageClubImagesPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [activeSection, setActiveSection] = useState<string>('logo');
  const [club, setClub] = useState<Club | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!clubId) {
      navigate('/entrepreneur/profile');
      return;
    }
    // Simulación: Buscar club por ID
    const foundClub = (clubsData as Club[]).find(c => c.id === clubId);
    if (foundClub) {
      setClub(foundClub);
    } else {
      navigate('/entrepreneur/profile');
    }
  }, [clubId, navigate]);

  if (!club) {
    return <div className="text-center py-20">Cargando imágenes del club...</div>;
  }

  const updateClubImages = (updatedClub: Club) => {
    // Simulación: Actualizar en memoria (en backend: PUT /api/clubs/:id)
    setClub(updatedClub);
    // Para persistencia real: fetch(`/api/clubs/${clubId}`, { method: 'PUT', body: JSON.stringify(updatedClub) });
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Gestionar Imágenes del Club</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <ManageClubImagesSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>
        {/* Contenido */}
        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg p-8">
          <ManageClubImagesContent 
            activeSection={activeSection} 
            club={club} 
            onUpdateClub={updateClubImages} 
          />
        </div>
      </div>
    </div>
  );
};

export default ManageClubImagesPage;