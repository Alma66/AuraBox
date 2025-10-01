import React, { useState } from 'react';
import { Club } from '../../types/club';

interface SendNewsletterContentProps {
  activeSection: string;
  club: Club;
  onUpdateClub: (updatedClub: Club) => void;
}

const SendNewsletterContent: React.FC<SendNewsletterContentProps> = ({ activeSection, club, onUpdateClub }) => {
  const [newsletter, setNewsletter] = useState({ asunto: '', contenido: '', audiencia: 'todos' });
  const [borradores, setBorradores] = useState([
    { id: 'bor1', asunto: 'Bienvenida a nuevos suscriptores', contenido: 'Gracias por unirte a nuestra comunidad. Tu primera caja está en camino...', fecha: '2024-06-20', audiencia: 'nuevos' }
  ]);
  const [enviados, setEnviados] = useState([
    { id: 'env1', asunto: 'Promoción de Junio', contenido: '¡Descuento del 20% este mes!', fecha: '2024-06-01', audiencia: 'todos', aperturas: 85, clics: 42 },
    { id: 'env2', asunto: 'Novedades de Julio', contenido: 'Descubre nuestras nuevas ediciones especiales.', fecha: '2024-07-01', audiencia: 'activos', aperturas: 92, clics: 28 }
  ]);
  const [plantillas, setPlantillas] = useState([
    { id: 'plant1', nombre: 'Bienvenida', asunto: '¡Bienvenido a [Club]!', contenido: 'Gracias por unirte. Tu primera caja llega pronto...' },
    { id: 'plant2', nombre: 'Promoción Mensual', asunto: 'Oferta especial este mes', contenido: '¡Descuento del 20% en tu próxima suscripción! Usa código: AURA20' }
  ]);
  const [metricas, setMetricas] = useState({ totalEnviados: 15, tasaApertura: 78, tasaClics: 25 });

  const handleEnviar = () => {
    if (newsletter.asunto && newsletter.contenido) {
      const newEnviado = { ...newsletter, id: `env-${Date.now()}`, fecha: new Date().toISOString().split('T')[0], aperturas: 0, clics: 0 };
      setEnviados([...enviados, newEnviado]);
      setNewsletter({ asunto: '', contenido: '', audiencia: 'todos' });
      alert('Newsletter enviado exitosamente (simulado)');
      // En backend: POST /api/newsletters {clubId, asunto, contenido, audiencia}
    } else {
      alert('Completa asunto y contenido');
    }
  };

  const guardarBorrador = () => {
    if (newsletter.asunto || newsletter.contenido) {
      const newBorrador = { ...newsletter, id: `bor-${Date.now()}`, fecha: new Date().toISOString().split('T')[0], audiencia: newsletter.audiencia };
      setBorradores([...borradores, newBorrador]);
      setNewsletter({ asunto: '', contenido: '', audiencia: 'todos' });
      alert('Guardado como borrador');
    }
  };

  const cargarPlantilla = (plantilla: any) => {
    setNewsletter({ asunto: plantilla.asunto.replace('[Club]', club.name), contenido: plantilla.contenido, audiencia: 'todos' });
  };

  switch (activeSection) {
    case 'nuevo':
      return (
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-bold mb-4">Nuevo Newsletter</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Asunto del newsletter"
              value={newsletter.asunto}
              onChange={(e) => setNewsletter({ ...newsletter, asunto: e.target.value })}
              className="w-full p-3 border rounded-lg"
            />
            <textarea
              placeholder="Contenido del newsletter (HTML simple soportado)"
              value={newsletter.contenido}
              onChange={(e) => setNewsletter({ ...newsletter, contenido: e.target.value })}
              className="w-full p-3 border rounded-lg"
              rows={10}
            />
            <div>
              <label className="block text-sm font-medium mb-2">Audiencia:</label>
              <select
                value={newsletter.audiencia}
                onChange={(e) => setNewsletter({ ...newsletter, audiencia: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="todos">Todos los suscriptores</option>
                <option value="activos">Solo activos</option>
                <option value="inactivos">Solo inactivos</option>
                <option value="por-plan">Por plan específico</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button onClick={guardarBorrador} className="bg-yellow-600 text-white px-6 py-2 rounded">Guardar Borrador</button>
              <button onClick={handleEnviar} className="bg-green-600 text-white px-6 py-2 rounded">Enviar Newsletter</button>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Vista Previa:</h4>
              <div className="border p-4 rounded" dangerouslySetInnerHTML={{ __html: `<h2>${newsletter.asunto}</h2><p>${newsletter.contenido.replace(/\n/g, '<br>')}</p>` }} />
            </div>
          </div>
        </div>
      );
    case 'borradores':
      return (
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-bold mb-4">Borradores</h2>
          <div className="space-y-4">
            {borradores.map((borrador) => (
              <div key={borrador.id} className="border p-4 rounded-lg">
                <h3 className="font-semibold">{borrador.asunto}</h3>
                <p className="text-sm text-gray-600">Fecha: {borrador.fecha} | Audiencia: {borrador.audiencia}</p>
                <p className="mt-2">{borrador.contenido.substring(0, 100)}...</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setNewsletter({ asunto: borrador.asunto, contenido: borrador.contenido, audiencia: borrador.audiencia })}
                    className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setBorradores(borradores.filter(b => b.id !== borrador.id))}
                    className="bg-red-600 text-white px-4 py-1 rounded text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'enviados':
      return (
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-bold mb-4">Newsletters Enviados</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asunto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audiencia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aperturas (%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {enviados.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.asunto}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.audiencia}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.aperturas}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.clics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case 'plantillas':
      return (
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-bold mb-4">Plantillas</h2>
          <div className="space-y-4">
            {plantillas.map((plantilla) => (
              <div key={plantilla.id} className="border p-4 rounded-lg cursor-pointer hover:bg-gray-50" onClick={() => cargarPlantilla(plantilla)}>
                <h3 className="font-semibold">{plantilla.nombre}</h3>
                <p className="text-sm text-gray-600">{plantilla.asunto}</p>
                <p className="mt-2 text-sm">{plantilla.contenido.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
        </div>
      );
    case 'metricas':
      return (
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-bold mb-4">Métricas Generales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <h3 className="text-3xl font-bold text-blue-600">{metricas.totalEnviados}</h3>
              <p className="text-gray-600">Total Enviados</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <h3 className="text-3xl font-bold text-green-600">{metricas.tasaApertura}%</h3>
              <p className="text-gray-600">Tasa de Apertura</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg text-center">
              <h3 className="text-3xl font-bold text-purple-600">{metricas.tasaClics}%</h3>
              <p className="text-gray-600">Tasa de Clics</p>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <h4 className="font-semibold mb-2">Consejos para Mejorar:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Usa asuntos atractivos y personalizados</li>
              <li>Incluye imágenes y llamadas a acción claras</li>
              <li>Envía en horarios óptimos (mañanas de semana)</li>
              <li>Segmenta tu audiencia para mayor relevancia</li>
            </ul>
          </div>
        </div>
      );
    default:
      return <div>Sección no encontrada</div>;
  }
};

export default SendNewsletterContent;