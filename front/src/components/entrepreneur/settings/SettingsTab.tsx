import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../../api/config';

type SectionId = 'finances' | 'team' | 'notifications';
type SettingValue = string | number | boolean | string[];

interface SettingEntry {
  key: string;
  value: SettingValue;
}

const SECTIONS: { id: SectionId; label: string; description: string }[] = [
  { id: 'finances', label: 'Finanzas', description: 'Parámetros de cobros, impuestos y comisiones del club.' },
  { id: 'team', label: 'Equipo', description: 'Preferencias de trabajo del equipo del club.' },
  { id: 'notifications', label: 'Notificaciones', description: 'Qué avisos querés recibir.' },
];

const labelOf = (key: string) => key.replace(/([A-Z])/g, ' $1').trim();

const inputClass =
  'min-h-[44px] w-full rounded-lg border border-aurora-navy/15 bg-white px-3 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40';

const toDraft = (value: SettingValue): string | boolean => {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'number') return String(value);
  return value;
};

const fromDraft = (original: SettingValue, draft: string | boolean): SettingValue => {
  if (Array.isArray(original)) {
    return String(draft)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof original === 'number') {
    const parsed = Number(String(draft).replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : original;
  }
  if (typeof original === 'boolean') return Boolean(draft);
  return String(draft);
};

const SettingsTab: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [section, setSection] = useState<SectionId>('finances');
  const [settings, setSettings] = useState<Record<string, SettingEntry[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string | boolean>>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    setFailed(false);
    try {
      const res = await api.get(`/clubs/${clubId}/settings`);
      const raw = getResponseData(res) || {};
      const next: Record<string, SettingEntry[]> = {};
      const nextDrafts: Record<string, string | boolean> = {};
      Object.keys(raw).forEach((category) => {
        next[category] = Object.keys(raw[category]).map((key) => {
          nextDrafts[`${category}.${key}`] = toDraft(raw[category][key]);
          return { key, value: raw[category][key] };
        });
      });
      setSettings(next);
      setDrafts(nextDrafts);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    load();
  }, [load]);

  const entries = settings[section] ?? [];

  const dirty = useMemo(
    () => entries.some((entry) => drafts[`${section}.${entry.key}`] !== toDraft(entry.value)),
    [entries, drafts, section],
  );

  const setDraft = (key: string, value: string | boolean) =>
    setDrafts((prev) => ({ ...prev, [`${section}.${key}`]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const payload: Record<string, SettingValue> = {};
      entries.forEach((entry) => {
        payload[entry.key] = fromDraft(entry.value, drafts[`${section}.${entry.key}`]);
      });
      await api.put(`/clubs/${clubId}/settings/${section}`, { [section]: payload });
      setSettings((prev) => ({
        ...prev,
        [section]: (prev[section] ?? []).map((entry) => ({ key: entry.key, value: payload[entry.key] })),
      }));
      setDrafts((prev) => {
        const next = { ...prev };
        Object.keys(payload).forEach((key) => {
          next[`${section}.${key}`] = toDraft(payload[key]);
        });
        return next;
      });
      toast.success('Ajustes guardados correctamente.');
    } catch {
      toast.error('Error al guardar los ajustes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3" aria-busy="true">
        <div className="h-11 w-72 rounded-xl bg-aurora-navy/10" />
        <div className="h-24 rounded-2xl bg-aurora-navy/10" />
        <div className="h-24 rounded-2xl bg-aurora-navy/10" />
      </div>
    );
  }

  if (failed) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <p>No se pudieron cargar los ajustes del club.</p>
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

  const current = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];

  return (
    <div className="space-y-5">
      <div role="group" aria-label="Tipo de ajustes" className="flex flex-wrap gap-2">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === section}
            onClick={() => setSection(item.id)}
            className={`min-h-[40px] rounded-full px-4 text-xs font-semibold transition-colors ${
              item.id === section ? 'bg-aurora-terracotta text-white' : 'bg-white text-aurora-navy/70 hover:text-aurora-navy'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-aurora-navy/10 bg-white p-4 shadow-aurora-sm sm:p-6">
        <h2 className="font-display text-xl font-bold text-aurora-navy">{current.label}</h2>
        <p className="mb-5 text-sm text-aurora-navy/60">{current.description}</p>

        {entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-aurora-navy/55">No hay ajustes disponibles en esta sección.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const id = `setting-${section}-${entry.key}`;
              const draft = drafts[`${section}.${entry.key}`];
              if (typeof entry.value === 'boolean') {
                return (
                  <label
                    key={entry.key}
                    htmlFor={id}
                    className="flex min-h-[56px] cursor-pointer items-center justify-between gap-4 rounded-xl border border-aurora-navy/10 bg-aurora-cream px-4 py-3"
                  >
                    <span className="text-sm font-semibold capitalize text-aurora-navy">{labelOf(entry.key)}</span>
                    <input
                      id={id}
                      type="checkbox"
                      checked={Boolean(draft)}
                      onChange={(e) => setDraft(entry.key, e.target.checked)}
                      className="h-5 w-5 rounded border-aurora-navy/25 text-aurora-terracotta"
                    />
                  </label>
                );
              }
              return (
                <div key={entry.key} className="rounded-xl border border-aurora-navy/10 bg-aurora-cream p-4">
                  <label htmlFor={id} className="mb-2 block text-sm font-semibold capitalize text-aurora-navy">
                    {labelOf(entry.key)}
                  </label>
                  <input
                    id={id}
                    type="text"
                    inputMode={typeof entry.value === 'number' ? 'decimal' : 'text'}
                    value={String(draft ?? '')}
                    onChange={(e) => setDraft(entry.key, e.target.value)}
                    className={inputClass}
                  />
                  {Array.isArray(entry.value) && (
                    <p className="mt-1 text-xs text-aurora-navy/50">Separá los valores con comas.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          {dirty && <span className="text-xs text-aurora-terracottaDark">Tenés cambios sin guardar</span>}
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="min-h-[44px] rounded-lg bg-aurora-terracotta px-6 text-sm font-semibold text-white transition-colors hover:bg-aurora-terracottaDark disabled:opacity-50"
          >
            {saving ? 'Guardando...' : `Guardar ${current.label.toLowerCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;