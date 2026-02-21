import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import { Club } from '../../../../types/club';
import { Subscription } from '../../../../types/subscription';
import { User } from '../../../../types/user';
import api, { getResponseData } from '../../../../api/config';

interface CustomerWithSubscriptions extends User {
  subscriptionsInfo: {
    id: string;
    planId: string;
    status: string;
    startDate: string;
    cancelDate?: string;
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
    const fetchData = async () => {
      if (userRole !== 'entrepreneur' || !user?.managedClubId || user.managedClubId !== clubId) {
        navigate('/login');
        return;
      }

      try {
        const [clubResponse, subscriptionsResponse, usersResponse] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/clubs/${clubId}/user-subscriptions`),
          api.get('/users')
        ]);

        const clubData = getResponseData(clubResponse);
        const subscriptionsData = getResponseData(subscriptionsResponse);
        const usersData = getResponseData(usersResponse);

        if (!clubData) {
          setError('Club no encontrado.');
          setLoading(false);
          return;
        }

        setClub(clubData);

        const clubSubscriptions = (subscriptionsData || []).filter((sub: Subscription) => sub.clubId === clubId);
        const uniqueCustomerIds = Array.from(new Set(clubSubscriptions.map((sub: Subscription) => sub.userId)));

        const detailedCustomers = uniqueCustomerIds
          .map((userId) => {
            const customer = (usersData || []).find((u: User) => u.id === userId);
            if (!customer) return null;

            const customerSubsForClub = clubSubscriptions.filter((sub: Subscription) => sub.userId === userId);

            const subscriptionsInfo = customerSubsForClub.map((sub: Subscription) => ({
              id: sub.id,
              planId: sub.planId,
              status: sub.status,
              startDate: sub.startDate,
              cancelDate: sub.status === 'cancelled' ? sub.nextBillingDate : undefined,
            }));

            return {
              ...customer,
              subscriptionsInfo,
            } as CustomerWithSubscriptions;
          })
          .filter(Boolean) as CustomerWithSubscriptions[];

        setAllCustomers(detailedCustomers);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Error al cargar datos.');
      } finally {
        setLoading(false);
      }
    };

    if (clubId) fetchData();
  }, [clubId, user, userRole, navigate]);

  const handleViewSubscription = (subscriptionId: string) => {
    navigate(`/entrepreneur/club/${clubId}/subscription/${subscriptionId}`);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Cargando historial de clientes...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">{error}</div>;
  }

  if (!club) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">Acceso denegado</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-blue-600 hover:text-blue-800">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Volver
      </button>

      <h1 className="text-4xl font-extrabold mb-8 text-center">Historial de Clientes de {club.name}</h1>

      {allCustomers.length === 0 ? (
        <p className="text-center text-gray-700">No hay clientes registrados en este club.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Nombre</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Suscripciones</th>
                <th className="py-3 px-6 text-left">Estado</th>
                <th className="py-3 px-6 text-left">Fecha Registro</th>
                <th className="py-3 px-6 text-left">Fecha Cancelación</th>
                <th className="py-3 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {allCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{customer.firstName} {customer.lastName}</td>
                  <td className="py-3 px-6 text-left">{customer.email}</td>
                  <td className="py-3 px-6 text-left">
                    {customer.subscriptionsInfo.map((sub) => {
                      const plan = club.subscriptionPlans?.find((p) => p.planId === sub.planId);
                      return (
                        <div key={sub.id} className="flex items-center justify-between mb-1">
                          <span>{plan?.name || sub.planId}</span>
                          <button onClick={() => handleViewSubscription(sub.id)} className="ml-2 text-blue-600 hover:text-blue-800 text-xs font-semibold">Ver</button>
                        </div>
                      );
                    })}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {customer.subscriptionsInfo.map((sub) => (
                      <div key={sub.id} className="mb-1">{sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}</div>
                    ))}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {customer.subscriptionsInfo.length > 0 ? new Date(customer.subscriptionsInfo[0].startDate).toLocaleDateString('es-AR') : '-'}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {customer.subscriptionsInfo.some((sub) => sub.status === 'cancelled')
                      ? customer.subscriptionsInfo.filter((sub) => sub.status === 'cancelled').map((sub) => sub.cancelDate ? new Date(sub.cancelDate).toLocaleDateString('es-AR') : '-').join(', ')
                      : '-'}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button onClick={() => alert(`Ver detalles de ${customer.firstName}`)} className="text-blue-600 hover:text-blue-800 font-medium">
                      <svg className="h-5 w-5 inline-block" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a7 7 0 00-7 7v1a7 7 0 0014 0v-1a7 7 0 00-7-7z" /><path d="M10 11a3 3 0 100-6 3 3 0 000 6z" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerHistoryPage;