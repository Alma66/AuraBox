import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams} from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../../../api/config';
import { useAuth } from '../../../../App';
import { LegalSection } from '../../../../types/legalSection';
import LegalContentRenderer from '../../../../components/club/LegalContentRenderer';

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
        <div key={section.id} className="border border-aurora-navy/10 rounded-xl p-4 bg-aurora-cream">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-aurora-navy/50">
              {section.type === 'title' && 'Título'}
              {section.type === 'paragraph' && 'Párrafo'}
              {section.type === 'list' && 'Lista'}
              {section.type === 'image' && 'Imagen (URL)'}
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} className="text-aurora-navy/40 hover:text-aurora-navy disabled:opacity-30">
                ↑
              </button>
              <button type="button" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} className="text-aurora-navy/40 hover:text-aurora-navy disabled:opacity-30">
                ↓
              </button>
              <button type="button" onClick={() => removeSection(index)} className="text-red-400 hover:text-red-600">
                Eliminar
              </button>
            </div>
          </div>
          {section.type === 'list' ? (
            <textarea
              className="w-full border border-aurora-navy/15 rounded-lg p-3 text-sm h-28 focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40 bg-white"
              placeholder="Un ítem por línea"
              value={(section.content as string[]).join('\n')}
              onChange={(e) => updateSection(index, { content: e.target.value.split('\n') })}
            />
          ) : section.type === 'title' ? (
            <input
              type="text"
              className="w-full border border-aurora-navy/15 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40 bg-white"
              placeholder="Texto del título"
              value={section.content as string}
              onChange={(e) => updateSection(index, { content: e.target.value })}
            />
          ) : section.type === 'image' ? (
            <input
              type="url"
              className="w-full border border-aurora-navy/15 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40 bg-white"
              placeholder="https://..."
              value={section.content as string}
              onChange={(e) => updateSection(index, { content: e.target.value })}
            />
          ) : (
            <textarea
              className="w-full border border-aurora-navy/15 rounded-lg p-3 text-sm h-28 focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40 bg-white"
              placeholder="Texto del párrafo"
              value={section.content as string}
              onChange={(e) => updateSection(index, { content: e.target.value })}
            />
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => addSection('title')} className="text-sm bg-white border border-aurora-navy/20 text-aurora-navy px-3 py-1.5 rounded-lg hover:bg-aurora-cream transition">
          + Título
        </button>
        <button type="button" onClick={() => addSection('paragraph')} className="text-sm bg-white border border-aurora-navy/20 text-aurora-navy px-3 py-1.5 rounded-lg hover:bg-aurora-cream transition">
          + Párrafo
        </button>
        <button type="button" onClick={() => addSection('list')} className="text-sm bg-white border border-aurora-navy/20 text-aurora-navy px-3 py-1.5 rounded-lg hover:bg-aurora-cream transition">
          + Lista
        </button>
        <button type="button" onClick={() => addSection('image')} className="text-sm bg-white border border-aurora-navy/20 text-aurora-navy px-3 py-1.5 rounded-lg hover:bg-aurora-cream transition">
          + Imagen
        </button>
      </div>
    </div>
  );
};

interface PreviewModalProps {
  title: string;
  sections: LegalSection[];
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ title, sections, onClose }) => (
  <div className="fixed inset-0 bg-aurora-navyDark/60 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-aurora-navy/40 hover:text-aurora-navy text-2xl leading-none"
      >
        &times;
      </button>
      <h2 className="font-display text-2xl font-bold text-aurora-navy mb-6 text-center">{title}</h2>
      {sections.length > 0 ? (
        <LegalContentRenderer sections={sections} />
      ) : (
        <p className="text-aurora-navy/50 text-center">Todavía no agregaste contenido para mostrar en la vista previa.</p>
      )}
      <div className="flex justify-center mt-8">
        <button
          onClick={onClose}
          className="btn-outline"
        >
          Cerrar Vista Previa
        </button>
      </div>
    </div>
  </div>
);

const EditClubLegalInfoPage: React.FC = () => {
  const { clubId, section } = useParams<{ clubId: string; section?: string }>();
  const [searchParams] = useSearchParams();
  const initialSection = section ?? searchParams.get('doc');
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialSection === 'privacy' ? 'privacy' : 'terms');
  const [termsSections, setTermsSections] = useState<LegalSection[]>([]);
  const [policySections, setPolicySections] = useState<LegalSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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
        setFetchError('No se pudo cargar la información legal.');
      } finally {
        setLoading(false);
      }
    };
    if (clubId) fetchContent();
  }, [clubId, user, userRole, navigate]);

  const handleSave = async () => {
    if (!clubId) return;
    setSaving(true);
    try {
      await api.put(`/club-legal-content/by-club/${clubId}`, {
        termsAndConditions: termsSections,
        privacyAndSecurityPolicy: policySections,
      });
      toast.success('Información legal actualizada con éxito.');
    } catch (err) {
      console.error('Error saving legal content:', err);
      toast.error('Error al guardar la información legal.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="  flex items-center justify-center py-20.">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-aurora-cream flex flex-col items-center justify-center text-center gap-3 px-4">
        <p className="text-red-500 font-medium">{fetchError}</p>
        <button onClick={() => navigate(`/club/${clubId}`)} className="text-sm text-aurora-terracotta hover:underline">
          Volver al club
        </button>
      </div>
    );
  }

  const currentSections = activeTab === 'terms' ? termsSections : policySections;
  const previewTitle = activeTab === 'terms' ? 'Términos y Condiciones' : 'Política de Seguridad y Devolución';

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="card-surface p-4 sm:p-8 mb-8">
        <h1 className="font-display text-3xl font-bold text-aurora-navy mb-1 text-center">
          Editar {activeTab === 'terms' ? 'Términos y Condiciones' : 'Política de Seguridad y Devolución'}
        </h1>
        <p className="text-aurora-navy/50 text-sm text-center mb-6">
          Ambos documentos se editan desde esta misma página, cambiando de pestaña.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-aurora-navy/10">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'terms' ? 'border-aurora-terracotta text-aurora-terracotta' : 'border-transparent text-aurora-navy/50 hover:text-aurora-navy'}`}
            >
              Términos y Condiciones
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'privacy' ? 'border-aurora-terracotta text-aurora-terracotta' : 'border-transparent text-aurora-navy/50 hover:text-aurora-navy'}`}
            >
              Política de Seguridad y Devolución
            </button>
          </div>
          <button
            onClick={() => setShowPreview(true)}
            className="text-sm font-semibold text-aurora-navy hover:text-aurora-terracotta flex items-center gap-1 pb-2"
          >
            👁 Vista Previa
          </button>
        </div>
        {activeTab === 'terms' ? (
          <SectionEditor sections={termsSections} onChange={setTermsSections} />
        ) : (
          <SectionEditor sections={policySections} onChange={setPolicySections} />
        )}
        <div className="flex justify-end mt-6">
                  <p className="mr-4 self-center text-xs text-aurora-navy/50">Se guardan ambos documentos a la vez.</p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
      {showPreview && (
        <PreviewModal title={previewTitle} sections={currentSections} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
};

export default EditClubLegalInfoPage;