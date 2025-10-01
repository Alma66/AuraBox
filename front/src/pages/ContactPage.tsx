// FileName: src/pages/ContactPage.tsx
import React, { useState } from 'react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setError(null);

    // Simulación de envío de datos
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simula un delay de red
      console.log('Formulario enviado:', formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' }); // Limpiar formulario
    } catch (err) {
      console.error('Error al enviar el formulario:', err);
      setError('Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Sección de Título */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Contáctanos en <span className="text-blue-600">AuraBox</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Estamos aquí para ayudarte. Envíanos un mensaje o encuentra la información que necesitas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Columna Izquierda: Formulario de Contacto */}
          <div className="bg-white shadow-xl rounded-lg p-8 md:p-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center">
              {/* Heroicon: Envelope */}
              <svg className="text-blue-500 mr-3 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Envíanos un Mensaje
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Asunto
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Tu Mensaje
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </div>
              {status === 'success' && (
                <p className="text-green-600 text-center font-medium">
                  ¡Gracias! Tu mensaje ha sido enviado con éxito. Te responderemos a la brevedad.
                </p>
              )}
              {status === 'error' && (
                <p className="text-red-600 text-center font-medium">
                  {error || 'Ocurrió un error. Por favor, inténtalo de nuevo.'}
                </p>
              )}
            </form>
          </div>

          {/* Columna Derecha: Información de Contacto y Otros Detalles */}
          <div className="space-y-8">
            {/* Información de Contacto */}
            <div className="bg-white shadow-xl rounded-lg p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                {/* Heroicon: Phone */}
                <svg className="text-blue-500 mr-3 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Nuestra Información
              </h2>
              <div className="space-y-4 text-gray-700 text-lg">
                <p className="flex items-center">
                  {/* Heroicon: Map Marker */}
                  <svg className="text-blue-500 mr-3 text-xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Av. Corrientes 1234, CABA, Argentina
                </p>
                <p className="flex items-center">
                  {/* Heroicon: Phone */}
                  <svg className="text-blue-500 mr-3 text-xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +54 9 11 1234-5678
                </p>
                <p className="flex items-center">
                  {/* Heroicon: Envelope */}
                  <svg className="text-blue-500 mr-3 text-xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@aurabox.com.ar
                </p>
                <p className="flex items-center">
                  {/* Heroicon: Clock */}
                  <svg className="text-blue-500 mr-3 text-xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lunes a Viernes: 9:00 AM - 6:00 PM (GMT-3)
                </p>
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="bg-white shadow-xl rounded-lg p-8 md:p-10 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Síguenos en Redes</h2>
              <div className="flex justify-center space-x-6 text-4xl">
                {/* Facebook - Globe alternative */}
                <a href="https://facebook.com/aurabox" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 transition-colors duration-200">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18.18-9C3.868 9.303 5.09 12 8 12h3.5a2 2 0 002 2 2 2 0 002-2 2 2 0 012-2h3.5a2 2 0 002 2 2 2 0 002-2 2 2 0 00-2-2h-.5M12 12a2 2 0 00-2-2 2 2 0 00-2 2 2 2 0 002 2 2 2 0 002-2z" />
                  </svg>
                </a>
                {/* Instagram - Camera alternative */}
                <a href="https://instagram.com/aurabox_ar" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 transition-colors duration-200">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </a>
                {/* Twitter - Chat Bubble alternative */}
                <a href="https://twitter.com/aurabox_ar" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600 transition-colors duration-200">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </a>
                {/* LinkedIn - Users alternative */}
                <a href="https://linkedin.com/company/aurabox" target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:text-blue-900 transition-colors duration-200">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </a>
              </div>
            </div>

                        {/* Mapa de Ubicación (iframe de Google Maps) */}
            <div className="bg-white shadow-xl rounded-lg p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Dónde Encontrarnos</h2>
              <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden shadow-md">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.016887889581!2d-58.3815923847709!3d-34.6037224804594!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccac32561d17b%3A0x5e2d1a0a1b2c3d4e!2sAv.%20Corrientes%201234%2C%20C1043AAU%20CABA!5e0!3m2!1ses-419!2sar!4v1678901234567!5m2!1ses-419!2sar"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de AuraBox"
                ></iframe>
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Visítanos en nuestra oficina central. ¡Te esperamos!
              </p>
            </div>

            {/* Sección de Preguntas Frecuentes o Aviso Legal */}
            <div className="bg-white shadow-xl rounded-lg p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Información Adicional</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ¿Tienes preguntas sobre cómo funciona AuraBox, nuestras políticas de privacidad o los términos de servicio? Te invitamos a visitar nuestras secciones dedicadas para encontrar respuestas rápidas.
              </p>
              <div className="flex flex-col space-y-3">
                <a href="/faq" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                  {/* Heroicon: Lightbulb */}
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Preguntas Frecuentes (FAQ)
                </a>
                <a href="/terms-and-conditions" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                  {/* Heroicon: Handshake */}
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Términos y Condiciones
                </a>
                <a href="/privacy-and-security" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                  {/* Heroicon: Heart */}
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Política de Privacidad y Seguridad
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;