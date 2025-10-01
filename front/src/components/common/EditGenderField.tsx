import React, { useState } from 'react';
import EditProfileField from './EditProfileField';

interface EditGenderFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (newGender: string) => void;
}

const validCustomGenders = [
  'no binario', 'genero fluido', 'agenere', 'bigenere', 'transgenere', 'intergenere', 'intersex'
];

const EditGenderField: React.FC<EditGenderFieldProps> = ({
  label,
  value,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}) => {
  const [selectedOption, setSelectedOption] = useState(value);
  const [customGender, setCustomGender] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    setSelectedOption(value);
    if (!['Femenino', 'Masculino', 'Prefiero no decirlo'].includes(value)) {
      setCustomGender(value);
      setSelectedOption('+ Agregar genero personalizado');
    } else {
      setCustomGender('');
    }
  }, [value, isEditing]);

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
    setError('');
    if (e.target.value !== '+ Agregar genero personalizado') {
      setCustomGender('');
    }
  };

  const handleCustomGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomGender(e.target.value);
    setError('');
  };

  const handleSave = () => {
    let genderToSave = selectedOption;
    if (selectedOption === '+ Agregar genero personalizado') {
      const normalizedCustomGender = customGender.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (!validCustomGenders.includes(normalizedCustomGender)) {
        setError('Género personalizado no válido. Por favor, ingresa uno de los géneros permitidos.');
        return;
      }
      genderToSave = customGender;
    }
    onSave(genderToSave);
  };

  return (
    <EditProfileField
      label={label}
      value={value}
      isEditing={isEditing}
      onEdit={onEdit}
      onCancel={onCancel}
    >
      <div className="space-y-2">
        <select
          value={selectedOption}
          onChange={handleOptionChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="Femenino">Femenino</option>
          <option value="Masculino">Masculino</option>
          <option value="Prefiero no decirlo">Prefiero no decirlo</option>
          <option value="+ Agregar genero personalizado">+ Agregar género personalizado</option>
        </select>
        {selectedOption === '+ Agregar genero personalizado' && (
          <input
            type="text"
            value={customGender}
            onChange={handleCustomGenderChange}
            placeholder="Ej: No binario, Género fluido..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        )}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <button
          onClick={handleSave}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Guardar Género
        </button>
      </div>
    </EditProfileField>
  );
};

export default EditGenderField;