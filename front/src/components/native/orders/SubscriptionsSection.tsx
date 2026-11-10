import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../../api/config';
import { STATUS_LABELS, Subscription, SubscriptionStatus, normalizeStatus } from '../../../types/subscription';
import { ClubSummary, PlanSummary, getClubSummary, getPlanSummary } from '../../../utils/dataCache';
import { formatDate, getErrorMessage } from '../../../utils/format';
import { formatMoney } from '../../../utils/money';
import { tapFeedback } from '../../../utils/native';
import SafeImage from '../../common/SafeImage';
import BottomSheet from '../BottomSheet';
import BoxContentSheet from './BoxContentSheet';

interface PaymentInfo {
  id: number;
  idUserSubscription: number;
  idPaymentMethods?: number | null;
  paymentStatus: string;
  paymentDate: string;
}

const PILL_COLORS: Record<SubscriptionStatus, string> = {
  Activa: 'bg-green-100 text-green-700',
  Pendiente_Pago: 'bg-yellow-100 text-yellow-700',
  Cancelada: 'bg-red-100 text-red-700',
  Pausada: 'bg-orange-100 text-orange-700',
  Finalizada: 'bg-aurora-navy/10 text-aurora-navy/70',
};

const STATUS_ORDER: SubscriptionStatus[] = ['Activa', 'Pendiente_Pago', 'Pausada', 'Cancelada', 'Finalizada'];

const cashNotice = (payment: PaymentInfo): { tone: string; title: string; text: string } | null => {
  if (payment.paymentStatus === 'Pendiente') {
    return {
      tone: 'bg-yellow-50 text-yellow-800',
      title: 'Pago en efectivo pendiente',
      text: 'Abonás al recibir tu caja. El club confirma el cobro cuando te la entrega.',
    };
  }
  if (payment.paymentStatus === 'Exitoso') {
    return {
      tone: 'bg-green-50 text-green-800',
      title: 'Pago confirmado',
      text: `Último pago en efectivo confirmado el ${formatDate(payment.paymentDate)}.`,
    };
  }
  if (payment.paymentStatus === 'Rechazado') {
    return {
      tone: 'bg-red-50 text-red-700',
      title: 'Cobro no registrado',
      text: 'El club no registró el cobro de tu última caja. Si ya pagaste, comunicate con el club.',
    };
  }
  return null;
};

