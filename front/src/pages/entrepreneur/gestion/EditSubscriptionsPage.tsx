import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import { Club, SubscriptionPlan } from '../../../types/club';
import { useAuth } from '../../../App';
import SubscriptionPlanCard from '../../../components/club/SubscriptionPlanCard';
import EntrepreneurSubscriptionSidebar from '../../../components/entrepreneur/EntrepreneurSubscriptionSidebar';

// Valores que acepta el enum Frequency en Prisma
const FREQUENCY_OPTIONS = [
  { label: 'Única', value: 'Unica' },
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
    image: '/assets/default-plan.jpg',
    deliveryFrequency: raw.frequency ?? raw.deliveryFrequency ?? 'Mensual',
    includes: raw.includes ?? [],           // ← garantizamos array
    shippingAreas: raw.shippingAreas ?? '',
    specifications: raw.specifications ?? [], // ← garantizamos array
    descuentoTransferencia: raw.transferDiscount ? Number(raw.transferDiscount) : 0,
    descuentoEfectivo: raw.cashDiscount ? Number(raw.cashDiscount) : 0,
    activo: raw.active ?? true,
  };
}

const emptyForm = () => ({
  name: '',
  description: '',
  price: 0,
  frequency: 'Mensual',
  descuentoTransferencia: 0,
  descuentoEfectivo: 0,
  activo: true,
});

// Toast simple (mismo estilo que ClubDetailPage)
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => (
  <div
    className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all
      ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
  >
    <div className="flex items-center gap-3">
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">✕</button>
    </div>
  </div>
);

const EditSubscriptionsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('management');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchData = async () => {
      // Solo verificamos que sea entrepreneur; el backend valida ownership
      if (userRole !== 'entrepreneur') {
        navigate('/login');
        return;
      }

      try {
        const [clubResponse, plansResponse] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/subscription-types?clubId=${clubId}`),  // ← filtrado en el servidor
        ]);

        const clubData = getResponseData(clubResponse);
        const plansRaw = getResponseData(plansResponse);

        // Si el club no le pertenece, el backend ya lo indica con isOwner
        if (!clubData?.isOwner) {
          navigate('/login');
          return;
        }

        setClub(clubData);
        setPlans(Array.isArray(plansRaw) ? plansRaw.map(mapPlanFromApi) : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Error al cargar los datos', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (clubId) fetchData();
  }, [clubId, userRole, navigate]);

  const handleSelectPlan = (planId: string) => {
    if (activeSection !== 'management') return;
    setSelectedPlanId(planId);
    const plan = plans.find(p => p.planId === planId);
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        frequency: plan.deliveryFrequency,
        descuentoTransferencia: plan.descuentoTransferencia ?? 0,
        descuentoEfectivo: plan.descuentoEfectivo ?? 0,
        activo: plan.activo ?? true,
      });
    }
  };

  const handleInputChange = (field: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, [field]: value }));

  const buildPayload = () => ({
    name: formData.name,
    description: formData.description,
    basePrice: Number(formData.price),       // campo del backend
    frequency: formData.frequency,            // ya viene en formato correcto
    cashDiscount: Number(formData.descuentoEfectivo) || 0,
    transferDiscount: Number(formData.descuentoTransferencia) || 0,
    active: formData.activo,
  });

  const handleSavePlan = async () => {
    if (!formData) return;

    try {
      if (selectedPlanId && activeSection === 'management') {
        // PUT /subscription-types/:id
        const response = await api.put(`/subscription-types/${selectedPlanId}`, buildPayload());
        const updated = getResponseData(response);

        setPlans(prev =>
          prev.map(p => (p.planId === selectedPlanId ? { ...mapPlanFromApi({ ...updated, id: Number(selectedPlanId) }) } : p))
        );
        showToast('Plan actualizado correctamente.');
      } else {
        // POST /subscription-types
        const response = await api.post('/subscription-types', {
          ...buildPayload(),
          idClub: Number(clubId),  // campo que espera el backend
        });
        const created = getResponseData(response);
        const newPlan = mapPlanFromApi(created);

        setPlans(prev => [...prev, newPlan]);
        setSelectedPlanId(newPlan.planId);
        showToast('Nuevo plan creado correctamente.');

        if (activeSection === 'create') {
          setFormData(null);
          setSelectedPlanId(null);
        }
      }
    } catch (error: any) {
      console.error('Error saving plan:', error);
      const msg = error?.response?.data?.message ?? 'Error al guardar el plan.';
      showToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    }
  };

  const handleDeletePlan = async (planId: string | null) => {
    if (!planId || activeSection !== 'management') return;
    if (!window.confirm('¿Estás seguro que deseas eliminar este plan?')) return;

    try {
      await api.delete(`/subscription-types/${planId}`);
      setPlans(prev => prev.filter(p => p.planId !== planId));
      if (selectedPlanId === planId) {
        setSelectedPlanId(null);
        setFormData(null);
      }
      showToast('Plan eliminado.');
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      showToast('Error al eliminar el plan.', 'error');
    }
  };

  const handleTabChange = (section: string) => {
    setActiveSection(section);
    if (section === 'create') {
      setFormData(emptyForm());
      setSelectedPlanId(null);
    } else {
      setSelectedPlanId(null);
      setFormData(null);
    }
  };

  const PlanForm = ({ isCreate = false }: { isCreate?: boolean }) => (
    <form
      onSubmit={e => { e.preventDefault(); handleSavePlan(); }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Nombre del Plan</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Precio (ARS)</label>
          <input
            type="number"
            min={0}
            value={formData.price}
            onChange={e => handleInputChange('price', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
      <div>
        <label className="block font-semibold mb-1">Descripción</label>
        <textarea
          value={formData.description}
          onChange={e => handleInputChange('description', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block font-semibold mb-1">Frecuencia</label>
          <select
            value={formData.frequency}
            onChange={e => handleInputChange('frequency', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {FREQUENCY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Descuento Transferencia (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={formData.descuentoTransferencia}
            onChange={e => handleInputChange('descuentoTransferencia', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Descuento Efectivo (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={formData.descuentoEfectivo}
            onChange={e => handleInputChange('descuentoEfectivo', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={formData.activo}
          onChange={e => handleInputChange('activo', e.target.checked)}
          className="h-5 w-5 rounded"
        />
        <label className="font-semibold">Plan Activo</label>
      </div>
      <div className={`flex ${isCreate ? 'justify-end' : 'justify-between'}`}>
        <button
          type="submit"
          className={`text-white px-6 py-2 rounded transition ${isCreate ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isCreate ? 'Crear Plan' : 'Guardar Cambios'}
        </button>
        {!isCreate && (
          <button
            type="button"
            onClick={() => handleDeletePlan(selectedPlanId)}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
          >
            Eliminar Plan
          </button>
        )}
      </div>
    </form>
  );

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">Cargando...</div>;
  if (!club) return (
    <div className="container mx-auto p-8 text-center">
      <p className="text-lg font-semibold">Club no encontrado.</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Gestión de Suscripciones — {club.name}
      </h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <EntrepreneurSubscriptionSidebar
            activeSection={activeSection}
            setActiveSection={handleTabChange}
          />
        </div>

        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg p-8">
          {activeSection === 'management' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Gestión de Suscripciones</h2>
              {plans.length === 0 ? (
                <p className="text-center text-gray-600 mb-6">No hay planes creados aún.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {plans.map(plan => (
                    <div
                      key={plan.planId}
                      className={`relative cursor-pointer transition-all rounded-xl ${selectedPlanId === plan.planId ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}
                      onClick={() => handleSelectPlan(plan.planId)}
                    >
                      <SubscriptionPlanCard plan={plan} clubName={club.name} detailsLink={undefined} />
                    </div>
                  ))}
                </div>
              )}

              {selectedPlanId && formData ? (
                <>
                  <h3 className="text-xl font-bold mb-4">Editando: {formData.name}</h3>
                  <PlanForm />
                </>
              ) : (
                <p className="text-center text-gray-500 mt-4">
                  {plans.length > 0 ? 'Hacé clic en un plan para editarlo.' : ''}
                </p>
              )}
            </div>
          )}

          {activeSection === 'create' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Crear Nuevo Plan de Suscripción</h2>
              {formData ? <PlanForm isCreate /> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditSubscriptionsPage;