import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import { useAuth } from '../../../App';
import { BoxContentItem } from '../../../types/boxContent';

interface SubscriptionTypeDetail {
  id: number;
  idClub: number;
  name: string;
  description?: string;
  active: boolean;
  createdAt?: string;
  frequency: string;
}

interface ProductDraft {
  productName: string;
  productDescription: string;
  usageInstructions: string;
  productExpirationDate: string;
  productVideoUrl: string;
  additionalNotes: string;
  ageRestriction: boolean;
  originLocation: string;
  containsAllergens: boolean;
  allergensDetail: string;
  isDangerousItem: boolean;
  dangerDetail: string;
  requiresCleaning: boolean;
  cleaningInstructions: string;
  imageFile: File | null;
}

const emptyDraft = (): ProductDraft => ({
  productName: '',
  productDescription: '',
  usageInstructions: '',
  productExpirationDate: '',
  productVideoUrl: '',
  additionalNotes: '',
  ageRestriction: false,
  originLocation: '',
  containsAllergens: false,
  allergensDetail: '',
  isDangerousItem: false,
  dangerDetail: '',
  requiresCleaning: false,
  cleaningInstructions: '',
  imageFile: null,
});

const monthLabel = (ym: string) => {
  const [year, month] = ym.split('-').map(Number);
  if (!year || !month) return ym;
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'long' });
};

const getCurrentMonthYear = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getNextMonthYear = (ym: string) => {
  const [year, month] = ym.split('-').map(Number);
  const date = new Date(year, month, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

interface ProductFieldsProps {
  value: ProductDraft;
  onChange: (value: ProductDraft) => void;
  allowImage: boolean;
}

const ProductFields: React.FC<ProductFieldsProps> = ({ value, onChange, allowImage }) => {
  const set = (field: keyof ProductDraft, val: any) => onChange({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del producto *</label>
          <input
            type="text"
            value={value.productName}
            onChange={(e) => set('productName', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha de vencimiento</label>
          <input
            type="date"
            value={value.productExpirationDate}
            onChange={(e) => set('productExpirationDate', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción *</label>
        <textarea
          value={value.productDescription}
          onChange={(e) => set('productDescription', e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Instrucciones de uso</label>
        <textarea
          value={value.usageInstructions}
          onChange={(e) => set('usageInstructions', e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Origen de fabricación</label>
          <input
            type="text"
            value={value.originLocation}
            onChange={(e) => set('originLocation', e.target.value)}
            placeholder="Ej: Mendoza, Argentina"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">URL de video (opcional)</label>
          <input
            type="url"
            value={value.productVideoUrl}
            onChange={(e) => set('productVideoUrl', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notas adicionales</label>
        <textarea
          value={value.additionalNotes}
          onChange={(e) => set('additionalNotes', e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="bg-gray-50 rounded-md p-4 space-y-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={value.ageRestriction}
            onChange={(e) => set('ageRestriction', e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          Apto solo para mayores de 18 años
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={value.containsAllergens}
            onChange={(e) => set('containsAllergens', e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          Contiene alérgenos
        </label>
        {value.containsAllergens && (
          <textarea
            value={value.allergensDetail}
            onChange={(e) => set('allergensDetail', e.target.value)}
            rows={2}
            placeholder="Detalle de los alérgenos (ej: contiene maní, gluten)"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        )}

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={value.isDangerousItem}
            onChange={(e) => set('isDangerousItem', e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          Contiene un producto peligroso para el consumo
        </label>
        {value.isDangerousItem && (
          <textarea
            value={value.dangerDetail}
            onChange={(e) => set('dangerDetail', e.target.value)}
            rows={2}
            placeholder="Detalle del riesgo (ej: no ingerir, uso externo)"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        )}

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={value.requiresCleaning}
            onChange={(e) => set('requiresCleaning', e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          Requiere lavado o limpieza antes de usar
        </label>
        {value.requiresCleaning && (
          <textarea
            value={value.cleaningInstructions}
            onChange={(e) => set('cleaningInstructions', e.target.value)}
            rows={2}
            placeholder="Cómo lavarlo o limpiarlo"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        )}
      </div>

      {allowImage && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Imagen del producto</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => set('imageFile', e.target.files ? e.target.files[0] : null)}
            className="mt-1 block w-full text-sm"
          />
        </div>
      )}
    </div>
  );
};

const SubscriptionBoxHistoryPage: React.FC = () => {
  const { clubId, subscriptionTypeId } = useParams<{ clubId: string; subscriptionTypeId: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  const [subscriptionType, setSubscriptionType] = useState<SubscriptionTypeDetail | null>(null);
  const [boxes, setBoxes] = useState<BoxContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [creating, setCreating] = useState(false);
  const [newMonth, setNewMonth] = useState('');
  const [drafts, setDrafts] = useState<ProductDraft[]>([emptyDraft()]);
  const [savingNew, setSavingNew] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<ProductDraft | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(async () => {
    try {
      const [subRes, boxesRes] = await Promise.all([
        api.get(`/subscription-types/${subscriptionTypeId}`),
        api.get(`/box-content-history/by-subscription-type/${subscriptionTypeId}`),
      ]);
      const subData = getResponseData(subRes);
      if (String(subData.idClub) !== String(clubId)) {
        navigate('/login');
        return;
      }
      setSubscriptionType(subData);
      setBoxes(getResponseData(boxesRes) || []);
    } catch {
      setError('No se pudo cargar la información de esta suscripción.');
    } finally {
      setLoading(false);
    }
  }, [subscriptionTypeId, clubId, navigate]);

  useEffect(() => {
    if (userRole !== 'entrepreneur' || !user?.managedClubId || user.managedClubId !== clubId) {
      navigate('/login');
      return;
    }
    load();
  }, [clubId, user, userRole, navigate, load]);

  const showFeedback = (successMsg?: string, errorMsg?: string) => {
    setSuccess(successMsg || '');
    setError(errorMsg || '');
    if (successMsg) setTimeout(() => setSuccess(''), 3500);
  };

  const boxesByMonth = boxes.reduce<Record<string, BoxContentItem[]>>((acc, item) => {
    if (!acc[item.deliveryMonthYear]) acc[item.deliveryMonthYear] = [];
    acc[item.deliveryMonthYear].push(item);
    return acc;
  }, {});
  const sortedMonths = Object.keys(boxesByMonth).sort((a, b) => (a < b ? 1 : -1));

  const currentMonth = getCurrentMonthYear();
  const missingCurrentMonth = subscriptionType?.active && !boxesByMonth[currentMonth];

  const openCreate = () => {
    const suggested = sortedMonths.length > 0 ? getNextMonthYear(sortedMonths[0]) : currentMonth;
    setNewMonth(suggested);
    setDrafts([emptyDraft()]);
    setCreating(true);
  };

  const addDraft = () => setDrafts((prev) => [...prev, emptyDraft()]);
  const removeDraft = (index: number) => setDrafts((prev) => prev.filter((_, i) => i !== index));
  const updateDraft = (index: number, value: ProductDraft) => {
    setDrafts((prev) => prev.map((d, i) => (i === index ? value : d)));
  };

  const handleCreateBox = async () => {
    if (!newMonth || !subscriptionTypeId) return;
    const invalid = drafts.some((d) => !d.productName.trim() || !d.productDescription.trim());
    if (invalid) {
      showFeedback(undefined, 'Cada producto necesita al menos nombre y descripción.');
      return;
    }
    setSavingNew(true);
    setError('');
    try {
      for (const draft of drafts) {
        const formData = new FormData();
        formData.append('idSubscriptionTypes', subscriptionTypeId);
        formData.append('deliveryMonthYear', newMonth);
        formData.append('productName', draft.productName.trim());
        formData.append('productDescription', draft.productDescription.trim());
        if (draft.usageInstructions) formData.append('usageInstructions', draft.usageInstructions);
        if (draft.productExpirationDate) formData.append('productExpirationDate', draft.productExpirationDate);
        if (draft.productVideoUrl) formData.append('productVideoUrl', draft.productVideoUrl);
        if (draft.additionalNotes) formData.append('additionalNotes', draft.additionalNotes);
        formData.append('publicationDate', new Date().toISOString());
        formData.append('ageRestriction', String(draft.ageRestriction));
        if (draft.originLocation) formData.append('originLocation', draft.originLocation);
        formData.append('containsAllergens', String(draft.containsAllergens));
        if (draft.containsAllergens && draft.allergensDetail) formData.append('allergensDetail', draft.allergensDetail);
        formData.append('isDangerousItem', String(draft.isDangerousItem));
        if (draft.isDangerousItem && draft.dangerDetail) formData.append('dangerDetail', draft.dangerDetail);
        formData.append('requiresCleaning', String(draft.requiresCleaning));
        if (draft.requiresCleaning && draft.cleaningInstructions) formData.append('cleaningInstructions', draft.cleaningInstructions);
        if (draft.imageFile) formData.append('image', draft.imageFile);

        await api.post('/box-content-history', formData);
      }
      showFeedback(`Caja de ${monthLabel(newMonth)} creada correctamente.`);
      setCreating(false);
      await load();
    } catch {
      showFeedback(undefined, 'Error al crear la caja. Revisá los datos e intentá de nuevo.');
    } finally {
      setSavingNew(false);
    }
  };

  const openEdit = (item: BoxContentItem) => {
    setEditingId(item.id);
    setEditDraft({
      productName: item.productName,
      productDescription: item.productDescription,
      usageInstructions: item.usageInstructions || '',
      productExpirationDate: item.productExpirationDate ? item.productExpirationDate.slice(0, 10) : '',
      productVideoUrl: item.productVideoUrl || '',
      additionalNotes: item.additionalNotes || '',
      ageRestriction: item.ageRestriction,
      originLocation: item.originLocation || '',
      containsAllergens: item.containsAllergens,
      allergensDetail: item.allergensDetail || '',
      isDangerousItem: item.isDangerousItem,
      dangerDetail: item.dangerDetail || '',
      requiresCleaning: item.requiresCleaning,
      cleaningInstructions: item.cleaningInstructions || '',
      imageFile: null,
    });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editDraft) return;
    if (!editDraft.productName.trim() || !editDraft.productDescription.trim()) {
      showFeedback(undefined, 'El nombre y la descripción son obligatorios.');
      return;
    }
    setSavingEdit(true);
    setError('');
    try {
      await api.put(`/box-content-history/${editingId}`, {
        productName: editDraft.productName.trim(),
        productDescription: editDraft.productDescription.trim(),
        usageInstructions: editDraft.usageInstructions || undefined,
        productExpirationDate: editDraft.productExpirationDate || undefined,
        productVideoUrl: editDraft.productVideoUrl || undefined,
        additionalNotes: editDraft.additionalNotes || undefined,
        ageRestriction: editDraft.ageRestriction,
        originLocation: editDraft.originLocation || undefined,
        containsAllergens: editDraft.containsAllergens,
        allergensDetail: editDraft.containsAllergens ? editDraft.allergensDetail || undefined : undefined,
        isDangerousItem: editDraft.isDangerousItem,
        dangerDetail: editDraft.isDangerousItem ? editDraft.dangerDetail || undefined : undefined,
        requiresCleaning: editDraft.requiresCleaning,
        cleaningInstructions: editDraft.requiresCleaning ? editDraft.cleaningInstructions || undefined : undefined,
      });
      showFeedback('Producto actualizado correctamente.');
      closeEdit();
      await load();
    } catch {
      showFeedback(undefined, 'Error al guardar los cambios.');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Cargando historial de cajas...</div>;
  if (!subscriptionType) return <div className="container mx-auto px-4 py-8 text-center">Suscripción no encontrada.</div>;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <button
        onClick={() => navigate(`/entrepreneur/club/${clubId}/subscription-boxes`)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
      >
        ← Volver a mis suscripciones
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{subscriptionType.name}</h1>
            {subscriptionType.createdAt && (
              <p className="text-sm text-gray-500 mt-1">
                Creada el {new Date(subscriptionType.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${subscriptionType.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {subscriptionType.active ? 'Habilitada' : 'Deshabilitada'}
          </span>
        </div>
      </div>

      {success && <p className="text-green-600 text-sm bg-green-50 p-3 rounded mb-4">{success}</p>}
      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded mb-4">{error}</p>}

      {missingCurrentMonth && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-6 rounded">
          <p className="font-bold">Todavía no cargaste el contenido de la caja de {monthLabel(currentMonth)}.</p>
          <p className="text-sm mt-1">Tus suscriptores no van a poder ver el folleto de este mes hasta que lo subas.</p>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold text-sm"
        >
          + Crear Próxima Caja
        </button>
      </div>

      {creating && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Nueva caja mensual</h2>
            <button onClick={() => setCreating(false)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">
              &times;
            </button>
          </div>
          <div className="mb-6 max-w-xs">
            <label className="block text-sm font-medium text-gray-700">Mes de entrega</label>
            <input
              type="month"
              value={newMonth}
              onChange={(e) => setNewMonth(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="space-y-6">
            {drafts.map((draft, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Producto {index + 1}</h3>
                  {drafts.length > 1 && (
                    <button onClick={() => removeDraft(index)} className="text-red-500 hover:text-red-700 text-sm">
                      Quitar
                    </button>
                  )}
                </div>
                <ProductFields value={draft} onChange={(v) => updateDraft(index, v)} allowImage />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <button onClick={addDraft} className="text-sm bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100">
              + Agregar otro producto a esta caja
            </button>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={handleCreateBox}
              disabled={savingNew}
              className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold ${savingNew ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {savingNew ? 'Guardando...' : 'Guardar Caja'}
            </button>
          </div>
        </div>
      )}

      {sortedMonths.length === 0 ? (
        <p className="text-gray-600 text-center">Todavía no cargaste ninguna caja para esta suscripción.</p>
      ) : (
        <div className="space-y-6">
          {sortedMonths.map((month) => (
            <div key={month} className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 capitalize">{monthLabel(month)}</h2>
              <div className="space-y-4">
                {boxesByMonth[month].map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-xl p-5">
                    {editingId === item.id && editDraft ? (
                      <div>
                        <ProductFields value={editDraft} onChange={setEditDraft} allowImage={false} />
                        <div className="flex justify-end gap-3 mt-4">
                          <button onClick={closeEdit} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            disabled={savingEdit}
                            className={`bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-semibold ${savingEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {savingEdit ? 'Guardando...' : 'Guardar Cambios'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-4">
                        {item.productImageUrl && (
                          <img
                            src={item.productImageUrl}
                            alt={item.productName}
                            className="w-full sm:w-32 h-32 object-cover rounded-lg shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-800">{item.productName}</h3>
                            <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Editar
                            </button>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{item.productDescription}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.ageRestriction && (
                              <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full">+18</span>
                            )}
                            {item.containsAllergens && (
                              <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Contiene alérgenos</span>
                            )}
                            {item.isDangerousItem && (
                              <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Producto de riesgo</span>
                            )}
                            {item.requiresCleaning && (
                              <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Requiere limpieza</span>
                            )}
                          </div>
                          {item.originLocation && (
                            <p className="text-xs text-gray-500 mt-2">Origen: {item.originLocation}</p>
                          )}
                          {item.usageInstructions && (
                            <p className="text-xs text-gray-500 mt-1">Uso: {item.usageInstructions}</p>
                          )}
                          {item.containsAllergens && item.allergensDetail && (
                            <p className="text-xs text-yellow-700 mt-1">Alérgenos: {item.allergensDetail}</p>
                          )}
                          {item.isDangerousItem && item.dangerDetail && (
                            <p className="text-xs text-orange-700 mt-1">Riesgo: {item.dangerDetail}</p>
                          )}
                          {item.requiresCleaning && item.cleaningInstructions && (
                            <p className="text-xs text-blue-700 mt-1">Limpieza: {item.cleaningInstructions}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionBoxHistoryPage;