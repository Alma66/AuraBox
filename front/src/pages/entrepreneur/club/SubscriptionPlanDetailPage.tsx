import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import { Club, SubscriptionPlan } from '../../../types/club';

const SubscriptionPlanDetailPage: React.FC = () => {
  const { clubId, planId } = useParams<{ clubId: string; planId: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [cr, pr] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/subscription-types/${planId}`),
        ]);
        const clubData = getResponseData(cr);
        const rawPlan = getResponseData(pr);
        setClub(clubData);
        if (rawPlan) {
          setPlan({
            planId: String(rawPlan.id),
            name: rawPlan.name ?? '',
            description: rawPlan.description ?? '',
            price: Number(rawPlan.basePrice ?? rawPlan.price ?? 0),
            currency: 'ARS',
            image: rawPlan.imageUrl ?? rawPlan.image ?? '/assets/default-plan.jpg',
            deliveryFrequency: rawPlan.frequency ?? rawPlan.deliveryFrequency ?? '',
            includes: rawPlan.includes ?? [],
            shippingAreas: rawPlan.shippingAreas ?? '',
            specifications: rawPlan.specifications ?? [],
            descuentoTransferencia: rawPlan.transferDiscount ? Number(rawPlan.transferDiscount) : 0,
            descuentoEfectivo: rawPlan.cashDiscount ? Number(rawPlan.cashDiscount) : 0,
            activo: rawPlan.active ?? true,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (clubId && planId) fetch();
  }, [clubId, planId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  if (!club || !plan) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <p className="text-2xl font-bold text-gray-700 mb-4">Plan no encontrado</p>
        <Link to={`/club/${clubId}`} className="text-indigo-600 hover:underline text-sm">Volver al club</Link>
      </div>
    </div>
  );

  const descuento = Math.max(plan.descuentoTransferencia ?? 0, plan.descuentoEfectivo ?? 0);
  const precioFinal = plan.price * (1 - descuento / 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-5 flex items-center gap-3">
          <Link to={`/club/${clubId}`} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{club.name}</p>
            <h1 className="text-2xl font-bold text-gray-900">{plan.name}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative">
            <img src={plan.image} alt={plan.name} className="w-full h-72 object-cover" />
            {!plan.activo && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Inactivo
              </div>
            )}
            {descuento > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                -{descuento}% OFF
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-1">{plan.name}</h2>
                <p className="text-sm text-indigo-600 font-medium">{plan.deliveryFrequency}</p>
              </div>
              <div className="text-right shrink-0">
                {descuento > 0 ? (
                  <>
                    <p className="text-gray-400 line-through text-lg">ARS {plan.price.toLocaleString('es-AR')}</p>
                    <p className="text-3xl font-extrabold text-green-600">ARS {precioFinal.toLocaleString('es-AR')}</p>
                    <p className="text-xs text-gray-500">Ahorrás {descuento}%</p>
                  </>
                ) : (
                  <p className="text-3xl font-extrabold text-gray-900">ARS {plan.price.toLocaleString('es-AR')}</p>
                )}
              </div>
            </div>

            {plan.description && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Descripción</h3>
                <p className="text-gray-700 leading-relaxed">{plan.description}</p>
              </div>
            )}

            {(plan.includes ?? []).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">¿Qué incluye?</h3>
                <ul className="space-y-2">
                  {plan.includes.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                      <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(plan.specifications ?? []).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Especificaciones</h3>
                <div className="flex flex-wrap gap-2">
                  {plan.specifications.map((spec, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                      {spec.type}: {spec.value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {plan.shippingAreas && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Zonas de envío</h3>
                <p className="text-gray-700 text-sm">{plan.shippingAreas}</p>
              </div>
            )}

            {descuento > 0 && (
              <div className="bg-indigo-50 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-indigo-800 mb-1">Descuentos disponibles</p>
                {(plan.descuentoTransferencia ?? 0) > 0 && (
                  <p className="text-sm text-indigo-700">• {plan.descuentoTransferencia}% pagando por transferencia</p>
                )}
                {(plan.descuentoEfectivo ?? 0) > 0 && (
                  <p className="text-sm text-indigo-700">• {plan.descuentoEfectivo}% pagando en efectivo</p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Link
                to={`/club/${clubId}`}
                className="flex-1 text-center px-6 py-3 text-sm font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Volver al club
              </Link>
              <button className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition">
                Suscribirme
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlanDetailPage;