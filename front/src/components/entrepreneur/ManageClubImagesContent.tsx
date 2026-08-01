import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../api/config';
import { Club } from '../../types/club';
import { ClubImage } from '../../types/image';
import { useAuth } from '../../App';

interface ManageClubImagesContentProps {
  activeSection: string;
  club: Club;
}

const SECTION_LABELS: Record<string, string> = {
  Logo: 'Logo',
  Banner: 'Banner',
  Historia: 'Historias',
  Equipo: 'Emprendedores',
};

const getExtension = (url: string) => {
  const clean = url.split('?')[0];
  const parts = clean.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'desconocido';
};

const ManageClubImagesContent: React.FC<ManageClubImagesContentProps> = ({ activeSection, club }) => {
  const { user } = useAuth();
  const [images, setImages] = useState<ClubImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [infoImageId, setInfoImageId] = useState<number | null>(null);
  const [filterEntrepreneur, setFilterEntrepreneur] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [markActive, setMarkActive] = useState(false);

  const idClub = Number(club.id);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/image-club/by-club/${idClub}`, { params: { section: activeSection } });
      setImages(getResponseData(res) || []);
    } catch (err) {
      console.error(err);
      toast.error('No se pudieron cargar las imágenes');
    } finally {
      setLoading(false);
      setSelectedIds([]);
    }
  };

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, idClub]);

  const entrepreneurOptions = club.entrepreneurs ?? [];

  const formats = useMemo(() => {
    const set = new Set(images.map((img) => getExtension(img.imageUrl)));
    return Array.from(set);
  }, [images]);

  const filtered = images.filter((img) => {
    if (filterEntrepreneur !== 'all' && String(img.uploadedBy) !== filterEntrepreneur) return false;
    if (filterFormat !== 'all' && getExtension(img.imageUrl) !== filterFormat) return false;
    if (filterFrom && new Date(img.uploadDate) < new Date(filterFrom)) return false;
    if (filterTo && new Date(img.uploadDate) > new Date(filterTo + 'T23:59:59')) return false;
    return true;
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('idClub', String(idClub));
      formData.append('section', activeSection);
      formData.append('description', description);
      formData.append('isActive', String(markActive));
      if (user?.id) formData.append('uploadedBy', String(user.id));
      await api.post('/image-club', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDescription('');
      setMarkActive(false);
      toast.success('Imagen subida correctamente');
      await fetchImages();
    } catch (err) {
      console.error(err);
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const toggleActive = async (img: ClubImage) => {
    try {
      await api.put(`/image-club/${img.id}`, { isActive: !img.isActive, section: img.section });
      await fetchImages();
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar el estado de uso');
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

 const deleteSelected = () => {
  if (selectedIds.length === 0) return;
  toast((t) => (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">¿Eliminar {selectedIds.length} imagen(es) seleccionada(s)? Esta acción no se puede deshacer.</p>
      <div className="flex gap-2 justify-end">
        <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancelar
        </button>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await api.delete('/image-club/bulk', { data: { ids: selectedIds } });
              toast.success('Imágenes eliminadas');
              await fetchImages();
            } catch (err) {
              console.error(err);
              toast.error('Error al eliminar las imágenes');
            }
          }}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Eliminar
        </button>
      </div>
    </div>
  ), { duration: Infinity });
};

const deleteOne = (id: number) => {
  toast((t) => (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">¿Eliminar esta imagen?</p>
      <div className="flex gap-2 justify-end">
        <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancelar
        </button>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await api.delete(`/image-club/${id}`);
              toast.success('Imagen eliminada');
              await fetchImages();
            } catch (err) {
              console.error(err);
              toast.error('Error al eliminar la imagen');
            }
          }}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Eliminar
        </button>
      </div>
    </div>
  ), { duration: Infinity });
};

  const entrepreneurName = (uploadedBy?: number | null) => {
    if (!uploadedBy) return 'Desconocido';
    const found = entrepreneurOptions.find((e) => e.id === uploadedBy);
    return found ? `${found.firstName} ${found.lastName}` : `ID ${uploadedBy}`;
  };

  return (
    <div className="animate-fadeInUp">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-bold text-aurora-navy">{SECTION_LABELS[activeSection] ?? activeSection}</h2>
        {activeSection === 'Banner' && (
          <span className="text-xs text-aurora-navy/50">Las imágenes marcadas "En uso" forman el carrusel del banner.</span>
        )}
      </div>

      <div className="bg-aurora-cream/50 border border-aurora-navy/10 rounded-xl p-4 mb-6">
        <p className="text-sm font-medium text-aurora-navy/80 mb-3">Subir nueva imagen</p>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
          />
          <label className="flex items-center text-sm text-aurora-navy/70">
            <input type="checkbox" checked={markActive} onChange={(e) => setMarkActive(e.target.checked)} className="mr-2" />
            Marcar como "en uso"
          </label>
          <label className="px-4 py-2 bg-aurora-terracotta text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-aurora-terracottaDark transition-colors">
            {uploading ? 'Subiendo...' : 'Elegir imagen'}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <select value={filterEntrepreneur} onChange={(e) => setFilterEntrepreneur(e.target.value)} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm">
          <option value="all">Todos los emprendedores</option>
          {entrepreneurOptions.map((e) => (
            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
          ))}
        </select>
        <select value={filterFormat} onChange={(e) => setFilterFormat(e.target.value)} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm">
          <option value="all">Todos los formatos</option>
          {formats.map((f) => (
            <option key={f} value={f}>{f.toUpperCase()}</option>
          ))}
        </select>
        <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm" />
        <span className="text-aurora-navy/40 text-sm">a</span>
        <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm" />
        {selectedIds.length > 0 && (
          <button onClick={deleteSelected} className="ml-auto px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
            Eliminar seleccionadas ({selectedIds.length})
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-aurora-navy/50">Cargando imágenes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-aurora-navy/50">No hay imágenes en esta sección con los filtros seleccionados.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((img) => (
            <div key={img.id} className="relative border border-aurora-navy/10 rounded-xl overflow-hidden bg-white group">
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(img.id)}
                  onChange={() => toggleSelect(img.id)}
                  className="w-4 h-4"
                />
              </div>
              <button
                onClick={() => setInfoImageId(img.id)}
                className="absolute top-2 right-2 z-10 bg-white/90 rounded-full p-1 shadow hover:bg-white"
                title="Detalles técnicos"
              >
                <svg className="w-4 h-4 text-aurora-navy/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {img.isActive && (
                <span className="absolute bottom-2 left-2 z-10 bg-emerald-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  En uso
                </span>
              )}
              <img src={img.imageUrl} alt={img.description ?? ''} className="w-full h-32 object-cover" />
              <div className="p-2">
                <p className="text-xs text-aurora-navy/50 truncate">{entrepreneurName(img.uploadedBy)}</p>
                <p className="text-xs text-aurora-navy/40">{new Date(img.uploadDate).toLocaleDateString('es-AR')}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => toggleActive(img)}
                    className={`flex-1 text-xs font-medium px-2 py-1 rounded ${img.isActive ? 'bg-aurora-cream text-aurora-navy/70' : 'bg-emerald-50 text-emerald-700'}`}
                  >
                    {img.isActive ? 'Quitar de uso' : 'Usar'}
                  </button>
                  <button onClick={() => deleteOne(img.id)} className="text-xs font-medium px-2 py-1 rounded bg-red-50 text-red-600">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {infoImageId !== null && (
        <ImageInfoModal
          image={filtered.find((i) => i.id === infoImageId) ?? images.find((i) => i.id === infoImageId)!}
          onClose={() => setInfoImageId(null)}
          uploaderName={entrepreneurName(images.find((i) => i.id === infoImageId)?.uploadedBy)}
        />
      )}
    </div>
  );
};

const ImageInfoModal: React.FC<{ image: ClubImage; onClose: () => void; uploaderName: string }> = ({ image, onClose, uploaderName }) => {
  const [dimensions, setDimensions] = useState<string>('Calculando...');

  useEffect(() => {
    const img = new Image();
    img.onload = () => setDimensions(`${img.width} x ${img.height} px`);
    img.onerror = () => setDimensions('No disponible');
    img.src = image.imageUrl;
  }, [image.imageUrl]);

  return (
    <div className="fixed inset-0 bg-aurora-navyDark/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-serif text-lg font-bold text-aurora-navy">Detalles de la imagen</h3>
          <button onClick={onClose} className="text-aurora-navy/40 hover:text-aurora-navy">✕</button>
        </div>
        <img src={image.imageUrl} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />
        <div className="space-y-2 text-sm">
          <p><span className="font-medium text-aurora-navy/60">Sección:</span> {image.section}</p>
          <p><span className="font-medium text-aurora-navy/60">Tipo:</span> {image.contentType}</p>
          <p><span className="font-medium text-aurora-navy/60">Dimensiones:</span> {dimensions}</p>
          <p><span className="font-medium text-aurora-navy/60">Subida por:</span> {uploaderName}</p>
          <p><span className="font-medium text-aurora-navy/60">Fecha:</span> {new Date(image.uploadDate).toLocaleString('es-AR')}</p>
          <p><span className="font-medium text-aurora-navy/60">En uso:</span> {image.isActive ? 'Sí' : 'No'}</p>
          <p className="break-all"><span className="font-medium text-aurora-navy/60">URL:</span> {image.imageUrl}</p>
          {image.description && <p><span className="font-medium text-aurora-navy/60">Descripción:</span> {image.description}</p>}
        </div>
      </div>
    </div>
  );
};

export default ManageClubImagesContent;