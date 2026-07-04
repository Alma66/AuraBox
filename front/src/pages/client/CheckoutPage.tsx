import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import api, { getResponseData } from '../../api/config';
import { User } from '../../types/user';

interface CartPlan {
  planId: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  deliveryFrequency: string;
  image: string;
  cashDiscount: number;
  transferDiscount: number;
}

interface CartEntry {
  cartItemId: number;
  idSubscriptionTypes: number;
  plan: CartPlan;
  club: { id: number; name: string };
}

const CheckoutPage: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartEntry[]>([]);
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
    instructions: '',
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('mercadopago');

  const paymentMethods = [
    { id: 'mercadopago', label: 'MercadoPago (Tarjeta/Débito)', icon: '💳' },
    { id: 'tarjeta', label: 'Tarjeta de Crédito/Débito', icon: '💳' },
    { id: 'transferencia', label: 'Transferencia Bancaria', icon: '🏦' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setError('Debes iniciar sesión para continuar.');
        setLoading(false);
        return;
      }
      try {
        const userResponse = await api.get('/users/me');
        const userData = getResponseData(userResponse);
        setAddress({
          street: userData.streetAddress || '',
          streetNumber: userData.addressNumber ? String(userData.addressNumber) : '',
          locality: userData.addressDetails || '',
          city: userData.city || '',
          postalCode: userData.postalCode || '',
          province: userData.province || '',
          instructions: '',
        });

        const cartResponse = await api.get('/cart-items');
        const cartData = getResponseData(cartResponse);
        if (Array.isArray(cartData) && cartData.length > 0) {
          setCartItems(cartData);
        } else {
          setError('Tu carrito está vacío. Agregá planes primero.');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar datos. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
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
    try {
      await api.post('/cart-items/checkout', {});
      setSuccess(true);
    } catch (err: any) {
      console.error('Error processing payment:', err);
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al procesar el pago. Intenta de nuevo.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const descuento = Math.max(item.plan.cashDiscount ?? 0, item.plan.transferDiscount ?? 0);
    return sum + item.plan.price * (1 - descuento / 100);
  }, 0);

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

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="text-red-600 mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error}</h2>
          <button onClick={() => navigate('/cart')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
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
            <button onClick={() => navigate('/')} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
              Volver al Inicio
            </button>
            <button onClick={() => navigate('/customer/profile')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
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
                {cartItems.map((item) => {
                  const descuento = Math.max(item.plan.cashDiscount ?? 0, item.plan.transferDiscount ?? 0);
                  const precioFinal = item.plan.price * (1 - descuento / 100);
                  return (
                    <div key={item.cartItemId} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <div>
                        <p className="font-semibold text-gray-800">{item.plan.name}</p>
                        <p className="text-xs text-gray-500">{item.club.name}</p>
                      </div>
                      <p className="font-semibold">${precioFinal.toLocaleString('es-AR')} ARS</p>
                    </div>
                  );
                })}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${subtotal.toLocaleString('es-AR')} ARS</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>${subtotal.toLocaleString('es-AR')} ARS</span>
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
              {error && user && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="street" placeholder="Calle/Av." value={address.street} onChange={handleAddressChange} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                <input type="text" name="streetNumber" placeholder="Número" value={address.streetNumber} onChange={handleAddressChange} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                <input type="text" name="locality" placeholder="Localidad/Barrio" value={address.locality} onChange={handleAddressChange} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-2" required />
                <input type="text" name="city" placeholder="Ciudad" value={address.city} onChange={handleAddressChange} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                <input type="text" name="postalCode" placeholder="Código Postal (ej. 1425)" value={address.postalCode} onChange={handleAddressChange} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                <input type="text" name="province" placeholder="Provincia" value={address.province} onChange={handleAddressChange} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                <textarea name="instructions" placeholder="Instrucciones adicionales (opcional)" value={address.instructions} onChange={handleAddressChange} rows={3} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-2" />
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Tus datos están pre-llenados. Confirma o edita si es necesario. Todos los envíos son gratuitos en Argentina.
              </p>
            </div>
          </div>
        </form>

        {!success && !loading && user && (
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
              {isProcessing ? 'Procesando Pago...' : `Pagar $${subtotal.toLocaleString('es-AR')} ARS`}
            </button>
            <div className="mt-4 space-x-4">
              <button type="button" onClick={() => navigate('/cart')} className="text-blue-600 hover:underline">← Volver al Carrito</button>
              <button type="button" onClick={() => navigate('/explore')} className="text-purple-600 hover:underline">Continuar Comprando</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;