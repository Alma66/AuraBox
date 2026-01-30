import React from 'react';
import { Subscription } from '../../types/subscription';

interface SalesChartProps {
  subscriptions: Subscription[];
}

const SalesChart: React.FC<SalesChartProps> = ({ subscriptions }) => {
  const monthlySales = subscriptions.reduce((acc, sub) => {
    const month = new Date(sub.startDate).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(monthlySales).map(([month, count]) => ({ month, sales: count }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendencia de Ventas Mensuales</h3>
      <div className="h-80 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
        <svg className="w-64 h-64 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 18h18v-6a2 2 0 012-2h6a2 2 0 012 2v6h18M3 24h18v6a2 2 0 01-2 2h-6a2 2 0 01-2-2v-6H3m18 0h18" />
        </svg>
        <p className="text-gray-500 mt-4">Gráfico de Ventas: {chartData.length} meses con {Object.values(monthlySales).reduce((a, b) => a + b, 0)} ventas totales</p>
        <p className="text-sm text-gray-400 mt-2">Implementar con Chart.js o Recharts para visualización real (datos: {JSON.stringify(monthlySales)})</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {Object.entries(monthlySales).map(([month, count]) => (
          <span key={month} className="bg-blue-100 px-2 py-1 rounded text-blue-800">
            {month}: {count} ventas
          </span>
        ))}
      </div>
    </div>
  );
};

export default SalesChart;