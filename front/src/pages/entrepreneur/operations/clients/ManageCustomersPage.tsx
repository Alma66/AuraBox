import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../App';
import { Club } from '../../../../types/club';
import { Subscription, normalizeStatus, NormalizedStatus } from '../../../../types/subscription';
import { User } from '../../../../types/user';
import api, { getResponseData } from '../../../../api/config';

interface CustomerWithSubscriptions extends User {
  subscriptionsInfo: {
    id: number;
    idSubscriptionTypes: number;
    subscriptionStatus: Subscription['subscriptionStatus'];
    startDate: string;
    cancellationDate?: string | null;
    nextPaymentDate?: string | null;
    monthlyAmountPaid?: string | null;
  }[];
}

const STATUS_LABEL: Record<NormalizedStatus, string> = {
  active: 'Activa', paused: 'Pausada', cancelled: 'Cancelada', pending: 'Pago pendiente', finished: 'Finalizada',
};
const STATUS_COLOR: Record<NormalizedStatus, string> = {
  active: 'bg-green-100 text-green-800', paused: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800', pending: 'bg-orange-100 text-orange-800', finished: 'bg-gray-100 text-gray-700',
};

const ManageCustomersPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('customerId');

  const [club, setClub] = useState<Club | null>(null);
  const [allCustomers, setAllCustomers] = useState<CustomerWithSubscriptions[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithSubscriptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const managedClubId = clubId || user?.managedClubId;

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
        const subsData: Subscription[] = getResponseData(subsRes) || [];
        const usersData: User[] = getResponseData(customersRes) || [];
        setClub(clubData);

        const uniqueUserIds = Array.from(new Set(subsData.map(s => s.idUser)));
        const detailed: CustomerWithSubscriptions[] = uniqueUserIds
          .map(userId => {
            const customer = usersData.find(u => Number(u.id) === userId);
            if (!customer) return null;
            return {
              ...customer,
              subscriptionsInfo: subsData
                .filter(s => s.idUser === userId)
                .map(s => ({
                  id: s.id,
                  idSubscriptionTypes: s.idSubscriptionTypes,
                  subscriptionStatus: s.subscriptionStatus,
                  startDate: s.startDate,
                  cancellationDate: s.cancellationDate,
                  nextPaymentDate: s.nextPaymentDate,
                  monthlyAmountPaid: s.monthlyAmountPaid,
                })),
            } as CustomerWithSubscriptions;
          })
          .filter(Boolean) as CustomerWithSubscriptions[];

        setAllCustomers(detailed);
        if (preselectedId) {
          const found = detailed.find(c => String(c.id) === preselectedId);
          if (found) setSelectedCustomer(found);
        }
      } catch {
        toast.error('Error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [managedClubId, userRole, navigate, preselectedId]);

  const filteredCustomers = allCustomers.filter(c => {
    const term = search.toLowerCase();
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.city || '').toLowerCase().includes(term)
    );
  });

  const activeSubsCount = (c: CustomerWithSubscriptions) =>
    c.subscriptionsInfo.filter(s => normalizeStatus(s.subscriptionStatus) === 'active').length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-aurora-cream">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
    </div>
  );

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div className="bg-white border-b border-aurora-navy/10">
        <div className="container mx-auto px-4 py-5">
          <nav className="text-xs text-aurora-navy/50 mb-1 flex items-center gap-1">
            <Link to="/entrepreneur/dashboard" className="hover:text-aurora-terracotta">Dashboard</Link>
            <span>›</span>
            <Link to={`/entrepreneur/club/${managedClubId}`} className="hover:text-aurora-terracotta">{club?.name || 'Club'}</Link>
            <span>›</span>
            <span className="text-aurora-navy/70">Directorio de clientes</span>
          </nav>
          <h1 className="font-display text-2xl font-bold text-aurora-navy">Directorio de Clientes — {club?.name}</h1>
          <p className="text-sm text-aurora-navy/50 mt-0.5">Ficha completa de cada suscriptor: datos de contacto, dirección y suscripciones.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">

          <div className="lg:col-span-1 bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-aurora-navy/10">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aurora-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o ciudad..."
                  className="w-full pl-9 pr-4 py-2 border border-aurora-navy/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <p className="text-xs text-aurora-navy/40 mt-2">{filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredCustomers.length === 0 ? (
                <p className="text-center text-aurora-navy/40 text-sm py-12">Sin resultados.</p>
              ) : filteredCustomers.map(c => {
                const actives = activeSubsCount(c);
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className={`w-full text-left px-4 py-3 border-b border-aurora-navy/5 hover:bg-aurora-cream/60 transition flex items-center gap-3 ${selectedCustomer?.id === c.id ? 'bg-aurora-cream border-l-4 border-l-aurora-terracotta' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-aurora-navy/10 flex items-center justify-center text-aurora-navy font-bold text-sm shrink-0">
                      {c.firstName[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-aurora-navy truncate">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-aurora-navy/40 truncate">{c.email}</p>
                    </div>
                    {actives > 0 && (
                      <span className="ml-auto shrink-0 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                        {actives} activa{actives !== 1 ? 's' : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 overflow-y-auto">
            {!selectedCustomer ? (
              <div className="flex flex-col items-center justify-center h-full text-aurora-navy/30 gap-3">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm">Seleccioná un cliente para ver su ficha</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-aurora-navy/10 flex items-center justify-center text-aurora-navy text-2xl font-bold shrink-0">
                      {selectedCustomer.firstName[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-aurora-navy">{selectedCustomer.firstName} {selectedCustomer.lastName}</h2>
                      <p className="text-sm text-aurora-navy/50">{selectedCustomer.email}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedCustomer.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {selectedCustomer.active !== false ? 'Cuenta activa' : 'Cuenta inactiva'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-aurora-navy/10 text-aurora-navy">
                          {selectedCustomer.subscriptionsInfo.length} suscripción{selectedCustomer.subscriptionsInfo.length !== 1 ? 'es' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/entrepreneur/club/${managedClubId}/customer-history/${selectedCustomer.id}`}
                    className="shrink-0 flex items-center gap-1.5 text-xs text-aurora-navy border border-aurora-navy/20 rounded-lg px-3 py-2 hover:bg-aurora-cream transition font-medium"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Ver historial completo
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-aurora-cream rounded-xl p-4">
                    <p className="text-xs font-semibold text-aurora-navy/40 uppercase tracking-wide mb-3">Contacto</p>
                    <div className="space-y-2 text-sm">
                      {[
                        { label: 'Email', value: selectedCustomer.email },
                        { label: 'Teléfono', value: selectedCustomer.phoneNumber ? String(selectedCustomer.phoneNumber) : null },
                        { label: 'Documento', value: selectedCustomer.documentNumber ? `${selectedCustomer.documentType || 'DNI'} ${selectedCustomer.documentNumber}` : null },
                        { label: 'Miembro desde', value: selectedCustomer.registrationDate ? new Date(selectedCustomer.registrationDate).toLocaleDateString('es-AR') : null },
                        { label: 'Último acceso', value: selectedCustomer.lastLogin ? new Date(selectedCustomer.lastLogin).toLocaleDateString('es-AR') : null },
                      ].map(({ label, value }) => value ? (
                        <div key={label} className="flex justify-between">
                          <span className="text-aurora-navy/50">{label}</span>
                          <span className="text-aurora-navy font-medium text-right max-w-[60%] truncate">{value}</span>
                        </div>
                      ) : null)}
                    </div>
                  </div>

                  <div className="bg-aurora-cream rounded-xl p-4">
                    <p className="text-xs font-semibold text-aurora-navy/40 uppercase tracking-wide mb-3">Dirección de envío</p>
                    {selectedCustomer.streetAddress || selectedCustomer.city ? (
                      <div className="space-y-2 text-sm">
                        {selectedCustomer.streetAddress && (
                          <div className="flex justify-between">
                            <span className="text-aurora-navy/50">Calle</span>
                            <span className="text-aurora-navy font-medium">{selectedCustomer.streetAddress} {selectedCustomer.addressNumber || ''}</span>
                          </div>
                        )}
                        {selectedCustomer.floorNumber && (
                          <div className="flex justify-between">
                            <span className="text-aurora-navy/50">Piso/Depto</span>
                            <span className="text-aurora-navy font-medium">{selectedCustomer.floorNumber}</span>
                          </div>
                        )}
                        {selectedCustomer.addressDetails && (
                          <div className="flex justify-between">
                            <span className="text-aurora-navy/50">Detalles</span>
                            <span className="text-aurora-navy font-medium">{selectedCustomer.addressDetails}</span>
                          </div>
                        )}
                        {selectedCustomer.city && (
                          <div className="flex justify-between">
                            <span className="text-aurora-navy/50">Ciudad</span>
                            <span className="text-aurora-navy font-medium">{selectedCustomer.city}</span>
                          </div>
                        )}
                        {selectedCustomer.province && (
                          <div className="flex justify-between">
                            <span className="text-aurora-navy/50">Provincia</span>
                            <span className="text-aurora-navy font-medium">{selectedCustomer.province}</span>
                          </div>
                        )}
                        {selectedCustomer.postalCode && (
                          <div className="flex justify-between">
                            <span className="text-aurora-navy/50">CP</span>
                            <span className="text-aurora-navy font-medium">{selectedCustomer.postalCode}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-aurora-navy/40">Sin dirección registrada.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-aurora-navy/40 uppercase tracking-wide mb-3">Suscripciones activas</p>
                  {selectedCustomer.subscriptionsInfo.filter(s => normalizeStatus(s.subscriptionStatus) === 'active').length === 0 ? (
                    <p className="text-sm text-aurora-navy/40">No tiene suscripciones activas en este momento.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedCustomer.subscriptionsInfo
                        .filter(s => normalizeStatus(s.subscriptionStatus) === 'active')
                        .map(sub => {
                          const plan = club?.subscriptionPlans?.find(p => Number(p.planId) === sub.idSubscriptionTypes);
                          const status = normalizeStatus(sub.subscriptionStatus);
                          return (
                            <div key={sub.id} className="flex items-center justify-between bg-aurora-cream rounded-xl p-4 border border-aurora-navy/5">
                              <div>
                                <p className="text-sm font-semibold text-aurora-navy">{plan?.name || `Plan #${sub.idSubscriptionTypes}`}</p>
                                <p className="text-xs text-aurora-navy/50 mt-0.5">
                                  Desde {new Date(sub.startDate).toLocaleDateString('es-AR')}
                                  {sub.nextPaymentDate && ` · Próximo pago: ${new Date(sub.nextPaymentDate).toLocaleDateString('es-AR')}`}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLOR[status]}`}>
                                  {STATUS_LABEL[status]}
                                </span>
                                {plan && (
                                  <span className="text-sm font-bold text-aurora-navy">
                                    ${plan.price.toLocaleString('es-AR')}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {selectedCustomer.subscriptionsInfo.filter(s => normalizeStatus(s.subscriptionStatus) !== 'active').length > 0 && (
                  <div className="pt-2 border-t border-aurora-navy/10">
                    <p className="text-xs text-aurora-navy/40 mb-2">
                      + {selectedCustomer.subscriptionsInfo.filter(s => normalizeStatus(s.subscriptionStatus) !== 'active').length} suscripción/es inactiva/s
                    </p>
                    <Link
                      to={`/entrepreneur/club/${managedClubId}/customer-history/${selectedCustomer.id}`}
                      className="text-xs text-aurora-terracotta hover:underline font-medium"
                    >
                      Ver historial completo →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCustomersPage;