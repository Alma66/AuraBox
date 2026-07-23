import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import { useAuth } from '../../../App';

interface SubscriptionTypeSummary {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  createdAt?: string;
  frequency: string;
}

const ClubSubscriptionsOverviewPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [items, setItems] = useState<SubscriptionTypeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/subscription-types?clubId=${clubId}`);
      setItems(getResponseData(res) || []);
    } catch {
      setError('No se pudieron cargar las suscripciones del club.');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (userRole !== 'entrepreneur' || !user?.managedClubId || user.managedClubId !== clubId) {
      navigate('/login');
      return;
    }
    load();
  }, [clubId, user, userRole, navigate, load]);

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Cargando suscripciones...</div>;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <button
        onClick={() => navigate(`/club/${clubId}`)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
      >
        ← Volver al Perfil del Club
      </button>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Contenido de las Cajas por Suscripción</h1>
        <p className="text-gray-600 text-center mb-8">
          Elegí una suscripción para ver su historial de cajas mensuales y cargar el contenido del próximo envío.
        </p>
        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded mb-6">{error}</p>}
        {items.length === 0 ? (
          <p className="text-gray-600 text-center">Todavía no creaste ninguna suscripción para este club.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/entrepreneur/club/${clubId}/subscription-boxes/${item.id}`)}
                className="w-full text-left border border-gray-200 rounded-xl p-5 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${item.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.active ? 'Habilitada' : 'Deshabilitada'}
                    </span>
                  </div>
                  {item.description && <p className="text-gray-600 text-sm mt-1">{item.description}</p>}
                  {item.createdAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Creada el {new Date(item.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubSubscriptionsOverviewPage;