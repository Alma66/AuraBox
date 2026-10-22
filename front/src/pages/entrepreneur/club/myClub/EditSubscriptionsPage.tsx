import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import api, { getResponseData } from '../../../../api/config';
import { Club, SubscriptionPlan } from '../../../../types/club';
import { useAuth } from '../../../../App';
import EntrepreneurSubscriptionSidebar from '../../../../components/entrepreneur/EntrepreneurSubscriptionSidebar';

const AURABOX_COMMISSION = 200;

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

function parseIncludes(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.trim() !== '') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapPlanFromApi(raw: any): SubscriptionPlan {
  const totalPrice = Number(raw.basePrice ?? raw.price ?? 0);
  return {
    planId: String(raw.id),
    name: raw.name ?? '',
    description: raw.description ?? '',
    price: totalPrice,
    currency: 'ARS',
    image: raw.imageUrl ?? '',
    deliveryFrequency: raw.frequency ?? raw.deliveryFrequency ?? 'Mensual',
    includes: parseIncludes(raw.includes),
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

const Badge: React.FC<{ active: boolean }> = ({ active }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
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
  const [saving, setSaving] = useState(false);
  const [includeInput, setIncludeInput] = useState('');
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        toast.error('Error al cargar los datos');
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
      price: Math.max(0, plan.price - AURABOX_COMMISSION),
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
    price: Number(formData.price) + AURABOX_COMMISSION,
    frequency: formData.frequency,
    cashDiscount: Number(formData.descuentoEfectivo) || 0,
    transferDiscount: Number(formData.descuentoTransferencia) || 0,
    active: formData.activo,
    shippingAreas: formData.shippingAreas,
    includes: JSON.stringify(formData.includes ?? []),
  });

  const handleSave = async () => {
    if (!formData) return;
    setSaving(true);
    try {
      if (selectedPlan) {
        const res = await api.put(`/subscription-types/${selectedPlan.planId}`, buildPayload());
        const updated = mapPlanFromApi({ ...getResponseData(res), id: Number(selectedPlan.planId) });
        setPlans(p => p.map(x => x.planId === selectedPlan.planId ? updated : x));
        toast.success('Plan actualizado correctamente.');
        closeModal();
      } else {
        const res = await api.post('/subscription-types', { ...buildPayload(), idClub: Number(clubId) });
        const created = mapPlanFromApi(getResponseData(res));
        setPlans(p => [...p, created]);
        toast.success('Plan creado correctamente.');
        setFormData(emptyForm());
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al guardar.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlan) return;
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">¿Eliminar el plan <strong>{selectedPlan.name}</strong>? Esta acción no se puede deshacer.</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.delete(`/subscription-types/${selectedPlan.planId}`);
                setPlans(p => p.filter(x => x.planId !== selectedPlan.planId));
                toast.success('Plan eliminado.');
                closeModal();
              } catch {
                toast.error('Error al eliminar.');
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

  const onCropComplete = useCallback((_: any, croppedPixels: any) => setCroppedArea(croppedPixels), []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 8MB');
      return;
    }
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
      const imageUrl = updated?.imageUrl;
      if (!imageUrl) throw new Error('Sin URL de imagen');
      setPlans(p => p.map(x => x.planId === selectedPlan.planId ? { ...x, image: imageUrl } : x));
      setSelectedPlan(prev => prev ? { ...prev, image: imageUrl } : prev);
      setCropSrc(null);
      toast.success('Imagen actualizada.');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al subir la imagen.'));
    } finally {
      setUploadingImage(false);
    }
  };

  const renderPlanForm = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-aurora-navy mb-1">Nombre del plan *</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => set('name', e.target.value)}
            className="w-full border border-aurora-navy/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-aurora-navy mb-1">Tu precio (ARS) *</label>
          <input
            type="number"
            min={0}
            value={formData.price}
            onChange={e => set('price', e.target.value)}
            className="w-full border border-aurora-navy/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
            required
          />
          <div className="mt-2 bg-aurora-navy/5 border border-aurora-navy/10 rounded-lg px-3 py-2 text-xs text-aurora-navy space-y-0.5">
            <p className="flex justify-between"><span>Tu precio:</span><span>${Number(formData.price || 0).toLocaleString('es-AR')}</span></p>
            <p className="flex justify-between"><span>Comisión AuraBox:</span><span>${AURABOX_COMMISSION.toLocaleString('es-AR')}</span></p>
            <p className="flex justify-between font-semibold border-t border-aurora-navy/10 mt-1 pt-1"><span>Precio total que verá el cliente:</span><span>${(Number(formData.price || 0) + AURABOX_COMMISSION).toLocaleString('es-AR')}</span></p>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-aurora-navy mb-1">Descripción</label>
        <textarea
          value={formData.description}
          onChange={e => set('description', e.target.value)}
          rows={3}
          className="w-full border border-aurora-navy/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40 resize-none"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-aurora-navy mb-1">Frecuencia</label>
          <select
            value={formData.frequency}
            onChange={e => set('frequency', e.target.value)}
            className="w-full border border-aurora-navy/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
          >
            {FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-aurora-navy mb-1">Desc. Transferencia (%)</label>
          <input
            type="number" min={0} max={100}
            value={formData.descuentoTransferencia}
            onChange={e => set('descuentoTransferencia', e.target.value)}
            className="w-full border border-aurora-navy/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-aurora-navy mb-1">Desc. Efectivo (%)</label>
          <input
            type="number" min={0} max={100}
            value={formData.descuentoEfectivo}
            onChange={e => set('descuentoEfectivo', e.target.value)}
            className="w-full border border-aurora-navy/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-aurora-navy mb-1">Zonas de envío</label>
        <input
          type="text"
          value={formData.shippingAreas}
          onChange={e => set('shippingAreas', e.target.value)}
          placeholder="Ej: CABA, GBA, Interior"
          className="w-full border border-aurora-navy/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-aurora-navy mb-2">¿Qué incluye?</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={includeInput}
            onChange={e => setIncludeInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInclude())}
            placeholder="Ej: Caja personalizada"
            className="flex-1 border border-aurora-navy/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
          />
          <button type="button" onClick={addInclude} className="px-4 py-2 bg-aurora-terracotta text-white rounded-lg text-sm hover:bg-aurora-terracottaDark transition">
            Agregar
          </button>
        </div>
        {formData.includes?.length > 0 && (
          <ul className="space-y-1">
            {formData.includes.map((item: string, i: number) => (
              <li key={i} className="flex items-center justify-between bg-aurora-cream rounded-lg px-3 py-2 text-sm">
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
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.activo ? 'bg-aurora-terracotta' : 'bg-gray-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.activo ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <span className="text-sm font-medium text-aurora-navy">{formData.activo ? 'Plan activo' : 'Plan inactivo'}</span>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-aurora-cream">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
    </div>
  );

  if (!club) return (
    <div className="container mx-auto p-8 text-center">
      <p className="text-lg font-semibold text-aurora-navy/60">Club no encontrado.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div className="bg-white border-b border-aurora-navy/10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <Link to={`/club/${clubId}`} className="text-aurora-navy/40 hover:text-aurora-navy transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <p className="text-xs text-aurora-navy/50 uppercase tracking-wide font-medium">Panel del emprendedor</p>
              <h1 className="font-display text-2xl font-bold text-aurora-navy">{club.name} — Planes de Suscripción</h1>
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
                  <h2 className="font-display text-xl font-bold text-aurora-navy">
                    Mis planes <span className="text-aurora-navy/40 font-normal text-base">({plans.length})</span>
                  </h2>
                  <button
                    onClick={() => { setActiveSection('create'); setFormData(emptyForm()); }}
                    className="flex items-center gap-2 px-4 py-2 bg-aurora-terracotta text-white rounded-lg text-sm font-medium hover:bg-aurora-terracottaDark transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo plan
                  </button>
                </div>
                {plans.length === 0 ? (
                  <div className="bg-white rounded-xl border-2 border-dashed border-aurora-navy/15 p-16 text-center">
                    <svg className="w-12 h-12 text-aurora-navy/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-aurora-navy/50 font-medium mb-3">Todavía no tenés planes de suscripción</p>
                    <button
                      onClick={() => { setActiveSection('create'); setFormData(emptyForm()); }}
                      className="px-5 py-2 bg-aurora-terracotta text-white rounded-lg text-sm font-medium hover:bg-aurora-terracottaDark transition"
                    >
                      Crear el primero
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {plans.map(plan => (
                      <div key={plan.planId} className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 overflow-hidden hover:shadow-aurora transition-shadow">
                        <div className="relative">
                          <img
                            src={plan.image && !plan.image.includes('/assets/') ? plan.image : 'https://placehold.co/400x200/FBF4E9/1F3350?text=Sin+imagen'}
                            alt={plan.name}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge active={plan.activo ?? true} />
                          </div>
                          {((plan.descuentoTransferencia ?? 0) > 0 || (plan.descuentoEfectivo ?? 0) > 0) && (
                            <div className="absolute top-3 right-3 bg-aurora-terracotta text-white text-xs font-bold px-2 py-1 rounded-full">
                              -{Math.max(plan.descuentoTransferencia ?? 0, plan.descuentoEfectivo ?? 0)}%
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-aurora-navy text-base leading-tight">{plan.name}</h3>
                          </div>
                          <p className="text-xs text-aurora-navy/50 mb-2">{plan.deliveryFrequency}</p>
                          <p className="text-sm text-aurora-navy/60 line-clamp-2 mb-3">{plan.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-aurora-terracotta">
                              ARS {plan.price.toLocaleString('es-AR')}
                            </span>
                            <div className="flex gap-2">
                              <Link
                                to={`/club/${clubId}/plan/${plan.planId}`}
                                className="px-3 py-1.5 text-xs font-medium text-aurora-navy border border-aurora-navy/20 rounded-lg hover:bg-aurora-cream transition"
                              >
                                Vista previa
                              </Link>
                              <button
                                onClick={() => openEdit(plan)}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-aurora-navy rounded-lg hover:bg-aurora-navyLight transition"
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
              <div className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-8 max-w-2xl">
                <h2 className="font-display text-xl font-bold text-aurora-navy mb-6">Crear nuevo plan</h2>
                {renderPlanForm()}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-aurora-navy/10">
                  <button
                    onClick={() => { setActiveSection('management'); setFormData(null); }}
                    className="px-5 py-2 text-sm font-medium text-aurora-navy border border-aurora-navy/20 rounded-lg hover:bg-aurora-cream transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 text-sm font-medium text-white bg-aurora-terracotta rounded-lg hover:bg-aurora-terracottaDark disabled:opacity-60 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-aurora-navyDark/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-aurora w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-aurora-navy/10 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="font-display text-lg font-bold text-aurora-navy">Editando plan</h2>
              <button onClick={closeModal} className="text-aurora-navy/40 hover:text-aurora-navy transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-aurora-navy mb-2">Imagen del plan</label>
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img
                    src={selectedPlan.image || 'https://placehold.co/400x200/FBF4E9/1F3350?text=Sin+imagen'}
                    alt={selectedPlan.name}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-aurora-navyDark/40 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
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
                  <div className="relative w-full h-64 bg-aurora-navyDark rounded-xl overflow-hidden">
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
                    <span className="text-xs text-aurora-navy/50">Zoom</span>
                    <input
                      type="range" min={1} max={3} step={0.05}
                      value={zoom}
                      onChange={e => setZoom(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setCropSrc(null)} className="flex-1 py-2 text-sm font-medium text-aurora-navy border border-aurora-navy/20 rounded-lg hover:bg-aurora-cream transition">
                      Cancelar
                    </button>
                    <button onClick={handleCropConfirm} disabled={uploadingImage} className="flex-1 py-2 text-sm font-medium text-white bg-aurora-terracotta rounded-lg hover:bg-aurora-terracottaDark disabled:opacity-60 transition">
                      {uploadingImage ? 'Subiendo...' : 'Confirmar imagen'}
                    </button>
                  </div>
                </div>
              )}
              {renderPlanForm()}
            </div>
            <div className="sticky bottom-0 bg-white border-t border-aurora-navy/10 px-6 py-4 flex items-center justify-between rounded-b-2xl">
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
                <button onClick={closeModal} className="px-5 py-2 text-sm font-medium text-aurora-navy border border-aurora-navy/20 rounded-lg hover:bg-aurora-cream transition">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 text-sm font-medium text-white bg-aurora-terracotta rounded-lg hover:bg-aurora-terracottaDark disabled:opacity-60 transition">
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditSubscriptionsPage;