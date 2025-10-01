import React, { useState } from 'react';

const SettingsSection: React.FC = () => {
  // Preferencias de Notificación
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Preferencias de Idioma y Moneda
  const [language, setLanguage] = useState('es');
  const [currency, setCurrency] = useState('ARS');

  // Preferencias de Privacidad (adicionales a las de SecuritySection)
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true);
  const [dataSharingEnabled, setDataSharingEnabled] = useState(false);

  // Preferencias de Contenido
  const [hideMatureContent, setHideMatureContent] = useState(false);
  const [preferredCategories, setPreferredCategories] = useState<string[]>(['Libros', 'Café']); // Ejemplo

  // Gestión de Suscripciones (configuraciones globales)
  const [autoRenewSubscriptions, setAutoRenewSubscriptions] = useState(true);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState('MercadoPago');

  // Accesibilidad
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');

  // Simulación de guardado
  const handleSaveChanges = () => {
    console.log('Configuración guardada:', {
      emailNotifications,
      pushNotifications,
      smsNotifications,
      language,
      currency,
      personalizationEnabled,
      dataSharingEnabled,
      hideMatureContent,
      preferredCategories,
      autoRenewSubscriptions,
      defaultPaymentMethod,
      highContrastMode,
      fontSize,
    });
    alert('¡Configuración guardada con éxito!');
  };

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h2>

      {/* Preferencias de Notificación */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Notificaciones</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="emailNotifications" className="text-gray-700">Notificaciones por Email</label>
            <input
              type="checkbox"
              id="emailNotifications"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="pushNotifications" className="text-gray-700">Notificaciones Push (App)</label>
            <input
              type="checkbox"
              id="pushNotifications"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="smsNotifications" className="text-gray-700">Notificaciones por SMS</label>
            <input
              type="checkbox"
              id="smsNotifications"
              checked={smsNotifications}
              onChange={(e) => setSmsNotifications(e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Preferencias de Idioma y Moneda */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Idioma y Moneda</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="language" className="block text-gray-700 text-sm font-medium mb-1">Idioma de la Interfaz</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="es">Español (Argentina)</option>
              <option value="en">English (US)</option>
              <option value="pt">Português (Brasil)</option>
            </select>
          </div>
          <div>
            <label htmlFor="currency" className="block text-gray-700 text-sm font-medium mb-1">Moneda Preferida</label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="ARS">ARS - Pesos Argentinos</option>
              <option value="USD">USD - Dólares Estadounidenses</option>
              <option value="BRL">BRL - Reales Brasileños</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preferencias de Privacidad (adicionales) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Privacidad de Datos</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="personalizationEnabled" className="text-gray-700">Habilitar Personalización (recomendaciones, ofertas)</label>
            <input
              type="checkbox"
              id="personalizationEnabled"
              checked={personalizationEnabled}
              onChange={(e) => setPersonalizationEnabled(e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="dataSharingEnabled" className="text-gray-700">Compartir Datos Anónimos para Mejoras</label>
            <input
              type="checkbox"
              id="dataSharingEnabled"
              checked={dataSharingEnabled}
              onChange={(e) => setDataSharingEnabled(e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Preferencias de Contenido */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Contenido y Preferencias</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="hideMatureContent" className="text-gray-700">Ocultar Contenido para Adultos (si aplica)</label>
            <input
              type="checkbox"
              id="hideMatureContent"
              checked={hideMatureContent}
              onChange={(e) => setHideMatureContent(e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="preferredCategories" className="block text-gray-700 text-sm font-medium mb-1">Categorías de Interés (para recomendaciones)</label>
            <select
              id="preferredCategories"
              multiple
              value={preferredCategories}
              onChange={(e) =>
                setPreferredCategories(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-24"
            >
              <option value="Libros">Libros</option>
              <option value="Café">Café</option>
              <option value="Vinos">Vinos</option>
              <option value="Quesos">Quesos</option>
              <option value="Belleza">Belleza</option>
              <option value="Plantas">Plantas</option>
              <option value="Mascotas">Mascotas</option>
              <option value="Gourmet">Gourmet</option>
              <option value="Arte">Arte</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Mantén Ctrl/Cmd para seleccionar múltiples.</p>
          </div>
        </div>
      </div>

      {/* Gestión de Suscripciones (configuraciones globales) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Gestión de Suscripciones</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="autoRenewSubscriptions" className="text-gray-700">Renovar Suscripciones Automáticamente</label>
            <input
              type="checkbox"
              id="autoRenewSubscriptions"
              checked={autoRenewSubscriptions}
              onChange={(e) => setAutoRenewSubscriptions(e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="defaultPaymentMethod" className="block text-gray-700 text-sm font-medium mb-1">Método de Pago por Defecto</label>
            <select
              id="defaultPaymentMethod"
              value={defaultPaymentMethod}
              onChange={(e) => setDefaultPaymentMethod(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="MercadoPago">MercadoPago</option>
              <option value="CreditCard">Tarjeta de Crédito/Débito</option>
              <option value="PayPal">PayPal (si aplica)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accesibilidad */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Accesibilidad</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="highContrastMode" className="text-gray-700">Modo de Alto Contraste</label>
            <input
              type="checkbox"
              id="highContrastMode"
              checked={highContrastMode}
              onChange={(e) => setHighContrastMode(e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="fontSize" className="block text-gray-700 text-sm font-medium mb-1">Tamaño de Fuente</label>
            <select
              id="fontSize"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveChanges}
        className="mt-6 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors duration-200 font-semibold"
      >
        Guardar Cambios
      </button>
    </div>
  );
};

export default SettingsSection;