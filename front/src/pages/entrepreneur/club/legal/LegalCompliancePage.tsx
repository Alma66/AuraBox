import React, { useCallback, useEffect, useState } from 'react';
import api, { getResponseData } from '../../../../api/config';

type RequirementState = 'FALTANTE' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'VENCIDA';

interface Requirement {
  idLicenseTypes: number;
  name: string;
  description: string | null;
  entrepreneurLicenseId: number | null;
  state: RequirementState;
  documentUrl: string | null;
  issueDate: string | null;
  expirationDate: string | null;
  verificationNotes: string | null;
  daysToExpire: number | null;
  expiringSoon: boolean;
}

interface Compliance {
  hasClub: boolean;
  isOwner?: boolean;
  club?: { id: number; name: string; clubStatus: string };
  statusReason?: string | null;
  statusChangedAt?: string | null;
  requirements?: Requirement[];
  summary?: { required: number; approved: number };
}

const CLUB_STATUS: Record<string, { label: string; badge: string; message: string }> = {
  PENDIENTE_APROBACION: {
    label: 'Pendiente de aprobación',
    badge: 'bg-yellow-100 text-yellow-700',
    message: 'Un administrador está revisando tu club. Mientras tanto no aparece en el sitio público.',
  },
  APROBADO: {
    label: 'Aprobado',
    badge: 'bg-green-100 text-green-700',
    message: 'Tu club está visible en el sitio y puede recibir suscripciones.',
  },
  SUSPENDIDO: {
    label: 'Suspendido',
    badge: 'bg-red-100 text-red-700',
    message: 'Tu club fue suspendido y no se muestra en el sitio.',
  },
  INACTIVO: {
    label: 'Inactivo',
    badge: 'bg-aurora-navy/10 text-aurora-navy/70',
    message: 'Tu club está inactivo y no se muestra en el sitio.',
  },
};

const REQUIREMENT_STATE: Record<RequirementState, { label: string; badge: string }> = {
  FALTANTE: { label: 'Sin presentar', badge: 'bg-aurora-navy/10 text-aurora-navy/70' },
  PENDIENTE: { label: 'En revisión', badge: 'bg-yellow-100 text-yellow-700' },
  APROBADA: { label: 'Aprobada', badge: 'bg-green-100 text-green-700' },
  RECHAZADA: { label: 'Rechazada', badge: 'bg-red-100 text-red-700' },
  VENCIDA: { label: 'Vencida', badge: 'bg-red-100 text-red-700' },
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const formatDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('es-AR') : '—');
const toInputDate = (iso?: string | null) => (iso ? iso.slice(0, 10) : '');

const errorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  if (Array.isArray(message)) return message.join('. ');
  return message || fallback;
};

const INPUT_CLASS =
  'min-h-[44px] w-full rounded-lg border border-aurora-navy/20 bg-white px-3 text-sm text-aurora-navy focus:border-aurora-terracotta focus:ring-aurora-terracotta';

