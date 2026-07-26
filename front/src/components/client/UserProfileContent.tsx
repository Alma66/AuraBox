import React, { useState, useEffect } from 'react';
import EditProfileField from '../common/EditProfileField';
import EditGenderField from '../common/EditGenderField';
import SecuritySection from '../common/SecuritySection';
import LocationSection from '../common/LocationSection';
import EditPhoneField from '../common/EditPhoneField';
import SettingsSection from '../common/SettingsSection';
import { User } from '../../types/user';
import api from '../../api/config';

interface LocationData {
  country: string;
  city: string;
  locality: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  floor: string;
  details: string;
}

interface UserProfileContentProps {
  activeSection: string;
  user: User;
  onUserUpdate: () => void;
}

const inputClass = "mt-1 block w-full rounded-lg border border-aurora-navy/15 bg-white px-3 py-2 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/50 focus:border-aurora-terracotta transition-all duration-200";
const primaryBtnClass = "mt-4 bg-aurora-terracotta hover:bg-aurora-terracottaDark text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-aurora-sm transition-all duration-200";

const UserProfileContent: React.FC<UserProfileContentProps> = ({ activeSection, user, onUserUpdate }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState(user.firstName || '');
  const [editedLastName, setEditedLastName] = useState(user.lastName || '');

  const [isEditingGender, setIsEditingGender] = useState(false);
  const [editedGender, setEditedGender] = useState(user.gender || '');

  const [isEditingBirthDate, setIsEditingBirthDate] = useState(false);
  const [editedBirthDate, setEditedBirthDate] = useState(user.birthDate || '');

  const [showSensitiveProfileInfo, setShowSensitiveProfileInfo] = useState(false);
  const [profilePassword, setProfilePassword] = useState('');
  const [profilePasswordError, setProfilePasswordError] = useState('');

  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    setEditedFirstName(user.firstName || '');
    setEditedLastName(user.lastName || '');
    setEditedGender(user.gender || '');
    setEditedBirthDate(user.birthDate || '');
    setShowSensitiveProfileInfo(false);
    setProfilePassword('');
    setProfilePasswordError('');
    setSaveError('');
    setSaveSuccess('');
  }, [user, activeSection]);

  const showFeedback = (success?: string, error?: string) => {
    setSaveSuccess(success || '');
    setSaveError(error || '');
    if (success) setTimeout(() => setSaveSuccess(''), 3000);
  };

  const handleSaveName = async () => {
    try {
      await api.patch('/users/me', {
        firstName: editedFirstName.trim(),
        lastName: editedLastName.trim(),
      });
      setIsEditingName(false);
      showFeedback('Nombre guardado correctamente');
      onUserUpdate();
    } catch {
      showFeedback(undefined, 'Error al guardar el nombre');
    }
  };

  const handleSaveGender = async (newGender: string) => {
    try {
      await api.patch('/users/me', { gender: newGender });
      setEditedGender(newGender);
      setIsEditingGender(false);
      showFeedback('Género guardado correctamente');
      onUserUpdate();
    } catch {
      showFeedback(undefined, 'Error al guardar el género');
    }
  };

  const handleSaveBirthDate = async () => {
    try {
      await api.patch('/users/me', { birthDate: editedBirthDate });
      setIsEditingBirthDate(false);
      showFeedback('Fecha de nacimiento guardada');
      onUserUpdate();
    } catch {
      showFeedback(undefined, 'Error al guardar la fecha');
    }
  };

  const handleSavePhoneNumber = async (newNumber: string) => {
    try {
      await api.patch('/users/me', { phoneNumber: newNumber ? parseInt(newNumber) : null });
      showFeedback('Teléfono guardado correctamente');
      onUserUpdate();
    } catch {
      showFeedback(undefined, 'Error al guardar el teléfono');
    }
  };

  const handleProfilePasswordCheck = async () => {
    try {
      await api.post('/users/me/verify-password', { password: profilePassword });
      setShowSensitiveProfileInfo(true);
      setProfilePasswordError('');
    } catch {
      setProfilePasswordError('Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  const handleSaveLocation = async (locationData: LocationData) => {
    try {
      await api.patch('/users/me', {
        streetAddress: locationData.street,
        addressNumber: locationData.streetNumber ? parseInt(locationData.streetNumber) : null,
        floorNumber: locationData.floor,
        addressDetails: locationData.details,
        city: locationData.city,
        province: locationData.locality || locationData.city,
        postalCode: locationData.postalCode,
        country: locationData.country,
      });
      showFeedback('Ubicación guardada correctamente');
      onUserUpdate();
    } catch {
      showFeedback(undefined, 'Error al guardar la ubicación');
    }
  };

  const handleNewsletterChange = () => {
    onUserUpdate();
  };

  const handleGenderVisibilityChange = () => {
    onUserUpdate();
  };

  const Feedback = () => (
    <>
      {saveSuccess && (
        <p className="text-green-700 text-sm mb-4 bg-green-50 border border-green-200 px-4 py-2.5 rounded-lg">{saveSuccess}</p>
      )}
      {saveError && (
        <p className="text-red-700 text-sm mb-4 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg">{saveError}</p>
      )}
    </>
  );

  const renderContent = () => {
    if (!user) return <p className="text-aurora-navy/60">Cargando información del perfil...</p>;

    switch (activeSection) {
      case 'profile':
        return (
          <div>
            <h2 className="font-display text-2xl font-bold text-aurora-navy mb-6">Mi Perfil</h2>
            <Feedback />
            <div className="space-y-4">
              <EditProfileField
                label="Nombre y Apellido"
                value={`${editedFirstName} ${editedLastName}`}
                isEditing={isEditingName}
                onEdit={() => setIsEditingName(true)}
                onCancel={() => { setEditedFirstName(user.firstName || ''); setEditedLastName(user.lastName || ''); setIsEditingName(false); }}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-aurora-navy/80">Nombre:</label>
                    <input type="text" value={editedFirstName} onChange={(e) => setEditedFirstName(e.target.value)} className={inputClass} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-aurora-navy/80">Apellido:</label>
                    <input type="text" value={editedLastName} onChange={(e) => setEditedLastName(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <button onClick={handleSaveName} className={primaryBtnClass}>Guardar Nombre</button>
              </EditProfileField>

              <EditGenderField label="Género" value={editedGender} isEditing={isEditingGender} onEdit={() => setIsEditingGender(true)} onCancel={() => { setEditedGender(user.gender || ''); setIsEditingGender(false); }} onSave={handleSaveGender} />

              <EditProfileField
                label="Fecha de Nacimiento"
                value={editedBirthDate}
                isEditing={isEditingBirthDate}
                onEdit={() => setIsEditingBirthDate(true)}
                onCancel={() => { setEditedBirthDate(user.birthDate || ''); setIsEditingBirthDate(false); }}
              >
                <input type="date" value={editedBirthDate} onChange={(e) => setEditedBirthDate(e.target.value)} className={inputClass} max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]} />
                <button onClick={handleSaveBirthDate} className={primaryBtnClass}>Guardar Fecha de Nacimiento</button>
              </EditProfileField>

              <div className="relative bg-aurora-cream/60 p-6 rounded-2xl border border-aurora-navy/5 mt-8">
                <h3 className="font-display text-lg font-bold text-aurora-navy mb-4">Información de Contacto y Documento</h3>
                {!showSensitiveProfileInfo && (
                  <div className="absolute inset-0 bg-aurora-cream/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-10 px-6">
                    <div className="w-12 h-12 rounded-full bg-aurora-navy/10 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-aurora-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="font-display text-lg font-semibold text-aurora-navy mb-1">Contenido sensible protegido</p>
                    <p className="text-aurora-navy/70 mb-4 text-center text-sm">Ingresá tu contraseña para ver o editar esta información</p>
                    <input type="password" className={`${inputClass} max-w-xs text-center`} value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} placeholder="Contraseña" onKeyDown={(e) => e.key === 'Enter' && handleProfilePasswordCheck()} />
                    {profilePasswordError && <p className="text-red-600 text-sm mt-2">{profilePasswordError}</p>}
                    <button onClick={handleProfilePasswordCheck} className={primaryBtnClass}>Verificar</button>
                  </div>
                )}
                <div className={`space-y-6 ${!showSensitiveProfileInfo ? 'blur-sm pointer-events-none' : ''}`}>
                  <EditProfileField label="Tipo de Documento y Número" value={`${user.documentType || 'N/A'}: ${user.documentNumber || 'N/A'}`} isEditing={false} onEdit={() => {}} onCancel={() => {}} isLocked={true}><></></EditProfileField>
                  <EditProfileField label="Email" value={user.email} isEditing={false} onEdit={() => {}} onCancel={() => {}} isLocked={true}><></></EditProfileField>
                  <EditPhoneField label="Número de Teléfono" value={user.phoneNumber ? String(user.phoneNumber) : ''} onSave={handleSavePhoneNumber} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div>
            <h2 className="font-display text-2xl font-bold text-aurora-navy mb-6">Ubicación</h2>
            <Feedback />
            <LocationSection
              country={user.country || ''}
              city={user.city || ''}
              locality={user.province || user.locality || ''}
              postalCode={user.postalCode || ''}
              street={user.streetAddress || user.street || ''}
              streetNumber={user.addressNumber ? String(user.addressNumber) : (user.streetNumber || '')}
              floor={user.floorNumber || user.floor || ''}
              details={user.addressDetails || user.details || ''}
              homeLatitude={user.homeLatitude}
              homeLongitude={user.homeLongitude}
              onSave={handleSaveLocation}
              isEntrepreneurProfile={false}
              userRole="customer"
            />
          </div>
        );

      case 'security':
        return (
          <SecuritySection
            showGenderPublicly={!!user.showGenderPublicly}
            onGenderVisibilityChange={handleGenderVisibilityChange}
            registeredDate={user.registeredDate}
          />
        );

      case 'settings':
        return (
          <SettingsSection
            acceptsNewsletter={!!user.acceptsNewsletter}
            onNewsletterChange={handleNewsletterChange}
          />
        );

      default:
        return <p className="text-aurora-navy/60">Seleccioná una sección del menú.</p>;
    }
  };

  return <div>{renderContent()}</div>;
};

export default UserProfileContent;