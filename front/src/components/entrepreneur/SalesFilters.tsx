import React from 'react';
import { Subscription } from '../../types/subscription';

interface SalesFiltersProps {
  filters: { month: string; plan: string; status: string };
  setFilters: (filters: { month: string; plan: string; status: string }) => void;
  subscriptions?: Subscription[];
}

const SalesFilters: React.FC<SalesFiltersProps> = ({ filters, setFilters, subscriptions }) => {
  const months = ['all', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const plans = subscriptions ? Array.from(new Set(subscriptions.map(s => s.planId))) : ['all', 'plan-ml-1', 'plan-bv-1'];
  const statuses = ['all', 'active', 'paused', 'cancelled'];

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros de Reportes</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
          <select 
            value={filters.month} 
            onChange={(e) => handleFilterChange('month', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {months.map(m => (
              <option key={m} value={m}>{m === 'all' ? 'Todos' : `Mes ${m}`}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
          <select 
            value={filters.plan} 
            onChange={(e) => handleFilterChange('plan', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            {plans.map(p => (
              <option key={p} value={p}>{p === 'all' ? 'Todos' : p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      <button 
        onClick={() => setFilters({ month: 'all', plan: 'all', status: 'all' })} 
        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      >
        Limpiar Filtros
      </button>
    </div>
  );
};

export default SalesFilters;