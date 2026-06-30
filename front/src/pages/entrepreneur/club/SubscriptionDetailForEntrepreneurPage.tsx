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

type PendingAction = 'pause' | 'resume' | 'cancel' | null;

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
  const [actionError, setActionError] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

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

  const requestAction = (action: 'pause' | 'resume' | 'cancel') => {
    if (!subscription) return;
    const current = normalizeStatus(subscription.subscriptionStatus);
    if (action === 'pause' && current !== 'active') return;
    if (action === 'resume' && current !== 'paused') return;
    if (action === 'cancel' && current !== 'active' && current !== 'paused') return;

    if (action === 'cancel') {
      setActionError('');
      setPendingAction('cancel');
      return;
    }
    executeAction(action);
  };

  const executeAction = async (action: 'pause' | 'resume' | 'cancel') => {
    if (!subscription) return;
    setActionLoading(true);
    setActionError('');
    try {
      if (action === 'cancel') {
        await api.post(`/user-subscriptions/${subscription.id}/cancel`);
        setSubscription((prev) => (prev ? { ...prev, subscriptionStatus: 'CANCELADA', cancellationDate: new Date().toISOString() } : null));
        showToast('La suscripción fue cancelada correctamente.');
      } else {
        const newStatus = action === 'pause' ? 'PAUSADA' : 'ACTIVA';
        await api.put(`/user-subscriptions/${subscription.id}`, { subscriptionStatus: newStatus });
        setSubscription((prev) => (prev ? { ...prev, subscriptionStatus: newStatus } : null));
        showToast(action === 'pause' ? 'La suscripción fue pausada.' : 'La suscripción fue reactivada.');
      }
    } catch (err) {
      console.error('Error updating subscription:', err);
      setActionError('No se pudo actualizar la suscripción. Intentá nuevamente en unos minutos.');
      showToast('Error al actualizar la suscripción.', 'error');
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse max-w-3xl mx-auto">
          <div className="h-6 bg-gray-200 rounded w-40 mb-8" />
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-48 h-48 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-32" />
                <div className="h-8 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-3">{error}</h1>
        <p className="text-gray-500 mb-8">No pudimos mostrar esta suscripción.</p>
        <button
          onClick={() => navigate(`/entrepreneur/club/${clubId}/active-subscriptions`)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Volver a Suscripciones Activas
        </button>
      </div>
    );
  }

  if (!subscription || !club || !customer) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-3">Información incompleta</h1>
        <p className="text-gray-500">No se pudieron cargar todos los datos de esta suscripción.</p>
      </div>
    );
  }

  const plan = club.subscriptionPlans?.find((p: any) => Number(p.planId) === subscription.idSubscriptionTypes);
  const status = normalizeStatus(subscription.subscriptionStatus);

  return (
    <div className="container mx-auto px-4 py-8">
      {toast && (
        <div
          role="alert"
          className={`fixed top-20 right-4 z-50 max-w-sm px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
        >
          {toast.msg}
        </div>
      )}

      {pendingAction === 'cancel' && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Cancelar esta suscripción?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción es irreversible. {customer.firstName} {customer.lastName} dejará de estar suscripto/a a {plan?.name || 'este plan'} y no se le realizarán más cobros.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingAction(null)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={() => executeAction('cancel')}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate(`/entrepreneur/club/${clubId}/active-subscriptions`)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver a Suscripciones Activas
      </button>

      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900">Detalle de Suscripción</h1>

      {actionError && (
        <div className="max-w-3xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {actionError}
        </div>
      )}

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
                  onClick={() => requestAction('pause')}
                  disabled={actionLoading}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                >
                  Pausar
                </button>
              )}
              {status === 'paused' && (
                <button
                  onClick={() => requestAction('resume')}
                  disabled={actionLoading}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  Reanudar
                </button>
              )}
              {(status === 'active' || status === 'paused') && (
                <button
                  onClick={() => requestAction('cancel')}
                  disabled={actionLoading}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={() => (window.location.href = `mailto:${customer.email}`)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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