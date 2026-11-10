import React, { useEffect, useMemo, useState } from 'react';
import api, { getResponseData } from '../../../api/config';
import { formatBoxMonth, formatDate } from '../../../utils/format';
import { tapFeedback } from '../../../utils/native';
import BottomSheet from '../BottomSheet';

interface BoxItem {
  id: number;
  deliveryMonthYear: string;
  productName: string;
  productDescription: string;
  usageInstructions?: string | null;
  productExpirationDate?: string | null;
  productImageUrl?: string | null;
  productVideoUrl?: string | null;
  additionalNotes?: string | null;
  ageRestriction?: boolean;
  originLocation?: string | null;
  containsAllergens?: boolean;
  allergensDetail?: string | null;
  isDangerousItem?: boolean;
  dangerDetail?: string | null;
  requiresCleaning?: boolean;
  cleaningInstructions?: string | null;
}

type BoxState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; items: BoxItem[] };

interface BoxContentSheetProps {
  planId: number;
  planName: string;
  onClose: () => void;
}

const BoxContentSheet: React.FC<BoxContentSheetProps> = ({ planId, planName, onClose }) => {
  const [state, setState] = useState<BoxState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setState({ status: 'loading' });
      try {
        const response = await api.get(`/box-content-history/by-subscription-type/${planId}`);
        const items: BoxItem[] = getResponseData(response) || [];
        if (active) setState({ status: 'ready', items });
      } catch {
        if (active) setState({ status: 'error' });
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [planId, reloadKey]);

  const groups = useMemo(() => {
    if (state.status !== 'ready') return [];
    const map: Record<string, BoxItem[]> = {};
    state.items.forEach((item) => {
      if (!map[item.deliveryMonthYear]) map[item.deliveryMonthYear] = [];
      map[item.deliveryMonthYear].push(item);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [state]);

  return (
    <BottomSheet open title={`Caja de ${planName}`} onClose={onClose}>
      {state.status === 'loading' && (
        <div className="space-y-3 py-2" role="status" aria-label="Cargando contenido">
          {[0, 1].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl bg-aurora-cream" />
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div role="alert" className="py-8 text-center">
          <p className="text-sm text-aurora-navy/70">No pudimos cargar el contenido de la caja.</p>
          <button
            type="button"
            onClick={() => {
              tapFeedback();
              setReloadKey((value) => value + 1);
            }}
            className="btn-outline mt-4 !px-5 !py-2 !text-sm"
          >
            Reintentar
          </button>
        </div>
      )}

      {state.status === 'ready' && groups.length === 0 && (
        <p className="py-8 text-center text-sm text-aurora-navy/60">Todavía no hay contenido publicado para esta caja.</p>
      )}

      {state.status === 'ready' &&
        groups.map(([month, items]) => (
          <div key={month} className="mb-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-aurora-navy/50">{formatBoxMonth(month)}</p>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-2xl bg-aurora-cream p-3">
                  {item.productImageUrl && (
                    <img src={item.productImageUrl} alt={item.productName} loading="lazy" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-bold text-aurora-navy">{item.productName}</p>
                    <p className="selectable text-xs leading-relaxed text-aurora-navy/70">{item.productDescription}</p>
                    {item.originLocation && <p className="text-xs text-aurora-navy/60">Origen: {item.originLocation}</p>}
                    {item.usageInstructions && <p className="text-xs text-aurora-navy/60">Cómo usarlo: {item.usageInstructions}</p>}
                    {item.productExpirationDate && <p className="text-xs text-aurora-navy/60">Vence: {formatDate(item.productExpirationDate)}</p>}
                    {item.containsAllergens && (
                      <p className="text-xs font-semibold text-orange-700">Alérgenos: {item.allergensDetail || 'contiene alérgenos'}</p>
                    )}
                    {item.isDangerousItem && (
                      <p className="text-xs font-semibold text-red-600">Precaución: {item.dangerDetail || 'producto delicado'}</p>
                    )}
                    {item.ageRestriction && <p className="text-xs font-semibold text-red-600">Solo para mayores de edad</p>}
                    {item.requiresCleaning && (
                      <p className="text-xs text-aurora-navy/60">Limpieza: {item.cleaningInstructions || 'requiere limpieza antes de usar'}</p>
                    )}
                    {item.additionalNotes && <p className="text-xs text-aurora-navy/60">{item.additionalNotes}</p>}
                    {item.productVideoUrl && (
                      <a
                        href={item.productVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-xs font-semibold text-aurora-terracotta underline"
                      >
                        Ver video
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </BottomSheet>
  );
};

export default BoxContentSheet;