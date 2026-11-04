import React, { useCallback, useEffect, useState } from 'react';
import api, { getResponseData } from '../../api/config';

interface LicenseRow {
  id: number;
  verificationStatus: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  documentUrl: string | null;
  issueDate: string | null;
  expirationDate: string | null;
  verificationDate: string | null;
  verificationNotes: string | null;
  daysToExpire: number | null;
  licenseType: string;
  entrepreneur: { id: number; name: string; email: string } | null;
  clubs: { id: number; name: string; clubStatus: string }[];
}

const FILTERS = [
  { key: 'PENDIENTE', label: 'Pendientes' },
  { key: 'APROBADO', label: 'Aprobadas' },
  { key: 'RECHAZADO', label: 'Rechazadas' },
  { key: '', label: 'Todas' },
];

const STATUS_BADGE: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  APROBADO: 'bg-green-100 text-green-700',
  RECHAZADO: 'bg-red-100 text-red-700',
};

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobada',
  RECHAZADO: 'Rechazada',
};

const CLUB_STATUS_LABEL: Record<string, string> = {
  PENDIENTE_APROBACION: 'pendiente',
  APROBADO: 'aprobado',
  SUSPENDIDO: 'suspendido',
  INACTIVO: 'inactivo',
};

const formatDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('es-AR') : '—');

const errorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  if (Array.isArray(message)) return message.join('. ');
  return message || fallback;
};

const AdminLicensesPage: React.FC = () => {
  const [filter, setFilter] = useState('PENDIENTE');
  const [rows, setRows] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/entrepreneur-licenses/admin/list${filter ? `?status=${filter}` : ''}`);
      setRows(getResponseData(response) || []);
    } catch {
      setError('No se pudieron cargar las matrículas.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (row: LicenseRow, status: 'APROBADO' | 'RECHAZADO') => {
    if (status === 'RECHAZADO' && !reason.trim()) {
      setError('Indicá el motivo del rechazo.');
      return;
    }
    setBusyId(row.id);
    setError('');
    try {
      await api.patch(`/entrepreneur-licenses/${row.id}/verify`, {
        verificationStatus: status,
        ...(status === 'RECHAZADO' ? { verificationNotes: reason.trim() } : {}),
      });
      setRejectingId(null);
      setReason('');
      await load();
    } catch (err) {
      setError(errorMessage(err, 'No se pudo guardar la revisión.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-aurora-navy">Matrículas de emprendedores</h1>
        <p className="text-sm text-aurora-navy/60">
          Revisá los documentos antes de aprobar un club: no se puede aprobar si le faltan matrículas válidas.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.key || 'all'}
            type="button"
            onClick={() => setFilter(item.key)}
            className={`min-h-[44px] rounded-full px-4 text-sm font-semibold transition-colors ${
              filter === item.key
                ? 'bg-aurora-terracotta text-white'
                : 'border border-aurora-navy/10 bg-white text-aurora-navy/70 hover:bg-aurora-cream'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-aurora-terracottaDark" />
          <p className="text-aurora-navy/70">Cargando matrículas...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl bg-white py-10 text-center text-sm text-aurora-navy/60 shadow-sm">
          No hay matrículas en este estado.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const isRejecting = rejectingId === row.id;
            const isBusy = busyId === row.id;
            const expired = row.daysToExpire !== null && row.daysToExpire < 0;

            return (
              <div key={row.id} className="rounded-2xl border border-aurora-navy/5 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-aurora-navy">{row.licenseType}</p>
                    <p className="text-sm text-aurora-navy/70">
                      {row.entrepreneur ? `${row.entrepreneur.name} · ${row.entrepreneur.email}` : 'Emprendedor desconocido'}
                    </p>
                    {row.clubs.length > 0 && (
                      <p className="mt-1 text-xs text-aurora-navy/50">
                        Club: {row.clubs.map((club) => `${club.name} (${CLUB_STATUS_LABEL[club.clubStatus] ?? club.clubStatus})`).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[row.verificationStatus]}`}>
                    {STATUS_LABEL[row.verificationStatus]}
                  </span>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-xs text-aurora-navy/50">Emisión</dt>
                    <dd className="text-aurora-navy">{formatDate(row.issueDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-aurora-navy/50">Vencimiento</dt>
                    <dd className={expired ? 'font-semibold text-red-600' : 'text-aurora-navy'}>
                      {formatDate(row.expirationDate)}
                      {expired && ' (vencida)'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-aurora-navy/50">Revisada</dt>
                    <dd className="text-aurora-navy">{formatDate(row.verificationDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-aurora-navy/50">Documento</dt>
                    <dd>
                      {row.documentUrl ? (
                        <a
                          href={row.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-aurora-terracotta underline hover:text-aurora-terracottaDark"
                        >
                          Abrir archivo
                        </a>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                </dl>

                {row.verificationStatus === 'RECHAZADO' && row.verificationNotes && (
                  <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">Motivo: {row.verificationNotes}</p>
                )}

                {isRejecting ? (
                  <div className="mt-4 space-y-3 rounded-xl bg-aurora-cream p-4">
                    <label htmlFor={`reject-${row.id}`} className="block text-xs font-semibold text-aurora-navy/60">
                      Motivo del rechazo (lo ve el emprendedor)
                    </label>
                    <textarea
                      id={`reject-${row.id}`}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      maxLength={500}
                      rows={3}
                      className="w-full rounded-lg border border-aurora-navy/20 bg-white px-3 py-2 text-sm text-aurora-navy focus:border-aurora-terracotta focus:ring-aurora-terracotta"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => review(row, 'RECHAZADO')}
                        disabled={isBusy}
                        className="min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {isBusy ? 'Guardando...' : 'Confirmar rechazo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingId(null);
                          setReason('');
                        }}
                        className="min-h-[44px] rounded-lg border border-aurora-navy/20 px-4 text-sm font-semibold text-aurora-navy/70 hover:bg-white"
                      >
                        Volver
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {row.verificationStatus !== 'APROBADO' && (
                      <button
                        type="button"
                        onClick={() => review(row, 'APROBADO')}
                        disabled={isBusy || !row.documentUrl}
                        className="min-h-[44px] rounded-lg bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {isBusy ? 'Guardando...' : 'Aprobar'}
                      </button>
                    )}
                    {row.verificationStatus !== 'RECHAZADO' && (
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingId(row.id);
                          setReason('');
                          setError('');
                        }}
                        className="min-h-[44px] rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Rechazar
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
  );
};

export default AdminLicensesPage;