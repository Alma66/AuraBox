import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import EditSubscriptionsPage from './EditSubscriptionsPage';
import SubscriptionBoxHistoryPage from './SubscriptionBoxHistoryPage';
import BoxesOverview from '../../../../components/entrepreneur/plans/BoxesOverview';

const PlansAndBoxesPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'boxes' ? 'boxes' : 'plans';
  const planParam = searchParams.get('plan');

  if (!clubId) return null;

  const tabClass = (isActive: boolean) =>
    `min-h-[44px] rounded-lg px-4 text-sm font-semibold transition-colors ${
      isActive ? 'bg-aurora-navy text-white' : 'text-aurora-navy/70 hover:bg-white'
    }`;

  return (
    <div>
      <div className="px-4 pt-6 lg:px-8">
        <div role="tablist" aria-label="Planes y cajas" className="inline-flex gap-1 rounded-xl bg-aurora-navy/5 p-1">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'plans'}
            onClick={() => setSearchParams({ tab: 'plans' }, { replace: true })}
            className={tabClass(tab === 'plans')}
          >
            Planes
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'boxes'}
            onClick={() => setSearchParams({ tab: 'boxes' }, { replace: true })}
            className={tabClass(tab === 'boxes')}
          >
            Contenido de cajas
          </button>
        </div>
      </div>

      {tab === 'plans' && <EditSubscriptionsPage />}

      {tab === 'boxes' &&
        (planParam ? (
          <SubscriptionBoxHistoryPage
            clubId={clubId}
            subscriptionTypeId={planParam}
            onBack={() => setSearchParams({ tab: 'boxes' }, { replace: true })}
          />
        ) : (
          <BoxesOverview clubId={clubId} onSelect={(id) => setSearchParams({ tab: 'boxes', plan: String(id) }, { replace: true })} />
        ))}
    </div>
  );
};

export default PlansAndBoxesPage;