import React from 'react';
const EntrepreneurSettingsSection: React.FC = () => {
  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Idioma</h3>
        <p className="text-gray-700">Español (Argentina)</p>
      </div>
    </div>
  );
};
export default EntrepreneurSettingsSection;