import React, { useState, useEffect, useCallback } from 'react';
import api, { getResponseData } from '../../api/config';

interface EntrepreneurSettingsSectionProps {
  clubId: string;
}

interface PaymentMethodOption {
  id: number;
  method: string;
  active: boolean;
}

interface ClubPaymentMethodRelation {
  id: number;
  idClub: number;
  idPaymentMethod: number;
}

interface CourierOption {
  id: number;
  code: string;
  name: string;
  isInternal: boolean;
  active: boolean;
  baseFee?: string | null;
}

const EntrepreneurSettingsSection: React.FC<EntrepreneurSettingsSectionProps> = ({ clubId }) => {
  const [contactEmail, setContactEmail] = useState('');
  const [whatsappContact, setWhatsappContact] = useState('');
  const [shippingWindowStartDay, setShippingWindowStartDay] = useState('');
  const [shippingWindowEndDay, setShippingWindowEndDay] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [allPaymentMethods, setAllPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [clubPaymentRelations, setClubPaymentRelations] = useState<ClubPaymentMethodRelation[]>([]);
  const [togglingPaymentMethodId, setTogglingPaymentMethodId] = useState<number | null>(null);

  const [allCouriers, setAllCouriers] = useState<CourierOption[]>([]);
  const [selectedCourierIds, setSelectedCourierIds] = useState<number[]>([]);
  const [courierFees, setCourierFees] = useState<Record<number, string>>({});
  const [savingCouriers, setSavingCouriers] = useState(false);

  const load = useCallback(async () => {
    try {
      const [clubRes, paymentMethodsRes, clubPaymentRes, allCouriersRes, clubCouriersRes] = await Promise.all([
        api.get(`/clubs/${clubId}`),
        api.get('/payment-methods/active'),
        api.get(`/club-payment-method/by-club/${clubId}`),
        api.get('/courier'),
        api.get(`/courier/by-club/${clubId}`),
      ]);
      const clubData = getResponseData(clubRes);
      setContactEmail(clubData.contactEmail || '');
      setWhatsappContact(clubData.whatsappContact || '');
      setShippingWindowStartDay(clubData.shippingWindowStartDay ? String(clubData.shippingWindowStartDay) : '');
      setShippingWindowEndDay(clubData.shippingWindowEndDay ? String(clubData.shippingWindowEndDay) : '');

      setAllPaymentMethods(getResponseData(paymentMethodsRes) || []);
      setClubPaymentRelations(getResponseData(clubPaymentRes) || []);

      setAllCouriers(getResponseData(allCouriersRes) || []);
      const clubCouriers: CourierOption[] = getResponseData(clubCouriersRes) || [];
      setSelectedCourierIds(clubCouriers.map((c) => c.id));
      const fees: Record<number, string> = {};
      clubCouriers.forEach((c) => {
        fees[c.id] = c.baseFee ? String(c.baseFee) : '';
      });
      setCourierFees(fees);
    } catch {
      setError('No se pudo cargar la configuración del club');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    load();
  }, [load]);

  const showFeedback = (successMsg?: string, errorMsg?: string) => {
    setSuccess(successMsg || '');
    setError(errorMsg || '');
    if (successMsg) setTimeout(() => setSuccess(''), 3000);
  };

  const handleSaveContact = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put(`/clubs/${clubId}`, {
        contactEmail: contactEmail.trim() || undefined,
        whatsappContact: whatsappContact.trim() || undefined,
        shippingWindowStartDay: shippingWindowStartDay ? parseInt(shippingWindowStartDay) : undefined,
        shippingWindowEndDay: shippingWindowEndDay ? parseInt(shippingWindowEndDay) : undefined,
      });
      showFeedback('Configuración guardada correctamente');
    } catch {
      showFeedback(undefined, 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const isPaymentMethodSelected = (idPaymentMethod: number) =>
    clubPaymentRelations.some((r) => r.idPaymentMethod === idPaymentMethod);

  const handleTogglePaymentMethod = async (method: PaymentMethodOption) => {
    setTogglingPaymentMethodId(method.id);
    try {
      const relation = clubPaymentRelations.find((r) => r.idPaymentMethod === method.id);
      if (relation) {
        await api.delete(`/club-payment-method/${relation.id}`);
        showFeedback('Método de pago quitado correctamente');
      } else {
        await api.post('/club-payment-method', { idClub: parseInt(clubId, 10), idPaymentMethod: method.id });
        showFeedback('Método de pago agregado correctamente');
      }
      const clubPaymentRes = await api.get(`/club-payment-method/by-club/${clubId}`);
      setClubPaymentRelations(getResponseData(clubPaymentRes) || []);
    } catch {
      showFeedback(undefined, 'Error al actualizar los métodos de pago');
    } finally {
      setTogglingPaymentMethodId(null);
    }
  };

  const toggleCourierSelection = (courierId: number) => {
    setSelectedCourierIds((prev) =>
      prev.includes(courierId) ? prev.filter((id) => id !== courierId) : [...prev, courierId],
    );
  };

  const handleCourierFeeChange = (courierId: number, value: string) => {
    setCourierFees((prev) => ({ ...prev, [courierId]: value }));
  };

  const handleSaveCouriers = async () => {
    setSavingCouriers(true);
    setError('');
    setSuccess('');
    try {
      await api.put(`/courier/by-club/${clubId}`, { courierIds: selectedCourierIds });
      const feeUpdates = selectedCourierIds
        .filter((id) => courierFees[id] !== undefined && courierFees[id] !== '')
        .map((id) => api.put(`/courier/by-club/${clubId}/fee/${id}`, { baseFee: parseFloat(courierFees[id]) }));
      await Promise.all(feeUpdates);
      showFeedback('Couriers guardados correctamente');
      await load();
    } catch {
      showFeedback(undefined, 'Error al guardar los couriers');
    } finally {
      setSavingCouriers(false);
    }
  };

  if (loading) return <p className="text-aurora-navy/60">Cargando configuración...</p>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-serif font-bold text-aurora-navy mb-2">Configuración</h2>

      {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{error}</p>}
      {success && <p className="text-green-600 text-sm bg-green-50 p-2 rounded-lg">{success}</p>}

      <div className="bg-white p-6 rounded-xl shadow-aurora-sm border border-aurora-navy/10">
        <h3 className="text-xl font-semibold text-aurora-navy mb-4">Idioma</h3>
        <p className="text-aurora-navy/80">Español (Argentina)</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-aurora-sm border border-aurora-navy/10">
        <h3 className="text-xl font-semibold text-aurora-navy mb-4">Contacto del Club</h3>
        <p className="text-aurora-navy/60 text-sm mb-4">
          Estos datos se muestran a los suscriptores para consultas sobre tu club.
        </p>
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-aurora-navy">Email de contacto</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-navy focus:ring-aurora-navy sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-aurora-navy">WhatsApp</label>
            <input
              type="text"
              value={whatsappContact}
              onChange={(e) => setWhatsappContact(e.target.value)}
              placeholder="Ej: +5491122334455"
              className="mt-1 block w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-navy focus:ring-aurora-navy sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-aurora-sm border border-aurora-navy/10">
        <h3 className="text-xl font-semibold text-aurora-navy mb-4">Ventana de Envíos Mensual</h3>
        <p className="text-aurora-navy/60 text-sm mb-4">
          Definí entre qué días del mes se despachan las cajas de tu club.
        </p>
        <div className="flex gap-4 max-w-sm">
          <div className="flex-1">
            <label className="block text-sm font-medium text-aurora-navy">Día de inicio</label>
            <input
              type="number"
              min={1}
              max={31}
              value={shippingWindowStartDay}
              onChange={(e) => setShippingWindowStartDay(e.target.value)}
              className="mt-1 block w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-navy focus:ring-aurora-navy sm:text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-aurora-navy">Día de fin</label>
            <input
              type="number"
              min={1}
              max={31}
              value={shippingWindowEndDay}
              onChange={(e) => setShippingWindowEndDay(e.target.value)}
              className="mt-1 block w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-navy focus:ring-aurora-navy sm:text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleSaveContact}
          disabled={saving}
          className={`mt-4 bg-aurora-navy text-white px-6 py-2 rounded-lg hover:bg-aurora-navy/90 transition-colors duration-200 text-sm font-semibold ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {saving ? 'Guardando...' : 'Guardar Contacto y Envíos'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-aurora-sm border border-aurora-navy/10">
        <h3 className="text-xl font-semibold text-aurora-navy mb-2">Métodos de Pago Aceptados</h3>
        <p className="text-aurora-navy/60 text-sm mb-4">
          Elegí qué formas de pago aceptás para las suscripciones de tu club.
        </p>
        {allPaymentMethods.length === 0 ? (
          <p className="text-aurora-navy/50 text-sm">No hay métodos de pago disponibles en la plataforma todavía.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allPaymentMethods.map((method) => {
              const selected = isPaymentMethodSelected(method.id);
              return (
                <label
                  key={method.id}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer ${
                    selected ? 'border-aurora-navy bg-aurora-navy/5 text-aurora-navy' : 'border-aurora-navy/15 text-aurora-navy/80'
                  } ${togglingPaymentMethodId === method.id ? 'opacity-50' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={togglingPaymentMethodId === method.id}
                    onChange={() => handleTogglePaymentMethod(method)}
                    className="h-4 w-4 text-aurora-navy rounded focus:ring-aurora-navy"
                  />
                  {method.method}
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-aurora-sm border border-aurora-navy/10">
        <h3 className="text-xl font-semibold text-aurora-navy mb-2">Couriers y Mensajerías</h3>
        <p className="text-aurora-navy/60 text-sm mb-4">
          Elegí con qué servicios de envío trabaja tu club y, si querés, definí una tarifa base para cada uno.
        </p>
        {allCouriers.length === 0 ? (
          <p className="text-aurora-navy/50 text-sm">No hay couriers disponibles en la plataforma todavía.</p>
        ) : (
          <div className="space-y-3">
            {allCouriers.map((courier) => {
              const selected = selectedCourierIds.includes(courier.id);
              return (
                <div
                  key={courier.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 border rounded-lg px-4 py-3 ${
                    selected ? 'border-aurora-navy bg-aurora-navy/5' : 'border-aurora-navy/15'
                  }`}
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-aurora-navy flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleCourierSelection(courier.id)}
                      className="h-4 w-4 text-aurora-navy rounded focus:ring-aurora-navy"
                    />
                    {courier.name} {courier.isInternal && <span className="text-xs text-aurora-navy/50">(interno)</span>}
                  </label>
                  {selected && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-aurora-navy/60">Tarifa base ($)</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={courierFees[courier.id] ?? ''}
                        onChange={(e) => handleCourierFeeChange(courier.id, e.target.value)}
                        className="w-28 rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-navy focus:ring-aurora-navy sm:text-sm"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <button
          onClick={handleSaveCouriers}
          disabled={savingCouriers}
          className={`mt-4 bg-aurora-navy text-white px-6 py-2 rounded-lg hover:bg-aurora-navy/90 transition-colors duration-200 text-sm font-semibold ${savingCouriers ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {savingCouriers ? 'Guardando...' : 'Guardar Couriers'}
        </button>
      </div>
    </div>
  );
};

export default EntrepreneurSettingsSection;