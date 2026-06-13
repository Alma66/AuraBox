import React, { useState, useEffect } from 'react';
import clubsData from '../../data/clubs.json';
import clientSubscriptionDetailsData from '../../data/clientSubscriptionDetails.json';
import { Club, SubscriptionPlan } from '../../types/club';
import { Subscription } from '../../types/subscription';
import EditProfileField from '../common/EditProfileField';
import EditGenderField from '../common/EditGenderField';
import SecuritySection from '../common/SecuritySection';
import LocationSection from '../common/LocationSection';
import EditPhoneField from '../common/EditPhoneField';
import SettingsSection from '../common/SettingsSection';
import { User } from '../../types/user';
import rawSubscriptionsData from '../../data/subscriptions.json';

const subscriptionsData: Subscription[] = rawSubscriptionsData as Subscription[];

interface BoxContentDetail {
  month: string;
  boxContent: string;
  rating: number;
  details: {
    generic: { label: string; value: string }[];
    particular: { label: string; value: string }[];
  };
}

interface ClientSubscriptionDetail {
  subscriptionId: string;
  history: BoxContentDetail[];
}

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
}

const UserProfileContent: React.FC<UserProfileContentProps> = ({ activeSection, user }) => {
  const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [selectedSubscriptionDetails, setSelectedSubscriptionDetails] =
    useState<ClientSubscriptionDetail | null>(null);

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

  useEffect(() => {
    setEditedFirstName(user.firstName || '');
    setEditedLastName(user.lastName || '');
    setEditedGender(user.gender || '');
    setEditedBirthDate(user.birthDate || '');

    const filteredSubscriptions = subscriptionsData.filter(
      (sub) => sub.userId === user.id && sub.status === 'active'
    );
    setUserSubscriptions(filteredSubscriptions);
  }, [user]);

  useEffect(() => {
    if (selectedSubscriptionId) {
      const details = clientSubscriptionDetailsData.find(
        (detail) => detail.subscriptionId === selectedSubscriptionId
      );
      setSelectedSubscriptionDetails(details || null);
    } else {
      setSelectedSubscriptionDetails(null);
    }
  }, [selectedSubscriptionId]);

  const handleViewSubscription = (subId: string) => {
    setSelectedSubscriptionId(subId);
  };

  const handleBackToSubscriptions = () => {
    setSelectedSubscriptionId(null);
    setSelectedSubscriptionDetails(null);
  };

  const handleSaveName = () => {
    const newFirstName = editedFirstName.trim();
    const newLastName = editedLastName.trim();
    console.log('Nombre y Apellido guardados:', newFirstName, newLastName);
    setIsEditingName(false);
  };

  const handleSaveGender = (newGender: string) => {
    console.log('Género guardado:', newGender);
    setEditedGender(newGender);
    setIsEditingGender(false);
  };

  const handleSaveBirthDate = () => {
    console.log('Fecha de Nacimiento guardada:', editedBirthDate);
    setIsEditingBirthDate(false);
  };

  const handleSavePhoneNumber = (newNumber: string) => {
    console.log('Número de teléfono guardado:', newNumber);
  };

  const handleProfilePasswordCheck = () => {
    if (profilePassword === 'password123') {
      setShowSensitiveProfileInfo(true);
      setProfilePasswordError('');
    } else {
      setProfilePasswordError('Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  const renderSubscriptionCard = (subscription: Subscription) => {
    const club = (clubsData as Club[]).find((c) => c.id === subscription.clubId);
    if (!club) return null;

   const plan = club.subscriptionPlans?.find(
  (p: SubscriptionPlan) => p.planId === subscription.planId
);
    const planName = plan ? plan.name : 'Plan Desconocido';
    const planImage = plan ? plan.image : club.mainImage || '/assets/default-club-image.jpg';

    return (
      <div
        key={subscription.id}
        className="bg-gray-50 rounded-lg shadow-md p-4 flex flex-col items-center text-center transition-transform duration-200 hover:scale-105"
      >
        <img
          src={planImage}
          alt={planName}
          className="w-32 h-32 object-cover rounded-full mb-4 border-2 border-blue-300"
        />
        <h3 className="text-xl font-semibold text-gray-800 mb-1">{club.name}</h3>
        <p className="text-md text-gray-600 mb-2">{planName}</p>
        <p className="text-sm text-gray-500">Desde: {new Date(subscription.startDate).toLocaleDateString()}</p>
        <button
          onClick={() => handleViewSubscription(subscription.id)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Ver Suscripción
        </button>
      </div>
    );
  };

  const renderBoxContentDetails = (details: BoxContentDetail) => {
    return (
      <div key={details.month} className="bg-gray-100 p-4 rounded-lg shadow-sm mb-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Caja de {details.month}</h4>
        <p className="text-gray-700 mb-2">Contenido: {details.boxContent}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-gray-700 mb-1">Detalles Generales:</h5>
            <ul className="list-disc list-inside text-gray-600">
              {details.details.generic.map((item, idx) => (
                <li key={idx}>
                  <strong>{item.label}:</strong> {item.value}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-1">Detalles Particulares:</h5>
            <ul className="list-disc list-inside text-gray-600">
              {details.details.particular.map((item, idx) => (
                <li key={idx}>
                  <strong>{item.label}:</strong> {item.value}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Valoración: {details.rating} estrellas</p>
      </div>
    );
  };

  const renderContent = () => {
    if (!user) {
      return <p className="text-gray-600">Cargando información del perfil...</p>;
    }

    switch (activeSection) {
      case 'profile':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Mi Perfil</h2>
            <div className="space-y-4">
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

                  <EditPhoneField label="Número de Teléfono" value={user.phoneNumber || ''} onSave={handleSavePhoneNumber} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ubicación</h2>
            <LocationSection
              country={user.country || ''}
              city={user.city || ''}
              locality={user.locality || ''}
              postalCode={user.postalCode || ''}
              street={user.street || ''}
              streetNumber={user.streetNumber || ''}
              floor={user.floor || ''}
              details={user.details || ''}
              onSave={(locationData: LocationData) => {
                console.log('Ubicación guardada:', locationData);
              }}
              isEntrepreneurProfile={false}
            />
          </div>
        );

      case 'subscriptions':
        return (
          <div>
            {selectedSubscriptionId ? (
              <div>
                <button
                  onClick={handleBackToSubscriptions}
                  className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 transform hover:translate-x-1"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Volver a Mis Suscripciones
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Detalles de Suscripción</h2>
                {selectedSubscriptionDetails ? (
                  <div className="space-y-6">{selectedSubscriptionDetails.history.map(renderBoxContentDetails)}</div>
                ) : (
                  <p className="text-gray-600">Cargando detalles de la suscripción...</p>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Mis Suscripciones Activas</h2>
                {userSubscriptions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userSubscriptions.map(renderSubscriptionCard)}
                  </div>
                ) : (
                  <p className="text-gray-600">No tienes suscripciones activas en este momento.</p>
                )}
              </div>
            )}
          </div>
        );

      case 'deliveries':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Mis Envíos</h2>
            <p className="text-gray-600">Aquí verás el historial y estado de tus envíos.</p>
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 mt-4" role="alert">
              <p className="font-bold">Próximamente:</p>
              <p>Funcionalidad de seguimiento de envíos en tiempo real.</p>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Pagos y Facturación</h2>
            <p className="text-gray-600">Aquí podrás gestionar tus métodos de pago y ver tu historial de facturas.</p>
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 mt-4" role="alert">
              <p className="font-bold">Próximamente:</p>
              <p>Gestión de tarjetas e historial de pagos detallado.</p>
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

export default UserProfileContent;