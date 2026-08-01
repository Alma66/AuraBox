import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CONTACT_EMAIL = 'info@aurabox.com.ar';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Nombre: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`;
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(formData.subject || 'Consulta desde AuraBox')}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-aurora-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="section-eyebrow block">Estamos para ayudarte</span>
          <h1 className="font-display text-5xl font-bold text-aurora-navy mb-4 leading-tight">
            Contactanos en <span className="text-aurora-terracotta">AuraBox</span>
          </h1>
          <p className="text-xl text-aurora-navy/60 max-w-3xl mx-auto">
            Envianos un mensaje o encontrá la información que necesitás.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="card-surface shadow-aurora p-8 md:p-10">
            <h2 className="font-display text-3xl font-bold text-aurora-navy mb-6 flex items-center justify-center">
              <svg className="text-aurora-terracotta mr-3 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Envianos un Mensaje
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-aurora-navy/70">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-aurora mt-1"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-aurora-navy/70">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-aurora mt-1"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-aurora-navy/70">
                  Asunto
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="input-aurora mt-1"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-aurora-navy/70">
                  Tu Mensaje
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="input-aurora mt-1 resize-none"
                ></textarea>
              </div>
              <button type="submit" className="btn-primary w-full">
                Enviar Mensaje
              </button>
              <p className="text-xs text-aurora-navy/40 text-center">
                Se abrirá tu aplicación de correo con el mensaje ya redactado hacia {CONTACT_EMAIL}.
              </p>
              {sent && (
                <p className="text-green-600 text-center font-medium">
                  Se abrió tu cliente de correo con el mensaje listo para enviar. Si no se abrió, escribinos directamente a {CONTACT_EMAIL}.
                </p>
              )}
            </form>
          </div>

          <div className="space-y-8">
            <div className="card-surface shadow-aurora p-8 md:p-10">
              <h2 className="font-display text-3xl font-bold text-aurora-navy mb-6 flex items-center justify-center">
                <svg className="text-aurora-terracotta mr-3 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Nuestra Información
              </h2>
              <div className="space-y-4 text-aurora-navy/75 text-lg">
                <p className="flex items-center">
                  <svg className="text-aurora-terracotta mr-3 w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Av. Corrientes 1234, CABA, Argentina
                </p>
                <p className="flex items-center">
                  <svg className="text-aurora-terracotta mr-3 w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +54 9 11 1234-5678
                </p>
                <p className="flex items-center">
                  <svg className="text-aurora-terracotta mr-3 w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {CONTACT_EMAIL}
                </p>
                <p className="flex items-center">
                  <svg className="text-aurora-terracotta mr-3 w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lunes a Viernes: 9:00 AM - 6:00 PM (GMT-3)
                </p>
              </div>
            </div>

            <div className="card-surface shadow-aurora p-8 md:p-10 text-center">
              <h2 className="font-display text-3xl font-bold text-aurora-navy mb-6">Seguinos en Redes</h2>
              <div className="flex justify-center space-x-6">
                <a href="https://facebook.com/aurabox" target="_blank" rel="noopener noreferrer" className="text-aurora-navy/50 hover:text-aurora-terracotta transition-colors duration-200">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18.18-9C3.868 9.303 5.09 12 8 12h3.5a2 2 0 002 2 2 2 0 002-2 2 2 0 012-2h3.5a2 2 0 002 2 2 2 0 002-2 2 2 0 00-2-2h-.5M12 12a2 2 0 00-2-2 2 2 0 00-2 2 2 2 0 002 2 2 2 0 002-2z" />
                  </svg>
                </a>
                <a href="https://instagram.com/aurabox_ar" target="_blank" rel="noopener noreferrer" className="text-aurora-navy/50 hover:text-aurora-terracotta transition-colors duration-200">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </a>
                <a href="https://twitter.com/aurabox_ar" target="_blank" rel="noopener noreferrer" className="text-aurora-navy/50 hover:text-aurora-terracotta transition-colors duration-200">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9 8s9 3.582 9 8z" />
                  </svg>
                </a>
                <a href="https://linkedin.com/company/aurabox" target="_blank" rel="noopener noreferrer" className="text-aurora-navy/50 hover:text-aurora-terracotta transition-colors duration-200">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="card-surface shadow-aurora p-8 md:p-10">
              <h2 className="font-display text-3xl font-bold text-aurora-navy mb-6 text-center">Dónde Encontrarnos</h2>
              <div className="rounded-xl overflow-hidden shadow-aurora-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.016887889581!2d-58.3815923847709!3d-34.6037224804594!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccac32561d17b%3A0x5e2d1a0a1b2c3d4e!2sAv.%20Corrientes%201234%2C%20C1043AAU%20CABA!5e0!3m2!1ses-419!2sar!4v1678901234567!5m2!1ses-419!2sar"
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de AuraBox"
                ></iframe>
              </div>
              <p className="text-sm text-aurora-navy/50 mt-4 text-center">
                Visitanos en nuestra oficina central. ¡Te esperamos!
              </p>
            </div>

            <div className="card-surface shadow-aurora p-8 md:p-10">
              <h2 className="font-display text-3xl font-bold text-aurora-navy mb-6">Información Adicional</h2>
              <p className="text-aurora-navy/70 leading-relaxed mb-4">
                ¿Tenés preguntas sobre cómo funciona AuraBox? Te invitamos a visitar nuestra sección de preguntas frecuentes.
                Los términos y políticas de cada club los encontrás dentro del perfil de ese club.
              </p>
              <Link to="/faq" className="text-aurora-terracotta hover:text-aurora-terracottaDark font-medium flex items-center">
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Preguntas Frecuentes (FAQ)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;