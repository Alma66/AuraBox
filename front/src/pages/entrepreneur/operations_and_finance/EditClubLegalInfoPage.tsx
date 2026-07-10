import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import { useAuth } from '../../../App';
import { LegalSection } from '../../../types/legalSection';

type SectionType = 'title' | 'paragraph' | 'list' | 'image';

function createEmptySection(type: SectionType): LegalSection {
  return {
    id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    content: type === 'list' ? [] : '',
  };
}

interface SectionEditorProps {
  sections: LegalSection[];
  onChange: (sections: LegalSection[]) => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ sections, onChange }) => {
  const updateSection = (index: number, updated: Partial<LegalSection>) => {
    const next = [...sections];
    next[index] = { ...next[index], ...updated } as LegalSection;
    onChange(next);
  };

  const removeSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const addSection = (type: SectionType) => {
    onChange([...sections, createEmptySection(type)]);
  };

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div key={section.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {section.type === 'title' && 'Título'}
              {section.type === 'paragraph' && 'Párrafo'}
              {section.type === 'list' && 'Lista'}
              {section.type === 'image' && 'Imagen (URL)'}
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">
                ↑
              </button>
              <button type="button" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">
                ↓
              </button>
              <button type="button" onClick={() => removeSection(index)} className="text-red-400 hover:text-red-600">
                Eliminar
              </button>
            </div>
          </div>
          {section.type === 'list' ? (
            <textarea
              className="w-full border border-gray-200 rounded-lg p-3 text-sm h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Un ítem por línea"
              value={(section.content as string[]).join('\n')}
              onChange={(e) => updateSection(index, { content: e.target.value.split('\n') })}
            />
          ) : section.type === 'title' ? (
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Texto del título"
              value={section.content as string}
              onChange={(e) => updateSection(index, { content: e.target.value })}
            />
          ) : section.type === 'image' ? (
            <input
              type="url"
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
              value={section.content as string}
              onChange={(e) => updateSection(index, { content: e.target.value })}
            />
          ) : (
            <textarea
              className="w-full border border-gray-200 rounded-lg p-3 text-sm h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Texto del párrafo"
              value={section.content as string}
              onChange={(e) => updateSection(index, { content: e.target.value })}
            />
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => addSection('title')} className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100">
          + Título
        </button>
        <button type="button" onClick={() => addSection('paragraph')} className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100">
          + Párrafo
        </button>
        <button type="button" onClick={() => addSection('list')} className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100">
          + Lista
        </button>
        <button type="button" onClick={() => addSection('image')} className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100">
          + Imagen
        </button>
      </div>
    </div>
  );
};

const EditClubLegalInfoPage: React.FC = () => {
  const { clubId, section } = useParams<{ clubId: string; section?: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(section === 'privacy' ? 'privacy' : 'terms');
  const [termsSections, setTermsSections] = useState<LegalSection[]>([]);
  const [policySections, setPolicySections] = useState<LegalSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (userRole !== 'entrepreneur' || !user?.managedClubId || user.managedClubId !== clubId) {
        navigate('/login');
        return;
      }
      try {
        const response = await api.get(`/club-legal-content/by-club/${clubId}`);
        const data = getResponseData(response);
        setTermsSections(data.termsAndConditions ?? []);
        setPolicySections(data.privacyAndSecurityPolicy ?? []);
      } catch (err) {
        console.error('Error fetching legal content:', err);
        setError('No se pudo cargar la información legal.');
      } finally {
        setLoading(false);
      }
    };
    if (clubId) fetchContent();
  }, [clubId, user, userRole, navigate]);

  const handleSave = async () => {
    if (!clubId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put(`/club-legal-content/by-club/${clubId}`, {
        termsAndConditions: termsSections,
        privacyAndSecurityPolicy: policySections,
      });
      setSuccess('Información legal actualizada con éxito.');
    } catch (err) {
      console.error('Error saving legal content:', err);
      setError('Error al guardar la información legal.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Cargando editor...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <button
        onClick={() => navigate(`/club/${clubId}`)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
      >
        ← Volver al Perfil del Club
      </button>
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Editar Información Legal</h1>
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'terms' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Términos y Condiciones
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'privacy' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Política de Seguridad y Devolución
          </button>
        </div>
        {activeTab === 'terms' ? (
          <SectionEditor sections={termsSections} onChange={setTermsSections} />
        ) : (
          <SectionEditor sections={policySections} onChange={setPolicySections} />
        )}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditClubLegalInfoPage;