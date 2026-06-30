import React from 'react';

interface FinancialSidebarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  categories: string[];
  dateFrom: string;
  dateTo: string;
  onDateFilterChange: (from: string, to: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

const FinancialSidebar: React.FC<FinancialSidebarProps> = ({
  activeFilter, setActiveFilter, categories, dateFrom, dateTo, onDateFilterChange, statusFilter, onStatusFilterChange,
}) => {
  return (
    <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-5">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Tipo</p>
        <div className="space-y-1">
          {[
            { id: 'all', label: 'Todos los movimientos' },
            { id: 'ingresos', label: 'Ingresos' },
            { id: 'egresos', label: 'Egresos' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveFilter(opt.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeFilter === opt.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Categoría</p>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeFilter === cat ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Estado</p>
        <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="todos">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Confirmado">Confirmado</option>
          <option value="Pagado">Pagado</option>
        </select>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Rango de fechas</p>
        <input type="date" value={dateFrom} onChange={(e) => onDateFilterChange(e.target.value, dateTo)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2" />
        <input type="date" value={dateTo} onChange={(e) => onDateFilterChange(dateFrom, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
      </div>
    </nav>
  );
};

export default FinancialSidebar;