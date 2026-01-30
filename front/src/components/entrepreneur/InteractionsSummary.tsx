interface InteractionsSummaryProps {
  analytics: { views: number; likes: number; favorites: number };
}

const InteractionsSummary: React.FC<InteractionsSummaryProps> = ({ analytics }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Interacciones Digitales</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{analytics.views.toLocaleString()}</p>
          <p className="text-gray-600">Visualizaciones de Perfil</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{analytics.likes}</p>
          <p className="text-gray-600">Me Gusta en Reseñas</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">{analytics.favorites}</p>
          <p className="text-gray-600">Clubes Favoritos</p>
        </div>
      </div>
    </div>
  );
};

export default InteractionsSummary;