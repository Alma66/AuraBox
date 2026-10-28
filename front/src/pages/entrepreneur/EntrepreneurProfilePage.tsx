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
      <div className="flex items-center justify-center px-4 py-24" aria-busy="true">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-aurora-navy/20 border-t-aurora-navy" />
          <p className="font-display text-aurora-navy/70">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (!loggedInUser) {
    return <div className="px-4 py-24 text-center text-aurora-navy/70">Redirigiendo...</div>;
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      {managedClub && (
        <div className="mb-6">
          <Link
            to={`/entrepreneur/club/${managedClub.id}/my-club`}
            className="group inline-flex items-center gap-3 rounded-2xl border border-aurora-navy/10 bg-white px-5 py-3 shadow-aurora-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-aurora"
          >
            {managedClub.logoUrl && (
              <img
                src={managedClub.logoUrl}
                alt={managedClub.name}
                className="h-11 w-11 rounded-full border-2 border-aurora-gold/60 object-cover"
              />
            )}
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-aurora-terracotta">Mi Club</p>
              <p className="font-display font-bold text-aurora-navy transition-colors group-hover:text-aurora-terracotta">
                {managedClub.name}
              </p>
            </div>
            <svg
              className="ml-1 h-5 w-5 text-aurora-navy/40 transition-all group-hover:translate-x-1 group-hover:text-aurora-terracotta"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="lg:w-1/4">
          <EntrepreneurProfileSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>
        <div className="rounded-2xl border border-aurora-navy/5 bg-white p-6 shadow-aurora-sm md:p-10 lg:w-3/4">
          <EntrepreneurProfileContent
            activeSection={activeSection}
            user={loggedInUser}
            managedClub={managedClub}
            onUserUpdate={fetchEntrepreneur}
          />
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurProfilePage;