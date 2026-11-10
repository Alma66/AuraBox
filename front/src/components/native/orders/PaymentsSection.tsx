import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import { ClubSummary, getClubSummary } from '../../../utils/dataCache';
import { formatDate } from '../../../utils/format';
import { formatMoney } from '../../../utils/money';
import { tapFeedback } from '../../../utils/native';
import SafeImage from '../../common/SafeImage';

type PaymentStatus = 'Exitoso' | 'Pendiente' | 'Rechazado' | 'Reembolsado';

interface PaymentEntry {
  id: number;
  idClub: number;
  idPaymentMethods?: number | null;
  totalAmountPaid: string;
  paymentDate: string;
  paymentStatus: PaymentStatus;
}

const PILL_COLORS: Record<PaymentStatus, string> = {
  Exitoso: 'bg-green-100 text-green-700',
  Pendiente: 'bg-yellow-100 text-yellow-700',
  Rechazado: 'bg-red-100 text-red-700',
  Reembolsado: 'bg-aurora-terracotta/15 text-aurora-terracottaDark',
};

const PaymentsSection: React.FC<{ userId: number }> = ({ userId }) => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [clubs, setClubs] = useState<Record<number, ClubSummary>>({});
  const [methods, setMethods] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setFailed(false);
      try {
        const [paymentsResponse, methodsResponse] = await Promise.all([
          api.get(`/payments/by-user/${userId}`),
          api.get('/payment-methods/active').catch(() => null),
        ]);
        const list: PaymentEntry[] = getResponseData(paymentsResponse) || [];
        const methodList: { id: number; method: string }[] = methodsResponse ? getResponseData(methodsResponse) || [] : [];
        const clubIds = Array.from(new Set(list.map((item) => item.idClub)));
        const results = await Promise.all(clubIds.map((id) => getClubSummary(id)));
        if (!active) return;
        const clubMap: Record<number, ClubSummary> = {};
        results.forEach((club) => {
          if (club) clubMap[club.id] = club;
        });
        const methodMap: Record<number, string> = {};
        methodList.forEach((item) => {
          methodMap[item.id] = item.method;
        });
        setPayments(list);
        setClubs(clubMap);
        setMethods(methodMap);
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

  const sorted = useMemo(
    () => [...payments].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()),
    [payments],
  );

  const totalPaid = useMemo(
    () => payments.filter((item) => item.paymentStatus === 'Exitoso').reduce((sum, item) => sum + Number(item.totalAmountPaid || 0), 0),
    [payments],
  );

  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-label="Cargando pagos">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-20 animate-pulse rounded-3xl bg-white shadow-aurora-sm" />
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <div role="alert" className="py-12 text-center">
        <p className="text-5xl" aria-hidden="true">📡</p>
        <h2 className="mt-4 font-display text-xl font-bold text-aurora-navy">No pudimos cargar tus pagos</h2>
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

  if (sorted.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-5xl" aria-hidden="true">🧾</p>
        <h2 className="mt-4 font-display text-xl font-bold text-aurora-navy">Todavía no tenés pagos</h2>
        <p className="mt-1 text-sm text-aurora-navy/60">Tus compras van a aparecer acá.</p>
        <button type="button" onClick={() => navigate('/explore')} className="btn-primary mt-5">
          Explorar clubes
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 rounded-3xl bg-gradient-to-br from-aurora-navy to-aurora-navyLight p-5 text-white shadow-aurora-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/65">Total pagado</p>
        <p className="mt-1 font-display text-3xl font-bold">{formatMoney(totalPaid)}</p>
        <p className="mt-1 text-xs text-white/65">
          {payments.length} {payments.length === 1 ? 'pago registrado' : 'pagos registrados'}
        </p>
      </div>
      <ul className="space-y-3">
        {sorted.map((payment, index) => {
          const club = clubs[payment.idClub];
          const methodName = payment.idPaymentMethods ? methods[payment.idPaymentMethods] : undefined;
          const cashPending = payment.paymentStatus === 'Pendiente' && Boolean(methodName?.toLowerCase().includes('efectivo'));
          return (
            <li
              key={payment.id}
              className="flex animate-fadeInUp items-center gap-3 rounded-3xl bg-white p-4 shadow-aurora-sm ring-1 ring-aurora-navy/5"
              style={{ animationDelay: `${Math.min(index, 6) * 50}ms`, animationFillMode: 'both' }}
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-aurora-navy/10 bg-aurora-cream">
                <SafeImage src={club?.logoUrl} alt={club?.name || 'Club'} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-aurora-navy">{club?.name || 'Club'}</p>
                <p className="truncate text-xs text-aurora-navy/55">
                  {formatDate(payment.paymentDate)} · {methodName || 'Método no especificado'}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-lg font-bold text-aurora-navy">{formatMoney(Number(payment.totalAmountPaid))}</p>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${PILL_COLORS[payment.paymentStatus]}`}>
                  {cashPending ? 'A pagar al recibir' : payment.paymentStatus}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PaymentsSection;