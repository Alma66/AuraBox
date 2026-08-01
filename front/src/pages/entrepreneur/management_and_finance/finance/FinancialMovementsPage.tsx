import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../App';
import FinancialSidebar from '../../../../components/entrepreneur/FinancialSidebar';
import api, { getResponseData } from '../../../../api/config';
import { FinancialMovement, MonthlyTotal, FinanceSummary } from '../../../../types/financial';

const CATEGORY_OPTIONS = ['Sueldos', 'Alquiler', 'Impuestos', 'Marketing', 'Servicios', 'Reembolsos', 'Otros'];

const emptyForm = {
  type: 'Egreso' as 'Ingreso' | 'Egreso',
  category: 'Otros',
  description: '',
  amount: '',
  entryDate: '',
};

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
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchData = useCallback(async () => {
    if (!actualClubId) return;
    setLoading(true);
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
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('No se pudieron cargar los datos financieros');
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

  const createEntry = async () => {
    if (!form.description.trim() || !form.amount) {
      toast.error('Completá la descripción y el monto');
      return;
    }
    try {
      await api.post('/finance/entries', {
        idClub: Number(actualClubId),
        type: form.type,
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        entryDate: form.entryDate || undefined,
      });
      setForm(emptyForm);
      setShowForm(false);
      toast.success('Movimiento agregado correctamente');
      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Error al crear el movimiento');
    }
  };

  const deleteEntry = (movementId: string) => {
  if (!movementId.startsWith('manual-')) return;
  toast((t) => (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">¿Eliminar este movimiento?</p>
      <div className="flex gap-2 justify-end">
        <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancelar
        </button>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await api.delete(`/finance/entries/${movementId.replace('manual-', '')}`);
              toast.success('Movimiento eliminado');
              await fetchData();
            } catch (err) {
              console.error(err);
              toast.error('Error al eliminar el movimiento');
            }
          }}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Eliminar
        </button>
      </div>
    </div>
  ), { duration: Infinity });
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
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'caja-y-movimientos.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-center py-20 text-aurora-navy/60">Cargando movimientos financieros...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <h1 className="text-2xl font-serif font-bold text-aurora-navy mb-8">Caja y Movimientos — {clubName}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
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

        <div className="lg:w-3/4 bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6">
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-emerald-700">${summary.totalIngresos.toLocaleString('es-AR')}</p>
                <p className="text-xs text-aurora-navy/60 mt-1">Ingresos totales</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-red-700">${summary.totalEgresos.toLocaleString('es-AR')}</p>
                <p className="text-xs text-aurora-navy/60 mt-1">Egresos totales</p>
              </div>
              <div className="bg-aurora-navy/10 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-aurora-navy">${summary.balance.toLocaleString('es-AR')}</p>
                <p className="text-xs text-aurora-navy/60 mt-1">Balance neto</p>
              </div>
              <div className="bg-aurora-gold/10 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-aurora-terracottaDark">${summary.totalAuraboxCommission.toLocaleString('es-AR')}</p>
                <p className="text-xs text-aurora-navy/60 mt-1">Comisión AuraBox pagada</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="text-lg font-serif font-bold text-aurora-navy">Movimientos ({filteredMovements.length})</h2>
            <div className="flex gap-2">
              <input type="text" placeholder="Buscar por descripción..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aurora-navy/30 focus:border-aurora-navy" />
              <button onClick={exportCsv} className="px-4 py-2 bg-aurora-cream text-aurora-navy text-sm font-medium rounded-lg hover:bg-aurora-creamDark transition-colors">
                Exportar CSV
              </button>
              <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-aurora-navy text-white text-sm font-medium rounded-lg hover:bg-aurora-navy/90 transition-colors">
                {showForm ? 'Cancelar' : 'Agregar movimiento manual'}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="border border-aurora-navy/10 rounded-xl p-4 mb-6 space-y-3 bg-aurora-cream/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'Ingreso' | 'Egreso' })} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm">
                  <option value="Egreso">Egreso</option>
                  <option value="Ingreso">Ingreso</option>
                </select>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm">
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <input type="text" placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Monto" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm" />
                <input type="date" value={form.entryDate} onChange={(e) => setForm({ ...form, entryDate: e.target.value })} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm" />
              </div>
              <button onClick={createEntry} className="px-4 py-2 bg-aurora-terracotta text-white text-sm font-medium rounded-lg hover:bg-aurora-terracottaDark transition-colors">
                Guardar movimiento
              </button>
            </div>
          )}

          <div className="overflow-x-auto border border-aurora-navy/10 rounded-xl mb-8">
            <table className="min-w-full divide-y divide-aurora-navy/10">
              <thead className="bg-aurora-cream">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-aurora-navy/60 uppercase">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-aurora-navy/60 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurora-navy/10">
                {filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-aurora-cream/60">
                    <td className="px-4 py-3 text-sm text-aurora-navy/80 whitespace-nowrap">{new Date(m.date).toLocaleDateString('es-AR')}</td>
                    <td className="px-4 py-3 text-sm text-aurora-navy">{m.description}</td>
                    <td className="px-4 py-3 text-sm text-aurora-navy/70">{m.category}</td>
                    <td className="px-4 py-3 text-sm text-aurora-navy/70">{m.type}</td>
                    <td className={`px-4 py-3 text-sm font-medium text-right whitespace-nowrap ${m.type === 'Ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {m.type === 'Ingreso' ? '+' : '-'}${m.amount.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-aurora-navy/10 text-aurora-navy">{m.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.editable ? (
                        <button onClick={() => deleteEntry(m.id)} className="text-xs font-medium text-red-600 hover:text-red-800">Eliminar</button>
                      ) : (
                        <span className="text-xs text-aurora-navy/40">Automático</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMovements.length === 0 && <p className="text-center py-12 text-aurora-navy/50">No hay movimientos para mostrar.</p>}
          </div>

          <h3 className="text-lg font-serif font-bold text-aurora-navy mb-4">Totales Mensuales</h3>
          <div className="overflow-x-auto border border-aurora-navy/10 rounded-xl">
            <table className="min-w-full divide-y divide-aurora-navy/10">
              <thead className="bg-aurora-cream">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Mes</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-aurora-navy/60 uppercase">Ingresos</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-aurora-navy/60 uppercase">Egresos</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-aurora-navy/60 uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurora-navy/10">
                {Object.entries(monthlyTotals)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([month, totals]) => (
                    <tr key={month}>
                      <td className="px-4 py-3 text-sm text-aurora-navy">{month}</td>
                      <td className="px-4 py-3 text-sm text-emerald-600 text-right">${totals.ingresos.toLocaleString('es-AR')}</td>
                      <td className="px-4 py-3 text-sm text-red-600 text-right">${totals.egresos.toLocaleString('es-AR')}</td>
                      <td className="px-4 py-3 text-sm font-medium text-aurora-navy text-right">${totals.balance.toLocaleString('es-AR')}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {Object.keys(monthlyTotals).length === 0 && <p className="text-center py-12 text-aurora-navy/50">No hay datos mensuales todavía.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialMovementsPage;