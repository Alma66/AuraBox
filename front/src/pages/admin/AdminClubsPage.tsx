import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../api/config';

type ClubStatus = 'PENDIENTE_APROBACION' | 'APROBADO' | 'SUSPENDIDO' | 'INACTIVO';

interface AdminClub {
  id: number;
  name: string;
  logoUrl: string;
  shortDescription: string;
  contactEmail: string;
  clubStatus: ClubStatus;
  creationDate: string;
  averageRating: number | null;
  totalReviews: number;
  owner: { id: number; firstName: string; lastName: string; email: string } | null;
}

interface HistoryEntry {
  id: number;
  previousStatus: ClubStatus;
  newStatus: ClubStatus;
  changeReason: string | null;
  changeDate: string;
  admin: string | null;
}

interface StatusAction {
  label: string;
  status: ClubStatus;
  needsReason: boolean;
  danger: boolean;
}

const STATUS_LABEL: Record<ClubStatus, string> = {
  PENDIENTE_APROBACION: 'Pendiente',
  APROBADO: 'Aprobado',
  SUSPENDIDO: 'Suspendido',
  INACTIVO: 'Inactivo',
};

const STATUS_STYLE: Record<ClubStatus, string> = {
  PENDIENTE_APROBACION: 'bg-aurora-gold/20 text-aurora-navy',
  APROBADO: 'bg-green-100 text-green-700',
  SUSPENDIDO: 'bg-red-100 text-red-700',
  INACTIVO: 'bg-aurora-navy/10 text-aurora-navy/70',
};

const ACTIONS: Record<ClubStatus, StatusAction[]> = {
  PENDIENTE_APROBACION: [
    { label: 'Aprobar', status: 'APROBADO', needsReason: false, danger: false },
    { label: 'Rechazar', status: 'INACTIVO', needsReason: true, danger: true },
  ],
  APROBADO: [{ label: 'Suspender', status: 'SUSPENDIDO', needsReason: true, danger: true }],
  SUSPENDIDO: [{ label: 'Reactivar', status: 'APROBADO', needsReason: false, danger: false }],
  INACTIVO: [{ label: 'Reactivar', status: 'APROBADO', needsReason: false, danger: false }],
};

const FILTERS: { id: string; label: string }[] = [
  { id: '', label: 'Todos' },
  { id: 'PENDIENTE_APROBACION', label: 'Pendientes' },
  { id: 'APROBADO', label: 'Aprobados' },
  { id: 'SUSPENDIDO', label: 'Suspendidos' },
  { id: 'INACTIVO', label: 'Inactivos' },
];

const formatDate = (value: string) => new Date(value).toLocaleDateString('es-AR');

const inputClass =
  'min-h-[44px] w-full rounded-lg border border-aurora-navy/15 bg-white px-3 py-2 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40';

const AdminClubsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const [clubs, setClubs] = useState<AdminClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [dialog, setDialog] = useState<{ club: AdminClub; action: StatusAction } | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [historyClub, setHistoryClub] = useState<AdminClub | null>(null);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await api.get('/admin/clubs', { params: status ? { status } : {} });
      setClubs(getResponseData(res) || []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDialog(null);
        setHistoryClub(null);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const openAction = (club: AdminClub, action: StatusAction) => {
    setReason('');
    setDialog({ club, action });
  };

  const confirmAction = async () => {
    if (!dialog) return;
    if (dialog.action.needsReason && !reason.trim()) {
      toast.error('Indicá el motivo del cambio.');
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/admin/clubs/${dialog.club.id}/status`, {
        status: dialog.action.status,
        reason: reason.trim() || undefined,
      });
      toast.success(`Club ${STATUS_LABEL[dialog.action.status].toLowerCase()}.`);
      setDialog(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'No se pudo cambiar el estado del club.');
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (club: AdminClub) => {
    setHistoryClub(club);
    setHistory(null);
    try {
      const res = await api.get(`/admin/clubs/${club.id}/status-history`);
      setHistory(getResponseData(res) || []);
    } catch {
      setHistory([]);
      toast.error('No se pudo cargar el historial.');
    }
  };

  return (
    <div className="space-y-5 px-4 py-6 lg:px-8">
      <div className="max-w-full overflow-x-auto">
        <div role="group" aria-label="Filtrar por estado" className="inline-flex gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={status === item.id}
              onClick={() => setSearchParams(item.id ? { status: item.id } : {}, { replace: true })}
              className={`min-h-[44px] whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors ${
                status === item.id ? 'bg-aurora-terracotta text-white' : 'bg-white text-aurora-navy/70 hover:text-aurora-navy'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="animate-pulse space-y-3" aria-busy="true">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 rounded-2xl bg-aurora-navy/10" />
          ))}
        </div>
      )}

      {!loading && failed && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p>No se pudieron cargar los clubes.</p>
          <button
            type="button"
            onClick={load}
            className="mt-3 min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !failed && clubs.length === 0 && (
        <div className="rounded-2xl border border-aurora-navy/10 bg-white px-6 py-16 text-center text-sm text-aurora-navy/55">
          No hay clubes con este estado.
        </div>
      )}

      {!loading && !failed && (
        <ul className="space-y-3">
          {clubs.map((club) => (
            <li key={club.id} className="rounded-2xl border border-aurora-navy/10 bg-white p-4 shadow-aurora-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-aurora-terracotta font-bold text-white">
                    {club.logoUrl ? (
                      <img src={club.logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      club.name[0]?.toUpperCase()
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-aurora-navy">{club.name}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[club.clubStatus]}`}>
                        {STATUS_LABEL[club.clubStatus]}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-aurora-navy/60">{club.shortDescription}</p>
                    <p className="mt-2 text-xs text-aurora-navy/50">
                      {club.owner ? `${club.owner.firstName} ${club.owner.lastName} · ${club.owner.email}` : 'Sin emprendedor asociado'}
                    </p>
                    <p className="text-xs text-aurora-navy/50">
                      Alta {formatDate(club.creationDate)}
                      {club.averageRating !== null && ` · ${club.averageRating.toFixed(1)} (${club.totalReviews} reseñas)`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {ACTIONS[club.clubStatus].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => openAction(club, action)}
                      className={`min-h-[44px] rounded-lg px-4 text-sm font-semibold text-white transition-colors ${
                        action.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-aurora-terracotta hover:bg-aurora-terracottaDark'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => openHistory(club)}
                    className="min-h-[44px] rounded-lg border border-aurora-navy/15 bg-white px-4 text-sm font-semibold text-aurora-navy hover:bg-aurora-cream"
                  >
                    Historial
                  </button>
                  <Link
                    to={`/club/${club.id}`}
                    className="flex min-h-[44px] items-center rounded-lg border border-aurora-navy/15 bg-white px-4 text-sm font-semibold text-aurora-navy hover:bg-aurora-cream"
                  >
                    Ver ficha
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-aurora-navyDark/50 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
        >
          <div role="dialog" aria-modal="true" aria-label={dialog.action.label} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-aurora">
            <h2 className="font-display text-xl font-bold text-aurora-navy">
              {dialog.action.label} {dialog.club.name}
            </h2>
            <p className="mt-1 text-sm text-aurora-navy/60">
              El estado pasará de {STATUS_LABEL[dialog.club.clubStatus]} a {STATUS_LABEL[dialog.action.status]}.
            </p>
            {dialog.action.needsReason && (
              <div className="mt-4">
                <label htmlFor="status-reason" className="mb-1 block text-sm font-semibold text-aurora-navy">
                  Motivo
                </label>
                <textarea
                  id="status-reason"
                  rows={3}
                  maxLength={500}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className={inputClass}
                />
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="min-h-[44px] rounded-lg border border-aurora-navy/15 px-4 text-sm font-semibold text-aurora-navy hover:bg-aurora-cream"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmAction}
                disabled={saving}
                className={`min-h-[44px] rounded-lg px-5 text-sm font-semibold text-white disabled:opacity-50 ${
                  dialog.action.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-aurora-terracotta hover:bg-aurora-terracottaDark'
                }`}
              >
                {saving ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {historyClub && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-aurora-navyDark/50 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setHistoryClub(null);
          }}
        >
          <div role="dialog" aria-modal="true" aria-label="Historial de estados" className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-aurora">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-aurora-navy">Historial de {historyClub.name}</h2>
              <button
                type="button"
                onClick={() => setHistoryClub(null)}
                aria-label="Cerrar"
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-aurora-navy/60 hover:bg-aurora-cream"
              >
                ✕
              </button>
            </div>
            {history === null && <p className="py-8 text-center text-sm text-aurora-navy/55">Cargando...</p>}
            {history !== null && history.length === 0 && (
              <p className="py-8 text-center text-sm text-aurora-navy/55">Este club todavía no tiene cambios de estado.</p>
            )}
            {history !== null && history.length > 0 && (
              <ul className="mt-4 space-y-3">
                {history.map((entry) => (
                  <li key={entry.id} className="rounded-xl bg-aurora-cream p-4">
                    <p className="text-sm font-semibold text-aurora-navy">
                      {STATUS_LABEL[entry.previousStatus]} → {STATUS_LABEL[entry.newStatus]}
                    </p>
                    <p className="text-xs text-aurora-navy/50">
                      {formatDate(entry.changeDate)}
                      {entry.admin && ` · ${entry.admin}`}
                    </p>
                    {entry.changeReason && <p className="mt-2 text-sm text-aurora-navy/70">{entry.changeReason}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClubsPage;