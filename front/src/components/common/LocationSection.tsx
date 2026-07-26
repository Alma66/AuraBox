import React, { useState, useEffect, useRef } from 'react';
import EditProfileField from './EditProfileField';
import locationsData from '../../data/locations.json';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L, { LatLng, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../api/config';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationSectionProps {
  country: string;
  city: string;
  locality: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  floor: string;
  details: string;
  homeLatitude?: string | null;
  homeLongitude?: string | null;
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
  userRole?: 'customer' | 'entrepreneur';
}

interface LocationData {
  country: string;
  cities: { name: string; localities: string[] }[];
}

const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816];

const RecenterMap: React.FC<{ position: LatLng | null }> = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 16);
  }, [position, map]);
  return null;
};

const LocationSection: React.FC<LocationSectionProps> = ({
  country, city, locality, postalCode, street, streetNumber, floor, details,
  homeLatitude, homeLongitude, onSave, isEntrepreneurProfile = false, userRole = 'customer',
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
  const [coordinates, setCoordinates] = useState<LatLng | null>(
    homeLatitude && homeLongitude ? new LatLng(Number(homeLatitude), Number(homeLongitude)) : null,
  );
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const geocodedOnce = useRef(false);

  useEffect(() => {
    setEditedCountry(country); setEditedCity(city); setEditedLocality(locality);
    setEditedPostalCode(postalCode); setEditedStreet(street);
    setEditedStreetNumber(streetNumber); setEditedFloor(floor); setEditedDetails(details);
    setIsEditingCountry(false); setIsEditingCity(false); setIsEditingLocality(false);
    setIsEditingPostalCode(false); setIsEditingStreet(false);
    setIsEditingStreetNumber(false); setIsEditingFloor(false); setIsEditingDetails(false);
    setShowSensitiveLocationInfo(false);
    setLocationPassword(''); setLocationPasswordError('');
    setSaveError(''); setSaveSuccess('');
  }, [country, city, locality, postalCode, street, streetNumber, floor, details, isEntrepreneurProfile]);

  useEffect(() => {
    if (homeLatitude && homeLongitude) {
      setCoordinates(new LatLng(Number(homeLatitude), Number(homeLongitude)));
    }
  }, [homeLatitude, homeLongitude]);

  useEffect(() => {
    const countryData = (locationsData as LocationData[]).find((loc) => loc.country === editedCountry);
    if (countryData) {
      setAvailableCities(countryData.cities.map((c) => c.name));
      const cityData = countryData.cities.find((c) => c.name === editedCity);
      setAvailableLocalities(cityData ? cityData.localities : []);
      if (!cityData) setEditedLocality('');
    } else {
      setAvailableCities([]); setAvailableLocalities([]);
      setEditedCity(''); setEditedLocality('');
    }
  }, [editedCountry, editedCity]);

  useEffect(() => {
    if (coordinates || geocodedOnce.current) return;
    if (!street && !city) return;
    geocodedOnce.current = true;
    const query = `${street} ${streetNumber}, ${city}, ${locality}, ${country}`;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCoordinates(new LatLng(Number(data[0].lat), Number(data[0].lon)));
        }
      })
      .catch(() => {});
  }, [coordinates, street, streetNumber, city, locality, country, isEntrepreneurProfile]);

  const endpoint = userRole === 'entrepreneur' ? '/entrepreneurs/me' : '/users/me';
  const verifyEndpoint = userRole === 'entrepreneur' ? '/entrepreneurs/me/verify-password' : '/users/me/verify-password';

  const showFeedback = (success?: string, error?: string) => {
    setSaveSuccess(success || ''); setSaveError(error || '');
    if (success) setTimeout(() => setSaveSuccess(''), 3000);
  };

  const buildCurrentData = () => ({
    country: editedCountry, city: editedCity, locality: editedLocality,
    postalCode: editedPostalCode, street: editedStreet,
    streetNumber: editedStreetNumber, floor: editedFloor, details: editedDetails,
  });

  const persistLocation = async (patch: Record<string, any>) => {
    try {
      await api.patch(endpoint, patch);
      onSave(buildCurrentData());
      showFeedback('Guardado correctamente');
    } catch {
      showFeedback(undefined, 'Error al guardar');
    }
  };

  const handleLocationPasswordCheck = async () => {
    try {
      await api.post(verifyEndpoint, { password: locationPassword });
      setShowSensitiveLocationInfo(true);
      setLocationPasswordError('');
    } catch {
      setLocationPasswordError('Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  const handleMapClick = async (latlng: LatLng) => {
    setCoordinates(latlng);
    try {
      await api.patch(endpoint, { latitude: latlng.lat, longitude: latlng.lng });
    } catch {
      showFeedback(undefined, 'Error al guardar la ubicación en el mapa');
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
      const data = await res.json();
      const nextStreet = data.address?.road || editedStreet;
      const nextStreetNumber = data.address?.house_number || editedStreetNumber;
      const nextCity = data.address?.city || data.address?.town || editedCity;
      const nextLocality = data.address?.suburb || editedLocality;
      const nextPostalCode = data.address?.postcode || editedPostalCode;
      setEditedStreet(nextStreet);
      setEditedStreetNumber(nextStreetNumber);
      setEditedCity(nextCity);
      setEditedLocality(nextLocality);
      setEditedPostalCode(nextPostalCode);
      await api.patch(endpoint, {
        streetAddress: nextStreet,
        addressNumber: nextStreetNumber ? parseInt(nextStreetNumber) : null,
        city: nextCity,
        province: nextLocality,
        postalCode: nextPostalCode,
      });
      onSave({
        country: editedCountry, city: nextCity, locality: nextLocality,
        postalCode: nextPostalCode, street: nextStreet, streetNumber: nextStreetNumber,
        floor: editedFloor, details: editedDetails,
      });
      showFeedback('Ubicación actualizada en el mapa');
    } catch {
      showFeedback('Pin guardado, pero no se pudo completar la dirección automáticamente');
    }
  };

  const LocationMarker = () => {
    useMapEvents({ click(e: LeafletMouseEvent) { handleMapClick(e.latlng); } });
    return coordinates === null ? null : <Marker position={coordinates} />;
  };

  return (
    <div className="space-y-4">
      {saveSuccess && <p className="text-green-600 text-sm bg-green-50 p-2 rounded-lg">{saveSuccess}</p>}
      {saveError && <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{saveError}</p>}

      <EditProfileField label="País" value={editedCountry} isEditing={isEditingCountry}
        onEdit={() => setIsEditingCountry(true)}
        onCancel={() => { setEditedCountry(country); setIsEditingCountry(false); }}>
        <input list="countries" value={editedCountry}
          onChange={(e) => { setEditedCountry(e.target.value); setEditedCity(''); setEditedLocality(''); }}
          className="mt-1 block w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-terracotta focus:ring-aurora-terracotta sm:text-sm" />
        <datalist id="countries">
          {(locationsData as LocationData[]).map((loc) => <option key={loc.country} value={loc.country} />)}
        </datalist>
        <button onClick={async () => {
          await persistLocation({ country: editedCountry });
          setIsEditingCountry(false);
        }} className="mt-3 bg-aurora-terracotta text-white px-4 py-2 rounded-lg hover:bg-aurora-terracottaDark transition-colors duration-200 text-sm font-semibold">
          Guardar País
        </button>
      </EditProfileField>

      <EditProfileField label="Ciudad" value={editedCity} isEditing={isEditingCity}
        onEdit={() => setIsEditingCity(true)}
        onCancel={() => { setEditedCity(city); setIsEditingCity(false); }}>
        <input list="cities" value={editedCity}
          onChange={(e) => { setEditedCity(e.target.value); setEditedLocality(''); }}
          className="mt-1 block w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-terracotta focus:ring-aurora-terracotta sm:text-sm" />
        <datalist id="cities">
          {availableCities.map((c) => <option key={c} value={c} />)}
        </datalist>
        <button onClick={async () => {
          await persistLocation({ city: editedCity });
          setIsEditingCity(false);
        }} className="mt-3 bg-aurora-terracotta text-white px-4 py-2 rounded-lg hover:bg-aurora-terracottaDark transition-colors duration-200 text-sm font-semibold">
          Guardar Ciudad
        </button>
      </EditProfileField>

      <EditProfileField label="Localidad / Provincia" value={editedLocality} isEditing={isEditingLocality}
        onEdit={() => setIsEditingLocality(true)}
        onCancel={() => { setEditedLocality(locality); setIsEditingLocality(false); }}>
        <input list="localities" value={editedLocality}
          onChange={(e) => setEditedLocality(e.target.value)}
          className="mt-1 block w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-terracotta focus:ring-aurora-terracotta sm:text-sm" />
        <datalist id="localities">
          {availableLocalities.map((c) => <option key={c} value={c} />)}
        </datalist>
        <button onClick={async () => {
          await persistLocation({ province: editedLocality });
          setIsEditingLocality(false);
        }} className="mt-3 bg-aurora-terracotta text-white px-4 py-2 rounded-lg hover:bg-aurora-terracottaDark transition-colors duration-200 text-sm font-semibold">
          Guardar Localidad
        </button>
      </EditProfileField>

      <div className="relative bg-aurora-cream p-6 rounded-xl shadow-aurora-sm mt-8">
        <h3 className="text-xl font-serif font-bold text-aurora-navy mb-4">Detalles de Dirección y Mapa</h3>
        {!showSensitiveLocationInfo && (
          <div className="absolute inset-0 bg-aurora-cream/95 flex flex-col items-center justify-center rounded-xl z-10">
            <p className="text-lg font-semibold text-aurora-navy mb-4">Contenido sensible oculto</p>
            <p className="text-aurora-navy/80 mb-2 text-center px-6">Para ver o editar esta información, ingresá tu contraseña:</p>
            <input type="password"
              className="mt-1 block mx-auto w-full max-w-xs rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-terracotta focus:ring-aurora-terracotta sm:text-sm text-center"
              value={locationPassword} onChange={(e) => setLocationPassword(e.target.value)}
              placeholder="Contraseña"
              onKeyDown={(e) => e.key === 'Enter' && handleLocationPasswordCheck()} />
            {locationPasswordError && <p className="text-red-600 text-sm mt-2">{locationPasswordError}</p>}
            <button onClick={handleLocationPasswordCheck}
              className="mt-4 bg-aurora-terracotta text-white px-4 py-2 rounded-lg hover:bg-aurora-terracottaDark transition-colors duration-200 text-sm font-semibold">
              Verificar
            </button>
          </div>
        )}
        <div className={`space-y-4 ${!showSensitiveLocationInfo ? 'blur-sm pointer-events-none' : ''}`}>
          <EditProfileField label="Código Postal" value={editedPostalCode} isEditing={isEditingPostalCode}
            onEdit={() => setIsEditingPostalCode(true)}
            onCancel={() => { setEditedPostalCode(postalCode); setIsEditingPostalCode(false); }}>
            <input type="text" value={editedPostalCode} onChange={(e) => setEditedPostalCode(e.target.value)}
              className="mt-1 block w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-terracotta focus:ring-aurora-terracotta sm:text-sm" />
            <button onClick={async () => { await persistLocation({ postalCode: editedPostalCode }); setIsEditingPostalCode(false); }}
              className="mt-3 bg-aurora-terracotta text-white px-4 py-2 rounded-lg hover:bg-aurora-terracottaDark transition-colors duration-200 text-sm font-semibold">
              Guardar Código Postal
            </button>
          </EditProfileField>

          <EditProfileField label="Calle" value={editedStreet} isEditing={isEditingStreet}
            onEdit={() => setIsEditingStreet(true)}
            onCancel={() => { setEditedStreet(street); setIsEditingStreet(false); }}>
            <input type="text" value={editedStreet} onChange={(e) => setEditedStreet(e.target.value)}
              className="mt-1 block w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-terracotta focus:ring-aurora-terracotta sm:text-sm" />
            <button onClick={async () => { await persistLocation({ streetAddress: editedStreet }); setIsEditingStreet(false); }}
              className="mt-3 bg-aurora-terracotta text-white px-4 py-2 rounded-lg hover:bg-aurora-terracottaDark transition-colors duration-200 text-sm font-semibold">
              Guardar Calle
            </button>
          </EditProfileField>

          <EditProfileField label="Número" value={editedStreetNumber} isEditing={isEditingStreetNumber}
            onEdit={() => setIsEditingStreetNumber(true)}
            onCancel={() => { setEditedStreetNumber(streetNumber); setIsEditingStreetNumber(false); }}>
            <input type="text" value={editedStreetNumber} onChange={(e) => setEditedStreetNumber(e.target.value)}
              className="mt-1 block w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-terracotta focus:ring-aurora-terracotta sm:text-sm" />
            <button onClick={async () => {
              await persistLocation({ addressNumber: editedStreetNumber ? parseInt(editedStreetNumber) : null });
              setIsEditingStreetNumber(false);
            }} className="mt-3 bg-aurora-terracotta text-white px-4 py-2 rounded-lg hover:bg-aurora-terracottaDark transition-colors duration-200 text-sm font-semibold">
              Guardar Número
            </button>
          </EditProfileField>

          <EditProfileField label="Piso" value={editedFloor} isEditing={isEditingFloor}
            onEdit={() => setIsEditingFloor(true)}
            onCancel={() => { setEditedFloor(floor); setIsEditingFloor(false); }}>
            <input type="text" value={editedFloor} onChange={(e) => setEditedFloor(e.target.value)}
              className="mt-1 block w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-terracotta focus:ring-aurora-terracotta sm:text-sm" />
            <button onClick={async () => { await persistLocation({ floorNumber: editedFloor }); setIsEditingFloor(false); }}
              className="mt-3 bg-aurora-terracotta text-white px-4 py-2 rounded-lg hover:bg-aurora-terracottaDark transition-colors duration-200 text-sm font-semibold">
              Guardar Piso
            </button>
          </EditProfileField>

          <EditProfileField label="Detalles" value={editedDetails} isEditing={isEditingDetails}
            onEdit={() => setIsEditingDetails(true)}
            onCancel={() => { setEditedDetails(details); setIsEditingDetails(false); }}>
            <input type="text" value={editedDetails} onChange={(e) => setEditedDetails(e.target.value)}
              className="mt-1 block w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-terracotta focus:ring-aurora-terracotta sm:text-sm" />
            <button onClick={async () => { await persistLocation({ addressDetails: editedDetails }); setIsEditingDetails(false); }}
              className="mt-3 bg-aurora-terracotta text-white px-4 py-2 rounded-lg hover:bg-aurora-terracottaDark transition-colors duration-200 text-sm font-semibold">
              Guardar Detalles
            </button>
          </EditProfileField>

          <div className="mt-6 border border-aurora-navy/10 rounded-xl p-4 relative bg-white">
            <p className="mb-2 font-semibold text-aurora-navy">Mapa de Ubicación (hacé clic para marcar tu dirección)</p>
            <MapContainer center={coordinates ?? DEFAULT_CENTER} zoom={coordinates ? 16 : 13} style={{ height: '400px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
              <LocationMarker />
              <RecenterMap position={coordinates} />
            </MapContainer>
            {coordinates && (
              <p className="mt-2 text-sm text-aurora-navy/70">
                Coordenadas: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSection;