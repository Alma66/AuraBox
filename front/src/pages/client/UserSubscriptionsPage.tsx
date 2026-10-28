import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import api, { getResponseData } from '../../api/config';
import { Subscription, SubscriptionStatus, STATUS_LABELS, normalizeStatus } from '../../types/subscription';

interface SubscriptionTypeInfo {
  id: number;
  idClub: number;
  name: string;
  description?: string;
  basePrice: string;
  frequency: string;
  imageUrl?: string | null;
}

interface ClubInfo {
  id: number;
  name: string;
  logoUrl?: string;
}

interface PaymentMethodInfo {
  id: number;
  method: string;
}

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  Activa: 'bg-green-100 text-green-700',
  Pendiente_Pago: 'bg-yellow-100 text-yellow-700',
  Cancelada: 'bg-red-100 text-red-700',
  Pausada: 'bg-orange-100 text-orange-700',
  Finalizada: 'bg-aurora-navy/10 text-aurora-navy/70',
};

const FILTERS: { key: 'all' | SubscriptionStatus; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'Activa', label: 'Activas' },
  { key: 'Pausada', label: 'Pausadas' },
  { key: 'Pendiente_Pago', label: 'Pago Pendiente' },
  { key: 'Cancelada', label: 'Canceladas' },
  { key: 'Finalizada', label: 'Finalizadas' },
];

const UserSubscriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subTypes, setSubTypes] = useState<Record<number, SubscriptionTypeInfo>>({});
  const [clubs, setClubs] = useState<Record<number, ClubInfo>>({});
  const [paymentMethods, setPaymentMethods] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | SubscriptionStatus>('all');
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [processingCancel, setProcessingCancel] = useState(false);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const subsResponse = await api.get(`/user-subscriptions?userId=${user.id}`);
      const subs: Subscription[] = getResponseData(subsResponse) || [];
      setSubscriptions(subs);

      const uniqueSubTypeIds = Array.from(new Set(subs.map((s) => s.idSubscriptionTypes)));
      const subTypesResults = await Promise.all(
        uniqueSubTypeIds.map((id) =>
          api.get(`/subscription-types/${id}`).then((r) => getResponseData(r)).catch(() => null)
        )
      );
      const subTypesMap: Record<number, SubscriptionTypeInfo> = {};
      subTypesResults.forEach((st) => { if (st) subTypesMap[st.id] = st; });
      setSubTypes(subTypesMap);

      const uniqueClubIds = Array.from(new Set(Object.values(subTypesMap).map((st) => st.idClub)));
      const clubsResults = await Promise.all(
        uniqueClubIds.map((id) =>
          api.get(`/clubs/${id}`).then((r) => getResponseData(r)).catch(() => null)
        )
      );
      const clubsMap: Record<number, ClubInfo> = {};
      clubsResults.forEach((c) => { if (c) clubsMap[c.id] = c; });
      setClubs(clubsMap);

      const pmResponse = await api.get('/payment-methods/active');
      const pmList: PaymentMethodInfo[] = getResponseData(pmResponse) || [];
      const pmMap: Record<number, string> = {};
      pmList.forEach((pm) => { pmMap[pm.id] = pm.method; });
      setPaymentMethods(pmMap);
    } catch {
      setError('Error al cargar tus suscripciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filteredSubscriptions = useMemo(() => {
    if (activeFilter === 'all') return subscriptions;
    return subscriptions.filter((s) => s.subscriptionStatus === activeFilter);
  }, [subscriptions, activeFilter]);

  const handleStartCancel = (id: number) => {
    setCancelingId(id);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (cancelingId === null) return;
    setProcessingCancel(true);
    try {
      await api.post(`/user-subscriptions/${cancelingId}/cancel`, { reason: cancelReason || undefined });
      setSubscriptions((prev) =>
        prev.map((s) => s.id === cancelingId
          ? { ...s, subscriptionStatus: 'Cancelada', cancellationReason: cancelReason || null, cancellationDate: new Date().toISOString() }
          : s
        )
      );
      setCancelingId(null);
      setCancelReason('');
    } catch {
      setError('No se pudo cancelar la suscripción. Intentá de nuevo.');
    } finally {
      setProcessingCancel(false);
    }
  };

  const formatDate = (date?: string | null) => date ? new Date(date).toLocaleDateString('es-AR') : '—';
  const formatPrice = (amount?: string | null) => amount ? `$${Number(amount).toLocaleString('es-AR')} ARS` : '—';

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora-cream py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aurora-terracottaDark mx-auto mb-4"></div>
          <p className="text-aurora-navy/70">Cargando tus suscripciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-aurora-navy mb-2">Mis Suscripciones</h1>
          <p className="text-aurora-navy/70">
            {user ? `Hola, ${user.firstName}! ` : ''}Gestioná tus suscripciones activas y su historial.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6 text-center">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeFilter === f.key ? 'bg-aurora-terracotta text-white' : 'bg-white text-aurora-navy/70 hover:bg-aurora-cream border border-aurora-navy/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-inner">
            <svg className="mx-auto h-20 w-20 text-aurora-navy/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-aurora-navy mb-2">Todavía no tenés suscripciones</h3>
            <p className="text-aurora-navy/60 mb-4">Explorá clubes y elegí el plan que más te guste.</p>
            <button onClick={() => navigate('/explore')} className="bg-aurora-terracotta text-white px-6 py-3 rounded-lg hover:bg-aurora-terracottaDark transition-colors">
              Explorar Clubes
            </button>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-inner">
            <p className="text-lg text-aurora-navy/70 font-medium">No tenés suscripciones en este estado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSubscriptions.map((sub) => {
              const planInfo = subTypes[sub.idSubscriptionTypes];
              const clubInfo = planInfo ? clubs[planInfo.idClub] : undefined;
              const paymentMethodName = sub.idPaymentMethods ? paymentMethods[sub.idPaymentMethods] : undefined;
              const canCancel = normalizeStatus(sub.subscriptionStatus) === 'active' || normalizeStatus(sub.subscriptionStatus) === 'paused';
              const isCancelingThis = cancelingId === sub.id;

              return (
                <div key={sub.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="p-5 flex gap-4 items-start border-b border-aurora-navy/10">
                    <img
                      src={clubInfo?.logoUrl || '/assets/default-club.jpg'}
                      alt={clubInfo?.name || 'Club'}
                      className="w-16 h-16 rounded-full object-cover border border-aurora-navy/10 flex-shrink-0"
                    />
                    <div className="flex-grow min-w-0">
                      <p className="text-xs text-aurora-navy/40 truncate">{clubInfo?.name || 'Club'}</p>
                      <h3 className="font-bold text-aurora-navy truncate">{planInfo?.name || 'Plan'}</h3>
                      <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[sub.subscriptionStatus]}`}>
                        {STATUS_LABELS[sub.subscriptionStatus]}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2 text-sm text-aurora-navy/70">
                    <div className="flex justify-between">
                      <span>Monto mensual</span>
                      <span className="font-semibold text-aurora-navy">{formatPrice(sub.monthlyAmountPaid || planInfo?.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frecuencia</span>
                      <span className="font-medium">{planInfo?.frequency || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inicio</span>
                      <span className="font-medium">{formatDate(sub.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Próximo pago</span>
                      <span className="font-medium">{formatDate(sub.nextPaymentDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Método de pago</span>
                      <span className="font-medium">{paymentMethodName || '—'}</span>
                    </div>
                    {sub.subscriptionStatus === 'Cancelada' && sub.cancellationReason && (
                      <div className="bg-red-50 text-red-600 text-xs rounded-lg p-2 mt-2">
                        Motivo: {sub.cancellationReason}
                      </div>
                    )}
                  </div>

                  {canCancel && (
                    <div className="p-5 pt-0">
                      {isCancelingThis ? (
                        <div className="bg-aurora-cream rounded-lg p-3 space-y-2">
                          <label className="text-xs font-medium text-aurora-navy/80">Motivo (opcional):</label>
                          <input
                            type="text"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="w-full rounded-md border-aurora-navy/20 shadow-sm text-sm focus:border-red-500 focus:ring-red-500"
                            placeholder="¿Por qué querés cancelar?"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleConfirmCancel}
                              disabled={processingCancel}
                              className="flex-1 bg-red-600 text-white text-sm py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {processingCancel ? 'Cancelando...' : 'Confirmar Cancelación'}
                            </button>
                            <button
                              onClick={() => setCancelingId(null)}
                              className="flex-1 bg-aurora-navy/10 text-aurora-navy/80 text-sm py-2 rounded-md hover:bg-aurora-navy/20 transition-colors"
                            >
                              Volver
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartCancel(sub.id)}
                          className="w-full text-red-600 border border-red-200 text-sm py-2 rounded-md hover:bg-red-50 transition-colors font-medium"
                        >
                          Cancelar Suscripción
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSubscriptionsPage;