// FileName: /components/entrepreneur/EntrepreneurProfileContent.tsx
import React, { useState, useEffect } from 'react';
import { User } from '../../types/user';
import EditProfileField from '../common/EditProfileField';
import EditGenderField from '../common/EditGenderField';
import SecuritySection from '../common/SecuritySection';
import LocationSection from '../common/LocationSection'; // Reutilizamos el componente LocationSection
import EditPhoneField from '../common/EditPhoneField';
import SettingsSection from '../common/SettingsSection';

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
}

const EntrepreneurProfileContent: React.FC<EntrepreneurProfileContentProps> = ({ activeSection, user }) => {
  // Estados para edición de Mi Perfil
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState(user.firstName || '');
  const [editedLastName, setEditedLastName] = useState(user.lastName || '');
  const [isEditingGender, setIsEditingGender] = useState(false);
  const [editedGender, setEditedGender] = useState(user.gender || '');
  const [isEditingBirthDate, setIsEditingBirthDate] = useState(false);
  const [editedBirthDate, setEditedBirthDate] = useState(user.birthDate || '');

  // Estados para información del negocio
  const [isEditingLegalName, setIsEditingLegalName] = useState(false);
  const [editedLegalName, setEditedLegalName] = useState(user.legalName || '');
  const [isEditingTaxId, setIsEditingTaxId] = useState(false);
  const [editedTaxId, setEditedTaxId] = useState(user.taxId || '');
  const [isEditingBusinessAddress, setIsEditingBusinessAddress] = useState(false);
  const [editedBusinessAddress, setEditedBusinessAddress] = useState(user.businessAddress || '');
  const [isEditingBusinessDetails, setIsEditingBusinessDetails] = useState(false);
  const [editedBusinessDetails, setEditedBusinessDetails] = useState(user.businessDetails || '');

  // Estados para contenido sensible en Mi Perfil
  const [showSensitiveProfileInfo, setShowSensitiveProfileInfo] = useState(false);
  const [profilePassword, setProfilePassword] = useState('');
  const [profilePasswordError, setProfilePasswordError] = useState('');

  useEffect(() => {
    setEditedFirstName(user.firstName || '');
    setEditedLastName(user.lastName || '');
    setEditedGender(user.gender || '');
    setEditedBirthDate(user.birthDate || '');
    setEditedLegalName(user.legalName || '');
    setEditedTaxId(user.taxId || '');
    setEditedBusinessAddress(user.businessAddress || '');
    setEditedBusinessDetails(user.businessDetails || '');
    setShowSensitiveProfileInfo(false); // Resetear al cambiar de sección
    setProfilePassword(''); // Resetear contraseña
    setProfilePasswordError(''); // Resetear error
  }, [user, activeSection]);

  // Guardar cambios simulados
  const handleSaveName = () => {
    const newFirstName = editedFirstName.trim();
    const newLastName = editedLastName.trim();
    console.log('Nombre y Apellido de emprendedor guardados:', newFirstName, newLastName);
    // Aquí iría la llamada a la API para actualizar el usuario
    setIsEditingName(false);
  };

  const handleSaveGender = (newGender: string) => {
    console.log('Género de emprendedor guardado:', newGender);
    setEditedGender(newGender);
    // Aquí iría la llamada a la API para actualizar el usuario
    setIsEditingGender(false);
  };

  const handleSaveBirthDate = () => {
    console.log('Fecha de Nacimiento de emprendedor guardada:', editedBirthDate);
    // Aquí iría la llamada a la API para actualizar el usuario
    setIsEditingBirthDate(false);
  };

  const handleSavePhoneNumber = (newNumber: string) => {
    console.log('Número de teléfono de emprendedor guardado:', newNumber);
    // Aquí iría la llamada a la API para actualizar el usuario
  };

  const handleSaveBusinessInfo = (field: string, value: string) => {
    console.log(`Información de negocio (${field}) guardada:`, value);
    // Aquí iría la llamada a la API para actualizar el usuario
    switch (field) {
      case 'legalName':
        setIsEditingLegalName(false);
        break;
      case 'taxId':
        setIsEditingTaxId(false);
        break;
      case 'businessAddress':
        setIsEditingBusinessAddress(false);
        break;
      case 'businessDetails':
        setIsEditingBusinessDetails(false);
        break;
    }
  };

  const handleSaveLocation = (locationData: LocationData) => {
    console.log('Ubicación del negocio guardada:', locationData);
    // Aquí iría la llamada a la API para actualizar el usuario
  };

  const handleProfilePasswordCheck = () => {
    if (profilePassword === 'password123') { // Contraseña de simulación
      setShowSensitiveProfileInfo(true);
      setProfilePasswordError('');
    } else {
      setProfilePasswordError('Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  const renderContent = () => {
    if (!user) {
      return <p className="text-gray-600">Cargando información del perfil...</p>;
    }

    switch (activeSection) {
      case 'profile':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Mi Perfil Personal</h2>
            <div className="space-y-4">
              {/* Nombre y Apellido */}
              <EditProfileField
                label="Nombre y Apellido"
                value={`${editedFirstName} ${editedLastName}`}
                isEditing={isEditingName}
                onEdit={() => setIsEditingName(true)}
                onCancel={() => {
                  setEditedFirstName(user.firstName || '');
                  setEditedLastName(user.lastName || '');
                  setIsEditingName(false);
                }}
              >
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Nombre:</label>
                    <input
                      type="text"
                      value={editedFirstName}
                      onChange={(e) => setEditedFirstName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Apellido:</label>
                    <input
                      type="text"
                      value={editedLastName}
                      onChange={(e) => setEditedLastName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveName}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Guardar Nombre
                </button>
              </EditProfileField>

              {/* Género */}
              <EditGenderField
                label="Género"
                value={editedGender}
                isEditing={isEditingGender}
                onEdit={() => setIsEditingGender(true)}
                onCancel={() => {
                  setEditedGender(user.gender || '');
                  setIsEditingGender(false);
                }}
                onSave={handleSaveGender}
              />

              {/* Fecha de Nacimiento */}
              <EditProfileField
                label="Fecha de Nacimiento"
                value={editedBirthDate}
                isEditing={isEditingBirthDate}
                onEdit={() => setIsEditingBirthDate(true)}
                onCancel={() => {
                  setEditedBirthDate(user.birthDate || '');
                  setIsEditingBirthDate(false);
                }}
              >
                <input
                  type="date"
                  value={editedBirthDate}
                  onChange={(e) => setEditedBirthDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                />
                <button
                  onClick={handleSaveBirthDate}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Guardar Fecha de Nacimiento
                </button>
              </EditProfileField>

              {/* Contenido sensible: DNI, Email, Teléfono */}
              <div className="relative bg-gray-100 p-6 rounded-lg shadow-md mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Información de Contacto y Documento</h3>
                {!showSensitiveProfileInfo && (
                  <div className="absolute inset-0 bg-gray-200 bg-opacity-90 flex flex-col items-center justify-center rounded-lg z-10">
                    <p className="text-lg font-semibold text-gray-700 mb-4">Contenido sensible oculto</p>
                    <p className="text-gray-800 mb-2 text-center">
                      Para ver o editar esta información, por favor, ingresa tu contraseña:
                    </p>
                    <input
                      type="password"
                      className="mt-1 block mx-auto w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-center"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      placeholder="Contraseña"
                    />
                    {profilePasswordError && <p className="text-red-500 text-sm mt-2">{profilePasswordError}</p>}
                    <button
                      onClick={handleProfilePasswordCheck}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      Verificar
                    </button>
                  </div>
                )}
                <div className={`space-y-6 ${!showSensitiveProfileInfo ? 'blur-sm pointer-events-none' : ''}`}>
                  {/* Tipo y Número de Documento (no editables) */}
                  <EditProfileField
                    label="Tipo de Documento y Número"
                    value={`${user.documentType || 'N/A'}: ${user.documentNumber || 'N/A'}`}
                    isEditing={false}
                    onEdit={() => {}}
                    onCancel={() => {}}
                    isLocked={true}
                  >
                    <></>
                  </EditProfileField>

                  {/* Email (no editable) */}
                  <EditProfileField
                    label="Email"
                    value={user.email}
                    isEditing={false}
                    onEdit={() => {}}
                    onCancel={() => {}}
                    isLocked={true}
                  >
                    <></>
                  </EditProfileField>

                  {/* Número de Teléfono (editable) */}
                  <EditPhoneField label="Número de Teléfono" value={user.phoneNumber || ''} onSave={handleSavePhoneNumber} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'business-info':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Información del Negocio</h2>
            <div className="space-y-4">
              <EditProfileField
                label="Razón Social / Nombre Legal"
                value={editedLegalName}
                isEditing={isEditingLegalName}
                onEdit={() => setIsEditingLegalName(true)}
                onCancel={() => {
                  setEditedLegalName(user.legalName || '');
                  setIsEditingLegalName(false);
                }}
              >
                <input
                  type="text"
                  value={editedLegalName}
                  onChange={(e) => setEditedLegalName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <button
                  onClick={() => handleSaveBusinessInfo('legalName', editedLegalName)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Guardar Razón Social
                </button>
              </EditProfileField>

              <EditProfileField
                label="CUIT / Identificación Fiscal"
                value={editedTaxId}
                isEditing={isEditingTaxId}
                onEdit={() => setIsEditingTaxId(true)}
                onCancel={() => {
                  setEditedTaxId(user.taxId || '');
                  setIsEditingTaxId(false);
                }}
              >
                <input
                  type="text"
                  value={editedTaxId}
                  onChange={(e) => setEditedTaxId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <button
                  onClick={() => handleSaveBusinessInfo('taxId', editedTaxId)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Guardar CUIT
                </button>
              </EditProfileField>

              <EditProfileField
                label="Dirección Legal del Negocio"
                value={editedBusinessAddress}
                isEditing={isEditingBusinessAddress}
                onEdit={() => setIsEditingBusinessAddress(true)}
                onCancel={() => {
                  setEditedBusinessAddress(user.businessAddress || '');
                  setIsEditingBusinessAddress(false);
                }}
              >
                <input
                  type="text"
                  value={editedBusinessAddress}
                  onChange={(e) => setEditedBusinessAddress(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <button
                  onClick={() => handleSaveBusinessInfo('businessAddress', editedBusinessAddress)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Guardar Dirección Legal
                </button>
              </EditProfileField>

              <EditProfileField
                label="Detalles del Negocio"
                value={editedBusinessDetails}
                isEditing={isEditingBusinessDetails}
                onEdit={() => setIsEditingBusinessDetails(true)}
                onCancel={() => {
                  setEditedBusinessDetails(user.businessDetails || '');
                  setIsEditingBusinessDetails(false);
                }}
              >
                <textarea
                  value={editedBusinessDetails}
                  onChange={(e) => setEditedBusinessDetails(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                ></textarea>
                <button
                  onClick={() => handleSaveBusinessInfo('businessDetails', editedBusinessDetails)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Guardar Detalles
                </button>
              </EditProfileField>
            </div>
          </div>
        );

      case 'location':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ubicación del Negocio</h2>
            <LocationSection
              country={user.country || ''}
              city={user.city || ''}
              locality={user.locality || ''}
              postalCode={user.postalCode || ''}
              street={user.street || ''}
              streetNumber={user.streetNumber || ''}
              floor={user.floor || ''}
              details={user.details || ''}
              onSave={handleSaveLocation}
              isEntrepreneurProfile={true} // Indicamos que es un perfil de emprendedor
            />
          </div>
        );

      case 'legal-compliance':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Cumplimiento Legal</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Aquí podrás gestionar documentos legales, términos y condiciones específicos de tu negocio,
                y políticas de privacidad.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 mt-4" role="alert">
                <p className="font-bold">Próximamente:</p>
                <p>Subida y gestión de documentos (ej. habilitaciones, certificados), aceptación de términos de AuraBox.</p>
              </div>
            </div>
          </div>
        );

      case 'security':
        return <SecuritySection />;

      case 'settings':
        return <SettingsSection />;

      default:
        return <p className="text-gray-600">Selecciona una sección del menú.</p>;
    }
  };

  return <div>{renderContent()}</div>;
};

export default EntrepreneurProfileContent;