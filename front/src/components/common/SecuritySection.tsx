import React, { useState, useEffect } from 'react';
import EditProfileField from './EditProfileField';
import EditPhoneField from './EditPhoneField';

interface UserActivity {
  id: string;
  type: 'login' | 'password_change' | '2fa_change' | 'profile_update' | 'account_deletion_request';
  timestamp: string;
  details: string;
  ipAddress?: string;
  device?: string;
  location?: string;
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SecuritySectionProps {
}

const SecuritySection: React.FC<SecuritySectionProps> = () => {
  const [securityPassword, setSecurityPassword] = useState('');
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [authError, setAuthError] = useState('');

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isEditing2FA, setIsEditing2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAError, setTwoFAError] = useState('');
  const [twoFASuccess, setTwoFASuccess] = useState('');

  const [isEditingPrivacy, setIsEditingPrivacy] = useState(false);
  const [showGenderPublicly, setShowGenderPublicly] = useState(false);
  const [receivePromoEmails, setReceivePromoEmails] = useState(true);

  const [userActivityLog, setUserActivityLog] = useState<UserActivity[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  useEffect(() => {
    setUserActivityLog([
      { id: 'act1', type: 'login', timestamp: '2024-07-01T10:00:00Z', details: 'Inicio de sesión exitoso', ipAddress: '192.168.1.1', device: 'Chrome en Windows', location: 'Buenos Aires, Argentina' },
      { id: 'act2', type: 'profile_update', timestamp: '2024-06-28T15:30:00Z', details: 'Actualización de dirección', ipAddress: '192.168.1.1', device: 'Chrome en Windows', location: 'Buenos Aires, Argentina' },
      { id: 'act3', type: 'login', timestamp: '2024-06-25T08:45:00Z', details: 'Inicio de sesión exitoso', ipAddress: '192.168.1.2', device: 'Safari en iOS', location: 'Córdoba, Argentina' },
    ]);
    setActiveSessions([
      { id: 'sess1', device: 'Chrome en Windows', browser: 'Chrome', ipAddress: '192.168.1.1', location: 'Buenos Aires, Argentina', lastActive: 'Hace 5 minutos', isCurrent: true },
      { id: 'sess2', device: 'Safari en iOS', browser: 'Safari', ipAddress: '192.168.1.2', location: 'Córdoba, Argentina', lastActive: 'Hace 3 días', isCurrent: false },
    ]);
    setIs2FAEnabled(true);
  }, []);

  const handleSecurityCheck = () => {
    if (securityPassword === 'password123') {
      setShowSensitiveInfo(true);
      setAuthError('');
    } else {
      setAuthError('Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  const handleSavePassword = () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (oldPassword.length === 0) {
      setPasswordError('Debes ingresar tu contraseña actual.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }
    if (oldPassword !== 'password123') {
      setPasswordError('La contraseña actual es incorrecta.');
      return;
    }

    console.log('Contraseña cambiada con éxito (simulado)');
    setPasswordSuccess('Contraseña actualizada con éxito.');
    setIsEditingPassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setUserActivityLog((prev) => [
      { id: `act${prev.length + 1}`, type: 'password_change', timestamp: new Date().toISOString(), details: 'Contraseña cambiada' },
      ...prev,
    ]);
  };

  const handleToggle2FA = () => {
    setIsEditing2FA(true);
    setTwoFASuccess('');
    setTwoFAError('');
    console.log(`Simulando envío de código 2FA`);
    setTwoFASuccess('Se ha enviado un código de verificación a tu email/teléfono.');
  };

  const handleVerify2FA = () => {
    setTwoFAError('');
    setTwoFASuccess('');
    if (twoFACode === '123456') {
      setIs2FAEnabled(!is2FAEnabled);
      setTwoFASuccess(`Autenticación de dos factores ${is2FAEnabled ? 'desactivada' : 'activada'} con éxito.`);
      setIsEditing2FA(false);
      setTwoFACode('');
      setUserActivityLog((prev) => [
        { id: `act${prev.length + 1}`, type: '2fa_change', timestamp: new Date().toISOString(), details: `2FA ${is2FAEnabled ? 'desactivada' : 'activada'}` },
        ...prev,
      ]);
    } else {
      setTwoFAError('Código incorrecto. Intenta de nuevo.');
    }
  };

  const handleCancel2FA = () => {
    setIsEditing2FA(false);
    setTwoFACode('');
    setTwoFAError('');
    setTwoFASuccess('');
  };

  const handleCloseSession = (sessionId: string) => {
    setActiveSessions((prev) => prev.filter((session) => session.id !== sessionId));
    console.log(`Sesión ${sessionId} cerrada (simulado)`);
    setUserActivityLog((prev) => [
      { id: `act${prev.length + 1}`, type: 'login', timestamp: new Date().toISOString(), details: `Sesión cerrada en dispositivo ${sessionId}` },
      ...prev,
    ]);
  };

  const handleCloseAllOtherSessions = () => {
    setActiveSessions((prev) => prev.filter((session) => session.isCurrent));
    console.log('Todas las demás sesiones cerradas (simulado)');
    setUserActivityLog((prev) => [
      { id: `act${prev.length + 1}`, type: 'login', timestamp: new Date().toISOString(), details: 'Todas las demás sesiones cerradas' },
      ...prev,
    ]);
  };

  const handleSavePrivacySettings = () => {
    console.log('Preferencias de privacidad guardadas (simulado)', {
      showGenderPublicly,
      receivePromoEmails,
    });
    setIsEditingPrivacy(false);
    setUserActivityLog((prev) => [
      { id: `act${prev.length + 1}`, type: 'profile_update', timestamp: new Date().toISOString(), details: 'Preferencias de privacidad actualizadas' },
      ...prev,
    ]);
  };

  const handleRequestAccountDeletion = () => {
    if (window.confirm('¿Estás seguro de que quieres solicitar la eliminación de tu cuenta? Esta acción es irreversible.')) {
      console.log('Solicitud de eliminación de cuenta enviada (simulado)');
      alert('Tu solicitud de eliminación de cuenta ha sido recibida. Nos pondremos en contacto contigo para confirmar.');
      setUserActivityLog((prev) => [
        { id: `act${prev.length + 1}`, type: 'account_deletion_request', timestamp: new Date().toISOString(), details: 'Solicitud de eliminación de cuenta' },
        ...prev,
      ]);
    }
  };

  return (
    <div className="relative bg-gray-100 p-6 rounded-lg shadow-md mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Seguridad y Privacidad</h3>
      {!showSensitiveInfo && (
        <div className="absolute inset-0 bg-gray-200 bg-opacity-90 flex flex-col items-center justify-center rounded-lg z-10">
          <p className="text-lg font-semibold text-gray-700 mb-4">Contenido sensible oculto</p>
          <p className="text-gray-800 mb-2 text-center">
            Para ver o editar información sensible, por favor, ingresa tu contraseña:
          </p>
          <input
            type="password"
            className="mt-1 block mx-auto w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-center"
            value={securityPassword}
            onChange={(e) => setSecurityPassword(e.target.value)}
            placeholder="Contraseña"
          />
          {authError && <p className="text-red-500 text-sm mt-2">{authError}</p>}
          <button
            onClick={handleSecurityCheck}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Verificar
          </button>
        </div>
      )}
      <div className={`space-y-6 ${!showSensitiveInfo ? 'blur-sm pointer-events-none' : ''}`}>
        <EditProfileField
          label="Contraseña"
          value="********"
          isEditing={isEditingPassword}
          onEdit={() => {
            setIsEditingPassword(true);
            setPasswordError('');
            setPasswordSuccess('');
          }}
          onCancel={() => {
            setIsEditingPassword(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setPasswordError('');
            setPasswordSuccess('');
          }}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña Antigua:</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nueva Contraseña:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña:</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-600 text-sm mt-1">{passwordSuccess}</p>}
            <button
              onClick={handleSavePassword}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Guardar Contraseña
            </button>
            <button
              onClick={() => {
                setIsEditingPassword(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setPasswordError('');
                setPasswordSuccess('');
              }}
              className="mt-4 ml-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </EditProfileField>

        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Autenticación de Dos Factores (2FA):</label>
            {!isEditing2FA && (
              <button
                onClick={handleToggle2FA}
                className={`text-sm font-medium ${is2FAEnabled ? 'text-red-600 hover:text-red-800' : 'text-blue-600 hover:text-blue-800'}`}
              >
                {is2FAEnabled ? 'Desactivar' : 'Activar'}
              </button>
            )}
          </div>
          {isEditing2FA ? (
            <div>
              <p className="text-gray-700 mb-2">
                {is2FAEnabled
                  ? 'Para desactivar 2FA, ingresa el código de verificación enviado a tu email/teléfono.'
                  : 'Para activar 2FA, ingresa el código de verificación enviado a tu email/teléfono.'}
              </p>
              <input
                type="text"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Código de verificación"
              />
              {twoFAError && <p className="text-red-500 text-sm mt-1">{twoFAError}</p>}
              {twoFASuccess && <p className="text-green-600 text-sm mt-1">{twoFASuccess}</p>}
              <button
                onClick={handleVerify2FA}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Verificar Código
              </button>
              <button
                onClick={handleCancel2FA}
                className="mt-4 ml-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <p className={`font-semibold ${is2FAEnabled ? 'text-green-600' : 'text-gray-900'}`}>
              Estado: {is2FAEnabled ? 'Activada' : 'Desactivada'}
            </p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Dispositivos Conectados</h4>
          {activeSessions.length > 0 ? (
            <ul className="space-y-3">
              {activeSessions.map((session) => (
                <li key={session.id} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-700">
                      {session.device} {session.isCurrent && '(Sesión Actual)'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {session.location} - {session.ipAddress}
                    </p>
                    <p className="text-xs text-gray-400">Última actividad: {session.lastActive}</p>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleCloseSession(session.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Cerrar Sesión
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No hay otras sesiones activas.</p>
          )}
          {activeSessions.some((session) => !session.isCurrent) && (
            <button
              onClick={handleCloseAllOtherSessions}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 text-sm"
            >
              Cerrar todas las demás sesiones
            </button>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Historial de Actividad Reciente</h4>
          {userActivityLog.length > 0 ? (
            <ul className="space-y-3">
              {userActivityLog.slice(0, 5).map((activity) => (
                <li key={activity.id} className="border-b pb-2 last:border-b-0">
                  <p className="font-medium text-gray-700">{activity.details}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()} {activity.location && `- ${activity.location}`}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No hay actividad reciente para mostrar.</p>
          )}
        </div>

        <EditProfileField
          label="Preferencias de Privacidad"
          value="Gestionar"
          isEditing={isEditingPrivacy}
          onEdit={() => setIsEditingPrivacy(true)}
          onCancel={() => {
            setIsEditingPrivacy(false);
            setShowGenderPublicly(false);
            setReceivePromoEmails(true);
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="showGenderPublicly"
                type="checkbox"
                checked={showGenderPublicly}
                onChange={(e) => setShowGenderPublicly(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="showGenderPublicly" className="ml-2 block text-sm text-gray-900">
                Mostrar mi género públicamente (si aplica)
              </label>
                        </div>
            <button
              onClick={handleSavePrivacySettings}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Guardar Preferencias
            </button>
          </div>
        </EditProfileField>

        <div className="bg-gray-50 p-4 rounded-lg shadow-sm text-center">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Eliminar Cuenta</h4>
          <p className="text-gray-600 mb-4">
            Si deseas eliminar tu cuenta de AuraBox, ten en cuenta que esta acción es irreversible y perderás todos tus datos y suscripciones.
          </p>
          <button
            onClick={handleRequestAccountDeletion}
            className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors duration-200 font-semibold"
          >
            Solicitar Eliminación de Cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;