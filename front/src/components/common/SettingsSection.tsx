import React, { useState, useEffect } from 'react';

const SETTINGS_KEY = 'aurabox_settings';

interface Settings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  language: string;
  currency: string;
  personalizationEnabled: boolean;
  dataSharingEnabled: boolean;
  hideMatureContent: boolean;
  preferredCategories: string[];
  autoRenewSubscriptions: boolean;
  defaultPaymentMethod: string;
  highContrastMode: boolean;
  fontSize: string;
}

const defaultSettings: Settings = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  language: 'es',
  currency: 'ARS',
  personalizationEnabled: true,
  dataSharingEnabled: false,
  hideMatureContent: false,
  preferredCategories: ['Libros', 'Café'],
  autoRenewSubscriptions: true,
  defaultPaymentMethod: 'MercadoPago',
  highContrastMode: false,
  fontSize: 'medium',
};

const SettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try { setSettings({ ...defaultSettings, ...JSON.parse(stored) }); } catch {}
    }
  }, []);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveChanges = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaveSuccess('¡Configuración guardada con éxito!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h2>

      {saveSuccess && <p className="text-green-600 bg-green-50 p-2 rounded text-sm">{saveSuccess}</p>}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Notificaciones</h3>
        <div className="space-y-4">
          {([
            ['emailNotifications', 'Notificaciones por Email'],
            ['pushNotifications', 'Notificaciones Push (App)'],
            ['smsNotifications', 'Notificaciones por SMS'],
          ] as [keyof Settings, string][]).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <label htmlFor={key} className="text-gray-700">{label}</label>
              <input type="checkbox" id={key} checked={settings[key] as boolean}
                onChange={(e) => set(key, e.target.checked)}
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Idioma y Moneda</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="language" className="block text-gray-700 text-sm font-medium mb-1">Idioma de la Interfaz</label>
            <select id="language" value={settings.language} onChange={(e) => set('language', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option value="es">Español (Argentina)</option>
              <option value="en">English (US)</option>
              <option value="pt">Português (Brasil)</option>
            </select>
          </div>
          <div>
            <label htmlFor="currency" className="block text-gray-700 text-sm font-medium mb-1">Moneda Preferida</label>
            <select id="currency" value={settings.currency} onChange={(e) => set('currency', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option value="ARS">ARS - Pesos Argentinos</option>
              <option value="USD">USD - Dólares Estadounidenses</option>
              <option value="BRL">BRL - Reales Brasileños</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Privacidad de Datos</h3>
        <div className="space-y-4">
          {([
            ['personalizationEnabled', 'Habilitar Personalización (recomendaciones, ofertas)'],
            ['dataSharingEnabled', 'Compartir Datos Anónimos para Mejoras'],
          ] as [keyof Settings, string][]).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <label htmlFor={key} className="text-gray-700">{label}</label>
              <input type="checkbox" id={key} checked={settings[key] as boolean}
                onChange={(e) => set(key, e.target.checked)}
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Contenido y Preferencias</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="hideMatureContent" className="text-gray-700">Ocultar Contenido para Adultos</label>
            <input type="checkbox" id="hideMatureContent" checked={settings.hideMatureContent}
              onChange={(e) => set('hideMatureContent', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="preferredCategories" className="block text-gray-700 text-sm font-medium mb-1">Categorías de Interés</label>
            <select id="preferredCategories" multiple value={settings.preferredCategories}
              onChange={(e) => set('preferredCategories', Array.from(e.target.selectedOptions, o => o.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-24">
              {['Libros','Café','Vinos','Quesos','Belleza','Plantas','Mascotas','Gourmet','Arte'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Mantené Ctrl/Cmd para seleccionar múltiples.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Gestión de Suscripciones</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="autoRenewSubscriptions" className="text-gray-700">Renovar Suscripciones Automáticamente</label>
            <input type="checkbox" id="autoRenewSubscriptions" checked={settings.autoRenewSubscriptions}
              onChange={(e) => set('autoRenewSubscriptions', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="defaultPaymentMethod" className="block text-gray-700 text-sm font-medium mb-1">Método de Pago por Defecto</label>
            <select id="defaultPaymentMethod" value={settings.defaultPaymentMethod}
              onChange={(e) => set('defaultPaymentMethod', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option value="MercadoPago">MercadoPago</option>
              <option value="CreditCard">Tarjeta de Crédito/Débito</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Accesibilidad</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="highContrastMode" className="text-gray-700">Modo de Alto Contraste</label>
            <input type="checkbox" id="highContrastMode" checked={settings.highContrastMode}
              onChange={(e) => set('highContrastMode', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="fontSize" className="block text-gray-700 text-sm font-medium mb-1">Tamaño de Fuente</label>
            <select id="fontSize" value={settings.fontSize} onChange={(e) => set('fontSize', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
            </select>
          </div>
        </div>
      </div>

      <button onClick={handleSaveChanges}
        className="mt-6 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors duration-200 font-semibold">
        Guardar Cambios
      </button>
    </div>
  );
};

export default SettingsSection;