const RequirementCard: React.FC<{
  requirement: Requirement;
  canEdit: boolean;
  onChanged: () => void;
}> = ({ requirement, canEdit, onChanged }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [issueDate, setIssueDate] = useState(toInputDate(requirement.issueDate));
  const [expirationDate, setExpirationDate] = useState(toInputDate(requirement.expirationDate));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const state = REQUIREMENT_STATE[requirement.state];
  const isNew = requirement.entrepreneurLicenseId === null;

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setError('');
    if (selected && !ALLOWED_TYPES.includes(selected.type)) {
      setError('Solo se permiten PDF, JPG o PNG.');
      setFile(null);
      return;
    }
    if (selected && selected.size > MAX_FILE_BYTES) {
      setError('El archivo no puede superar los 10MB.');
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (isNew && !file) {
      setError('Adjuntá el documento.');
      return;
    }
    if (!isNew && !file && issueDate === toInputDate(requirement.issueDate) && expirationDate === toInputDate(requirement.expirationDate)) {
      setError('No hay cambios para guardar.');
      return;
    }

    const formData = new FormData();
    if (isNew) formData.append('idLicenseTypes', String(requirement.idLicenseTypes));
    if (issueDate) formData.append('issueDate', issueDate);
    if (expirationDate) formData.append('expirationDate', expirationDate);
    if (file) formData.append('document', file);

    setSaving(true);
    try {
      if (isNew) {
        await api.post('/entrepreneur-licenses', formData);
      } else {
        await api.patch(`/entrepreneur-licenses/${requirement.entrepreneurLicenseId}`, formData);
      }
      setOpen(false);
      setFile(null);
      onChanged();
    } catch (err) {
      setError(errorMessage(err, 'No se pudo guardar la matrícula.'));
    } finally {
      setSaving(false);
    }
  };

  const inputId = `license-${requirement.idLicenseTypes}`;

  return (
    <div className="rounded-2xl border border-aurora-navy/5 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-aurora-navy">{requirement.name}</h3>
          {requirement.description && <p className="mt-0.5 text-sm text-aurora-navy/60">{requirement.description}</p>}
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${state.badge}`}>{state.label}</span>
      </div>

      {requirement.state !== 'FALTANTE' && (
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-aurora-navy/50">Emisión</dt>
            <dd className="text-aurora-navy">{formatDate(requirement.issueDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-aurora-navy/50">Vencimiento</dt>
            <dd className="text-aurora-navy">{formatDate(requirement.expirationDate)}</dd>
          </div>
          {requirement.documentUrl && (
            <div>
              <dt className="text-xs text-aurora-navy/50">Documento</dt>
              <dd>
                <a
                  href={requirement.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-aurora-terracotta underline hover:text-aurora-terracottaDark"
                >
                  Ver archivo
                </a>
              </dd>
            </div>
          )}
        </dl>
      )}

      {requirement.state === 'RECHAZADA' && requirement.verificationNotes && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <span className="font-semibold">Motivo del rechazo:</span> {requirement.verificationNotes}
        </div>
      )}
      {requirement.state === 'VENCIDA' && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Esta matrícula venció. Cargá la renovación para que vuelva a revisarse.
        </div>
      )}
      {requirement.expiringSoon && requirement.daysToExpire !== null && (
        <div className="mt-3 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          Vence en {requirement.daysToExpire} {requirement.daysToExpire === 1 ? 'día' : 'días'}. Cargá la renovación a tiempo.
        </div>
      )}

      {canEdit && (
        <div className="mt-4">
          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="min-h-[44px] rounded-lg border border-aurora-terracotta/40 px-4 text-sm font-semibold text-aurora-terracotta hover:bg-aurora-terracotta/10"
            >
              {isNew ? 'Subir matrícula' : 'Actualizar o renovar'}
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 rounded-xl bg-aurora-cream p-4">
              <div>
                <label htmlFor={`${inputId}-file`} className="mb-1 block text-xs font-semibold text-aurora-navy/60">
                  Documento (PDF, JPG o PNG, hasta 10MB)
                </label>
                <input
                  id={`${inputId}-file`}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={handleFile}
                  className="block w-full text-sm text-aurora-navy"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${inputId}-issue`} className="mb-1 block text-xs font-semibold text-aurora-navy/60">Fecha de emisión</label>
                  <input id={`${inputId}-issue`} type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} className={INPUT_CLASS} />
                </div>
                <div>
                  <label htmlFor={`${inputId}-exp`} className="mb-1 block text-xs font-semibold text-aurora-navy/60">Fecha de vencimiento</label>
                  <input id={`${inputId}-exp`} type="date" value={expirationDate} onChange={(event) => setExpirationDate(event.target.value)} className={INPUT_CLASS} />
                </div>
              </div>
              {!isNew && (
                <p className="text-xs text-aurora-navy/60">Al guardar cambios, la matrícula vuelve a quedar en revisión.</p>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[44px] rounded-lg bg-aurora-terracotta px-5 text-sm font-semibold text-white hover:bg-aurora-terracottaDark disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setError('');
                    setFile(null);
                  }}
                  className="min-h-[44px] rounded-lg border border-aurora-navy/20 px-4 text-sm font-semibold text-aurora-navy/70 hover:bg-white"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

const LegalCompliancePage: React.FC = () => {
  const [data, setData] = useState<Compliance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const response = await api.get('/entrepreneur-licenses/my-compliance');
      setData(getResponseData(response) as Compliance);
    } catch {
      setError('No se pudo cargar el estado de tu club.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-aurora-terracottaDark" />
        <p className="text-aurora-navy/70">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">{error}</div>;
  }

  if (!data || !data.hasClub || !data.club) {
    return (
      <div className="rounded-2xl bg-white py-10 text-center text-sm text-aurora-navy/60 shadow-sm">
        Todavía no tenés un club asociado.
      </div>
    );
  }

  const status = CLUB_STATUS[data.club.clubStatus] ?? CLUB_STATUS.PENDIENTE_APROBACION;
  const requirements = data.requirements ?? [];
  const showReason = !!data.statusReason && data.club.clubStatus !== 'APROBADO';

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-aurora-navy/5 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-aurora-navy/50">Estado de tu club</p>
            <h2 className="font-display text-xl font-bold text-aurora-navy">{data.club.name}</h2>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${status.badge}`}>{status.label}</span>
        </div>
        <p className="mt-3 text-sm text-aurora-navy/70">{status.message}</p>
        {showReason && (
          <div className="mt-3 rounded-lg bg-aurora-cream p-3 text-sm text-aurora-navy">
            <span className="font-semibold">Motivo indicado por el administrador:</span> {data.statusReason}
            {data.statusChangedAt && (
              <span className="ml-1 text-xs text-aurora-navy/50">({formatDate(data.statusChangedAt)})</span>
            )}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-aurora-navy">Matrículas y habilitaciones</h2>
            <p className="text-sm text-aurora-navy/60">Las que necesita tu rubro para operar en AuraBox.</p>
          </div>
          {data.summary && data.summary.required > 0 && (
            <p className="text-sm font-semibold text-aurora-navy">
              {data.summary.approved} de {data.summary.required} aprobadas
            </p>
          )}
        </div>

        {!data.isOwner && requirements.length > 0 && (
          <p className="mb-3 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            Las matrículas las presenta el titular del club. Acá podés ver cómo van.
          </p>
        )}

        {requirements.length === 0 ? (
          <div className="rounded-2xl bg-white py-10 text-center text-sm text-aurora-navy/60 shadow-sm">
            El rubro de tu club no exige matrículas.
          </div>
        ) : (
          <div className="space-y-4">
            {requirements.map((requirement) => (
              <RequirementCard
                key={requirement.idLicenseTypes}
                requirement={requirement}
                canEdit={!!data.isOwner}
                onChanged={load}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LegalCompliancePage;