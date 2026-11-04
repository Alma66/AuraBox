import React, { useCallback, useEffect, useState } from 'react';
import api, { getResponseData } from '../../api/config';

interface ClubOption {
  id: number;
  name: string;
}

interface PaymentRow {
  id: number;
  paymentDate: string;
  paymentStatus: string;
  total: number;
  clubAmount: number;
  commission: number;
  club: string;
  customer: string | null;
  method: string | null;
  gatewayTransaction: string | null;
}

interface ClubSummary {
  idClub: number;
  club: string;
  count: number;
  total: number;
  clubAmount: number;
  commission: number;
}

interface PaymentsResponse {
  totals: { count: number; total: number; clubAmount: number; commission: number };
  perClub: ClubSummary[];
  payments: PaymentRow[];
  truncated: boolean;
}

const money = (value: number) => `$${value.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`;
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const statusClass = (status: string) => {
  if (status === 'Exitoso') return 'bg-green-100 text-green-700';
  if (status === 'Pendiente') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const KpiCard: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="rounded-2xl border border-aurora-navy/5 bg-white p-5 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-aurora-navy/50">{label}</p>
    <p className="mt-2 font-display text-2xl font-bold text-aurora-navy">{value}</p>
    {hint && <p className="mt-1 text-xs text-aurora-navy/50">{hint}</p>}
  </div>
);

const AdminPaymentsPage: React.FC = () => {
  const [clubs, setClubs] = useState<ClubOption[]>([]);
  const [clubId, setClubId] = useState('');
  const [month, setMonth] = useState('');
  const [data, setData] = useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/clubs')
      .then((response) => {
        const list: ClubOption[] = getResponseData(response) || [];
        setClubs(list.map((club) => ({ id: club.id, name: club.name })));
      })
      .catch(() => setClubs([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (clubId) params.set('clubId', clubId);
      if (month) params.set('month', month);
      const query = params.toString();
      const response = await api.get(`/admin/payments${query ? `?${query}` : ''}`);
      setData(getResponseData(response) as PaymentsResponse);
    } catch {
      setError('No se pudieron cargar los pagos.');
    } finally {
      setLoading(false);
    }
  }, [clubId, month]);

  useEffect(() => {
    load();
  }, [load]);

  const clearFilters = () => {
    setClubId('');
    setMonth('');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-aurora-navy">Pagos y comisiones</h1>
        <p className="text-sm text-aurora-navy/60">
          Pagos simulados de la plataforma. Los totales cuentan solo los pagos exitosos.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-aurora-navy/5 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="payments-club" className="text-xs font-semibold text-aurora-navy/60">Club</label>
          <select
            id="payments-club"
            value={clubId}
            onChange={(event) => setClubId(event.target.value)}
            className="min-h-[44px] rounded-lg border border-aurora-navy/20 bg-white px-3 text-sm text-aurora-navy focus:border-aurora-terracotta focus:ring-aurora-terracotta"
          >
            <option value="">Todos los clubes</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="payments-month" className="text-xs font-semibold text-aurora-navy/60">Mes</label>
          <input
            id="payments-month"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className="min-h-[44px] rounded-lg border border-aurora-navy/20 bg-white px-3 text-sm text-aurora-navy focus:border-aurora-terracotta focus:ring-aurora-terracotta"
          />
        </div>
        {(clubId || month) && (
          <button
            type="button"
            onClick={clearFilters}
            className="min-h-[44px] rounded-lg border border-aurora-navy/20 px-4 text-sm font-semibold text-aurora-navy/70 hover:bg-aurora-cream"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-aurora-terracottaDark" />
          <p className="text-aurora-navy/70">Cargando pagos...</p>
        </div>
      ) : (
        data && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard label="Total cobrado" value={money(data.totals.total)} hint={`${data.totals.count} pagos exitosos`} />
              <KpiCard label="Comisión AuraBox" value={money(data.totals.commission)} />
              <KpiCard label="Corresponde a clubes" value={money(data.totals.clubAmount)} />
              <KpiCard
                label="Ticket promedio"
                value={money(data.totals.count > 0 ? data.totals.total / data.totals.count : 0)}
              />
            </div>

            <section className="mb-8">
              <h2 className="mb-3 font-display text-lg font-bold text-aurora-navy">Por club</h2>
              {data.perClub.length === 0 ? (
                <div className="rounded-2xl bg-white py-10 text-center text-sm text-aurora-navy/60 shadow-sm">
                  No hay pagos exitosos para estos filtros.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-aurora-navy/5 bg-white shadow-sm">
                  <table className="min-w-full text-sm">
                    <thead className="bg-aurora-cream text-left text-xs uppercase tracking-wide text-aurora-navy/60">
                      <tr>
                        <th className="px-4 py-3">Club</th>
                        <th className="px-4 py-3 text-right">Pagos</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-right">Comisión</th>
                        <th className="px-4 py-3 text-right">Para el club</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-aurora-navy/5">
                      {data.perClub.map((row) => (
                        <tr key={row.idClub}>
                          <td className="px-4 py-3 font-semibold text-aurora-navy">{row.club}</td>
                          <td className="px-4 py-3 text-right text-aurora-navy/70">{row.count}</td>
                          <td className="px-4 py-3 text-right text-aurora-navy">{money(row.total)}</td>
                          <td className="px-4 py-3 text-right text-aurora-navy">{money(row.commission)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-aurora-navy">{money(row.clubAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-3 font-display text-lg font-bold text-aurora-navy">Detalle de pagos</h2>
              {data.payments.length === 0 ? (
                <div className="rounded-2xl bg-white py-10 text-center text-sm text-aurora-navy/60 shadow-sm">
                  No hay pagos para estos filtros.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-2xl border border-aurora-navy/5 bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                      <thead className="bg-aurora-cream text-left text-xs uppercase tracking-wide text-aurora-navy/60">
                        <tr>
                          <th className="px-4 py-3">Fecha</th>
                          <th className="px-4 py-3">Club</th>
                          <th className="px-4 py-3">Cliente</th>
                          <th className="px-4 py-3">Método</th>
                          <th className="px-4 py-3">Estado</th>
                          <th className="px-4 py-3 text-right">Total</th>
                          <th className="px-4 py-3 text-right">Comisión</th>
                          <th className="px-4 py-3">Operación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-aurora-navy/5">
                        {data.payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="whitespace-nowrap px-4 py-3 text-aurora-navy/70">{formatDate(payment.paymentDate)}</td>
                            <td className="px-4 py-3 font-medium text-aurora-navy">{payment.club}</td>
                            <td className="px-4 py-3 text-aurora-navy/70">{payment.customer || '—'}</td>
                            <td className="px-4 py-3 text-aurora-navy/70">{payment.method || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(payment.paymentStatus)}`}>
                                {payment.paymentStatus}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right text-aurora-navy">{money(payment.total)}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-right text-aurora-navy">{money(payment.commission)}</td>
                            <td className="px-4 py-3 font-mono text-xs text-aurora-navy/50">{payment.gatewayTransaction || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {data.truncated && (
                    <p className="mt-3 text-center text-xs text-aurora-navy/50">
                      Se muestran los 200 pagos más recientes. Los totales incluyen todos. Usá los filtros para acotar.
                    </p>
                  )}
                </>
              )}
            </section>
          </>
        )
      )}
    </div>
  );
};

export default AdminPaymentsPage;