import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../App';
import { Club } from '../../../../types/club';
import { Subscription, normalizeStatus, NormalizedStatus } from '../../../../types/subscription';
import { User } from '../../../../types/user';
import api, { getResponseData } from '../../../../api/config';

interface PaymentRow {
  id: number;
  idUserSubscription: number;
  totalAmountPaid: string;
  paymentDate: string;
  paymentStatus: 'Exitoso' | 'Pendiente' | 'Rechazado' | 'Reembolsado';
  paymentMethodCode?: string | null;
}

const statusColorClass: Record<NormalizedStatus, string> = {
  active: 'bg-green-600',
  paused: 'bg-yellow-500',
  cancelled: 'bg-red-500',
  pending: 'bg-orange-500',
  finished: 'bg-aurora-navy/50',
};

const statusText: Record<NormalizedStatus, string> = {
  active: 'Activa',
  paused: 'Pausada',
  cancelled: 'Cancelada',
  pending: 'Pago pendiente',
  finished: 'Finalizada',
};

const paymentBadge: Record<PaymentRow['paymentStatus'], string> = {
  Exitoso: 'bg-green-100 text-green-700',
  Pendiente: 'bg-yellow-100 text-yellow-700',
  Rechazado: 'bg-red-100 text-red-700',
  Reembolsado: 'bg-aurora-terracotta/10 text-aurora-terracottaDark',
};

const money = (value: string) => `$${Number(value).toLocaleString('es-AR')} ARS`;

const SubscriptionDetailForEntrepreneurPage: React.FC = () => {
  const { clubId, subscriptionId } = useParams<{ clubId: string; subscriptionId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [customer, setCustomer] = useState<User | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settlingId, setSettlingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      const res = await api.get(`/payments/by-club/${clubId}`);
      const rows: PaymentRow[] = getResponseData(res) || [];
      setPayments(rows.filter((row) => String(row.idUserSubscription) === String(subscriptionId)));
    } catch {
      setPayments([]);
    }
  }, [clubId, subscriptionId]);

  useEffect(() => {
    if (!authUser || authUser.role !== 'entrepreneur' || String(authUser.managedClubId) !== clubId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [clubRes, subRes, customersRes] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/user-subscriptions/${subscriptionId}`),
          api.get(`/clubs/${clubId}/customers`),
        ]);

        const clubData = getResponseData(clubRes);
        const subData: Subscription = getResponseData(subRes);
        const customers: User[] = getResponseData(customersRes) || [];

        if (!clubData) {
          setError('Club no encontrado.');
          return;
        }
        setClub(clubData);

        if (!subData) {
          setError('Suscripción no encontrada.');
          return;
        }

        const planExists = clubData.subscriptionPlans?.some(
          (p: any) => Number(p.planId) === subData.idSubscriptionTypes,
        );
        if (!planExists) {
          setError('Esta suscripción no pertenece a este club.');
          return;
        }

        setSubscription(subData);

        const foundCustomer = customers.find((c) => Number(c.id) === subData.idUser) ?? null;
        setCustomer(foundCustomer);

        await loadPayments();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser, clubId, subscriptionId, navigate, loadPayments]);

  const settle = async (paymentId: number, action: 'confirm' | 'reject') => {
    setSettlingId(paymentId);
    try {
      await api.patch(`/payments/${paymentId}/settle`, { action });
      toast.success(action === 'confirm' ? 'Cobro registrado.' : 'Pago marcado como no cobrado.');
      setRejectingId(null);
      const subRes = await api.get(`/user-subscriptions/${subscriptionId}`);
      setSubscription(getResponseData(subRes));
      await loadPayments();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'No se pudo actualizar el pago.');
    } finally {
      setSettlingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse max-w-3xl mx-auto">
          <div className="h-6 bg-aurora-navy/10 rounded w-40 mb-8" />
          <div className="bg-white rounded-xl shadow-aurora-sm p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-48 h-48 bg-aurora-navy/10 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-aurora-navy/10 rounded w-32" />
                <div className="h-8 bg-aurora-navy/10 rounded w-2/3" />
                <div className="h-4 bg-aurora-navy/10 rounded w-full" />
                <div className="h-4 bg-aurora-navy/10 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-3">{error}</h1>
        <p className="text-aurora-navy/60 mb-8">No pudimos mostrar esta suscripción.</p>
        <button
          onClick={() => navigate(`/entrepreneur/club/${clubId}/active-subscriptions`)}
          className="bg-aurora-terracotta text-white px-6 py-3 rounded-xl font-semibold hover:bg-aurora-terracottaDark transition-colors"
        >
          Volver a Suscripciones Activas
        </button>
      </div>
    );
  }

  if (!subscription || !club || !customer) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-aurora-navy mb-3">Información incompleta</h1>
        <p className="text-aurora-navy/60">No se pudieron cargar todos los datos de esta suscripción.</p>
      </div>
    );
  }

  const plan = club.subscriptionPlans?.find((p: any) => Number(p.planId) === subscription.idSubscriptionTypes);
  const status = normalizeStatus(subscription.subscriptionStatus);

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/entrepreneur/club/${clubId}/active-subscriptions`)}
        className="mb-6 flex items-center text-aurora-terracotta hover:text-aurora-terracottaDark transition-colors text-sm font-medium"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver a Suscripciones Activas
      </button>

      <h1 className="text-4xl font-display font-bold mb-8 text-center text-aurora-navy">Detalle de Suscripción</h1>

      <div className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <img
            src={plan?.image || '/assets/default-plan.jpg'}
            alt={plan?.name || 'Plan'}
            className="w-48 h-48 object-cover rounded-lg shadow-md bg-aurora-cream"
          />
          <div className="flex-grow text-center md:text-left">
            <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold mb-4 ${statusColorClass[status]}`}>
              Estado: {statusText[status]}
            </div>
            <h2 className="text-3xl font-bold mb-2 text-aurora-navy">{plan?.name || `Plan #${subscription.idSubscriptionTypes}`}</h2>
            <p className="text-aurora-navy/70 text-lg mb-4">{plan?.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-aurora-navy mb-6">
              <div>
                <p><strong>Cliente:</strong> {customer.firstName} {customer.lastName} ({customer.email})</p>
                <p><strong>Inicio:</strong> {new Date(subscription.startDate).toLocaleDateString('es-AR')}</p>
                <p>
                  <strong>Próximo Pago:</strong>{' '}
                  {subscription.nextPaymentDate
                    ? new Date(subscription.nextPaymentDate).toLocaleDateString('es-AR')
                    : 'No definido'}
                </p>
              </div>
              <div>
                <p><strong>Frecuencia:</strong> {plan?.deliveryFrequency || '-'}</p>
                <p>
                  <strong>Último Pago:</strong>{' '}
                  {subscription.lastPaymentDate
                    ? new Date(subscription.lastPaymentDate).toLocaleDateString('es-AR')
                    : 'Sin pagos registrados'}
                </p>
                {subscription.cancellationDate && (
                  <p><strong>Cancelada el:</strong> {new Date(subscription.cancellationDate).toLocaleDateString('es-AR')}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button
                onClick={() => (window.location.href = `mailto:${customer.email}`)}
                className="bg-aurora-terracotta text-white px-6 py-3 rounded-lg font-semibold hover:bg-aurora-terracottaDark transition-colors"
              >
                Contactar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-8 mb-8">
        <h3 className="text-2xl font-bold mb-4 text-aurora-navy">Cobros</h3>
        {payments.length === 0 ? (
          <p className="text-aurora-navy/60">Todavía no hay cobros registrados para esta suscripción.</p>
        ) : (
          <ul className="divide-y divide-aurora-navy/10">
            {payments.map((payment) => {
              const isCash = payment.paymentMethodCode === 'efectivo';
              const canSettle = isCash && payment.paymentStatus === 'Pendiente';
              const busy = settlingId === payment.id;
              return (
                <li key={payment.id} className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-aurora-navy">{money(payment.totalAmountPaid)}</p>
                    <p className="text-xs text-aurora-navy/60">
                      {new Date(payment.paymentDate).toLocaleDateString('es-AR')}
                      {isCash ? ' · Efectivo contra entrega' : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${paymentBadge[payment.paymentStatus]}`}>
                      {payment.paymentStatus === 'Pendiente' && isCash ? 'A cobrar en la entrega' : payment.paymentStatus}
                    </span>
                    {canSettle && rejectingId !== payment.id && (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => settle(payment.id, 'confirm')}
                          className="min-h-[44px] rounded-lg bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {busy ? 'Guardando...' : 'Confirmar cobro'}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setRejectingId(payment.id)}
                          className="min-h-[44px] rounded-lg border border-red-300 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          No se cobró
                        </button>
                      </>
                    )}
                    {canSettle && rejectingId === payment.id && (
                      <>
                        <span className="text-sm text-aurora-navy/70">¿Marcar como no cobrado?</span>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => settle(payment.id, 'reject')}
                          className="min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {busy ? 'Guardando...' : 'Sí, no se cobró'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingId(null)}
                          className="min-h-[44px] rounded-lg border border-aurora-navy/20 px-4 text-sm font-semibold text-aurora-navy hover:bg-aurora-cream"
                        >
                          Volver
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-8 mb-8">
        <h3 className="text-2xl font-bold mb-4 text-aurora-navy">Historial de Envíos</h3>
        <p className="text-aurora-navy/60">Esta sección estará disponible próximamente.</p>
      </div>
    </div>
  );
};

export default SubscriptionDetailForEntrepreneurPage;