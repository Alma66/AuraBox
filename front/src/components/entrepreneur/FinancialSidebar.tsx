import React, { useState } from 'react';

interface FinancialSidebarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  categories: string[];
  onDateFilterChange: (from: string, to: string) => void;
  onStatusFilterChange: (status: string) => void;
}

const FinancialSidebar: React.FC<FinancialSidebarProps> = ({ 
  activeFilter, 
  setActiveFilter, 
  categories, 
  onDateFilterChange, 
  onStatusFilterChange 
}) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const sidebarItems = [
    { id: 'all', label: 'Todos los Movimientos', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-9 6v-5.375A4.374 4.374 0 0015 3H9a3.375 3.375 0 00-3.375 3.375V13' },
    ...categories.map(cat => ({ 
      id: cat, 
      label: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' '), 
      icon: 'M9 12h3m0 0l3-3m-3 3l3 3m0 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' 
    })),
    { id: 'ingresos', label: 'Solo Ingresos', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' },
    { id: 'egresos', label: 'Solo Egresos', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' },
  ];

  const handleApplyDateFilter = () => {
    onDateFilterChange(dateFrom, dateTo);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    onStatusFilterChange(e.target.value);
  };

  return (
    <nav className="bg-white rounded-xl shadow-lg p-6 w-full lg:w-64">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Filtros Financieros</h3>
      
      <ul className="space-y-2 mb-6">
        {sidebarItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setActiveFilter(item.id)}
              className={`w-full flex items-center p-3 rounded-lg text-left font-medium transition-colors duration-200 
                ${activeFilter === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}`}
            >
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-3 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Fecha</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          />
        </div>
        <button
          onClick={handleApplyDateFilter}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Aplicar Filtro de Fecha
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Estado</label>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        >
          <option value="todos">Todos los Estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="pagado">Pagado</option>
          <option value="procesado">Procesado</option>
        </select>
      </div>
    </nav>
  );
};

export default FinancialSidebar;