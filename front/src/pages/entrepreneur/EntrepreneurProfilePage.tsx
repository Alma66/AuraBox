import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EntrepreneurProfileSidebar from '../../components/entrepreneur/EntrepreneurProfileSidebar';
import EntrepreneurProfileContent from '../../components/entrepreneur/EntrepreneurProfileContent';
import { User } from '../../types/user';
import { useAuth } from '../../App';

const EntrepreneurProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  useEffect(() => {
    if (!user || userRole !== 'entrepreneur') {
      navigate(userRole === 'customer' ? '/profile' : '/login');
      return;
    }
    setLoggedInUser(user);
  }, [user, userRole, navigate]);

  if (!loggedInUser) {
    return <div className="text-center py-20">Cargando perfil o redirigiendo...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Mi Perfil de Emprendedor</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <EntrepreneurProfileSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>
        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg p-8">
          <EntrepreneurProfileContent activeSection={activeSection} user={loggedInUser} />
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurProfilePage;