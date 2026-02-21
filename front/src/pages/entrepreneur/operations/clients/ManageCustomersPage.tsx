import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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

            return { ...customer, subscriptionsInfo } as CustomerWithSubscriptions;
          })
          .filter(Boolean) as CustomerWithSubscriptions[];

        setAllCustomers(detailedCustomers);

        if (preselectedCustomerId) {
          const customerToSelect = detailedCustomers.find((u) => u.id === preselectedCustomerId);
          if (customerToSelect) setSelectedCustomer(customerToSelect);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Error al cargar datos.');
      } finally {
        setLoading(false);
      }
    };

    if (clubId) fetchData();
  }, [clubId, user, userRole, navigate, preselectedCustomerId]);

  const handleSelectCustomer = (customer: CustomerWithSubscriptions) => {
    setSelectedCustomer(customer);
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!selectedCustomer || !window.confirm('¿Estás seguro de cancelar esta suscripción?')) return;
    try {
      await api.put(`/user-subscriptions/${subscriptionId}`, { status: 'cancelled' });
      alert('Suscripción cancelada.');
      window.location.reload();
    } catch (error) {
      console.error("Error canceling subscription:", error);
      alert('Error al cancelar.');
    }
  };

  const renderAddress = (customer: User) => {
    const { country, city, locality, postalCode, street, streetNumber, details } = customer;
    return (
      <div className="space-y-1">
        <p><strong>País:</strong> {country}</p>
        <p><strong>Ciudad:</strong> {city}</p>
        <p><strong>Localidad:</strong> {locality}</p>
        <p><strong>Código Postal:</strong> {postalCode}</p>
        <p><strong>Calle:</strong> {street} {streetNumber}</p>
        {details && <p><strong>Detalles:</strong> {details}</p>}
      </div>
    );
  };

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Cargando clientes...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-center text-red-600">{error}</div>;
  if (!club) return <div className="container mx-auto px-4 py-8 text-center text-red-600">Acceso denegado</div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-blue-600 hover:text-blue-800">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Volver
      </button>

      <h1 className="text-4xl font-extrabold mb-8 text-center">Gestionar Clientes de {club.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 overflow-y-auto max-h-[70vh] border rounded-md shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Clientes</h2>
          {allCustomers.length === 0 ? (
            <p>No hay clientes.</p>
          ) : (
            <ul>
              {allCustomers.map((customer) => (
                <li
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className={`cursor-pointer p-2 rounded-md mb-1 ${selectedCustomer?.id === customer.id ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}`}
                >
                  {customer.firstName} {customer.lastName}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8 overflow-y-auto max-h-[70vh]">
          {selectedCustomer ? (
            <>
              <h2 className="text-2xl font-bold mb-4">{selectedCustomer.firstName} {selectedCustomer.lastName}</h2>
              <p><strong>Email:</strong> {selectedCustomer.email}</p>
              <p><strong>Teléfono:</strong> {selectedCustomer.phoneNumber || 'No disponible'}</p>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Dirección</h3>
                {renderAddress(selectedCustomer)}
              </div>
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Suscripciones</h3>
                {selectedCustomer.subscriptionsInfo.length === 0 ? (
                  <p>Este cliente no tiene suscripciones.</p>
                ) : (
                  <ul>
                    {selectedCustomer.subscriptionsInfo.map((sub) => {
                      const plan = club.subscriptionPlans?.find((p) => p.planId === sub.planId);
                      return (
                        <li key={sub.id} className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{plan?.name || sub.planId}</p>
                            <p className="text-sm text-gray-600">Estado: {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}</p>
                            <p className="text-sm text-gray-600">Inicio: {new Date(sub.startDate).toLocaleDateString('es-AR')}</p>
                            {sub.cancelDate && <p className="text-sm text-gray-600">Cancelación: {new Date(sub.cancelDate).toLocaleDateString('es-AR')}</p>}
                          </div>
                          <div>
                            <button onClick={() => handleCancelSubscription(sub.id)} className="mr-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition" title="Cancelar Suscripción">Cancelar</button>
                            <button onClick={() => navigate(`/entrepreneur/club/${clubId}/subscription/${sub.id}`)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition" title="Ver Suscripción">Ver</button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-600">Selecciona un cliente para ver sus detalles.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCustomersPage;