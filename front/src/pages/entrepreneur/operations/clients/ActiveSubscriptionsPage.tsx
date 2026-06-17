import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import { Subscription, normalizeStatus } from '../../../../types/subscription';
import { User } from '../../../../types/user';
import { SubscriptionPlan, Club } from '../../../../types/club';
import api, { getResponseData } from '../../../../api/config';
import SubscriptionCardForEntrepreneur from '../../../../components/entrepreneur/SubscriptionCardForEntrepreneur';

const ActiveSubscriptionsPage: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [clubPlans, setClubPlans] = useState<SubscriptionPlan[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'cancelled' | 'pending'>('all');
  const [planFilter, setPlanFilter] = useState('all');

  const managedClubId = user?.managedClubId;

  useEffect(() => {
    if (!managedClubId) {
      navigate('/entrepreneur/profile');
      return;
    }

    const fetchData = async () => {
      try {
        const [clubRes, subsRes, customersRes] = await Promise.all([
          api.get(`/clubs/${managedClubId}`),
          api.get(`/clubs/${managedClubId}/user-subscriptions`),
          api.get(`/clubs/${managedClubId}/customers`),
        ]);

        const clubData = getResponseData(clubRes);
        setClub(clubData);
        setClubPlans(clubData?.subscriptionPlans || []);
        setSubscriptions(getResponseData(subsRes) || []);
        setCustomers(getResponseData(customersRes) || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [managedClubId, navigate]);

  useEffect(() => {
    let temp = [...subscriptions];

    if (searchTerm) {
      temp = temp.filter(sub => {
        const customer = customers.find(c => c.id === sub.idUser);
        const plan = clubPlans.find(p => Number(p.planId) === sub.idSubscriptionTypes);
        const name = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : '';
        const planName = plan ? plan.name.toLowerCase() : '';
        return name.includes(searchTerm.toLowerCase()) || planName.includes(searchTerm.toLowerCase());
      });
    }

    if (statusFilter !== 'all') {
      temp = temp.filter(sub => {
        const normalized = normalizeStatus(sub.subscriptionStatus);
        if (statusFilter === 'active') return normalized === 'active';
        if (statusFilter === 'paused') return normalized === 'paused';
        if (statusFilter === 'cancelled') return normalized === 'cancelled';
        if (statusFilter === 'pending') return normalized === 'pending';
        return true;
      });
    }

    if (planFilter !== 'all') {
      temp = temp.filter(sub => sub.idSubscriptionTypes === Number(planFilter));
    }

    setFilteredSubscriptions(temp);
  }, [subscriptions, searchTerm, statusFilter, planFilter, customers, clubPlans]);

  if (loading) {
    return <div className="text-center py-20">Cargando suscripciones...</div>;
  }

  if (!user || userRole !== 'entrepreneur') {
    return <div className="text-center py-10 text-red-500">Acceso denegado.</div>;
  }

  const totalActive = subscriptions.filter(s => normalizeStatus(s.subscriptionStatus) === 'active').length;
  const totalPaused = subscriptions.filter(s => normalizeStatus(s.subscriptionStatus) === 'paused').length;
  const totalPending = subscriptions.filter(s => normalizeStatus(s.subscriptionStatus) === 'pending').length;

  const estimatedMonthlyRevenue = subscriptions
    .filter(s => normalizeStatus(s.subscriptionStatus) === 'active')
    .reduce((sum, sub) => {
      const plan = clubPlans.find(p => Number(p.planId) === sub.idSubscriptionTypes);
      return sum + (plan ? plan.price : 0);
    }, 0);

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
        Suscripciones de {club?.name || 'Tu Club'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">Activas</p>
          <p className="text-3xl font-bold text-gray-900">{totalActive}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <p className="text-sm font-medium text-gray-500">Pausadas</p>
          <p className="text-3xl font-bold text-gray-900">{totalPaused}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <p className="text-sm font-medium text-gray-500">Pago Pendiente</p>
          <p className="text-3xl font-bold text-gray-900">{totalPending}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">Ingreso Mensual Estimado</p>
          <p className="text-3xl font-bold text-gray-900">${estimatedMonthlyRevenue.toLocaleString('es-AR')}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Buscar por cliente o plan..."
          className="flex-grow p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border border-gray-300 rounded-md"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="paused">Pausadas</option>
          <option value="cancelled">Canceladas</option>
          <option value="pending">Pago pendiente</option>
        </select>
        <select
          className="p-2 border border-gray-300 rounded-md"
          value={planFilter}
          onChange={e => setPlanFilter(e.target.value)}
        >
          <option value="all">Todos los planes</option>
          {clubPlans.map(plan => (
            <option key={plan.planId} value={plan.planId}>
              {plan.name}
            </option>
          ))}
        </select>
      </div>

      {filteredSubscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubscriptions.map(sub => {
            const customer = customers.find(c => c.id === sub.idUser);
            const plan = clubPlans.find(p => Number(p.planId) === sub.idSubscriptionTypes);
            return (
              <SubscriptionCardForEntrepreneur
                key={sub.id}
                subscription={sub}
                club={club!}
                plan={plan}
                customer={customer}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-600">
          No se encontraron suscripciones con los filtros aplicados.
        </div>
      )}
    </div>
  );
};

export default ActiveSubscriptionsPage;