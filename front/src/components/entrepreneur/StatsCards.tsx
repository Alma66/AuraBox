// FileName: src/components/entrepreneur/StatsCards.tsx
interface StatsCardsProps {
  subscribers: number;
  revenue: number;
  rating: number;
  boxesSent: number;
  growth: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ subscribers, revenue, rating, boxesSent, growth }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Suscriptores */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Suscriptores Activos</p>
            <p className="text-3xl font-bold">{subscribers.toLocaleString()}</p>
          </div>
          <svg className="w-12 h-12 opacity-75" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
          </svg>
        </div>
        <p className="text-blue-100 text-sm mt-2">+{growth}% vs. mes anterior</p>
      </div>

      {/* Facturación */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Facturación Mensual</p>
            <p className="text-3xl font-bold">${revenue.toLocaleString()}</p>
          </div>
          <svg className="w-12 h-12 opacity-75" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd"></path>
          </svg>
        </div>
        <p className="text-green-100 text-sm mt-2">Estimado para este mes</p>
      </div>

      {/* Rating */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Reseñas Promedio</p>
            <p className="text-3xl font-bold">{rating.toFixed(1)} ★</p>
          </div>
          <svg className="w-12 h-12 opacity-75" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        </div>
        <p className="text-purple-100 text-sm mt-2">Basado en reseñas verificadas</p>
      </div>

      {/* Envíos */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm font-medium">Envíos del Mes</p>
            <p className="text-3xl font-bold">{boxesSent.toLocaleString()}</p>
          </div>
          <svg className="w-12 h-12 opacity-75" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </div>
        <p className="text-yellow-100 text-sm mt-2">Cajas entregadas exitosamente</p>
      </div>
    </div>
  );
};

export default StatsCards;