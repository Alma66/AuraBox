import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import api, { getResponseData } from '../../../../api/config';
import { PendingDelivery, RiderProfile } from '../../../../types/delivery';
import { Club } from '../../../../types/club';

interface AssignmentSelection {
  [idUserSubscriptions: number]: { idCourier: number | ''; idAssignedRider: number | '' };
}

const AssignDeliveriesPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [club, setClub] = useState<Club | null>(null);
  const [pending, setPending] = useState<PendingDelivery[]>([]);
  const [riders, setRiders] = useState<RiderProfile[]>([]);
  const [selections, setSelections] = useState<AssignmentSelection>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!clubId || userRole !== 'entrepreneur') {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const [clubRes, pendingRes, ridersRes] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/shipments/pending-by-club/${clubId}`),
          api.get(`/rider-profile/by-club/${clubId}`),
        ]);
        setClub(getResponseData(clubRes));
        setPending(getResponseData(pendingRes) || []);
        setRiders((getResponseData(ridersRes) || []).filter((r: RiderProfile) => r.isActive));
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los envíos pendientes.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clubId, userRole, authLoading, navigate]);

  const updateSelection = (idUserSubscriptions: number, field: 'idCourier' | 'idAssignedRider', value: number | '') => {
    setSelections((prev) => ({
      ...prev,
      [idUserSubscriptions]: {
        idCourier: field === 'idCourier' ? value : prev[idUserSubscriptions]?.idCourier ?? '',
        idAssignedRider: field === 'idAssignedRider' ? value : prev[idUserSubscriptions]?.idAssignedRider ?? '',
      },
    }));
  };

  const isInternalCourier = (delivery: PendingDelivery, idCourier: number | '') => {
    const courier = delivery.availableCouriers.find((c) => c.id === idCourier);
    return courier?.isInternal ?? false;
  };

  const assign = async (delivery: PendingDelivery) => {
    const selection = selections[delivery.idUserSubscriptions];
    if (!selection || selection.idCourier === '') {
      alert('Seleccioná un método de envío antes de asignar.');
      return;
    }
    if (isInternalCourier(delivery, selection.idCourier) && selection.idAssignedRider === '') {
      alert('Seleccioná un rider para este método de envío.');
      return;
    }
    setAssigningId(delivery.idUserSubscriptions);
    try {
      await api.post('/shipments/assign', {
        idUser: delivery.idUser,
        idUserSubscriptions: delivery.idUserSubscriptions,
        idClub: Number(clubId),
        idCourier: selection.idCourier,
        idAssignedRider: selection.idAssignedRider === '' ? undefined : selection.idAssignedRider,
        boxMonthYear: delivery.boxMonthYear,
      });
      setPending((prev) => prev.filter((p) => p.idUserSubscriptions !== delivery.idUserSubscriptions));
    } catch (err) {
      console.error(err);
      alert('No se pudo asignar el envío.');
    } finally {
      setAssigningId(null);
    }
  };

  if (authLoading || loading) return <div className="text-center py-16 text-gray-500">Cargando envíos pendientes...</div>;
  if (error || !club) return <div className="text-center py-16 text-red-500">{error || 'Club no encontrado.'}</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Asignar Envíos</h1>
        <p className="text-sm text-gray-500 mt-1">{club.name} · Pendientes del mes actual</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Suscriptores sin envío asignado</h2>
          <span className="text-sm text-gray-500">{pending.length} pendientes</span>
        </div>

        {pending.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-500">
            No hay envíos pendientes de asignación para este mes.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {pending.map((delivery) => {
              const selection = selections[delivery.idUserSubscriptions] ?? { idCourier: '', idAssignedRider: '' };
              const internal = isInternalCourier(delivery, selection.idCourier);
              return (
                <li key={delivery.idUserSubscriptions} className="px-6 py-5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {delivery.user ? `${delivery.user.firstName} ${delivery.user.lastName}` : `Usuario #${delivery.idUser}`}
                      </p>
                      <p className="text-sm text-gray-500">{delivery.subscriptionName ?? 'Suscripción'}</p>
                      {delivery.user && (
                        <p className="text-sm text-gray-400 mt-1">
                          {[delivery.user.address.street, delivery.user.address.addressNumber, delivery.user.address.city, delivery.user.address.province]
                            .filter(Boolean)
                            .join(', ') || 'Sin dirección registrada'}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 lg:items-center">
                      <select
                        value={selection.idCourier}
                        onChange={(e) => updateSelection(delivery.idUserSubscriptions, 'idCourier', e.target.value ? Number(e.target.value) : '')}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">Método de envío</option>
                        {delivery.availableCouriers.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>

                      {internal && (
                        <select
                          value={selection.idAssignedRider}
                          onChange={(e) => updateSelection(delivery.idUserSubscriptions, 'idAssignedRider', e.target.value ? Number(e.target.value) : '')}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="">Seleccionar rider</option>
                          {riders.map((r) => (
                            <option key={r.id} value={r.id}>{r.firstName} {r.lastName} ({r.currentAssignments} activas)</option>
                          ))}
                        </select>
                      )}

                      <button
                        onClick={() => assign(delivery)}
                        disabled={assigningId === delivery.idUserSubscriptions}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {assigningId === delivery.idUserSubscriptions ? 'Asignando...' : 'Asignar'}
                      </button>
                    </div>
                  </div>

                  {delivery.availableCouriers.length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">
                      Este club todavía no tiene métodos de envío configurados. Configuralos en "Gestionar Riders".
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AssignDeliveriesPage;