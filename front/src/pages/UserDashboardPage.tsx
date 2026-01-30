import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/config';
import { Subscription } from '../types/subscription';
import { Club } from '../types/club';
import { User } from '../types/user';
import LocationSection from '../components/common/LocationSection';

const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, subsResponse] = await Promise.all([
          api.get('/users/me'),
          api.get('/user-subscriptions'),
        ]);
        setUser(userResponse.data);
        setSubscriptions(subsResponse.data);
      } catch (err: any) {
        setError('Error al cargar datos. Intenta recargar.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    if (searchParams.get('showAddressModal') === 'true') {
      setShowAddressModal(true);
    }
  }, [searchParams]);

  const handleSaveAddress = async (addressData: any) => {
    try {
      await api.put('/users/me', { ...addressData });
      setUser({ ...user, ...addressData } as User);
      setShowAddressModal(false);
    } catch (err: any) {
      alert('Error al guardar dirección.');
    }
  };

  const handleSkipAddress = () => {
    setShowAddressModal(false);
  };

  if (loading) return <div className="text-center py-16">Cargando...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Bienvenido, {user?.firstName} {user?.lastName}
      </h1>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Mis Suscripciones</h2>
        {subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map(sub => {
              const clubName = 'Club'; 
              return (
                <div key={sub.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{clubName}</h3>
                  <p className="text-gray-600 mb-1">Estado: <span className={`font-semibold ${sub.status === 'active' ? 'text-green-600' : sub.status === 'paused' ? 'text-yellow-600' : 'text-red-600'}`}>{sub.status}</span></p>
                  <p className="text-gray-600 mb-1">Próximo cobro: {sub.nextBillingDate || 'N/A'}</p>
                  
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
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-600 text-lg">Aún no tienes suscripciones activas. ¡Explora nuestros clubes!</p>
        )}
      </section>

      <section className="text-center py-16 bg-purple-50 rounded-lg">
        <h2 className="text-3xl font-bold text-purple-800 mb-4">¿Quieres descubrir más?</h2>
        <p className="text-purple-700 text-lg mb-6">
          Encuentra tu próxima experiencia sorpresa en AuraBox.
        </p>
        <button
          onClick={() => navigate('/explore')}
          className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-purple-700 transition-colors duration-200 shadow-lg"
        >
          Explorar Clubes
        </button>
      </section>

      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Completa tu Dirección</h2>
              <button onClick={handleSkipAddress} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <LocationSection
              country={user?.country || ''}
              city={user?.city || ''}
              locality={user?.locality || ''}
              postalCode={user?.postalCode || ''}
              street={user?.street || ''}
              streetNumber={user?.streetNumber || ''}
              floor={user?.floor || ''}
              details={user?.details || ''}
              onSave={handleSaveAddress}
              isEntrepreneurProfile={false}
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button onClick={handleSkipAddress} className="bg-gray-500 text-white px-4 py-2 rounded">Omitir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboardPage;