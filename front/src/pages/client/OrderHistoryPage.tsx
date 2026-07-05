import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import api, { getResponseData } from '../../api/config';

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
  Reembolsado: 'bg-blue-100 text-blue-700',
};

const PAYMENT_STATUS_LABELS: Record<PaymentEntry['paymentStatus'], string> = {
  Exitoso: 'Exitoso',
  Pendiente: 'Pendiente',
  Rechazado: 'Rechazado',
  Reembolsado: 'Reembolsado',
};

const SHIPMENT_STATUS_COLORS: Record<ShipmentEntry['shipmentStatus'], string> = {
  Pendiente: 'bg-gray-200 text-gray-700',
  Asignado: 'bg-blue-100 text-blue-700',
  En_Camino: 'bg-indigo-100 text-indigo-700',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Historial de Compras</h1>
          <p className="text-gray-600">
            {user ? `Hola, ${user.firstName}! ` : ''}Revisá tus pagos y el estado de tus envíos.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6 text-center">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setTab('payments')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
              tab === 'payments' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Pagos ({payments.length})
          </button>
          <button
            onClick={() => setTab('shipments')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
              tab === 'shipments' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Envíos ({shipments.length})
          </button>
        </div>

        {tab === 'payments' && (
          sortedPayments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-inner">
              <p className="text-lg text-gray-600 font-medium">Todavía no tenés pagos registrados.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="divide-y divide-gray-100">
                {sortedPayments.map((payment) => {
                  const club = clubs[payment.idClub];
                  const pmName = payment.idPaymentMethods ? paymentMethods[payment.idPaymentMethods] : undefined;
                  return (
                    <div key={payment.id} className="p-5 flex items-center gap-4">
                      <img
                        src={club?.logoUrl || '/assets/default-club.jpg'}
                        alt={club?.name || 'Club'}
                        className="w-12 h-12 rounded-full object-cover border border-gray-100 flex-shrink-0"
                      />
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{club?.name || 'Club'}</p>
                        <p className="text-xs text-gray-500">{formatDate(payment.paymentDate)} · {pmName || 'Método no especificado'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900">{formatPrice(payment.totalAmountPaid)}</p>
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${PAYMENT_STATUS_COLORS[payment.paymentStatus]}`}>
                          {PAYMENT_STATUS_LABELS[payment.paymentStatus]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        {tab === 'shipments' && (
          sortedShipments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-inner">
              <p className="text-lg text-gray-600 font-medium">Todavía no tenés envíos registrados.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="divide-y divide-gray-100">
                {sortedShipments.map((shipment) => {
                  const club = shipment.idClub ? clubs[shipment.idClub] : undefined;
                  return (
                    <div key={shipment.id} className="p-5 flex items-center gap-4">
                      <img
                        src={club?.logoUrl || '/assets/default-club.jpg'}
                        alt={club?.name || 'Club'}
                        className="w-12 h-12 rounded-full object-cover border border-gray-100 flex-shrink-0"
                      />
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{club?.name || 'Club'}</p>
                        <p className="text-xs text-gray-500">
                          Caja {shipment.boxMonthYear}
                          {shipment.trackingNumber && ` · Seguimiento: ${shipment.trackingNumber}`}
                        </p>
                        {(shipment.estimatedDeliveryStartDate || shipment.actualDeliveryDate) && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {shipment.actualDeliveryDate
                              ? `Entregado el ${formatDate(shipment.actualDeliveryDate)}`
                              : `Estimado: ${formatDate(shipment.estimatedDeliveryStartDate)} - ${formatDate(shipment.estimatedDeliveryEndDate)}`}
                          </p>
                        )}
                      </div>
                      <span className={`flex-shrink-0 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${SHIPMENT_STATUS_COLORS[shipment.shipmentStatus]}`}>
                        {SHIPMENT_STATUS_LABELS[shipment.shipmentStatus]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/customer/subscriptions')}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Ver Mis Suscripciones
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;