import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import SegmentedControl from '../../components/native/SegmentedControl';
import PaymentsSection from '../../components/native/orders/PaymentsSection';
import ShipmentsSection from '../../components/native/orders/ShipmentsSection';
import SubscriptionsSection from '../../components/native/orders/SubscriptionsSection';

type SectionKey = 'subscriptions' | 'shipments' | 'payments';

const OPTIONS: { key: SectionKey; label: string }[] = [
  { key: 'subscriptions', label: 'Suscripciones' },
  { key: 'shipments', label: 'Envíos' },
  { key: 'payments', label: 'Pagos' },
];

const resolveSection = (pathname: string, search: string): SectionKey => {
  if (pathname === '/customer/subscriptions') return 'subscriptions';
  const tab = new URLSearchParams(search).get('tab');
  if (tab === 'subscriptions' || tab === 'shipments' || tab === 'payments') return tab;
  return 'shipments';
};

const NativeOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const section = resolveSection(pathname, search);

  if (!user) return null;

  return (
    <div>
      <div
        className="sticky z-20 bg-aurora-cream px-4 pb-3 pt-4"
        style={{ top: 'calc(3.5rem + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)))' }}
      >
        <SegmentedControl
          options={OPTIONS}
          value={section}
          onChange={(key) => navigate(`/customer/orders?tab=${key}`, { replace: true })}
        />
      </div>
      <div className="px-4 pb-8 pt-2">
        {section === 'subscriptions' && <SubscriptionsSection key="subscriptions" userId={user.id} />}
        {section === 'shipments' && <ShipmentsSection key="shipments" userId={user.id} />}
        {section === 'payments' && <PaymentsSection key="payments" userId={user.id} />}
      </div>
    </div>
  );
};

export default NativeOrdersPage;