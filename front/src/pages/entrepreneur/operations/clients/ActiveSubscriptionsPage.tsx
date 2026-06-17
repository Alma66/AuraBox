import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../App';
import { Subscription, NormalizedStatus, normalizeStatus } from '../../../../types/subscription';
import { User } from '../../../../types/user';
import { SubscriptionPlan, Club } from '../../../../types/club';
import api, { getResponseData } from '../../../../api/config';

const STATUS_LABEL: Record<NormalizedStatus, string> = {
  active: 'Activa',
  paused: 'Pausada',
  cancelled: 'Cancelada',
  pending: 'Pago pendiente',
  finished: 'Finalizada',
};
const STATUS_COLOR: Record<NormalizedStatus, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  pending: 'bg-orange-100 text-orange-800',
  finished: 'bg-gray-100 text-gray-700',
};
const STATUS_BORDER: Record<NormalizedStatus, string> = {
  active: 'border-green-500',
  paused: 'border-yellow-500',
  cancelled: 'border-red-500',
  pending: 'border-orange-500',
  finished: 'border-gray-400',
};

const ActiveSubscriptionsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [clubPlans, setClubPlans] = useState<SubscriptionPlan[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | NormalizedStatus>('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortField, setSortField] = useState<'customer' | 'plan' | 'startDate' | 'nextPayment' | 'status'>('startDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const managedClubId = clubId || user?.managedClubId;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (userRole !== 'entrepreneur' || !managedClubId) { navigate('/'); return; }
    const fetchData = async () => {
      try {
        const [clubRes, subsRes, customersRes] = await Promise.all([
          api.get(`/clubs/${managedClubId}`),
          api.get(`/clubs/${managedClubId}/user-subscriptions`),
          api.get(`/clubs/${managedClubId}/customers`),
        ]);
        const clubData = getResponseData(clubRes);
        setClub(clubData);
        setClubPlans(clubData?.subscriptionPlans || []);
        setSubscriptions(getResponseData(subsRes) || []);
        setCustomers(getResponseData(customersRes) || []);
      } catch {
        showToast('Error al cargar los datos.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [managedClubId, userRole, navigate]);

  const getCustomer = (idUser: number) => customers.find(c => Number(c.id) === idUser);
  const getPlan = (idType: number) => clubPlans.find(p => Number(p.planId) === idType);

  const filtered = subscriptions
    .filter(sub => {
      const customer = getCustomer(sub.idUser);
      const plan = getPlan(sub.idSubscriptionTypes);
      const name = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : '';
      const email = customer?.email?.toLowerCase() || '';
      const planName = plan?.name?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      const matchSearch = !searchTerm || name.includes(term) || email.includes(term) || planName.includes(term);
      const matchStatus = statusFilter === 'all' || normalizeStatus(sub.subscriptionStatus) === statusFilter;
      const matchPlan = planFilter === 'all' || sub.idSubscriptionTypes === Number(planFilter);
      return matchSearch && matchStatus && matchPlan;
    })
    .sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';
      if (sortField === 'customer') {
        const cA = getCustomer(a.idUser);
        const cB = getCustomer(b.idUser);
        valA = cA ? `${cA.firstName} ${cA.lastName}` : '';
        valB = cB ? `${cB.firstName} ${cB.lastName}` : '';
      } else if (sortField === 'plan') {
        valA = getPlan(a.idSubscriptionTypes)?.name || '';
        valB = getPlan(b.idSubscriptionTypes)?.name || '';
      } else if (sortField === 'startDate') {
        valA = a.startDate || '';
        valB = b.startDate || '';
      } else if (sortField === 'nextPayment') {
        valA = a.nextPaymentDate || '';
        valB = b.nextPaymentDate || '';
      } else if (sortField === 'status') {
        valA = normalizeStatus(a.subscriptionStatus);
        valB = normalizeStatus(b.subscriptionStatus);
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <span className="ml-1 inline-block text-gray-400">
      {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const totalActive = subscriptions.filter(s => normalizeStatus(s.subscriptionStatus) === 'active').length;
  const totalPaused = subscriptions.filter(s => normalizeStatus(s.subscriptionStatus) === 'paused').length;
  const totalPending = subscriptions.filter(s => normalizeStatus(s.subscriptionStatus) === 'pending').length;
  const totalCancelled = subscriptions.filter(s => normalizeStatus(s.subscriptionStatus) === 'cancelled').length;
  const estimatedRevenue = subscriptions
    .filter(s => normalizeStatus(s.subscriptionStatus) === 'active')
    .reduce((sum, sub) => sum + (getPlan(sub.idSubscriptionTypes)?.price || 0), 0);

  const handleStatusChange = async (sub: Subscription, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/user-subscriptions/${sub.id}`, { subscriptionStatus: newStatus });
      setSubscriptions(prev =>
        prev.map(s => s.id === sub.id ? { ...s, subscriptionStatus: newStatus as any } : s)
      );
      if (selectedSub?.id === sub.id) setSelectedSub({ ...sub, subscriptionStatus: newStatus as any });
      showToast('Estado actualizado correctamente.');
    } catch {
      showToast('Error al actualizar el estado.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const selectedCustomer = selectedSub ? getCustomer(selectedSub.idUser) : null;
  const selectedPlan = selectedSub ? getPlan(selectedSub.idSubscriptionTypes) : null;
  const selectedStatus = selectedSub ? normalizeStatus(selectedSub.subscriptionStatus) : null;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-xl text-white text-sm font-medium flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-5">
          <nav className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <Link to="/entrepreneur/dashboard" className="hover:text-indigo-600">Dashboard</Link>
            <span>›</span>
            <Link to={`/entrepreneur/club/${managedClubId}`} className="hover:text-indigo-600">{club?.name || 'Club'}</Link>
            <span>›</span>
            <span className="text-gray-700">Monitor de suscripciones</span>
          </nav>
          <div className="flex items-center justify-between mt-1">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Monitor de Suscripciones</h1>
              <p className="text-sm text-gray-500 mt-0.5">Estado en tiempo real · Cambiá estados · Actuá rápido sobre pagos pendientes.</p>
            </div>
            <Link
              to={`/entrepreneur/club/${managedClubId}/manage-customers`}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg px-4 py-2 hover:bg-indigo-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Directorio de clientes
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Activas', value: totalActive, color: 'border-green-500', text: 'text-green-700', bg: 'bg-green-50', filter: 'active' as NormalizedStatus },
            { label: 'Pausadas', value: totalPaused, color: 'border-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', filter: 'paused' as NormalizedStatus },
            { label: 'Pago pendiente', value: totalPending, color: 'border-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', filter: 'pending' as NormalizedStatus },
            { label: 'Canceladas', value: totalCancelled, color: 'border-red-400', text: 'text-red-700', bg: 'bg-red-50', filter: 'cancelled' as NormalizedStatus },
            { label: 'Ingreso mensual est.', value: `$${estimatedRevenue.toLocaleString('es-AR')}`, color: 'border-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50', filter: null },
          ].map(stat => (
            <button
              key={stat.label}
              onClick={() => stat.filter && setStatusFilter(statusFilter === stat.filter ? 'all' : stat.filter)}
              className={`text-left bg-white rounded-xl shadow-sm border-l-4 ${stat.color} px-4 py-4 transition hover:shadow-md ${stat.filter && statusFilter === stat.filter ? stat.bg : ''} ${stat.filter ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.text}`}>{stat.value}</p>
              {stat.filter && <p className="text-xs text-gray-400 mt-1">{statusFilter === stat.filter ? 'Filtrando ↑' : 'Click para filtrar'}</p>}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-grow">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, email o plan..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="paused">Pausadas</option>
            <option value="cancelled">Canceladas</option>
            <option value="pending">Pago pendiente</option>
            <option value="finished">Finalizadas</option>
          </select>
          <select
            className="py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
          >
            <option value="all">Todos los planes</option>
            {clubPlans.map(plan => (
              <option key={plan.planId} value={plan.planId}>{plan.name}</option>
            ))}
          </select>
          {(searchTerm || statusFilter !== 'all' || planFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPlanFilter('all'); }}
              className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-2 whitespace-nowrap hover:bg-red-50 transition"
            >
              Limpiar filtros
            </button>
          )}
          <span className="text-sm text-gray-500 whitespace-nowrap">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none" onClick={() => toggleSort('customer')}>
                    Cliente <SortIcon field="customer" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none" onClick={() => toggleSort('plan')}>
                    Plan <SortIcon field="plan" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none" onClick={() => toggleSort('status')}>
                    Estado <SortIcon field="status" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none" onClick={() => toggleSort('startDate')}>
                    Inicio <SortIcon field="startDate" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none" onClick={() => toggleSort('nextPayment')}>
                    Próximo pago <SortIcon field="nextPayment" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Monto
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-gray-400 text-sm">
                      No se encontraron suscripciones con los filtros aplicados.
                    </td>
                  </tr>
                ) : filtered.map(sub => {
                  const customer = getCustomer(sub.idUser);
                  const plan = getPlan(sub.idSubscriptionTypes);
                  const status = normalizeStatus(sub.subscriptionStatus);
                  const isOverdue = sub.nextPaymentDate && new Date(sub.nextPaymentDate) < new Date() && status !== 'cancelled' && status !== 'finished';
                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-indigo-50/40 transition-colors cursor-pointer ${selectedSub?.id === sub.id ? 'bg-indigo-50' : ''} ${isOverdue ? 'border-l-2 border-l-red-400' : ''}`}
                      onClick={() => setSelectedSub(sub)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                            {customer ? customer.firstName[0].toUpperCase() : '?'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {customer ? `${customer.firstName} ${customer.lastName}` : `Usuario #${sub.idUser}`}
                            </p>
                            <p className="text-xs text-gray-400">{customer?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700 font-medium">{plan?.name || `Plan #${sub.idSubscriptionTypes}`}</p>
                        <p className="text-xs text-gray-400">{plan?.deliveryFrequency || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[status]}`}>
                          {STATUS_LABEL[status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {sub.startDate ? new Date(sub.startDate).toLocaleDateString('es-AR') : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {sub.nextPaymentDate ? (
                          <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                            {new Date(sub.nextPaymentDate).toLocaleDateString('es-AR')}
                            {isOverdue && <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Vencido</span>}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-indigo-700">
                        {plan ? `$${plan.price.toLocaleString('es-AR')}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedSub(sub); }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedSub && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setSelectedSub(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className={`relative z-50 w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto border-l-4 ${selectedStatus ? STATUS_BORDER[selectedStatus] : 'border-gray-200'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Gestión de suscripción</h2>
                <p className="text-xs text-gray-400">Cambiá el estado o navegá al perfil del cliente</p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold shrink-0">
                  {selectedCustomer ? selectedCustomer.firstName[0].toUpperCase() : '?'}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">
                    {selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : `Usuario #${selectedSub.idUser}`}
                  </p>
                  <p className="text-xs text-gray-500">{selectedCustomer?.email || '—'}</p>
                  {selectedStatus && (
                    <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[selectedStatus]}`}>
                      {STATUS_LABEL[selectedStatus]}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Esta suscripción</p>
                {[
                  { label: 'Plan', value: selectedPlan?.name || `#${selectedSub.idSubscriptionTypes}` },
                  { label: 'Frecuencia', value: selectedPlan?.deliveryFrequency },
                  { label: 'Precio del plan', value: selectedPlan ? `$${selectedPlan.price.toLocaleString('es-AR')}` : null },
                  { label: 'Monto pagado', value: selectedSub.monthlyAmountPaid ? `$${Number(selectedSub.monthlyAmountPaid).toLocaleString('es-AR')}` : null },
                  { label: 'Inicio', value: selectedSub.startDate ? new Date(selectedSub.startDate).toLocaleDateString('es-AR') : null },
                  { label: 'Fin esperado', value: selectedSub.expectedEndDate ? new Date(selectedSub.expectedEndDate).toLocaleDateString('es-AR') : null },
                  { label: 'Último pago', value: selectedSub.lastPaymentDate ? new Date(selectedSub.lastPaymentDate).toLocaleDateString('es-AR') : null },
                  { label: 'Próximo pago', value: selectedSub.nextPaymentDate ? new Date(selectedSub.nextPaymentDate).toLocaleDateString('es-AR') : null },
                ].map(({ label, value }) => value ? (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-800 font-medium">{value}</span>
                  </div>
                ) : null)}
                {selectedSub.cancellationReason && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Motivo de cancelación</p>
                    <p className="text-sm text-gray-700 mt-0.5">{selectedSub.cancellationReason}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Cambiar estado</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { status: 'ACTIVA', label: 'Activar', color: 'border-green-300 text-green-700 hover:bg-green-50' },
                    { status: 'PAUSADA', label: 'Pausar', color: 'border-yellow-300 text-yellow-700 hover:bg-yellow-50' },
                    { status: 'PENDIENTE_PAGO', label: 'Pago pendiente', color: 'border-orange-300 text-orange-700 hover:bg-orange-50' },
                    { status: 'CANCELADA', label: 'Cancelar', color: 'border-red-300 text-red-700 hover:bg-red-50' },
                  ] as const).map(opt => (
                    <button
                      key={opt.status}
                      disabled={updatingStatus || selectedSub.subscriptionStatus === opt.status}
                      onClick={() => handleStatusChange(selectedSub, opt.status)}
                      className={`py-2 text-sm font-medium rounded-lg border transition ${opt.color} disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {updatingStatus ? '...' : opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  to={`/entrepreneur/club/${managedClubId}/manage-customers?customerId=${selectedSub.idUser}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Ver ficha del cliente
                </Link>
                <Link
                  to={`/entrepreneur/club/${managedClubId}/customer-history/${selectedSub.idUser}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ver historial completo
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveSubscriptionsPage;