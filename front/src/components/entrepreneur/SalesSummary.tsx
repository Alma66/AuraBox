// FileName: src/components/entrepreneur/SalesSummary.tsx
interface SalesSummaryProps {
  totalRevenue: number;
  activeCount: number;
  totalSales: number;
}

const SalesSummary: React.FC<SalesSummaryProps> = ({ totalRevenue, activeCount, totalSales }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow-lg">
      <div className="text-center">
        <p className="text-3xl font-bold text-blue-600">${totalRevenue.toLocaleString()}</p>
        <p className="text-gray-600 mt-1">Ingresos Totales</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-green-600">{activeCount}</p>
        <p className="text-gray-600 mt-1">Suscripciones Activas</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-purple-600">{totalSales}</p>
        <p className="text-gray-600 mt-1">Total de Ventas</p>
      </div>
    </div>
  );
};

export default SalesSummary;