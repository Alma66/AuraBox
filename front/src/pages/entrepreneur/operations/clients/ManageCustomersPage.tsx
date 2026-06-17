import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../../App';
import { Club } from '../../../../types/club';
import { Subscription, normalizeStatus } from '../../../../types/subscription';
import { User } from '../../../../types/user';
import api, { getResponseData } from '../../../../api/config';

interface CustomerWithSubscriptions extends User {
  subscriptionsInfo: {
    id: number;
    idSubscriptionTypes: number;
    subscriptionStatus: Subscription['subscriptionStatus'];
    startDate: string;
    cancellationDate?: string | null;
  }[];
}

const statusLabel: Record<string, string> = {
  active: 'Activa',
  paused: 'Pausada',
  cancelled: 'Cancelada',
  pending: 'Pago pendiente',
  finished: 'Finalizada',
};

const ManageCustomersPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');

  const [club, setClub] = useState<Club | null>(null);
  const [allCustomers, setAllCustomers] = useState<CustomerWithSubscriptions[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithSubscriptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);

  useEffect(() => {
    if (userRole !== 'entrepreneur' || !user?.managedClubId || String(user.managedClubId) !== clubId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [clubRes, subsRes, customersRes] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/clubs/${clubId}/user-subscriptions`),
          api.get(`/clubs/${clubId}/customers`),
        ]);

        const clubData = getResponseData(clubRes);
        const subsData: Subscription[] = getResponseData(subsRes) || [];
        const usersData: User[] = getResponseData(customersRes) || [];

        if (!clubData) {
          setError('Club no encontrado.');
          return;
        }

        setClub(clubData);

        const uniqueUserIds = Array.from(new Set(subsData.map(s => s.idUser)));

        const detailed: CustomerWithSubscriptions[] = uniqueUserIds
          .map(userId => {
            const customer = usersData.find(u => u.id === userId);
            if (!customer) return null;
            const customerSubs = subsData.filter(s => s.idUser === userId);
            return {
              ...customer,
              subscriptionsInfo: customerSubs.map(s => ({
                id: s.id,
                idSubscriptionTypes: s.idSubscriptionTypes,
                subscriptionStatus: s.subscriptionStatus,
                startDate: s.startDate,
                cancellationDate: s.cancellationDate,
              })),
            } as CustomerWithSubscriptions;
          })
          .filter(Boolean) as CustomerWithSubscriptions[];

        setAllCustomers(detailed);

        if (preselectedCustomerId) {
          const found = detailed.find(c => String(c.id) === preselectedCustomerId);
          if (found) setSelectedCustomer(found);
        }
      } catch {
        setError('Error al cargar datos.');
      } finally {
        setLoading(false);
      }
    };

    if (clubId) fetchData();
  }, [clubId, user, userRole, navigate, preselectedCustomerId]);

  const handleCancelSubscription = async (subscriptionId: number) => {
    if (!window.confirm('¿Estás seguro de cancelar esta suscripción?')) return;
    setCancelling(subscriptionId);
    try {
      await api.post(`/user-subscriptions/${subscriptionId}/cancel`);
      setAllCustomers(prev =>
        prev.map(c => ({
          ...c,
          subscriptionsInfo: c.subscriptionsInfo.map(s =>
            s.id === subscriptionId
              ? { ...s, subscriptionStatus: 'CANCELADA' as const, cancellationDate: new Date().toISOString() }
              : s
          ),
        }))
      );
      if (selectedCustomer) {
        setSelectedCustomer(prev =>
          prev
            ? {
                ...prev,
                subscriptionsInfo: prev.subscriptionsInfo.map(s =>
                  s.id === subscriptionId
                    ? { ...s, subscriptionStatus: 'CANCELADA' as const, cancellationDate: new Date().toISOString() }
                    : s
                ),
              }
            : prev
        );
      }
    } catch {
      alert('Error al cancelar la suscripción.');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Cargando clientes...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-center text-red-600">{error}</div>;
  if (!club) return <div className="container mx-auto px-4 py-8 text-center text-red-600">Acceso denegado</div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-blue-600 hover:text-blue-800">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver
      </button>

      <h1 className="text-4xl font-extrabold mb-8 text-center">Gestionar Clientes — {club.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 overflow-y-auto max-h-[70vh] border rounded-md shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Clientes ({allCustomers.length})</h2>
          {allCustomers.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay clientes.</p>
          ) : (
            <ul>
              {allCustomers.map(customer => (
                <li
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`cursor-pointer p-3 rounded-md mb-1 text-sm ${
                    selectedCustomer?.id === customer.id ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'
                  }`}
                >
                  {customer.firstName} {customer.lastName}
                  <span className="block text-xs text-gray-400">{customer.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8 overflow-y-auto max-h-[70vh]">
          {selectedCustomer ? (
            <>
              <h2 className="text-2xl font-bold mb-4">
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </h2>
              <div className="space-y-1 text-sm text-gray-700 mb-4">
                <p><span className="font-semibold">Email:</span> {selectedCustomer.email}</p>
                <p><span className="font-semibold">Teléfono:</span> {selectedCustomer.phoneNumber ?? 'No disponible'}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-sm">Dirección</h3>
                <div className="space-y-1 text-sm text-gray-700">
                  {selectedCustomer.streetAddress && (
                    <p><span className="font-semibold">Calle:</span> {selectedCustomer.streetAddress} {selectedCustomer.addressNumber ?? ''}</p>
                  )}
                  {selectedCustomer.floorNumber && (
                    <p><span className="font-semibold">Piso/Depto:</span> {selectedCustomer.floorNumber}</p>
                  )}
                  {selectedCustomer.addressDetails && (
                    <p><span className="font-semibold">Detalles:</span> {selectedCustomer.addressDetails}</p>
                  )}
                  {selectedCustomer.city && (
                    <p><span className="font-semibold">Ciudad:</span> {selectedCustomer.city}</p>
                  )}
                  {selectedCustomer.province && (
                    <p><span className="font-semibold">Provincia:</span> {selectedCustomer.province}</p>
                  )}
                  {selectedCustomer.postalCode && (
                    <p><span className="font-semibold">CP:</span> {selectedCustomer.postalCode}</p>
                  )}
                  {!selectedCustomer.streetAddress && !selectedCustomer.city && (
                    <p className="text-gray-400">Sin dirección registrada.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-sm">Suscripciones</h3>
                {selectedCustomer.subscriptionsInfo.length === 0 ? (
                  <p className="text-sm text-gray-500">Sin suscripciones.</p>
                ) : (
                  <ul className="space-y-3">
                    {selectedCustomer.subscriptionsInfo.map(sub => {
                      const plan = club.subscriptionPlans?.find(p => Number(p.planId) === sub.idSubscriptionTypes);
                      const normalized = normalizeStatus(sub.subscriptionStatus);
                      const isCancelled = normalized === 'cancelled';
                      return (
                        <li key={sub.id} className="flex items-start justify-between border rounded-md p-3">
                          <div className="text-sm space-y-0.5">
                            <p className="font-medium">{plan?.name || `Plan #${sub.idSubscriptionTypes}`}</p>
                            <p className="text-gray-500">Estado: {statusLabel[normalized]}</p>
                            <p className="text-gray-500">Inicio: {new Date(sub.startDate).toLocaleDateString('es-AR')}</p>
                            {sub.cancellationDate && (
                              <p className="text-gray-500">Cancelación: {new Date(sub.cancellationDate).toLocaleDateString('es-AR')}</p>
                            )}
                          </div>
                          <div className="flex gap-2 flex-shrink-0 ml-4">
                            {!isCancelled && (
                              <button
                                onClick={() => handleCancelSubscription(sub.id)}
                                disabled={cancelling === sub.id}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-xs disabled:opacity-50"
                              >
                                {cancelling === sub.id ? '...' : 'Cancelar'}
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/entrepreneur/club/${clubId}/subscription/${sub.id}`)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-xs"
                            >
                              Ver
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 mt-20">Seleccioná un cliente para ver sus detalles.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCustomersPage;