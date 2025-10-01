import React, { useState } from 'react';
import { Club, SubscriptionPlan } from '../../types/club';
import SubscriptionPlanCard from '../../components/club/SubscriptionPlanCard';

interface ManagePromotionsContentProps {
  activeSection: string;
  club: Club;
  onUpdateClub: (updatedClub: Club) => void;
}

const ManagePromotionsContent: React.FC<ManagePromotionsContentProps> = ({ activeSection, club, onUpdateClub }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(club.subscriptionPlans);
  const [historial, setHistorial] = useState([
    { id: 'hist-1', fecha: '2024-06-01', plan: 'Mensual Clásica', descuento: '10%', tipo: 'Transferencia', activo: false },
    { id: 'hist-2', fecha: '2024-05-15', plan: 'Semestral Premium', descuento: '15%', tipo: 'Efectivo', activo: false }
  ]);
  const [promoEspecial, setPromoEspecial] = useState({ texto: '¡Suscríbete ahora y recibe un regalo sorpresa!', activo: true });

  const updatePlanDiscount = (planId: string, descuentoTransferencia: number, descuentoEfectivo: number, activo: boolean) => {
    const updatedPlans = plans.map(plan =>
      plan.planId === planId
        ? { ...plan, descuentoTransferencia, descuentoEfectivo, activo }
        : plan
    );
    setPlans(updatedPlans);
    const updatedClub = { ...club, subscriptionPlans: updatedPlans };
    onUpdateClub(updatedClub);
    // En backend: PUT /api/clubs/:id/plans/:planId
  };

  const addToHistorial = (planName: string, descuento: string, tipo: string) => {
    const newHist = { id: `hist-${Date.now()}`, fecha: new Date().toISOString().split('T')[0], plan: planName, descuento, tipo, activo: false };
    setHistorial([...historial, newHist]);
  };

  switch (activeSection) {
    case 'promociones':
      return (
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-bold mb-4">Promociones Activas</h2>
          <p className="text-gray-600 mb-6">Gestiona descuentos para cada plan de suscripción. Solo planes activos se muestran a clientes.</p>
          <div className="space-y-6">
            {plans.filter(p => p.activo).map((plan) => (
              <div key={plan.planId} className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Descuento Transferencia (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={plan.descuentoTransferencia || 0}
                      onChange={(e) => updatePlanDiscount(plan.planId, parseInt(e.target.value), plan.descuentoEfectivo || 0, plan.activo || true)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Descuento Efectivo (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={plan.descuentoEfectivo || 0}
                      onChange={(e) => updatePlanDiscount(plan.planId, plan.descuentoTransferencia || 0, parseInt(e.target.value), plan.activo || true)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={plan.activo || false}
                        onChange={(e) => updatePlanDiscount(plan.planId, plan.descuentoTransferencia || 0, plan.descuentoEfectivo || 0, e.target.checked)}
                        className="mr-2"
                      />
                      Activo
                    </label>
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-md font-semibold mb-2">Vista Previa para Clientes:</h4>
                  <SubscriptionPlanCard
                    plan={{ ...plan, descuentoTransferencia: plan.descuentoTransferencia, descuentoEfectivo: plan.descuentoEfectivo, activo: plan.activo }}
                    clubName={club.name}
                    detailsLink={`/club/${club.id}/plan/${plan.planId}`}
                  />
                </div>
                <button
                  onClick={() => addToHistorial(plan.name, `${Math.max(plan.descuentoTransferencia || 0, plan.descuentoEfectivo || 0)}%`, 'Transferencia/Efectivo')}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Guardar y Archivar
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    case 'historial':
      return (
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-bold mb-4">Historial de Promociones</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historial.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.plan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.descuento}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tipo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {item.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case 'especiales':
      return (
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-bold mb-4">Promociones Especiales</h2>
          <p className="text-gray-600 mb-4">Crea mensajes personalizados que aparecen en las tarjetas de planes (ej. "¡Regalo gratis!")</p>
          <div className="border p-6 rounded-lg">
            <textarea
              value={promoEspecial.texto}
              onChange={(e) => setPromoEspecial({ ...promoEspecial, texto: e.target.value })}
              placeholder="Ej: Suscríbete hoy y recibe un 20% off en tu primera caja + envío gratis"
              className="w-full p-3 border rounded-lg mb-4"
              rows={3}
            />
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={promoEspecial.activo}
                onChange={(e) => setPromoEspecial({ ...promoEspecial, activo: e.target.checked })}
                className="mr-2"
              />
              Mostrar en todas las tarjetas de planes
            </label>
            <button
              onClick={() => {
                const updatedClub = { ...club, /* agregar campo promoEspecial si se extiende el type */ };
                onUpdateClub(updatedClub);
                alert('Promoción especial guardada');
              }}
              className="bg-purple-600 text-white px-6 py-2 rounded"
            >
              Guardar Promoción Especial
            </button>
          </div>
          <div className="mt-6">
            <h4 className="text-md font-semibold mb-2">Vista Previa:</h4>
            {plans.slice(0, 1).map((plan) => (
              <div key={plan.planId} className="mb-4">
                <SubscriptionPlanCard
                  plan={plan}
                  clubName={club.name}
                  detailsLink={`/club/${club.id}/plan/${plan.planId}`}
                />
                {promoEspecial.activo && (
                  <p className="text-purple-600 font-semibold mt-2">{promoEspecial.texto}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return <div>Sección no encontrada</div>;
  }
};

export default ManagePromotionsContent;