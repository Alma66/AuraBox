import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import EntrepreneurProfileContent from '../../components/entrepreneur/EntrepreneurProfileContent';
import api, { getResponseData } from '../../api/config';
import { User } from '../../types/user';
import { useAuth } from '../../App';

const TABS = [
  { id: 'profile', label: 'Mi perfil' },
  { id: 'business-info', label: 'Negocio' },
  { id: 'location', label: 'Ubicación' },
  { id: 'security', label: 'Seguridad' },
  { id: 'settings', label: 'Configuración' },
];

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
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [managedClub, setManagedClub] = useState<{ id: number; name: string; logoUrl: string; clubStatus?: string; creationDate?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const requested = searchParams.get('tab');
  const activeSection = TABS.some((item) => item.id === requested) ? (requested as string) : 'profile';

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
      <div role="status" className="flex items-center justify-center px-4 py-24" aria-busy="true">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
          <p className="font-display text-xl text-aurora-navy/70">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (!loggedInUser) {
    return <div className="px-4 py-24 text-center text-aurora-navy/70">Redirigiendo...</div>;
  }

  return (
    <div className="space-y-6 px-4 py-6 lg:px-8">
      <div className="hero-mesh grain relative overflow-hidden rounded-3xl px-6 py-8 shadow-aurora md:px-10 md:py-10">
        <div className="relative">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-aurora-goldLight">Tu cuenta</p>
          <h1 className="font-display text-3xl font-normal leading-tight text-white md:text-5xl">
            {loggedInUser.firstName} {loggedInUser.lastName}
          </h1>
          <p className="mt-2 text-white/80">{loggedInUser.email}</p>
        </div>
      </div>

      {managedClub && (
        <Link
          to={`/entrepreneur/club/${managedClub.id}/my-club`}
          className="group inline-flex items-center gap-3 rounded-3xl bg-white px-5 py-3 shadow-aurora-sm ring-1 ring-aurora-navy/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-aurora"
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
            <p className="font-display text-xl font-medium text-aurora-navy transition-colors group-hover:text-aurora-terracotta">
              {managedClub.name}
            </p>
          </div>
          <svg
            aria-hidden="true"
            className="ml-1 h-5 w-5 text-aurora-navy/40 transition-all group-hover:translate-x-1 group-hover:text-aurora-terracotta"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      <div className="max-w-full overflow-x-auto">
        <div role="tablist" aria-label="Secciones del perfil" className="inline-flex gap-1 rounded-full bg-white p-1.5 shadow-aurora-sm ring-1 ring-aurora-navy/5">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={activeSection === item.id}
              onClick={() => setSearchParams({ tab: item.id }, { replace: true })}
              className={`min-h-[44px] whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors ${
                activeSection === item.id ? 'bg-aurora-navy text-white' : 'text-aurora-navy/70 hover:bg-aurora-cream'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-aurora-sm ring-1 ring-aurora-navy/5 md:p-10">
        <EntrepreneurProfileContent
          activeSection={activeSection}
          user={loggedInUser}
          managedClub={managedClub}
          onUserUpdate={fetchEntrepreneur}
        />
      </div>
    </div>
  );
};

export default EntrepreneurProfilePage;