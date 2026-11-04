import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api, { getResponseData } from '../../api/config';

type AcceptanceScope = 'NINGUNO' | 'TODOS' | 'CLIENTES' | 'EMPRENDEDORES';

interface Rule {
  id: number;
  title: string;
  content: string;
  version: string;
  ruleType: string;
  publicationDate: string;
  active: boolean;
  acceptanceScope: AcceptanceScope;
}

interface RuleForm {
  ruleType: string;
  title: string;
  version: string;
  content: string;
  acceptanceScope: AcceptanceScope;
}

type PendingAction = { id: number; kind: 'publish' | 'unpublish' | 'delete' } | null;

const EMPTY_FORM: RuleForm = { ruleType: '', title: '', version: '', content: '', acceptanceScope: 'NINGUNO' };

const TYPE_SUGGESTIONS = [
  'Términos y condiciones',
  'Política de privacidad',
  'Reglas para clubes',
  'Reglas para clientes',
];

const SCOPE_OPTIONS: { value: AcceptanceScope; label: string }[] = [
  { value: 'NINGUNO', label: 'No se exige al registrarse' },
  { value: 'TODOS', label: 'Se exige a todos al registrarse' },
  { value: 'CLIENTES', label: 'Se exige solo a clientes' },
  { value: 'EMPRENDEDORES', label: 'Se exige solo a emprendedores' },
];

const SCOPE_SHORT: Record<AcceptanceScope, string> = {
  NINGUNO: '',
  TODOS: 'Obligatoria para todos al registrarse',
  CLIENTES: 'Obligatoria para clientes al registrarse',
  EMPRENDEDORES: 'Obligatoria para emprendedores al registrarse',
};

const INPUT_CLASS =
  'min-h-[44px] w-full rounded-lg border border-aurora-navy/20 bg-white px-3 text-sm text-aurora-navy focus:border-aurora-terracotta focus:ring-aurora-terracotta';

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('es-AR');

const errorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  if (Array.isArray(message)) return message.join('. ');
  return message || fallback;
};

const AdminRulesPage: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RuleForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/platform-rules');
      setRules(getResponseData(response) || []);
    } catch {
      setError('No se pudieron cargar las reglas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groups = useMemo(() => {
    const map = new Map<string, Rule[]>();
    rules.forEach((rule) => {
      const list = map.get(rule.ruleType) ?? [];
      list.push(rule);
      map.set(rule.ruleType, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [rules]);

  const updateField =
    (field: keyof RuleForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (rule: Rule) => {
    setEditingId(rule.id);
    setForm({
      ruleType: rule.ruleType,
      title: rule.title,
      version: rule.version,
      content: rule.content,
      acceptanceScope: rule.acceptanceScope,
    });
    setFormError('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openNewVersion = (rule: Rule) => {
    setEditingId(null);
    setForm({
      ruleType: rule.ruleType,
      title: rule.title,
      version: '',
      content: rule.content,
      acceptanceScope: rule.acceptanceScope,
    });
    setFormError('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    setNotice('');

    if (!form.ruleType.trim() || !form.title.trim() || !form.version.trim() || !form.content.trim()) {
      setFormError('Completá tipo, título, versión y contenido.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ruleType: form.ruleType.trim(),
        title: form.title.trim(),
        version: form.version.trim(),
        content: form.content.trim(),
        acceptanceScope: form.acceptanceScope,
      };
      if (editingId) {
        await api.put(`/platform-rules/${editingId}`, payload);
        setNotice('Borrador actualizado.');
      } else {
        await api.post('/platform-rules', payload);
        setNotice('Borrador creado. Publicalo cuando esté listo.');
      }
      closeForm();
      await load();
    } catch (err) {
      setFormError(errorMessage(err, 'No se pudo guardar la regla.'));
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (rule: Rule, kind: 'publish' | 'unpublish' | 'delete') => {
    setBusyId(rule.id);
    setError('');
    setNotice('');
    try {
      if (kind === 'delete') {
        await api.delete(`/platform-rules/${rule.id}`);
        setNotice('Regla eliminada.');
      } else {
        await api.patch(`/platform-rules/${rule.id}/active`, { active: kind === 'publish' });
        setNotice(kind === 'publish' ? 'Regla publicada.' : 'Regla despublicada.');
      }
      setPending(null);
      await load();
    } catch (err) {
      setPending(null);
      setError(errorMessage(err, 'No se pudo completar la acción.'));
    } finally {
      setBusyId(null);
    }
  };

  const confirmLabel = (kind: 'publish' | 'unpublish' | 'delete') => {
    if (kind === 'publish') return 'Publicar ahora';
    if (kind === 'unpublish') return 'Despublicar';
    return 'Eliminar';
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-aurora-navy">Reglas de la plataforma</h1>
          <p className="text-sm text-aurora-navy/60">
            Términos, políticas y reglas. Lo publicado no se edita: se crea una nueva versión.
          </p>
        </div>
        <button
          type="button"
          onClick={showForm ? closeForm : openNew}
          className="min-h-[44px] rounded-lg bg-aurora-terracotta px-5 text-sm font-semibold text-white hover:bg-aurora-terracottaDark"
        >
          {showForm ? 'Cancelar' : 'Nueva regla'}
        </button>
      </div>

      {notice && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="mb-8 rounded-2xl border border-aurora-navy/5 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-bold text-aurora-navy">
            {editingId ? 'Editar borrador' : 'Nuevo borrador'}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="rule-type" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Tipo</label>
              <input
                id="rule-type"
                list="rule-type-options"
                value={form.ruleType}
                onChange={updateField('ruleType')}
                maxLength={60}
                className={INPUT_CLASS}
              />
              <datalist id="rule-type-options">
                {TYPE_SUGGESTIONS.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor="rule-title" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Título</label>
              <input id="rule-title" value={form.title} onChange={updateField('title')} maxLength={150} className={INPUT_CLASS} />
            </div>
            <div>
              <label htmlFor="rule-version" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Versión</label>
              <input
                id="rule-version"
                value={form.version}
                onChange={updateField('version')}
                maxLength={20}
                placeholder="1.0"
                className={INPUT_CLASS}
              />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="rule-scope" className="mb-1 block text-xs font-semibold text-aurora-navy/60">
                Aceptación al registrarse
              </label>
              <select id="rule-scope" value={form.acceptanceScope} onChange={updateField('acceptanceScope')} className={INPUT_CLASS}>
                {SCOPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-aurora-navy/50">
                Si la exigís, quien se registre tiene que aceptar la versión publicada. Queda guardado qué versión aceptó y cuándo.
              </p>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="rule-content" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Contenido</label>
              <textarea
                id="rule-content"
                value={form.content}
                onChange={updateField('content')}
                maxLength={50000}
                rows={12}
                className="w-full rounded-lg border border-aurora-navy/20 bg-white px-3 py-2 text-sm text-aurora-navy focus:border-aurora-terracotta focus:ring-aurora-terracotta"
              />
              <p className="mt-1 text-xs text-aurora-navy/50">Los saltos de línea se respetan al mostrarlo.</p>
            </div>
          </div>
          {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] rounded-lg bg-aurora-terracotta px-6 text-sm font-semibold text-white hover:bg-aurora-terracottaDark disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar borrador'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-aurora-terracottaDark" />
          <p className="text-aurora-navy/70">Cargando reglas...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl bg-white py-10 text-center text-sm text-aurora-navy/60 shadow-sm">
          Todavía no hay reglas. Creá la primera con "Nueva regla".
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(([type, list]) => (
            <section key={type}>
              <h2 className="mb-3 font-display text-lg font-bold text-aurora-navy">{type}</h2>
              <div className="space-y-3">
                {list.map((rule) => {
                  const isPending = pending?.id === rule.id ? pending : null;
                  const isBusy = busyId === rule.id;
                  const isExpanded = expandedId === rule.id;
                  const scopeText = SCOPE_SHORT[rule.acceptanceScope];

                  return (
                    <div key={rule.id} className="rounded-2xl border border-aurora-navy/5 bg-white p-5 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-aurora-navy">
                            {rule.title} <span className="text-sm font-normal text-aurora-navy/50">v{rule.version}</span>
                          </p>
                          <p className="text-xs text-aurora-navy/50">
                            {rule.active ? 'Publicada' : 'Última modificación'} el {formatDate(rule.publicationDate)}
                          </p>
                          {scopeText && <p className="mt-1 text-xs font-semibold text-aurora-terracotta">{scopeText}</p>}
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            rule.active ? 'bg-green-100 text-green-700' : 'bg-aurora-navy/10 text-aurora-navy/70'
                          }`}
                        >
                          {rule.active ? 'Publicada' : 'Inactiva'}
                        </span>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 whitespace-pre-line rounded-xl bg-aurora-cream p-4 text-sm text-aurora-navy/80">
                          {rule.content}
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              onClick={() => runAction(rule, isPending.kind)}
                              disabled={isBusy}
                              className={`min-h-[44px] rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50 ${
                                isPending.kind === 'publish' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                              }`}
                            >
                              {isBusy ? 'Guardando...' : confirmLabel(isPending.kind)}
                            </button>
                            <button
                              type="button"
                              onClick={() => setPending(null)}
                              className="min-h-[44px] rounded-lg border border-aurora-navy/20 px-4 text-sm font-semibold text-aurora-navy/70 hover:bg-aurora-cream"
                            >
                              Volver
                            </button>
                            {isPending.kind === 'publish' && (
                              <p className="self-center text-xs text-aurora-navy/60">
                                La versión publicada de este tipo pasa a inactiva.
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                              className="min-h-[44px] rounded-lg border border-aurora-navy/20 px-4 text-sm font-semibold text-aurora-navy/70 hover:bg-aurora-cream"
                            >
                              {isExpanded ? 'Ocultar texto' : 'Ver texto'}
                            </button>
                            <button
                              type="button"
                              onClick={() => openNewVersion(rule)}
                              className="min-h-[44px] rounded-lg border border-aurora-navy/20 px-4 text-sm font-semibold text-aurora-navy/70 hover:bg-aurora-cream"
                            >
                              Nueva versión
                            </button>
                            {rule.active ? (
                              <button
                                type="button"
                                onClick={() => setPending({ id: rule.id, kind: 'unpublish' })}
                                className="min-h-[44px] rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
                              >
                                Despublicar
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEdit(rule)}
                                  className="min-h-[44px] rounded-lg border border-aurora-navy/20 px-4 text-sm font-semibold text-aurora-navy/70 hover:bg-aurora-cream"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPending({ id: rule.id, kind: 'publish' })}
                                  className="min-h-[44px] rounded-lg bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700"
                                >
                                  Publicar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPending({ id: rule.id, kind: 'delete' })}
                                  className="min-h-[44px] rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
                                >
                                  Eliminar
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRulesPage;