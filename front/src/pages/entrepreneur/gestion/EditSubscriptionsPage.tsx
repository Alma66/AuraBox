import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import api, { getResponseData } from '../../../api/config';
import { Club, SubscriptionPlan } from '../../../types/club';
import { useAuth } from '../../../App';
import EntrepreneurSubscriptionSidebar from '../../../components/entrepreneur/EntrepreneurSubscriptionSidebar';

const FREQUENCY_OPTIONS = [
  { label: 'Única vez', value: 'Unica' },
  { label: 'Mensual', value: 'Mensual' },
  { label: 'Bimestral', value: 'Bimestral' },
  { label: 'Trimestral', value: 'Trimestral' },
  { label: 'Cuatrimestral', value: 'Cuatrimestral' },
  { label: 'Quinquemestral', value: 'Quinquemestral' },
  { label: 'Semestral', value: 'Semestral' },
  { label: 'Anual', value: 'Anual' },
];

function mapPlanFromApi(raw: any): SubscriptionPlan {
  return {
    planId: String(raw.id),
    name: raw.name ?? '',
    description: raw.description ?? '',
    price: Number(raw.basePrice ?? raw.price ?? 0),
    currency: 'ARS',
    image: raw.imageUrl ?? '/assets/default-plan.jpg',
    deliveryFrequency: raw.frequency ?? raw.deliveryFrequency ?? 'Mensual',
    includes: raw.includes ?? [],
    shippingAreas: raw.shippingAreas ?? '',
    specifications: raw.specifications ?? [],
    descuentoTransferencia: raw.transferDiscount ? Number(raw.transferDiscount) : 0,
    descuentoEfectivo: raw.cashDiscount ? Number(raw.cashDiscount) : 0,
    activo: raw.active ?? true,
  };
}

async function getCroppedImg(imageSrc: string, croppedAreaPixels: any): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = imageSrc;
  });
  const canvas = document.createElement('canvas');
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    croppedAreaPixels.x, croppedAreaPixels.y,
    croppedAreaPixels.width, croppedAreaPixels.height,
    0, 0,
    croppedAreaPixels.width, croppedAreaPixels.height,
  );
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.85));
}

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => (
  <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-xl text-white text-sm font-medium flex items-center gap-3 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
    <span>{message}</span>
    <button onClick={onClose} className="text-white/80 hover:text-white text-lg leading-none">✕</button>
  </div>
);

const Badge: React.FC<{ active: boolean }> = ({ active }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
    {active ? 'Activo' : 'Inactivo'}
  </span>
);

const emptyForm = () => ({
  name: '',
  description: '',
  price: 0,
  frequency: 'Mensual',
  descuentoTransferencia: 0,
  descuentoEfectivo: 0,
  activo: true,
  shippingAreas: '',
  includes: [] as string[],
});

const EditSubscriptionsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('management');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [includeInput, setIncludeInput] = useState('');

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (userRole !== 'entrepreneur') { navigate('/login'); return; }
    const fetch = async () => {
      try {
        const [cr, pr] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/subscription-types?clubId=${clubId}`),
        ]);
        const clubData = getResponseData(cr);
        if (!clubData?.isOwner) { navigate('/login'); return; }
        setClub(clubData);
        const raw = getResponseData(pr);
        setPlans(Array.isArray(raw) ? raw.map(mapPlanFromApi) : []);
      } catch {
        showToast('Error al cargar los datos', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (clubId) fetch();
  }, [clubId, userRole, navigate]);

  const openEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      frequency: plan.deliveryFrequency,
      descuentoTransferencia: plan.descuentoTransferencia ?? 0,
      descuentoEfectivo: plan.descuentoEfectivo ?? 0,
      activo: plan.activo ?? true,
      shippingAreas: plan.shippingAreas ?? '',
      includes: [...(plan.includes ?? [])],
    });
  };

  const closeModal = () => { setSelectedPlan(null); setFormData(null); setCropSrc(null); };

  const set = (field: string, value: any) => setFormData((p: any) => ({ ...p, [field]: value }));

  const addInclude = () => {
    if (!includeInput.trim()) return;
    set('includes', [...(formData.includes ?? []), includeInput.trim()]);
    setIncludeInput('');
  };

  const removeInclude = (i: number) => set('includes', formData.includes.filter((_: any, idx: number) => idx !== i));

  const buildPayload = () => ({
    name: formData.name,
    description: formData.description,
    basePrice: Number(formData.price),
    frequency: formData.frequency,
    cashDiscount: Number(formData.descuentoEfectivo) || 0,
    transferDiscount: Number(formData.descuentoTransferencia) || 0,
    active: formData.activo,
    shippingAreas: formData.shippingAreas,
    includes: formData.includes,
  });

  const handleSave = async () => {
    if (!formData) return;
    setSaving(true);
    try {
      if (selectedPlan) {
        const res = await api.put(`/subscription-types/${selectedPlan.planId}`, buildPayload());
        const updated = mapPlanFromApi({ ...getResponseData(res), id: Number(selectedPlan.planId) });
        setPlans(p => p.map(x => x.planId === selectedPlan.planId ? updated : x));
        showToast('Plan actualizado correctamente.');
        closeModal();
      } else {
        const res = await api.post('/subscription-types', { ...buildPayload(), idClub: Number(clubId) });
        const created = mapPlanFromApi(getResponseData(res));
        setPlans(p => [...p, created]);
        showToast('Plan creado correctamente.');
        setFormData(emptyForm());
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      showToast(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al guardar.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlan) return;
    if (!window.confirm(`¿Eliminar el plan "${selectedPlan.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/subscription-types/${selectedPlan.planId}`);
      setPlans(p => p.filter(x => x.planId !== selectedPlan.planId));
      showToast('Plan eliminado.');
      closeModal();
    } catch {
      showToast('Error al eliminar.', 'error');
    }
  };

  const onCropComplete = useCallback((_: any, croppedPixels: any) => setCroppedArea(croppedPixels), []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async () => {
    if (!cropSrc || !croppedArea || !selectedPlan) return;
    setUploadingImage(true);
    try {
      const blob = await getCroppedImg(cropSrc, croppedArea);
      const fd = new FormData();
      fd.append('file', blob, 'plan-image.jpg');
      fd.append('planId', selectedPlan.planId);
      const res = await api.patch(`/subscription-types/${selectedPlan.planId}/image`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updated = getResponseData(res);
      const imageUrl = updated?.imageUrl ?? updated?.image ?? cropSrc;
      setPlans(p => p.map(x => x.planId === selectedPlan.planId ? { ...x, image: imageUrl } : x));
      setSelectedPlan(prev => prev ? { ...prev, image: imageUrl } : prev);
      setCropSrc(null);
      showToast('Imagen actualizada.');
    } catch {
      showToast('Error al subir la imagen.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const PlanForm = ({ isCreate = false }: { isCreate?: boolean }) => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del plan *</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => set('name', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Precio (ARS) *</label>
          <input
            type="number"
            min={0}
            value={formData.price}
            onChange={e => set('price', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
        <textarea
          value={formData.description}
          onChange={e => set('description', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Frecuencia</label>
          <select
            value={formData.frequency}
            onChange={e => set('frequency', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Desc. Transferencia (%)</label>
          <input
            type="number" min={0} max={100}
            value={formData.descuentoTransferencia}
            onChange={e => set('descuentoTransferencia', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Desc. Efectivo (%)</label>
          <input
            type="number" min={0} max={100}
            value={formData.descuentoEfectivo}
            onChange={e => set('descuentoEfectivo', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Zonas de envío</label>
        <input
          type="text"
          value={formData.shippingAreas}
          onChange={e => set('shippingAreas', e.target.value)}
          placeholder="Ej: CABA, GBA, Interior"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">¿Qué incluye?</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={includeInput}
            onChange={e => setIncludeInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInclude())}
            placeholder="Ej: Caja personalizada"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={addInclude}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
          >
            Agregar
          </button>
        </div>
        {formData.includes?.length > 0 && (
          <ul className="space-y-1">
            {formData.includes.map((item: string, i: number) => (
              <li key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                <span>{item}</span>
                <button onClick={() => removeInclude(i)} className="text-red-500 hover:text-red-700 text-xs">✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => set('activo', !formData.activo)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.activo ? 'bg-indigo-600' : 'bg-gray-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.activo ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span className="text-sm font-medium text-gray-700">{formData.activo ? 'Plan activo' : 'Plan inactivo'}</span>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  if (!club) return (
    <div className="container mx-auto p-8 text-center">
      <p className="text-lg font-semibold text-gray-600">Club no encontrado.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <Link to={`/club/${clubId}`} className="text-gray-400 hover:text-gray-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Panel del emprendedor</p>
              <h1 className="text-2xl font-bold text-gray-900">{club.name} — Planes de Suscripción</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-56 shrink-0">
            <EntrepreneurSubscriptionSidebar activeSection={activeSection} setActiveSection={(s) => {
              setActiveSection(s);
              if (s === 'create') setFormData(emptyForm());
            }} />
          </div>

          <div className="flex-1 min-w-0">
            {activeSection === 'management' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Mis planes <span className="text-gray-400 font-normal text-base">({plans.length})</span>
                  </h2>
                  <button
                    onClick={() => { setActiveSection('create'); setFormData(emptyForm()); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo plan
                  </button>
                </div>

                {plans.length === 0 ? (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-16 text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500 font-medium mb-3">Todavía no tenés planes de suscripción</p>
                    <button
                      onClick={() => { setActiveSection('create'); setFormData(emptyForm()); }}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                    >
                      Crear el primero
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {plans.map(plan => (
                      <div key={plan.planId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative">
                          <img
                            src={plan.image || '/assets/default-plan.jpg'}
                            alt={plan.name}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge active={plan.activo ?? true} />
                          </div>
                          {((plan.descuentoTransferencia ?? 0) > 0 || (plan.descuentoEfectivo ?? 0) > 0) && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              -{Math.max(plan.descuentoTransferencia ?? 0, plan.descuentoEfectivo ?? 0)}%
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-base leading-tight">{plan.name}</h3>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{plan.deliveryFrequency}</p>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{plan.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-indigo-700">
                              ARS {plan.price.toLocaleString('es-AR')}
                            </span>
                            <div className="flex gap-2">
                              <Link
                                to={`/club/${clubId}/plan/${plan.planId}`}
                                className="px-3 py-1.5 text-xs font-medium text-indigo-700 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition"
                              >
                                Vista previa
                              </Link>
                              <button
                                onClick={() => openEdit(plan)}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                              >
                                Editar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'create' && formData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Crear nuevo plan</h2>
                <PlanForm isCreate />
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                  <button
                    onClick={() => { setActiveSection('management'); setFormData(null); }}
                    className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
                  >
                    {saving ? 'Guardando...' : 'Crear plan'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPlan && formData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900">Editando plan</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen del plan</label>
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img
                    src={selectedPlan.image || '/assets/default-plan.jpg'}
                    alt={selectedPlan.name}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <div className="text-white text-center">
                      <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium">Cambiar imagen</span>
                    </div>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>

              {cropSrc && (
                <div className="mb-6">
                  <div className="relative w-full h-64 bg-gray-900 rounded-xl overflow-hidden">
                    <Cropper
                      image={cropSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={16 / 9}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-gray-500">Zoom</span>
                    <input
                      type="range" min={1} max={3} step={0.05}
                      value={zoom}
                      onChange={e => setZoom(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setCropSrc(null)}
                      className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCropConfirm}
                      disabled={uploadingImage}
                      className="flex-1 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
                    >
                      {uploadingImage ? 'Subiendo...' : 'Confirmar imagen'}
                    </button>
                  </div>
                </div>
              )}

              <PlanForm />
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between rounded-b-2xl">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar plan
              </button>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
};

export default EditSubscriptionsPage;