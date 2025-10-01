// FileName: src/pages/entrepreneur/SubscriptionDetailForEntrepreneurPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../App';
import { Club } from '../../../types/club';
import { Subscription } from '../../../types/subscription';
import { User } from '../../../types/user';
import clubsData from '../../../data/clubs.json';
import subscriptionsData from '../../../data/subscriptions.json';
import usersData from '../../../data/user.json';

const SubscriptionDetailForEntrepreneurPage: React.FC = () => {
  const { clubId, subscriptionId } = useParams<{ clubId: string; subscriptionId: string }>();
  const navigate = useNavigate();
  const { user: authUser  } = useAuth();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [customer, setCustomer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser  || authUser .role !== 'entrepreneur' || authUser .managedClubId !== clubId) {
      navigate('/login');
      return;
    }

    const foundClub = clubsData.find(c => c.id === clubId) as Club | undefined;
    if (!foundClub) {
      setError('Club no encontrado.');
      setLoading(false);
      return;
    }
    setClub(foundClub);

    const foundSubscription = subscriptionsData.find(sub => sub.id === subscriptionId && sub.clubId === clubId) as Subscription | undefined;
    if (!foundSubscription) {
      setError('Suscripción no encontrada.');
      setLoading(false);
      return;
    }
    setSubscription(foundSubscription);

    const foundCustomer = usersData.find(u => u.id === foundSubscription.userId) as User | undefined;
    if (!foundCustomer) {
      setError('Cliente asociado a la suscripción no encontrado.');
      setLoading(false);
      return;
    }
    setCustomer(foundCustomer);

    setLoading(false);
  }, [authUser , clubId, subscriptionId, navigate]);

  const getStatusColorClass = (status: 'active' | 'paused' | 'cancelled') => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: 'active' | 'paused' | 'cancelled') => {
    switch (status) {
      case 'active': return 'Activa';
      case 'paused': return 'Pausada';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  const handleAction = (action: 'pause' | 'resume' | 'cancel') => {
    if (!subscription) return;

    let newStatus = subscription.status;
    let actionMessage = '';

    if (action === 'pause' && subscription.status === 'active') {
      newStatus = 'paused';
      actionMessage = 'Suscripción pausada con éxito.';
    } else if (action === 'resume' && subscription.status === 'paused') {
      newStatus = 'active';
      actionMessage = 'Suscripción reanudada con éxito.';
    } else if (action === 'cancel' && (subscription.status === 'active' || subscription.status === 'paused')) {
      newStatus = 'cancelled';
      actionMessage = 'Suscripción cancelada con éxito.';
    } else {
      alert('Acción no válida para el estado actual de la suscripción.');
      return;
    }

    setSubscription(prev => prev ? { ...prev, status: newStatus } : null);
    alert(actionMessage);
  };

  // Resumen de reseñas
  const totalBoxesSent = subscription?.history.length || 0;
  const averageRating = subscription?.history.length
    ? Math.round(subscription.history.reduce((acc, h) => acc + h.rating, 0) / subscription.history.length)
    : 0;
  const fiveStarCount = subscription?.history.filter(h => h.rating === 5).length || 0;

  // Agrupar cajas enviadas por año y mes
  const boxesByYearMonth = subscription?.history.reduce<Record<string, number>>((acc, item) => {
    const [monthName, yearStr] = item.month.split(' ');
    const key = `${yearStr}-${monthName}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}) || {};

  // Extraer años disponibles para filtro
  const years = Array.from(new Set(subscription?.history.map(h => h.month.split(' ')[1]) || [])).sort();

  // Filtrar meses por año seleccionado
  const monthsInSelectedYear = selectedYear
    ? Object.entries(boxesByYearMonth)
        .filter(([key]) => key.startsWith(selectedYear))
        .map(([key, count]) => ({ key, count }))
    : [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Cargando detalles de suscripción...</h1>
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

  if (!subscription || !club || !customer) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <h1 className="text-3xl font-bold mb-4">Información incompleta</h1>
      </div>
    );
  }

  const plan = club.subscriptionPlans.find(p => p.planId === subscription.planId);

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <button
        onClick={() => navigate(`/entrepreneur/club/${clubId}/active-subscriptions`)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 transform hover:translate-x-1"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Volver a Suscripciones Activas
      </button>

      <h1 className="text-4xl font-extrabold mb-8 text-center">Detalle de Suscripción</h1>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <img
            src={plan?.image || '/assets/default-plan.jpg'}
            alt={plan?.name || 'Plan de Suscripción'}
            className="w-48 h-48 object-cover rounded-lg shadow-md"
          />
          <div className="flex-grow text-center md:text-left">
            <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold mb-4 ${getStatusColorClass(subscription.status)}`}>
              Estado: {getStatusText(subscription.status)}
            </div>
            <h2 className="text-3xl font-bold mb-2">{plan?.name || 'Plan Desconocido'}</h2>
            <p className="text-gray-700 text-lg mb-4">{plan?.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800 mb-6">
              <div>
                <p><strong>Cliente:</strong> {customer.firstName} {customer.lastName} ({customer.email})</p>
                <p><strong>Inicio de Suscripción:</strong> {new Date(subscription.startDate).toLocaleDateString('es-AR')}</p>
                <p><strong>Próximo Cobro/Envío:</strong> {new Date(subscription.nextBillingDate).toLocaleDateString('es-AR')}</p>
              </div>
              <div>
                <p><strong>Frecuencia de Entrega:</strong> {subscription.deliveryFrequency}</p>
                <p><strong>Método de Pago:</strong> {subscription.paymentMethod}</p>
                <p><strong>Última Caja Recibida:</strong> {new Date(subscription.lastBoxReceived).toLocaleDateString('es-AR')}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
              {subscription.status === 'active' && (
                <button
                  onClick={() => handleAction('pause')}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors shadow-md"
                >
                  Pausar Suscripción
                </button>
              )}
              {subscription.status === 'paused' && (
                <button
                  onClick={() => handleAction('resume')}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md"
                >
                  Reanudar Suscripción
                </button>
              )}
              {(subscription.status === 'active' || subscription.status === 'paused') && (
                <button
                  onClick={() => handleAction('cancel')}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-md"
                >
                  Cancelar Suscripción
                </button>
              )}
              <button
                onClick={() => alert(`Simulando envío de email a ${customer.email}`)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
              >
                Contactar Cliente
              </button>
              <button
                onClick={() => navigate(`/entrepreneur/club/${clubId}/manage-customers?customerId=${customer.id}`)}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-md"
              >
                Ver Perfil Cliente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de reseñas */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h3 className="text-2xl font-bold mb-4">Resumen de Reseñas</h3>
        {subscription.history.length === 0 ? (
          <p className="text-gray-600">No hay reseñas disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-blue-600">{totalBoxesSent}</p>
              <p>Cajas enviadas</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-yellow-500">{averageRating}</p>
              <p>Calificación promedio</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-gray-700">{fiveStarCount}</p>
              <p>Reseñas 5 estrellas</p>
            </div>
          </div>
        )}
      </div>

      {/* Calendario simple */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold mb-4">Cajas enviadas por año y mes</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {years.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year === selectedYear ? null : year)}
              className={`px-4 py-2 rounded-full font-semibold ${
                year === selectedYear ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
        {selectedYear && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {monthsInSelectedYear.length === 0 ? (
              <p className="text-gray-600 col-span-full">No hay cajas enviadas en este año.</p>
            ) : (
              monthsInSelectedYear.map(({ key, count }) => {
                const [, monthName] = key.split('-');
                return (
                  <div key={key} className="bg-gray-100 rounded-lg p-4 text-center">
                    <p className="font-semibold">{monthName}</p>
                    <p className="text-blue-600 text-xl font-bold">{count}</p>
                    <p className="text-sm text-gray-600">cajas enviadas</p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDetailForEntrepreneurPage;