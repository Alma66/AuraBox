import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EntrepreneurProfileSidebar from '../../components/entrepreneur/EntrepreneurProfileSidebar';
import EntrepreneurProfileContent from '../../components/entrepreneur/EntrepreneurProfileContent';
import api, { getResponseData } from '../../api/config';
import { User } from '../../types/user';
import { useAuth } from '../../App';

function mapApiEntrepreneurToUser(data: any): User {
  return {
    id: data.id,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    role: 'entrepreneur',
    documentType: data.documentType || '',
    documentNumber: data.documentNumber,
    registeredDate: data.registrationDate || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
    phoneNumber: data.phoneNumber,
    cuitCuil: data.cuitCuil ? String(data.cuitCuil) : '',
    city: data.city || '',
    province: data.province || '',
    locality: data.province || '',
    country: data.country || 'Argentina',
    street: data.streetAddress || '',
    streetNumber: data.addressNumber ? String(data.addressNumber) : '',
    floor: data.floorNumber || '',
    details: data.addressDetails || '',
    postalCode: data.postalCode || '',
    gender: data.gender || '',
    showGenderPublicly: data.showGenderPublicly || false,
    managedClubId: data.managedClubId ? String(data.managedClubId) : undefined,
  };
}

const EntrepreneurProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [managedClub, setManagedClub] = useState<{ id: number; name: string; logoUrl: string; clubStatus?: string; creationDate?: string } | null>(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-aurora-navy/20 border-t-aurora-navy rounded-full animate-spin" />
          <p className="font-display text-aurora-navy/70">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }
  if (!loggedInUser) return <div className="min-h-screen bg-aurora-cream flex items-center justify-center text-aurora-navy/70">Redirigiendo...</div>;

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-6">
          <span className="section-eyebrow block">Panel de emprendedor</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-aurora-navy">Mi Perfil de Emprendedor</h1>
        </div>
        {managedClub && (
          <div className="mb-10 flex justify-center">
            <Link
              to={`/club/${managedClub.id}`}
              className="flex items-center gap-3 bg-white border border-aurora-navy/10 rounded-2xl px-6 py-3
                         shadow-aurora-sm hover:shadow-aurora hover:-translate-y-0.5 transition-all duration-200 group"
            >
              {managedClub.logoUrl && (
                <img
                  src={managedClub.logoUrl}
                  alt={managedClub.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-aurora-gold/60"
                />
              )}
              <div className="text-left">
                <p className="text-xs text-aurora-terracotta font-semibold uppercase tracking-wide">Mi Club</p>
                <p className="text-aurora-navy font-bold font-display group-hover:text-aurora-terracotta transition-colors">
                  {managedClub.name}
                </p>
              </div>
              <svg className="w-5 h-5 text-aurora-navy/40 ml-1 group-hover:translate-x-1 group-hover:text-aurora-terracotta transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-1/4">
            <EntrepreneurProfileSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
          <div className="lg:w-3/4 bg-white rounded-2xl shadow-aurora-sm border border-aurora-navy/5 p-6 md:p-10">
            <EntrepreneurProfileContent
              activeSection={activeSection}
              user={loggedInUser}
              managedClub={managedClub}
              onUserUpdate={fetchEntrepreneur}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurProfilePage;