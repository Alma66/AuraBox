import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../../../api/config';
import { Subscription, SubscriptionStatus, normalizeStatus } from '../../../../types/subscription';
import { User } from '../../../../types/user';
import { SubscriptionPlan } from '../../../../types/club';
import SubscriptionsMonitor from '../../../../components/entrepreneur/customers/SubscriptionsMonitor';
import CustomerDirectory from '../../../../components/entrepreneur/customers/CustomerDirectory';
import CustomerDrawer from '../../../../components/entrepreneur/customers/CustomerDrawer';
import { getErrorMessage } from '../../../../components/entrepreneur/customers/customerUtils';

type Tab = 'subscriptions' | 'directory';

const CustomersPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [focusSubId, setFocusSubId] = useState<number | null>(null);

  const tab: Tab = searchParams.get('tab') === 'directory' ? 'directory' : 'subscriptions';
  const customerParam = searchParams.get('customerId');

  const load = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    setError(null);
    try {
      const [clubRes, subsRes, customersRes] = await Promise.all([
        api.get(`/clubs/${clubId}`),
        api.get(`/clubs/${clubId}/user-subscriptions`),
        api.get(`/clubs/${clubId}/customers`),
      ]);
      const clubData = getResponseData(clubRes);
      setPlans(clubData?.subscriptionPlans || []);
      setSubscriptions(getResponseData(subsRes) || []);
      setCustomers(getResponseData(customersRes) || []);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar los clientes.'));
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  const reloadSubscriptions = useCallback(async () => {
    if (!clubId) return;
    try {
      const res = await api.get(`/clubs/${clubId}/user-subscriptions`);
      setSubscriptions(getResponseData(res) || []);
    } catch {
      return;
    }
  }, [clubId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (loading || !customerParam) return;
    if (!customers.some((c) => String(c.id) === customerParam)) {
      toast.error('No encontramos a ese cliente en tu club.');
      const params = new URLSearchParams();
      params.set('tab', tab);
      setSearchParams(params, { replace: true });
    }
  }, [loading, customerParam, customers, tab, setSearchParams]);

  const pendingCount = useMemo(
    () => subscriptions.filter((s) => normalizeStatus(s.subscriptionStatus) === 'pending').length,
    [subscriptions],
  );

  const selectedCustomer = useMemo(
    () => (customerParam ? customers.find((c) => String(c.id) === customerParam) ?? null : null),
    [customers, customerParam],
  );

  const selectedSubs = useMemo(
    () => (selectedCustomer ? subscriptions.filter((s) => String(s.idUser) === String(selectedCustomer.id)) : []),
    [subscriptions, selectedCustomer],
  );

  const setParams = (nextTab: Tab, customerId?: string | number) => {
    const params = new URLSearchParams();
    params.set('tab', nextTab);
    if (customerId !== undefined) params.set('customerId', String(customerId));
    setSearchParams(params, { replace: true });
  };

  const openFromSubscription = (sub: Subscription) => {
    setFocusSubId(sub.id);
    setParams(tab, sub.idUser);
  };

  const openFromDirectory = (customer: User) => {
    setFocusSubId(null);
    setParams(tab, customer.id);
  };

  const closeDrawer = useCallback(() => {
    setFocusSubId(null);
    const params = new URLSearchParams();
    params.set('tab', tab);
    setSearchParams(params, { replace: true });
  }, [tab, setSearchParams]);

  const changeStatus = async (sub: Subscription, status: SubscriptionStatus) => {
    if (updatingId !== null) return;
    setUpdatingId(sub.id);
    try {
      await api.patch(`/user-subscriptions/${sub.id}`, { subscriptionStatus: status });
      setSubscriptions((prev) => prev.map((s) => (s.id === sub.id ? { ...s, subscriptionStatus: status } : s)));
      toast.success('Estado actualizado correctamente.');
      await reloadSubscriptions();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al actualizar el estado.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const tabClass = (isActive: boolean) =>
    `flex min-h-[44px] items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
      isActive ? 'bg-aurora-navy text-white' : 'text-aurora-navy/70 hover:bg-white'
    }`;

  if (!clubId) return null;

  if (loading) {
    return (
      <div className="animate-pulse space-y-5 px-4 py-6 lg:px-8" aria-busy="true">
        <div className="h-11 w-72 rounded-xl bg-aurora-navy/10" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="h-20 rounded-xl bg-aurora-navy/10" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-aurora-navy/10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-3 min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 py-6 lg:px-8">
      <div role="tablist" aria-label="Vistas de clientes" className="inline-flex gap-1 rounded-xl bg-aurora-navy/5 p-1">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'subscriptions'}
          onClick={() => setParams('subscriptions')}
          className={tabClass(tab === 'subscriptions')}
        >
          Suscripciones
          {pendingCount > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                tab === 'subscriptions' ? 'bg-aurora-gold text-aurora-navy' : 'bg-aurora-terracotta text-white'
              }`}
            >
              {pendingCount}
            </span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'directory'}
          onClick={() => setParams('directory')}
          className={tabClass(tab === 'directory')}
        >
          Directorio
        </button>
      </div>

      {tab === 'subscriptions' ? (
        <SubscriptionsMonitor
          subscriptions={subscriptions}
          customers={customers}
          plans={plans}
          onOpen={openFromSubscription}
        />
      ) : (
        <CustomerDirectory customers={customers} subscriptions={subscriptions} onOpen={openFromDirectory} />
      )}

      {selectedCustomer && (
        <CustomerDrawer
          customer={selectedCustomer}
          subscriptions={selectedSubs}
          plans={plans}
          focusSubId={focusSubId}
          updatingId={updatingId}
          onClose={closeDrawer}
          onStatusChange={changeStatus}
        />
      )}
    </div>
  );
};

export default CustomersPage;