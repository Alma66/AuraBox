import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../App';
import FinancialSidebar from '../../../../components/entrepreneur/FinancialSidebar';
import ConfirmDialog from '../../../../components/admin/ConfirmDialog';
import api, { getResponseData } from '../../../../api/config';
import { FinancialMovement, MonthlyTotal, FinanceSummary } from '../../../../types/financial';

const CATEGORY_OPTIONS = ['Sueldos', 'Alquiler', 'Impuestos', 'Marketing', 'Servicios', 'Reembolsos', 'Otros'];
const MAX_AMOUNT = 99999999;

const emptyForm = {
  type: 'Egreso' as 'Ingreso' | 'Egreso',
  category: 'Otros',
  description: '',
  amount: '',
  entryDate: '',
};

const money = (value: number) => `$${value.toLocaleString('es-AR')}`;

const inputClass =
  'min-h-[44px] w-full rounded-lg border border-aurora-navy/15 bg-white px-3 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40';

const FinancialMovementsPage: React.FC = () => {
  const { user, userRole } = useAuth();
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const actualClubId = clubId || user?.managedClubId;
  const [clubName, setClubName] = useState('Tu Club');

  const [movements, setMovements] = useState<FinancialMovement[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<Record<string, MonthlyTotal>>({});
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FinancialMovement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!actualClubId) return;
    setLoading(true);
    setFailed(false);
    try {
      const [clubResponse, financeResponse] = await Promise.all([
        api.get(`/clubs/${actualClubId}`),
        api.get(`/finance/movements/by-club/${actualClubId}`),
      ]);
      setClubName(getResponseData(clubResponse).name || 'Tu Club');
      const data = getResponseData(financeResponse);
      setMovements(data.movements || []);
      setMonthlyTotals(data.monthlyTotals || {});
      setSummary(data.summary || null);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [actualClubId]);

  useEffect(() => {
    if (userRole !== 'entrepreneur' || !actualClubId) {
      navigate('/');
      return;
    }
    fetchData();
  }, [actualClubId, userRole, navigate, fetchData]);

  const categories = useMemo(() => Array.from(new Set(movements.map((m) => m.category))), [movements]);

  const filteredMovements = useMemo(() => {
    let filtered = [...movements];
    if (activeFilter === 'ingresos') filtered = filtered.filter((m) => m.type === 'Ingreso');
    else if (activeFilter === 'egresos') filtered = filtered.filter((m) => m.type === 'Egreso');
    else if (activeFilter !== 'all') filtered = filtered.filter((m) => m.category === activeFilter);

    if (dateFrom) filtered = filtered.filter((m) => new Date(m.date) >= new Date(dateFrom));
    if (dateTo) filtered = filtered.filter((m) => new Date(m.date) <= new Date(dateTo + 'T23:59:59'));
    if (statusFilter !== 'todos') filtered = filtered.filter((m) => m.status === statusFilter);
    if (search.trim()) filtered = filtered.filter((m) => m.description.toLowerCase().includes(search.trim().toLowerCase()));

    return filtered;
  }, [movements, activeFilter, dateFrom, dateTo, statusFilter, search]);

  const handleDateFilterChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const toggleForm = () => {
    setShowForm((current) => !current);
    setFormError('');
  };

  const createEntry = async () => {
    if (saving) return;
    const description = form.description.trim();
    const amount = Number(form.amount);

    if (!description) {
      setFormError('Completá la descripción.');
      return;
    }
    if (!form.amount || !Number.isFinite(amount) || amount <= 0) {
      setFormError('Ingresá un monto mayor a 0.');
      return;
    }
    if (amount > MAX_AMOUNT) {
      setFormError('El monto es demasiado alto.');
      return;
    }

    setFormError('');
    setSaving(true);
    try {
      await api.post('/finance/entries', {
        idClub: Number(actualClubId),
        type: form.type,
        category: form.category,
        description,
        amount: Math.round(amount * 100) / 100,
        entryDate: form.entryDate || undefined,
      });
      setForm(emptyForm);
      setShowForm(false);
      toast.success('Movimiento agregado correctamente');
      await fetchData();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setFormError(typeof message === 'string' ? message : 'No se pudo crear el movimiento. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id.startsWith('manual-')) return;
    setDeleting(true);
    try {
      await api.delete(`/finance/entries/${deleteTarget.id.replace('manual-', '')}`);
      toast.success('Movimiento eliminado');
      setDeleteTarget(null);
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'No se pudo eliminar el movimiento.');
    } finally {
      setDeleting(false);
    }
  };

  const exportCsv = () => {
    const header = ['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto', 'Estado'];
    const rows = filteredMovements.map((m) => [
      new Date(m.date).toLocaleDateString('es-AR'),
      m.description,
      m.category,
      m.type,
      m.amount,
      m.status,
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'caja-y-movimientos.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !summary && movements.length === 0) {
    return (
      <div className="animate-pulse space-y-6 px-4 py-6 lg:px-8" aria-busy="true">
        <div className="h-8 w-72 rounded bg-aurora-navy/10" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-24 rounded-xl bg-aurora-navy/10" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-aurora-navy/10" />
      </div>
    );
  }

  if (failed) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">No pudimos cargar tus movimientos financieros.</p>
          <p className="mt-1">Tus datos no se perdieron. Revisá tu conexión e intentá de nuevo.</p>
          <button
            type="button"
            onClick={fetchData}
            className="mt-4 min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <h1 className="mb-8 font-display text-2xl font-bold text-aurora-navy">Caja y Movimientos — {clubName}</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-1/4">
          <FinancialSidebar
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            categories={categories}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFilterChange={handleDateFilterChange}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>

        <div className={`rounded-xl border border-aurora-navy/10 bg-white p-6 shadow-aurora-sm transition-opacity lg:w-3/4 ${loading ? 'opacity-60' : ''}`}>
          {summary && (
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-emerald-50 p-4 text-center">
                <p className="text-xl font-bold text-emerald-700">{money(summary.totalIngresos)}</p>
                <p className="mt-1 text-xs text-aurora-navy/60">Ingresos totales</p>
              </div>
              <div className="rounded-xl bg-red-50 p-4 text-center">
                <p className="text-xl font-bold text-red-700">{money(summary.totalEgresos)}</p>
                <p className="mt-1 text-xs text-aurora-navy/60">Egresos totales</p>
              </div>
              <div className="rounded-xl bg-aurora-navy/10 p-4 text-center">
                <p className="text-xl font-bold text-aurora-navy">{money(summary.balance)}</p>
                <p className="mt-1 text-xs text-aurora-navy/60">Balance neto</p>
              </div>
              <div className="rounded-xl bg-aurora-gold/10 p-4 text-center">
                <p className="text-xl font-bold text-aurora-terracottaDark">{money(summary.totalAuraboxCommission)}</p>
                <p className="mt-1 text-xs text-aurora-navy/60">Comisión AuraBox pagada</p>
              </div>
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-aurora-navy">Movimientos ({filteredMovements.length})</h2>
            <div className="flex flex-wrap gap-2">
              <label htmlFor="movement-search" className="sr-only">
                Buscar por descripción
              </label>
              <input
                id="movement-search"
                type="search"
                placeholder="Buscar por descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-h-[44px] rounded-lg border border-aurora-navy/15 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
              />
              <button
                type="button"
                onClick={exportCsv}
                disabled={filteredMovements.length === 0}
                className="min-h-[44px] rounded-lg bg-aurora-cream px-4 text-sm font-medium text-aurora-navy transition-colors hover:bg-aurora-creamDark disabled:cursor-not-allowed disabled:opacity-50"
              >
                Exportar CSV
              </button>
              <button
                type="button"
                onClick={toggleForm}
                aria-expanded={showForm}
                className="min-h-[44px] rounded-lg bg-aurora-navy px-4 text-sm font-medium text-white transition-colors hover:bg-aurora-navy/90"
              >
                {showForm ? 'Cancelar' : 'Agregar movimiento manual'}
              </button>
            </div>
          </div>

          {showForm && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                createEntry();
              }}
              noValidate
              className="mb-6 space-y-3 rounded-xl border border-aurora-navy/10 bg-aurora-cream/40 p-4"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label htmlFor="entry-type" className="mb-1 block text-xs font-semibold text-aurora-navy/70">
                    Tipo
                  </label>
                  <select
                    id="entry-type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'Ingreso' | 'Egreso' })}
                    className={inputClass}
                  >
                    <option value="Egreso">Egreso</option>
                    <option value="Ingreso">Ingreso</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="entry-category" className="mb-1 block text-xs font-semibold text-aurora-navy/70">
                    Categoría
                  </label>
                  <select
                    id="entry-category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={inputClass}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="entry-description" className="mb-1 block text-xs font-semibold text-aurora-navy/70">
                  Descripción
                </label>
                <input
                  id="entry-description"
                  type="text"
                  maxLength={200}
                  placeholder="Ej: Pago de alquiler del local"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="entry-amount" className="mb-1 block text-xs font-semibold text-aurora-navy/70">
                    Monto (ARS)
                  </label>
                  <input
                    id="entry-amount"
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    max={MAX_AMOUNT}
                    step="0.01"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="entry-date" className="mb-1 block text-xs font-semibold text-aurora-navy/70">
                    Fecha (opcional)
                  </label>
                  <input
                    id="entry-date"
                    type="date"
                    value={form.entryDate}
                    onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              {formError && (
                <p role="alert" className="text-sm font-medium text-red-600">
                  {formError}
                </p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="min-h-[44px] rounded-lg bg-aurora-terracotta px-5 text-sm font-semibold text-white transition-colors hover:bg-aurora-terracottaDark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar movimiento'}
              </button>
            </form>
          )}

          <div className="mb-8 overflow-x-auto rounded-xl border border-aurora-navy/10">
            <table className="min-w-full divide-y divide-aurora-navy/10">
              <thead className="bg-aurora-cream">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase text-aurora-navy/60">Fecha</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase text-aurora-navy/60">Descripción</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase text-aurora-navy/60">Categoría</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase text-aurora-navy/60">Tipo</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase text-aurora-navy/60">Monto</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase text-aurora-navy/60">Estado</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase text-aurora-navy/60">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurora-navy/10">
                {filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-aurora-cream/60">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-aurora-navy/80">{new Date(m.date).toLocaleDateString('es-AR')}</td>
                    <td className="px-4 py-3 text-sm text-aurora-navy">{m.description}</td>
                    <td className="px-4 py-3 text-sm text-aurora-navy/70">{m.category}</td>
                    <td className="px-4 py-3 text-sm text-aurora-navy/70">{m.type}</td>
                    <td className={`whitespace-nowrap px-4 py-3 text-right text-sm font-medium ${m.type === 'Ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {m.type === 'Ingreso' ? '+' : '-'}
                      {money(m.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-aurora-navy/10 px-2 py-1 text-xs font-semibold text-aurora-navy">{m.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.editable ? (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(m)}
                          aria-label={`Eliminar movimiento ${m.description}`}
                          className="min-h-[44px] px-2 text-xs font-medium text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      ) : (
                        <span className="text-xs text-aurora-navy/40">Automático</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMovements.length === 0 && <p className="py-12 text-center text-aurora-navy/50">No hay movimientos para mostrar.</p>}
          </div>

          <h3 className="mb-4 font-display text-lg font-bold text-aurora-navy">Totales Mensuales</h3>
          <div className="overflow-x-auto rounded-xl border border-aurora-navy/10">
            <table className="min-w-full divide-y divide-aurora-navy/10">
              <thead className="bg-aurora-cream">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase text-aurora-navy/60">Mes</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase text-aurora-navy/60">Ingresos</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase text-aurora-navy/60">Egresos</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase text-aurora-navy/60">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurora-navy/10">
                {Object.entries(monthlyTotals)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([month, totals]) => (
                    <tr key={month}>
                      <td className="px-4 py-3 text-sm text-aurora-navy">{month}</td>
                      <td className="px-4 py-3 text-right text-sm text-emerald-600">{money(totals.ingresos)}</td>
                      <td className="px-4 py-3 text-right text-sm text-red-600">{money(totals.egresos)}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-aurora-navy">{money(totals.balance)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {Object.keys(monthlyTotals).length === 0 && <p className="py-12 text-center text-aurora-navy/50">No hay datos mensuales todavía.</p>}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar movimiento"
          description={`Se va a eliminar "${deleteTarget.description}". Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          saving={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default FinancialMovementsPage;