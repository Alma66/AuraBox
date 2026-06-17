import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const CustomerHistoryPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [allCustomers, setAllCustomers] = useState<CustomerWithSubscriptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch {
        setError('Error al cargar datos.');
      } finally {
        setLoading(false);
      }
    };

    if (clubId) fetchData();
  }, [clubId, user, userRole, navigate]);

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Cargando historial...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-center text-red-600">{error}</div>;
  if (!club) return <div className="container mx-auto px-4 py-8 text-center text-red-600">Acceso denegado</div>;

  const statusLabel: Record<string, string> = {
    active: 'Activa',
    paused: 'Pausada',
    cancelled: 'Cancelada',
    pending: 'Pago pendiente',
    finished: 'Finalizada',
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-blue-600 hover:text-blue-800">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver
      </button>

      <h1 className="text-4xl font-extrabold mb-8 text-center">Historial de Clientes — {club.name}</h1>

      {allCustomers.length === 0 ? (
        <p className="text-center text-gray-700">No hay clientes registrados en este club.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Nombre</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Plan</th>
                <th className="py-3 px-6 text-left">Estado</th>
                <th className="py-3 px-6 text-left">Inicio</th>
                <th className="py-3 px-6 text-left">Cancelación</th>
                <th className="py-3 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {allCustomers.map(customer =>
                customer.subscriptionsInfo.map((sub, idx) => {
                  const plan = club.subscriptionPlans?.find(p => Number(p.planId) === sub.idSubscriptionTypes);
                  const normalized = normalizeStatus(sub.subscriptionStatus);
                  return (
                    <tr key={`${customer.id}-${sub.id}`} className="border-b border-gray-200 hover:bg-gray-50">
                      {idx === 0 && (
                        <>
                          <td className="py-3 px-6 whitespace-nowrap" rowSpan={customer.subscriptionsInfo.length}>
                            {customer.firstName} {customer.lastName}
                          </td>
                          <td className="py-3 px-6" rowSpan={customer.subscriptionsInfo.length}>
                            {customer.email}
                          </td>
                        </>
                      )}
                      <td className="py-3 px-6">{plan?.name || `Plan #${sub.idSubscriptionTypes}`}</td>
                      <td className="py-3 px-6">{statusLabel[normalized] ?? normalized}</td>
                      <td className="py-3 px-6">{new Date(sub.startDate).toLocaleDateString('es-AR')}</td>
                      <td className="py-3 px-6">
                        {sub.cancellationDate ? new Date(sub.cancellationDate).toLocaleDateString('es-AR') : '-'}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => navigate(`/entrepreneur/club/${clubId}/subscription/${sub.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerHistoryPage;