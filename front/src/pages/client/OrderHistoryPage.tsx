import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import api, { getResponseData } from '../../api/config';
import Reveal from '../../components/common/Reveal';

interface PaymentEntry {
  id: number;
  idUserSubscription: number;
  idUser: number;
  idClub: number;
  idPaymentMethods?: number | null;
  totalAmountPaid: string;
  paymentDate: string;
  paymentStatus: 'Exitoso' | 'Pendiente' | 'Rechazado' | 'Reembolsado';
}

interface ShipmentEntry {
  id: number;
  idUser: number;
  idUserSubscriptions: number;
  idClub?: number | null;
  boxMonthYear: string;
  shipmentStatus: 'Pendiente' | 'Asignado' | 'En_Camino' | 'Entregado' | 'Problema' | 'Devuelto';
  trackingNumber?: string | null;
  estimatedDeliveryStartDate?: string | null;
  estimatedDeliveryEndDate?: string | null;
  actualDeliveryDate?: string | null;
}

interface ClubInfo {
  id: number;
  name: string;
  logoUrl?: string;
}

const PAYMENT_STATUS_COLORS: Record<PaymentEntry['paymentStatus'], string> = {
  Exitoso: 'bg-green-100 text-green-700',
  Pendiente: 'bg-yellow-100 text-yellow-700',
  Rechazado: 'bg-red-100 text-red-700',
  Reembolsado: 'bg-aurora-terracotta/10 text-aurora-terracottaDark',
};

const PAYMENT_STATUS_LABELS: Record<PaymentEntry['paymentStatus'], string> = {
  Exitoso: 'Exitoso',
  Pendiente: 'Pendiente',
  Rechazado: 'Rechazado',
  Reembolsado: 'Reembolsado',
};

const SHIPMENT_STATUS_COLORS: Record<ShipmentEntry['shipmentStatus'], string> = {
  Pendiente: 'bg-aurora-navy/10 text-aurora-navy/80',
  Asignado: 'bg-aurora-terracotta/10 text-aurora-terracottaDark',
  En_Camino: 'bg-aurora-terracotta/10 text-aurora-terracottaDark',
  Entregado: 'bg-green-100 text-green-700',
  Problema: 'bg-red-100 text-red-700',
  Devuelto: 'bg-orange-100 text-orange-700',
};

const SHIPMENT_STATUS_LABELS: Record<ShipmentEntry['shipmentStatus'], string> = {
  Pendiente: 'Pendiente',
  Asignado: 'Asignado',
  En_Camino: 'En Camino',
  Entregado: 'Entregado',
  Problema: 'Problema',
  Devuelto: 'Devuelto',
};

const OrderHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'payments' | 'shipments'>('payments');
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [shipments, setShipments] = useState<ShipmentEntry[]>([]);
  const [clubs, setClubs] = useState<Record<number, ClubInfo>>({});
  const [paymentMethods, setPaymentMethods] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [paymentsRes, shipmentsRes, pmRes] = await Promise.all([
          api.get(`/payments/by-user/${user.id}`),
          api.get(`/shipments/by-user/${user.id}`),
          api.get('/payment-methods/active'),
        ]);

        const paymentsData: PaymentEntry[] = getResponseData(paymentsRes) || [];
        const shipmentsData: ShipmentEntry[] = getResponseData(shipmentsRes) || [];
        const pmData: { id: number; method: string }[] = getResponseData(pmRes) || [];

        setPayments(paymentsData);
        setShipments(shipmentsData);

        const pmMap: Record<number, string> = {};
        pmData.forEach((pm) => { pmMap[pm.id] = pm.method; });
        setPaymentMethods(pmMap);

        const clubIds = Array.from(new Set([
          ...paymentsData.map((p) => p.idClub),
          ...shipmentsData.map((s) => s.idClub).filter((id): id is number => !!id),
        ]));
        const clubsResults = await Promise.all(
          clubIds.map((id) => api.get(`/clubs/${id}`).then((r) => getResponseData(r)).catch(() => null))
        );
        const clubsMap: Record<number, ClubInfo> = {};
        clubsResults.forEach((c) => { if (c) clubsMap[c.id] = c; });
        setClubs(clubsMap);
      } catch {
        setError('Error al cargar tu historial.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const sortedPayments = useMemo(
    () => [...payments].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()),
    [payments]
  );
  const sortedShipments = useMemo(
    () => [...shipments].sort((a, b) => b.boxMonthYear.localeCompare(a.boxMonthYear)),
    [shipments]
  );

  const formatDate = (date?: string | null) => date ? new Date(date).toLocaleDateString('es-AR') : '—';
  const formatPrice = (amount: string) => `$${Number(amount).toLocaleString('es-AR')} ARS`;

  const totalPaid = payments
    .filter((p) => p.paymentStatus === 'Exitoso')
    .reduce((sum, p) => sum + Number(p.totalAmountPaid), 0);

  const tabClass = (active: boolean) =>
    `rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${
      active ? 'bg-aurora-terracotta text-white shadow-aurora-sm' : 'text-aurora-navy/70 hover:bg-aurora-cream'
    }`;

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora-cream px-4 py-16">
        <div role="status" className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
          <p className="text-aurora-navy/70">Cargando tu historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div className="hero-mesh grain relative overflow-hidden">
        <div className="container relative mx-auto px-4 pb-24 pt-12 md:pb-28">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-aurora-goldLight">Tu cuenta</span>
          <h1 className="font-display text-4xl font-normal leading-tight text-white md:text-6xl">Historial de compras</h1>
          <p className="mt-3 max-w-xl text-lg text-white/80">
            {user ? `Hola, ${user.firstName}. ` : ''}Revisá tus pagos y el estado de tus envíos.
          </p>
          {(payments.length > 0 || shipments.length > 0) && (
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="glass rounded-full px-4 py-1.5 text-sm font-semibold text-white">
                {payments.length} {payments.length === 1 ? 'pago' : 'pagos'}
              </span>
              <span className="glass rounded-full px-4 py-1.5 text-sm text-white">
                {shipments.length} {shipments.length === 1 ? 'envío' : 'envíos'}
              </span>
              {totalPaid > 0 && (
                <span className="glass rounded-full px-4 py-1.5 text-sm text-white">Total pagado: {formatPrice(String(totalPaid))}</span>
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

        <div role="tablist" aria-label="Historial" className="mx-auto mb-8 flex w-fit gap-2 rounded-full bg-white p-2 shadow-aurora-sm ring-1 ring-aurora-navy/5">
          <button role="tab" aria-selected={tab === 'payments'} onClick={() => setTab('payments')} className={tabClass(tab === 'payments')}>
            Pagos ({payments.length})
          </button>
          <button role="tab" aria-selected={tab === 'shipments'} onClick={() => setTab('shipments')} className={tabClass(tab === 'shipments')}>
            Envíos ({shipments.length})
          </button>
        </div>

        {tab === 'payments' && (
          sortedPayments.length === 0 ? (
            <Reveal>
              <div className="mx-auto max-w-2xl rounded-3xl bg-white p-12 text-center shadow-aurora ring-1 ring-aurora-navy/5">
                <h2 className="mb-2 font-display text-3xl font-medium text-aurora-navy">Sin pagos todavía</h2>
                <p className="text-aurora-navy/60">Cuando te suscribas a un plan, tus pagos van a aparecer acá.</p>
              </div>
            </Reveal>
          ) : (
            <ul className="space-y-3">
              {sortedPayments.map((payment) => {
                const club = clubs[payment.idClub];
                const pmName = payment.idPaymentMethods ? paymentMethods[payment.idPaymentMethods] : undefined;
                return (
                  <li key={payment.id} className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-aurora-sm ring-1 ring-aurora-navy/5 transition-shadow duration-200 hover:shadow-aurora md:p-5">
                    <img
                      src={club?.logoUrl || '/assets/default-club.svg'}
                      alt={club?.name || 'Club'}
                      className="h-14 w-14 flex-shrink-0 rounded-2xl border border-aurora-navy/10 bg-white object-cover"
                    />
                    <div className="min-w-0 flex-grow">
                      <p className="truncate font-display text-xl font-medium text-aurora-navy">{club?.name || 'Club'}</p>
                      <p className="text-xs text-aurora-navy/60">{formatDate(payment.paymentDate)} · {pmName || 'Método no especificado'}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-display text-xl font-medium text-aurora-navy">{formatPrice(payment.totalAmountPaid)}</p>
                      <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${PAYMENT_STATUS_COLORS[payment.paymentStatus]}`}>
                        {payment.paymentStatus === 'Pendiente' && pmName?.toLowerCase().includes('efectivo')
                          ? 'A pagar al recibir'
                          : PAYMENT_STATUS_LABELS[payment.paymentStatus]}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        )}

        {tab === 'shipments' && (
          sortedShipments.length === 0 ? (
            <Reveal>
              <div className="mx-auto max-w-2xl rounded-3xl bg-white p-12 text-center shadow-aurora ring-1 ring-aurora-navy/5">
                <h2 className="mb-2 font-display text-3xl font-medium text-aurora-navy">Sin envíos todavía</h2>
                <p className="text-aurora-navy/60">Cuando el club prepare tu caja, vas a poder seguir el envío desde acá.</p>
              </div>
            </Reveal>
          ) : (
            <ul className="space-y-3">
              {sortedShipments.map((shipment) => {
                const club = shipment.idClub ? clubs[shipment.idClub] : undefined;
                return (
                  <li key={shipment.id} className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-aurora-sm ring-1 ring-aurora-navy/5 transition-shadow duration-200 hover:shadow-aurora md:p-5">
                    <img
                      src={club?.logoUrl || '/assets/default-club.svg'}
                      alt={club?.name || 'Club'}
                      className="h-14 w-14 flex-shrink-0 rounded-2xl border border-aurora-navy/10 bg-white object-cover"
                    />
                    <div className="min-w-0 flex-grow">
                      <p className="truncate font-display text-xl font-medium text-aurora-navy">{club?.name || 'Club'}</p>
                      <p className="text-xs text-aurora-navy/60">
                        Caja {shipment.boxMonthYear}
                        {shipment.trackingNumber && ` · Seguimiento: ${shipment.trackingNumber}`}
                      </p>
                      {(shipment.estimatedDeliveryStartDate || shipment.actualDeliveryDate) && (
                        <p className="mt-0.5 text-xs text-aurora-navy/50">
                          {shipment.actualDeliveryDate
                            ? `Entregado el ${formatDate(shipment.actualDeliveryDate)}`
                            : `Estimado: ${formatDate(shipment.estimatedDeliveryStartDate)} - ${formatDate(shipment.estimatedDeliveryEndDate)}`}
                        </p>
                      )}
                    </div>
                    <span className={`inline-block flex-shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold ${SHIPMENT_STATUS_COLORS[shipment.shipmentStatus]}`}>
                      {SHIPMENT_STATUS_LABELS[shipment.shipmentStatus]}
                    </span>
                  </li>
                );
              })}
            </ul>
          )
        )}

        <div className="mt-12 text-center">
          <button onClick={() => navigate('/customer/subscriptions')} className="btn-primary btn-shine">
            Ver mis suscripciones
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;