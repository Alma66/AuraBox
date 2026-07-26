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
    <div className="border border-aurora-navy/10 rounded-xl p-5 bg-white shadow-aurora-sm">
      <div className="flex justify-between items-center">
        <label className="font-semibold text-aurora-navy text-sm">{label}</label>
        {!isEditing && !isLocked && (
          <button
            onClick={onEdit}
            className="text-aurora-terracotta hover:text-aurora-terracottaDark text-sm font-semibold transition-colors duration-200"
          >
            Editar
          </button>
        )}
      </div>
      {!isEditing ? (
        <p className={`mt-2 ${isLocked ? 'italic text-aurora-navy/50' : 'text-aurora-navy/90'}`}>{value}</p>
      ) : (
        <div className="mt-3">{children}</div>
      )}
      {isEditing && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-aurora-cream border border-aurora-navy/15 rounded-lg hover:bg-aurora-creamDark text-aurora-navy text-sm font-semibold transition-colors duration-200"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default EditProfileField;