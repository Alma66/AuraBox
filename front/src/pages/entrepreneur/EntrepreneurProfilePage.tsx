import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EntrepreneurProfileSidebar from '../../components/entrepreneur/EntrepreneurProfileSidebar';
import EntrepreneurProfileContent from '../../components/entrepreneur/EntrepreneurProfileContent';
import api, { getResponseData } from '../../api/config';
import { User } from '../../types/user';
import { useAuth } from '../../App';

function mapApiEntrepreneurToUser(data: any): User {
  return {
    id: String(data.id),
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    role: 'entrepreneur',
    registeredDate: data.registrationDate || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
    documentType: data.documentType || '',
    documentNumber: data.documentNumber ? String(data.documentNumber) : '',
    phoneNumber: data.phoneNumber ? String(data.phoneNumber) : '',
    cuitCuil: data.cuitCuil ? String(data.cuitCuil) : '',
    city: data.city || '',
    province: data.province || '',
    locality: '',
    country: 'Argentina',
    street: '',
    streetNumber: '',
    floor: '',
    details: '',
    postalCode: '',
    taxId: data.cuitCuil ? String(data.cuitCuil) : '',
    legalName: `${data.firstName} ${data.lastName}`,
  };
}

const EntrepreneurProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const fetchEntrepreneur = async () => {
    try {
      const response = await api.get('/entrepreneurs/me');
      const data = getResponseData(response);
      setLoggedInUser(mapApiEntrepreneurToUser(data));
    } catch (error) {
      console.error('Error fetching entrepreneur:', error);
      localStorage.removeItem('access_token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole && userRole !== 'entrepreneur') {
      navigate(userRole === 'customer' ? '/customer/profile' : '/login');
      return;
    }
    fetchEntrepreneur();
  }, [userRole, navigate]);

  if (loading) return <div className="text-center py-20">Cargando perfil...</div>;
  if (!loggedInUser) return <div className="text-center py-20">Redirigiendo...</div>;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Mi Perfil de Emprendedor</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <EntrepreneurProfileSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>
        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg p-8">
          <EntrepreneurProfileContent
            activeSection={activeSection}
            user={loggedInUser}
            onUserUpdate={fetchEntrepreneur}
          />
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurProfilePage;