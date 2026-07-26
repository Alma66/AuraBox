import React, { useState, useEffect } from 'react';
import EditProfileField from './EditProfileField';
import api from '../../api/config';
import { useAuth } from '../../App';

interface SecuritySectionProps {
  showGenderPublicly: boolean;
  onGenderVisibilityChange: (value: boolean) => void;
  registeredDate?: string;
}

const inputClass = "mt-1 block w-full rounded-lg border border-aurora-navy/15 bg-white px-3 py-2 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/50 focus:border-aurora-terracotta transition-all duration-200";
const primaryBtnClass = "mt-2 bg-aurora-terracotta hover:bg-aurora-terracottaDark text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-aurora-sm transition-all duration-200";

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
    <div className="w-11 h-6 bg-aurora-navy/15 rounded-full peer peer-checked:bg-aurora-terracotta transition-colors duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all after:duration-300 peer-checked:after:translate-x-5" />
  </label>
);

const SecuritySection: React.FC<SecuritySectionProps> = ({ showGenderPublicly, onGenderVisibilityChange, registeredDate }) => {
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
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-aurora-navy mb-2">Seguridad y Privacidad</h2>

      {registeredDate && (
        <div className="bg-aurora-cream/60 p-5 rounded-2xl border border-aurora-navy/5">
          <p className="text-aurora-navy/80 text-sm">
            Cuenta creada el{' '}
            <span className="font-semibold text-aurora-navy">
              {new Date(registeredDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </p>
        </div>
      )}

      <div className="relative bg-aurora-cream/60 p-6 rounded-2xl border border-aurora-navy/5">
        {!showSensitiveInfo && (
          <div className="absolute inset-0 bg-aurora-cream/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-10 px-6">
            <div className="w-12 h-12 rounded-full bg-aurora-navy/10 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-aurora-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="font-display text-lg font-semibold text-aurora-navy mb-1">Zona protegida</p>
            <p className="text-aurora-navy/70 mb-4 text-center text-sm">Ingresá tu contraseña para gestionar tu seguridad</p>
            <input type="password"
              className={`${inputClass} max-w-xs text-center`}
              value={securityPassword} onChange={(e) => setSecurityPassword(e.target.value)}
              placeholder="Contraseña" onKeyDown={(e) => e.key === 'Enter' && handleSecurityCheck()} />
            {authError && <p className="text-red-600 text-sm mt-2">{authError}</p>}
            <button onClick={handleSecurityCheck} className={primaryBtnClass}>Verificar</button>
          </div>
        )}

        <div className={`space-y-6 ${!showSensitiveInfo ? 'blur-sm pointer-events-none' : ''}`}>

          <EditProfileField label="Contraseña" value="········" isEditing={isEditingPassword}
            onEdit={() => { setIsEditingPassword(true); setPasswordError(''); setPasswordSuccess(''); }}
            onCancel={() => { setIsEditingPassword(false); setOldPassword(''); setNewPassword(''); setConfirmNewPassword(''); setPasswordError(''); }}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-aurora-navy/80">Contraseña actual:</label>
                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-aurora-navy/80">Nueva contraseña:</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-aurora-navy/80">Confirmar nueva contraseña:</label>
                <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={inputClass} />
              </div>
              {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
              {passwordSuccess && <p className="text-green-700 text-sm">{passwordSuccess}</p>}
              <button onClick={handleSavePassword} className={primaryBtnClass}>Guardar Contraseña</button>
            </div>
          </EditProfileField>

          <div className="bg-white p-5 rounded-xl border border-aurora-navy/10 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-aurora-navy text-sm">Mostrar mi género públicamente</p>
              <p className="text-sm text-aurora-navy/60 mt-0.5">Otros usuarios podrán ver tu género en tu perfil público.</p>
              {privacySuccess && <p className="text-green-700 text-xs mt-2">{privacySuccess}</p>}
            </div>
            <ToggleSwitch checked={localShowGenderPublicly} onChange={handleTogglePrivacy} />
          </div>

          <div className="bg-white p-6 rounded-xl border border-red-200 text-center">
            <h4 className="font-display text-lg font-semibold text-aurora-navy mb-2">Desactivar Cuenta</h4>
            <p className="text-aurora-navy/60 text-sm mb-4">Vas a perder el acceso a tu cuenta hasta que te contactes con soporte para reactivarla.</p>
            {deletionError && <p className="text-red-600 text-sm mb-2">{deletionError}</p>}
            {deletionSuccess && <p className="text-green-700 text-sm mb-2">{deletionSuccess}</p>}
            <button onClick={handleRequestAccountDeletion}
              className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold text-sm">
              Desactivar Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;