// React y hooks
import React, { useState, useEffect } from 'react';

// React Router
import { useNavigate } from 'react-router-dom';

// Datos de usuarios, clubes y suscripciones
import usersData from '../data/user.json';
import clubsData from '../data/clubs.json';
import subscriptionsData from '../data/subscriptions.json';

// Componente principal del dashboard de usuario
const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const loggedInUserId = "user-1"; 
  const currentUser  = usersData.find(user => user.id === loggedInUserId);

  const userSubscriptions = subscriptionsData.filter(sub => sub.userId === loggedInUserId);

  // Verificación de usuario autenticado
  if (!currentUser ) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
        <p className="text-lg text-gray-700 mb-8">Por favor, inicia sesión para ver tu panel.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Bienvenido, {currentUser .firstName}!
      </h1>

      {/* Sección de suscripciones */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Mis Suscripciones</h2>
        {userSubscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userSubscriptions.map(sub => {
              const club = clubsData.find(c => c.id === sub.clubId);
              if (!club) return null; // En caso de que el club no se encuentre

              return (
                <div key={sub.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{club.name}</h3>
                  <p className="text-gray-600 mb-1">Categoría: {club.category}</p>
                  <p className="text-gray-600 mb-1">Estado: <span className={`font-semibold ${sub.status === 'active' ? 'text-green-600' : sub.status === 'paused' ? 'text-yellow-600' : 'text-red-600'}`}>{sub.status.toUpperCase()}</span></p>
                  <p className="text-gray-600 mb-1">Próximo cobro: {sub.nextBillingDate}</p>
                  <p className="text-gray-600 mb-4">Última caja: {sub.lastBoxReceived}</p>
                  
                  <div className="flex space-x-2">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                      Ver Detalles
                    </button>
                    {sub.status === 'active' && (
                      <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition-colors">
                        Pausar
                      </button>
                    )}
                    {sub.status !== 'cancelled' && (
                      <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors">
                        Cancelar
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Historial de Cajas ({sub.history.length})</h4>
                    <ul className="max-h-32 overflow-y-auto text-sm text-gray-700 custom-scrollbar">
                      {sub.history.map((item, index) => (
                        <li key={index} className="mb-1">
                          <span className="font-medium">{item.month}:</span> {item.boxContent} (Calificación: {item.rating}/5)
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-600 text-lg">Aún no tienes suscripciones activas. ¡Explora nuestros clubes!</p>
        )}
      </section>

      {/* Sección de exploración */}
      <section className="text-center py-16 bg-purple-50 rounded-lg">
        <h2 className="text-3xl font-bold text-purple-800 mb-4">¿Quieres descubrir más?</h2>
        <p className="text-purple-700 text-lg mb-6">
          Encuentra tu próxima experiencia sorpresa en AuraBox.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-purple-700 transition-colors duration-200 shadow-lg"
        >
          Explorar Clubes
        </button>
      </section>
    </div>
  );
};

export default UserDashboardPage;