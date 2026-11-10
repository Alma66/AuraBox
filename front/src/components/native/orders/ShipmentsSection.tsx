import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../../api/config';
import { ClubSummary, getClubSummary } from '../../../utils/dataCache';
import { formatBoxMonth, formatDate } from '../../../utils/format';
import { tapFeedback } from '../../../utils/native';
import SafeImage from '../../common/SafeImage';

type ShipmentStatus = 'Pendiente' | 'Asignado' | 'En_Camino' | 'Entregado' | 'Problema' | 'Devuelto';

interface ShipmentEntry {
  id: number;
  idClub?: number | null;
  boxMonthYear: string;
  shipmentStatus: ShipmentStatus;
  trackingNumber?: string | null;
  estimatedDeliveryStartDate?: string | null;
  estimatedDeliveryEndDate?: string | null;
  actualDeliveryDate?: string | null;
}

const STEP_LABELS = ['Preparando', 'Asignado', 'En camino', 'Entregado'];

const STEP_INDEX: Partial<Record<ShipmentStatus, number>> = {
  Pendiente: 0,
  Asignado: 1,
  En_Camino: 2,
  Entregado: 3,
};

const PILL_COLORS: Record<ShipmentStatus, string> = {
  Pendiente: 'bg-aurora-navy/10 text-aurora-navy/75',
  Asignado: 'bg-aurora-gold/20 text-aurora-terracottaDark',
  En_Camino: 'bg-aurora-terracotta/15 text-aurora-terracottaDark',
  Entregado: 'bg-green-100 text-green-700',
  Problema: 'bg-red-100 text-red-700',
  Devuelto: 'bg-orange-100 text-orange-700',
};

const PILL_LABELS: Record<ShipmentStatus, string> = {
  Pendiente: 'Preparando',
  Asignado: 'Asignado',
  En_Camino: 'En camino',
  Entregado: 'Entregado',
  Problema: 'Con problemas',
  Devuelto: 'Devuelto',
};

const isOpen = (status: ShipmentStatus) => status !== 'Entregado' && status !== 'Devuelto';

const deliveryText = (shipment: ShipmentEntry): string | null => {
  if (shipment.actualDeliveryDate) return `Entregado el ${formatDate(shipment.actualDeliveryDate)}`;
  const start = shipment.estimatedDeliveryStartDate;
  const end = shipment.estimatedDeliveryEndDate;
  if (start && end && formatDate(start) !== formatDate(end)) {
    return `Llega entre el ${formatDate(start)} y el ${formatDate(end)}`;
  }
  if (start) return `Llega aproximadamente el ${formatDate(start)}`;
  return null;
};

const ShipmentsSection: React.FC<{ userId: number }> = ({ userId }) => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<ShipmentEntry[]>([]);
  const [clubs, setClubs] = useState<Record<number, ClubSummary>>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setFailed(false);
      try {
        const response = await api.get(`/shipments/by-user/${userId}`);
        const list: ShipmentEntry[] = getResponseData(response) || [];
        const clubIds = Array.from(new Set(list.map((item) => item.idClub).filter((id): id is number => Boolean(id))));
        const results = await Promise.all(clubIds.map((id) => getClubSummary(id)));
        if (!active) return;
        const clubMap: Record<number, ClubSummary> = {};
        results.forEach((club) => {
          if (club) clubMap[club.id] = club;
        });
        setShipments(list);
        setClubs(clubMap);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [userId, reloadKey]);

  const sorted = useMemo(
    () =>
      [...shipments].sort((a, b) => {
        const openDiff = Number(isOpen(b.shipmentStatus)) - Number(isOpen(a.shipmentStatus));
        return openDiff !== 0 ? openDiff : b.boxMonthYear.localeCompare(a.boxMonthYear);
      }),
    [shipments],
  );

  const copyTracking = async (value: string) => {
    tapFeedback();
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Número de seguimiento copiado');
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" role="status" aria-label="Cargando envíos">
        {[0, 1].map((item) => (
          <div key={item} className="h-40 animate-pulse rounded-3xl bg-white shadow-aurora-sm" />
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <div role="alert" className="py-12 text-center">
        <p className="text-5xl" aria-hidden="true">📡</p>
        <h2 className="mt-4 font-display text-xl font-bold text-aurora-navy">No pudimos cargar tus envíos</h2>
        <p className="mt-1 text-sm text-aurora-navy/60">Revisá tu conexión e intentá de nuevo.</p>
        <button
          type="button"
          onClick={() => {
            tapFeedback();
            setReloadKey((value) => value + 1);
          }}
          className="btn-primary mt-5"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-5xl" aria-hidden="true">📦</p>
        <h2 className="mt-4 font-display text-xl font-bold text-aurora-navy">Todavía no tenés envíos</h2>
        <p className="mt-1 text-sm text-aurora-navy/60">Cuando el club despache tu caja, vas a poder seguirla acá.</p>
        <button type="button" onClick={() => navigate('/explore')} className="btn-primary mt-5">
          Explorar clubes
        </button>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {sorted.map((shipment, index) => {
        const club = shipment.idClub ? clubs[shipment.idClub] : undefined;
        const stepIndex = STEP_INDEX[shipment.shipmentStatus];
        const eta = deliveryText(shipment);
        return (
          <li
            key={shipment.id}
            className="animate-fadeInUp rounded-3xl bg-white p-4 shadow-aurora-sm ring-1 ring-aurora-navy/5"
            style={{ animationDelay: `${Math.min(index, 6) * 60}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-aurora-navy/10 bg-aurora-cream">
                <SafeImage src={club?.logoUrl} alt={club?.name || 'Club'} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-bold leading-tight text-aurora-navy">{club?.name || 'Club'}</p>
                <p className="text-xs text-aurora-navy/55">Caja de {formatBoxMonth(shipment.boxMonthYear)}</p>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${PILL_COLORS[shipment.shipmentStatus]}`}>
                {PILL_LABELS[shipment.shipmentStatus]}
              </span>
            </div>

            {stepIndex !== undefined && (
              <div className="mt-4 grid grid-cols-4 gap-1.5">
                {STEP_LABELS.map((label, position) => (
                  <div key={label}>
                    <span className={`block h-1.5 rounded-full ${position <= stepIndex ? 'bg-aurora-terracotta' : 'bg-aurora-navy/10'}`} />
                    <span
                      className={`mt-1.5 block text-center text-[10px] font-semibold ${
                        position === stepIndex ? 'text-aurora-terracotta' : 'text-aurora-navy/45'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {shipment.shipmentStatus === 'Problema' && (
              <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                Hubo un problema con este envío. Comunicate con el club para resolverlo.
              </p>
            )}
            {shipment.shipmentStatus === 'Devuelto' && (
              <p className="mt-4 rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
                Este envío fue devuelto al club. Contactalo para coordinar una nueva entrega.
              </p>
            )}

            {eta && <p className="mt-3 text-sm font-semibold text-aurora-navy/75">{eta}</p>}

            {shipment.trackingNumber && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-aurora-cream px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-[11px] text-aurora-navy/50">Número de seguimiento</p>
                  <p className="truncate text-sm font-bold text-aurora-navy">{shipment.trackingNumber}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyTracking(shipment.trackingNumber as string)}
                  className="min-h-[40px] shrink-0 rounded-xl bg-white px-3 text-xs font-bold text-aurora-navy shadow-aurora-sm active:scale-95"
                >
                  Copiar
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default ShipmentsSection;