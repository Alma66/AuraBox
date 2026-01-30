import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import { Club } from '../../../../types/club';
import { Subscription } from '../../../../types/subscription';
import { User } from '../../../../types/user';
import clubsData from '../../../../data/clubs.json';
import subscriptionsData from '../../../../data/subscriptions.json';
import usersData from '../../../../data/user.json';

const CustomerHistoryPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user: authUser  } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [allCustomers, setAllCustomers] = useState<
    (User  & {
      subscriptionsInfo: {
        id: string;
        planId: string;
        status: string;
        startDate: string;
        cancelDate?: string;
      }[];
    })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser  || authUser .role !== 'entrepreneur' || authUser .managedClubId !== clubId) {
      navigate('/login');
      return;
    }

    const foundClub = (clubsData as Club[]).find((c) => c.id === clubId) || null;
    if (!foundClub) {
      setError('Club no encontrado.');
      setLoading(false);
      return;
    }
    setClub(foundClub as Club); 

    const allSubscriptions = subscriptionsData as Subscription[];
    const allUsers = usersData as User[];

    const clubSubscriptions = allSubscriptions.filter((sub) => sub.clubId === clubId);

    const uniqueCustomerIds = Array.from(new Set(clubSubscriptions.map((sub) => sub.userId)));

    const detailedCustomers = uniqueCustomerIds
      .map((userId) => {
        const customer = allUsers.find((u) => u.id === userId);
        if (!customer) return null;

        const customerSubsForClub = clubSubscriptions.filter((sub) => sub.userId === userId);

        const subscriptionsInfo = customerSubsForClub.map((sub) => ({
          id: sub.id,
          planId: sub.planId,
          status: sub.status,
          startDate: sub.startDate,
          cancelDate: sub.status === 'cancelled' ? sub.nextBillingDate : undefined,
        }));

        return {
          ...customer,
          subscriptionsInfo,
        };
      })
      .filter(Boolean) as (User  & {
        subscriptionsInfo: {
          id: string;
          planId: string;
          status: string;
          startDate: string;
          cancelDate?: string;
        }[];
      })[];

    setAllCustomers(detailedCustomers);
    setLoading(false);
  }, [authUser , clubId, navigate]);

  const handleViewSubscription = (subscriptionId: string) => {
    navigate(`/entrepreneur/club/${clubId}/subscription/${subscriptionId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Cargando historial de clientes...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <h1 className="text-3xl font-bold mb-4">{error}</h1>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <h1 className="text-3xl font-bold mb-4">Acceso denegado</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 transform hover:translate-x-1"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
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
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {customer.firstName} {customer.lastName}
                  </td>
                  <td className="py-3 px-6 text-left">{customer.email}</td>
                  <td className="py-3 px-6 text-left">
                    {customer.subscriptionsInfo.map((sub: { id: string; planId: string }) => {
                      const plan = club.subscriptionPlans.find((p) => p.planId === sub.planId);
                      return (
                        <div key={sub.id} className="flex items-center justify-between mb-1">
                          <span>{plan?.name || sub.planId}</span>
                          <button
                            onClick={() => handleViewSubscription(sub.id)}
                            className="ml-2 text-blue-600 hover:text-blue-800 text-xs font-semibold"
                            title="Ver Suscripción"
                          >
                            Ver
                          </button>
                        </div>
                      );
                    })}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {customer.subscriptionsInfo.map((sub: { id: string; status: string }) => (
                      <div key={sub.id} className="mb-1">
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </div>
                    ))}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {customer.subscriptionsInfo.length > 0
                      ? new Date(customer.subscriptionsInfo[0].startDate).toLocaleDateString('es-AR')
                      : '-'}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {customer.subscriptionsInfo.some((sub: { status: string }) => sub.status === 'cancelled')
                      ? customer.subscriptionsInfo
                          .filter((sub: { status: string; cancelDate?: string }) => sub.status === 'cancelled')
                          .map((sub: { cancelDate?: string }) => (sub.cancelDate ? new Date(sub.cancelDate).toLocaleDateString('es-AR') : '-'))
                          .join(', ')
                      : '-'}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => alert(`Ver detalles del cliente ${customer.firstName} ${customer.lastName}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      title="Ver Detalles del Cliente"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 inline-block"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 3a7 7 0 00-7 7v1a7 7 0 0014 0v-1a7 7 0 00-7-7z" />
                        <path d="M10 11a3 3 0 100-6 3 3 0 000 6z" />
                      </svg>
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