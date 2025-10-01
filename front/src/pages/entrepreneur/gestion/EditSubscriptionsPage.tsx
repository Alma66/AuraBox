// src/pages/entrepreneur/EditSubscriptionsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import clubsData from '../../../data/clubs.json';
import { SubscriptionPlan } from '../../../types/club';
import SubscriptionPlanCard from '../../../components/club/SubscriptionPlanCard';
import EntrepreneurSubscriptionSidebar from '../../../components/entrepreneur/EntrepreneurSubscriptionSidebar';

const FREQUENCY_OPTIONS = ['Única', 'Mensual', 'Trimestral', 'Cuatrimestral', 'Semestral', 'Anual'];

const EditSubscriptionsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();

  // Estado local para club y planes
  const [club, setClub] = useState<any>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSection, setActiveSection] = useState<string>('management'); // Tab activo: 'management' o 'create'
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    const foundClub = clubsData.find(c => c.id === clubId);
    console.log('Club encontrado para clubId:', clubId, foundClub); // Debug temporal: verifica si carga el club
    if (foundClub) {
      setClub(foundClub);
      setPlans(foundClub.subscriptionPlans || []);
      console.log('Planes cargados:', foundClub.subscriptionPlans || []); // Debug: ve los planes
    }
  }, [clubId]);

  // Seleccionar plan para editar (solo en tab 'management')
  const handleSelectPlan = (planId: string) => {
    if (activeSection !== 'management') return; // Solo permite selección en el tab de gestión
    setSelectedPlanId(planId);
    const plan = plans.find(p => p.planId === planId);
    if (plan) {
      setFormData({
        planId: plan.planId,
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price || 0,
        frequency: plan.deliveryFrequency || 'Mensual',
        descuentoTransferencia: plan.descuentoTransferencia || 0,
        descuentoEfectivo: plan.descuentoEfectivo || 0,
        activo: plan.activo !== undefined ? plan.activo : true,
      });
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Guardar cambios en el plan editado o nuevo
  const handleSavePlan = () => {
    if (!formData) return;
    let updatedPlans: SubscriptionPlan[]; // Tipado explícito para resolver TS7034 y TS7005
    if (selectedPlanId && activeSection === 'management') {
      // Editar plan existente
      updatedPlans = plans.map(p => {
        if (p.planId === formData.planId) {
          return {
            ...p,
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            deliveryFrequency: formData.frequency,
            descuentoTransferencia: Number(formData.descuentoTransferencia) || 0,
            descuentoEfectivo: Number(formData.descuentoEfectivo) || 0,
            activo: formData.activo,
          };
        }
        return p;
      });
    } else {
      // Crear nuevo plan
      const newPlanId = `plan-${Date.now()}`;
      const newPlan: SubscriptionPlan = {
        planId: newPlanId,
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        currency: 'ARS',
        deliveryFrequency: formData.frequency,
        includes: [],
        shippingAreas: '',
        specifications: [],
        image: '/assets/default-plan.jpg',
        descuentoTransferencia: Number(formData.descuentoTransferencia) || 0,
        descuentoEfectivo: Number(formData.descuentoEfectivo) || 0,
        activo: formData.activo,
      };
      updatedPlans = [...plans, newPlan];
      setSelectedPlanId(newPlanId); // Selecciona el nuevo para vista previa
    }
    setPlans(updatedPlans);
    setClub((prev: any) => ({ ...prev, subscriptionPlans: updatedPlans }));
    alert(activeSection === 'management' ? 'Plan actualizado correctamente.' : 'Nuevo plan creado correctamente.');
    // Resetear formulario si es creación
    if (activeSection === 'create') {
      setFormData(null);
      setSelectedPlanId(null);
    }
  };

  // Eliminar plan (solo en tab 'management')
  const handleDeletePlan = (planId: string | null) => {
    if (!planId || activeSection !== 'management') return;
    if (window.confirm('¿Estás seguro que deseas eliminar este plan? Esta acción no se puede deshacer.')) {
      const filteredPlans = plans.filter(p => p.planId !== planId);
      setPlans(filteredPlans);
      setClub((prev: any) => ({ ...prev, subscriptionPlans: filteredPlans }));
      if (selectedPlanId === planId) {
        setSelectedPlanId(null);
        setFormData(null);
      }
      alert('Plan eliminado.');
    }
  };

  // Inicializar formulario para nuevo plan (al cambiar a tab 'create')
  const initializeNewPlanForm = () => {
    setFormData({
      planId: null,
      name: '',
      description: '',
      price: 0,
      frequency: 'Mensual',
      descuentoTransferencia: 0,
      descuentoEfectivo: 0,
      activo: true,
    });
    setSelectedPlanId(null);
  };

  // Cambiar tab
  const handleTabChange = (section: string) => {
    setActiveSection(section);
    if (section === 'create') {
      initializeNewPlanForm();
    } else {
      setSelectedPlanId(null);
      setFormData(null);
    }
  };

  if (!club) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-lg font-semibold">Club no encontrado o no tienes permisos para editar suscripciones. Verifica el clubId en la URL.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Gestión de Suscripciones - {club.name}</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de navegación */}
        <div className="lg:w-1/4">
          <EntrepreneurSubscriptionSidebar 
            activeSection={activeSection} 
            setActiveSection={handleTabChange} 
          />
        </div>

        {/* Contenido principal */}
        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg p-8">
          {activeSection === 'management' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Gestión de Suscripciones</h2>
              {plans.length === 0 ? (
                <p className="text-center text-gray-600 mb-6">No hay planes creados. Crea uno nuevo desde el sidebar.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {/* Muestra TODOS los planes, sin filtro por activo (como en tu código original) */}
                  {plans.map(plan => (
                    <div 
                      key={plan.planId} 
                      className="relative cursor-pointer hover:shadow-lg transition-shadow" 
                      onClick={() => handleSelectPlan(plan.planId)}
                    >
                      <SubscriptionPlanCard
                        plan={plan}
                        clubName={club.name}
                        detailsLink={undefined} // No link externo, solo selección
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario de edición si hay un plan seleccionado */}
              {selectedPlanId && formData ? (
                <>
                  <h3 className="text-xl font-bold mb-4">Editando: {formData.name}</h3>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleSavePlan();
                    }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block font-semibold mb-1">Nombre del Plan</label>
                        <input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={e => handleInputChange('name', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="price" className="block font-semibold mb-1">Precio (ARS)</label>
                        <input
                          id="price"
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
                      <label htmlFor="description" className="block font-semibold mb-1">Descripción</label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={e => handleInputChange('description', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="frequency" className="block font-semibold mb-1">Frecuencia</label>
                        <select
                          id="frequency"
                          value={formData.frequency}
                          onChange={e => handleInputChange('frequency', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {FREQUENCY_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
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
                        id="activo"
                        type="checkbox"
                        checked={formData.activo}
                        onChange={e => handleInputChange('activo', e.target.checked)}
                        className="h-5 w-5 rounded"
                      />
                      <label htmlFor="activo" className="font-semibold">Plan Activo</label>
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                      >
                        Guardar Cambios
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlan(selectedPlanId)}
                        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
                      >
                        Eliminar Plan
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <p className="text-center text-gray-600">Selecciona un plan de la lista para editarlo.</p>
              )}
            </div>
          )}

          {activeSection === 'create' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Crear Nuevo Plan de Suscripción</h2>
              {formData ? (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSavePlan();
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block font-semibold mb-1">Nombre del Plan</label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={e => handleInputChange('name', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="price" className="block font-semibold mb-1">Precio (ARS)</label>
                      <input
                        id="price"
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
                    <label htmlFor="description" className="block font-semibold mb-1">Descripción</label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={e => handleInputChange('description', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="frequency" className="block font-semibold mb-1">Frecuencia</label>
                      <select
                        id="frequency"
                        value={formData.frequency}
                        onChange={e => handleInputChange('frequency', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {FREQUENCY_OPTIONS.map(option => (
                          <option key={option} value={option}>{option}</option>
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
                      id="activo"
                      type="checkbox"
                      checked={formData.activo}
                      onChange={e => handleInputChange('activo', e.target.checked)}
                      className="h-5 w-5 rounded"
                    />
                    <label htmlFor="activo" className="font-semibold">Plan Activo
                      New Chat
24 lines

                    </label>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                    >
                      Crear Plan
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-center text-gray-600">Usa el formulario para crear un nuevo plan.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default EditSubscriptionsPage;