import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import api, { getResponseData } from '../../../../api/config';
import { RiderProfile, Courier } from '../../../../types/delivery';
import { Club } from '../../../../types/club';
import toast from 'react-hot-toast';

const VEHICLE_OPTIONS = ['Moto', 'Auto', 'Bicicleta', 'A_Pie'];

const ManageRidersPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState<Club | null>(null);
  const [riders, setRiders] = useState<RiderProfile[]>([]);
  const [allCouriers, setAllCouriers] = useState<Courier[]>([]);
  const [clubCouriers, setClubCouriers] = useState<Courier[]>([]);
  const [enabledCourierIds, setEnabledCourierIds] = useState<number[]>([]);
  const [feeEdits, setFeeEdits] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<'riders' | 'couriers'>('riders');
  const [editingRider, setEditingRider] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingCouriers, setSavingCouriers] = useState(false);

  const fetchAll = React.useCallback(async () => {
    try {
      const [clubRes, ridersRes, allCouriersRes, clubCouriersRes] = await Promise.all([
        api.get(`/clubs/${clubId}`),
        api.get(`/rider-profile/by-club/${clubId}`),
        api.get('/courier'),
        api.get(`/courier/by-club/${clubId}`),
      ]);
      setClub(getResponseData(clubRes));
      setRiders(getResponseData(ridersRes) || []);
      setAllCouriers(getResponseData(allCouriersRes) || []);
      const enabled: Courier[] = getResponseData(clubCouriersRes) || [];
      setClubCouriers(enabled);
      setEnabledCourierIds(enabled.map((c) => c.id));
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
    if (authLoading) return;
    if (!clubId || userRole !== 'entrepreneur') {
      navigate('/login');
      return;
    }
    fetchAll();
  }, [clubId, userRole, authLoading, navigate, fetchAll]);

  const toggleCourier = (courierId: number) => {
    setEnabledCourierIds((prev) =>
      prev.includes(courierId) ? prev.filter((id) => id !== courierId) : [...prev, courierId],
    );
  };

  const saveCouriers = async () => {
  setSavingCouriers(true);
  try {
    await api.put(`/courier/by-club/${clubId}`, { courierIds: enabledCourierIds });
    await fetchAll();
    toast.success('Métodos de envío actualizados.');
  } catch (err) {
    console.error(err);
    toast.error('No se pudieron guardar los métodos de envío.');
  } finally {
    setSavingCouriers(false);
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
  if (!editingRider) return;
  try {
    await api.put(`/rider-profile/${editingRider.id}`, {
      vehicleType: editingRider.vehicleType,
      licensePlate: editingRider.licensePlate,
      availability: editingRider.availability,
      zonesCovered: editingRider.zonesCovered,
      isActive: editingRider.isActive,
      costPerKm: editingRider.costPerKm ? Number(editingRider.costPerKm) : undefined,
    });
    await fetchAll();
    setEditingRider(null);
  } catch (err) {
    console.error(err);
    toast.error('No se pudo actualizar el rider.');
  }
};

const deactivateRider = (riderId: number) => {
  toast((t) => (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">¿Dar de baja a este rider?</p>
      <div className="flex gap-2 justify-end">
        <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancelar
        </button>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await api.put(`/rider-profile/${riderId}`, { isActive: false, availability: false });
              setRiders((prev) => prev.map((r) => (r.id === riderId ? { ...r, isActive: false, availability: false } : r)));
            } catch (err) {
              console.error(err);
              toast.error('No se pudo dar de baja al rider.');
            }
          }}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Dar de baja
        </button>
      </div>
    </div>
  ), { duration: Infinity });
};

  if (authLoading || loading) return <div className="text-center py-16 text-aurora-navy/60">Cargando...</div>;
  if (error || !club) return <div className="text-center py-16 text-red-600">{error || 'Club no encontrado.'}</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-aurora-navy">Gestionar Logística</h1>
        <p className="text-sm text-aurora-navy/50 mt-1">{club.name}</p>
      </div>
      <div className="flex gap-2 mb-6 border-b border-aurora-navy/10">
        <button
          onClick={() => setActiveTab('riders')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'riders' ? 'border-aurora-terracotta text-aurora-terracotta' : 'border-transparent text-aurora-navy/50 hover:text-aurora-navy'}`}
        >
          Mis Riders
        </button>
        <button
          onClick={() => setActiveTab('couriers')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'couriers' ? 'border-aurora-terracotta text-aurora-terracotta' : 'border-transparent text-aurora-navy/50 hover:text-aurora-navy'}`}
        >
          Empresas de Envío
        </button>
      </div>
      {activeTab === 'riders' && (
        <div className="bg-white border border-aurora-navy/10 rounded-xl shadow-aurora-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-aurora-navy/10">
              <thead className="bg-aurora-cream">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Vehículo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Zonas</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">$/km</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Disponible</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Entregas</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aurora-navy/10">
                {riders.map((rider) => (
                  <tr key={rider.id} className="hover:bg-aurora-cream/60">
                    <td className="px-6 py-4 text-sm font-medium text-aurora-navy whitespace-nowrap">{rider.firstName} {rider.lastName}</td>
                    <td className="px-6 py-4 text-sm text-aurora-navy/70 whitespace-nowrap">{rider.email}{rider.phoneNumber ? ` · ${rider.phoneNumber}` : ''}</td>
                    <td className="px-6 py-4 text-sm text-aurora-navy/70 whitespace-nowrap">{rider.vehicleType ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-aurora-navy/70 max-w-xs truncate">{rider.zonesCovered ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-aurora-navy/70 whitespace-nowrap">{rider.costPerKm ? `$${Number(rider.costPerKm).toLocaleString('es-AR')}` : '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${rider.availability ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-aurora-navy/5 text-aurora-navy/60 border-aurora-navy/15'}`}>
                        {rider.availability ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-aurora-navy/70 whitespace-nowrap">{rider.totalDeliveries} ({rider.currentAssignments} activas)</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${rider.isActive ? 'bg-aurora-gold/10 text-aurora-navy border-aurora-gold/30' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {rider.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <button onClick={() => setEditingRider(rider)} className="text-aurora-terracotta hover:text-aurora-terracottaDark font-medium mr-4">Editar</button>
                      {rider.isActive && (
                        <button onClick={() => deactivateRider(rider.id)} className="text-red-600 hover:text-red-700 font-medium">Dar de baja</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {riders.length === 0 && (
            <div className="text-center py-16 text-aurora-navy/50">Todavía no asignaste el rol de rider a ningún emprendedor de este club.</div>
          )}
        </div>
      )}
      {activeTab === 'couriers' && (
        <div className="bg-white border border-aurora-navy/10 rounded-xl shadow-aurora-sm p-6">
          <h2 className="text-base font-semibold text-aurora-navy mb-1">Métodos de envío habilitados</h2>
          <p className="text-sm text-aurora-navy/50 mb-5">Elegí con qué empresas u opciones de entrega trabaja este club y configurá el costo fijo de envío para las empresas externas. Para riders propios, el costo se calcula por km configurado en cada perfil de rider en "Mis Riders".</p>
          <div className="space-y-3">
            {allCouriers.map((courier) => {
              const enabled = enabledCourierIds.includes(courier.id);
              const linked = clubCouriers.find((c) => c.id === courier.id);
              return (
                <div key={courier.id} className="border border-aurora-navy/10 rounded-lg px-4 py-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => toggleCourier(courier.id)}
                      className="h-4 w-4 text-aurora-navy rounded border-aurora-navy/25 focus:ring-aurora-navy"
                    />
                    <span className="text-sm font-medium text-aurora-navy">{courier.name}</span>
                    {courier.isInternal && <span className="text-xs text-aurora-navy/40">(Riders propios)</span>}
                  </label>
                  {enabled && !courier.isInternal && linked && (
                    <div className="flex items-center gap-2 mt-3 pl-7">
                      <span className="text-xs text-aurora-navy/50">Costo fijo de envío ($)</span>
                      <input
                        type="number"
                        value={feeEdits[courier.id] ?? ''}
                        onChange={(e) => setFeeEdits({ ...feeEdits, [courier.id]: e.target.value })}
                        className="w-28 px-2 py-1 border border-aurora-navy/15 rounded text-sm"
                      />
                      <button onClick={() => saveFee(courier.id)} className="text-xs font-medium px-3 py-1 rounded bg-aurora-terracotta/10 text-aurora-terracotta hover:bg-aurora-terracotta/20">
                        Guardar tarifa
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button
            onClick={saveCouriers}
            disabled={savingCouriers}
            className="mt-6 px-5 py-2.5 bg-aurora-navy text-white text-sm font-medium rounded-lg hover:bg-aurora-navy/90 disabled:opacity-50 transition-colors"
          >
            {savingCouriers ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}
      {editingRider && (
        <div className="fixed inset-0 bg-aurora-navy/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-serif font-semibold text-aurora-navy mb-4">Editar rider: {editingRider.firstName} {editingRider.lastName}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-aurora-navy/50 mb-1">Vehículo</label>
                <select
                  value={editingRider.vehicleType ?? ''}
                  onChange={(e) => setEditingRider({ ...editingRider, vehicleType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm"
                >
                  {VEHICLE_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-aurora-navy/50 mb-1">Patente</label>
                <input
                  type="text"
                  value={editingRider.licensePlate ?? ''}
                  onChange={(e) => setEditingRider({ ...editingRider, licensePlate: e.target.value })}
                  className="w-full px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-aurora-navy/50 mb-1">Zonas cubiertas</label>
                <input
                  type="text"
                  value={editingRider.zonesCovered ?? ''}
                  onChange={(e) => setEditingRider({ ...editingRider, zonesCovered: e.target.value })}
                  className="w-full px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm"
                  placeholder="CABA, GBA"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-aurora-navy/50 mb-1">Costo por km ($)</label>
                <input
                  type="number"
                  value={editingRider.costPerKm ?? ''}
                  onChange={(e) => setEditingRider({ ...editingRider, costPerKm: e.target.value })}
                  className="w-full px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm"
                  placeholder="Ej: 150"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingRider.availability}
                  onChange={(e) => setEditingRider({ ...editingRider, availability: e.target.checked })}
                  className="h-4 w-4 text-aurora-navy rounded border-aurora-navy/25"
                />
                <span className="text-sm text-aurora-navy/80">Disponible</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditingRider(null)} className="px-4 py-2 text-sm font-medium text-aurora-navy/60 hover:text-aurora-navy">Cancelar</button>
              <button onClick={saveRider} className="px-4 py-2 bg-aurora-terracotta text-white text-sm font-medium rounded-lg hover:bg-aurora-terracottaDark">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRidersPage;