import React, { useState, useEffect, useCallback } from 'react';
import api, { getResponseData } from '../../api/config';

interface CategoryOption {
  id: number;
  name: string;
  description: string;
}

interface ClubCategoryRelation {
  id: number;
  idCategories: number;
  idClub: number;
}

interface MilestoneItem {
  year: string;
  description: string;
}

interface ClubBusinessInfoSectionProps {
  clubId: string;
}

const ClubBusinessInfoSection: React.FC<ClubBusinessInfoSectionProps> = ({ clubId }) => {
  const [allCategories, setAllCategories] = useState<CategoryOption[]>([]);
  const [relations, setRelations] = useState<ClubCategoryRelation[]>([]);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [communityText, setCommunityText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savingMilestones, setSavingMilestones] = useState(false);
  const [savingCommunity, setSavingCommunity] = useState(false);
  const [togglingCategoryId, setTogglingCategoryId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [categoriesRes, relationsRes, clubRes] = await Promise.all([
        api.get('/categories'),
        api.get(`/club-categories/by-club/${clubId}`),
        api.get(`/clubs/${clubId}`),
      ]);
      setAllCategories(getResponseData(categoriesRes) || []);
      setRelations(getResponseData(relationsRes) || []);
      const clubData = getResponseData(clubRes);
      setCommunityText(clubData.communityText || '');
      if (Array.isArray(clubData.milestones)) {
        setMilestones(clubData.milestones.map((m: any) => ({ year: String(m.year ?? ''), description: m.description ?? '' })));
      }
    } catch {
      setError('No se pudo cargar la información del club');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    load();
  }, [load]);

  const showFeedback = (successMsg?: string, errorMsg?: string) => {
    setSuccess(successMsg || '');
    setError(errorMsg || '');
    if (successMsg) setTimeout(() => setSuccess(''), 3000);
  };

  const isCategorySelected = (idCategory: number) => relations.some((r) => r.idCategories === idCategory);

  const handleToggleCategory = async (category: CategoryOption) => {
    const relation = relations.find((r) => r.idCategories === category.id);
    if (relation) {
      showFeedback(undefined, 'Para quitar una categoría ya asignada, contactá a soporte. Desde acá solo se pueden agregar nuevas.');
      return;
    }
    setTogglingCategoryId(category.id);
    try {
      await api.post('/club-categories', { idCategories: category.id, idClub: parseInt(clubId, 10) });
      await load();
      showFeedback('Categoría agregada correctamente');
    } catch {
      showFeedback(undefined, 'Error al agregar la categoría');
    } finally {
      setTogglingCategoryId(null);
    }
  };

  const handleAddMilestone = () => {
    setMilestones((prev) => [...prev, { year: String(new Date().getFullYear()), description: '' }]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: keyof MilestoneItem, value: string) => {
    setMilestones((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const handleSaveMilestones = async () => {
    setSavingMilestones(true);
    try {
      const payload = milestones
        .filter((m) => m.description.trim() !== '')
        .map((m) => ({ year: parseInt(m.year, 10) || new Date().getFullYear(), description: m.description.trim() }));
      await api.put(`/clubs/${clubId}`, { milestones: payload });
      showFeedback('Hitos guardados correctamente');
    } catch {
      showFeedback(undefined, 'Error al guardar los hitos');
    } finally {
      setSavingMilestones(false);
    }
  };

  const handleSaveCommunityText = async () => {
    setSavingCommunity(true);
    try {
      await api.put(`/clubs/${clubId}`, { communityText: communityText.trim() });
      showFeedback('Texto de comunidad guardado correctamente');
    } catch {
      showFeedback(undefined, 'Error al guardar el texto de comunidad');
    } finally {
      setSavingCommunity(false);
    }
  };

  if (loading) return <p className="text-aurora-navy/60">Cargando información del club...</p>;

  return (
    <div className="space-y-6">
      {success && <p className="text-green-600 text-sm bg-green-50 p-2 rounded-lg">{success}</p>}
      {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{error}</p>}

      <div className="bg-white p-6 rounded-xl shadow-aurora-sm border border-aurora-navy/10">
        <h3 className="text-xl font-serif font-bold text-aurora-navy mb-2">Categorías / Rubro del Club</h3>
        <p className="text-aurora-navy/60 text-sm mb-4">
          Estas categorías determinan, entre otras cosas, qué habilitaciones y licencias te van a pedir en Cumplimiento Legal.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allCategories.map((category) => {
            const selected = isCategorySelected(category.id);
            return (
              <label
                key={category.id}
                className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer ${
                  selected ? 'border-aurora-navy bg-aurora-navy/5 text-aurora-navy' : 'border-aurora-navy/15 text-aurora-navy/80'
                } ${togglingCategoryId === category.id ? 'opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={togglingCategoryId === category.id}
                  onChange={() => handleToggleCategory(category)}
                  className="h-4 w-4 text-aurora-navy rounded focus:ring-aurora-navy"
                />
                {category.name}
              </label>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-aurora-sm border border-aurora-navy/10">
        <h3 className="text-xl font-serif font-bold text-aurora-navy mb-2">Hitos del Club</h3>
        <p className="text-aurora-navy/60 text-sm mb-4">
          Momentos importantes en la historia de tu club, visibles en tu perfil público.
        </p>
        <div className="space-y-3">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input
                type="number"
                value={milestone.year}
                onChange={(e) => handleMilestoneChange(index, 'year', e.target.value)}
                className="w-24 rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-navy focus:ring-aurora-navy sm:text-sm"
                placeholder="Año"
              />
              <input
                type="text"
                value={milestone.description}
                onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                className="flex-1 rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-navy focus:ring-aurora-navy sm:text-sm"
                placeholder="Descripción del hito"
              />
              <button onClick={() => handleRemoveMilestone(index)} className="text-red-600 hover:text-red-700 text-sm px-2">
                Quitar
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleAddMilestone} className="text-sm bg-aurora-cream border border-aurora-navy/15 px-3 py-1.5 rounded-lg hover:bg-aurora-creamDark text-aurora-navy font-semibold">
            + Agregar Hito
          </button>
          <button
            onClick={handleSaveMilestones}
            disabled={savingMilestones}
            className={`bg-aurora-navy text-white px-4 py-2 rounded-lg hover:bg-aurora-navy/90 transition-colors duration-200 text-sm font-semibold ${savingMilestones ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {savingMilestones ? 'Guardando...' : 'Guardar Hitos'}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-aurora-sm border border-aurora-navy/10">
        <h3 className="text-xl font-serif font-bold text-aurora-navy mb-2">Texto de Comunidad</h3>
        <p className="text-aurora-navy/60 text-sm mb-4">
          Mensaje que se muestra en la sección de comunidad de tu perfil público, invitando a sumarse.
        </p>
        <textarea
          value={communityText}
          onChange={(e) => setCommunityText(e.target.value)}
          rows={4}
          maxLength={500}
          className="w-full rounded-lg border-aurora-navy/15 shadow-sm focus:border-aurora-navy focus:ring-aurora-navy sm:text-sm"
          placeholder="Ej: Sumate a nuestra comunidad de amantes del café de especialidad..."
        />
        <p className="text-xs text-aurora-navy/50 mt-1">{communityText.length}/500</p>
        <button
          onClick={handleSaveCommunityText}
          disabled={savingCommunity}
          className={`mt-2 bg-aurora-navy text-white px-4 py-2 rounded-lg hover:bg-aurora-navy/90 transition-colors duration-200 text-sm font-semibold ${savingCommunity ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {savingCommunity ? 'Guardando...' : 'Guardar Texto de Comunidad'}
        </button>
      </div>
    </div>
  );
};

export default ClubBusinessInfoSection;