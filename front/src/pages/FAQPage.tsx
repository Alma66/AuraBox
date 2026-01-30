import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: '¿Qué es AuraBox y cómo funciona?',
    answer: 'AuraBox es una plataforma que conecta a emprendedores de clubes de suscripción con suscriptores en Argentina. Te permite descubrir nuevos clubes, gestionar tus suscripciones, realizar pagos de forma segura y seguir tus entregas, todo desde un único lugar. Para los emprendedores, ofrece herramientas de gestión, visibilidad y marketing para profesionalizar su negocio.',
    category: 'General',
    keywords: ['AuraBox', 'funciona', 'qué es', 'plataforma', 'suscripción']
  },
  {
    id: '2',
    question: '¿Cómo puedo registrarme como suscriptor?',
    answer: 'Puedes registrarte fácilmente haciendo clic en el botón "Registrarse" en la esquina superior derecha de la página. Solo necesitarás proporcionar algunos datos básicos y podrás empezar a explorar clubes de inmediato.',
    category: 'Suscriptores',
    keywords: ['registro', 'suscriptor', 'cuenta', 'crear']
  },
  {
    id: '3',
    question: '¿Cómo puedo registrar mi club en AuraBox?',
    answer: 'Si eres un emprendedor y deseas registrar tu club, dirígete a la sección "Para Emprendedores" en el pie de página o en la barra de navegación. Allí encontrarás toda la información y los pasos para unirte a nuestra comunidad de clubes.',
    category: 'Emprendedores',
    keywords: ['registro', 'club', 'emprendedor', 'vender', 'publicar']
  },
  {
    id: '4',
    question: '¿Qué métodos de pago acepta AuraBox?',
    answer: 'AuraBox integra pasarelas de pago seguras como MercadoPago, permitiendo pagos con tarjeta de crédito/débito y débito automático. Todas las transacciones son procesadas de forma segura para tu tranquilidad.',
    category: 'Pagos',
    keywords: ['pago', 'métodos', 'MercadoPago', 'tarjeta', 'seguridad']
  },
  {
    id: '5',
    question: '¿Puedo pausar o cancelar mi suscripción en cualquier momento?',
    answer: 'Sí, AuraBox te ofrece total flexibilidad. Puedes pausar o cancelar tus suscripciones directamente desde tu panel de usuario con un solo clic, sin necesidad de contactar al club directamente. Queremos que tengas el control total de tus suscripciones.',
    category: 'Suscriptores',
    keywords: ['pausar', 'cancelar', 'suscripción', 'flexibilidad']
  },
  {
    id: '6',
    question: '¿Cómo puedo seguir el estado de mi envío?',
    answer: 'Desde tu panel de usuario, tendrás acceso a un sistema de seguimiento en tiempo real con un timeline visual. Recibirás notificaciones push sobre el estado de tu entrega, desde que sale del club hasta que llega a tu domicilio.',
    category: 'Entregas',
    keywords: ['envío', 'seguimiento', 'tracking', 'entrega', 'paquete']
  },
  {
    id: '7',
    question: '¿Cómo se asegura la calidad de los clubes en AuraBox?',
    answer: 'AuraBox implementa un sistema de "Club Verificado" basado en criterios de calidad, atención al cliente y cumplimiento. Además, las reseñas y calificaciones de otros suscriptores te ayudarán a tomar decisiones informadas.',
    category: 'General',
    keywords: ['calidad', 'club verificado', 'reseñas', 'confianza']
  },
  {
    id: '8',
    question: '¿Qué tipo de clubes puedo encontrar en AuraBox?',
    answer: 'En AuraBox encontrarás una amplia variedad de clubes de suscripción, desde gastronomía (vinos, quesos, café), belleza y cuidado personal, hasta literatura, botánica, hobbies y mucho más. ¡Siempre hay algo nuevo para descubrir!',
    category: 'Exploración',
    keywords: ['tipos de clubes', 'categorías', 'variedad', 'descubrir']
  },
  {
    id: '9',
    question: '¿Cómo puedo contactar al soporte de AuraBox?',
    answer: 'Puedes contactar a nuestro equipo de soporte a través del formulario de contacto en la sección "Contacto" de nuestro pie de página. Próximamente, también tendremos un chat de soporte integrado para asistencia más rápida.',
    category: 'Soporte',
    keywords: ['contacto', 'soporte', 'ayuda', 'chat']
  },
  {
    id: '10',
    question: '¿AuraBox tiene una aplicación móvil?',
    answer: 'Sí, AuraBox está diseñada para ser multiplataforma. Además de la versión web, estamos desarrollando aplicaciones nativas para Android y iOS para que puedas gestionar tus suscripciones desde cualquier dispositivo.',
    category: 'General',
    keywords: ['app', 'móvil', 'aplicación', 'Android', 'iOS']
  },
  {
    id: '11',
    question: '¿Cómo puedo dejar una reseña o calificación de un club?',
    answer: 'Una vez que hayas recibido una caja, podrás dejar una reseña y calificación directamente desde tu panel de usuario. Solo los suscriptores verificados pueden dejar reseñas, asegurando la autenticidad de las opiniones.',
    category: 'Suscriptores',
    keywords: ['reseña', 'calificación', 'opinión', 'feedback']
  },
  {
    id: '12',
    question: '¿AuraBox ofrece herramientas de marketing para emprendedores?',
    answer: 'Sí, AuraBox proporciona herramientas de marketing integradas como newsletters segmentados, gestión de promociones y cupones, y la posibilidad de publicar actualizaciones directamente en la plataforma para tus suscriptores.',
    category: 'Emprendedores',
    keywords: ['marketing', 'promociones', 'newsletters', 'visibilidad']
  },
  {
    id: '13',
    question: '¿Cómo se manejan los problemas con las entregas?',
    answer: 'Si surge algún problema con una entrega (retraso, producto dañado, etc.), puedes reportarlo directamente desde tu panel de usuario. AuraBox facilita la comunicación con el club y el seguimiento de la resolución del incidente.',
    category: 'Entregas',
    keywords: ['problema', 'entrega', 'dañado', 'retraso', 'incidente']
  },
  {
    id: '14',
    question: '¿Puedo descubrir clubes basados en mis intereses?',
    answer: '¡Claro! AuraBox cuenta con un sistema de recomendaciones personalizadas que sugiere clubes basados en tus gustos, historial de compras y valoraciones. También puedes usar nuestros filtros inteligentes para encontrar exactamente lo que buscas.',
    category: 'Exploración',
    keywords: ['recomendaciones', 'intereses', 'personalización', 'descubrir']
  },
  {
    id: '15',
    question: '¿Hay beneficios por ser un suscriptor fiel?',
    answer: 'Sí, AuraBox valora la fidelidad. Contamos con un sistema de puntos por permanencia, gamificación con retos mensuales e insignias, y promociones exclusivas para nuestros suscriptores más activos. ¡Mientras más uses AuraBox, más beneficios obtendrás!',
    category: 'Suscriptores',
    keywords: ['fidelidad', 'beneficios', 'puntos', 'gamificación', 'recompensas']
  },
];

