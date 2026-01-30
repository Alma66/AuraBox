import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import clubPlansData from '../../data/clubPlans.json';
import { SubscriptionPlan } from '../../types/club';
import { User } from '../../types/user';

const CheckoutPage: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [address, setAddress] = useState({
    street: '',
    streetNumber: '',
    locality: '',
    city: '',
    postalCode: '',
    province: '',
    instructions: ''
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('mercadopago');

  const paymentMethods = [
    { id: 'mercadopago', label: 'MercadoPago (Tarjeta/Débito)', icon: '💳' },
    { id: 'tarjeta', label: 'Tarjeta de Crédito/Débito', icon: '💳' },
    { id: 'transferencia', label: 'Transferencia Bancaria', icon: '🏦' }
  ];

  useEffect(() => {
    if (!user) {
      setError('Debes iniciar sesión para continuar.');
      setLoading(false);
      return;
    }

    setAddress({
      street: user.street || 'Av. Santa Fe',
      streetNumber: user.streetNumber || '1234',
      locality: user.locality || 'Palermo',
      city: user.city || 'Buenos Aires',
      postalCode: user.postalCode || '1425',
      province: user.country || 'Buenos Aires',
      instructions: ''
    });

    const simulatedCart = (clubPlansData as SubscriptionPlan[]).slice(0, 2);
    setCartItems(simulatedCart);
    setLoading(false);

    if (simulatedCart.length === 0) {
      setError('Tu carrito está vacío. Agrega planes primero.');
    }
  }, [user]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    if (name === 'postalCode' && !/^\d{4}$/.test(value)) {
      setError('El código postal debe tener 4 dígitos.');
    } else {
      setError(null);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError('Carrito vacío.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 2000));

    setSuccess(true);
    setIsProcessing(false);
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando tu compra...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="text-red-600 mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error}</h2>
          <button
            onClick={() => navigate('/cart')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Carrito
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="animate-bounce text-green-600 mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">¡Pago Realizado Exitosamente!</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Tu orden ha sido procesada. Recibirás un email de confirmación en breve. ¡Gracias por tu compra en AuraBox!
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Volver al Inicio
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Mis Órdenes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Finalizar Compra</h1>
          <p className="text-gray-600">Revisa tu información y realiza el pago seguro.</p>
        </div>

        <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen de tu Orden</h2>
              <div className="space-y-3 mb-6">
                {cartItems.map((plan) => (
                  <div key={plan.planId} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div>
                      <p className="font-semibold text-gray-800">{plan.name}</p>
                      <p className="text-sm text-gray-600">{plan.description.slice(0, 50)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${plan.price.toLocaleString()} ARS</p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${subtotal.toLocaleString()} ARS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className="text-green-600">Gratis</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>${total.toLocaleString()} ARS</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Método de Pago</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label key={method.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mr-3 text-blue-600"
                    />
                    <div>
                      <span className="text-sm font-semibold">{method.icon} {method.label}</span>
                      <p className="text-xs text-gray-500">Procesado de forma segura</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Verificar Dirección de Envío</h3>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="street"
                  placeholder="Calle/Av."
                  value={address.street}
                  onChange={handleAddressChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  name="streetNumber"
                  placeholder="Número"
                  value={address.streetNumber}
                  onChange={handleAddressChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  name="locality"
                  placeholder="Localidad/Barrio"
                  value={address.locality}
                  onChange={handleAddressChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-2"
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="Ciudad"
                  value={address.city}
                  onChange={handleAddressChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Código Postal (ej. 1425)"
                  value={address.postalCode}
                  onChange={handleAddressChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  name="province"
                  placeholder="Provincia"
                  value={address.province}
                  onChange={handleAddressChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <textarea
                  name="instructions"
                  placeholder="Instrucciones adicionales (opcional)"
                  value={address.instructions}
                  onChange={handleAddressChange}
                  rows={3}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-2"
                />
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Tus datos están pre-llenados. Confirma o edita si es necesario. Todos los envíos son gratuitos en Argentina.
              </p>
            </div>
          </div>
        </form>

        {!success && !loading && (
          <div className="mt-8 text-center">
            <button
              type="submit"
              onClick={handlePaymentSubmit}
              disabled={isProcessing || cartItems.length === 0}
              className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
                isProcessing || cartItems.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white inline-block mr-2"></div>
                  Procesando Pago...
                </>
              ) : (
                `Pagar $${total.toLocaleString()} ARS`
              )}
            </button>
            <div className="mt-4 space-x-4">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="text-blue-600 hover:underline"
              >
                ← Volver al Carrito
              </button>
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="text-purple-600 hover:underline"
              >
                Continuar Comprando
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;