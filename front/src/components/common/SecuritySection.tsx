import React, { useState, useEffect } from 'react';
import EditProfileField from './EditProfileField';
import api from '../../api/config';
import { useAuth } from '../../App';

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

const SESSIONS_KEY = 'aurabox_sessions';
const ACTIVITY_KEY = 'aurabox_activity';

const defaultSessions: ActiveSession[] = [
  { id: 'sess1', device: 'Este dispositivo', browser: 'Chrome', ipAddress: '—', location: '—', lastActive: 'Ahora', isCurrent: true },
];

const SecuritySection: React.FC = () => {
  const { userRole } = useAuth();

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

  const [userActivityLog, setUserActivityLog] = useState<UserActivity[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  useEffect(() => {
    const storedSessions = localStorage.getItem(SESSIONS_KEY);
    setActiveSessions(storedSessions ? JSON.parse(storedSessions) : defaultSessions);
    const storedActivity = localStorage.getItem(ACTIVITY_KEY);
    setUserActivityLog(storedActivity ? JSON.parse(storedActivity) : []);
  }, []);

  const persistSessions = (sessions: ActiveSession[]) => {
    setActiveSessions(sessions);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  };

  const addActivity = (type: UserActivity['type'], details: string) => {
    const newEntry: UserActivity = {
      id: `act_${Date.now()}`, type, timestamp: new Date().toISOString(), details,
    };
    setUserActivityLog(prev => {
      const updated = [newEntry, ...prev];
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const verifyEndpoint = userRole === 'entrepreneur' ? '/entrepreneurs/me/verify-password' : '/users/me/verify-password';
  const updateEndpoint = userRole === 'entrepreneur' ? '/entrepreneurs/me' : '/users/me';

  const handleSecurityCheck = async () => {
    try {
      await api.post(verifyEndpoint, { password: securityPassword });
      setShowSensitiveInfo(true);
      setAuthError('');
    } catch {
      setAuthError('Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  const handleSavePassword = async () => {
    setPasswordError(''); setPasswordSuccess('');
    if (!oldPassword) { setPasswordError('Ingresá tu contraseña actual.'); return; }
    if (newPassword.length < 6) { setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.'); return; }
    if (newPassword !== confirmNewPassword) { setPasswordError('Las contraseñas no coinciden.'); return; }

    // Verificar contraseña vieja primero
    try {
      await api.post(verifyEndpoint, { password: oldPassword });
    } catch {
      setPasswordError('La contraseña actual es incorrecta.');
      return;
    }

    try {
      await api.patch(updateEndpoint, { password: newPassword });
      setPasswordSuccess('Contraseña actualizada con éxito.');
      setIsEditingPassword(false);
      setOldPassword(''); setNewPassword(''); setConfirmNewPassword('');
      addActivity('password_change', 'Contraseña cambiada');
    } catch {
      setPasswordError('Error al actualizar la contraseña.');
    }
  };

  const handleToggle2FA = () => {
    setIsEditing2FA(true);
    setTwoFASuccess(''); setTwoFAError('');
    setTwoFASuccess('Se ha enviado un código de verificación a tu email/teléfono.');
  };

  const handleVerify2FA = () => {
    setTwoFAError(''); setTwoFASuccess('');
    if (twoFACode === '123456') {
      const next = !is2FAEnabled;
      setIs2FAEnabled(next);
      setTwoFASuccess(`2FA ${next ? 'activada' : 'desactivada'} con éxito.`);
      setIsEditing2FA(false); setTwoFACode('');
      addActivity('2fa_change', `2FA ${next ? 'activada' : 'desactivada'}`);
    } else {
      setTwoFAError('Código incorrecto. Intenta de nuevo.');
    }
  };

  const handleCloseSession = (sessionId: string) => {
    persistSessions(activeSessions.filter(s => s.id !== sessionId));
    addActivity('login', `Sesión cerrada en dispositivo ${sessionId}`);
  };

  const handleCloseAllOtherSessions = () => {
    persistSessions(activeSessions.filter(s => s.isCurrent));
    addActivity('login', 'Todas las demás sesiones cerradas');
  };

  const handleSavePrivacySettings = () => {
    localStorage.setItem('aurabox_privacy', JSON.stringify({ showGenderPublicly }));
    setIsEditingPrivacy(false);
    addActivity('profile_update', 'Preferencias de privacidad actualizadas');
  };

  const handleRequestAccountDeletion = () => {
    if (window.confirm('¿Estás seguro de que querés solicitar la eliminación de tu cuenta? Esta acción es irreversible.')) {
      addActivity('account_deletion_request', 'Solicitud de eliminación de cuenta');
      alert('Tu solicitud fue recibida. Nos pondremos en contacto para confirmar.');
    }
  };

  return (
    <div className="relative bg-gray-100 p-6 rounded-lg shadow-md mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Seguridad y Privacidad</h3>
      {!showSensitiveInfo && (
        <div className="absolute inset-0 bg-gray-200 bg-opacity-90 flex flex-col items-center justify-center rounded-lg z-10">
          <p className="text-lg font-semibold text-gray-700 mb-4">Contenido sensible oculto</p>
          <p className="text-gray-800 mb-2 text-center">Para ver o editar, ingresá tu contraseña:</p>
          <input type="password"
            className="mt-1 block mx-auto w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-center"
            value={securityPassword} onChange={(e) => setSecurityPassword(e.target.value)}
            placeholder="Contraseña" onKeyDown={(e) => e.key === 'Enter' && handleSecurityCheck()} />
          {authError && <p className="text-red-500 text-sm mt-2">{authError}</p>}
          <button onClick={handleSecurityCheck}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
            Verificar
          </button>
        </div>
      )}

      <div className={`space-y-6 ${!showSensitiveInfo ? 'blur-sm pointer-events-none' : ''}`}>

        {/* Cambio de contraseña */}
        <EditProfileField label="Contraseña" value="********" isEditing={isEditingPassword}
          onEdit={() => { setIsEditingPassword(true); setPasswordError(''); setPasswordSuccess(''); }}
          onCancel={() => { setIsEditingPassword(false); setOldPassword(''); setNewPassword(''); setConfirmNewPassword(''); setPasswordError(''); }}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña actual:</label>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nueva contraseña:</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar nueva contraseña:</label>
              <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-600 text-sm">{passwordSuccess}</p>}
            <button onClick={handleSavePassword}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
              Guardar Contraseña
            </button>
          </div>
        </EditProfileField>

        {/* 2FA */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Autenticación de Dos Factores (2FA):</label>
            {!isEditing2FA && (
              <button onClick={handleToggle2FA}
                className={`text-sm font-medium ${is2FAEnabled ? 'text-red-600 hover:text-red-800' : 'text-blue-600 hover:text-blue-800'}`}>
                {is2FAEnabled ? 'Desactivar' : 'Activar'}
              </button>
            )}
          </div>
          {isEditing2FA ? (
            <div>
              <p className="text-gray-700 mb-2">Ingresá el código enviado a tu email/teléfono:</p>
              <input type="text" value={twoFACode} onChange={(e) => setTwoFACode(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Código de verificación" />
              {twoFAError && <p className="text-red-500 text-sm mt-1">{twoFAError}</p>}
              {twoFASuccess && <p className="text-green-600 text-sm mt-1">{twoFASuccess}</p>}
              <button onClick={handleVerify2FA}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
                Verificar Código
              </button>
              <button onClick={() => { setIsEditing2FA(false); setTwoFACode(''); setTwoFAError(''); setTwoFASuccess(''); }}
                className="mt-4 ml-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
                Cancelar
              </button>
            </div>
          ) : (
            <p className={`font-semibold ${is2FAEnabled ? 'text-green-600' : 'text-gray-900'}`}>
              Estado: {is2FAEnabled ? 'Activada' : 'Desactivada'}
            </p>
          )}
        </div>

        {/* Sesiones */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Dispositivos Conectados</h4>
          {activeSessions.length > 0 ? (
            <ul className="space-y-3">
              {activeSessions.map((session) => (
                <li key={session.id} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-700">{session.device} {session.isCurrent && '(Sesión Actual)'}</p>
                    <p className="text-sm text-gray-500">{session.location} - {session.ipAddress}</p>
                    <p className="text-xs text-gray-400">Última actividad: {session.lastActive}</p>
                  </div>
                  {!session.isCurrent && (
                    <button onClick={() => handleCloseSession(session.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Cerrar Sesión
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No hay otras sesiones activas.</p>
          )}
          {activeSessions.some(s => !s.isCurrent) && (
            <button onClick={handleCloseAllOtherSessions}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 text-sm">
              Cerrar todas las demás sesiones
            </button>
          )}
        </div>

        {/* Historial */}
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
            <p className="text-gray-600">No hay actividad reciente.</p>
          )}
        </div>

        {/* Privacidad */}
        <EditProfileField label="Preferencias de Privacidad" value="Gestionar" isEditing={isEditingPrivacy}
          onEdit={() => setIsEditingPrivacy(true)}
          onCancel={() => { setIsEditingPrivacy(false); }}>
          <div className="space-y-3">
            <div className="flex items-center">
              <input id="showGenderPublicly" type="checkbox" checked={showGenderPublicly}
                onChange={(e) => setShowGenderPublicly(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="showGenderPublicly" className="ml-2 block text-sm text-gray-900">
                Mostrar mi género públicamente
              </label>
            </div>
            <button onClick={handleSavePrivacySettings}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
              Guardar Preferencias
            </button>
          </div>
        </EditProfileField>

        {/* Eliminar cuenta */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm text-center">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Eliminar Cuenta</h4>
          <p className="text-gray-600 mb-4">Esta acción es irreversible y perderás todos tus datos y suscripciones.</p>
          <button onClick={handleRequestAccountDeletion}
            className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors duration-200 font-semibold">
            Solicitar Eliminación de Cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;