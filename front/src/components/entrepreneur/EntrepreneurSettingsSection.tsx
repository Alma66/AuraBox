import React, { useState, useEffect } from 'react';
import api, { getResponseData } from '../../api/config';

interface EntrepreneurSettingsSectionProps {
  clubId: string;
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

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/clubs/${clubId}`);
        const data = getResponseData(response);
        setContactEmail(data.contactEmail || '');
        setWhatsappContact(data.whatsappContact || '');
        setShippingWindowStartDay(data.shippingWindowStartDay ? String(data.shippingWindowStartDay) : '');
        setShippingWindowEndDay(data.shippingWindowEndDay ? String(data.shippingWindowEndDay) : '');
      } catch {
        setError('No se pudo cargar la configuración del club');
      } finally {
        setLoading(false);
      }
    };
    if (clubId) load();
  }, [clubId]);

  const handleSave = async () => {
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
      setSuccess('Configuración guardada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-600">Cargando configuración...</p>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h2>

      {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
      {success && <p className="text-green-600 text-sm bg-green-50 p-2 rounded">{success}</p>}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Idioma</h3>
        <p className="text-gray-700">Español (Argentina)</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Contacto del Club</h3>
        <p className="text-gray-600 text-sm mb-4">
          Estos datos se muestran a los suscriptores para consultas sobre tu club.
        </p>
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email de contacto</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
            <input
              type="text"
              value={whatsappContact}
              onChange={(e) => setWhatsappContact(e.target.value)}
              placeholder="Ej: +5491122334455"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Ventana de Envíos Mensual</h3>
        <p className="text-gray-600 text-sm mb-4">
          Definí entre qué días del mes se despachan las cajas de tu club.
        </p>
        <div className="flex gap-4 max-w-sm">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Día de inicio</label>
            <input
              type="number"
              min={1}
              max={31}
              value={shippingWindowStartDay}
              onChange={(e) => setShippingWindowStartDay(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Día de fin</label>
            <input
              type="number"
              min={1}
              max={31}
              value={shippingWindowEndDay}
              onChange={(e) => setShippingWindowEndDay(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {saving ? 'Guardando...' : 'Guardar Configuración'}
      </button>
    </div>
  );
};

export default EntrepreneurSettingsSection;