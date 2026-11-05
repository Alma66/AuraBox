import React, { useEffect, useState } from 'react';
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

interface ShippingCourier {
  id: number;
  name: string;
  isInternal: boolean;
  fee: number;
}

interface ShippingClub {
  clubId: number;
  clubName: string;
  couriers: ShippingCourier[];
  selectedCourierId: number | null;
}

interface ReceiptItem {
  planName: string;
  clubName: string;
  planAmount: number;
  shippingFee: number;
  courierName: string | null;
  total: number;
}

interface Receipt {
  reference: string;
  date: string;
  method: string;
  pending: boolean;
  total: number;
  shippingTotal: number;
  items: ReceiptItem[];
}

interface Address {
  street: string;
  streetNumber: string;
  locality: string;
  city: string;
  postalCode: string;
  province: string;
  instructions: string;
}

interface CardData {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
}

const POSTAL_CODE_PATTERN = /^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/;

const STEPS = ['Dirección', 'Envío', 'Pago', 'Revisión'];

const PAYMENT_METHODS = [
  { id: 'mercadopago', label: 'Mercado Pago', icon: '💳', hint: 'Tarjeta de crédito o débito' },
  { id: 'tarjeta', label: 'Tarjeta de crédito o débito', icon: '💳', hint: 'Pagás con tu tarjeta' },
  { id: 'transferencia', label: 'Transferencia bancaria', icon: '🏦', hint: 'Transferís a la cuenta del club' },
  { id: 'efectivo', label: 'Efectivo contra entrega', icon: '💵', hint: 'Pagás al recibir tu caja' },
];

const ADDRESS_FIELDS: { name: keyof Address; label: string; span?: string; autoComplete: string }[] = [
  { name: 'street', label: 'Calle', span: 'sm:col-span-2', autoComplete: 'address-line1' },
  { name: 'streetNumber', label: 'Número', autoComplete: 'off' },
  { name: 'locality', label: 'Localidad o barrio', autoComplete: 'address-level3' },
  { name: 'city', label: 'Ciudad', autoComplete: 'address-level2' },
  { name: 'province', label: 'Provincia', autoComplete: 'address-level1' },
  { name: 'postalCode', label: 'Código postal', autoComplete: 'postal-code' },
];

const fieldClass =
  'w-full min-h-[44px] p-3 border border-aurora-navy/15 rounded-xl bg-white text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta focus:border-transparent';

const cardClass = 'bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6';

const primaryButtonClass =
  'min-h-[44px] bg-aurora-terracotta text-white px-6 py-3 rounded-xl hover:bg-aurora-terracottaDark transition-colors font-semibold disabled:opacity-50';

const secondaryButtonClass =
  'min-h-[44px] border border-aurora-navy/20 text-aurora-navy px-6 py-3 rounded-xl hover:bg-aurora-cream transition-colors font-semibold';

const discountFor = (plan: CartPlan, method: string) => {
  if (method === 'transferencia') return plan.transferDiscount ?? 0;
  if (method === 'efectivo') return plan.cashDiscount ?? 0;
  return 0;
};

const money = (value: number) => `$${(Math.round(value * 100) / 100).toLocaleString('es-AR')} ARS`;

const digitsOnly = (value: string) => value.replace(/\D/g, '');

const formatCardNumber = (value: string) =>
  digitsOnly(value)
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();

const formatExpiry = (value: string) => {
  const digits = digitsOnly(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const luhnValid = (value: string) => {
  const digits = digitsOnly(value);
  if (digits.length < 13) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
};

const cardBrand = (value: string) => {
  const digits = digitsOnly(value);
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  return 'Tarjeta';
};

const validateCard = (card: CardData): string | null => {
  if (!luhnValid(card.number)) return 'El número de tarjeta no es válido.';
  if (card.holder.trim().length < 3) return 'Ingresá el nombre del titular tal como figura en la tarjeta.';
  const match = /^(\d{2})\/(\d{2})$/.exec(card.expiry);
  if (!match) return 'Ingresá el vencimiento con el formato MM/AA.';
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return 'El mes de vencimiento no es válido.';
  const now = new Date();
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
    return 'La tarjeta está vencida.';
  }
  const cvvLength = cardBrand(card.number) === 'American Express' ? 4 : 3;
  if (digitsOnly(card.cvv).length !== cvvLength) return `El código de seguridad debe tener ${cvvLength} dígitos.`;
  return null;
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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

const DemoNotice: React.FC = () => (
  <div className="rounded-xl border border-aurora-gold/40 bg-aurora-gold/10 px-4 py-3 text-sm text-aurora-navy">
    <span className="font-semibold">Entorno de demostración.</span> No se realiza ningún cobro real y no hace falta
    usar datos reales.
  </div>
);

const CheckoutPage: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartEntry[]>([]);
  const [options, setOptions] = useState<PaymentOptions>({ methods: [], banks: [], transferBlockedBy: [] });
  const [shippingClubs, setShippingClubs] = useState<ShippingClub[]>([]);
  const [selectedCouriers, setSelectedCouriers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [postalError, setPostalError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [paidInCash, setPaidInCash] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [card, setCard] = useState<CardData>({ number: '', holder: '', expiry: '', cvv: '' });
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [address, setAddress] = useState<Address>({
    street: '',
    streetNumber: '',
    locality: '',
    city: '',
    postalCode: '',
    province: '',
    instructions: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoadError('Debes iniciar sesión para continuar.');
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
        if (!Array.isArray(cartData) || cartData.length === 0) {
          setLoadError('Tu carrito está vacío. Agregá planes primero.');
          return;
        }
        setCartItems(cartData);

        const [optionsResponse, shippingResponse] = await Promise.all([
          api.get('/cart-items/payment-options'),
          api.get('/cart-items/shipping-options'),
        ]);
        const optionsData: PaymentOptions = getResponseData(optionsResponse);
        const shippingData: ShippingClub[] = getResponseData(shippingResponse) || [];
        setOptions(optionsData);
        setShippingClubs(shippingData);

        const initial: Record<number, number> = {};
        shippingData.forEach((club) => {
          if (club.selectedCourierId) initial[club.clubId] = club.selectedCourierId;
          else if (club.couriers.length === 1) initial[club.clubId] = club.couriers[0].id;
        });
        setSelectedCouriers(initial);
        setSelectedPaymentMethod(optionsData.methods[0] ?? '');
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoadError('Error al cargar datos. Intentá de nuevo.');
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

  const feeForClub = (clubId: number) => {
    const club = shippingClubs.find((entry) => entry.clubId === clubId);
    const courier = club?.couriers.find((entry) => entry.id === selectedCouriers[clubId]);
    return courier ? courier.fee : 0;
  };

  const courierNameForClub = (clubId: number) => {
    const club = shippingClubs.find((entry) => entry.clubId === clubId);
    return club?.couriers.find((entry) => entry.id === selectedCouriers[clubId])?.name ?? null;
  };

  const planPrice = (item: CartEntry) => item.plan.price * (1 - discountFor(item.plan, selectedPaymentMethod) / 100);
  const plansSubtotal = cartItems.reduce((sum, item) => sum + planPrice(item), 0);
  const originalSubtotal = cartItems.reduce((sum, item) => sum + item.plan.price, 0);
  const savings = originalSubtotal - plansSubtotal;
  const shippingTotal = cartItems.reduce((sum, item) => sum + feeForClub(item.club.id), 0);
  const grandTotal = plansSubtotal + shippingTotal;

  const availableMethods = PAYMENT_METHODS.filter((method) => options.methods.includes(method.id));
  const isCardMethod = selectedPaymentMethod === 'mercadopago' || selectedPaymentMethod === 'tarjeta';
  const isTransfer = selectedPaymentMethod === 'transferencia';
  const isCash = selectedPaymentMethod === 'efectivo';
  const methodLabel = PAYMENT_METHODS.find((method) => method.id === selectedPaymentMethod)?.label ?? '';
  const maskedCard = `${cardBrand(card.number)} terminada en ${digitsOnly(card.number).slice(-4)}`;

  const validateAddress = () => {
    const required = [address.street, address.streetNumber, address.locality, address.city, address.province];
    if (required.some((value) => !value.trim())) {
      setStepError('Completá todos los campos de la dirección.');
      return false;
    }
    if (!POSTAL_CODE_PATTERN.test(address.postalCode.trim())) {
      setPostalError('Ingresá un código postal válido, por ejemplo 1425 o C1425ABC.');
      setStepError('Revisá el código postal.');
      return false;
    }
    return true;
  };

  const validateShipping = () => {
    const missing = shippingClubs.find((club) => club.couriers.length > 0 && !selectedCouriers[club.clubId]);
    if (missing) {
      setStepError(`Elegí una forma de envío para ${missing.clubName}.`);
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (!selectedPaymentMethod) {
      setStepError('Elegí un medio de pago.');
      return false;
    }
    if (isCardMethod) {
      const cardError = validateCard(card);
      if (cardError) {
        setStepError(cardError);
        return false;
      }
    }
    if (isTransfer && !transferConfirmed) {
      setStepError('Confirmá que realizaste la transferencia para continuar.');
      return false;
    }
    return true;
  };

  const goToStep = (target: number) => {
    setStepError(null);
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinue = () => {
    setStepError(null);
    if (step === 1 && validateAddress()) goToStep(2);
    else if (step === 2 && validateShipping()) goToStep(3);
    else if (step === 3 && validatePayment()) goToStep(4);
  };

  const fillTestCard = () => {
    const fullName = user ? `${user.firstName} ${user.lastName}`.toUpperCase() : 'TITULAR DE PRUEBA';
    const year = String((new Date().getFullYear() + 3) % 100).padStart(2, '0');
    setCard({ number: '4111 1111 1111 1111', holder: fullName, expiry: `12/${year}`, cvv: '123' });
    setStepError(null);
  };

  const handleConfirm = async () => {
    if (isProcessing) return;
    setStepError(null);
    setIsProcessing(true);
    const started = Date.now();
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
        shipping: Object.entries(selectedCouriers).map(([idClub, idCourier]) => ({
          idClub: Number(idClub),
          idCourier,
        })),
      });
      const minimum = isCardMethod ? 2200 : 800;
      await wait(Math.max(0, minimum - (Date.now() - started)));
      const result = getResponseData(res);
      setPaidInCash(Boolean(result?.cashOnDelivery));
      setReceipt(result?.receipt ?? null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error processing payment:', err);
      const msg = err?.response?.data?.message;
      setStepError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'No pudimos procesar tu compra. Intentá de nuevo.'));
    } finally {
      setIsProcessing(false);
    }
  };

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

  if (loadError) {
    return (
      <div className="min-h-screen bg-aurora-cream py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-serif font-bold text-aurora-navy mb-4">{loadError}</h2>
          <button onClick={() => navigate('/cart')} className={primaryButtonClass}>
            Volver al carrito
          </button>
        </div>
      </div>
    );
  }

  if (receipt || (!isProcessing && paidInCash && !receipt)) {
    const pending = receipt?.pending ?? false;
    const title = paidInCash
      ? '¡Compra confirmada!'
      : pending
        ? '¡Suscripción registrada!'
        : '¡Pago realizado con éxito!';
    const text = paidInCash
      ? 'Tu suscripción ya está activa. Vas a pagar en efectivo cuando recibas tu caja y el club va a registrar el cobro.'
      : pending
        ? 'Tu suscripción queda pendiente de pago hasta que el club confirme tu transferencia.'
        : 'Tu orden fue procesada. Podés seguir el estado de tus suscripciones desde tu cuenta.';

    return (
      <div className="min-h-screen bg-aurora-cream py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
              ✓
            </div>
            <h1 className="text-3xl font-serif font-bold text-aurora-navy mb-2">{title}</h1>
            <p className="text-aurora-navy/70 max-w-md mx-auto">{text}</p>
          </div>

          {receipt && (
            <div className={cardClass}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-aurora-navy/10 pb-4 mb-4">
                <div>
                  <p className="text-xs text-aurora-navy/50">Número de orden</p>
                  <p className="font-bold text-aurora-navy">{receipt.reference}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-aurora-navy/50">Fecha</p>
                  <p className="font-semibold text-aurora-navy">
                    {new Date(receipt.date).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
              <ul className="space-y-3 mb-4">
                {receipt.items.map((item, index) => (
                  <li key={`${item.planName}-${index}`} className="flex justify-between gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-aurora-navy">{item.planName}</p>
                      <p className="text-xs text-aurora-navy/50">
                        {item.clubName}
                        {item.courierName ? ` · Envío con ${item.courierName}` : ''}
                      </p>
                      {item.shippingFee > 0 && (
                        <p className="text-xs text-aurora-navy/50">
                          Plan {money(item.planAmount)} + envío {money(item.shippingFee)}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-aurora-navy whitespace-nowrap">{money(item.total)}</p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-aurora-navy/10 pt-4 space-y-1 text-sm">
                {receipt.shippingTotal > 0 && (
                  <div className="flex justify-between text-aurora-navy/70">
                    <span>Envío</span>
                    <span>{money(receipt.shippingTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-aurora-navy">
                  <span>{pending || paidInCash ? 'Total a pagar' : 'Total pagado'}</span>
                  <span>{money(receipt.total)}</span>
                </div>
                <p className="text-xs text-aurora-navy/50">Medio de pago: {methodLabel}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate('/')} className={secondaryButtonClass}>
              Volver al inicio
            </button>
            <button onClick={() => navigate('/customer/subscriptions')} className={primaryButtonClass}>
              Ver mis suscripciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderSummary = () => (
    <aside className={`${cardClass} lg:sticky lg:top-24`}>
      <h2 className="text-xl font-serif font-bold text-aurora-navy mb-4">Resumen de tu orden</h2>
      <div className="space-y-3 mb-4">
        {cartItems.map((item) => {
          const discount = discountFor(item.plan, selectedPaymentMethod);
          const fee = feeForClub(item.club.id);
          return (
            <div key={item.cartItemId} className="flex justify-between gap-3 py-2 border-b border-aurora-navy/10 last:border-b-0">
              <div className="min-w-0">
                <p className="font-semibold text-aurora-navy truncate">{item.plan.name}</p>
                <p className="text-xs text-aurora-navy/50">
                  {item.club.name} · {item.plan.deliveryFrequency}
                </p>
                {step > 1 && fee > 0 && (
                  <p className="text-xs text-aurora-navy/50">Envío {money(fee)}</p>
                )}
              </div>
              <div className="text-right whitespace-nowrap">
                {discount > 0 && <p className="text-xs text-aurora-navy/40 line-through">{money(item.plan.price)}</p>}
                <p className="font-semibold text-aurora-navy">{money(planPrice(item))}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-1 text-sm border-t border-aurora-navy/10 pt-3">
        <div className="flex justify-between text-aurora-navy/70">
          <span>Planes</span>
          <span>{money(originalSubtotal)}</span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Descuento</span>
            <span>-{money(savings)}</span>
          </div>
        )}
        <div className="flex justify-between text-aurora-navy/70">
          <span>Envío</span>
          <span>{step > 1 ? (shippingTotal > 0 ? money(shippingTotal) : 'Sin costo') : 'Se calcula en el paso 2'}</span>
        </div>
        <div className="flex justify-between pt-2 text-lg font-bold text-aurora-navy">
          <span>Total</span>
          <span>{money(grandTotal)}</span>
        </div>
      </div>
    </aside>
  );

  const renderAddress = () => (
    <div className={cardClass}>
      <h2 className="text-xl font-serif font-bold text-aurora-navy mb-1">¿Dónde recibís tu caja?</h2>
      <p className="text-sm text-aurora-navy/60 mb-5">Esta dirección se usa para todos los envíos de tu orden.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ADDRESS_FIELDS.map((field) => (
          <div key={field.name} className={field.span}>
            <label htmlFor={`addr-${field.name}`} className="block text-sm font-medium text-aurora-navy/80 mb-1">
              {field.label}
            </label>
            <input
              id={`addr-${field.name}`}
              name={field.name}
              value={address[field.name]}
              onChange={handleAddressChange}
              autoComplete={field.autoComplete}
              className={fieldClass}
            />
            {field.name === 'postalCode' && postalError && (
              <p className="text-red-600 text-xs mt-1">{postalError}</p>
            )}
          </div>
        ))}
        <div className="sm:col-span-2">
          <label htmlFor="addr-instructions" className="block text-sm font-medium text-aurora-navy/80 mb-1">
            Indicaciones para el repartidor (opcional)
          </label>
          <textarea
            id="addr-instructions"
            name="instructions"
            value={address.instructions}
            onChange={handleAddressChange}
            rows={3}
            maxLength={500}
            className={fieldClass}
          />
        </div>
      </div>
    </div>
  );

  const renderShipping = () => (
    <div className="space-y-6">
      {shippingClubs.map((club) => (
        <div key={club.clubId} className={cardClass}>
          <h2 className="text-xl font-serif font-bold text-aurora-navy mb-1">Envío de {club.clubName}</h2>
          {club.couriers.length === 0 ? (
            <p className="text-sm text-aurora-navy/70 mt-2">
              Este club coordina el envío directamente con vos. No tiene costo adicional.
            </p>
          ) : (
            <>
              <p className="text-sm text-aurora-navy/60 mb-4">Elegí cómo querés recibir tus cajas.</p>
              <div className="space-y-3" role="radiogroup" aria-label={`Envío de ${club.clubName}`}>
                {club.couriers.map((courier) => {
                  const checked = selectedCouriers[club.clubId] === courier.id;
                  return (
                    <label
                      key={courier.id}
                      htmlFor={`courier-${club.clubId}-${courier.id}`}
                      className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                        checked ? 'border-aurora-terracotta bg-aurora-terracotta/5' : 'border-aurora-navy/15 hover:bg-aurora-cream'
                      }`}
                    >
                      <input
                        id={`courier-${club.clubId}-${courier.id}`}
                        type="radio"
                        name={`courier-${club.clubId}`}
                        checked={checked}
                        onChange={() => {
                          setSelectedCouriers((prev) => ({ ...prev, [club.clubId]: courier.id }));
                          setStepError(null);
                        }}
                        className="h-4 w-4 accent-aurora-terracotta"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-aurora-navy">{courier.name}</p>
                        <p className="text-xs text-aurora-navy/60">
                          {courier.isInternal ? 'Reparto propio del club' : 'Servicio de mensajería'}
                        </p>
                      </div>
                      <p className="font-semibold text-aurora-navy whitespace-nowrap">
                        {courier.fee > 0 ? `${money(courier.fee)} por caja` : 'Sin costo'}
                      </p>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <div className={cardClass}>
        <h2 className="text-xl font-serif font-bold text-aurora-navy mb-1">¿Cómo querés pagar?</h2>
        <p className="text-sm text-aurora-navy/60 mb-4">Estos son los medios que aceptan los clubes de tu carrito.</p>
        {availableMethods.length === 0 ? (
          <p className="text-sm text-red-600">
            Los planes de tu carrito no comparten un medio de pago. Volvé al carrito y quitá alguno para continuar.
          </p>
        ) : (
          <div className="space-y-3" role="radiogroup" aria-label="Medio de pago">
            {availableMethods.map((method) => {
              const checked = selectedPaymentMethod === method.id;
              return (
                <label
                  key={method.id}
                  htmlFor={`method-${method.id}`}
                  className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                    checked ? 'border-aurora-terracotta bg-aurora-terracotta/5' : 'border-aurora-navy/15 hover:bg-aurora-cream'
                  }`}
                >
                  <input
                    id={`method-${method.id}`}
                    type="radio"
                    name="payment-method"
                    checked={checked}
                    onChange={() => {
                      setSelectedPaymentMethod(method.id);
                      setTransferConfirmed(false);
                      setStepError(null);
                    }}
                    className="h-4 w-4 accent-aurora-terracotta"
                  />
                  <span className="text-2xl" aria-hidden="true">{method.icon}</span>
                  <div>
                    <p className="font-semibold text-aurora-navy">{method.label}</p>
                    <p className="text-xs text-aurora-navy/60">{method.hint}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {isCardMethod && (
        <div className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="text-lg font-serif font-bold text-aurora-navy">Datos de la tarjeta</h3>
            <button
              type="button"
              onClick={fillTestCard}
              className="min-h-[44px] rounded-lg border border-aurora-terracotta px-3 text-sm font-semibold text-aurora-terracotta hover:bg-aurora-terracotta/10"
            >
              Completar con datos de prueba
            </button>
          </div>
          <div className="mb-4"><DemoNotice /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="card-number" className="block text-sm font-medium text-aurora-navy/80 mb-1">
                Número de tarjeta
              </label>
              <input
                id="card-number"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0000 0000 0000 0000"
                value={card.number}
                onChange={(e) => setCard((prev) => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                className={fieldClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="card-holder" className="block text-sm font-medium text-aurora-navy/80 mb-1">
                Nombre del titular
              </label>
              <input
                id="card-holder"
                autoComplete="off"
                value={card.holder}
                onChange={(e) => setCard((prev) => ({ ...prev, holder: e.target.value.toUpperCase().slice(0, 40) }))}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="card-expiry" className="block text-sm font-medium text-aurora-navy/80 mb-1">
                Vencimiento
              </label>
              <input
                id="card-expiry"
                inputMode="numeric"
                autoComplete="off"
                placeholder="MM/AA"
                value={card.expiry}
                onChange={(e) => setCard((prev) => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="card-cvv" className="block text-sm font-medium text-aurora-navy/80 mb-1">
                Código de seguridad
              </label>
              <input
                id="card-cvv"
                inputMode="numeric"
                autoComplete="off"
                type="password"
                placeholder="123"
                value={card.cvv}
                onChange={(e) => setCard((prev) => ({ ...prev, cvv: digitsOnly(e.target.value).slice(0, 4) }))}
                className={fieldClass}
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-aurora-navy/50">
            Estos datos solo se validan en tu navegador. No se envían ni se guardan.
          </p>
        </div>
      )}

      {isTransfer && (
        <div className={cardClass}>
          <h3 className="text-lg font-serif font-bold text-aurora-navy mb-4">Datos para la transferencia</h3>
          <div className="mb-4"><DemoNotice /></div>
          <div className="space-y-5">
            {options.banks.map((bank) => (
              <div key={bank.clubId} className="rounded-xl border border-aurora-navy/10 bg-aurora-cream p-4 space-y-3">
                <p className="font-semibold text-aurora-navy">{bank.clubName}</p>
                {bank.holder && <CopyRow label="Titular" value={bank.holder} />}
                {bank.cbu && <CopyRow label="CBU" value={bank.cbu} />}
                {bank.alias && <CopyRow label="Alias" value={bank.alias} />}
              </div>
            ))}
          </div>
          <label htmlFor="transfer-confirmed" className="mt-4 flex min-h-[44px] cursor-pointer items-center gap-3">
            <input
              id="transfer-confirmed"
              type="checkbox"
              checked={transferConfirmed}
              onChange={(e) => setTransferConfirmed(e.target.checked)}
              className="h-4 w-4 accent-aurora-terracotta"
            />
            <span className="text-sm text-aurora-navy">Ya realicé la transferencia por {money(grandTotal)}</span>
          </label>
        </div>
      )}

      {isCash && (
        <div className={cardClass}>
          <h3 className="text-lg font-serif font-bold text-aurora-navy mb-2">Pago en efectivo</h3>
          <p className="text-sm text-aurora-navy/70">
            No pagás nada ahora. Abonás {money(grandTotal)} cuando recibas tu caja, y el club registra el cobro.
          </p>
        </div>
      )}
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className={cardClass}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-aurora-navy mb-1">Dirección de entrega</h3>
            <p className="text-sm text-aurora-navy/80">
              {address.street} {address.streetNumber}, {address.locality}
            </p>
            <p className="text-sm text-aurora-navy/80">
              {address.city}, {address.province} ({address.postalCode.toUpperCase()})
            </p>
            {address.instructions && <p className="text-xs text-aurora-navy/50 mt-1">{address.instructions}</p>}
          </div>
          <button type="button" onClick={() => goToStep(1)} className="min-h-[44px] px-2 text-sm font-semibold text-aurora-terracotta hover:underline">
            Editar
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-aurora-navy mb-1">Envío</h3>
            {shippingClubs.map((club) => {
              const name = courierNameForClub(club.clubId);
              const fee = feeForClub(club.clubId);
              return (
                <p key={club.clubId} className="text-sm text-aurora-navy/80">
                  {club.clubName}: {name ?? 'Coordinado por el club'}
                  {name ? ` · ${fee > 0 ? `${money(fee)} por caja` : 'Sin costo'}` : ''}
                </p>
              );
            })}
          </div>
          <button type="button" onClick={() => goToStep(2)} className="min-h-[44px] px-2 text-sm font-semibold text-aurora-terracotta hover:underline">
            Editar
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-aurora-navy mb-1">Medio de pago</h3>
            <p className="text-sm text-aurora-navy/80">{methodLabel}</p>
            {isCardMethod && <p className="text-xs text-aurora-navy/50">{maskedCard}</p>}
            {isTransfer && <p className="text-xs text-aurora-navy/50">Transferencia informada</p>}
            {isCash && <p className="text-xs text-aurora-navy/50">Pagás al recibir tu caja</p>}
          </div>
          <button type="button" onClick={() => goToStep(3)} className="min-h-[44px] px-2 text-sm font-semibold text-aurora-terracotta hover:underline">
            Editar
          </button>
        </div>
      </div>

      <DemoNotice />
    </div>
  );

  return (
    <div className="min-h-screen bg-aurora-cream py-8 px-4">
      {isProcessing && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-aurora-navy/70 px-4 text-center"
        >
          <div className="mb-4 h-14 w-14 animate-spin rounded-full border-b-4 border-white"></div>
          <p className="text-lg font-semibold text-white">
            {isCardMethod ? 'Procesando tu pago…' : 'Registrando tu compra…'}
          </p>
          <p className="text-sm text-white/80">No cierres ni recargues esta página.</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-serif font-bold text-aurora-navy mb-2">Finalizar compra</h1>
        </div>

        <nav aria-label="Pasos de la compra" className="mb-8 max-w-3xl mx-auto">
          <ol className="flex items-center gap-2">
            {STEPS.map((label, index) => {
              const number = index + 1;
              const done = number < step;
              const current = number === step;
              return (
                <li
                  key={label}
                  className={`flex items-center gap-2 ${number < STEPS.length ? 'flex-1' : ''}`}
                  aria-current={current ? 'step' : undefined}
                >
                  <button
                    type="button"
                    disabled={!done}
                    onClick={() => goToStep(number)}
                    className="flex min-h-[44px] items-center gap-2 disabled:cursor-default"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        done
                          ? 'bg-aurora-terracotta text-white'
                          : current
                            ? 'bg-aurora-navy text-white'
                            : 'bg-aurora-navy/10 text-aurora-navy/50'
                      }`}
                    >
                      {done ? '✓' : number}
                    </span>
                    <span className={`hidden text-sm font-semibold sm:inline ${current ? 'text-aurora-navy' : 'text-aurora-navy/50'}`}>
                      {label}
                    </span>
                  </button>
                  {number < STEPS.length && <span className="h-px flex-1 bg-aurora-navy/15" />}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && renderAddress()}
            {step === 2 && renderShipping()}
            {step === 3 && renderPayment()}
            {step === 4 && renderReview()}

            {stepError && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {stepError}
              </div>
            )}

            <div className="flex flex-wrap justify-between gap-3">
              {step === 1 ? (
                <button type="button" onClick={() => navigate('/cart')} className={secondaryButtonClass}>
                  Volver al carrito
                </button>
              ) : (
                <button type="button" onClick={() => goToStep(step - 1)} disabled={isProcessing} className={secondaryButtonClass}>
                  Atrás
                </button>
              )}
              {step < 4 ? (
                <button type="button" onClick={handleContinue} disabled={step === 3 && availableMethods.length === 0} className={primaryButtonClass}>
                  Continuar
                </button>
              ) : (
                <button type="button" onClick={handleConfirm} disabled={isProcessing} className={primaryButtonClass}>
                  Confirmar compra · {money(grandTotal)}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">{renderSummary()}</div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;