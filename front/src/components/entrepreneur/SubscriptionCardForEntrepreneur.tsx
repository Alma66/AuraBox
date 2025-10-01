// FileName: src/components/entrepreneur/SubscriptionCardForEntrepreneur.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Subscription } from '../../types/subscription';
import { Club, SubscriptionPlan } from '../../types/club';
import { User } from '../../types/user';

interface SubscriptionCardForEntrepreneurProps {
  subscription: Subscription;
  club: Club;
  plan: SubscriptionPlan;
  customer: User;
}

const SubscriptionCardForEntrepreneur: React.FC<SubscriptionCardForEntrepreneurProps> = ({
  subscription,
  club,
  plan,
  customer,
}) => {
  const getStatusColor = (status: 'active' | 'paused' | 'cancelled') => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-fadeInUp">
      <div className="relative">
        <img src={plan.image} alt={plan.name} className="w-full h-48 object-cover" />
        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            subscription.status
          )}`}
        >
          {subscription.status === 'active' && 'Activa'}
          {subscription.status === 'paused' && 'Pausada'}
          {subscription.status === 'cancelled' && 'Cancelada'}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-700 text-sm mb-2">
          **Cliente:** {customer.firstName} {customer.lastName}
        </p>
        <p className="text-gray-700 text-sm mb-4">
          **Próximo Cobro/Envío:** {new Date(subscription.nextBillingDate).toLocaleDateString('es-AR')}
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-blue-600">
            {plan.currency} {plan.price.toLocaleString('es-AR')}
          </span>
          <span className="text-sm text-gray-500">{subscription.deliveryFrequency}</span>
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