const SubscriptionsSection: React.FC<{ userId: number }> = ({ userId }) => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Record<number, PlanSummary>>({});
  const [clubs, setClubs] = useState<Record<number, ClubSummary>>({});
  const [methods, setMethods] = useState<Record<number, string>>({});
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState<'all' | SubscriptionStatus>('all');
  const [boxTarget, setBoxTarget] = useState<{ planId: number; planName: string } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{ id: number; planName: string } | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setFailed(false);
      try {
        const subsResponse = await api.get(`/user-subscriptions?userId=${userId}`);
        const list: Subscription[] = getResponseData(subsResponse) || [];
        const planIds = Array.from(new Set(list.map((item) => item.idSubscriptionTypes)));
        const [planResults, methodsResponse, paymentsResponse] = await Promise.all([
          Promise.all(planIds.map((id) => getPlanSummary(id))),
          api.get('/payment-methods/active').catch(() => null),
          api.get(`/payments/by-user/${userId}`).catch(() => null),
        ]);
        const planMap: Record<number, PlanSummary> = {};
        planResults.forEach((plan) => {
          if (plan) planMap[plan.id] = plan;
        });
        const clubIds = Array.from(new Set(Object.values(planMap).map((plan) => plan.idClub)));
        const clubResults = await Promise.all(clubIds.map((id) => getClubSummary(id)));
        if (!active) return;
        const clubMap: Record<number, ClubSummary> = {};
        clubResults.forEach((club) => {
          if (club) clubMap[club.id] = club;
        });
        const methodList: { id: number; method: string }[] = methodsResponse ? getResponseData(methodsResponse) || [] : [];
        const methodMap: Record<number, string> = {};
        methodList.forEach((item) => {
          methodMap[item.id] = item.method;
        });
        setSubscriptions(list);
        setPlans(planMap);
        setClubs(clubMap);
        setMethods(methodMap);
        setPayments(paymentsResponse ? getResponseData(paymentsResponse) || [] : []);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [userId, reloadKey]);

  const latestPayment = useMemo(() => {
    const sorted = [...payments].sort((a, b) => {
      const diff = new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
      return diff !== 0 ? diff : b.id - a.id;
    });
    const map: Record<number, PaymentInfo> = {};
    sorted.forEach((payment) => {
      if (!map[payment.idUserSubscription]) map[payment.idUserSubscription] = payment;
    });
    return map;
  }, [payments]);

  const counts = useMemo(() => {
    const map: Partial<Record<SubscriptionStatus, number>> = {};
    subscriptions.forEach((item) => {
      map[item.subscriptionStatus] = (map[item.subscriptionStatus] ?? 0) + 1;
    });
    return map;
  }, [subscriptions]);

  const visible = useMemo(() => {
    const filtered = filter === 'all' ? subscriptions : subscriptions.filter((item) => item.subscriptionStatus === filter);
    return [...filtered].sort(
      (a, b) => STATUS_ORDER.indexOf(a.subscriptionStatus) - STATUS_ORDER.indexOf(b.subscriptionStatus) || b.id - a.id,
    );
  }, [subscriptions, filter]);

  const isCash = (idMethod?: number | null) => {
    if (!idMethod) return false;
    return Boolean(methods[idMethod]?.toLowerCase().includes('efectivo'));
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget || cancelling) return;
    setCancelling(true);
    try {
      await api.post(`/user-subscriptions/${cancelTarget.id}/cancel`, { reason: cancelReason.trim() || undefined });
      const cancelledId = cancelTarget.id;
      const reason = cancelReason.trim();
      setSubscriptions((previous) =>
        previous.map((item) =>
          item.id === cancelledId
            ? { ...item, subscriptionStatus: 'Cancelada', cancellationReason: reason || null, cancellationDate: new Date().toISOString() }
            : item,
        ),
      );
      setCancelTarget(null);
      setCancelReason('');
      toast.success('Suscripción cancelada');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'No pudimos cancelar la suscripción. Intentá de nuevo.'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" role="status" aria-label="Cargando suscripciones">
        {[0, 1].map((item) => (
          <div key={item} className="h-56 animate-pulse rounded-3xl bg-white shadow-aurora-sm" />
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <div role="alert" className="py-12 text-center">
        <p className="text-5xl" aria-hidden="true">📡</p>
        <h2 className="mt-4 font-display text-xl font-bold text-aurora-navy">No pudimos cargar tus suscripciones</h2>
        <p className="mt-1 text-sm text-aurora-navy/60">Revisá tu conexión e intentá de nuevo.</p>
        <button
          type="button"
          onClick={() => {
            tapFeedback();
            setReloadKey((value) => value + 1);
          }}
          className="btn-primary mt-5"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-5xl" aria-hidden="true">✨</p>
        <h2 className="mt-4 font-display text-xl font-bold text-aurora-navy">Todavía no tenés suscripciones</h2>
        <p className="mt-1 text-sm text-aurora-navy/60">Explorá clubes y elegí la caja que más te guste.</p>
        <button type="button" onClick={() => navigate('/explore')} className="btn-primary mt-5">
          Explorar clubes
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        <button
          type="button"
          onClick={() => {
            tapFeedback();
            setFilter('all');
          }}
          className={`min-h-[40px] shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
            filter === 'all' ? 'bg-aurora-navy text-white' : 'bg-white text-aurora-navy/70 ring-1 ring-aurora-navy/10'
          }`}
        >
          Todas ({subscriptions.length})
        </button>
        {STATUS_ORDER.filter((status) => (counts[status] ?? 0) > 0).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => {
              tapFeedback();
              setFilter(status);
            }}
            className={`min-h-[40px] shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
              filter === status ? 'bg-aurora-navy text-white' : 'bg-white text-aurora-navy/70 ring-1 ring-aurora-navy/10'
            }`}
          >
            {STATUS_LABELS[status]} ({counts[status]})
          </button>
        ))}
      </div>

      <ul className="space-y-4">
        {visible.map((subscription, index) => {
          const plan = plans[subscription.idSubscriptionTypes];
          const club = plan ? clubs[plan.idClub] : undefined;
          const status = normalizeStatus(subscription.subscriptionStatus);
          const canCancel = status === 'active' || status === 'paused';
          const canSeeBox = subscription.subscriptionStatus !== 'Pendiente_Pago';
          const methodName = subscription.idPaymentMethods ? methods[subscription.idPaymentMethods] : undefined;
          const payment = latestPayment[subscription.id];
          const showNotice =
            Boolean(payment) &&
            (subscription.subscriptionStatus === 'Activa' || subscription.subscriptionStatus === 'Pausada') &&
            isCash(payment?.idPaymentMethods ?? subscription.idPaymentMethods);
          const notice = showNotice && payment ? cashNotice(payment) : null;
          const planName = plan?.name || 'Plan';
          return (
            <li
              key={subscription.id}
              className="animate-fadeInUp overflow-hidden rounded-3xl bg-white shadow-aurora-sm ring-1 ring-aurora-navy/5"
              style={{ animationDelay: `${Math.min(index, 6) * 60}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-center gap-3 border-b border-aurora-navy/5 p-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-aurora-navy/10 bg-aurora-cream">
                  <SafeImage src={club?.logoUrl} alt={club?.name || 'Club'} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold uppercase tracking-wide text-aurora-terracotta">{club?.name || 'Club'}</p>
                  <h2 className="truncate font-display text-lg font-bold leading-tight text-aurora-navy">{planName}</h2>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${PILL_COLORS[subscription.subscriptionStatus]}`}>
                    {STATUS_LABELS[subscription.subscriptionStatus]}
                  </span>
                </div>
              </div>

              <dl className="space-y-2 p-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-aurora-navy/55">Monto</dt>
                  <dd className="font-bold text-aurora-navy">
                    {formatMoney(Number(subscription.monthlyAmountPaid || plan?.basePrice || 0))}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-aurora-navy/55">Frecuencia</dt>
                  <dd className="font-medium text-aurora-navy">{plan?.frequency || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-aurora-navy/55">Inicio</dt>
                  <dd className="font-medium text-aurora-navy">{formatDate(subscription.startDate)}</dd>
                </div>
                {status !== 'cancelled' && status !== 'finished' && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-aurora-navy/55">Próximo pago</dt>
                    <dd className="font-medium text-aurora-navy">{formatDate(subscription.nextPaymentDate)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <dt className="text-aurora-navy/55">Medio de pago</dt>
                  <dd className="font-medium text-aurora-navy">{methodName || '—'}</dd>
                </div>
              </dl>

              {subscription.subscriptionStatus === 'Cancelada' && subscription.cancellationReason && (
                <p className="mx-4 mb-4 rounded-2xl bg-red-50 px-4 py-2.5 text-xs text-red-700">Motivo: {subscription.cancellationReason}</p>
              )}

              {notice && (
                <div className={`mx-4 mb-4 rounded-2xl px-4 py-3 text-xs ${notice.tone}`}>
                  <p className="font-bold">{notice.title}</p>
                  <p className="mt-0.5">{notice.text}</p>
                </div>
              )}

              <div className="space-y-2 px-4 pb-4">
                {canSeeBox && (
                  <button
                    type="button"
                    onClick={() => {
                      tapFeedback();
                      setBoxTarget({ planId: subscription.idSubscriptionTypes, planName });
                    }}
                    className="btn-primary w-full !py-3 !text-sm"
                  >
                    Ver contenido de la caja
                  </button>
                )}
                <div className="flex gap-2">
                  {plan && (
                    <Link
                      to={`/club/${plan.idClub}/plan/${plan.id}`}
                      onClick={() => {
                        tapFeedback();
                      }}
                      className="btn-outline flex-1 !px-3 !py-2.5 !text-sm"
                    >
                      Ver plan
                    </Link>
                  )}
                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => {
                        tapFeedback();
                        setCancelReason('');
                        setCancelTarget({ id: subscription.id, planName });
                      }}
                      className="min-h-[44px] flex-1 rounded-full border-2 border-red-200 px-3 text-sm font-semibold text-red-600 transition-transform active:scale-95 active:bg-red-50"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {boxTarget && <BoxContentSheet planId={boxTarget.planId} planName={boxTarget.planName} onClose={() => setBoxTarget(null)} />}

      <BottomSheet
        open={cancelTarget !== null}
        title="Cancelar suscripción"
        onClose={() => {
          if (!cancelling) setCancelTarget(null);
        }}
        footer={
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="min-h-[48px] w-full rounded-full bg-red-600 font-semibold text-white transition-transform active:scale-95 disabled:opacity-60"
            >
              {cancelling ? 'Cancelando…' : 'Sí, cancelar suscripción'}
            </button>
            <button
              type="button"
              onClick={() => setCancelTarget(null)}
              disabled={cancelling}
              className="min-h-[48px] w-full rounded-full font-semibold text-aurora-navy active:bg-aurora-cream disabled:opacity-60"
            >
              Mantener mi suscripción
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-aurora-navy/75">
          Vas a dejar de recibir las cajas de <span className="font-bold text-aurora-navy">{cancelTarget?.planName}</span>. Esta acción no se
          puede deshacer.
        </p>
        <label htmlFor="cancel-reason" className="mb-1 mt-4 block text-sm font-bold text-aurora-navy">
          Motivo (opcional)
        </label>
        <input
          id="cancel-reason"
          type="text"
          value={cancelReason}
          onChange={(event) => setCancelReason(event.target.value)}
          maxLength={200}
          placeholder="¿Por qué querés cancelar?"
          className="input-aurora"
        />
      </BottomSheet>
    </div>
  );
};

export default SubscriptionsSection;