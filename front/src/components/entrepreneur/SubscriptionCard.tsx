import React from 'react';
import SubscriptionCardForEntrepreneur from './SubscriptionCardForEntrepreneur';
import { Subscription } from '../../types/subscription';
import { Club, SubscriptionPlan } from '../../types/club';
import { User } from '../../types/user';

interface SubscriptionCardProps {
  subscription: Subscription;
  client?: User;
  plan?: SubscriptionPlan;
  clubName?: string;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, client, plan, clubName }) => {
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