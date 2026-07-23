import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
      alert('Completá la descripción y el monto');
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
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Error al crear el movimiento');
    }
  };

  const deleteEntry = async (movementId: string) => {
    if (!movementId.startsWith('manual-')) return;
    if (!window.confirm('¿Eliminar este movimiento?')) return;
    try {
      await api.delete(`/finance/entries/${movementId.replace('manual-', '')}`);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el movimiento');
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
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'caja-y-movimientos.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Cargando movimientos financieros...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Caja y Movimientos — {clubName}</h1>

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

        <div className="lg:w-3/4 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-emerald-700">${summary.totalIngresos.toLocaleString('es-AR')}</p>
                <p className="text-xs text-gray-600 mt-1">Ingresos totales</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-red-700">${summary.totalEgresos.toLocaleString('es-AR')}</p>
                <p className="text-xs text-gray-600 mt-1">Egresos totales</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-blue-700">${summary.balance.toLocaleString('es-AR')}</p>
                <p className="text-xs text-gray-600 mt-1">Balance neto</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-amber-700">${summary.totalAuraboxCommission.toLocaleString('es-AR')}</p>
                <p className="text-xs text-gray-600 mt-1">Comisión AuraBox pagada</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-900">Movimientos ({filteredMovements.length})</h2>
            <div className="flex gap-2">
              <input type="text" placeholder="Buscar por descripción..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <button onClick={exportCsv} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">
                Exportar CSV
              </button>
              <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                {showForm ? 'Cancelar' : 'Agregar movimiento manual'}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'Ingreso' | 'Egreso' })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="Egreso">Egreso</option>
                  <option value="Ingreso">Ingreso</option>
                </select>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <input type="text" placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Monto" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input type="date" value={form.entryDate} onChange={(e) => setForm({ ...form, entryDate: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <button onClick={createEntry} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700">
                Guardar movimiento
              </button>
            </div>
          )}

          <div className="overflow-x-auto border border-gray-200 rounded-xl mb-8">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{new Date(m.date).toLocaleDateString('es-AR')}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{m.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.type}</td>
                    <td className={`px-4 py-3 text-sm font-medium text-right whitespace-nowrap ${m.type === 'Ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {m.type === 'Ingreso' ? '+' : '-'}${m.amount.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{m.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.editable ? (
                        <button onClick={() => deleteEntry(m.id)} className="text-xs font-medium text-red-600 hover:text-red-800">Eliminar</button>
                      ) : (
                        <span className="text-xs text-gray-400">Automático</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMovements.length === 0 && <p className="text-center py-12 text-gray-500">No hay movimientos para mostrar.</p>}
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-4">Totales Mensuales</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mes</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ingresos</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Egresos</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(monthlyTotals)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([month, totals]) => (
                    <tr key={month}>
                      <td className="px-4 py-3 text-sm text-gray-900">{month}</td>
                      <td className="px-4 py-3 text-sm text-emerald-600 text-right">${totals.ingresos.toLocaleString('es-AR')}</td>
                      <td className="px-4 py-3 text-sm text-red-600 text-right">${totals.egresos.toLocaleString('es-AR')}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">${totals.balance.toLocaleString('es-AR')}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {Object.keys(monthlyTotals).length === 0 && <p className="text-center py-12 text-gray-500">No hay datos mensuales todavía.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialMovementsPage;