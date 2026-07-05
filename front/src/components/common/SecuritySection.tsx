import React, { useState, useEffect } from 'react';
import EditProfileField from './EditProfileField';
import api from '../../api/config';
import { useAuth } from '../../App';

interface SecuritySectionProps {
  showGenderPublicly: boolean;
  onGenderVisibilityChange: (value: boolean) => void;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({ showGenderPublicly, onGenderVisibilityChange }) => {
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

  const [localShowGenderPublicly, setLocalShowGenderPublicly] = useState(showGenderPublicly);
  const [privacySuccess, setPrivacySuccess] = useState('');

  const [deletionError, setDeletionError] = useState('');
  const [deletionSuccess, setDeletionSuccess] = useState('');

  useEffect(() => {
    setLocalShowGenderPublicly(showGenderPublicly);
  }, [showGenderPublicly]);

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
    } catch {
      setPasswordError('Error al actualizar la contraseña.');
    }
  };

  const handleTogglePrivacy = async (value: boolean) => {
    setLocalShowGenderPublicly(value);
    try {
      await api.patch(updateEndpoint, { showGenderPublicly: value });
      onGenderVisibilityChange(value);
      setPrivacySuccess('Preferencia guardada');
      setTimeout(() => setPrivacySuccess(''), 3000);
    } catch {
      setLocalShowGenderPublicly(!value);
    }
  };

  const handleRequestAccountDeletion = async () => {
    if (!window.confirm('¿Estás seguro de que querés desactivar tu cuenta? Vas a perder el acceso hasta que te pongas en contacto con soporte.')) {
      return;
    }
    try {
      await api.patch(updateEndpoint, { active: false });
      setDeletionSuccess('Tu cuenta fue desactivada. Cerrando sesión...');
      setTimeout(() => {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }, 2000);
    } catch {
      setDeletionError('No se pudo procesar la solicitud. Intentá de nuevo más tarde.');
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

        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Mostrar mi género públicamente</p>
              <p className="text-sm text-gray-500">Otros usuarios podrán ver tu género en tu perfil público.</p>
            </div>
            <input type="checkbox" checked={localShowGenderPublicly}
              onChange={(e) => handleTogglePrivacy(e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
          </div>
          {privacySuccess && <p className="text-green-600 text-sm mt-2">{privacySuccess}</p>}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow-sm text-center">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Desactivar Cuenta</h4>
          <p className="text-gray-600 mb-4">Vas a perder el acceso a tu cuenta hasta que te contactes con soporte para reactivarla.</p>
          {deletionError && <p className="text-red-500 text-sm mb-2">{deletionError}</p>}
          {deletionSuccess && <p className="text-green-600 text-sm mb-2">{deletionSuccess}</p>}
          <button onClick={handleRequestAccountDeletion}
            className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors duration-200 font-semibold">
            Desactivar Cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;