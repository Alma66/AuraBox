import React, { useState, useEffect } from 'react';
import { User } from '../../types/user';
import EditProfileField from '../common/EditProfileField';
import EditGenderField from '../common/EditGenderField';
import SecuritySection from '../common/SecuritySection';
import LocationSection from '../common/LocationSection';
import EditPhoneField from '../common/EditPhoneField';
import SettingsSection from '../common/SettingsSection';
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

interface EntrepreneurProfileContentProps {
  activeSection: string;
  user: User;
  onUserUpdate: () => void;
}

const EntrepreneurProfileContent: React.FC<EntrepreneurProfileContentProps> = ({ activeSection, user, onUserUpdate }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState(user.firstName || '');
  const [editedLastName, setEditedLastName] = useState(user.lastName || '');

  const [isEditingGender, setIsEditingGender] = useState(false);
  const [editedGender, setEditedGender] = useState(user.gender || '');

  const [isEditingBirthDate, setIsEditingBirthDate] = useState(false);
  const [editedBirthDate, setEditedBirthDate] = useState(user.birthDate || '');

  const [isEditingTaxId, setIsEditingTaxId] = useState(false);
  const [editedTaxId, setEditedTaxId] = useState(user.taxId || user.cuitCuil || '');

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
    setEditedTaxId(user.taxId || user.cuitCuil || '');
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
      await api.patch('/entrepreneurs/me', {
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

  const handleSaveGender = (newGender: string) => {
    setEditedGender(newGender);
    setIsEditingGender(false);
  };

  const handleSaveBirthDate = async () => {
    try {
      await api.patch('/entrepreneurs/me', { birthDate: editedBirthDate });
      setIsEditingBirthDate(false);
      showFeedback('Fecha de nacimiento guardada');
      onUserUpdate();
    } catch {
      showFeedback(undefined, 'Error al guardar la fecha');
    }
  };

  const handleSavePhoneNumber = async (newNumber: string) => {
    try {
      await api.patch('/entrepreneurs/me', { phoneNumber: newNumber ? parseInt(newNumber) : null });
      showFeedback('Teléfono guardado correctamente');
      onUserUpdate();
    } catch {
      showFeedback(undefined, 'Error al guardar el teléfono');
    }
  };

  const handleSaveTaxId = async () => {
    try {
      await api.patch('/entrepreneurs/me', { cuitCuil: editedTaxId ? parseInt(editedTaxId) : null });
      setIsEditingTaxId(false);
      showFeedback('CUIT/CUIL guardado correctamente');
      onUserUpdate();
    } catch {
      showFeedback(undefined, 'Error al guardar el CUIT/CUIL');
    }
  };

  const handleProfilePasswordCheck = async () => {
    try {
      await api.post('/entrepreneurs/me/verify-password', { password: profilePassword });
      setShowSensitiveProfileInfo(true);
      setProfilePasswordError('');
    } catch {
      setProfilePasswordError('Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  const handleSaveLocation = async (locationData: LocationData) => {
    try {
      await api.patch('/entrepreneurs/me', {
        city: locationData.city,
        province: locationData.locality || locationData.city,
      });
      showFeedback('Ubicación guardada correctamente');
      onUserUpdate();
    } catch {
      showFeedback(undefined, 'Error al guardar la ubicación');
    }
  };

  const Feedback = () => (
    <>
      {saveSuccess && <p className="text-green-600 text-sm mb-4 bg-green-50 p-2 rounded">{saveSuccess}</p>}
      {saveError && <p className="text-red-600 text-sm mb-4 bg-red-50 p-2 rounded">{saveError}</p>}
    </>
  );

  const renderContent = () => {
    if (!user) return <p className="text-gray-600">Cargando información del perfil...</p>;

    switch (activeSection) {
      case 'profile':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Mi Perfil Personal</h2>
            <Feedback />
            <div className="space-y-4">
              <EditProfileField
                label="Nombre y Apellido"
                value={`${editedFirstName} ${editedLastName}`}
                isEditing={isEditingName}
                onEdit={() => setIsEditingName(true)}
                onCancel={() => { setEditedFirstName(user.firstName || ''); setEditedLastName(user.lastName || ''); setIsEditingName(false); }}
              >
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Nombre:</label>
                    <input type="text" value={editedFirstName} onChange={(e) => setEditedFirstName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Apellido:</label>
                    <input type="text" value={editedLastName} onChange={(e) => setEditedLastName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                  </div>
                </div>
                <button onClick={handleSaveName} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">Guardar Nombre</button>
              </EditProfileField>

              <EditGenderField label="Género" value={editedGender} isEditing={isEditingGender} onEdit={() => setIsEditingGender(true)} onCancel={() => { setEditedGender(user.gender || ''); setIsEditingGender(false); }} onSave={handleSaveGender} />

              <EditProfileField
                label="Fecha de Nacimiento"
                value={editedBirthDate}
                isEditing={isEditingBirthDate}
                onEdit={() => setIsEditingBirthDate(true)}
                onCancel={() => { setEditedBirthDate(user.birthDate || ''); setIsEditingBirthDate(false); }}
              >
                <input type="date" value={editedBirthDate} onChange={(e) => setEditedBirthDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]} />
                <button onClick={handleSaveBirthDate} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">Guardar Fecha de Nacimiento</button>
              </EditProfileField>

              <div className="relative bg-gray-100 p-6 rounded-lg shadow-md mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Información de Contacto y Documento</h3>
                {!showSensitiveProfileInfo && (
                  <div className="absolute inset-0 bg-gray-200 bg-opacity-90 flex flex-col items-center justify-center rounded-lg z-10">
                    <p className="text-lg font-semibold text-gray-700 mb-4">Contenido sensible oculto</p>
                    <p className="text-gray-800 mb-2 text-center">Para ver o editar esta información, ingresá tu contraseña:</p>
                    <input type="password" className="mt-1 block mx-auto w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-center" value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} placeholder="Contraseña" onKeyDown={(e) => e.key === 'Enter' && handleProfilePasswordCheck()} />
                    {profilePasswordError && <p className="text-red-500 text-sm mt-2">{profilePasswordError}</p>}
                    <button onClick={handleProfilePasswordCheck} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">Verificar</button>
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

      case 'business-info':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Información del Negocio</h2>
            <Feedback />
            <div className="space-y-4">
              <EditProfileField
                label="CUIT / CUIL"
                value={editedTaxId}
                isEditing={isEditingTaxId}
                onEdit={() => setIsEditingTaxId(true)}
                onCancel={() => { setEditedTaxId(user.taxId || user.cuitCuil || ''); setIsEditingTaxId(false); }}
              >
                <input type="text" value={editedTaxId} onChange={(e) => setEditedTaxId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Ej: 20123456789" />
                <button onClick={handleSaveTaxId} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">Guardar CUIT/CUIL</button>
              </EditProfileField>

              <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 mt-4">
                <p className="font-bold">Nota:</p>
                <p>La razón social, dirección legal y detalles del negocio se gestionan desde la sección de tu Club.</p>
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ubicación</h2>
            <Feedback />
            <LocationSection
              country={user.country || 'Argentina'}
              city={user.city || ''}
              locality={user.locality || user.province || ''}
              postalCode={user.postalCode || ''}
              street={user.street || ''}
              streetNumber={user.streetNumber || ''}
              floor={user.floor || ''}
              details={user.details || ''}
              onSave={handleSaveLocation}
              isEntrepreneurProfile={true}
            />
          </div>
        );

      case 'legal-compliance':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Cumplimiento Legal</h2>
            <div className="space-y-4">
              <p className="text-gray-600">Aquí podrás gestionar documentos legales y licencias de tu negocio.</p>
              <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 mt-4">
                <p className="font-bold">Próximamente:</p>
                <p>Subida y gestión de documentos (habilitaciones, certificados), aceptación de términos de AuraBox.</p>
              </div>
            </div>
          </div>
        );

      case 'security':
        return <SecuritySection />;

      case 'settings':
        return <SettingsSection />;

      default:
        return <p className="text-gray-600">Seleccioná una sección del menú.</p>;
    }
  };

  return <div>{renderContent()}</div>;
};

export default EntrepreneurProfileContent;