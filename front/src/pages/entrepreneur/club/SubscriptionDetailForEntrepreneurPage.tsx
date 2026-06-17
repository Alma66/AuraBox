import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../App';
import { Club } from '../../../types/club';
import { Subscription, normalizeStatus, NormalizedStatus } from '../../../types/subscription';
import { User } from '../../../types/user';
import api, { getResponseData } from '../../../api/config';

const statusColorClass: Record<NormalizedStatus, string> = {
  active: 'bg-green-500',
  paused: 'bg-yellow-500',
  cancelled: 'bg-red-500',
  pending: 'bg-orange-500',
  finished: 'bg-gray-500',
};

const statusText: Record<NormalizedStatus, string> = {
  active: 'Activa',
  paused: 'Pausada',
  cancelled: 'Cancelada',
  pending: 'Pago pendiente',
  finished: 'Finalizada',
};

const SubscriptionDetailForEntrepreneurPage: React.FC = () => {
  const { clubId, subscriptionId } = useParams<{ clubId: string; subscriptionId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [customer, setCustomer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!authUser || authUser.role !== 'entrepreneur' || String(authUser.managedClubId) !== clubId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [clubRes, subRes] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/user-subscriptions/${subscriptionId}`),
        ]);

        const clubData = getResponseData(clubRes);
        const subData: Subscription = getResponseData(subRes);

        if (!clubData) {
          setError('Club no encontrado.');
          return;
        }
        setClub(clubData);

        if (!subData) {
          setError('Suscripción no encontrada.');
          return;
        }

        const planExists = clubData.subscriptionPlans?.some(
          (p: any) => Number(p.planId) === subData.idSubscriptionTypes,
        );
        if (!planExists) {
          setError('Esta suscripción no pertenece a este club.');
          return;
        }

        setSubscription(subData);

        const userRes = await api.get(`/users/${subData.idUser}`);
        setCustomer(getResponseData(userRes));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser, clubId, subscriptionId, navigate]);

  const handleAction = async (action: 'pause' | 'resume' | 'cancel') => {
    if (!subscription) return;
    const current = normalizeStatus(subscription.subscriptionStatus);

    if (action === 'pause' && current !== 'active') return;
    if (action === 'resume' && current !== 'paused') return;
    if (action === 'cancel' && current !== 'active' && current !== 'paused') return;

    setActionLoading(true);
    try {
      if (action === 'cancel') {
        await api.post(`/user-subscriptions/${subscription.id}/cancel`);
        setSubscription(prev => (prev ? { ...prev, subscriptionStatus: 'CANCELADA', cancellationDate: new Date().toISOString() } : null));
      } else {
        const newStatus = action === 'pause' ? 'PAUSADA' : 'ACTIVA';
        await api.put(`/user-subscriptions/${subscription.id}`, { subscriptionStatus: newStatus });
        setSubscription(prev => (prev ? { ...prev, subscriptionStatus: newStatus } : null));
      }
    } catch (err) {
      console.error('Error updating subscription:', err);
      alert('Error al actualizar la suscripción.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center"><h1 className="text-3xl font-bold mb-4">Cargando...</h1></div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600"><h1 className="text-3xl font-bold mb-4">{error}</h1></div>;
  }

  if (!subscription || !club || !customer) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600"><h1 className="text-3xl font-bold mb-4">Información incompleta</h1></div>;
  }

  const plan = club.subscriptionPlans?.find((p: any) => Number(p.planId) === subscription.idSubscriptionTypes);
  const status = normalizeStatus(subscription.subscriptionStatus);

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/entrepreneur/club/${clubId}/active-subscriptions`)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver a Suscripciones Activas
      </button>

      <h1 className="text-4xl font-extrabold mb-8 text-center">Detalle de Suscripción</h1>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <img
            src={plan?.image || '/assets/default-plan.jpg'}
            alt={plan?.name || 'Plan'}
            className="w-48 h-48 object-cover rounded-lg shadow-md bg-gray-100"
          />
          <div className="flex-grow text-center md:text-left">
            <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold mb-4 ${statusColorClass[status]}`}>
              Estado: {statusText[status]}
            </div>
            <h2 className="text-3xl font-bold mb-2">{plan?.name || `Plan #${subscription.idSubscriptionTypes}`}</h2>
            <p className="text-gray-700 text-lg mb-4">{plan?.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800 mb-6">
              <div>
                <p><strong>Cliente:</strong> {customer.firstName} {customer.lastName} ({customer.email})</p>
                <p><strong>Inicio:</strong> {new Date(subscription.startDate).toLocaleDateString('es-AR')}</p>
                <p>
                  <strong>Próximo Pago:</strong>{' '}
                  {subscription.nextPaymentDate
                    ? new Date(subscription.nextPaymentDate).toLocaleDateString('es-AR')
                    : 'No definido'}
                </p>
              </div>
              <div>
                <p><strong>Frecuencia:</strong> {plan?.deliveryFrequency || '-'}</p>
                <p>
                  <strong>Último Pago:</strong>{' '}
                  {subscription.lastPaymentDate
                    ? new Date(subscription.lastPaymentDate).toLocaleDateString('es-AR')
                    : 'Sin pagos registrados'}
                </p>
                {subscription.cancellationDate && (
                  <p><strong>Cancelada el:</strong> {new Date(subscription.cancellationDate).toLocaleDateString('es-AR')}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {status === 'active' && (
                <button
                  onClick={() => handleAction('pause')}
                  disabled={actionLoading}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50"
                >
                  Pausar
                </button>
              )}
              {status === 'paused' && (
                <button
                  onClick={() => handleAction('resume')}
                  disabled={actionLoading}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
                >
                  Reanudar
                </button>
              )}
              {(status === 'active' || status === 'paused') && (
                <button
                  onClick={() => handleAction('cancel')}
                  disabled={actionLoading}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={() => (window.location.href = `mailto:${customer.email}`)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Contactar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h3 className="text-2xl font-bold mb-4">Historial de Envíos</h3>
        <p className="text-gray-500">Esta sección estará disponible próximamente.</p>
      </div>
    </div>
  );
};

export default SubscriptionDetailForEntrepreneurPage;