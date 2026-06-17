import React from 'react';
import { Link } from 'react-router-dom';
import { Subscription, NormalizedStatus, normalizeStatus } from '../../types/subscription';
import { Club, SubscriptionPlan } from '../../types/club';
import { User } from '../../types/user';

interface SubscriptionCardForEntrepreneurProps {
  subscription: Subscription;
  club: Club;
  plan: SubscriptionPlan | undefined;
  customer: User | undefined;
}

const statusLabel: Record<NormalizedStatus, string> = {
  active: 'Activa',
  paused: 'Pausada',
  cancelled: 'Cancelada',
  pending: 'Pago pendiente',
  finished: 'Finalizada',
};

const statusColor: Record<NormalizedStatus, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  pending: 'bg-orange-100 text-orange-800',
  finished: 'bg-gray-100 text-gray-800',
};

const SubscriptionCardForEntrepreneur: React.FC<SubscriptionCardForEntrepreneurProps> = ({
  subscription,
  club,
  plan,
  customer,
}) => {
  const status = normalizeStatus(subscription.subscriptionStatus);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-fadeInUp">
      <div className="relative">
        <img
          src={plan?.image || ''}
          alt={plan?.name || 'Plan'}
          className="w-full h-48 object-cover bg-gray-100"
        />
        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${statusColor[status]}`}>
          {statusLabel[status]}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan?.name || `Plan #${subscription.idSubscriptionTypes}`}</h3>
        <p className="text-gray-700 text-sm mb-2">
          <span className="font-semibold">Cliente:</span>{' '}
          {customer ? `${customer.firstName} ${customer.lastName}` : `Usuario #${subscription.idUser}`}
        </p>
        <p className="text-gray-700 text-sm mb-4">
          <span className="font-semibold">Próximo pago:</span>{' '}
          {subscription.nextPaymentDate
            ? new Date(subscription.nextPaymentDate).toLocaleDateString('es-AR')
            : 'No definido'}
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-blue-600">
            {plan ? `${plan.currency ?? 'ARS'} ${plan.price.toLocaleString('es-AR')}` : '-'}
          </span>
          <span className="text-sm text-gray-500">{plan?.deliveryFrequency ?? ''}</span>
        </div>
        <Link
          to={`/entrepreneur/club/${club.id}/subscription/${subscription.id}`}
          className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionCardForEntrepreneur;