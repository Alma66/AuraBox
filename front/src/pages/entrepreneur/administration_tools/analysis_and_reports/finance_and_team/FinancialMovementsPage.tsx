import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../App';
import FinancialSidebar from '../../../../../components/entrepreneur/FinancialSidebar';
import api, { getResponseData } from '../../../../../api/config';
import { FinancialMovement, MonthlyTotal, Invoice } from '../../../../../types/financial';

const FinancialMovementsPage: React.FC = () => {
  const { user, userRole } = useAuth();
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const actualClubId = clubId || user?.managedClubId;
  const [clubName, setClubName] = useState('Tu Club');

  const [movements, setMovements] = useState<FinancialMovement[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<Record<string, MonthlyTotal>>({});
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<'movimientos' | 'facturacion'>('movimientos');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredMovements, setFilteredMovements] = useState<FinancialMovement[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (userRole !== 'entrepreneur' || !actualClubId) {
        navigate('/');
        return;
      }

      try {
        const [clubResponse, movementsResponse, invoicesResponse] = await Promise.all([
          api.get(`/clubs/${actualClubId}`),
          api.get(`/clubs/${actualClubId}/financial-movements`),
          api.get(`/clubs/${actualClubId}/invoices`)
        ]);

        const clubData = getResponseData(clubResponse);
        const movementsData = getResponseData(movementsResponse);
        const invoicesData = getResponseData(invoicesResponse);

        setClubName(clubData.name || 'Tu Club');
        setMovements(movementsData.movements || []);
        setMonthlyTotals(movementsData.monthlyTotals || {});
        setFilteredMovements(movementsData.movements || []);
        setInvoices(invoicesData || []);
      } catch (error) {
        console.error("Error fetching financial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [actualClubId, userRole, navigate]);

  useEffect(() => {
    let filtered = [...movements];

    if (activeFilter !== 'all' && activeFilter !== 'ingresos' && activeFilter !== 'egresos') {
      filtered = filtered.filter(m => m.category === activeFilter);
    } else if (activeFilter === 'ingresos') {
      filtered = filtered.filter(m => m.type === 'ingreso');
    } else if (activeFilter === 'egresos') {
      filtered = filtered.filter(m => m.type === 'egreso');
    }

    if (dateFrom) {
      filtered = filtered.filter(m => new Date(m.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(m => new Date(m.date) <= new Date(dateTo));
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    setFilteredMovements(filtered);
  }, [activeFilter, dateFrom, dateTo, statusFilter, movements]);

  const categories = Array.from(new Set(movements.map(m => m.category)));
  
  const handleDateFilterChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleEditMovement = (movement: FinancialMovement) => {
    console.log('Editando movimiento:', movement);
  };

  const handleGenerateInvoice = () => {
    console.log('Generando nueva factura');
  };

  const renderMovementRow = (movement: FinancialMovement) => (
    <tr key={movement.id} className="border-b hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {new Date(movement.date).toLocaleDateString('es-AR')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.description}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{movement.category.replace(/_/g, ' ')}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{movement.type}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
        {movement.amount > 0 ? `+$${movement.amount.toLocaleString()}` : `-$${Math.abs(movement.amount).toLocaleString()}`}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          movement.status === 'confirmado' ? 'bg-green-100 text-green-800' :
          movement.status === 'pagado' ? 'bg-blue-100 text-blue-800' :
          movement.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {movement.status}
        </span>
      </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button 
          onClick={() => handleEditMovement(movement)}
          className="text-blue-600 hover:text-blue-900 mr-3"
        >
          Editar
        </button>
        <button className="text-red-600 hover:text-red-900">Eliminar</button>
      </td>
    </tr>
  );

  const renderTotalsTable = () => (
    <div className="mt-6 overflow-x-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Totales Mensuales</h3>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Egresos</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(monthlyTotals).map(([month, totals]) => (
            <tr key={month} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{month}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">
                ${totals.ingresos.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                ${totals.egresos.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                ${totals.balance.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderFacturacionSection = () => (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Facturación y Pagos Pendientes</h3>
      <p className="text-gray-600 mb-4">Gestiona facturas emitidas, pendientes y pagadas. Total pendiente: ${invoices.filter(i => i.status === 'pendiente').reduce((sum, i) => sum + i.amount, 0).toLocaleString()} ARS.</p>
      <button 
        onClick={handleGenerateInvoice}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
      >
        Generar Nueva Factura
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Factura ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente ID</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map(invoice => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(invoice.date).toLocaleDateString('es-AR')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.clientId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">${invoice.amount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    invoice.status === 'pagada' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Ver PDF</button>
                  <button className="text-green-600 hover:text-green-900 mr-3">Marcar Pagada</button>
                  <button className="text-red-600 hover:text-red-900">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-center py-20">Cargando movimientos financieros...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <FinancialSidebar
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            categories={categories}
            onDateFilterChange={handleDateFilterChange}
            onStatusFilterChange={handleStatusFilterChange}
          />
        </div>

        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión Financiera - {clubName}</h1>
          
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('movimientos')}
              className={`px-6 py-2 font-medium border-b-2 ${
                activeTab === 'movimientos' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Movimientos Financieros
            </button>
            <button
              onClick={() => setActiveTab('facturacion')}
              className={`ml-8 px-6 py-2 font-medium border-b-2 ${
                activeTab === 'facturacion' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Facturación y Pagos
            </button>
          </div>

          {activeTab === 'movimientos' ? (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Historial de Movimientos</h2>
              <p className="text-gray-600 mb-6">Total movimientos filtrados: {filteredMovements.length}. Balance general: ${filteredMovements.reduce((sum, m) => sum + m.amount, 0).toLocaleString()} ARS.</p>
              
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMovements.map(renderMovementRow)}
                  </tbody>
                </table>
              </div>

              {renderTotalsTable()}
            </div>
          ) : (
            renderFacturacionSection()
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialMovementsPage;
