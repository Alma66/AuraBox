import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../api/config';

type InboundType = 'Consulta' | 'Trabajo';
type InboundStatus = 'Nuevo' | 'En_Revision' | 'Respondido' | 'Archivado';

interface InboundRequest {
  id: number;
  type: InboundType;
  status: InboundStatus;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  area: string | null;
  profileUrl: string | null;
  message: string;
  createdAt: string;
  handledAt: string | null;
}

const TABS: { id: InboundType; label: string }[] = [
  { id: 'Consulta', label: 'Consultas' },
  { id: 'Trabajo', label: 'Postulaciones' },
];

const STATUS_FILTERS: { id: '' | InboundStatus; label: string }[] = [
  { id: '', label: 'Todas' },
  { id: 'Nuevo', label: 'Nuevas' },
  { id: 'En_Revision', label: 'En revisión' },
  { id: 'Respondido', label: 'Respondidas' },
  { id: 'Archivado', label: 'Archivadas' },
];

const STATUS_LABEL: Record<InboundStatus, string> = {
  Nuevo: 'Nueva',
  En_Revision: 'En revisión',
  Respondido: 'Respondida',
  Archivado: 'Archivada',
};

const STATUS_STYLE: Record<InboundStatus, string> = {
  Nuevo: 'bg-aurora-terracotta/10 text-aurora-terracotta',
  En_Revision: 'bg-aurora-gold/20 text-aurora-navy',
  Respondido: 'bg-green-100 text-green-700',
  Archivado: 'bg-aurora-navy/10 text-aurora-navy/60',
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const isSafeUrl = (value: string | null) => !!value && /^https?:\/\//i.test(value);

const AdminInboxPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: InboundType = searchParams.get('tab') === 'Trabajo' ? 'Trabajo' : 'Consulta';
  const statusParam = searchParams.get('status') as InboundStatus | null;
  const status: '' | InboundStatus = STATUS_FILTERS.some((item) => item.id === statusParam) ? (statusParam as InboundStatus) : '';

  const [items, setItems] = useState<InboundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await api.get('/inbound-requests', { params: { type: tab, ...(status ? { status } : {}) } });
      setItems(getResponseData(res) || []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [tab, status]);

  useEffect(() => {
    setOpenId(null);
    load();
  }, [load]);

  const updateParams = (next: { tab?: InboundType; status?: '' | InboundStatus }) => {
    const params = new URLSearchParams();
    params.set('tab', next.tab ?? tab);
    const nextStatus = next.status === undefined ? status : next.status;
    if (nextStatus) params.set('status', nextStatus);
    setSearchParams(params, { replace: true });
  };

  const changeStatus = async (item: InboundRequest, next: InboundStatus) => {
    if (updatingId !== null || item.status === next) return;
    setUpdatingId(item.id);
    try {
      await api.patch(`/inbound-requests/${item.id}/status`, { status: next });
      toast.success('Estado actualizado.');
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'No se pudo actualizar el estado.');
    } finally {
      setUpdatingId(null);
    }
  };

  const replyHref = (item: InboundRequest) => {
    const subject = item.type === 'Consulta' ? `Re: ${item.subject ?? 'Tu consulta en AuraBox'}` : 'Tu postulación en AuraBox';
    return `mailto:${item.email}?subject=${encodeURIComponent(subject)}`;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-aurora-navy">Bandeja de entrada</h1>
        <p className="mt-1 text-sm text-aurora-navy/60">Consultas del formulario de contacto y postulaciones para trabajar en AuraBox.</p>
      </div>

      <div role="tablist" aria-label="Tipo de solicitud" className="mb-4 flex gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={tab === item.id}
            onClick={() => updateParams({ tab: item.id })}
            className={`min-h-[44px] rounded-full px-5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-terracotta ${
              tab === item.id ? 'bg-aurora-navy text-aurora-cream' : 'bg-white text-aurora-navy/70 hover:text-aurora-terracotta'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {STATUS_FILTERS.map((item) => (
          <button
            key={item.id || 'all'}
            type="button"
            aria-pressed={status === item.id}
            onClick={() => updateParams({ status: item.id })}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              status === item.id
                ? 'border-aurora-terracotta bg-aurora-terracotta/10 text-aurora-terracotta'
                : 'border-aurora-navy/15 bg-white text-aurora-navy/60 hover:border-aurora-navy/30'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-16" role="status" aria-label="Cargando">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
        </div>
      )}

      {!loading && failed && (
        <div role="alert" className="card-surface p-8 text-center">
          <p className="mb-4 text-aurora-navy/70">No pudimos cargar la bandeja.</p>
          <button type="button" onClick={load} className="btn-primary">Reintentar</button>
        </div>
      )}

      {!loading && !failed && items.length === 0 && (
        <div className="card-surface p-10 text-center text-aurora-navy/60">No hay solicitudes con este filtro.</div>
      )}

      {!loading && !failed && items.length > 0 && (
        <ul className="space-y-3">
          {items.map((item) => {
            const open = openId === item.id;
            return (
              <li key={item.id} className="card-surface shadow-aurora-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : item.id)}
                  aria-expanded={open}
                  className="flex w-full items-start justify-between gap-4 p-4 text-left transition-colors hover:bg-aurora-cream/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-aurora-terracotta"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-aurora-navy">
                      {item.type === 'Consulta' ? item.subject : item.area}
                    </span>
                    <span className="block truncate text-sm text-aurora-navy/60">
                      {item.fullName} · {item.email}
                    </span>
                    <span className="block text-xs text-aurora-navy/40">{formatDate(item.createdAt)}</span>
                  </span>
                  <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[item.status]}`}>
                    {STATUS_LABEL[item.status]}
                  </span>
                </button>

                {open && (
                  <div className="space-y-4 border-t border-aurora-navy/10 p-4">
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-aurora-navy/80">{item.message}</p>

                    <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      {item.phone && (
                        <div>
                          <dt className="text-xs text-aurora-navy/50">Teléfono</dt>
                          <dd className="text-aurora-navy">{item.phone}</dd>
                        </div>
                      )}
                      {isSafeUrl(item.profileUrl) && (
                        <div>
                          <dt className="text-xs text-aurora-navy/50">Perfil</dt>
                          <dd>
                            <a href={item.profileUrl as string} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-aurora-terracotta hover:text-aurora-terracottaDark">
                              {item.profileUrl}
                            </a>
                          </dd>
                        </div>
                      )}
                      {item.handledAt && (
                        <div>
                          <dt className="text-xs text-aurora-navy/50">Última gestión</dt>
                          <dd className="text-aurora-navy">{formatDate(item.handledAt)}</dd>
                        </div>
                      )}
                    </dl>

                    <div className="flex flex-wrap items-center gap-2">
                      <a href={replyHref(item)} className="btn-primary !px-4 !py-2 text-sm">Responder por email</a>
                      {(['En_Revision', 'Respondido', 'Archivado', 'Nuevo'] as InboundStatus[])
                        .filter((next) => next !== item.status)
                        .map((next) => (
                          <button
                            key={next}
                            type="button"
                            disabled={updatingId === item.id}
                            onClick={() => changeStatus(item, next)}
                            className="btn-outline !px-4 !py-2 text-sm disabled:opacity-50"
                          >
                            {next === 'Nuevo' ? 'Marcar como nueva' : `Pasar a ${STATUS_LABEL[next].toLowerCase()}`}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AdminInboxPage;