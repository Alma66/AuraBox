import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../App';
import { Club } from '../../../types/club';
import { Subscription } from '../../../types/subscription';
import { User } from '../../../types/user';
import api, { getResponseData } from '../../../api/config';

const SubscriptionDetailForEntrepreneurPage: React.FC = () => {
  const { clubId, subscriptionId } = useParams<{ clubId: string; subscriptionId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [customer, setCustomer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!authUser || authUser.role !== 'entrepreneur' || authUser.managedClubId !== clubId) {
        navigate('/login');
        return;
      }

      try {
        const [clubResponse, subscriptionResponse] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/user-subscriptions/${subscriptionId}`)
        ]);

        const clubData = getResponseData(clubResponse);
        const subscriptionData = getResponseData(subscriptionResponse);

        if (!clubData) {
          setError('Club no encontrado.');
          setLoading(false);
          return;
        }
        setClub(clubData);

        if (!subscriptionData || String(subscriptionData.clubId) !== String(clubId)) {
          setError('Suscripción no encontrada.');
          setLoading(false);
          return;
        }
        setSubscription(subscriptionData);

        const userResponse = await api.get(`/users/${subscriptionData.userId}`);
        const userData = getResponseData(userResponse);
        setCustomer(userData);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authUser, clubId, subscriptionId, navigate]);

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'paused': return 'Pausada';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  const handleAction = async (action: 'pause' | 'resume' | 'cancel') => {
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

    try {
      await api.put(`/user-subscriptions/${subscription.id}`, { status: newStatus });
      setSubscription(prev => prev ? { ...prev, status: newStatus } : null);
      alert(actionMessage);
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert('Error al actualizar la suscripción.');
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

  const plan = club.subscriptionPlans?.find((p: any) => p.planId === subscription.planId);
  const totalBoxesSent = subscription.history?.length || 0;
  const averageRating = subscription.history?.length
    ? Math.round(subscription.history.reduce((acc: number, h: any) => acc + h.rating, 0) / subscription.history.length)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(`/entrepreneur/club/${clubId}/active-subscriptions`)} className="mb-6 flex items-center text-blue-600 hover:text-blue-800">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Volver a Suscripciones Activas
      </button>

      <h1 className="text-4xl font-extrabold mb-8 text-center">Detalle de Suscripción</h1>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <img src={plan?.image || '/assets/default-plan.jpg'} alt={plan?.name || 'Plan'} className="w-48 h-48 object-cover rounded-lg shadow-md" />
          <div className="flex-grow text-center md:text-left">
            <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold mb-4 ${getStatusColorClass(subscription.status)}`}>
              Estado: {getStatusText(subscription.status)}
            </div>
            <h2 className="text-3xl font-bold mb-2">{plan?.name || 'Plan Desconocido'}</h2>
            <p className="text-gray-700 text-lg mb-4">{plan?.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800 mb-6">
              <div>
                <p><strong>Cliente:</strong> {customer.firstName} {customer.lastName} ({customer.email})</p>
                <p><strong>Inicio:</strong> {new Date(subscription.startDate).toLocaleDateString('es-AR')}</p>
                <p><strong>Próximo Cobro:</strong> {new Date(subscription.nextBillingDate).toLocaleDateString('es-AR')}</p>
              </div>
              <div>
                <p><strong>Frecuencia:</strong> {subscription.deliveryFrequency}</p>
                <p><strong>Método de Pago:</strong> {subscription.paymentMethod}</p>
                <p><strong>Última Caja:</strong> {new Date(subscription.lastBoxReceived).toLocaleDateString('es-AR')}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {subscription.status === 'active' && (
                <button onClick={() => handleAction('pause')} className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600">Pausar</button>
              )}
              {subscription.status === 'paused' && (
                <button onClick={() => handleAction('resume')} className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600">Reanudar</button>
              )}
              {(subscription.status === 'active' || subscription.status === 'paused') && (
                <button onClick={() => handleAction('cancel')} className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600">Cancelar</button>
              )}
              <button onClick={() => alert(`Email a ${customer.email}`)} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">Contactar</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h3 className="text-2xl font-bold mb-4">Resumen de Reseñas</h3>
        {subscription.history?.length === 0 ? (
          <p className="text-gray-600">No hay reseñas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center"><p className="text-4xl font-extrabold text-blue-600">{totalBoxesSent}</p><p>Cajas enviadas</p></div>
            <div className="text-center"><p className="text-4xl font-extrabold text-yellow-500">{averageRating}</p><p>Calificación promedio</p></div>
            <div className="text-center"><p className="text-4xl font-extrabold text-gray-700">{subscription.history?.filter((h: any) => h.rating === 5).length || 0}</p><p>5 estrellas</p></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDetailForEntrepreneurPage;