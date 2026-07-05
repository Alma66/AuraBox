import React, { useState, useEffect } from 'react';
import api, { getResponseData } from '../../api/config';

interface Category {
  id: number;
  name: string;
  description: string;
}

interface SettingsSectionProps {
  acceptsNewsletter: boolean;
  onNewsletterChange: (value: boolean) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ acceptsNewsletter, onNewsletterChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [localAcceptsNewsletter, setLocalAcceptsNewsletter] = useState(acceptsNewsletter);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    setLocalAcceptsNewsletter(acceptsNewsletter);
  }, [acceptsNewsletter]);

  useEffect(() => {
    const load = async () => {
      try {
        const [categoriesRes, preferencesRes] = await Promise.all([
          api.get('/categories'),
          api.get('/user-category-preferences/me'),
        ]);
        setCategories(getResponseData(categoriesRes) || []);
        const preferences = getResponseData(preferencesRes) || [];
        setSelectedCategoryIds(preferences.map((c: Category) => c.id));
      } catch {
        setSaveError('No se pudieron cargar las preferencias de contenido.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleSaveCategories = async () => {
    setSaveError(''); setSaveSuccess('');
    try {
      await api.put('/user-category-preferences/me', { categoryIds: selectedCategoryIds });
      setSaveSuccess('Preferencias de contenido guardadas correctamente');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch {
      setSaveError('Error al guardar las preferencias de contenido');
    }
  };

  const handleToggleNewsletter = async (value: boolean) => {
    setLocalAcceptsNewsletter(value);
    try {
      await api.patch('/users/me', { acceptsNewsletter: value });
      onNewsletterChange(value);
    } catch {
      setLocalAcceptsNewsletter(!value);
    }
  };

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Notificaciones</h3>
        <div className="flex items-center justify-between">
          <label className="text-gray-700">Recibir novedades y promociones por email</label>
          <input type="checkbox" checked={localAcceptsNewsletter}
            onChange={(e) => handleToggleNewsletter(e.target.checked)}
            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Idioma</h3>
        <p className="text-gray-700">Español (Argentina)</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Contenido y Preferencias</h3>
        <p className="text-gray-600 text-sm mb-4">
          Elegí las temáticas que te interesan. Las usamos junto con tus suscripciones activas para recomendarte clubes en el Home.
        </p>
        {saveError && <p className="text-red-500 text-sm mb-2">{saveError}</p>}
        {saveSuccess && <p className="text-green-600 text-sm mb-2">{saveSuccess}</p>}
        {loading ? (
          <p className="text-gray-500">Cargando categorías...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((category) => (
              <label key={category.id}
                className={`flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer text-sm
                  ${selectedCategoryIds.includes(category.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700'}`}>
                <input type="checkbox" checked={selectedCategoryIds.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500" />
                {category.name}
              </label>
            ))}
          </div>
        )}
        <button onClick={handleSaveCategories}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
          Guardar Preferencias
        </button>
      </div>
    </div>
  );
};

export default SettingsSection;