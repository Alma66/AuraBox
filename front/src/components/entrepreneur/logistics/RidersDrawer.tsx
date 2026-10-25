import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../../api/config';
import { RiderProfile, Courier } from '../../../types/delivery';
import Icon from '../layout/Icon';

interface RidersDrawerProps {
  open: boolean;
  onClose: () => void;
  clubId: string;
  onChanged: () => void;
}

const VEHICLE_OPTIONS = ['Moto', 'Auto', 'Bicicleta', 'A_Pie'];

const fieldClass =
  'min-h-[44px] w-full rounded-lg border border-aurora-navy/15 px-3 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40';

const RidersDrawer: React.FC<RidersDrawerProps> = ({ open, onClose, clubId, onChanged }) => {
  const [tab, setTab] = useState<'riders' | 'couriers'>('riders');
  const [riders, setRiders] = useState<RiderProfile[]>([]);
  const [allCouriers, setAllCouriers] = useState<Courier[]>([]);
  const [clubCouriers, setClubCouriers] = useState<Courier[]>([]);
  const [enabledIds, setEnabledIds] = useState<number[]>([]);
  const [feeEdits, setFeeEdits] = useState<Record<number, string>>({});
  const [editing, setEditing] = useState<RiderProfile | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [ridersRes, allRes, clubRes] = await Promise.all([
        api.get(`/rider-profile/by-club/${clubId}`),
        api.get('/courier'),
        api.get(`/courier/by-club/${clubId}`),
      ]);
      setRiders(getResponseData(ridersRes) || []);
      setAllCouriers(getResponseData(allRes) || []);
      const enabled: Courier[] = getResponseData(clubRes) || [];
      setClubCouriers(enabled);
      setEnabledIds(enabled.map((c) => c.id));
      const fees: Record<number, string> = {};
      enabled.forEach((c) => {
        if (c.baseFee) fees[c.id] = c.baseFee;
      });
      setFeeEdits(fees);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la información de logística.');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setEditing(null);
    setConfirmId(null);
    fetchAll();
    const timer = window.setTimeout(() => closeRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [open, fetchAll]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const toggleCourier = (id: number) =>
    setEnabledIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const saveCouriers = async () => {
    setSaving(true);
    try {
      await api.put(`/courier/by-club/${clubId}`, { courierIds: enabledIds });
      await fetchAll();
      onChanged();
      toast.success('Métodos de envío actualizados.');
    } catch (err) {
      console.error(err);
      toast.error('No se pudieron guardar los métodos de envío.');
    } finally {
      setSaving(false);
    }
  };

  const saveFee = async (courierId: number) => {
    const value = feeEdits[courierId];
    if (!value || isNaN(Number(value))) {
      toast.error('Ingresá un costo válido');
      return;
    }
    try {
      await api.put(`/courier/by-club/${clubId}/fee/${courierId}`, { baseFee: Number(value) });
      await fetchAll();
      toast.success('Tarifa actualizada.');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo actualizar la tarifa.');
    }
  };

  const saveRider = async () => {
    if (!editing) return;
    try {
      await api.put(`/rider-profile/${editing.id}`, {
        vehicleType: editing.vehicleType,
        licensePlate: editing.licensePlate,
        availability: editing.availability,
        zonesCovered: editing.zonesCovered,
        isActive: editing.isActive,
        costPerKm: editing.costPerKm ? Number(editing.costPerKm) : undefined,
      });
      await fetchAll();
      onChanged();
      setEditing(null);
      toast.success('Rider actualizado.');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo actualizar el rider.');
    }
  };

  const deactivateRider = async (riderId: number) => {
    try {
      await api.put(`/rider-profile/${riderId}`, { isActive: false, availability: false });
      setRiders((prev) => prev.map((r) => (r.id === riderId ? { ...r, isActive: false, availability: false } : r)));
      setConfirmId(null);
      onChanged();
      toast.success('Rider dado de baja.');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo dar de baja al rider.');
    }
  };

  const tabClass = (isActive: boolean) =>
    `min-h-[44px] border-b-2 px-4 text-sm font-semibold transition-colors ${
      isActive ? 'border-aurora-terracotta text-aurora-terracotta' : 'border-transparent text-aurora-navy/60 hover:text-aurora-navy'
    }`;

  const renderRiderForm = (rider: RiderProfile) => (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setEditing(null)}
        className="flex min-h-[44px] items-center gap-1 text-sm font-semibold text-aurora-navy/60 hover:text-aurora-navy"
      >
        <Icon name="chevronLeft" className="h-4 w-4" />
        Volver a la lista
      </button>
      <h3 className="font-display text-lg font-bold text-aurora-navy">
        {rider.firstName} {rider.lastName}
      </h3>
      <div>
        <label htmlFor="rider-vehicle" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Vehículo</label>
        <select
          id="rider-vehicle"
          value={rider.vehicleType ?? ''}
          onChange={(e) => setEditing({ ...rider, vehicleType: e.target.value as any })}
          className={fieldClass}
        >
          {VEHICLE_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="rider-plate" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Patente</label>
        <input
          id="rider-plate"
          type="text"
          value={rider.licensePlate ?? ''}
          onChange={(e) => setEditing({ ...rider, licensePlate: e.target.value })}
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="rider-zones" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Zonas cubiertas</label>
        <input
          id="rider-zones"
          type="text"
          value={rider.zonesCovered ?? ''}
          onChange={(e) => setEditing({ ...rider, zonesCovered: e.target.value })}
          placeholder="CABA, GBA"
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="rider-km" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Costo por km ($)</label>
        <input
          id="rider-km"
          type="number"
          value={rider.costPerKm ?? ''}
          onChange={(e) => setEditing({ ...rider, costPerKm: e.target.value })}
          placeholder="Ej: 150"
          className={fieldClass}
        />
      </div>
      <label className="flex min-h-[44px] items-center gap-3 text-sm text-aurora-navy/80">
        <input
          type="checkbox"
          checked={rider.availability}
          onChange={(e) => setEditing({ ...rider, availability: e.target.checked })}
          className="h-5 w-5 rounded border-aurora-navy/25 text-aurora-terracotta"
        />
        Disponible
      </label>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="min-h-[44px] flex-1 rounded-lg border border-aurora-navy/20 text-sm font-semibold text-aurora-navy hover:bg-aurora-cream"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={saveRider}
          className="min-h-[44px] flex-1 rounded-lg bg-aurora-terracotta text-sm font-semibold text-white hover:bg-aurora-terracottaDark"
        >
          Guardar
        </button>
      </div>
    </div>
  );

  const renderRiders = () => {
    if (riders.length === 0) {
      return (
        <div className="rounded-2xl border border-aurora-navy/10 bg-aurora-cream px-5 py-10 text-center text-sm text-aurora-navy/60">
          Todavía no asignaste el rol de rider a ningún emprendedor de este club.
        </div>
      );
    }
    return (
      <ul className="space-y-3">
        {riders.map((rider) => (
          <li key={rider.id} className="rounded-2xl border border-aurora-navy/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-aurora-navy">
                  {rider.firstName} {rider.lastName}
                </p>
                <p className="truncate text-xs text-aurora-navy/55">
                  {rider.email}
                  {rider.phoneNumber ? ` · ${rider.phoneNumber}` : ''}
                </p>
              </div>
              <span
                className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${
                  rider.isActive
                    ? 'border-aurora-gold/30 bg-aurora-gold/10 text-aurora-navy'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {rider.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-aurora-navy/70">
              <div>
                <dt className="text-aurora-navy/45">Vehículo</dt>
                <dd>{rider.vehicleType ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-aurora-navy/45">$/km</dt>
                <dd>{rider.costPerKm ? `$${Number(rider.costPerKm).toLocaleString('es-AR')}` : '—'}</dd>
              </div>
              <div>
                <dt className="text-aurora-navy/45">Disponible</dt>
                <dd>{rider.availability ? 'Sí' : 'No'}</dd>
              </div>
              <div>
                <dt className="text-aurora-navy/45">Entregas</dt>
                <dd>
                  {rider.totalDeliveries} ({rider.currentAssignments} activas)
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-aurora-navy/45">Zonas</dt>
                <dd>{rider.zonesCovered ?? '—'}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setEditing(rider)}
                className="min-h-[44px] text-sm font-semibold text-aurora-terracotta hover:text-aurora-terracottaDark"
              >
                Editar
              </button>
              {rider.isActive && confirmId !== rider.id && (
                <button
                  type="button"
                  onClick={() => setConfirmId(rider.id)}
                  className="min-h-[44px] text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Dar de baja
                </button>
              )}
              {confirmId === rider.id && (
                <span className="flex items-center gap-2 text-sm">
                  <span className="text-aurora-navy/70">¿Confirmás?</span>
                  <button
                    type="button"
                    onClick={() => deactivateRider(rider.id)}
                    className="min-h-[44px] rounded-lg bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Sí, dar de baja
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="min-h-[44px] px-2 text-sm font-semibold text-aurora-navy/60"
                  >
                    No
                  </button>
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderCouriers = () => (
    <div>
      <p className="mb-4 text-sm text-aurora-navy/60">
        Elegí con qué empresas trabaja el club. Las externas llevan un costo fijo; los riders propios cobran por km según su perfil.
      </p>
      <div className="space-y-3">
        {allCouriers.map((courier) => {
          const enabled = enabledIds.includes(courier.id);
          const linked = clubCouriers.find((c) => c.id === courier.id);
          return (
            <div key={courier.id} className="rounded-xl border border-aurora-navy/10 px-4 py-3">
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggleCourier(courier.id)}
                  className="h-5 w-5 rounded border-aurora-navy/25 text-aurora-terracotta"
                />
                <span className="text-sm font-semibold text-aurora-navy">{courier.name}</span>
                {courier.isInternal && <span className="text-xs text-aurora-navy/45">(Riders propios)</span>}
              </label>
              {enabled && !courier.isInternal && linked && (
                <div className="mt-2 flex flex-wrap items-center gap-2 pl-8">
                  <label htmlFor={`fee-${courier.id}`} className="text-xs text-aurora-navy/60">
                    Costo fijo ($)
                  </label>
                  <input
                    id={`fee-${courier.id}`}
                    type="number"
                    value={feeEdits[courier.id] ?? ''}
                    onChange={(e) => setFeeEdits({ ...feeEdits, [courier.id]: e.target.value })}
                    className="min-h-[44px] w-28 rounded-lg border border-aurora-navy/15 px-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => saveFee(courier.id)}
                    className="min-h-[44px] rounded-lg bg-aurora-terracotta/10 px-3 text-xs font-semibold text-aurora-terracotta hover:bg-aurora-terracotta/20"
                  >
                    Guardar tarifa
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={saveCouriers}
        disabled={saving}
        className="mt-5 min-h-[44px] w-full rounded-lg bg-aurora-navy px-5 text-sm font-semibold text-white hover:bg-aurora-navyLight disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar métodos de envío'}
      </button>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-aurora-navyDark/50"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Riders y empresas de envío"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-aurora-cream shadow-aurora"
      >
        <div className="flex items-center justify-between border-b border-aurora-navy/10 bg-white px-5 py-3">
          <h2 className="font-display text-lg font-bold text-aurora-navy">Riders y empresas</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel"
            className="flex h-11 w-11 items-center justify-center rounded-full text-aurora-navy/60 hover:bg-aurora-cream"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="flex border-b border-aurora-navy/10 bg-white px-3">
          <button type="button" onClick={() => setTab('riders')} className={tabClass(tab === 'riders')}>
            Mis riders
          </button>
          <button type="button" onClick={() => setTab('couriers')} className={tabClass(tab === 'couriers')}>
            Empresas de envío
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          {loading ? (
            <div className="animate-pulse space-y-3" aria-busy="true">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-28 rounded-2xl bg-aurora-navy/10" />
              ))}
            </div>
          ) : error ? (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  fetchAll();
                }}
                className="mt-3 min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          ) : tab === 'riders' ? (
            editing ? renderRiderForm(editing) : renderRiders()
          ) : (
            renderCouriers()
          )}
        </div>
      </aside>
    </div>
  );
};

export default RidersDrawer;