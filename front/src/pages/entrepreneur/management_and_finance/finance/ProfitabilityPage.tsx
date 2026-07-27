import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import api, { getResponseData } from '../../../../api/config';
import { ProfitabilityBreakdownItem, ProfitabilityTotals } from '../../../../types/financial';

type SortKey = 'name' | 'revenue' | 'margin' | 'marginPercent';

const ProfitabilityPage: React.FC = () => {
  const { user, userRole } = useAuth();
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const actualClubId = clubId || user?.managedClubId;
  const [clubName, setClubName] = useState('Tu Club');

  const [breakdown, setBreakdown] = useState<ProfitabilityBreakdownItem[]>([]);
  const [totals, setTotals] = useState<ProfitabilityTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('revenue');

  const fetchData = useCallback(async () => {
    if (!actualClubId) return;
    setLoading(true);
    try {
      const [clubResponse, profitResponse] = await Promise.all([
        api.get(`/clubs/${actualClubId}`),
        api.get(`/finance/profitability/by-club/${actualClubId}`),
      ]);
      setClubName(getResponseData(clubResponse).name || 'Tu Club');
      const data = getResponseData(profitResponse);
      setBreakdown(data.breakdown || []);
      setTotals(data.totals || null);
    } catch (error) {
      console.error('Error fetching profitability data:', error);
    } finally {
      setLoading(false);
    }
  }, [actualClubId]);

  useEffect(() => {
    if (userRole !== 'entrepreneur' || !actualClubId) {
      navigate('/');
      return;
    }
    fetchData();
  }, [actualClubId, userRole, navigate, fetchData]);

  const sorted = useMemo(() => {
    const list = [...breakdown];
    list.sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'revenue') return b.revenue - a.revenue;
      if (sortKey === 'margin') return b.netMargin - a.netMargin;
      return b.marginPercent - a.marginPercent;
    });
    return list;
  }, [breakdown, sortKey]);

  if (loading) {
    return <div className="text-center py-20 text-aurora-navy/60">Cargando costos y rentabilidad...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <h1 className="text-2xl font-serif font-bold text-aurora-navy mb-2">Costos y Rentabilidad — {clubName}</h1>
      <p className="text-sm text-aurora-navy/60 mb-8">Margen real por suscripción: ingresos menos comisión AuraBox, costo de envío y una porción proporcional del gasto en insumos.</p>

      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <p className="text-lg font-bold text-emerald-700">${totals.totalRevenue.toLocaleString('es-AR')}</p>
            <p className="text-xs text-aurora-navy/60 mt-1">Ingresos totales</p>
          </div>
          <div className="bg-aurora-gold/10 rounded-xl p-4 text-center">
            <p className="text-lg font-bold text-aurora-terracottaDark">${totals.totalCommission.toLocaleString('es-AR')}</p>
            <p className="text-xs text-aurora-navy/60 mt-1">Comisión AuraBox</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <p className="text-lg font-bold text-orange-700">${totals.totalShipping.toLocaleString('es-AR')}</p>
            <p className="text-xs text-aurora-navy/60 mt-1">Costo de envío</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-lg font-bold text-red-700">${totals.totalInventoryCost.toLocaleString('es-AR')}</p>
            <p className="text-xs text-aurora-navy/60 mt-1">Gasto en insumos</p>
          </div>
          <div className="bg-aurora-navy/10 rounded-xl p-4 text-center">
            <p className="text-lg font-bold text-aurora-navy">${totals.totalNetMargin.toLocaleString('es-AR')}</p>
            <p className="text-xs text-aurora-navy/60 mt-1">Margen neto total</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-serif font-bold text-aurora-navy">Margen por suscripción</h2>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm">
            <option value="revenue">Ordenar: Ingresos</option>
            <option value="margin">Ordenar: Margen neto</option>
            <option value="marginPercent">Ordenar: Margen %</option>
            <option value="name">Ordenar: Nombre</option>
          </select>
        </div>

        <div className="overflow-x-auto border border-aurora-navy/10 rounded-xl">
          <table className="min-w-full divide-y divide-aurora-navy/10">
            <thead className="bg-aurora-cream">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Suscripción</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-aurora-navy/60 uppercase">Suscriptores activos</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-aurora-navy/60 uppercase">Ingresos</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-aurora-navy/60 uppercase">Comisión AuraBox</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-aurora-navy/60 uppercase">Envío</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-aurora-navy/60 uppercase">Insumos (prorrateado)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-aurora-navy/60 uppercase">Margen neto</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-aurora-navy/60 uppercase">Margen %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aurora-navy/10">
              {sorted.map((item) => (
                <tr key={item.idSubscriptionType} className={item.netMargin < 0 ? 'bg-red-50' : ''}>
                  <td className="px-4 py-3 text-sm font-medium text-aurora-navy">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-aurora-navy/70 text-right">{item.activeSubscribers}</td>
                  <td className="px-4 py-3 text-sm text-emerald-600 text-right">${item.revenue.toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-sm text-aurora-terracottaDark text-right">${item.auraboxCommission.toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-sm text-orange-600 text-right">${item.shippingCost.toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-sm text-red-500 text-right">${item.allocatedInventoryCost.toLocaleString('es-AR')}</td>
                  <td className={`px-4 py-3 text-sm font-semibold text-right ${item.netMargin >= 0 ? 'text-aurora-navy' : 'text-red-700'}`}>
                    ${item.netMargin.toLocaleString('es-AR')}
                  </td>
                  <td className={`px-4 py-3 text-sm font-semibold text-right ${item.marginPercent >= 0 ? 'text-aurora-navy' : 'text-red-700'}`}>
                    {item.marginPercent.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && <p className="text-center py-12 text-aurora-navy/50">Todavía no hay datos suficientes para calcular rentabilidad.</p>}
        </div>

        <p className="text-xs text-aurora-navy/40 mt-4">
          El costo de envío depende de que se cargue el campo "Costo de Envío" al gestionar cada entrega; si nunca lo cargaste, va a figurar en $0. El gasto en insumos no está atado a una suscripción puntual, así que se reparte proporcionalmente según el % de ingresos que genera cada una.
        </p>
      </div>
    </div>
  );
};

export default ProfitabilityPage;