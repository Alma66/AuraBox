import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../App';
import { Club } from '../../../../types/club';
import { Subscription, normalizeStatus, NormalizedStatus } from '../../../../types/subscription';
import { User } from '../../../../types/user';
import api, { getResponseData } from '../../../../api/config';

const STATUS_LABEL: Record<NormalizedStatus, string> = {
  active: 'Activa', paused: 'Pausada', cancelled: 'Cancelada', pending: 'Pago pendiente', finished: 'Finalizada',
};
const STATUS_COLOR: Record<NormalizedStatus, string> = {
  active: 'bg-green-100 text-green-700', paused: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700', pending: 'bg-orange-100 text-orange-700', finished: 'bg-gray-100 text-gray-600',
};
const STATUS_DOT: Record<NormalizedStatus, string> = {
  active: 'bg-green-500', paused: 'bg-yellow-400', cancelled: 'bg-red-400', pending: 'bg-orange-400', finished: 'bg-gray-400',
};

const CustomerHistoryPage: React.FC = () => {
  const { clubId, customerId } = useParams<{ clubId: string; customerId: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [customer, setCustomer] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const managedClubId = clubId || user?.managedClubId;

  useEffect(() => {
    if (userRole !== 'entrepreneur' || !managedClubId || !customerId) { navigate('/'); return; }
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
        const found = usersData.find(u => String(u.id) === customerId);
        setCustomer(found || null);
        setSubscriptions(subsData.filter(s => String(s.idUser) === customerId).sort((a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        ));
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [managedClubId, customerId, userRole, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  if (!customer) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">Cliente no encontrado.</div>
  );

  const totalSpent = subscriptions.reduce((sum, s) => sum + (s.monthlyAmountPaid ? Number(s.monthlyAmountPaid) : 0), 0);
  const firstSub = subscriptions[subscriptions.length - 1];
  const activeSub = subscriptions.find(s => normalizeStatus(s.subscriptionStatus) === 'active');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-5">
          <nav className="text-xs text-gray-500 mb-1 flex items-center gap-1 flex-wrap">
            <Link to="/entrepreneur/dashboard" className="hover:text-indigo-600">Dashboard</Link>
            <span>›</span>
            <Link to={`/entrepreneur/club/${managedClubId}`} className="hover:text-indigo-600">{club?.name || 'Club'}</Link>
            <span>›</span>
            <Link to={`/entrepreneur/club/${managedClubId}/manage-customers`} className="hover:text-indigo-600">Directorio de clientes</Link>
            <span>›</span>
            <span className="text-gray-700">{customer.firstName} {customer.lastName}</span>
          </nav>
          <div className="flex items-center gap-4 mt-2">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold shrink-0">
              {customer.firstName[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.firstName} {customer.lastName}</h1>
              <p className="text-sm text-gray-500">{customer.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Suscripciones totales', value: subscriptions.length, color: 'border-indigo-500', text: 'text-indigo-700' },
            { label: 'Actualmente activa', value: activeSub ? 'Sí' : 'No', color: activeSub ? 'border-green-500' : 'border-gray-300', text: activeSub ? 'text-green-700' : 'text-gray-500' },
            { label: 'Total abonado', value: totalSpent > 0 ? `$${totalSpent.toLocaleString('es-AR')}` : '—', color: 'border-blue-400', text: 'text-blue-700' },
            { label: 'Cliente desde', value: firstSub ? new Date(firstSub.startDate).toLocaleDateString('es-AR') : '—', color: 'border-gray-400', text: 'text-gray-700' },
          ].map(stat => (
            <div key={stat.label} className={`bg-white rounded-xl shadow-sm border-l-4 ${stat.color} px-4 py-4`}>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
              <p className={`text-xl font-bold mt-1 ${stat.text}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-800 mb-6">Línea de tiempo de suscripciones</h2>
          {subscriptions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Sin suscripciones registradas.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />
              <div className="space-y-6">
                {subscriptions.map((sub, idx) => {
                  const status = normalizeStatus(sub.subscriptionStatus);
                  const plan = club?.subscriptionPlans?.find(p => Number(p.planId) === sub.idSubscriptionTypes);
                  return (
                    <div key={sub.id} className="relative flex gap-5">
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${STATUS_DOT[status]}`}>
                        <span className="text-white text-xs font-bold">{subscriptions.length - idx}</span>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{plan?.name || `Plan #${sub.idSubscriptionTypes}`}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Inicio: {new Date(sub.startDate).toLocaleDateString('es-AR')}
                              {sub.expectedEndDate && ` · Fin estimado: ${new Date(sub.expectedEndDate).toLocaleDateString('es-AR')}`}
                            </p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${STATUS_COLOR[status]}`}>
                            {STATUS_LABEL[status]}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
                          {sub.lastPaymentDate && (
                            <div>
                              <span className="text-gray-400 block">Último pago</span>
                              <span className="font-medium">{new Date(sub.lastPaymentDate).toLocaleDateString('es-AR')}</span>
                            </div>
                          )}
                          {sub.nextPaymentDate && status === 'active' && (
                            <div>
                              <span className="text-gray-400 block">Próximo pago</span>
                              <span className="font-medium">{new Date(sub.nextPaymentDate).toLocaleDateString('es-AR')}</span>
                            </div>
                          )}
                          {sub.monthlyAmountPaid && (
                            <div>
                              <span className="text-gray-400 block">Monto pagado</span>
                              <span className="font-medium text-indigo-700">${Number(sub.monthlyAmountPaid).toLocaleString('es-AR')}</span>
                            </div>
                          )}
                          {sub.cancellationDate && (
                            <div>
                              <span className="text-gray-400 block">Cancelada</span>
                              <span className="font-medium text-red-600">{new Date(sub.cancellationDate).toLocaleDateString('es-AR')}</span>
                            </div>
                          )}
                        </div>
                        {sub.cancellationReason && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <span className="text-xs text-gray-400">Motivo: </span>
                            <span className="text-xs text-gray-600">{sub.cancellationReason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerHistoryPage;