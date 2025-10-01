import React from 'react';

interface EditProfileFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  isLocked?: boolean;
  children?: React.ReactNode;
}

const EditProfileField: React.FC<EditProfileFieldProps> = ({
  label,
  value,
  isEditing,
  onEdit,
  onCancel,
  isLocked = false,
  children,
}) => {
  return (
    <div className="border border-gray-300 rounded-md p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <label className="font-semibold text-gray-700">{label}</label>
        {!isEditing && !isLocked && (
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Editar
          </button>
        )}
      </div>
      {!isEditing ? (
        <p className={`mt-2 text-gray-800 ${isLocked ? 'italic text-gray-500' : ''}`}>{value}</p>
      ) : (
        <div className="mt-2">{children}</div>
      )}
      {isEditing && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 text-gray-700"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default EditProfileField;