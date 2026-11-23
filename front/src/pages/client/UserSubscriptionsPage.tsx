import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import api, { getResponseData } from '../../api/config';
import Reveal from '../../components/common/Reveal';
import { Subscription, SubscriptionStatus, STATUS_LABELS, normalizeStatus } from '../../types/subscription';

interface SubscriptionTypeInfo {
  id: number;
  idClub: number;
  name: string;
  description?: string;
  basePrice: string;
  frequency: string;
  imageUrl?: string | null;
}

interface ClubInfo {
  id: number;
  name: string;
  logoUrl?: string;
}

interface PaymentMethodInfo {
  id: number;
  method: string;
}

interface PaymentInfo {
  id: number;
  idUserSubscription: number;
  idPaymentMethods?: number | null;
  paymentStatus: string;
  paymentDate: string;
}

interface BoxItem {
  id: number;
  deliveryMonthYear: string;
  productName: string;
  productDescription: string;
  usageInstructions?: string | null;
  productExpirationDate?: string | null;
  productImageUrl?: string | null;
  productVideoUrl?: string | null;
  additionalNotes?: string | null;
  publicationDate: string;
  ageRestriction?: boolean;
  originLocation?: string | null;
  containsAllergens?: boolean;
  allergensDetail?: string | null;
  isDangerousItem?: boolean;
  dangerDetail?: string | null;
  requiresCleaning?: boolean;
  cleaningInstructions?: string | null;
}

type BoxState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; items: BoxItem[] };

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  Activa: 'bg-green-100 text-green-700',
  Pendiente_Pago: 'bg-yellow-100 text-yellow-700',
  Cancelada: 'bg-red-100 text-red-700',
  Pausada: 'bg-orange-100 text-orange-700',
  Finalizada: 'bg-aurora-navy/10 text-aurora-navy/70',
};

const FILTERS: { key: 'all' | SubscriptionStatus; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'Activa', label: 'Activas' },
  { key: 'Pausada', label: 'Pausadas' },
  { key: 'Pendiente_Pago', label: 'Pago Pendiente' },
  { key: 'Cancelada', label: 'Canceladas' },
  { key: 'Finalizada', label: 'Finalizadas' },
];

const formatDate = (date?: string | null) => (date ? new Date(date).toLocaleDateString('es-AR') : '—');
const formatPrice = (amount?: string | null) => (amount ? `$${Number(amount).toLocaleString('es-AR')} ARS` : '—');

const groupByMonth = (items: BoxItem[]) => {
  const groups: Record<string, BoxItem[]> = {};
  items.forEach((item) => {
    if (!groups[item.deliveryMonthYear]) groups[item.deliveryMonthYear] = [];
    groups[item.deliveryMonthYear].push(item);
  });
  return Object.entries(groups);
};

const CashNotice: React.FC<{ payment: PaymentInfo }> = ({ payment }) => {
  if (payment.paymentStatus === 'Pendiente') {
    return (
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
        <p className="font-semibold">Pago en efectivo pendiente</p>
        <p className="mt-0.5">Abonás al recibir tu caja. El club confirma el cobro cuando te la entrega.</p>
      </div>
    );
  }
  if (payment.paymentStatus === 'Exitoso') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-xs text-green-800">
        Último pago en efectivo confirmado el {formatDate(payment.paymentDate)}.
      </div>
    );
  }
  if (payment.paymentStatus === 'Rechazado') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
        El club no registró el cobro de tu última caja. Si ya pagaste, comunicate con el club.
      </div>
    );
  }
  return null;
};

