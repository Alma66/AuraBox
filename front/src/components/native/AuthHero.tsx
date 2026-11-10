import React from 'react';

interface AuthHeroProps {
  title: string;
  subtitle: string;
}

const AuthHero: React.FC<AuthHeroProps> = ({ title, subtitle }) => (
  <div className="relative overflow-hidden bg-gradient-to-br from-aurora-navy via-aurora-navy to-aurora-navyLight px-6 pb-14 pt-8 text-center text-white">
    <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-aurora-gold/25 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-aurora-terracotta/35 blur-3xl" />
    <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-aurora-cream p-2 shadow-aurora">
      <img src="/aurabox-mark.svg" alt="" className="h-full w-full" />
    </span>
    <h1 className="relative mt-4 font-display text-3xl font-bold leading-tight">{title}</h1>
    <p className="relative mt-1 text-sm text-white/70">{subtitle}</p>
  </div>
);

export default AuthHero;