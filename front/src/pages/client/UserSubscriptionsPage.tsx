import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import api, { getResponseData } from '../../api/config';
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
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-lg p-3">
        <p className="font-semibold">Pago en efectivo pendiente</p>
        <p className="mt-0.5">Abonás al recibir tu caja. El club confirma el cobro cuando te la entrega.</p>
      </div>
    );
  }
  if (payment.paymentStatus === 'Exitoso') {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg p-3">
        Último pago en efectivo confirmado el {formatDate(payment.paymentDate)}.
      </div>
    );
  }
  if (payment.paymentStatus === 'Rechazado') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">
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
              <div key={item.id} className="bg-aurora-cream rounded-lg p-3 flex gap-3">
                {item.productImageUrl && (
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0 border border-aurora-navy/10"
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

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora-cream py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aurora-terracottaDark mx-auto mb-4"></div>
          <p className="text-aurora-navy/70">Cargando tus suscripciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurora-cream py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-aurora-navy mb-2">Mis Suscripciones</h1>
          <p className="text-aurora-navy/70">
            {user ? `Hola, ${user.firstName}! ` : ''}Gestioná tus suscripciones activas y su historial.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6 text-center">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeFilter === f.key ? 'bg-aurora-terracotta text-white' : 'bg-white text-aurora-navy/70 hover:bg-aurora-cream border border-aurora-navy/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-inner">
            <svg className="mx-auto h-20 w-20 text-aurora-navy/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-aurora-navy mb-2">Todavía no tenés suscripciones</h3>
            <p className="text-aurora-navy/60 mb-4">Explorá clubes y elegí el plan que más te guste.</p>
            <button onClick={() => navigate('/explore')} className="bg-aurora-terracotta text-white px-6 py-3 rounded-lg hover:bg-aurora-terracottaDark transition-colors">
              Explorar Clubes
            </button>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-inner">
            <p className="text-lg text-aurora-navy/70 font-medium">No tenés suscripciones en este estado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {filteredSubscriptions.map((sub) => {
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
                <div key={sub.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="p-5 flex gap-4 items-start border-b border-aurora-navy/10">
                    <img
                      src={clubInfo?.logoUrl || '/assets/default-club.svg'}
                      alt={clubInfo?.name || 'Club'}
                      className="w-16 h-16 rounded-full object-cover border border-aurora-navy/10 flex-shrink-0"
                    />
                    <div className="flex-grow min-w-0">
                      <p className="text-xs text-aurora-navy/40 truncate">{clubInfo?.name || 'Club'}</p>
                      <h3 className="font-bold text-aurora-navy truncate">{planInfo?.name || 'Plan'}</h3>
                      <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[sub.subscriptionStatus]}`}>
                        {STATUS_LABELS[sub.subscriptionStatus]}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2 text-sm text-aurora-navy/70">
                    <div className="flex justify-between">
                      <span>Monto mensual</span>
                      <span className="font-semibold text-aurora-navy">{formatPrice(sub.monthlyAmountPaid || planInfo?.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frecuencia</span>
                      <span className="font-medium">{planInfo?.frequency || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inicio</span>
                      <span className="font-medium">{formatDate(sub.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Próximo pago</span>
                      <span className="font-medium">{formatDate(sub.nextPaymentDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Método de pago</span>
                      <span className="font-medium">{paymentMethodName || '—'}</span>
                    </div>
                    {sub.subscriptionStatus === 'Cancelada' && sub.cancellationReason && (
                      <div className="bg-red-50 text-red-600 text-xs rounded-lg p-2 mt-2">
                        Motivo: {sub.cancellationReason}
                      </div>
                    )}
                  </div>

                  {showCashNotice && lastPayment && (
                    <div className="px-5 pb-5">
                      <CashNotice payment={lastPayment} />
                    </div>
                  )}

                  {canSeeBox && (
                    <div className="px-5 pb-5">
                      <button
                        onClick={() => handleToggleBox(sub.id, sub.idSubscriptionTypes)}
                        className="w-full text-aurora-terracotta border border-aurora-terracotta/40 text-sm py-2 rounded-md hover:bg-aurora-terracotta/10 transition-colors font-medium"
                      >
                        {isBoxOpen ? 'Ocultar contenido de la caja' : 'Ver contenido de la caja'}
                      </button>
                      {isBoxOpen && (
                        <div className="mt-3">
                          <BoxContent state={boxState || { status: 'loading' }} />
                        </div>
                      )}
                    </div>
                  )}

                  {canCancel && (
                    <div className="p-5 pt-0">
                      {isCancelingThis ? (
                        <div className="bg-aurora-cream rounded-lg p-3 space-y-2">
                          <label className="text-xs font-medium text-aurora-navy/80">Motivo (opcional):</label>
                          <input
                            type="text"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="w-full rounded-md border-aurora-navy/20 shadow-sm text-sm focus:border-red-500 focus:ring-red-500"
                            placeholder="¿Por qué querés cancelar?"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleConfirmCancel}
                              disabled={processingCancel}
                              className="flex-1 bg-red-600 text-white text-sm py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {processingCancel ? 'Cancelando...' : 'Confirmar Cancelación'}
                            </button>
                            <button
                              onClick={() => setCancelingId(null)}
                              className="flex-1 bg-aurora-navy/10 text-aurora-navy/80 text-sm py-2 rounded-md hover:bg-aurora-navy/20 transition-colors"
                            >
                              Volver
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartCancel(sub.id)}
                          className="w-full text-red-600 border border-red-200 text-sm py-2 rounded-md hover:bg-red-50 transition-colors font-medium"
                        >
                          Cancelar Suscripción
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSubscriptionsPage;