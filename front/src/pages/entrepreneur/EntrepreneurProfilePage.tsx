// FileName: /pages/entrepreneur/EntrepreneurProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EntrepreneurProfileSidebar from '../../components/entrepreneur/EntrepreneurProfileSidebar';
import EntrepreneurProfileContent from '../../components/entrepreneur/EntrepreneurProfileContent';
import { User } from '../../types/user';

const EntrepreneurProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        if (user.role === 'entrepreneur') {
          setLoggedInUser(user);
        } else {
          // Si no es emprendedor, redirigir al dashboard correspondiente o a home
          navigate(user.role === 'customer' ? '/profile' : '/');
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem('loggedInUser');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!loggedInUser) {
    return <div className="text-center py-20">Cargando perfil o redirigiendo...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Mi Perfil de Emprendedor</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de navegación para emprendedor */}
        <div className="lg:w-1/4">
          <EntrepreneurProfileSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>

        {/* Contenido principal para emprendedor */}
        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg p-8">
          <EntrepreneurProfileContent activeSection={activeSection} user={loggedInUser} />
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurProfilePage;