import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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

interface BankInfo {
  clubId: number;
  clubName: string;
  holder: string | null;
  cbu: string | null;
  alias: string | null;
}

interface PaymentOptions {
  methods: string[];
  banks: BankInfo[];
  transferBlockedBy: string[];
}

const POSTAL_CODE_PATTERN = /^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/;

const PAYMENT_METHODS = [
  { id: 'mercadopago', label: 'MercadoPago (Tarjeta/Débito)', icon: '💳' },
  { id: 'tarjeta', label: 'Tarjeta de Crédito/Débito', icon: '💳' },
  { id: 'transferencia', label: 'Transferencia Bancaria', icon: '🏦' },
  { id: 'efectivo', label: 'Efectivo contra entrega', icon: '💵' },
];

const fieldClass =
  'p-3 border border-aurora-navy/15 rounded-xl focus:ring-2 focus:ring-aurora-terracotta focus:border-transparent';

const discountFor = (plan: CartPlan, method: string) => {
  if (method === 'transferencia') return plan.transferDiscount ?? 0;
  if (method === 'efectivo') return plan.cashDiscount ?? 0;
  return 0;
};

const money = (value: number) => `$${(Math.round(value * 100) / 100).toLocaleString('es-AR')} ARS`;

const CopyRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado.`);
    } catch {
      toast.error('No se pudo copiar.');
    }
  };
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-aurora-navy/50">{label}</p>
        <p className="break-all text-sm font-semibold text-aurora-navy">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="min-h-[44px] flex-shrink-0 rounded-lg border border-aurora-navy/15 px-3 text-xs font-semibold text-aurora-navy hover:bg-white"
      >
        Copiar
      </button>
    </div>
  );
};

const CheckoutPage: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartEntry[]>([]);
  const [options, setOptions] = useState<PaymentOptions>({ methods: [], banks: [], transferBlockedBy: [] });
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(false);
  const [paidInCash, setPaidInCash] = useState(false);
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
          const optionsResponse = await api.get('/cart-items/payment-options');
          const optionsData: PaymentOptions = getResponseData(optionsResponse);
          setOptions(optionsData);
          setSelectedPaymentMethod((current) =>
            optionsData.methods.includes(current) ? current : optionsData.methods[0] ?? '',
          );
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
    if (!selectedPaymentMethod) {
      setError('Elegí un medio de pago.');
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
      const res = await api.post('/cart-items/checkout', {
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
      const result = getResponseData(res);
      setPendingPayment(Boolean(result?.pendingPayment));
      setPaidInCash(Boolean(result?.cashOnDelivery));
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
  const availableMethods = PAYMENT_METHODS.filter((method) => options.methods.includes(method.id));
  const transferHasDiscount = cartItems.some((item) => (item.plan.transferDiscount ?? 0) > 0);
  const cashHasDiscount = cartItems.some((item) => (item.plan.cashDiscount ?? 0) > 0);
  const isTransfer = selectedPaymentMethod === 'transferencia';
  const isCash = selectedPaymentMethod === 'efectivo';

  const methodHint = (id: string) => {
    if (id === 'transferencia') {
      return transferHasDiscount ? 'Con descuento en los planes que lo incluyen' : 'Transferís a la cuenta del club';
    }
    if (id === 'efectivo') {
      return cashHasDiscount
        ? 'Pagás al recibir tu caja, con descuento en los planes que lo incluyen'
        : 'Pagás en efectivo al recibir tu caja';
    }
    return 'Pago simulado de demostración';
  };

  const successTitle = paidInCash
    ? '¡Compra confirmada!'
    : pendingPayment
      ? '¡Suscripción registrada!'
      : '¡Pago Realizado Exitosamente!';

  const successText = paidInCash
    ? 'Tu suscripción ya está activa. Vas a pagar en efectivo cuando recibas tu caja y el club va a registrar el cobro. Podés ver el estado en Mis Suscripciones.'
    : pendingPayment
      ? 'Tu suscripción queda pendiente de pago hasta que el club confirme tu transferencia. Podés ver el estado en Mis Suscripciones.'
      : 'Tu orden ha sido procesada. Podés seguir el estado de tus suscripciones desde tu cuenta. ¡Gracias por tu compra en AuraBox!';

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
          <h1 className="text-4xl font-serif font-bold text-aurora-navy mb-4">{successTitle}</h1>
          <p className="text-aurora-navy/70 mb-8 max-w-md mx-auto">{successText}</p>
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
          <p className="text-aurora-navy/70">Revisá tu información y realizá el pago.</p>
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
                      <span>{isCash ? 'Descuento por pago en efectivo' : 'Descuento por transferencia'}</span>
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
              {availableMethods.length === 0 ? (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Los planes de tu carrito no comparten un medio de pago. Quitá alguno del carrito para continuar.
                </p>
              ) : (
                <div className="space-y-3">
                  {availableMethods.map((method) => (
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
                        <p className="text-xs text-aurora-navy/50">{methodHint(method.id)}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {options.transferBlockedBy.length > 0 && (
                <p className="mt-3 text-xs text-aurora-navy/60">
                  La transferencia no está disponible porque {options.transferBlockedBy.join(', ')} todavía no cargó sus datos bancarios.
                </p>
              )}
              <p className="mt-4 rounded-lg bg-aurora-gold/10 px-3 py-2 text-xs text-aurora-navy/70">
                {isCash
                  ? 'No se cobra nada ahora. Pagás en efectivo al recibir cada caja y el club confirma el cobro.'
                  : 'Entorno de demostración: el pago es simulado y no se realiza ningún cobro real.'}
              </p>
            </div>

            {isTransfer && (
              <div className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6 space-y-4">
                <h3 className="text-lg font-serif font-bold text-aurora-navy">Datos para transferir</h3>
                <p className="text-xs text-aurora-navy/60">
                  Transferí el importe de cada club a su cuenta y después confirmá. En esta demostración, la confirmación simula que la transferencia llegó.
                </p>
                {options.banks.map((bank) => {
                  const amount = cartItems
                    .filter((item) => item.club.id === bank.clubId)
                    .reduce((sum, item) => sum + priceOf(item), 0);
                  return (
                    <div key={bank.clubId} className="space-y-3 rounded-xl bg-aurora-cream p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-aurora-navy">{bank.clubName}</p>
                        <p className="text-sm font-bold text-aurora-terracotta">{money(amount)}</p>
                      </div>
                      {bank.holder && <CopyRow label="Titular" value={bank.holder} />}
                      {bank.cbu && <CopyRow label="CBU" value={bank.cbu} />}
                      {bank.alias && <CopyRow label="Alias" value={bank.alias} />}
                    </div>
                  );
                })}
              </div>
            )}
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
              disabled={isProcessing || cartItems.length === 0 || !selectedPaymentMethod}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                isProcessing || cartItems.length === 0 || !selectedPaymentMethod
                  ? 'bg-aurora-navy/30 cursor-not-allowed text-white'
                  : 'bg-aurora-terracotta hover:bg-aurora-terracottaDark text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isProcessing
                ? 'Procesando...'
                : isTransfer
                  ? `Ya realicé la transferencia · ${money(subtotal)}`
                  : isCash
                    ? `Confirmar compra · ${money(subtotal)}`
                    : `Pagar ${money(subtotal)}`}
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