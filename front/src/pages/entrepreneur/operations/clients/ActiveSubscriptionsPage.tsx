// Importa los tipos y datos según tu estructura completa
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import { Subscription } from '../../../../types/subscription';
import { User } from '../../../../types/user';
import { SubscriptionPlan, Club } from '../../../../types/club';

// Cambiado: Usar SubscriptionCardForEntrepreneur en lugar de SubscriptionCard inexistente
import SubscriptionCardForEntrepreneur from '../../../../components/entrepreneur/SubscriptionCardForEntrepreneur';

import subscriptionsData from '../../../../data/subscriptions.json';
import usersData from '../../../../data/user.json';
import clubsData from '../../../../data/clubs.json';

const ActiveSubscriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [clubPlans, setClubPlans] = useState<SubscriptionPlan[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'expiring'>('all');
  const [planFilter, setPlanFilter] = useState('all');

  const managedClubId = user?.managedClubId;

  useEffect(() => {
    if (!managedClubId) {
      navigate('/entrepreneur/dashboard');
      return;
    }

    // Casts para fixear mismatches de tipos con JSON (ej: status string vs union, legalInfo types)
    const club = (clubsData as Club[]).find(c => c.id === managedClubId);
    setClubs(clubsData as Club[]);
    setClubPlans(club?.subscriptionPlans || []);

    const clubSubs = (subscriptionsData as Subscription[]).filter(sub => sub.clubId === managedClubId);
    setSubscriptions(clubSubs);
    setClients(usersData as User[]);

    // Llamar applyFilters después de setear states para usar valores actualizados
    applyFilters(clubSubs, searchTerm, statusFilter, planFilter);
  }, [managedClubId, searchTerm, statusFilter, planFilter, navigate]);

  const applyFilters = (
    subs: Subscription[],
    term: string,
    status: 'all' | 'active' | 'paused' | 'expiring',
    planId: string
  ) => {
    let tempSubs = [...subs];

    if (term) {
      tempSubs = tempSubs.filter(sub => {
        const client = clients.find(c => c.id === sub.userId);
        const plan = clubPlans.find(p => p.planId === sub.planId);
        const clientName = client ? `${client.firstName} ${client.lastName}`.toLowerCase() : '';
        const planName = plan ? plan.name.toLowerCase() : '';
        return clientName.includes(term.toLowerCase()) || planName.includes(term.toLowerCase());
      });
    }

    if (status !== 'all') {
      const today = new Date();
      tempSubs = tempSubs.filter(sub => {
        if (status === 'active') return sub.status === 'active';
        if (status === 'paused') return sub.status === 'paused';
        if (status === 'expiring') {
          const billingDate = new Date(sub.nextBillingDate);
          const diffTime = billingDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return sub.status === 'active' && billingDate > today && diffDays <= 30;
        }
        return false;
      });
    }

    if (planId !== 'all') {
      tempSubs = tempSubs.filter(sub => sub.planId === planId);
    }

    setFilteredSubscriptions(tempSubs);
  };

  const currentClubName = clubs.find(c => c.id === managedClubId)?.name || 'Tu Club';
  const currentClub = clubs.find(c => c.id === managedClubId); // Para pasar a SubscriptionCardForEntrepreneur

  // Métricas rápidas (usar subscriptions con cast si es necesario)
  const totalActive = subscriptions.filter(sub => sub.status === 'active').length;
  const totalPaused = subscriptions.filter(sub => sub.status === 'paused').length;
  const totalExpiring = subscriptions.filter(sub => {
    const today = new Date();
    const billingDate = new Date(sub.nextBillingDate);
    const diffTime = billingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return sub.status === 'active' && billingDate > today && diffDays <= 30;
  }).length;

  const estimatedMonthlyRevenue = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => {
      const plan = clubPlans.find(p => p.planId === sub.planId);
      return sum + (plan ? plan.price : 0);
    }, 0);

  if (!user || user.role !== 'entrepreneur') {
    return <div className="text-center py-10 text-red-500">Acceso denegado. Solo para emprendedores.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
        Suscripciones de {currentClubName}
      </h1>

      {/* Métricas Rápidas */}
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
          <p className="text-sm font-medium text-gray-500">Vencen Pronto</p>
          <p className="text-3xl font-bold text-gray-900">{totalExpiring}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">Ingreso Mensual Estimado</p>
          <p className="text-3xl font-bold text-gray-900">${estimatedMonthlyRevenue.toLocaleString('es-AR')}</p>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          placeholder="Buscar por cliente o plan..."
          className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'paused' | 'expiring')}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="paused">Pausadas</option>
          <option value="expiring">Vencen pronto</option>
        </select>
        <select
          className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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

      {/* Listado de Suscripciones */}
      {filteredSubscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubscriptions.map(sub => {
            const customer = clients.find(c => c.id === sub.userId);
            const plan = clubPlans.find(p => p.planId === sub.planId);
            return (
              <SubscriptionCardForEntrepreneur
                key={sub.id}
                subscription={sub}
                club={currentClub!} // Asumimos que existe; si no, agregar chequeo
                plan={plan!}
                customer={customer!}
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