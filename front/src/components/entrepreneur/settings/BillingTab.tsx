import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../../api/config';

type MethodCode = 'mercadopago' | 'tarjeta' | 'transferencia';

const METHODS: { id: MethodCode; label: string; hint: string }[] = [
  { id: 'mercadopago', label: 'Mercado Pago', hint: 'El cliente paga con su cuenta de Mercado Pago.' },
  { id: 'tarjeta', label: 'Tarjeta de crédito o débito', hint: 'Pago directo con tarjeta.' },
  {
    id: 'transferencia',
    label: 'Transferencia bancaria',
    hint: 'El cliente transfiere a tu cuenta y se aplica el descuento por transferencia de tus planes.',
  },
];

const ALIAS_PATTERN = /^[A-Za-z0-9.-]{6,20}$/;

const inputClass =
  'min-h-[44px] w-full rounded-lg border border-aurora-navy/15 bg-white px-3 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40';

interface BillingState {
  holder: string;
  cbu: string;
  alias: string;
  methods: MethodCode[];
}

const BillingTab: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [form, setForm] = useState<BillingState>({ holder: '', cbu: '', alias: '', methods: [] });
  const [saved, setSaved] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    setFailed(false);
    try {
      const res = await api.get(`/clubs/${clubId}/billing`);
      const data = getResponseData(res);
      const next: BillingState = {
        holder: data.bankHolder ?? '',
        cbu: data.bankCbu ?? '',
        alias: data.bankAlias ?? '',
        methods: data.methods ?? [],
      };
      setForm(next);
      setSaved(JSON.stringify(next));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleMethod = (code: MethodCode) => {
    setFormError(null);
    setForm((prev) => ({
      ...prev,
      methods: prev.methods.includes(code) ? prev.methods.filter((item) => item !== code) : [...prev.methods, code],
    }));
  };

  const validate = () => {
    if (form.methods.length === 0) return 'Elegí al menos un medio de pago.';
    if (form.cbu && form.cbu.length !== 22) return 'El CBU debe tener 22 dígitos.';
    if (form.alias.trim() && !ALIAS_PATTERN.test(form.alias.trim())) {
      return 'El alias debe tener entre 6 y 20 caracteres (letras, números, puntos o guiones).';
    }
    if (form.methods.includes('transferencia') && (!form.holder.trim() || (!form.cbu && !form.alias.trim()))) {
      return 'Para aceptar transferencias cargá el titular y el CBU o el alias.';
    }
    return null;
  };

  const save = async () => {
    const problem = validate();
    if (problem) {
      setFormError(problem);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await api.put(`/clubs/${clubId}/billing`, {
        bankHolder: form.holder.trim() || null,
        bankCbu: form.cbu || null,
        bankAlias: form.alias.trim() || null,
        methods: form.methods,
      });
      setSaved(JSON.stringify(form));
      toast.success('Datos de cobro guardados.');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'No se pudieron guardar los datos.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3" aria-busy="true">
        <div className="h-24 rounded-2xl bg-aurora-navy/10" />
        <div className="h-40 rounded-2xl bg-aurora-navy/10" />
      </div>
    );
  }

  if (failed) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <p>No se pudieron cargar los datos de cobro.</p>
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

  const dirty = JSON.stringify(form) !== saved;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-aurora-navy/10 bg-white p-4 shadow-aurora-sm sm:p-6">
        <h2 className="font-display text-xl font-bold text-aurora-navy">Medios de pago aceptados</h2>
        <p className="mb-4 text-sm text-aurora-navy/60">
          Tus clientes solo verán estas opciones al pagar. En esta versión de demostración los pagos son simulados.
        </p>
        <div className="space-y-3">
          {METHODS.map((method) => (
            <label
              key={method.id}
              htmlFor={`method-${method.id}`}
              className="flex min-h-[56px] cursor-pointer items-start gap-3 rounded-xl border border-aurora-navy/10 bg-aurora-cream px-4 py-3"
            >
              <input
                id={`method-${method.id}`}
                type="checkbox"
                checked={form.methods.includes(method.id)}
                onChange={() => toggleMethod(method.id)}
                className="mt-1 h-5 w-5 rounded border-aurora-navy/25 text-aurora-terracotta"
              />
              <span>
                <span className="block text-sm font-semibold text-aurora-navy">{method.label}</span>
                <span className="block text-xs text-aurora-navy/60">{method.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-aurora-navy/10 bg-white p-4 shadow-aurora-sm sm:p-6">
        <h2 className="font-display text-xl font-bold text-aurora-navy">Datos para transferencias</h2>
        <p className="mb-4 text-sm text-aurora-navy/60">
          Se muestran al cliente cuando elige pagar por transferencia. Podés cargar datos de prueba.
        </p>
        <div className="space-y-3">
          <div>
            <label htmlFor="bank-holder" className="mb-1 block text-sm font-semibold text-aurora-navy">
              Titular de la cuenta
            </label>
            <input
              id="bank-holder"
              type="text"
              maxLength={120}
              value={form.holder}
              onChange={(e) => setForm((prev) => ({ ...prev, holder: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="bank-cbu" className="mb-1 block text-sm font-semibold text-aurora-navy">
              CBU (22 dígitos)
            </label>
            <input
              id="bank-cbu"
              type="text"
              inputMode="numeric"
              value={form.cbu}
              onChange={(e) => setForm((prev) => ({ ...prev, cbu: e.target.value.replace(/\D/g, '').slice(0, 22) }))}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="bank-alias" className="mb-1 block text-sm font-semibold text-aurora-navy">
              Alias
            </label>
            <input
              id="bank-alias"
              type="text"
              maxLength={20}
              value={form.alias}
              onChange={(e) => setForm((prev) => ({ ...prev, alias: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {formError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        {dirty && <span className="text-xs text-aurora-terracottaDark">Tenés cambios sin guardar</span>}
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="min-h-[44px] rounded-lg bg-aurora-terracotta px-6 text-sm font-semibold text-white transition-colors hover:bg-aurora-terracottaDark disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar cobros'}
        </button>
      </div>
    </div>
  );
};

export default BillingTab;