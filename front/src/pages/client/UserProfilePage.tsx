import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSidebar from '../../components/client/UserProfileSidebar';
import UserProfileContent from '../../components/client/UserProfileContent';
import api, { getResponseData } from '../../api/config';
import { User } from '../../types/user';

function mapApiUserToUser(data: any): User {
  return {
    id: Number(data.id),
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    role: 'customer',
    registeredDate: data.registrationDate || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
    documentType: data.documentType || '',
    documentNumber: data.documentNumber ? Number(data.documentNumber) : undefined,
    phoneNumber: data.phoneNumber ? Number(data.phoneNumber) : null,
    streetAddress: data.streetAddress || '',
    addressNumber: data.addressNumber,
    floorNumber: data.floorNumber || '',
    addressDetails: data.addressDetails || '',
    city: data.city || '',
    province: data.province || '',
    postalCode: data.postalCode || '',
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

  const fetchUser = useCallback(async () => {
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
  }, [navigate]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-aurora-terracotta/20 border-t-aurora-terracotta rounded-full animate-spin" />
          <p className="font-display text-aurora-navy/70">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }
  if (!user) return <div className="min-h-screen bg-aurora-cream flex items-center justify-center text-aurora-navy/70">Redirigiendo...</div>;

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="mb-8 text-center">
          <span className="section-eyebrow block">Tu espacio</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-aurora-navy">Mi Cuenta AuraBox</h1>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-1/4">
            <ProfileSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
          <div className="lg:w-3/4 bg-white rounded-2xl shadow-aurora-sm border border-aurora-navy/5 p-6 md:p-10">
            <UserProfileContent activeSection={activeSection} user={user} onUserUpdate={fetchUser} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;