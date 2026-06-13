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
    const fetchData = async () => {
      try {
        const [clubResponse, plansResponse] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get('/subscription-types')
        ]);
        
        const clubData = getResponseData(clubResponse);
        const plansData = getResponseData(plansResponse);
        
        setClub(clubData);
        
        const foundPlan = plansData.find((p: any) => String(p.id) === String(planId));
        if (foundPlan) {
          setPlan({
            planId: String(foundPlan.id),
            name: foundPlan.name,
            price: foundPlan.price || 0,
            currency: foundPlan.currency || 'ARS',
            description: foundPlan.description || '',
            image: foundPlan.image || '/assets/default-plan.jpg',
            deliveryFrequency: foundPlan.deliveryFrequency || '',
            includes: foundPlan.includes || [],
            shippingAreas: foundPlan.shippingAreas || '',
            specifications: foundPlan.specifications || []
          });
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
      } finally {
        setLoading(false);
      }
    };
    if (clubId && planId) fetchData();
  }, [clubId, planId]);

  if (loading) {
    return <div className="text-center py-20">Cargando plan...</div>;
  }

  if (!club || !plan) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Plan o club no encontrado</h1>
        <Link to={`/club/${clubId}`} className="text-blue-600 hover:underline">Volver al club</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-white rounded-lg shadow-md max-w-4xl">
      <h1 className="text-4xl font-extrabold mb-4">{plan.name}</h1>
      <h2 className="text-xl font-semibold mb-2">{club.name}</h2>
      <img src={plan.image} alt={plan.name} className="w-full max-h-96 object-cover rounded-lg mb-6" />
      <p className="text-gray-700 mb-4">{plan.description}</p>
      <div className="mb-4">
        <span className="font-semibold">Precio: </span>
        {plan.currency} {plan.price.toLocaleString('es-AR')}
      </div>
      <div className="mb-4">
        <span className="font-semibold">Frecuencia de entrega: </span>
        {plan.deliveryFrequency}
      </div>
      {plan.includes && plan.includes.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">¿Qué incluye?</h3>
          <ul className="list-disc list-inside text-gray-700">
            {plan.includes.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>
      )}
      {plan.specifications && plan.specifications.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Especificaciones</h3>
          <ul className="list-disc list-inside text-gray-700">
            {plan.specifications.map((spec, idx) => <li key={idx}>{spec.type}: {spec.value}</li>)}
          </ul>
        </div>
      )}
      {plan.shippingAreas && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Zonas de envío</h3>
          <p>{plan.shippingAreas}</p>
        </div>
      )}
      <Link to={`/club/${clubId}`} className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
        Volver al Club
      </Link>
    </div>
  );
};

export default SubscriptionPlanDetailPage;