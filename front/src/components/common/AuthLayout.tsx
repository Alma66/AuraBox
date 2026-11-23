import React from 'react';

interface AuthLayoutProps {
  panelEyebrow: string;
  panelTitle: string;
  panelText: string;
  points: string[];
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ panelEyebrow, panelTitle, panelText, points, children }) => (
  <div className="min-h-[calc(100vh-64px)] lg:grid lg:grid-cols-2">
    <aside className="hero-mesh grain relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex xl:p-16">
      <img src="/aurabox-mark.svg" alt="AuraBox" className="h-12 w-12 rounded-xl shadow-aurora" />
      <div className="relative max-w-md">
        <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-aurora-goldLight">{panelEyebrow}</span>
        <h2 className="font-display text-5xl font-normal leading-tight">{panelTitle}</h2>
        <p className="mt-5 text-lg leading-relaxed text-white/80">{panelText}</p>
        <ul className="mt-8 space-y-4">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-white/90">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
                <svg className="h-3.5 w-3.5 text-aurora-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm text-white/50">AuraBox · Cajas de suscripción de emprendedores argentinos</p>
    </aside>
    <main className="relative flex items-center justify-center overflow-hidden bg-aurora-cream px-4 py-12 sm:px-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-aurora-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-aurora-terracotta/10 blur-3xl" />
      <div className="relative w-full max-w-md">{children}</div>
    </main>
  </div>
);

export default AuthLayout;