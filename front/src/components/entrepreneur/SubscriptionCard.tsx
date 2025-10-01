// src/components/entrepreneur/SubscriptionCard.tsx
import React from 'react';
import SubscriptionCardForEntrepreneur from './SubscriptionCardForEntrepreneur';
import { Subscription } from '../../types/subscription';
import { Club, SubscriptionPlan } from '../../types/club';
import { User } from '../../types/user';

// Props para compatibilidad (ajustadas al componente real)
interface SubscriptionCardProps {
  subscription: Subscription;
  client?: User; // Alias para customer
  plan?: SubscriptionPlan;
  clubName?: string; // Alias para club.name
}

// Wrapper simple para mapear props antiguas al componente real
const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, client, plan, clubName }) => {
  // Dummy club si no se pasa (usa solo el nombre para demo)
  const dummyClub: Club = {
    id: 'dummy',
    name: clubName || 'Tu Club',
    category: '',
    mainImage: '',
    slogan: '',
    bannerImages: [],
    logoImage: '',
    shortDescription: '',
    fullHistory: '',
    historyBanner: '',
    socialMedia: {},
    paymentMethods: [],
    shippingInfo: { coverage: '', details: '' },
    legalInfo: { termsAndConditionsSections: [], privacyAndSecurityPolicySections: [] },
    rating: 0,
    reviewsCount: 0,
    featuredReviews: [],
    subscriptionPlans: [],
    ownerId: '',
    creationDate: '',
    totalSubscribers: 0,
    monthlyBoxesSent: 0,
    // Campos opcionales vacíos
  };

  return (
    <SubscriptionCardForEntrepreneur
      subscription={subscription}
      club={dummyClub}
      plan={plan!}
      customer={client!}
    />
  );
};

export default SubscriptionCard;