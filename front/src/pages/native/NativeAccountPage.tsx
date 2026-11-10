import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';
import { useAuth } from '../../App';
import BottomSheet from '../../components/native/BottomSheet';
import { tapFeedback } from '../../utils/native';

interface ProfileSummary {
  firstName: string;
  lastName: string;
  email: string;
  registrationDate?: string;
}

const ICONS = {
  orders: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
  subscriptions:
    'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  heart:
    'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
  star:
    'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
  user: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  pin: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
  lock: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
  sliders:
    'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75',
  help: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z',
  mail: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
  info: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
  document:
    'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  logout:
    'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9',
};

type IconKey = keyof typeof ICONS;

interface RowProps {
  icon: IconKey;
  label: string;
  hint?: string;
  to?: string;
  onClick?: () => void;
  danger?: boolean;
  last?: boolean;
}

const MenuIcon: React.FC<{ icon: IconKey; danger?: boolean }> = ({ icon, danger }) => (
  <span
    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
      danger ? 'bg-red-50 text-red-600' : 'bg-aurora-terracotta/10 text-aurora-terracotta'
    }`}
  >
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[icon]} />
    </svg>
  </span>
);

const Row: React.FC<RowProps> = ({ icon, label, hint, to, onClick, danger, last }) => {
  const className = `flex min-h-[60px] w-full items-center gap-3 px-4 text-left transition-colors active:bg-aurora-cream ${
    last ? '' : 'border-b border-aurora-navy/5'
  }`;
  const content = (
    <>
      <MenuIcon icon={icon} danger={danger} />
      <span className="min-w-0 flex-1">
        <span className={`block text-[15px] font-semibold ${danger ? 'text-red-600' : 'text-aurora-navy'}`}>{label}</span>
        {hint && <span className="block truncate text-xs text-aurora-navy/50">{hint}</span>}
      </span>
      {!danger && (
        <svg className="h-4 w-4 shrink-0 text-aurora-navy/30" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      )}
    </>
  );
  if (to) {
    return (
      <Link
        to={to}
        onClick={() => {
          tapFeedback();
        }}
        className={className}
      >
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        tapFeedback();
        onClick?.();
      }}
      className={className}
    >
      {content}
    </button>
  );
};

const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mt-6">
    <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-aurora-navy/45">{title}</h2>
    <div className="overflow-hidden rounded-3xl bg-white shadow-aurora-sm ring-1 ring-aurora-navy/5">{children}</div>
  </section>
);

const NativeAccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await api.get('/users/me');
        const data = getResponseData(response);
        if (active && data) {
          setProfile({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            registrationDate: data.registrationDate,
          });
        }
      } catch {
        if (active) setProfile(null);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const firstName = profile?.firstName ?? user?.firstName ?? '';
  const lastName = profile?.lastName ?? user?.lastName ?? '';
  const email = profile?.email ?? user?.email ?? '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'A';
  const memberSince = profile?.registrationDate ? new Date(profile.registrationDate).getFullYear() : null;

  const handleLogout = () => {
    setConfirmLogout(false);
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="px-4 pb-8 pt-5">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-aurora-navy via-aurora-navy to-aurora-navyLight p-5 text-white shadow-aurora">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-aurora-terracotta/30 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-aurora-terracotta font-display text-2xl font-bold shadow-aurora-sm">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-2xl font-bold leading-tight">
              {firstName} {lastName}
            </p>
            <p className="truncate text-sm text-white/70">{email}</p>
            {memberSince && <p className="mt-1 text-xs text-white/55">Miembro desde {memberSince}</p>}
          </div>
        </div>
      </div>

      <Group title="Mis compras">
        <Row icon="orders" label="Mis pedidos" hint="Envíos y pagos" to="/customer/orders" />
        <Row icon="subscriptions" label="Mis suscripciones" hint="Cajas activas e historial" to="/customer/subscriptions" />
        <Row icon="heart" label="Mis favoritos" to="/customer/wishlist" />
        <Row icon="star" label="Mis reseñas" to="/customer/reviews" last />
      </Group>

      <Group title="Mi cuenta">
        <Row icon="user" label="Mis datos" hint="Nombre, nacimiento y contacto" to="/customer/account/profile" />
        <Row icon="pin" label="Ubicación" hint="Dirección de entrega" to="/customer/account/location" />
        <Row icon="lock" label="Seguridad y privacidad" to="/customer/account/security" />
        <Row icon="sliders" label="Configuración" hint="Notificaciones y newsletter" to="/customer/account/settings" last />
      </Group>

      <Group title="Ayuda">
        <Row icon="help" label="Preguntas frecuentes" to="/faq" />
        <Row icon="mail" label="Contacto" to="/contact" />
        <Row icon="info" label="Sobre AuraBox" to="/about-us" />
        <Row icon="document" label="Reglas de la plataforma" to="/platform-rules" last />
      </Group>

      <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-aurora-sm ring-1 ring-aurora-navy/5">
        <Row icon="logout" label="Cerrar sesión" danger onClick={() => setConfirmLogout(true)} last />
      </div>

      <BottomSheet
        open={confirmLogout}
        title="Cerrar sesión"
        onClose={() => setConfirmLogout(false)}
        footer={
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[48px] w-full rounded-full bg-red-600 font-semibold text-white transition-transform active:scale-95"
            >
              Sí, cerrar sesión
            </button>
            <button
              type="button"
              onClick={() => setConfirmLogout(false)}
              className="min-h-[48px] w-full rounded-full font-semibold text-aurora-navy active:bg-aurora-cream"
            >
              Cancelar
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-aurora-navy/75">
          Vas a salir de tu cuenta en este dispositivo. Tu carrito y tus suscripciones quedan guardados.
        </p>
      </BottomSheet>
    </div>
  );
};

export default NativeAccountPage;