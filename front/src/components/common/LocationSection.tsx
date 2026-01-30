import React, { useState, useEffect } from 'react';
import EditProfileField from './EditProfileField';
import locationsData from '../../data/locations.json';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationSectionProps {
  country: string;
  city: string;
  locality: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  floor: string;
  details: string;
  onSave: (data: {
    country: string;
    city: string;
    locality: string;
    postalCode: string;
    street: string;
    streetNumber: string;
    floor: string;
    details: string;
  }) => void;
  isEntrepreneurProfile?: boolean;
}

interface LocationData {
  country: string;
  cities: {
    name: string;
    localities: string[];
  }[];
}

const LocationSection: React.FC<LocationSectionProps> = ({
  country,
  city,
  locality,
  postalCode,
  street,
  streetNumber,
  floor,
  details,
  onSave,
  isEntrepreneurProfile = false,
}) => {
  const [editedCountry, setEditedCountry] = useState(country);
  const [isEditingCountry, setIsEditingCountry] = useState(false);
  const [editedCity, setEditedCity] = useState(city);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [editedLocality, setEditedLocality] = useState(locality);
  const [isEditingLocality, setIsEditingLocality] = useState(false);

  const [editedPostalCode, setEditedPostalCode] = useState(postalCode);
  const [isEditingPostalCode, setIsEditingPostalCode] = useState(false);
  const [editedStreet, setEditedStreet] = useState(street);
  const [isEditingStreet, setIsEditingStreet] = useState(false);
  const [editedStreetNumber, setEditedStreetNumber] = useState(streetNumber);
  const [isEditingStreetNumber, setIsEditingStreetNumber] = useState(false);
  const [editedFloor, setEditedFloor] = useState(floor);
  const [isEditingFloor, setIsEditingFloor] = useState(false);
  const [editedDetails, setEditedDetails] = useState(details);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableLocalities, setAvailableLocalities] = useState<string[]>([]);

  const [showSensitiveLocationInfo, setShowSensitiveLocationInfo] = useState(false);
  const [locationPassword, setLocationPassword] = useState('');
  const [locationPasswordError, setLocationPasswordError] = useState('');

  const [coordinates, setCoordinates] = useState<LatLng | null>(null);

  useEffect(() => {
    setEditedCountry(country);
    setEditedCity(city);
    setEditedLocality(locality);
    setEditedPostalCode(postalCode);
    setEditedStreet(street);
    setEditedStreetNumber(streetNumber);
    setEditedFloor(floor);
    setEditedDetails(details);
    setIsEditingCountry(false);
    setIsEditingCity(false);
    setIsEditingLocality(false);
    setIsEditingPostalCode(false);
    setIsEditingStreet(false);
    setIsEditingStreetNumber(false);
    setIsEditingFloor(false);
    setIsEditingDetails(false);
    setShowSensitiveLocationInfo(false);
    setLocationPassword('');
    setLocationPasswordError('');
    setCoordinates(null);
  }, [country, city, locality, postalCode, street, streetNumber, floor, details, isEntrepreneurProfile]);

  useEffect(() => {
    const countryData = (locationsData as LocationData[]).find((loc) => loc.country === editedCountry);
    if (countryData) {
      setAvailableCities(countryData.cities.map((c) => c.name));
      const cityData = countryData.cities.find((c) => c.name === editedCity);
      if (cityData) {
        setAvailableLocalities(cityData.localities);
      } else {
        setAvailableLocalities([]);
        setEditedLocality('');
      }
    } else {
      setAvailableCities([]);
      setAvailableLocalities([]);
      setEditedCity('');
      setEditedLocality('');
    }
  }, [editedCountry, editedCity]);

  useEffect(() => {
    if (coordinates) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}`)
        .then(res => res.json())
        .then(data => {
          setEditedStreet(data.address?.road || '');
          setEditedStreetNumber(data.address?.house_number || '');
          setEditedCity(data.address?.city || '');
          setEditedLocality(data.address?.suburb || '');
          setEditedPostalCode(data.address?.postcode || '');
        })
        .catch(err => console.error('Error en reverse geocoding:', err));
    }
  }, [coordinates]);

  const handleSaveField = (field: string, value: string) => {
    const newData = {
      country: editedCountry,
      city: editedCity,
      locality: editedLocality,
      postalCode: editedPostalCode,
      street: editedStreet,
      streetNumber: editedStreetNumber,
      floor: editedFloor,
      details: editedDetails,
      [field]: value,
    };
    onSave(newData);
  };

  const handleLocationPasswordCheck = () => {
    if (locationPassword === 'password123') {
      setShowSensitiveLocationInfo(true);
      setLocationPasswordError('');
    } else {
      setLocationPasswordError('Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        setCoordinates(e.latlng);
      },
    });
    return coordinates === null ? null : <Marker position={coordinates} />;
  };

  return (
    <div className="space-y-4">
      <EditProfileField
        label="País"
        value={editedCountry}
        isEditing={isEditingCountry}
        onEdit={() => setIsEditingCountry(true)}
        onCancel={() => {
          setEditedCountry(country);
          setIsEditingCountry(false);
        }}
      >
        <input
          list="countries"
          value={editedCountry}
          onChange={(e) => {
            setEditedCountry(e.target.value);
            setEditedCity('');
            setEditedLocality('');
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        <datalist id="countries">
          {(locationsData as LocationData[]).map((loc) => (
            <option key={loc.country} value={loc.country} />
          ))}
        </datalist>
        <button
          onClick={() => {
            handleSaveField('country', editedCountry);
            setIsEditingCountry(false);
          }}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Guardar País
        </button>
      </EditProfileField>

      <EditProfileField
        label="Ciudad"
        value={editedCity}
        isEditing={isEditingCity}
        onEdit={() => setIsEditingCity(true)}
        onCancel={() => {
          setEditedCity(city);
          setIsEditingCity(false);
        }}
      >
        <input
          list="cities"
          value={editedCity}
          onChange={(e) => {
            setEditedCity(e.target.value);
            setEditedLocality('');
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        <datalist id="cities">
          {availableCities.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <button
          onClick={() => {
            handleSaveField('city', editedCity);
            setIsEditingCity(false);
          }}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Guardar Ciudad
        </button>
      </EditProfileField>

      <EditProfileField
        label="Localidad"
        value={editedLocality}
        isEditing={isEditingLocality}
        onEdit={() => setIsEditingLocality(true)}
        onCancel={() => {
          setEditedLocality(locality);
          setIsEditingLocality(false);
        }}
      >
        <input
          list="localities"
          value={editedLocality}
          onChange={(e) => setEditedLocality(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        <datalist id="localities">
          {availableLocalities.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <button
          onClick={() => {
            handleSaveField('locality', editedLocality);
            setIsEditingLocality(false);
          }}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Guardar Localidad
        </button>
      </EditProfileField>

      {!isEntrepreneurProfile && (
        <div className="relative bg-gray-100 p-6 rounded-lg shadow-md mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Detalles de Dirección y Mapa</h3>
          {!showSensitiveLocationInfo && (
            <div className="absolute inset-0 bg-gray-200 bg-opacity-90 flex flex-col items-center justify-center rounded-lg z-10">
              <p className="text-lg font-semibold text-gray-700 mb-4">Contenido sensible oculto</p>
              <p className="text-gray-800 mb-2 text-center">
                Para ver o editar esta información, por favor, ingresa tu contraseña:
              </p>
              <input
                type="password"
                className="mt-1 block mx-auto w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-center"
                value={locationPassword}
                onChange={(e) => setLocationPassword(e.target.value)}
                placeholder="Contraseña"
              />
              {locationPasswordError && <p className="text-red-500 text-sm mt-2">{locationPasswordError}</p>}
              <button
                onClick={handleLocationPasswordCheck}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Verificar
              </button>
            </div>
          )}
          <div className={`space-y-4 ${!showSensitiveLocationInfo ? 'blur-sm pointer-events-none' : ''}`}>
            <EditProfileField
              label="Código Postal"
              value={editedPostalCode}
              isEditing={isEditingPostalCode}
              onEdit={() => setIsEditingPostalCode(true)}
              onCancel={() => {
                setEditedPostalCode(postalCode);
                setIsEditingPostalCode(false);
              }}
            >
              <input
                type="text"
                value={editedPostalCode}
                onChange={(e) => setEditedPostalCode(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                onClick={() => {
                  handleSaveField('postalCode', editedPostalCode);
                  setIsEditingPostalCode(false);
                }}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Guardar Código Postal
              </button>
            </EditProfileField>

            <EditProfileField
              label="Calle"
              value={editedStreet}
              isEditing={isEditingStreet}
              onEdit={() => setIsEditingStreet(true)}
              onCancel={() => {
                setEditedStreet(street);
                setIsEditingStreet(false);
              }}
            >
              <input
                type="text"
                value={editedStreet}
                onChange={(e) => setEditedStreet(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                onClick={() => {
                  handleSaveField('street', editedStreet);
                  setIsEditingStreet(false);
                }}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Guardar Calle
              </button>
            </EditProfileField>

            <EditProfileField
              label="Número"
              value={editedStreetNumber}
              isEditing={isEditingStreetNumber}
              onEdit={() => setIsEditingStreetNumber(true)}
              onCancel={() => {
                setEditedStreetNumber(streetNumber);
                setIsEditingStreetNumber(false);
              }}
            >
              <input
                type="text"
                value={editedStreetNumber}
                onChange={(e) => setEditedStreetNumber(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                onClick={() => {
                  handleSaveField('streetNumber', editedStreetNumber);
                  setIsEditingStreetNumber(false);
                }}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Guardar Número
              </button>
            </EditProfileField>

            <EditProfileField
              label="Piso"
              value={editedFloor}
              isEditing={isEditingFloor}
              onEdit={() => setIsEditingFloor(true)}
              onCancel={() => {
                setEditedFloor(floor);
                setIsEditingFloor(false);
              }}
            >
              <input
                type="text"
                value={editedFloor}
                onChange={(e) => setEditedFloor(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                onClick={() => {
                  handleSaveField('floor', editedFloor);
                  setIsEditingFloor(false);
                }}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Guardar Piso
              </button>
            </EditProfileField>

            <EditProfileField
              label="Detalles"
              value={editedDetails}
              isEditing={isEditingDetails}
              onEdit={() => setIsEditingDetails(true)}
              onCancel={() => {
                setEditedDetails(details);
                setIsEditingDetails(false);
              }}
            >
              <input
                type="text"
                value={editedDetails}
                onChange={(e) => setEditedDetails(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                onClick={() => {
                  handleSaveField('details', editedDetails);
                  setIsEditingDetails(false);
                }}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Guardar Detalles
              </button>
            </EditProfileField>

            <div className="mt-6 border border-gray-300 rounded p-4 relative bg-gray-50">
              <p className="mb-2 font-semibold text-gray-700">Mapa de Ubicación (haz clic para seleccionar)</p>
              <MapContainer center={[-34.6037, -58.3816]} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker />
              </MapContainer>
              {coordinates && (
                <p className="mt-2 text-sm text-gray-600">Coordenadas: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSection;