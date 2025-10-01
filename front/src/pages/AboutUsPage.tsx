import React from 'react';

const AboutUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Nuestra Historia</h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed">
            AuraBox nació de la pasión por conectar emprendedores argentinos con suscriptores que buscan experiencias únicas. 
            Somos la plataforma que transforma clubes de suscripción en comunidades vibrantes y sostenibles.
          </p>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Misión */}
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
                {/* Heroicon: Rocket (para Misión/Innovación) */}
                <svg className="text-blue-500 mr-3 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Nuestra Misión
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Empoderar a los emprendedores argentinos, brindándoles las herramientas tecnológicas y el soporte necesario para profesionalizar y escalar sus clubes de suscripción, mientras creamos una experiencia de descubrimiento y conexión inigualable para los suscriptores.
              </p>
            </div>
            {/* Visión */}
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
                {/* Heroicon: Lightbulb (para Visión/Ideas) */}
                <svg className="text-indigo-500 mr-3 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Nuestra Visión
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Ser la plataforma líder en Latinoamérica para clubes de suscripción, reconocida por su innovación, su comunidad vibrante y su compromiso con la autenticidad y el crecimiento sostenible de los pequeños y medianos emprendimientos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Nuestros Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Pasión */}
            <div className="bg-white rounded-lg shadow-lg p-8 transform transition duration-300 hover:scale-105 hover:shadow-2xl">
              {/* Heroicon: Heart (para Pasión) */}
              <svg className="text-red-500 text-5xl mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Pasión</h3>
              <p className="text-gray-600">Creemos en el poder de los productos hechos con amor y en la emoción de la sorpresa mensual.</p>
            </div>
            {/* Comunidad */}
            <div className="bg-white rounded-lg shadow-lg p-8 transform transition duration-300 hover:scale-105 hover:shadow-2xl">
              {/* Heroicon: Handshake (para Comunidad) */}
              <svg className="text-green-500 text-5xl mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Comunidad</h3>
              <p className="text-gray-600">Fomentamos la conexión entre emprendedores y suscriptores, construyendo lazos duraderos.</p>
            </div>
            {/* Transparencia */}
            <div className="bg-white rounded-lg shadow-lg p-8 transform transition duration-300 hover:scale-105 hover:shadow-2xl">
              {/* Heroicon: Users (para Transparencia/Equipo) */}
              <svg className="text-purple-500 text-5xl mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Transparencia</h3>
              <p className="text-gray-600">Ofrecemos claridad en cada proceso, desde el pago hasta la entrega, generando confianza.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo o Footer */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Nuestro Equipo</h2>
          <p className="text-lg text-gray-700 mb-12">
            Un grupo de apasionados por el emprendimiento y la tecnología, trabajando para hacer de AuraBox la mejor plataforma posible.
          </p>
          <div className="flex justify-center space-x-6">
            {/* Iconos sociales con Heroicons (ejemplos simples) */}
            <a href="#" className="text-white hover:text-yellow-300 transition-colors duration-200 bg-blue-600 p-3 rounded-full">
              {/* Heroicon: Handshake (para LinkedIn o similar) */}
              <svg className="text-2xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </a>
            <a href="#" className="text-white hover:text-yellow-300 transition-colors duration-200 bg-indigo-600 p-3 rounded-full">
              {/* Heroicon: Rocket (para GitHub o innovación) */}
              <svg className="text-2xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;