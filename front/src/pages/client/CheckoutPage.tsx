import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../App';
import api, { getResponseData } from '../../api/config';
import { User } from '../../types/user';
import { notifyCartChanged } from '../../utils/cartEvents';
import { isNativeApp, openPaymentPage } from '../../utils/native';

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

interface GeoResult {
  lat: number;
  lon: number;
  label: string;
}

type GeoStatus = 'idle' | 'loading' | 'found' | 'notfound' | 'error';
type GeoQuery = Pick<Address, 'street' | 'streetNumber' | 'locality' | 'city' | 'province'>;
type AddressErrors = Partial<Record<keyof Address, string>>;
type CardErrors = Partial<Record<keyof CardData, string>>;
type IconName = 'pin' | 'truck' | 'card' | 'bank' | 'cash' | 'lock' | 'check' | 'box' | 'shield' | 'info';

const POSTAL_CODE_PATTERN = /^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/;

const STEPS = ['Dirección', 'Envío', 'Pago', 'Revisión'];

const PROVINCES = [
  'Ciudad Autónoma de Buenos Aires',
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

const PAYMENT_METHODS: { id: string; label: string; icon: IconName; hint: string }[] = [
  { id: 'mercadopago', label: 'Mercado Pago', icon: 'card', hint: 'Tarjeta de crédito o débito' },
  { id: 'tarjeta', label: 'Tarjeta de crédito o débito', icon: 'card', hint: 'Visa, Mastercard y American Express' },
  { id: 'transferencia', label: 'Transferencia bancaria', icon: 'bank', hint: 'Transferís a la cuenta del club' },
  { id: 'efectivo', label: 'Efectivo contra entrega', icon: 'cash', hint: 'Pagás al recibir tu caja' },
];

const ADDRESS_FIELDS: {
  name: Exclude<keyof Address, 'instructions'>;
  label: string;
  span: string;
  autoComplete: string;
}[] = [
  { name: 'street', label: 'Calle', span: 'sm:col-span-4', autoComplete: 'address-line1' },
  { name: 'streetNumber', label: 'Número', span: 'sm:col-span-2', autoComplete: 'off' },
  { name: 'locality', label: 'Localidad o barrio', span: 'sm:col-span-3', autoComplete: 'address-level3' },
  { name: 'city', label: 'Ciudad', span: 'sm:col-span-3', autoComplete: 'address-level2' },
  { name: 'province', label: 'Provincia', span: 'sm:col-span-3', autoComplete: 'address-level1' },
  { name: 'postalCode', label: 'Código postal', span: 'sm:col-span-3', autoComplete: 'postal-code' },
];

const REQUIRED_MESSAGES: Record<Exclude<keyof Address, 'instructions' | 'postalCode'>, string> = {
  street: 'Ingresá la calle.',
  streetNumber: 'Ingresá el número.',
  locality: 'Ingresá tu localidad o barrio.',
  city: 'Ingresá la ciudad.',
  province: 'Ingresá la provincia.',
};

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const fieldBase =
  'w-full min-h-[48px] px-4 py-3 border rounded-xl bg-white text-aurora-navy placeholder:text-aurora-navy/30 focus:outline-none focus:ring-2 focus:border-transparent';

const inputClass = (error?: string) =>
  `${fieldBase} ${error ? 'border-red-400 focus:ring-red-300' : 'border-aurora-navy/15 focus:ring-aurora-terracotta'}`;

const cardClass = 'bg-white rounded-2xl shadow-aurora-sm border border-aurora-navy/10';

const primaryButtonClass =
  'min-h-[48px] bg-aurora-terracotta text-white px-8 py-3 rounded-xl hover:bg-aurora-terracottaDark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed';

const secondaryButtonClass =
  'min-h-[48px] border border-aurora-navy/20 text-aurora-navy px-6 py-3 rounded-xl hover:bg-white transition-colors font-semibold disabled:opacity-50';

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




const cardBrand = (value: string) => {
  const digits = digitsOnly(value);
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  return 'Tarjeta';
};

const validateCard = (card: CardData): CardErrors => {
  const errors: CardErrors = {};
  const numberLength = digitsOnly(card.number).length;
  if (numberLength < 13 || numberLength > 19) errors.number = 'El número debe tener entre 13 y 19 dígitos.';

  if (card.holder.trim().length < 3) errors.holder = 'Ingresá el nombre tal como figura en la tarjeta.';
  const match = /^(\d{2})\/(\d{2})$/.exec(card.expiry);
  if (!match) {
    errors.expiry = 'Usá el formato MM/AA.';
  } else {
    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    const now = new Date();
    if (month < 1 || month > 12) errors.expiry = 'El mes no es válido.';
    else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
      errors.expiry = 'La tarjeta está vencida.';
    }
  }
  const cvvLength = cardBrand(card.number) === 'American Express' ? 4 : 3;
  if (digitsOnly(card.cvv).length !== cvvLength) errors.cvv = `Deben ser ${cvvLength} dígitos.`;
  return errors;
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const fetchGeo = async (url: string, signal: AbortSignal): Promise<GeoResult | null> => {
  const response = await fetch(url, { signal, headers: { 'Accept-Language': 'es' } });
  if (!response.ok) throw new Error('geocoding failed');
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const lat = Number(data[0].lat);
  const lon = Number(data[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon, label: String(data[0].display_name || '') };
};

const geocodeAddress = async (query: GeoQuery, signal: AbortSignal): Promise<GeoResult | null> => {
  const street = `${query.streetNumber.trim()} ${query.street.trim()}`;
  const structured =
    `${NOMINATIM_URL}?format=jsonv2&limit=1&countrycodes=ar` +
    `&street=${encodeURIComponent(street)}` +
    `&city=${encodeURIComponent(query.city.trim())}` +
    `&state=${encodeURIComponent(query.province.trim())}` +
    `&country=Argentina`;
  const first = await fetchGeo(structured, signal);
  if (first) return first;
  const free = [
    `${query.street.trim()} ${query.streetNumber.trim()}`,
    query.locality.trim(),
    query.city.trim(),
    query.province.trim(),
    'Argentina',
  ]
    .filter(Boolean)
    .join(', ');
  return fetchGeo(`${NOMINATIM_URL}?format=jsonv2&limit=1&countrycodes=ar&q=${encodeURIComponent(free)}`, signal);
};

const ICONS: Record<IconName, React.ReactNode> = {
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  truck: (
    <>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </>
  ),
  bank: <path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18" />,
  cash: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" />
    </>
  ),
  check: <path d="M5 13l4 4L19 7" />,
  box: (
    <>
      <path d="M3 8l9-5 9 5v8l-9 5-9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v5h1" />
    </>
  ),
};

const Icon: React.FC<{ name: IconName; className?: string }> = ({ name, className = 'h-5 w-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {ICONS[name]}
  </svg>
);

const SectionCard: React.FC<{ icon: IconName; title: string; subtitle?: string; children: React.ReactNode }> = ({
  icon,
  title,
  subtitle,
  children,
}) => (
  <section className={`${cardClass} p-5 sm:p-7`}>
    <div className="mb-6 flex items-start gap-4">
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-aurora-terracotta/10 text-aurora-terracotta">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <div>
        <h2 className="text-xl font-serif font-bold text-aurora-navy">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-aurora-navy/60">{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

const Field: React.FC<{
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ id, label, error, className = '', children }) => (
  <div className={className}>
    <label htmlFor={id} className="mb-1 block text-sm font-medium text-aurora-navy/80">
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const RadioCard: React.FC<{
  id: string;
  name: string;
  checked: boolean;
  onChange: () => void;
  icon: IconName;
  title: string;
  hint: string;
  aside?: string;
  children?: React.ReactNode;
}> = ({ id, name, checked, onChange, icon, title, hint, aside, children }) => (
  <div
    className={`rounded-xl border transition-colors ${
      checked ? 'border-aurora-terracotta bg-aurora-terracotta/5' : 'border-aurora-navy/15 bg-white hover:bg-aurora-cream'
    }`}
  >
    <label htmlFor={id} className="flex min-h-[64px] cursor-pointer items-center gap-4 p-4">
      <input
        id={id}
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 flex-shrink-0 accent-aurora-terracotta"
      />
      <span
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
          checked ? 'bg-aurora-terracotta text-white' : 'bg-aurora-navy/5 text-aurora-navy/70'
        }`}
      >
        <Icon name={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-aurora-navy">{title}</span>
        <span className="block text-xs text-aurora-navy/60">{hint}</span>
      </span>
      {aside && <span className="whitespace-nowrap text-sm font-semibold text-aurora-navy">{aside}</span>}
    </label>
    {checked && children && <div className="border-t border-aurora-navy/10 p-4">{children}</div>}
  </div>
);

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
        className="min-h-[44px] flex-shrink-0 rounded-lg border border-aurora-navy/15 bg-white px-3 text-xs font-semibold text-aurora-navy hover:bg-aurora-cream"
      >
        Copiar
      </button>
    </div>
  );
};

const DemoNotice: React.FC = () => (
  <div className="flex items-start gap-3 rounded-xl border border-aurora-gold/40 bg-aurora-gold/10 px-4 py-3 text-sm text-aurora-navy">
    <Icon name="info" className="mt-0.5 h-5 w-5 flex-shrink-0" />
    <p>
      <span className="font-semibold">Entorno de demostración.</span> No se realiza ningún cobro real y no hace falta
      usar datos reales.
    </p>
  </div>
);

const CardPreview: React.FC<{ card: CardData }> = ({ card }) => (
  <div className="mx-auto mb-5 w-full max-w-sm rounded-2xl bg-gradient-to-br from-aurora-navy to-aurora-navy/80 p-5 text-white shadow-aurora-sm">
    <div className="mb-8 flex items-center justify-between">
      <span className="h-8 w-11 rounded-md bg-aurora-gold/80" />
      <span className="text-sm font-semibold tracking-wide">{cardBrand(card.number)}</span>
    </div>
    <p className="mb-5 font-mono text-lg tracking-widest">{card.number || '•••• •••• •••• ••••'}</p>
    <div className="flex items-end justify-between gap-4 text-xs">
      <div className="min-w-0">
        <p className="text-white/60">Titular</p>
        <p className="truncate font-semibold">{card.holder || 'NOMBRE APELLIDO'}</p>
      </div>
      <div>
        <p className="text-white/60">Vence</p>
        <p className="font-semibold">{card.expiry || 'MM/AA'}</p>
      </div>
    </div>
  </div>
);

const AddressMap: React.FC<{
  geo: GeoResult | null;
  status: GeoStatus;
  onRetry: () => void;
  heightClass?: string;
}> = ({ geo, status, onRetry, heightClass = 'h-64' }) => {
  if (status === 'found' && geo) {
    const lat = geo.lat.toFixed(6);
    const lon = geo.lon.toFixed(6);
    const bbox = [
      (geo.lon - 0.005).toFixed(6),
      (geo.lat - 0.0035).toFixed(6),
      (geo.lon + 0.005).toFixed(6),
      (geo.lat + 0.0035).toFixed(6),
    ].join(',');
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
    const googleUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    return (
      <div className="overflow-hidden rounded-xl border border-aurora-navy/10 bg-white">
        <iframe title="Mapa de la dirección de entrega" src={src} loading="lazy" className={`${heightClass} w-full border-0`} />
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs">
          <span className="flex items-center gap-2 font-semibold text-green-700">
            <Icon name="check" className="h-4 w-4 flex-shrink-0" />
            Ubicación encontrada
          </span>
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-aurora-terracotta hover:underline"
          >
            Abrir en Google Maps
          </a>
        </div>
        {geo.label && <p className="px-4 pb-3 text-xs text-aurora-navy/60">{geo.label}</p>}
      </div>
    );
  }

  const box = `flex ${heightClass} flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-aurora-navy/20 bg-white px-6 text-center`;

  if (status === 'loading') {
    return (
      <div className={box} role="status">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-aurora-terracotta"></div>
        <p className="text-sm text-aurora-navy/70">Ubicando tu dirección…</p>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className={box}>
        <Icon name="pin" className="h-8 w-8 text-aurora-navy/30" />
        <p className="text-sm font-semibold text-aurora-navy">No encontramos esa dirección en el mapa</p>
        <p className="text-xs text-aurora-navy/60">Revisá la calle, el número y la ciudad. Podés continuar igual.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={box}>
        <Icon name="pin" className="h-8 w-8 text-aurora-navy/30" />
        <p className="text-sm font-semibold text-aurora-navy">No pudimos consultar el mapa</p>
        <button
          type="button"
          onClick={onRetry}
          className="min-h-[44px] rounded-lg border border-aurora-navy/20 px-4 text-sm font-semibold text-aurora-navy hover:bg-aurora-cream"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={box}>
      <Icon name="pin" className="h-8 w-8 text-aurora-navy/30" />
      <p className="text-sm text-aurora-navy/60">Completá tu dirección y te mostramos la ubicación en el mapa.</p>
    </div>
  );
};

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
  const [addressErrors, setAddressErrors] = useState<AddressErrors>({});
  const [cardErrors, setCardErrors] = useState<CardErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [paidInCash, setPaidInCash] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [card, setCard] = useState<CardData>({ number: '', holder: '', expiry: '', cvv: '' });
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [geo, setGeo] = useState<GeoResult | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [geoNonce, setGeoNonce] = useState(0);
  const geoCache = useRef<Map<string, GeoResult | null>>(new Map());
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

  const geoQuery = useMemo<GeoQuery>(
    () => ({
      street: address.street,
      streetNumber: address.streetNumber,
      locality: address.locality,
      city: address.city,
      province: address.province,
    }),
    [address.street, address.streetNumber, address.locality, address.city, address.province],
  );

  useEffect(() => {
    if (step !== 1 || loading) return undefined;
    const ready = [geoQuery.street, geoQuery.streetNumber, geoQuery.city, geoQuery.province].every(
      (value) => value.trim().length > 0,
    );
    if (!ready) {
      setGeo(null);
      setGeoStatus('idle');
      return undefined;
    }
    const key = [
      geoQuery.street,
      geoQuery.streetNumber,
      geoQuery.locality,
      geoQuery.city,
      geoQuery.province,
      geoNonce,
    ]
      .join('|')
      .toLowerCase();
    const cached = geoCache.current.get(key);
    if (cached !== undefined) {
      setGeo(cached);
      setGeoStatus(cached ? 'found' : 'notfound');
      return undefined;
    }
    setGeoStatus('loading');
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const result = await geocodeAddress(geoQuery, controller.signal);
        geoCache.current.set(key, result);
        setGeo(result);
        setGeoStatus(result ? 'found' : 'notfound');
      } catch (err) {
        if (!controller.signal.aborted) setGeoStatus('error');
      }
    }, 900);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [step, loading, geoQuery, geoNonce]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as keyof Address;
    const value = e.target.value;
    setAddress((prev) => ({ ...prev, [name]: value }));
    setAddressErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const updateCard = (field: keyof CardData, value: string) => {
    setCard((prev) => ({ ...prev, [field]: value }));
    setCardErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
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
  const isMercadoPago = selectedPaymentMethod === 'mercadopago';
  const isCardMethod = selectedPaymentMethod === 'tarjeta';
  const isTransfer = selectedPaymentMethod === 'transferencia';
  const isCash = selectedPaymentMethod === 'efectivo';
  const methodLabel = PAYMENT_METHODS.find((method) => method.id === selectedPaymentMethod)?.label ?? '';
  const maskedCard = `${cardBrand(card.number)} terminada en ${digitsOnly(card.number).slice(-4)}`;

  const validateAddress = () => {
    const errors: AddressErrors = {};
    (Object.keys(REQUIRED_MESSAGES) as (keyof typeof REQUIRED_MESSAGES)[]).forEach((name) => {
      if (!address[name].trim()) errors[name] = REQUIRED_MESSAGES[name];
    });
    if (!address.postalCode.trim()) errors.postalCode = 'Ingresá el código postal.';
    else if (!POSTAL_CODE_PATTERN.test(address.postalCode.trim())) {
      errors.postalCode = 'Código postal inválido. Ejemplos: 1425 o C1425ABC.';
    }
    setAddressErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStepError('Revisá los datos marcados en rojo.');
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
      const errors = validateCard(card);
      setCardErrors(errors);
      if (Object.keys(errors).length > 0) {
        setStepError('Revisá los datos de la tarjeta.');
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
    setCard({ number: '4111 1111 1111 1111', holder: fullName.slice(0, 40), expiry: `12/${year}`, cvv: '123' });
    setCardErrors({});
    setStepError(null);
  };

  const handleConfirm = async () => {
    if (isProcessing) return;
    setStepError(null);
    setIsProcessing(true);
    const started = Date.now();
    let redirecting = false;
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
      if (result?.checkoutUrl) {
        notifyCartChanged();
        const inOverlay = await openPaymentPage(result.checkoutUrl);
        if (!inOverlay) {
          redirecting = true;
          return;
        }
      }      
      setPaidInCash(Boolean(result?.cashOnDelivery));
      setReceipt(result?.receipt ?? null);
      setCompleted(true);
      notifyCartChanged();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error processing payment:', err);
      const msg = err?.response?.data?.message;
      setStepError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'No pudimos procesar tu compra. Intentá de nuevo.'));
    } finally {
if (!redirecting) setIsProcessing(false);
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

  if (completed) {
       const pending = receipt?.pending ?? false;
    const awaitingMp = pending && receipt?.method === 'mercadopago';
    const title = paidInCash
      ? '¡Compra confirmada!'
      : awaitingMp
        ? 'Completá tu pago en Mercado Pago'
        : pending
          ? '¡Suscripción registrada!'
          : '¡Pago realizado con éxito!';
    const text = paidInCash
      ? 'Tu suscripción ya está activa. Pagás en efectivo cuando recibas tu caja y el club registra el cobro.'
      : awaitingMp
        ? 'Cuando Mercado Pago confirme el pago, tu suscripción se activa sola y te avisamos con una notificación.'
        : pending
          ? 'Tu suscripción queda pendiente de pago hasta que el club confirme tu transferencia.'
          : 'Tu orden fue procesada correctamente. Podés seguir el estado de tus suscripciones desde tu cuenta.';
    const timeline = [
      awaitingMp
        ? 'Mercado Pago confirma tu pago y se activa tu suscripción.'
        : pending && !paidInCash
          ? 'El club confirma tu transferencia.'
          : 'El club recibe tu pedido y prepara tu caja.',
      'Se asigna la empresa de envío que elegiste.',
      paidInCash ? 'Recibís tu caja y abonás en efectivo.' : 'Recibís tu caja en la dirección indicada.',
    ];

    return (
      <div className="min-h-screen bg-aurora-cream py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
              <Icon name="check" className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-aurora-navy mb-2">{title}</h1>
            <p className="text-aurora-navy/70 max-w-md mx-auto">{text}</p>
          </div>

          {receipt && (
            <section className={`${cardClass} p-5 sm:p-7`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-aurora-navy/10 pb-4 mb-4">
                <div>
                  <p className="text-xs text-aurora-navy/50">Número de orden</p>
                  <p className="text-lg font-bold text-aurora-navy">{receipt.reference}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-aurora-navy/50">Fecha</p>
                  <p className="font-semibold text-aurora-navy">{new Date(receipt.date).toLocaleString('es-AR')}</p>
                </div>
              </div>
              <ul className="space-y-4 mb-4">
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
            </section>
          )}

          <section className={`${cardClass} p-5 sm:p-7`}>
            <h2 className="font-serif text-lg font-bold text-aurora-navy mb-3">Entrega</h2>
            <p className="text-sm text-aurora-navy/80">
              {address.street} {address.streetNumber}, {address.locality}
            </p>
            <p className="text-sm text-aurora-navy/80">
              {address.city}, {address.province} ({address.postalCode.toUpperCase()})
            </p>
            <h2 className="font-serif text-lg font-bold text-aurora-navy mt-6 mb-3">Qué sigue</h2>
            <ol className="space-y-3">
              {timeline.map((entry, index) => (
                <li key={entry} className="flex items-start gap-3 text-sm text-aurora-navy/80">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-aurora-terracotta text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{entry}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="flex flex-wrap justify-center gap-3 print:hidden">
            {!isNativeApp() && (
              <button onClick={() => window.print()} className={secondaryButtonClass}>
                Imprimir comprobante
              </button>
            )}
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

  const renderSummaryBody = () => (
    <>
      <div className="space-y-3 mb-4">
        {cartItems.map((item) => {
          const discount = discountFor(item.plan, selectedPaymentMethod);
          const fee = feeForClub(item.club.id);
          const courierName = courierNameForClub(item.club.id);
          return (
            <div
              key={item.cartItemId}
              className="flex justify-between gap-3 py-2 border-b border-aurora-navy/10 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="font-semibold text-aurora-navy truncate">{item.plan.name}</p>
                <p className="text-xs text-aurora-navy/50">
                  {item.club.name} · {item.plan.deliveryFrequency}
                </p>
                {step > 1 && courierName && (
                  <p className="text-xs text-aurora-navy/50">
                    {courierName} · {fee > 0 ? money(fee) : 'Sin costo'}
                  </p>
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
            <span>Descuento por medio de pago</span>
            <span>-{money(savings)}</span>
          </div>
        )}
        <div className="flex justify-between text-aurora-navy/70">
          <span>Envío</span>
          <span>
            {step > 2 || (step === 2 && shippingTotal > 0)
              ? shippingTotal > 0
                ? money(shippingTotal)
                : 'Sin costo'
              : 'Se calcula en el paso 2'}
          </span>
        </div>
        <div className="flex justify-between pt-3 text-xl font-bold text-aurora-navy">
          <span>Total</span>
          <span>{money(grandTotal)}</span>
        </div>
      </div>
    </>
  );

  const renderAddress = () => (
    <SectionCard icon="pin" title="¿Dónde recibís tu caja?" subtitle="Usamos esta dirección para todos los envíos de tu orden.">
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
        {ADDRESS_FIELDS.map((field) => (
          <Field
            key={field.name}
            id={`addr-${field.name}`}
            label={field.label}
            error={addressErrors[field.name]}
            className={`col-span-1 ${field.span}`}
          >
            <input
              id={`addr-${field.name}`}
              name={field.name}
              value={address[field.name]}
              onChange={handleAddressChange}
              autoComplete={field.autoComplete}
              list={field.name === 'province' ? 'province-options' : undefined}
              aria-invalid={Boolean(addressErrors[field.name])}
              className={inputClass(addressErrors[field.name])}
            />
          </Field>
        ))}
        <datalist id="province-options">
          {PROVINCES.map((province) => (
            <option key={province} value={province} />
          ))}
        </datalist>
        <Field
          id="addr-instructions"
          label="Indicaciones para el repartidor (opcional)"
          className="col-span-1 sm:col-span-6"
        >
          <textarea
            id="addr-instructions"
            name="instructions"
            value={address.instructions}
            onChange={handleAddressChange}
            rows={3}
            maxLength={500}
            placeholder="Timbre, piso, horario de atención, entre qué calles..."
            className={inputClass()}
          />
        </Field>
      </div>

      <div className="mt-6">
        <h3 className="mb-1 text-sm font-semibold text-aurora-navy">Confirmá la ubicación</h3>
        <p className="mb-3 text-xs text-aurora-navy/60">
          Verificá que el pin coincida con tu domicilio. Si no, corregí la dirección y se actualiza solo.
        </p>
        <AddressMap geo={geo} status={geoStatus} onRetry={() => setGeoNonce((value) => value + 1)} />
      </div>
    </SectionCard>
  );

  const renderShipping = () => (
    <div className="space-y-6">
      <div className={`${cardClass} flex items-start justify-between gap-3 p-4 sm:p-5`}>
        <div className="flex items-start gap-3">
          <Icon name="pin" className="mt-0.5 h-5 w-5 flex-shrink-0 text-aurora-terracotta" />
          <div className="text-sm">
            <p className="font-semibold text-aurora-navy">Enviar a</p>
            <p className="text-aurora-navy/80">
              {address.street} {address.streetNumber}, {address.locality}, {address.city}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => goToStep(1)}
          className="min-h-[44px] px-2 text-sm font-semibold text-aurora-terracotta hover:underline"
        >
          Cambiar
        </button>
      </div>

      {shippingClubs.map((club) => {
        const clubItems = cartItems.filter((item) => item.club.id === club.clubId);
        return (
          <SectionCard
            key={club.clubId}
            icon="truck"
            title={`Envío de ${club.clubName}`}
            subtitle={clubItems.map((item) => item.plan.name).join(' · ')}
          >
            {club.couriers.length === 0 ? (
              <div className="flex items-start gap-3 rounded-xl bg-aurora-cream p-4 text-sm text-aurora-navy/80">
                <Icon name="box" className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <p>Este club coordina el envío con vos una vez confirmada la compra. No tiene costo adicional por ahora.</p>
              </div>
            ) : (
              <div className="space-y-3" role="radiogroup" aria-label={`Envío de ${club.clubName}`}>
                {club.couriers.map((courier) => (
                  <RadioCard
                    key={courier.id}
                    id={`courier-${club.clubId}-${courier.id}`}
                    name={`courier-${club.clubId}`}
                    checked={selectedCouriers[club.clubId] === courier.id}
                    onChange={() => {
                      setSelectedCouriers((prev) => ({ ...prev, [club.clubId]: courier.id }));
                      setStepError(null);
                    }}
                    icon="truck"
                    title={courier.name}
                    hint={courier.isInternal ? 'Reparto propio del club' : 'Servicio de mensajería'}
                    aside={courier.fee > 0 ? `${money(courier.fee)} por caja` : 'Sin costo'}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        );
      })}
    </div>
  );

  const renderPayment = () => (
    <SectionCard icon="card" title="¿Cómo querés pagar?" subtitle="Estos son los medios que aceptan los clubes de tu carrito.">
      {availableMethods.length === 0 ? (
        <p className="text-sm text-red-600">
          Los planes de tu carrito no comparten un medio de pago. Volvé al carrito y quitá alguno para continuar.
        </p>
      ) : (
        <div className="space-y-3" role="radiogroup" aria-label="Medio de pago">
          {availableMethods.map((method) => (
            <RadioCard
              key={method.id}
              id={`method-${method.id}`}
              name="payment-method"
              checked={selectedPaymentMethod === method.id}
              onChange={() => {
                setSelectedPaymentMethod(method.id);
                setTransferConfirmed(false);
                setStepError(null);
              }}
                            icon={method.icon}
              title={method.label}
              hint={method.hint}
            >
              {isMercadoPago && (
                <p className="text-sm text-aurora-navy/80">
                  Al confirmar la compra te llevamos a Mercado Pago para que pagues de forma segura con tarjeta, dinero en cuenta u otros medios. Cuando se apruebe, tu suscripción se activa automáticamente.
                </p>
              )}
              {isCardMethod && (
                <div>
                  <div className="mb-4">
                    <DemoNotice />
                  </div>
                  <CardPreview card={card} />
                  <div className="mb-4 flex justify-end">
                    <button
                      type="button"
                      onClick={fillTestCard}
                      className="min-h-[44px] rounded-lg border border-aurora-terracotta px-3 text-sm font-semibold text-aurora-terracotta hover:bg-aurora-terracotta/10"
                    >
                      Completar con datos de prueba
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field id="card-number" label="Número de tarjeta" error={cardErrors.number} className="sm:col-span-2">
                      <input
                        id="card-number"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="0000 0000 0000 0000"
                        value={card.number}
                        onChange={(e) => updateCard('number', formatCardNumber(e.target.value))}
                        aria-invalid={Boolean(cardErrors.number)}
                        className={inputClass(cardErrors.number)}
                      />
                    </Field>
                    <Field id="card-holder" label="Nombre del titular" error={cardErrors.holder} className="sm:col-span-2">
                      <input
                        id="card-holder"
                        autoComplete="off"
                        placeholder="Como figura en la tarjeta"
                        value={card.holder}
                        onChange={(e) => updateCard('holder', e.target.value.toUpperCase().slice(0, 40))}
                        aria-invalid={Boolean(cardErrors.holder)}
                        className={inputClass(cardErrors.holder)}
                      />
                    </Field>
                    <Field id="card-expiry" label="Vencimiento" error={cardErrors.expiry}>
                      <input
                        id="card-expiry"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="MM/AA"
                        value={card.expiry}
                        onChange={(e) => updateCard('expiry', formatExpiry(e.target.value))}
                        aria-invalid={Boolean(cardErrors.expiry)}
                        className={inputClass(cardErrors.expiry)}
                      />
                    </Field>
                    <Field id="card-cvv" label="Código de seguridad" error={cardErrors.cvv}>
                      <input
                        id="card-cvv"
                        inputMode="numeric"
                        autoComplete="off"
                        type="password"
                        placeholder="123"
                        value={card.cvv}
                        onChange={(e) => updateCard('cvv', digitsOnly(e.target.value).slice(0, 4))}
                        aria-invalid={Boolean(cardErrors.cvv)}
                        className={inputClass(cardErrors.cvv)}
                      />
                    </Field>
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-xs text-aurora-navy/50">
                    <Icon name="lock" className="h-4 w-4 flex-shrink-0" />
                    Estos datos solo se validan en tu navegador. No se envían ni se guardan.
                  </p>
                </div>
              )}

              {isTransfer && (
                <div>
                  <div className="mb-4">
                    <DemoNotice />
                  </div>
                  <div className="space-y-4">
                    {options.banks.map((bank) => (
                      <div key={bank.clubId} className="space-y-3 rounded-xl border border-aurora-navy/10 bg-white p-4">
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
                <p className="text-sm text-aurora-navy/70">
                  No pagás nada ahora. Abonás {money(grandTotal)} cuando recibas tu caja y el club registra el cobro.
                </p>
              )}
            </RadioCard>
          ))}
        </div>
      )}
    </SectionCard>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <SectionCard icon="shield" title="Revisá tu compra" subtitle="Confirmá que todo esté bien antes de finalizar.">
        <div className="divide-y divide-aurora-navy/10">
          <div className="flex items-start justify-between gap-3 pb-5">
            <div className="flex items-start gap-3">
              <Icon name="pin" className="mt-0.5 h-5 w-5 flex-shrink-0 text-aurora-terracotta" />
              <div className="text-sm">
                <p className="font-semibold text-aurora-navy">Dirección de entrega</p>
                <p className="text-aurora-navy/80">
                  {address.street} {address.streetNumber}, {address.locality}
                </p>
                <p className="text-aurora-navy/80">
                  {address.city}, {address.province} ({address.postalCode.toUpperCase()})
                </p>
                {address.instructions && <p className="mt-1 text-xs text-aurora-navy/50">{address.instructions}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="min-h-[44px] px-2 text-sm font-semibold text-aurora-terracotta hover:underline"
            >
              Editar
            </button>
          </div>

          <div className="flex items-start justify-between gap-3 py-5">
            <div className="flex items-start gap-3">
              <Icon name="truck" className="mt-0.5 h-5 w-5 flex-shrink-0 text-aurora-terracotta" />
              <div className="text-sm">
                <p className="font-semibold text-aurora-navy">Envío</p>
                {shippingClubs.map((club) => {
                  const name = courierNameForClub(club.clubId);
                  const fee = feeForClub(club.clubId);
                  return (
                    <p key={club.clubId} className="text-aurora-navy/80">
                      {club.clubName}: {name ?? 'Coordinado por el club'}
                      {name ? ` · ${fee > 0 ? `${money(fee)} por caja` : 'Sin costo'}` : ''}
                    </p>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="min-h-[44px] px-2 text-sm font-semibold text-aurora-terracotta hover:underline"
            >
              Editar
            </button>
          </div>

          <div className="flex items-start justify-between gap-3 pt-5">
            <div className="flex items-start gap-3">
              <Icon
                name={isTransfer ? 'bank' : isCash ? 'cash' : 'card'}
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-aurora-terracotta"
              />
              <div className="text-sm">
                <p className="font-semibold text-aurora-navy">Medio de pago</p>
                <p className="text-aurora-navy/80">{methodLabel}</p>
                {isCardMethod && <p className="text-xs text-aurora-navy/50">{maskedCard}</p>}
                {isTransfer && <p className="text-xs text-aurora-navy/50">Transferencia informada</p>}
                {isCash && <p className="text-xs text-aurora-navy/50">Pagás al recibir tu caja</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="min-h-[44px] px-2 text-sm font-semibold text-aurora-terracotta hover:underline"
            >
              Editar
            </button>
          </div>
        </div>

        {geoStatus === 'found' && geo && (
          <div className="mt-6">
            <AddressMap geo={geo} status={geoStatus} onRetry={() => setGeoNonce((value) => value + 1)} heightClass="h-44" />
          </div>
        )}
      </SectionCard>

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
            {isMercadoPago ? 'Abriendo Mercado Pago…' : isCardMethod ? 'Procesando tu pago…' : 'Registrando tu compra…'}
           </p>
          <p className="text-sm text-white/80">No cierres ni recargues esta página.</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-aurora-navy">Finalizar compra</h1>
          <span className="flex items-center gap-2 text-sm font-semibold text-aurora-navy/70">
            <Icon name="lock" className="h-4 w-4" />
            Conexión segura
          </span>
        </div>

        <div className="mb-6">
          <DemoNotice />
        </div>

        <nav aria-label="Pasos de la compra" className="mb-8 max-w-3xl mx-auto">
          <ol className="flex items-start">
            {STEPS.map((label, index) => {
              const number = index + 1;
              const done = number < step;
              const current = number === step;
              return (
                <li
                  key={label}
                  className="relative flex flex-1 flex-col items-center"
                  aria-current={current ? 'step' : undefined}
                >
                  {index > 0 && (
                    <span
                      className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${
                        number <= step ? 'bg-aurora-terracotta' : 'bg-aurora-navy/15'
                      }`}
                    />
                  )}
                  <button
                    type="button"
                    disabled={!done}
                    onClick={() => goToStep(number)}
                    className="relative z-10 flex min-h-[44px] flex-col items-center gap-1 disabled:cursor-default"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${
                        done
                          ? 'border-aurora-terracotta bg-aurora-terracotta text-white'
                          : current
                            ? 'border-aurora-navy bg-aurora-navy text-white'
                            : 'border-aurora-navy/20 bg-white text-aurora-navy/50'
                      }`}
                    >
                      {done ? <Icon name="check" className="h-4 w-4" /> : number}
                    </span>
                    <span className={`text-xs font-semibold ${current ? 'text-aurora-navy' : 'text-aurora-navy/50'}`}>
                      {label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <details className="lg:hidden mb-6 rounded-2xl border border-aurora-navy/10 bg-white shadow-aurora-sm">
          <summary className="flex min-h-[52px] cursor-pointer items-center justify-between px-4 py-3 font-semibold text-aurora-navy">
            <span>Resumen de tu orden</span>
            <span>{money(grandTotal)}</span>
          </summary>
          <div className="px-4 pb-4">{renderSummaryBody()}</div>
        </details>

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

            <div
              className={
                isNativeApp()
                  ? 'sticky bottom-0 z-30 -mx-4 flex items-center justify-between gap-3 border-t border-aurora-navy/10 bg-white/95 px-4 pt-3 backdrop-blur-md'
                  : 'flex flex-wrap items-center justify-between gap-3'
              }
              style={
                isNativeApp()
                  ? { paddingBottom: 'calc(0.75rem + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))' }
                  : undefined
              }
            >
              {step === 1 ? (
                <button type="button" onClick={() => navigate('/cart')} className={secondaryButtonClass}>
                  Volver al carrito
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goToStep(step - 1)}
                  disabled={isProcessing}
                  className={secondaryButtonClass}
                >
                  Atrás
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={step === 3 && availableMethods.length === 0}
                  className={primaryButtonClass}
                >
                  Continuar
                </button>
              ) : (
                <button type="button" onClick={handleConfirm} disabled={isProcessing} className={primaryButtonClass}>
                  Confirmar compra · {money(grandTotal)}
                </button>
              )}
            </div>
            {step === 4 && (
              <p className="text-center text-xs text-aurora-navy/50">
                Al confirmar aceptás los términos y condiciones de AuraBox.
              </p>
            )}
          </div>

          <aside className={`${cardClass} hidden p-6 lg:sticky lg:top-24 lg:block`}>
            <h2 className="mb-4 text-xl font-serif font-bold text-aurora-navy">Resumen de tu orden</h2>
            {renderSummaryBody()}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;