import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../api/config';
import SafeImage from '../../components/common/SafeImage';
import { clearSiteContentCache } from '../../utils/useSiteContent';

interface Slot {
  key: string;
  type: 'image' | 'text';
  label: string;
  hint: string;
  maxLength: number | null;
  value: string | null;
  updatedAt: string | null;
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const formatDate = (value: string) =>
  new Date(value).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const AdminSiteContentPage: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await api.get('/admin/site-content');
      const data: Slot[] = getResponseData(response) || [];
      setSlots(data);
      setDrafts(Object.fromEntries(data.filter((slot) => slot.type === 'text').map((slot) => [slot.key, slot.value ?? ''])));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (key: string, action: () => Promise<void>, success: string) => {
    if (busyKey) return;
    setBusyKey(key);
    try {
      await action();
      clearSiteContentCache();
      toast.success(success);
      await load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'No se pudo guardar el cambio.');
    } finally {
      setBusyKey(null);
    }
  };

  const handleFile = (slot: Slot, file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(jpe?g|png|webp|gif)$/i.test(file.type)) {
      toast.error('Elegí una imagen JPG, PNG, WEBP o GIF.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('La imagen no puede superar los 8 MB.');
      return;
    }
    const form = new FormData();
    form.append('image', file);
    run(slot.key, async () => { await api.post(`/admin/site-content/${slot.key}/image`, form); }, 'Imagen actualizada.');
  };

  const saveText = (slot: Slot) => {
    const value = (drafts[slot.key] ?? '').trim();
    if (!value) {
      toast.error('El texto no puede estar vacío.');
      return;
    }
    run(slot.key, async () => { await api.put(`/admin/site-content/${slot.key}/text`, { value }); }, 'Texto actualizado.');
  };

  const reset = (slot: Slot) => {
    run(slot.key, async () => { await api.delete(`/admin/site-content/${slot.key}`); }, 'Se restauró el diseño por defecto.');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-aurora-navy">Contenido del sitio</h1>
        <p className="mt-1 text-sm text-aurora-navy/60">
          Cambiá las imágenes y los textos principales del inicio. Si un campo está vacío, se usa el diseño por defecto.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-16" role="status" aria-label="Cargando">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
        </div>
      )}

      {!loading && failed && (
        <div role="alert" className="card-surface p-8 text-center">
          <p className="mb-4 text-aurora-navy/70">No pudimos cargar el contenido.</p>
          <button type="button" onClick={load} className="btn-primary">Reintentar</button>
        </div>
      )}

      {!loading && !failed && (
        <ul className="space-y-4">
          {slots.map((slot) => {
            const busy = busyKey === slot.key;
            return (
              <li key={slot.key} className="card-surface shadow-aurora-sm p-5">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-aurora-navy">{slot.label}</h2>
                    <p className="text-xs text-aurora-navy/55">{slot.hint}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${slot.value ? 'bg-green-100 text-green-700' : 'bg-aurora-navy/10 text-aurora-navy/60'}`}>
                    {slot.value ? 'Personalizado' : 'Por defecto'}
                  </span>
                </div>

                {slot.type === 'image' ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <SafeImage
                      src={slot.value ?? undefined}
                      alt={slot.label}
                      fallbackIcon="📦"
                      className="h-32 w-full rounded-xl border border-aurora-navy/10 object-cover sm:w-56"
                    />
                    <div className="flex flex-wrap gap-2">
                      <input
                        ref={(element) => { fileInputs.current[slot.key] = element; }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        aria-label={`Elegir imagen para ${slot.label}`}
                        onChange={(e) => {
                          handleFile(slot, e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                      <button type="button" disabled={busy} onClick={() => fileInputs.current[slot.key]?.click()} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-50">
                        {busy ? 'Subiendo...' : slot.value ? 'Cambiar imagen' : 'Subir imagen'}
                      </button>
                      {slot.value && (
                        <button type="button" disabled={busy} onClick={() => reset(slot)} className="btn-outline !px-4 !py-2 text-sm disabled:opacity-50">
                          Restaurar por defecto
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label htmlFor={`slot-${slot.key}`} className="sr-only">{slot.label}</label>
                    <input
                      id={`slot-${slot.key}`}
                      type="text"
                      maxLength={slot.maxLength ?? 200}
                      className="input-aurora"
                      placeholder="Texto por defecto del sitio"
                      value={drafts[slot.key] ?? ''}
                      onChange={(e) => setDrafts((current) => ({ ...current, [slot.key]: e.target.value }))}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-aurora-navy/45">{(drafts[slot.key] ?? '').length}/{slot.maxLength}</span>
                      <div className="flex gap-2">
                        <button type="button" disabled={busy} onClick={() => saveText(slot)} className="btn-primary !px-4 !py-2 text-sm disabled:opacity-50">
                          {busy ? 'Guardando...' : 'Guardar'}
                        </button>
                        {slot.value && (
                          <button type="button" disabled={busy} onClick={() => reset(slot)} className="btn-outline !px-4 !py-2 text-sm disabled:opacity-50">
                            Restaurar por defecto
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {slot.updatedAt && <p className="mt-3 text-xs text-aurora-navy/40">Última modificación: {formatDate(slot.updatedAt)}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AdminSiteContentPage;