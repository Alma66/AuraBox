import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSidebar from '../../components/client/UserProfileSidebar';
import UserProfileContent from '../../components/client/UserProfileContent';
import api, { getResponseData } from '../../api/config';
import { User } from '../../types/user';
import { mapApiUserToUser } from '../../utils/userMapper';

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
      <div className="flex min-h-screen items-center justify-center bg-aurora-cream">
        <div role="status" className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
          <p className="font-display text-xl text-aurora-navy/70">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }
  if (!user) return <div className="flex min-h-screen items-center justify-center bg-aurora-cream text-aurora-navy/70">Redirigiendo...</div>;

  const initial = (user.firstName || user.email || '?').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div className="hero-mesh grain relative overflow-hidden">
        <div className="container relative mx-auto flex items-center gap-5 px-4 pb-24 pt-12 md:pb-28">
          <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl bg-white/15 font-display text-4xl text-white ring-2 ring-white/30 md:h-24 md:w-24 md:text-5xl">
            {initial}
          </span>
          <div className="min-w-0">
            <span className="mb-1 inline-block text-xs font-semibold uppercase tracking-widest text-aurora-goldLight">Tu espacio</span>
            <h1 className="truncate font-display text-4xl font-normal leading-tight text-white md:text-5xl">
              {user.firstName ? `Hola, ${user.firstName}` : 'Mi cuenta AuraBox'}
            </h1>
            <p className="truncate text-white/75">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto -mt-14 px-4 pb-16 md:-mt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="lg:w-1/4">
            <ProfileSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-aurora ring-1 ring-aurora-navy/5 md:p-10 lg:w-3/4">
            <UserProfileContent activeSection={activeSection} user={user} onUserUpdate={fetchUser} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;