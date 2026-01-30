import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../../App';
import { Club } from '../../../../types/club';
import { Subscription } from '../../../../types/subscription';
import { User } from '../../../../types/user';
import clubsData from '../../../../data/clubs.json';
import subscriptionsData from '../../../../data/subscriptions.json';
import usersData from '../../../../data/user.json';
import locationsData from '../../../../data/locations.json';

type ExtendedUser  = User & {
  subscriptionsInfo: {
    id: string;
    planId: string;
    status: string;
    startDate: string;
    cancelDate?: string;
  }[];
};

const ManageCustomersPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user: authUser   } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');

  const [club, setClub] = useState<Club | null>(null);
  const [allCustomers, setAllCustomers] = useState<ExtendedUser []>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<ExtendedUser  | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser   || authUser  .role !== 'entrepreneur' || authUser  .managedClubId !== clubId) {
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
      .filter(Boolean) as ExtendedUser [];

    setAllCustomers(detailedCustomers);

    if (preselectedCustomerId) {
      const customerToSelect = detailedCustomers.find((u) => u.id === preselectedCustomerId);
      if (customerToSelect) {
        setSelectedCustomer(customerToSelect);
      }
    }

    setLoading(false);
  }, [authUser  , clubId, navigate, preselectedCustomerId]);

  const handleSelectCustomer = (customer: ExtendedUser ) => {
    setSelectedCustomer(customer);
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    if (!selectedCustomer) return;
    if (window.confirm('¿Estás seguro de cancelar esta suscripción?')) {
      alert(`Suscripción ${subscriptionId} cancelada (simulado).`);
    }
  };

  const renderAddress = (customer: User) => {
    const country = customer.country || '';
    const city = customer.city || '';
    const locality = customer.locality || '';
    const postalCode = customer.postalCode || '';
    const street = customer.street || '';
    const streetNumber = customer.streetNumber || '';
    const details = customer.details || '';

    const countryData = locationsData.find((c) => c.country === country);
    const cityData = countryData?.cities.find((ct) => ct.name === city);
    const localityExists = cityData?.localities.includes(locality);

    return (
      <div className="space-y-1">
        <p><strong>País:</strong> {country}</p>
        <p><strong>Ciudad:</strong> {city}</p>
        <p><strong>Localidad:</strong> {locality} {localityExists ? '' : '(No en lista oficial)'}</p>
        <p><strong>Código Postal:</strong> {postalCode}</p>
        <p><strong>Calle:</strong> {street} {streetNumber}</p>
        {details && <p><strong>Detalles:</strong> {details}</p>}
        {street && city && country && (
          <iframe
            title="Mapa de dirección"
            width="100%"
            height="200"
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(
              `${street} ${streetNumber}, ${locality}, ${city}, ${country}`
            )}`}
            className="rounded-md border"
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Cargando clientes...</h1>
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

      <h1 className="text-4xl font-extrabold mb-8 text-center">Gestionar Clientes de {club.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 overflow-y-auto max-h-[70vh] border rounded-md shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Clientes</h2>
          {allCustomers.length === 0 ? (
            <p>No hay clientes para mostrar.</p>
          ) : (
            <ul>
              {allCustomers.map((customer) => (
                <li
                  key={customer.id}
                  className={`cursor-pointer p-2 rounded-md mb-1 ${
                    selectedCustomer?.id === customer.id ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelectCustomer(customer)}
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
              <h2 className="text-2xl font-bold mb-4">
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </h2>
              <p><strong>Email:</strong> {selectedCustomer.email}</p>
              <p><strong>Teléfono:</strong> {selectedCustomer.phoneNumber || 'No disponible'}</p>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Dirección</h3>
                {renderAddress(selectedCustomer)}
              </div>
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Suscripciones</h3>
                {selectedCustomer.subscriptionsInfo.length === 0 ? (
                  <p>Este cliente no tiene suscripciones activas.</p>
                ) : (
                  <ul>
                    {selectedCustomer.subscriptionsInfo.map((sub: { id: string; planId: string; status: string; startDate: string; cancelDate?: string }) => {
                      const plan = club.subscriptionPlans.find((p) => p.planId === sub.planId);
                      return (
                        <li key={sub.id} className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{plan?.name || sub.planId}</p>
                            <p className="text-sm text-gray-600">
                              Estado: {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Inicio: {new Date(sub.startDate).toLocaleDateString('es-AR')}
                            </p>
                            {sub.cancelDate && (
                              <p className="text-sm text-gray-600">
                                Cancelación: {new Date(sub.cancelDate).toLocaleDateString('es-AR')}
                              </p>
                            )}
                          </div>
                          <div>
                            <button
                              onClick={() => handleCancelSubscription(sub.id)}
                              className="mr-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                              title="Cancelar Suscripción"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => navigate(`/entrepreneur/club/${clubId}/subscription/${sub.id}`)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                              title="Ver Suscripción"
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
            <p className="text-center text-gray-600">Selecciona un cliente para ver sus detalles.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCustomersPage;