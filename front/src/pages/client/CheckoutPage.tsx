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

const POSTAL_CODE_PATTERN = /^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/;

const PAYMENT_METHODS = [
  { id: 'mercadopago', label: 'MercadoPago (Tarjeta/Débito)', icon: '💳' },
  { id: 'tarjeta', label: 'Tarjeta de Crédito/Débito', icon: '💳' },
  { id: 'transferencia', label: 'Transferencia Bancaria', icon: '🏦' },
];

const fieldClass =
  'p-3 border border-aurora-navy/15 rounded-xl focus:ring-2 focus:ring-aurora-terracotta focus:border-transparent';

const discountFor = (plan: CartPlan, method: string) =>
  method === 'transferencia' ? plan.transferDiscount ?? 0 : 0;

const money = (value: number) => `$${(Math.round(value * 100) / 100).toLocaleString('es-AR')} ARS`;

const CheckoutPage: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postalError, setPostalError] = useState<string | null>(null);

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
          locality: '',
          city: userData.city || '',
          postalCode: userData.postalCode || '',
          province: userData.province || '',
          instructions: userData.addressDetails || '',
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
    if (name === 'postalCode') setPostalError(null);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    if (cartItems.length === 0) {
      setError('Carrito vacío.');
      return;
    }
    const requiredFields = [address.street, address.streetNumber, address.locality, address.city, address.province];
    if (requiredFields.some((value) => !value.trim())) {
      setError('Completá todos los campos de la dirección.');
      return;
    }
    if (!POSTAL_CODE_PATTERN.test(address.postalCode.trim())) {
      setPostalError('Ingresá un código postal válido, por ejemplo 1425 o C1425ABC.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    setPostalError(null);
    try {
      await api.post('/cart-items/checkout', {
        paymentMethod: selectedPaymentMethod,
        address: {
          street: address.street.trim(),
          streetNumber: address.streetNumber.trim(),
          locality: address.locality.trim(),
          city: address.city.trim(),
          postalCode: address.postalCode.trim(),
          province: address.province.trim(),
          instructions: address.instructions.trim(),
        },
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Error processing payment:', err);
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al procesar el pago. Intenta de nuevo.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const priceOf = (item: CartEntry) => item.plan.price * (1 - discountFor(item.plan, selectedPaymentMethod) / 100);
  const subtotal = cartItems.reduce((sum, item) => sum + priceOf(item), 0);
  const originalTotal = cartItems.reduce((sum, item) => sum + item.plan.price, 0);
  const savings = originalTotal - subtotal;
  const transferHasDiscount = cartItems.some((item) => (item.plan.transferDiscount ?? 0) > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora-cream py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aurora-terracotta mx-auto mb-4"></div>
          <p className="text-aurora-navy/70">Preparando tu compra...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-aurora-cream py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="text-red-600 mb-4 text-4xl">⚠️</div>
          <h2 className="text-2xl font-serif font-bold text-aurora-navy mb-4">{error}</h2>
          <button onClick={() => navigate('/cart')} className="bg-aurora-terracotta text-white px-6 py-3 rounded-xl hover:bg-aurora-terracottaDark transition-colors font-semibold">
            Volver al Carrito
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-aurora-cream py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-4xl font-serif font-bold text-aurora-navy mb-4">¡Pago Realizado Exitosamente!</h1>
          <p className="text-aurora-navy/70 mb-8 max-w-md mx-auto">
            Tu orden ha sido procesada. Podés seguir el estado de tus suscripciones desde tu cuenta. ¡Gracias por tu compra en AuraBox!
          </p>
          <div className="space-x-4">
            <button onClick={() => navigate('/')} className="bg-aurora-terracotta text-white px-6 py-3 rounded-xl hover:bg-aurora-terracottaDark transition-colors font-semibold">
              Volver al Inicio
            </button>
            <button onClick={() => navigate('/customer/subscriptions')} className="bg-aurora-navy text-white px-6 py-3 rounded-xl hover:bg-aurora-navy/90 transition-colors font-semibold">
              Ver Mis Suscripciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurora-cream py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-aurora-navy mb-2">Finalizar Compra</h1>
          <p className="text-aurora-navy/70">Revisá tu información y realizá el pago seguro.</p>
        </div>

        <form id="checkout-form" onSubmit={handlePaymentSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6">
              <h2 className="text-xl font-serif font-bold text-aurora-navy mb-4">Resumen de tu Orden</h2>
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => {
                  const discount = discountFor(item.plan, selectedPaymentMethod);
                  return (
                    <div key={item.cartItemId} className="flex justify-between items-center py-2 border-b border-aurora-navy/10 last:border-b-0">
                      <div>
                        <p className="font-semibold text-aurora-navy">{item.plan.name}</p>
                        <p className="text-xs text-aurora-navy/50">
                          {item.club.name} · {item.plan.deliveryFrequency}
                        </p>
                      </div>
                      <div className="text-right">
                        {discount > 0 && (
                          <p className="text-xs text-aurora-navy/40 line-through">{money(item.plan.price)}</p>
                        )}
                        <p className="font-semibold text-aurora-navy">{money(priceOf(item))}</p>
                      </div>
                    </div>
                  );
                })}
                <div className="border-t border-aurora-navy/10 pt-3 space-y-2">
                  <div className="flex justify-between text-aurora-navy/70">
                    <span>Subtotal</span>
                    <span>{money(originalTotal)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Descuento por transferencia</span>
                      <span>-{money(savings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-aurora-navy">
                    <span>Total</span>
                    <span>{money(subtotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6">
              <h3 className="text-lg font-serif font-bold text-aurora-navy mb-4">Método de Pago</h3>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label key={method.id} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${
                    selectedPaymentMethod === method.id ? 'border-aurora-terracotta bg-aurora-terracotta/5' : 'border-aurora-navy/15 hover:border-aurora-terracotta/40'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mr-3 text-aurora-terracotta focus:ring-aurora-terracotta"
                    />
                    <div>
                      <span className="text-sm font-semibold text-aurora-navy">{method.icon} {method.label}</span>
                      <p className="text-xs text-aurora-navy/50">
                        {method.id === 'transferencia' && transferHasDiscount
                          ? 'Con descuento en los planes que lo incluyen'
                          : 'Procesado de forma segura'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6">
              <h3 className="text-lg font-serif font-bold text-aurora-navy mb-4">Verificar Dirección de Envío</h3>
              {error && user && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="street" aria-label="Calle o avenida" placeholder="Calle/Av." value={address.street} onChange={handleAddressChange} className={fieldClass} required />
                <input type="text" name="streetNumber" aria-label="Número" placeholder="Número" value={address.streetNumber} onChange={handleAddressChange} className={fieldClass} required />
                <input type="text" name="locality" aria-label="Localidad o barrio" placeholder="Localidad/Barrio" value={address.locality} onChange={handleAddressChange} className={`${fieldClass} md:col-span-2`} required />
                <input type="text" name="city" aria-label="Ciudad" placeholder="Ciudad" value={address.city} onChange={handleAddressChange} className={fieldClass} required />
                <div>
                  <input
                    type="text"
                    name="postalCode"
                    aria-label="Código postal"
                    aria-invalid={postalError !== null}
                    aria-describedby={postalError ? 'postal-error' : undefined}
                    placeholder="Código Postal (ej. 1425)"
                    value={address.postalCode}
                    onChange={handleAddressChange}
                    className={`${fieldClass} w-full`}
                    required
                  />
                  {postalError && (
                    <p id="postal-error" role="alert" className="mt-1 text-xs text-red-600">
                      {postalError}
                    </p>
                  )}
                </div>
                <input type="text" name="province" aria-label="Provincia" placeholder="Provincia" value={address.province} onChange={handleAddressChange} className={fieldClass} required />
                <textarea name="instructions" aria-label="Instrucciones adicionales" placeholder="Referencias o instrucciones adicionales (opcional)" value={address.instructions} onChange={handleAddressChange} rows={3} className={`${fieldClass} md:col-span-2`} />
              </div>
              <p className="text-sm text-aurora-navy/50 mt-4">
                Tus datos están pre-llenados. Confirmá o editá si es necesario. Todos los envíos son gratuitos en Argentina.
              </p>
            </div>
          </div>
        </form>

        {!loading && user && (
          <div className="mt-8 text-center">
            <button
              type="submit"
              form="checkout-form"
              disabled={isProcessing || cartItems.length === 0}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                isProcessing || cartItems.length === 0
                  ? 'bg-aurora-navy/30 cursor-not-allowed text-white'
                  : 'bg-aurora-terracotta hover:bg-aurora-terracottaDark text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isProcessing ? 'Procesando Pago...' : `Pagar ${money(subtotal)}`}
            </button>
            <div className="mt-4 space-x-4">
              <button type="button" onClick={() => navigate('/cart')} className="text-aurora-navy hover:underline font-semibold">← Volver al Carrito</button>
              <button type="button" onClick={() => navigate('/explore')} className="text-aurora-terracotta hover:underline font-semibold">Continuar Comprando</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;