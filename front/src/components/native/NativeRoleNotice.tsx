import React from 'react';
import { UserRole } from '../../types/user';

interface NativeRoleNoticeProps {
  role: UserRole;
  onLogout: () => void;
}

const NativeRoleNotice: React.FC<NativeRoleNoticeProps> = ({ role, onLogout }) => {
  const isAdmin = role === 'admin';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-aurora-cream px-6 text-center safe-top safe-bottom safe-x">
      <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white p-3 shadow-aurora-sm">
        <img src="/aurabox-mark.svg" alt="AuraBox" className="h-full w-full" />
      </span>
      <h1 className="font-display text-2xl font-bold text-aurora-navy">
        {isAdmin ? 'La administración está en la web' : 'Tu panel está en la web'}
      </h1>
      <p className="mt-3 max-w-sm text-base leading-relaxed text-aurora-ink/75">
        {isAdmin
          ? 'Para gestionar la plataforma usá AuraBox desde una computadora. Esta app está pensada para quienes compran y disfrutan sus cajas.'
          : 'Para administrar tu emprendimiento, tus planes, envíos y finanzas, ingresá desde una computadora. Esta app está pensada para quienes compran y disfrutan sus cajas.'}
      </p>
      <a
        href="https://aura-box-blond.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-aurora-navy px-8 font-semibold text-white shadow-aurora-sm active:bg-aurora-navyDark"
      >
        Abrir AuraBox en el navegador
      </a>
      <button
        type="button"
        onClick={onLogout}
        className="mt-3 inline-flex min-h-[48px] items-center justify-center rounded-xl px-8 font-semibold text-aurora-terracotta active:bg-aurora-creamDark"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default NativeRoleNotice;