const BoxContent: React.FC<{ state: BoxState }> = ({ state }) => {
  if (state.status === 'loading') {
    return <p className="text-sm text-aurora-navy/60 py-2">Cargando contenido...</p>;
  }
  if (state.status === 'error') {
    return <p className="text-sm text-red-600 py-2">No se pudo cargar el contenido de la caja.</p>;
  }
  if (state.items.length === 0) {
    return <p className="text-sm text-aurora-navy/60 py-2">Todavía no hay contenido publicado para esta caja.</p>;
  }

  return (
    <div className="space-y-4">
      {groupByMonth(state.items).map(([month, items]) => (
        <div key={month}>
          <p className="text-xs font-semibold uppercase tracking-wide text-aurora-navy/50 mb-2">{month}</p>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-2xl bg-aurora-cream p-3">
                {item.productImageUrl && (
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className="h-16 w-16 flex-shrink-0 rounded-xl border border-aurora-navy/10 object-cover"
                  />
                )}
                <div className="min-w-0 flex-grow space-y-1">
                  <p className="font-semibold text-aurora-navy text-sm">{item.productName}</p>
                  <p className="text-xs text-aurora-navy/70">{item.productDescription}</p>
                  {item.originLocation && (
                    <p className="text-xs text-aurora-navy/60">Origen: {item.originLocation}</p>
                  )}
                  {item.usageInstructions && (
                    <p className="text-xs text-aurora-navy/60">Cómo usarlo: {item.usageInstructions}</p>
                  )}
                  {item.productExpirationDate && (
                    <p className="text-xs text-aurora-navy/60">Vence: {formatDate(item.productExpirationDate)}</p>
                  )}
                  {item.containsAllergens && (
                    <p className="text-xs text-orange-700">
                      Alérgenos: {item.allergensDetail || 'contiene alérgenos'}
                    </p>
                  )}
                  {item.isDangerousItem && (
                    <p className="text-xs text-red-600">Precaución: {item.dangerDetail || 'producto delicado'}</p>
                  )}
                  {item.ageRestriction && (
                    <p className="text-xs text-red-600">Solo para mayores de edad</p>
                  )}
                  {item.requiresCleaning && (
                    <p className="text-xs text-aurora-navy/60">
                      Limpieza: {item.cleaningInstructions || 'requiere limpieza antes de usar'}
                    </p>
                  )}
                  {item.additionalNotes && (
                    <p className="text-xs text-aurora-navy/60">{item.additionalNotes}</p>
                  )}
                  {item.productVideoUrl && (
                    <a
                      href={item.productVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs text-aurora-terracotta hover:text-aurora-terracottaDark underline"
                    >
                      Ver video
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const UserSubscriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subTypes, setSubTypes] = useState<Record<number, SubscriptionTypeInfo>>({});
  const [clubs, setClubs] = useState<Record<number, ClubInfo>>({});
  const [paymentMethods, setPaymentMethods] = useState<Record<number, string>>({});
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | SubscriptionStatus>('all');
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [processingCancel, setProcessingCancel] = useState(false);
  const [openBoxes, setOpenBoxes] = useState<Record<number, boolean>>({});
  const [boxes, setBoxes] = useState<Record<number, BoxState>>({});

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const subsResponse = await api.get(`/user-subscriptions?userId=${user.id}`);
      const subs: Subscription[] = getResponseData(subsResponse) || [];
      setSubscriptions(subs);

      const uniqueSubTypeIds = Array.from(new Set(subs.map((s) => s.idSubscriptionTypes)));
      const subTypesResults = await Promise.all(
        uniqueSubTypeIds.map((id) =>
          api.get(`/subscription-types/${id}`).then((r) => getResponseData(r)).catch(() => null)
        )
      );
      const subTypesMap: Record<number, SubscriptionTypeInfo> = {};
      subTypesResults.forEach((st) => { if (st) subTypesMap[st.id] = st; });
      setSubTypes(subTypesMap);

      const uniqueClubIds = Array.from(new Set(Object.values(subTypesMap).map((st) => st.idClub)));
      const clubsResults = await Promise.all(
        uniqueClubIds.map((id) =>
          api.get(`/clubs/${id}`).then((r) => getResponseData(r)).catch(() => null)
        )
      );
      const clubsMap: Record<number, ClubInfo> = {};
      clubsResults.forEach((c) => { if (c) clubsMap[c.id] = c; });
      setClubs(clubsMap);

      const [pmResponse, paymentsResponse] = await Promise.all([
        api.get('/payment-methods/active'),
        api.get(`/payments/by-user/${user.id}`).catch(() => null),
      ]);
      const pmList: PaymentMethodInfo[] = getResponseData(pmResponse) || [];
      const pmMap: Record<number, string> = {};
      pmList.forEach((pm) => { pmMap[pm.id] = pm.method; });
      setPaymentMethods(pmMap);
      setPayments(paymentsResponse ? getResponseData(paymentsResponse) || [] : []);
    } catch {
      setError('Error al cargar tus suscripciones.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latestPaymentBySubscription = useMemo(() => {
    const sorted = [...payments].sort((a, b) => {
      const diff = new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
      return diff !== 0 ? diff : b.id - a.id;
    });
    const map: Record<number, PaymentInfo> = {};
    sorted.forEach((p) => {
      if (!map[p.idUserSubscription]) map[p.idUserSubscription] = p;
    });
    return map;
  }, [payments]);

  const filteredSubscriptions = useMemo(() => {
    if (activeFilter === 'all') return subscriptions;
    return subscriptions.filter((s) => s.subscriptionStatus === activeFilter);
  }, [subscriptions, activeFilter]);

  const isCashMethod = (idMethod?: number | null) => {
    if (!idMethod) return false;
    const name = paymentMethods[idMethod];
    return !!name && name.toLowerCase().includes('efectivo');
  };

  const handleStartCancel = (id: number) => {
    setCancelingId(id);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (cancelingId === null) return;
    setProcessingCancel(true);
    try {
      await api.post(`/user-subscriptions/${cancelingId}/cancel`, { reason: cancelReason || undefined });
      setSubscriptions((prev) =>
        prev.map((s) => s.id === cancelingId
          ? { ...s, subscriptionStatus: 'Cancelada', cancellationReason: cancelReason || null, cancellationDate: new Date().toISOString() }
          : s
        )
      );
      setCancelingId(null);
      setCancelReason('');
    } catch {
      setError('No se pudo cancelar la suscripción. Intentá de nuevo.');
    } finally {
      setProcessingCancel(false);
    }
  };

  const handleToggleBox = async (subId: number, idSubscriptionTypes: number) => {
    const willOpen = !openBoxes[subId];
    setOpenBoxes((prev) => ({ ...prev, [subId]: willOpen }));
    if (!willOpen) return;
    if (boxes[idSubscriptionTypes]?.status === 'ready') return;

    setBoxes((prev) => ({ ...prev, [idSubscriptionTypes]: { status: 'loading' } }));
    try {
      const response = await api.get(`/box-content-history/by-subscription-type/${idSubscriptionTypes}`);
      const items: BoxItem[] = getResponseData(response) || [];
      setBoxes((prev) => ({ ...prev, [idSubscriptionTypes]: { status: 'ready', items } }));
    } catch {
      setBoxes((prev) => ({ ...prev, [idSubscriptionTypes]: { status: 'error' } }));
    }
  };

  const statusCount = (status: SubscriptionStatus) => subscriptions.filter((s) => s.subscriptionStatus === status).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora-cream px-4 py-16">
        <div role="status" className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
          <p className="text-aurora-navy/70">Cargando tus suscripciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div className="hero-mesh grain relative overflow-hidden">
        <div className="container relative mx-auto px-4 pb-24 pt-12 md:pb-28">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-aurora-goldLight">Tu cuenta</span>
          <h1 className="font-display text-4xl font-normal leading-tight text-white md:text-6xl">Mis suscripciones</h1>
          <p className="mt-3 max-w-xl text-lg text-white/80">
            {user ? `Hola, ${user.firstName}. ` : ''}Gestioná tus suscripciones activas y su historial.
          </p>
          {subscriptions.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="glass rounded-full px-4 py-1.5 text-sm font-semibold text-white">
                {subscriptions.length} {subscriptions.length === 1 ? 'suscripción' : 'suscripciones'}
              </span>
              {statusCount('Activa') > 0 && (
                <span className="glass rounded-full px-4 py-1.5 text-sm text-white">
                  {statusCount('Activa')} {statusCount('Activa') === 1 ? 'activa' : 'activas'}
                </span>
              )}
              {statusCount('Pendiente_Pago') > 0 && (
                <span className="glass rounded-full px-4 py-1.5 text-sm text-white">
                  {statusCount('Pendiente_Pago')} con pago pendiente
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto -mt-14 px-4 pb-16 md:-mt-16">
        {error && (
          <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {subscriptions.length > 0 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2 rounded-3xl bg-white p-3 shadow-aurora-sm ring-1 ring-aurora-navy/5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                aria-pressed={activeFilter === f.key}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeFilter === f.key ? 'bg-aurora-terracotta text-white shadow-aurora-sm' : 'text-aurora-navy/70 hover:bg-aurora-cream'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {subscriptions.length === 0 ? (
          <Reveal>
            <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-aurora ring-1 ring-aurora-navy/5">
              <span className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-aurora-cream text-aurora-terracotta">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              <h2 className="mb-2 font-display text-3xl font-medium text-aurora-navy">Todavía no tenés suscripciones</h2>
              <p className="mb-8 text-aurora-navy/60">Explorá clubes y elegí el plan que más te guste.</p>
              <button onClick={() => navigate('/explore')} className="btn-primary btn-shine">
                Explorar clubes
              </button>
            </div>
          </Reveal>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-aurora-sm ring-1 ring-aurora-navy/5">
            <p className="text-lg font-medium text-aurora-navy/70">No tenés suscripciones en este estado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
            {filteredSubscriptions.map((sub, index) => {
              const planInfo = subTypes[sub.idSubscriptionTypes];
              const clubInfo = planInfo ? clubs[planInfo.idClub] : undefined;
              const paymentMethodName = sub.idPaymentMethods ? paymentMethods[sub.idPaymentMethods] : undefined;
              const canCancel = normalizeStatus(sub.subscriptionStatus) === 'active' || normalizeStatus(sub.subscriptionStatus) === 'paused';
              const canSeeBox = sub.subscriptionStatus !== 'Pendiente_Pago';
              const isCancelingThis = cancelingId === sub.id;
              const isBoxOpen = !!openBoxes[sub.id];
              const boxState = boxes[sub.idSubscriptionTypes];
              const lastPayment = latestPaymentBySubscription[sub.id];
              const showCashNotice =
                !!lastPayment &&
                (sub.subscriptionStatus === 'Activa' || sub.subscriptionStatus === 'Pausada') &&
                isCashMethod(lastPayment.idPaymentMethods ?? sub.idPaymentMethods);

              return (
                <Reveal key={sub.id} delay={(index % 2) * 90}>
                  <article className="overflow-hidden rounded-3xl bg-white shadow-aurora-sm ring-1 ring-aurora-navy/5 transition-shadow duration-300 hover:shadow-aurora">
                    <div className="flex items-start gap-4 border-b border-aurora-navy/10 p-5 md:p-6">
                      <img
                        src={clubInfo?.logoUrl || '/assets/default-club.svg'}
                        alt={clubInfo?.name || 'Club'}
                        className="h-16 w-16 flex-shrink-0 rounded-2xl border border-aurora-navy/10 bg-white object-cover"
                      />
                      <div className="min-w-0 flex-grow">
                        <p className="truncate text-xs font-semibold uppercase tracking-wider text-aurora-navy/50">{clubInfo?.name || 'Club'}</p>
                        <h2 className="truncate font-display text-2xl font-medium text-aurora-navy">{planInfo?.name || 'Plan'}</h2>
                        <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_COLORS[sub.subscriptionStatus]}`}>
                          {STATUS_LABELS[sub.subscriptionStatus]}
                        </span>
                      </div>
                    </div>

                    <dl className="space-y-2.5 p-5 text-sm md:p-6">
                      <div className="flex justify-between gap-4">
                        <dt className="text-aurora-navy/60">Monto mensual</dt>
                        <dd className="font-display text-xl font-medium text-aurora-navy">{formatPrice(sub.monthlyAmountPaid || planInfo?.basePrice)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-aurora-navy/60">Frecuencia</dt>
                        <dd className="font-medium text-aurora-navy">{planInfo?.frequency || '—'}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-aurora-navy/60">Inicio</dt>
                        <dd className="font-medium text-aurora-navy">{formatDate(sub.startDate)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-aurora-navy/60">Próximo pago</dt>
                        <dd className="font-medium text-aurora-navy">{formatDate(sub.nextPaymentDate)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-aurora-navy/60">Método de pago</dt>
                        <dd className="font-medium text-aurora-navy">{paymentMethodName || '—'}</dd>
                      </div>
                      {sub.subscriptionStatus === 'Cancelada' && sub.cancellationReason && (
                        <div className="mt-2 rounded-2xl bg-red-50 p-3 text-xs text-red-600">
                          Motivo: {sub.cancellationReason}
                        </div>
                      )}
                    </dl>

                    {showCashNotice && lastPayment && (
                      <div className="px-5 pb-5 md:px-6">
                        <CashNotice payment={lastPayment} />
                      </div>
                    )}

                    {canSeeBox && (
                      <div className="px-5 pb-5 md:px-6">
                        <button
                          onClick={() => handleToggleBox(sub.id, sub.idSubscriptionTypes)}
                          aria-expanded={isBoxOpen}
                          className="btn-outline w-full !py-2.5 text-sm"
                        >
                          {isBoxOpen ? 'Ocultar contenido de la caja' : 'Ver contenido de la caja'}
                        </button>
                        {isBoxOpen && (
                          <div className="mt-4">
                            <BoxContent state={boxState || { status: 'loading' }} />
                          </div>
                        )}
                      </div>
                    )}

                    {canCancel && (
                      <div className="px-5 pb-5 md:px-6 md:pb-6">
                        {isCancelingThis ? (
                          <div className="space-y-3 rounded-2xl bg-aurora-cream p-4">
                            <label htmlFor={`cancel-reason-${sub.id}`} className="text-xs font-medium text-aurora-navy/80">Motivo (opcional):</label>
                            <input
                              id={`cancel-reason-${sub.id}`}
                              type="text"
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="input-aurora bg-white text-sm"
                              placeholder="¿Por qué querés cancelar?"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleConfirmCancel}
                                disabled={processingCancel}
                                className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                              >
                                {processingCancel ? 'Cancelando...' : 'Confirmar cancelación'}
                              </button>
                              <button
                                onClick={() => setCancelingId(null)}
                                className="flex-1 rounded-full bg-aurora-navy/10 py-2.5 text-sm font-semibold text-aurora-navy/80 transition-colors hover:bg-aurora-navy/20"
                              >
                                Volver
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartCancel(sub.id)}
                            className="w-full rounded-full border-2 border-red-200 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                          >
                            Cancelar suscripción
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSubscriptionsPage;