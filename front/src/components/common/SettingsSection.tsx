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

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
    <div className="w-11 h-6 bg-aurora-navy/15 rounded-full peer peer-checked:bg-aurora-terracotta transition-colors duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all after:duration-300 peer-checked:after:translate-x-5" />
  </label>
);

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
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-aurora-navy mb-2">Configuración</h2>

      <div className="bg-white p-6 rounded-2xl border border-aurora-navy/10">
        <h3 className="font-display text-lg font-semibold text-aurora-navy mb-4">Notificaciones</h3>
        <div className="flex items-center justify-between gap-4">
          <label className="text-aurora-navy/80 text-sm">Recibir novedades y promociones por email</label>
          <ToggleSwitch checked={localAcceptsNewsletter} onChange={handleToggleNewsletter} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-aurora-navy/10">
        <h3 className="font-display text-lg font-semibold text-aurora-navy mb-3">Idioma</h3>
        <p className="text-aurora-navy/70 text-sm">Español (Argentina)</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-aurora-navy/10">
        <h3 className="font-display text-lg font-semibold text-aurora-navy mb-2">Contenido y Preferencias</h3>
        <p className="text-aurora-navy/60 text-sm mb-4">
          Elegí las temáticas que te interesan. Las usamos junto con tus suscripciones activas para recomendarte clubes en el Home.
        </p>
        {saveError && <p className="text-red-600 text-sm mb-2">{saveError}</p>}
        {saveSuccess && <p className="text-green-700 text-sm mb-2">{saveSuccess}</p>}
        {loading ? (
          <p className="text-aurora-navy/50 text-sm">Cargando categorías...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <label key={category.id}
                className={`flex items-center gap-2 border rounded-full px-4 py-2 cursor-pointer text-sm font-medium transition-all duration-200 ${
                  selectedCategoryIds.includes(category.id)
                    ? 'border-aurora-terracotta bg-aurora-terracotta/10 text-aurora-terracottaDark'
                    : 'border-aurora-navy/15 text-aurora-navy/70 hover:border-aurora-navy/30'
                }`}>
                <input type="checkbox" checked={selectedCategoryIds.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="sr-only" />
                {category.name}
              </label>
            ))}
          </div>
        )}
        <button onClick={handleSaveCategories}
          className="mt-6 bg-aurora-terracotta hover:bg-aurora-terracottaDark text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-aurora-sm transition-all duration-200">
          Guardar Preferencias
        </button>
      </div>
    </div>
  );
};

export default SettingsSection;