const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const categories = ['Todas', ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFaqs = faqData.filter(faq => {
    const matchesSearch = searchTerm.toLowerCase().split(' ').every(term =>
      faq.question.toLowerCase().includes(term) ||
      faq.answer.toLowerCase().includes(term) ||
      faq.keywords.some(keyword => keyword.toLowerCase().includes(term))
    );
    const matchesCategory = selectedCategory === 'Todas' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleQuestion = (id: string) => {
    setOpenQuestion(openQuestion === id ? null : id);
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fadeInUp">
      <h1 className="text-5xl font-extrabold text-center text-blue-700 mb-8 animate-slideInUp">
        Preguntas Frecuentes
      </h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto animate-fadeIn">
        Encuentra respuestas a las preguntas más comunes sobre AuraBox, cómo funciona para suscriptores y emprendedores, y mucho más.
      </p>

      <div className="mb-10 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 animate-fadeIn">
        <input
          type="text"
          placeholder="Busca tu pregunta aquí..."
          className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="relative w-full md:w-auto">
          <select
            className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
            value={selectedCategory}
                       onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map(faq => (
            <div 
              key={faq.id} 
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer animate-fadeInUp"
              onClick={() => toggleQuestion(faq.id)}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex justify-between items-center">
                {faq.question}
                <span className="text-blue-500 text-2xl transition-transform duration-300">
                  {openQuestion === faq.id ? '−' : '+'}
                </span>
              </h3>
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openQuestion === faq.id ? 'max-h-screen opacity-100 pt-2' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-gray-700 leading-relaxed border-t border-gray-200 pt-4">
                  {faq.answer}
                </p>
                {faq.keywords.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {faq.keywords.map(keyword => (
                      <span key={keyword} className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="lg:col-span-2 text-center py-10 bg-gray-50 rounded-lg shadow-inner animate-fadeIn">
            <p className="text-gray-500 text-lg">No se encontraron preguntas que coincidan con tu búsqueda o categoría.</p>
            <p className="text-gray-400 text-sm mt-2">Intenta con otras palabras clave o selecciona otra categoría.</p>
          </div>
        )}
      </div>

      <div className="mt-16 text-center bg-blue-50 p-8 rounded-xl shadow-md animate-fadeInUp">
        <h2 className="text-3xl font-bold text-blue-700 mb-4">¿No encontraste tu pregunta?</h2>
        <p className="text-gray-700 mb-6 max-w-xl mx-auto">
          Si no encontraste la respuesta que buscabas, no dudes en contactar a nuestro equipo de soporte. Estamos aquí para ayudarte.
        </p>
        <a 
          href="/contacto" 
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold 
                     hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
        >
          Contactar Soporte
        </a>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 animate-fadeIn">Guías y Recursos Útiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp delay-100">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">Guía para Suscriptores</h3>
            <p className="text-gray-700 mb-4">Aprende a sacar el máximo provecho de tu experiencia como suscriptor en AuraBox.</p>
            <Link to="/como-funciona" className="text-blue-500 hover:underline font-medium">Leer más →</Link>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp delay-200">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">Guía para Emprendedores</h3>
            <p className="text-gray-700 mb-4">Descubre cómo AuraBox puede potenciar y profesionalizar tu club de suscripción.</p>
            <Link to="/emprendedores" className="text-blue-500 hover:underline font-medium">Leer más →</Link>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp delay-300">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">Términos y Condiciones</h3>
            <p className="text-gray-700 mb-4">Conoce nuestras políticas de uso y privacidad para una experiencia segura.</p>
            <Link to="/terminos-condiciones" className="text-blue-500 hover:underline font-medium">Leer más →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;