import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSidebar from '../../components/client/UserProfileSidebar';
import UserProfileContent from '../../components/client/UserProfileContent';
import api, { getResponseData } from '../../api/config';
import { User } from '../../types/user';

// Mapea los campos de BD al formato que usan los componentes
function mapApiUserToUser(data: any): User {
  return {
    id: String(data.id),
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    role: 'customer',
    registeredDate: data.registrationDate || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
    documentType: data.documentType || '',
    documentNumber: data.documentNumber ? String(data.documentNumber) : '',
    phoneNumber: data.phoneNumber ? String(data.phoneNumber) : '',
    // Dirección — mapeo de campos BD → campos del componente
    streetAddress: data.streetAddress || '',
    addressNumber: data.addressNumber,
    floorNumber: data.floorNumber || '',
    addressDetails: data.addressDetails || '',
    city: data.city || '',
    province: data.province || '',
    postalCode: data.postalCode || '',
    // Legacy aliases para LocationSection
    street: data.streetAddress || '',
    streetNumber: data.addressNumber ? String(data.addressNumber) : '',
    floor: data.floorNumber || '',
    details: data.addressDetails || '',
    balanceAvailable: data.balanceAvailable || '0',
  };
}

const UserProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me');
      const userData = getResponseData(response);
      setUser(mapApiUserToUser(userData));
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('access_token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [navigate]);

  if (loading) return <div className="text-center py-20">Cargando perfil...</div>;
  if (!user) return <div className="text-center py-20">Redirigiendo...</div>;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Mi Cuenta AuraBox</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <ProfileSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>
        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg p-8">
          <UserProfileContent activeSection={activeSection} user={user} onUserUpdate={fetchUser} />
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;