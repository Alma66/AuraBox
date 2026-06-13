import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    managedClubId: data.managedClubId ? String(data.managedClubId) : undefined,
  };
}

const EntrepreneurProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [managedClub, setManagedClub] = useState<{ id: number; name: string; logoUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const fetchEntrepreneur = useCallback(async () => {
    try {
      const response = await api.get('/entrepreneurs/me');
      const data = getResponseData(response);
      setLoggedInUser(mapApiEntrepreneurToUser(data));
      if (data.managedClub) {
        setManagedClub(data.managedClub);
      }
    } catch (error) {
      console.error('Error fetching entrepreneur:', error);
      localStorage.removeItem('access_token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (userRole && userRole !== 'entrepreneur') {
      navigate(userRole === 'customer' ? '/customer/profile' : '/login');
      return;
    }
    fetchEntrepreneur();
  }, [userRole, navigate, fetchEntrepreneur]);

  if (loading) return <div className="text-center py-20">Cargando perfil...</div>;
  if (!loggedInUser) return <div className="text-center py-20">Redirigiendo...</div>;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">Mi Perfil de Emprendedor</h1>

      {/* Acceso rápido al club */}
      {managedClub && (
        <div className="mb-8 flex justify-center">
          <Link
            to={`/club/${managedClub.id}`}
            className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-6 py-3
                       hover:bg-blue-100 transition-colors duration-200 group"
          >
            {managedClub.logoUrl && (
              <img
                src={managedClub.logoUrl}
                alt={managedClub.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-300"
              />
            )}
            <div className="text-left">
              <p className="text-xs text-blue-500 font-medium">Mi Club</p>
              <p className="text-blue-700 font-bold group-hover:text-blue-900 transition-colors">
                {managedClub.name}
              </p>
            </div>
            <svg className="w-5 h-5 text-blue-400 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

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