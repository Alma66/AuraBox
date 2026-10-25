import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../../api/config';
import { PendingDelivery, RiderProfile } from '../../../types/delivery';

interface Selection {
  idCourier: number | '';
  idAssignedRider: number | '';
}

interface PendingAssignmentsProps {
  clubId: string;
  refreshKey: number;
  onCountChange: (count: number) => void;
  onOpenRiders: () => void;
}

const selectClass =
  'min-h-[44px] min-w-[200px] rounded-lg border border-aurora-navy/15 bg-white px-3 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40';

const PendingAssignments: React.FC<PendingAssignmentsProps> = ({ clubId, refreshKey, onCountChange, onOpenRiders }) => {
  const [pending, setPending] = useState<PendingDelivery[]>([]);
  const [riders, setRiders] = useState<RiderProfile[]>([]);
  const [selections, setSelections] = useState<Record<number, Selection>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pendingRes, ridersRes] = await Promise.all([
        api.get(`/shipments/pending-by-club/${clubId}`),
        api.get(`/rider-profile/by-club/${clubId}`),
      ]);
      const list: PendingDelivery[] = getResponseData(pendingRes) || [];
      setPending(list);
      onCountChange(list.length);
      setRiders((getResponseData(ridersRes) || []).filter((r: RiderProfile) => r.isActive));
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los envíos pendientes.');
    } finally {
      setLoading(false);
    }
  }, [clubId, onCountChange]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const updateSelection = (id: number, field: keyof Selection, value: number | '') => {
    setSelections((prev) => ({
      ...prev,
      [id]: {
        idCourier: field === 'idCourier' ? value : prev[id]?.idCourier ?? '',
        idAssignedRider: field === 'idAssignedRider' ? value : prev[id]?.idAssignedRider ?? '',
      },
    }));
  };

  const isInternal = (delivery: PendingDelivery, idCourier: number | '') =>
    delivery.availableCouriers.find((c) => c.id === idCourier)?.isInternal ?? false;

  const assign = async (delivery: PendingDelivery) => {
    const selection = selections[delivery.idUserSubscriptions];
    if (!selection || selection.idCourier === '') {
      toast.error('Seleccioná un método de envío antes de asignar.');
      return;
    }
    if (isInternal(delivery, selection.idCourier) && selection.idAssignedRider === '') {
      toast.error('Seleccioná un rider para este método de envío.');
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
      const next = pending.filter((p) => p.idUserSubscriptions !== delivery.idUserSubscriptions);
      setPending(next);
      onCountChange(next.length);
      toast.success('Envío asignado correctamente.');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo asignar el envío.');
    } finally {
      setAssigningId(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3" aria-busy="true">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-24 rounded-2xl bg-aurora-navy/10" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <p>{error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-3 min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <div className="rounded-2xl border border-aurora-navy/10 bg-white px-6 py-16 text-center text-sm text-aurora-navy/60">
        No hay envíos pendientes de asignación este mes. Todo está al día.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-aurora-navy/10 overflow-hidden rounded-2xl border border-aurora-navy/10 bg-white">
      {pending.map((delivery) => {
        const selection = selections[delivery.idUserSubscriptions] ?? { idCourier: '', idAssignedRider: '' };
        const internal = isInternal(delivery, selection.idCourier);
        const busy = assigningId === delivery.idUserSubscriptions;
        const address =
          delivery.user &&
          [delivery.user.address.street, delivery.user.address.addressNumber, delivery.user.address.city, delivery.user.address.province]
            .filter(Boolean)
            .join(', ');
        return (
          <li key={delivery.idUserSubscriptions} className="px-5 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-aurora-navy">
                  {delivery.user ? `${delivery.user.firstName} ${delivery.user.lastName}` : `Usuario #${delivery.idUser}`}
                </p>
                <p className="text-sm text-aurora-navy/60">{delivery.subscriptionName ?? 'Suscripción'}</p>
                {delivery.user && (
                  <p className="mt-1 text-sm text-aurora-navy/45">{address || 'Sin dirección registrada'}</p>
                )}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <select
                  aria-label="Método de envío"
                  value={selection.idCourier}
                  onChange={(e) => updateSelection(delivery.idUserSubscriptions, 'idCourier', e.target.value ? Number(e.target.value) : '')}
                  className={selectClass}
                >
                  <option value="">Método de envío</option>
                  {delivery.availableCouriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {internal && (
                  <select
                    aria-label="Rider"
                    value={selection.idAssignedRider}
                    onChange={(e) => updateSelection(delivery.idUserSubscriptions, 'idAssignedRider', e.target.value ? Number(e.target.value) : '')}
                    className={selectClass}
                  >
                    <option value="">Seleccionar rider</option>
                    {riders.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.firstName} {r.lastName} ({r.currentAssignments} activas)
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => assign(delivery)}
                  disabled={busy}
                  className="min-h-[44px] rounded-lg bg-aurora-terracotta px-5 text-sm font-semibold text-white transition-colors hover:bg-aurora-terracottaDark disabled:opacity-50"
                >
                  {busy ? 'Asignando...' : 'Asignar'}
                </button>
              </div>
            </div>
            {delivery.availableCouriers.length === 0 && (
              <p className="mt-3 text-sm text-amber-700">
                Este club todavía no tiene métodos de envío configurados.{' '}
                <button type="button" onClick={onOpenRiders} className="font-semibold underline">
                  Configurarlos ahora
                </button>
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default PendingAssignments;