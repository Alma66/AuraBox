import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LegalContentModal from './LegalContentModal';
import { LegalSection } from '../../types/legalSection';

const AURABOX_TERMS: LegalSection[] = [
  { id: 'ab-terms-1', type: 'title', content: 'Términos y Condiciones de AuraBox' },
  {
    id: 'ab-terms-2',
    type: 'paragraph',
    content: 'Este es un texto de referencia (placeholder) que debe ser reemplazado por el contenido legal definitivo redactado por el equipo legal de AuraBox antes de salir a producción.',
  },
  {
    id: 'ab-terms-3',
    type: 'list',
    content: [
      'AuraBox actúa como intermediario tecnológico entre clubes de suscripción y usuarios finales.',
      'Cada club es responsable de la calidad, legalidad y entrega de sus productos.',
      'El uso de la plataforma implica la aceptación de estas condiciones.',
    ],
  },
];

const AURABOX_PRIVACY: LegalSection[] = [
  { id: 'ab-privacy-1', type: 'title', content: 'Política de Seguridad y Privacidad de AuraBox' },
  {
    id: 'ab-privacy-2',
    type: 'paragraph',
    content: 'Este es un texto de referencia (placeholder) que debe ser reemplazado por el contenido legal definitivo redactado por el equipo legal de AuraBox antes de salir a producción.',
  },
];

const Footer: React.FC = () => {
  const [openModal, setOpenModal] = useState<'terms' | 'privacy' | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSent(true);
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-aurora-navy text-white pt-16 pb-8 mt-12 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-aurora-terracotta/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-aurora-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-1">
            <h3 className="font-display text-2xl font-bold mb-3 text-white">AuraBox</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Profesionalizando la experiencia de los clubes de suscripción en Argentina.
              Descubrí, gestioná y disfrutá tus cajas sorpresa favoritas.
            </p>
            <div className="flex space-x-3">
            
              <a    href="https://www.instagram.com/aurabox_ar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-aurora-gold hover:bg-white/20 transition-all duration-200 transform hover:scale-110"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.132 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.333 1.079 2.126 1.384.765.297 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.333 1.384-2.126.297-.765.499-1.636.558-2.913.06-1.277.072-1.684.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.148-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.35 1.935 20.684 1.522 19.897 1.216c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.2 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.899.42.42.68.818.899 1.382.166.422.36 1.057.415 2.227.056 1.265.07 1.65.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.9 1.382-.42.42-.818.68-1.382.899-.422.166-1.057.36-2.227.415-1.265.056-1.65.07-4.85.07s-3.585-.015-4.85-.074c-1.17-.061-1.805-.256-2.227-.421-.224-.562-.479-.96-.9-1.382-.42-.42-.818-.68-1.382-.899-.422-.166-1.057-.36-2.227-.415C2.16 15.585 2.16 15.2 2.16 12s.015-3.585.074-4.85c.061-1.17.256-1.805.421-2.227.224-.562.479-.96.9-1.382.42-.42.818-.68 1.382-.899.422-.166 1.057-.36 2.227-.415C8.415 2.16 8.8 2.16 12 2.16zm0 3.635c-3.402 0-6.16 2.758-6.16 6.16s2.758 6.16 6.16 6.16 6.16-2.758 6.16-6.16c0-3.403-2.758-6.16-6.16-6.16zm0 10.16c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.44-.645 1.44-1.44s-.645-1.44-1.44-1.44z" clipRule="evenodd" />
                </svg>
              </a>
              
              <a    href="https://www.facebook.com/aurabox_ar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-aurora-gold hover:bg-white/20 transition-all duration-200 transform hover:scale-110"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.776-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V22H12c5.523 0 10-4.477 10-10z" clipRule="evenodd" />
                </svg>
              </a>
              
             <a     href="https://twitter.com/aurabox_ar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-aurora-gold hover:bg-white/20 transition-all duration-200 transform hover:scale-110"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012 10.77a4.096 4.096 0 003.29 4.027 4.115 4.115 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold mb-4 text-white">Explorar</h3>
            <ul className="space-y-2.5">
              <li><Link to="/explore" className="text-white/60 hover:text-aurora-gold transition-colors duration-200 text-sm">Todos los Clubes</Link></li>
              <li><Link to="/register" className="text-white/60 hover:text-aurora-gold transition-colors duration-200 text-sm">Registrate como Cliente</Link></li>
              <li><Link to="/faq" className="text-white/60 hover:text-aurora-gold transition-colors duration-200 text-sm">Preguntas Frecuentes</Link></li>
              <li><Link to="/about-us" className="text-white/60 hover:text-aurora-gold transition-colors duration-200 text-sm">Sobre Nosotros</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold mb-4 text-white">Legal y Contacto</h3>
            <ul className="space-y-2.5 mb-4">
              <li>
                <button onClick={() => setOpenModal('terms')} className="text-white/60 hover:text-aurora-gold transition-colors duration-200 text-sm text-left">
                  Términos y Condiciones
                </button>
              </li>
              <li>
                <button onClick={() => setOpenModal('privacy')} className="text-white/60 hover:text-aurora-gold transition-colors duration-200 text-sm text-left">
                  Política de Seguridad y Privacidad
                </button>
              </li>
            </ul>
            <p className="text-white/60 text-sm">info@aurabox.com</p>
            <p className="text-white/60 text-sm">+54 9 11 1234-5678</p>
            <p className="text-sm mt-2">
              <Link to="/contact" className="text-aurora-gold hover:text-aurora-goldLight underline transition-colors duration-200">Envianos un mensaje</Link>
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold mb-4 text-white">Novedades AuraBox</h3>
            <p className="text-white/60 text-sm mb-4">
              Enterate de clubes nuevos y promos exclusivas antes que nadie.
            </p>
            {newsletterSent ? (
              <p className="text-aurora-gold text-sm font-semibold">¡Gracias! Ya estás suscripto ✨</p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-grow min-w-0 px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-aurora-gold/50"
                />
                <button type="submit" className="bg-aurora-terracotta hover:bg-aurora-terracottaLight text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 flex-shrink-0">
                  Unirme
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-white/40 text-xs">
          <p>&copy; {new Date().getFullYear()} AuraBox. Todos los derechos reservados.</p>
          <p>Hecho con 🧡 en Argentina</p>
        </div>
      </div>

      {openModal === 'terms' && (
        <LegalContentModal title="Términos y Condiciones de AuraBox" sections={AURABOX_TERMS} onClose={() => setOpenModal(null)} />
      )}
      {openModal === 'privacy' && (
        <LegalContentModal title="Política de Seguridad y Privacidad de AuraBox" sections={AURABOX_PRIVACY} onClose={() => setOpenModal(null)} />
      )}
    </footer>
  );
};

export default Footer;