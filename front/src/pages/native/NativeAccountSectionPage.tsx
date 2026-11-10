import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';
import UserProfileContent from '../../components/client/UserProfileContent';
import { User } from '../../types/user';
import { mapApiUserToUser } from '../../utils/userMapper';
import { tapFeedback } from '../../utils/native';

const VALID_SECTIONS = ['profile', 'location', 'security', 'settings'];

const NativeAccountSectionPage: React.FC = () => {
  const { section } = useParams<{ section: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async (isActive: () => boolean, silent: boolean) => {
    if (!silent) {
      setLoading(true);
      setFailed(false);
    }
    try {
      const response = await api.get('/users/me');
      if (isActive()) setUser(mapApiUserToUser(getResponseData(response)));
    } catch {
      if (isActive() && !silent) setFailed(true);
    } finally {
      if (isActive() && !silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    load(() => active, false);
    return () => {
      active = false;
    };
  }, [load, reloadKey]);

  if (!section || !VALID_SECTIONS.includes(section)) {
    return <Navigate to="/customer/profile" replace />;
  }

  if (loading && !user) {
    return (
      <div className="px-4 py-5" role="status" aria-label="Cargando">
        <div className="h-64 animate-pulse rounded-3xl bg-white shadow-aurora-sm" />
      </div>
    );
  }

  if (failed || !user) {
    return (
      <div role="alert" className="px-6 py-16 text-center">
        <p className="text-5xl" aria-hidden="true">📡</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-aurora-navy">No pudimos cargar tus datos</h1>
        <p className="mt-2 text-sm text-aurora-navy/60">Revisá tu conexión e intentá de nuevo.</p>
        <button
          type="button"
          onClick={() => {
            tapFeedback();
            setReloadKey((value) => value + 1);
          }}
          className="btn-primary mt-6"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="rounded-3xl bg-white p-5 shadow-aurora-sm ring-1 ring-aurora-navy/5">
        <UserProfileContent
          activeSection={section}
          user={user}
          onUserUpdate={() => {
            load(() => true, true);
          }}
        />
      </div>
    </div>
  );
};

export default NativeAccountSectionPage;