import React, { useState, useEffect } from 'react';
import EditProfileField from './EditProfileField';

interface EditPhoneFieldProps {
  label: string;
  value: string;
  onSave: (newNumber: string) => void;
}

const EditPhoneField: React.FC<EditPhoneFieldProps> = ({ label, value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [countryCode, setCountryCode] = useState('+54');
  const [areaCode, setAreaCode] = useState('911');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const formatPhoneNumberDisplay = (fullNumber: string) => {
    if (!fullNumber) return 'N/A';
    const match = fullNumber.match(/^\+(\d{1,3})(\d{1,4})(\d{6,10})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3].replace(/(\d{4})(\d{4})/, '$1-$2')}`;
    }
    return fullNumber;
  };

  useEffect(() => {
    if (value) {
      const match = value.match(/^\+(\d{1,3})(\d{1,4})(\d{6,10})$/);
      if (match) {
        setCountryCode(`+${match[1]}`);
        setAreaCode(match[2]);
        setPhoneNumber(match[3]);
      } else {
        setCountryCode('+54');
        setAreaCode('');
        setPhoneNumber(value);
      }
    } else {
      setCountryCode('+54');
      setAreaCode('');
      setPhoneNumber('');
    }
  }, [value, isEditing]);

  const handleSave = () => {
    setError('');
    if (!phoneNumber || !areaCode || !countryCode) {
      setError('Todos los campos del teléfono son obligatorios.');
      return;
    }
    if (!/^\d+$/.test(areaCode) || !/^\d+$/.test(phoneNumber)) {
      setError('El código de área y el número de teléfono deben contener solo dígitos.');
      return;
    }

    const fullNumber = `${countryCode}${areaCode}${phoneNumber}`;
    onSave(fullNumber);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    if (value) {
      const match = value.match(/^\+(\d{1,3})(\d{1,4})(\d{6,10})$/);
      if (match) {
        setCountryCode(`+${match[1]}`);
        setAreaCode(match[2]);
        setPhoneNumber(match[3]);
      } else {
        setCountryCode('+54');
        setAreaCode('');
        setPhoneNumber(value);
      }
    } else {
      setCountryCode('+54');
      setAreaCode('');
      setPhoneNumber('');
    }
  };

  return (
    <EditProfileField
      label={label}
      value={formatPhoneNumberDisplay(value)}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onCancel={handleCancel}
    >
      <div className="flex space-x-2">
        <div className="w-1/4">
          <label htmlFor="countryCode" className="block text-sm font-medium text-aurora-navy">País</label>
          <select
            id="countryCode"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="mt-1 block w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-terracotta focus:ring-aurora-terracotta sm:text-sm"
          >
            <option value="+54">+54 (Argentina)</option>
            <option value="+1">+1 (EEUU/Canadá)</option>
            <option value="+56">+56 (Chile)</option>
            <option value="+598">+598 (Uruguay)</option>
          </select>
        </div>
        <div className="w-1/4">
          <label htmlFor="areaCode" className="block text-sm font-medium text-aurora-navy">Área</label>
          <input
            type="text"
            id="areaCode"
            value={areaCode}
            onChange={(e) => setAreaCode(e.target.value)}
            className="mt-1 block w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-terracotta focus:ring-aurora-terracotta sm:text-sm"
            placeholder="Ej: 911"
            maxLength={4}
          />
        </div>
        <div className="w-1/2">
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-aurora-navy">Número</label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1 block w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-terracotta focus:ring-aurora-terracotta sm:text-sm"
            placeholder="Ej: 55551234"
            maxLength={10}
          />
        </div>
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      <button
        onClick={handleSave}
        className="mt-4 bg-aurora-terracotta text-white px-4 py-2 rounded-lg hover:bg-aurora-terracottaDark transition-colors duration-200 text-sm font-semibold"
      >
        Guardar Teléfono
      </button>
    </EditProfileField>
  );
};

export default EditPhoneField;