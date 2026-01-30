import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import clubsData from '../../../data/clubs.json';
import usersData from '../../../data/user.json';
import { Club, SocialMediaLinks, HistoryMoment, Milestone, KeyFigure, TeamMember } from '../../../types/club';
import { User } from '../../../types/user';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ClubSocialMedia from '../../../components/club/ClubSocialMedia';
import { useAuth } from '../../../App'; 

const AnimatedSection: React.FC<{ children: React.ReactNode; delay?: string }> = ({ children, delay = '0s' }) => (
  <div className="opacity-0 animate-fadeInUp" style={{ animationDelay: delay }}>
    {children}
  </div>
);

const EditButton: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label = 'Editar' }) => (
  <button
    onClick={onClick}
    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
  >
    {label}
  </button>
);

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, title, children, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        <div className="mb-6">
          {children}
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};


const HistoryPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();  

  const initialClub = (clubsData as Club[]).find(c => c.id === clubId);
  const [club, setClub] = useState<Club | undefined>(initialClub);

  const [isEditingOrigins, setIsEditingOrigins] = useState(false);
  const [isEditingMoments, setIsEditingMoments] = useState(false);
  const [isEditingMilestones, setIsEditingMilestones] = useState(false);
  const [isEditingFigures, setIsEditingFigures] = useState(false);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isEditingCommunity, setIsEditingCommunity] = useState(false);

  const [tempFullHistory, setTempFullHistory] = useState(club?.fullHistory || '');
  const [tempHistoryMoments, setTempHistoryMoments] = useState<HistoryMoment[]>(club?.historyMoments || []);
  const [tempMilestones, setTempMilestones] = useState<Milestone[]>(club?.milestones || []);
  const [tempKeyFigures, setTempKeyFigures] = useState<KeyFigure[]>(club?.keyFigures || []);
  const [tempTeamMembers, setTempTeamMembers] = useState<TeamMember[]>(club?.teamMembers || []);
  const [tempCommunityText, setTempCommunityText] = useState(club?.communityText || '');

  useEffect(() => {
    if (club) {
      setTempFullHistory(club.fullHistory || '');
      setTempHistoryMoments(club.historyMoments || []);
      setTempMilestones(club.milestones || []);
      setTempKeyFigures(club.keyFigures || []);
      setTempTeamMembers(club.teamMembers || []);
      setTempCommunityText(club.communityText || '');
    }
  }, [club]);


  const handleSave = (field: string) => {
    if (!club) return;

    const updatedClub = { ...club };

    switch (field) {
      case 'origins':
        updatedClub.fullHistory = tempFullHistory;
        setIsEditingOrigins(false);
        break;
      case 'moments':
        updatedClub.historyMoments = tempHistoryMoments;
        setIsEditingMoments(false);
        break;
      case 'milestones':
        updatedClub.milestones = tempMilestones;
        setIsEditingMilestones(false);
        break;
      case 'figures':
        updatedClub.keyFigures = tempKeyFigures;
        setIsEditingFigures(false);
        break;
      case 'team':
        updatedClub.teamMembers = tempTeamMembers;
        setIsEditingTeam(false);
        break;
      case 'community':
        updatedClub.communityText = tempCommunityText;
        setIsEditingCommunity(false);
        break;
      default:
        break;
    }

    setClub(updatedClub);
    console.log(`Club ${club.name} actualizado:`, updatedClub);
  };

  const isEntrepreneurOwner = userRole === 'entrepreneur' && user?.managedClubId === clubId;

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Club no encontrado</h1>
        <p className="text-lg text-gray-700 mb-8">El club que buscas no existe o fue eliminado.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
        >
          Volver
        </button>
      </div>
    );
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    fade: true,
    cssEase: 'ease-in-out',
  };

  const historyParagraphs = club.fullHistory ? club.fullHistory.split('\n\n').map((p: string) => p.trim()).filter((p: string) => p.length > 0) : [];

  const momentsToDisplay = club.historyMoments && club.historyMoments.length > 0 ? club.historyMoments : [
    { id: 'm1', image: club.bannerImages[0] || '/assets/default-history-banner.jpg', description: `${club.name} - Un momento clave en nuestra trayectoria.` },
    { id: 'm2', image: club.bannerImages[1] || '/assets/default-history-banner.jpg', description: `Expansión y crecimiento de ${club.name}.` }
  ].filter(m => m.image); 

  const milestonesToDisplay = club.milestones && club.milestones.length > 0 ? club.milestones : [
    { id: 'h1', year: new Date(club.creationDate).getFullYear(), description: `Fundación de ${club.name}: Nace la idea de llevar la magia a cada hogar.` },
    { id: 'h2', year: new Date(club.creationDate).getFullYear() + 1, description: `Primera edición especial: Lanzamiento de una caja temática, agotada en 48 horas.` },
    { id: 'h3', year: new Date(club.creationDate).getFullYear() + 2, description: `Alcanzamos los 1000 suscriptores: Nuestra comunidad no para de crecer.` },
  ];

  const figuresToDisplay = club.keyFigures && club.keyFigures.length > 0 ? club.keyFigures : [
    { id: 'f1', title: "Fecha de Creación", value: new Date(club.creationDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }) },
    { id: 'f2', title: "Suscriptores Totales", value: club.totalSubscribers.toLocaleString('es-AR') },
    { id: 'f3', title: "Cajas Enviadas Mensuales", value: club.monthlyBoxesSent.toLocaleString('es-AR') }
  ];

  const teamMembersToDisplay = club.teamMembers && club.teamMembers.length > 0 ? club.teamMembers : [
    { id: 't1', name: "Fundador/a", role: "Visión y Pasión", bio: "La mente detrás de la magia, dedicando su vida a este proyecto.", image: "/assets/default-avatar.jpg" },
    { id: 't2', name: "Coordinador/a", role: "Logística y Operaciones", bio: "Asegurando que cada detalle funcione a la perfección.", image: "/assets/default-avatar.jpg" }
  ];

  const communityTextToDisplay = club.communityText || "Más allá de las cajas, somos una familia de entusiastas. Conéctate con nosotros y otros suscriptores en nuestras redes sociales. ¡Comparte tu experiencia, participa en sorteos y sé parte de algo más grande!";


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="relative h-80 md:h-96 overflow-hidden shadow-xl">
        <img
          src={club.historyBanner || (club.bannerImages && club.bannerImages[0]) || '/assets/default-history-banner.jpg'}
          alt={`Historia de ${club.name}`}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center px-4">
          <h1 className="text-white text-4xl md:text-6xl font-extrabold drop-shadow-2xl text-center animate-fadeInDown">
            La Historia de <span className="text-blue-300">{club.name}</span>
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <AnimatedSection delay="0.2s">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-6 md:space-y-0 md:space-x-8 mb-16 p-8 bg-white rounded-3xl shadow-2xl border border-blue-200 transform hover:scale-[1.01] transition-transform duration-300">
            {club.logoImage && (
              <img
                src={club.logoImage}
                alt={`${club.name} logo`}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-6 border-blue-600 shadow-xl object-cover animate-bounce-once"
              />
            )}
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">{club.name}</h2>
              {club.slogan && <p className="text-2xl text-gray-700 mt-1 italic font-light">{club.slogan}</p>}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay="0.4s">
          <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-purple-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold text-purple-800 text-center flex-grow">Nuestros Orígenes y Valores</h3>
              {isEntrepreneurOwner && <EditButton onClick={() => setIsEditingOrigins(true)} />}
            </div>
            <div className="text-gray-800 leading-relaxed text-lg space-y-6">
              {historyParagraphs.length > 0 ? (
                historyParagraphs.map((para, idx) => (
                  <p key={idx} className="text-justify">
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-center italic">No hay una historia detallada disponible para este club.</p>
              )}
              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mt-8">
                "Cada caja es una promesa, cada entrega una conexión. Creemos en la magia de la sorpresa y el poder de la comunidad."
              </blockquote>
            </div>
          </section>
        </AnimatedSection>

        <EditModal
          isOpen={isEditingOrigins}
          onClose={() => setIsEditingOrigins(false)}
          title="Editar Orígenes y Valores"
          onSave={() => handleSave('origins')}
        >
          <label htmlFor="fullHistory" className="block text-gray-700 text-sm font-bold mb-2">
            Historia Completa del Club:
          </label>
          <textarea
            id="fullHistory"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-48"
            value={tempFullHistory}
            onChange={(e) => setTempFullHistory(e.target.value)}
            placeholder="Escribe la historia completa de tu club, separando párrafos con doble salto de línea."
          />
        </EditModal>

        {momentsToDisplay.length > 0 && (
          <AnimatedSection delay="0.6s">
            <section className="mb-20 shadow-2xl rounded-3xl overflow-hidden border border-green-200">
              <div className="flex justify-between items-center mb-8 pt-8 px-8">
                <h3 className="text-3xl font-bold text-green-800 text-center flex-grow">Momentos que Marcaron Nuestra Historia</h3>
                {isEntrepreneurOwner && <EditButton onClick={() => setIsEditingMoments(true)} />}
              </div>
              <Slider {...sliderSettings} className="p-4">
                {momentsToDisplay.map((moment: HistoryMoment, idx: number) => (
                  <div key={moment.id || idx} className="px-2">
                    <img
                      src={moment.image}
                      alt={`Imagen histórica ${idx + 1}`}
                      className="w-full h-80 md:h-96 object-cover rounded-2xl shadow-xl transform hover:scale-[1.02] transition-transform duration-300"
                    />
                    <p className="text-center text-gray-600 mt-4 text-lg italic">
                      {moment.description}
                    </p>
                  </div>
                ))}
              </Slider>
            </section>
          </AnimatedSection>
        )}

        <EditModal
          isOpen={isEditingMoments}
          onClose={() => setIsEditingMoments(false)}
          title="Editar Momentos Clave de la Historia"
          onSave={() => handleSave('moments')}
        >
          {tempHistoryMoments.map((moment, index) => (
            <div key={moment.id || index} className="mb-4 p-4 border rounded-lg shadow-sm bg-gray-50">
              <h4 className="font-semibold text-lg mb-2">Momento {index + 1}</h4>
              <label htmlFor={`moment-image-${index}`} className="block text-gray-700 text-sm font-bold mb-2">
                URL de la Imagen:
              </label>
              <input
                type="text"
                id={`moment-image-${index}`}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                value={moment.image}
                onChange={(e) => {
                  const newMoments = [...tempHistoryMoments];
                  newMoments[index].image = e.target.value;
                  setTempHistoryMoments(newMoments);
                }}
                placeholder="URL de la imagen"
              />
              <label htmlFor={`moment-description-${index}`} className="block text-gray-700 text-sm font-bold mb-2">
                Descripción:
              </label>
              <textarea
                id={`moment-description-${index}`}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                value={moment.description}
                onChange={(e) => {
                  const newMoments = [...tempHistoryMoments];
                  newMoments[index].description = e.target.value;
                  setTempHistoryMoments(newMoments);
                }}
                placeholder="Descripción del momento"
              />
              {tempHistoryMoments.length > 1 && (
                <button
                  onClick={() => setTempHistoryMoments(tempHistoryMoments.filter((_, i) => i !== index))}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                >
                  Eliminar Momento
                </button>
              )}
            </div>
          ))}
          {tempHistoryMoments.length < 3 && (
            <button
              onClick={() => setTempHistoryMoments([...tempHistoryMoments, { id: `new-${Date.now()}`, image: '', description: '' }])}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              Agregar Momento
            </button>
          )}
        </EditModal>


        {milestonesToDisplay.length > 0 && (
          <AnimatedSection delay="0.8s">
            <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-orange-200">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-bold text-orange-800 text-center flex-grow">Nuestros Hitos</h3>
                {isEntrepreneurOwner && <EditButton onClick={() => setIsEditingMilestones(true)} />}
              </div>
              <div className="relative border-l-4 border-orange-400 pl-8 ml-4">
                {milestonesToDisplay.map((milestone, idx) => (
                  <div key={milestone.id || idx} className="mb-8 relative">
                    <div className="absolute -left-10 top-0 flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full text-white font-bold text-sm shadow-md">
                      {milestone.year}
                    </div>
                    <div className="bg-orange-50 p-6 rounded-lg shadow-md transform hover:scale-[1.02] transition-transform duration-300">
                      <p className="text-gray-800 text-lg">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </AnimatedSection>
        )}

        <EditModal
          isOpen={isEditingMilestones}
          onClose={() => setIsEditingMilestones(false)}
          title="Editar Hitos"
          onSave={() => handleSave('milestones')}
        >
          {tempMilestones.map((milestone, index) => (
            <div key={milestone.id || index} className="mb-4 p-4 border rounded-lg shadow-sm bg-gray-50">
              <h4 className="font-semibold text-lg mb-2">Hito {index + 1}</h4>
              <label htmlFor={`milestone-year-${index}`} className="block text-gray-700 text-sm font-bold mb-2">
                Año:
              </label>
              <input
                type="number"
                id={`milestone-year-${index}`}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                value={milestone.year}
                onChange={(e) => {
                  const newMilestones = [...tempMilestones];
                  newMilestones[index].year = parseInt(e.target.value);
                  setTempMilestones(newMilestones);
                }}
              />
              <label htmlFor={`milestone-description-${index}`} className="block text-gray-700 text-sm font-bold mb-2">
                Descripción:
              </label>
              <textarea
                id={`milestone-description-${index}`}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                value={milestone.description}
                onChange={(e) => {
                  const newMilestones = [...tempMilestones];
                  newMilestones[index].description = e.target.value;
                  setTempMilestones(newMilestones);
                }}
              />
              {tempMilestones.length > 3 && (
                <button
                  onClick={() => setTempMilestones(tempMilestones.filter((_, i) => i !== index))}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                >
                  Eliminar Hito
                </button>
              )}
            </div>
          ))}
          {tempMilestones.length < 10 && (
            <button
              onClick={() => setTempMilestones([...tempMilestones, { id: `new-${Date.now()}`, year: new Date().getFullYear(), description: '' }])}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              Agregar Hito
            </button>
          )}
        </EditModal>


        <AnimatedSection delay="1.0s">
          <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-blue-200">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-bold text-blue-800 text-center flex-grow">Cifras que Nos Impulsan</h3>
              {isEntrepreneurOwner && <EditButton onClick={() => setIsEditingFigures(true)} />}
            </div>
            <div className={`grid grid-cols-1 ${figuresToDisplay.length > 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-3'} gap-8 text-center`}>
              {figuresToDisplay.map((figure, idx) => (
                <div key={figure.id || idx} className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200 transform hover:scale-[1.05] transition-transform duration-300">
                  <h4 className="text-xl font-semibold mb-2 text-blue-700">{figure.title}</h4>
                  <p className="text-3xl font-extrabold text-blue-600">
                    {figure.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        <EditModal
          isOpen={isEditingFigures}
          onClose={() => setIsEditingFigures(false)}
          title="Editar Cifras que Nos Impulsan"
          onSave={() => handleSave('figures')}
        >
          {tempKeyFigures.map((figure, index) => (
            <div key={figure.id || index} className="mb-4 p-4 border rounded-lg shadow-sm bg-gray-50">
              <h4 className="font-semibold text-lg mb-2">Cifra {index + 1}</h4>
              <label htmlFor={`figure-title-${index}`} className="block text-gray-700 text-sm font-bold mb-2">
                Título:
              </label>
              <input
                type="text"
                id={`figure-title-${index}`}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                value={figure.title}
                onChange={(e) => {
                  const newFigures = [...tempKeyFigures];
                  newFigures[index].title = e.target.value;
                  setTempKeyFigures(newFigures);
                }}
              />
              <label htmlFor={`figure-value-${index}`} className="block text-gray-700 text-sm font-bold mb-2">
                Valor:
              </label>
              <input
                type="text"
                id={`figure-value-${index}`}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={figure.value}
                onChange={(e) => {
                  const newFigures = [...tempKeyFigures];
                  newFigures[index].value = e.target.value;
                  setTempKeyFigures(newFigures);
                }}
              />
              {tempKeyFigures.length > 3 && (
                <button
                  onClick={() => setTempKeyFigures(tempKeyFigures.filter((_, i) => i !== index))}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                >
                  Eliminar Cifra
                </button>
              )}
            </div>
          ))}
          {tempKeyFigures.length < 6 && (
            <button
              onClick={() => setTempKeyFigures([...tempKeyFigures, { id: `new-${Date.now()}`, title: '', value: '' }])}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              Agregar Cifra
            </button>
          )}
        </EditModal>


        {teamMembersToDisplay.length > 0 && (
          <AnimatedSection delay="1.2s">
            <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-red-200">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-bold text-red-800 text-center flex-grow">Conoce a Nuestro Equipo</h3>
                {isEntrepreneurOwner && <EditButton onClick={() => setIsEditingTeam(true)} />}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembersToDisplay.map((member, idx) => (
                  <div key={member.id || idx} className="flex flex-col items-center text-center bg-red-50 p-6 rounded-lg shadow-md border border-red-200 transform hover:scale-[1.03] transition-transform duration-300">
                    <img
                      src={member.image || '/assets/default-avatar.jpg'}
                      alt={member.name}
                      className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-red-400 shadow-lg"
                    />
                    <h4 className="text-xl font-bold text-red-700">{member.name}</h4>
                    <p className="text-md text-red-600 mb-3 italic">{member.role}</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{member.bio}</p>
                  </div>
                ))}
              </div>
            </section>
          </AnimatedSection>
        )}

        <EditModal
          isOpen={isEditingTeam}
          onClose={() => setIsEditingTeam(false)}
          title="Editar Equipo"
          onSave={() => handleSave('team')}
        >
          {tempTeamMembers.map((member, index) => (
            <div key={member.id || index} className="mb-4 p-4 border rounded-lg shadow-sm bg-gray-50">
              <h4 className="font-semibold text-lg mb-2">Miembro {index + 1}</h4>
              <label htmlFor={`member-image-${index}`} className="block text-gray-700 text-sm font-bold mb-2">
                URL de la Imagen:
              </label>
              <input
                type="text"
                id={`member-image-${index}`}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                value={member.image}
                onChange={(e) => {
                  const newMembers = [...tempTeamMembers];
                  newMembers[index].image = e.target.value;
                  setTempTeamMembers(newMembers);
                }}
                placeholder="URL de la imagen del miembro"
              />
              <label htmlFor={`member-name-${index}`} className="block text-gray-700 text-sm font-bold mb-2">
                Nombre:
              </label>
              <input
                type="text"
                id={`member-name-${index}`}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                value={member.name}
                onChange={(e) => {
                  const newMembers = [...tempTeamMembers];
                  newMembers[index].name = e.target.value;
                  setTempTeamMembers(newMembers);
                }}
                placeholder="Nombre del miembro"
              />
              <label htmlFor={`member-role-${index}`} className="block text-gray-700 text-sm font-bold mb-2">
                Puesto:
              </label>
              <input
                type="text"
                id={`member-role-${index}`}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                value={member.role}
                onChange={(e) => {
                  const newMembers = [...tempTeamMembers];
                  newMembers[index].role = e.target.value;
                  setTempTeamMembers(newMembers);
                }}
                placeholder="Puesto del miembro"
              />
              <label htmlFor={`member-bio-${index}`} className="block text-gray-700 text-sm font-bold mb-2">
                Biografía:
              </label>
              <textarea
                id={`member-bio-${index}`}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                value={member.bio}
                onChange={(e) => {
                  const newMembers = [...tempTeamMembers];
                  newMembers[index].bio = e.target.value;
                  setTempTeamMembers(newMembers);
                }}
                placeholder="Biografía del miembro"
              />
              {tempTeamMembers.length > 1 && (
                <button
                  onClick={() => setTempTeamMembers(tempTeamMembers.filter((_, i) => i !== index))}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                >
                  Eliminar Miembro
                </button>
              )}
            </div>
          ))}
          {tempTeamMembers.length < 9 && (
            <button
              onClick={() => setTempTeamMembers([...tempTeamMembers, { id: `new-${Date.now()}`, name: '', role: '', bio: '', image: '' }])}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              Agregar Miembro
            </button>
          )}
        </EditModal>


        <AnimatedSection delay="1.4s">
          <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-green-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-green-800 text-center flex-grow">Únete a Nuestra Comunidad</h3>
              {isEntrepreneurOwner && <EditButton onClick={() => setIsEditingCommunity(true)} />}
            </div>
            <p className="text-center text-gray-700 max-w-3xl mx-auto mb-8 text-lg">
              {communityTextToDisplay}
            </p>
            {club.socialMedia && <ClubSocialMedia socialMedia={club.socialMedia} />}
          </section>
        </AnimatedSection>

        <EditModal
          isOpen={isEditingCommunity}
          onClose={() => setIsEditingCommunity(false)}
          title="Editar Texto de Comunidad"
          onSave={() => handleSave('community')}
        >
          <label htmlFor="communityText" className="block text-gray-700 text-sm font-bold mb-2">
            Texto de la Comunidad:
          </label>
          <textarea
            id="communityText"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            value={tempCommunityText}
            onChange={(e) => setTempCommunityText(e.target.value)}
            placeholder="Escribe el texto para la sección 'Únete a Nuestra Comunidad'."
          />
        </EditModal>


        <AnimatedSection delay="1.6s">
          <div className="text-center py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-3xl shadow-2xl transform transition-all duration-500 hover:scale-[1.01] hover:shadow-3xl">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 animate-pulse-subtle">
              ¿Listo para ser parte de nuestra historia?
            </h2>
            <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto opacity-0 animate-fadeInUp delay-200">
              Descubre nuestros planes de suscripción y comienza tu propia aventura con {club.name}.
            </p>
            <Link
              to={`/club/${club.id}`}
              className="inline-block bg-white text-blue-600 px-12 py-5 rounded-full font-bold text-xl
                         hover:bg-blue-100 hover:scale-105 transition-all duration-300 shadow-lg
                         focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-70 animate-bounce-once"
            >
              ¡Suscríbete Ahora!
            </Link>
          </div>
        </AnimatedSection>

        <div className="text-center mt-16">
          <button
            onClick={() => navigate(`/club/${club.id}`)}
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver a la página del Club
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;