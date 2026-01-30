import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSidebar from '../../components/client/UserProfileSidebar';
import UserProfileContent from '../../components/client/UserProfileContent';
import { User } from '../../types/user';

const UserProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        if (user.role === 'customer') {
          setLoggedInUser(user);
        } else {
          navigate('/');
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
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Mi Cuenta AuraBox</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <ProfileSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>

        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg p-8">
          <UserProfileContent activeSection={activeSection} user={loggedInUser} />
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;