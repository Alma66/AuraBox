import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import { Club, Milestone, KeyFigure, TeamMember } from '../../../types/club';
import { useAuth } from '../../../App';
import ClubSocialMedia from '../../../components/club/ClubSocialMedia';

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

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditingOrigins, setIsEditingOrigins] = useState(false);
  const [isEditingMilestones, setIsEditingMilestones] = useState(false);
  const [isEditingFigures, setIsEditingFigures] = useState(false);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isEditingCommunity, setIsEditingCommunity] = useState(false);

  const [tempHistory, setTempHistory] = useState('');
  const [tempMilestones, setTempMilestones] = useState<Milestone[]>([]);
  const [tempKeyFigures, setTempKeyFigures] = useState<KeyFigure[]>([]);
  const [tempTeamMembers, setTempTeamMembers] = useState<TeamMember[]>([]);
  const [tempCommunityText, setTempCommunityText] = useState('');

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await api.get(`/clubs/${clubId}`);
        const clubData = getResponseData(response);
        setClub(clubData);
        setTempHistory(clubData.history || '');
        setTempMilestones(clubData.milestones || []);
        setTempKeyFigures(clubData.keyFigures || []);
        setTempTeamMembers(clubData.teamMembers || []);
        setTempCommunityText(clubData.communityText || '');
      } catch (error) {
        console.error("Error fetching club:", error);
      } finally {
        setLoading(false);
      }
    };
    if (clubId) fetchClub();
  }, [clubId]);

  const handleSave = async (field: string) => {
    if (!club) return;
    try {
      const updateData: Partial<Club> = {};
      switch (field) {
        case 'origins': updateData.history = tempHistory; break;
        case 'milestones': updateData.milestones = tempMilestones; break;
        case 'figures': updateData.keyFigures = tempKeyFigures; break;
        case 'team': updateData.teamMembers = tempTeamMembers; break;
        case 'community': updateData.communityText = tempCommunityText; break;
      }
      await api.put(`/clubs/${club.id}`, updateData);
      setClub({ ...club, ...updateData });
      switch (field) {
        case 'origins': setIsEditingOrigins(false); break;
        case 'milestones': setIsEditingMilestones(false); break;
        case 'figures': setIsEditingFigures(false); break;
        case 'team': setIsEditingTeam(false); break;
        case 'community': setIsEditingCommunity(false); break;
      }
    } catch (error) {
      console.error("Error saving club:", error);
      alert('Error al guardar cambios');
    }
  };

  const isEntrepreneurOwner = userRole === 'entrepreneur' && String(user?.managedClubId) === String(clubId);

  if (loading) {
    return <div className="text-center py-20">Cargando historia...</div>;
  }

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

  const creationYear = club.creationDate ? new Date(club.creationDate).getFullYear() : null;
  const creationDateFormatted = club.creationDate
    ? new Date(club.creationDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })
    : 'No disponible';

  const historyText = club.history || club.fullHistory || '';
  const historyParagraphs: string[] = historyText
    ? historyText.split('\n\n').map((p: string) => p.trim()).filter((p: string) => p.length > 0)
    : [];

  const milestonesToDisplay: Milestone[] = club.milestones && club.milestones.length > 0
    ? club.milestones
    : creationYear
      ? [
          { id: 'h1', year: creationYear, description: `Fundación de ${club.name}: Nace la idea de llevar la magia a cada hogar.` },
          { id: 'h2', year: creationYear + 1, description: 'Primera edición especial: Lanzamiento de una caja temática, agotada en 48 horas.' },
          { id: 'h3', year: creationYear + 2, description: 'Alcanzamos los primeros suscriptores: Nuestra comunidad no para de crecer.' },
        ]
      : [];

  const figuresToDisplay: KeyFigure[] = club.keyFigures && club.keyFigures.length > 0
    ? club.keyFigures
    : [
        { id: 'f1', title: 'Rating Promedio', value: club.averageRating ? `${club.averageRating} / 5` : 'Sin reseñas aún' },
        { id: 'f2', title: 'Total de Reseñas', value: String(club.totalReviews || 0) },
        { id: 'f3', title: 'Fecha de Creación', value: creationDateFormatted },
      ];

  const teamMembersToDisplay: TeamMember[] = club.teamMembers && club.teamMembers.length > 0
    ? club.teamMembers
    : [
        { id: 't1', name: 'Fundador/a', role: 'Visión y Pasión', bio: 'La mente detrás de la magia, dedicando su vida a este proyecto.', image: '/assets/default-avatar.jpg' },
        { id: 't2', name: 'Coordinador/a', role: 'Logística y Operaciones', bio: 'Asegurando que cada detalle funcione a la perfección.', image: '/assets/default-avatar.jpg' },
      ];

  const communityTextToDisplay = club.communityText || 'Más allá de las cajas, somos una familia de entusiastas. Conéctate con nosotros y otros suscriptores en nuestras redes sociales.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="relative h-80 md:h-96 overflow-hidden shadow-xl">
        <img
          src={club.logoUrl || '/assets/default-history-banner.jpg'}
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
            {club.logoUrl && (
              <img
                src={club.logoUrl}
                alt={`${club.name} logo`}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-blue-600 shadow-xl object-cover"
              />
            )}
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">{club.name}</h2>
              {club.slogan && <p className="text-2xl text-gray-700 mt-1 italic font-light">{club.slogan}</p>}
              {club.shortDescription && <p className="text-gray-600 mt-2">{club.shortDescription}</p>}
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
                historyParagraphs.map((para: string, idx: number) => (
                  <p key={idx} className="text-justify">{para}</p>
                ))
              ) : (
                <p className="text-center italic text-gray-500">No hay una historia detallada disponible para este club.</p>
              )}
              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mt-8">
                "Cada caja es una promesa, cada entrega una conexión."
              </blockquote>
            </div>
          </section>
        </AnimatedSection>

        <EditModal isOpen={isEditingOrigins} onClose={() => setIsEditingOrigins(false)} title="Editar Orígenes y Valores" onSave={() => handleSave('origins')}>
          <label className="block text-gray-700 text-sm font-bold mb-2">Historia del Club:</label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-48"
            value={tempHistory}
            onChange={(e) => setTempHistory(e.target.value)}
          />
        </EditModal>

        {milestonesToDisplay.length > 0 && (
          <AnimatedSection delay="0.8s">
            <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-orange-200">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-bold text-orange-800 text-center flex-grow">Nuestros Hitos</h3>
                {isEntrepreneurOwner && <EditButton onClick={() => setIsEditingMilestones(true)} />}
              </div>
              <div className="relative border-l-4 border-orange-400 pl-8 ml-4">
                {milestonesToDisplay.map((milestone: Milestone, idx: number) => (
                  <div key={milestone.id || idx} className="mb-8 relative">
                    <div className="absolute -left-10 top-0 flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full text-white font-bold text-sm">
                      {milestone.year}
                    </div>
                    <div className="bg-orange-50 p-6 rounded-lg shadow-md">
                      <p className="text-gray-800 text-lg">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </AnimatedSection>
        )}

        <EditModal isOpen={isEditingMilestones} onClose={() => setIsEditingMilestones(false)} title="Editar Hitos" onSave={() => handleSave('milestones')}>
          {tempMilestones.map((milestone: Milestone, index: number) => (
            <div key={milestone.id || index} className="mb-4 p-4 border rounded-lg bg-gray-50">
              <input
                type="number"
                className="shadow border rounded w-full py-2 px-3 mb-2"
                value={milestone.year}
                onChange={(e) => {
                  const updated = [...tempMilestones];
                  updated[index] = { ...updated[index], year: parseInt(e.target.value) };
                  setTempMilestones(updated);
                }}
              />
              <textarea
                className="shadow border rounded w-full py-2 px-3 h-24"
                value={milestone.description}
                onChange={(e) => {
                  const updated = [...tempMilestones];
                  updated[index] = { ...updated[index], description: e.target.value };
                  setTempMilestones(updated);
                }}
              />
            </div>
          ))}
        </EditModal>

        <AnimatedSection delay="1.0s">
          <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-blue-200">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-bold text-blue-800 text-center flex-grow">Cifras que Nos Impulsan</h3>
              {isEntrepreneurOwner && <EditButton onClick={() => setIsEditingFigures(true)} />}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {figuresToDisplay.map((figure: KeyFigure, idx: number) => (
                <div key={figure.id || idx} className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
                  <h4 className="text-xl font-semibold mb-2 text-blue-700">{figure.title}</h4>
                  <p className="text-3xl font-extrabold text-blue-600">{figure.value}</p>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        <EditModal isOpen={isEditingFigures} onClose={() => setIsEditingFigures(false)} title="Editar Cifras" onSave={() => handleSave('figures')}>
          {tempKeyFigures.map((figure: KeyFigure, index: number) => (
            <div key={figure.id || index} className="mb-4 p-4 border rounded-lg bg-gray-50">
              <input
                type="text"
                className="shadow border rounded w-full py-2 px-3 mb-2"
                value={figure.title}
                onChange={(e) => {
                  const updated = [...tempKeyFigures];
                  updated[index] = { ...updated[index], title: e.target.value };
                  setTempKeyFigures(updated);
                }}
                placeholder="Título"
              />
              <input
                type="text"
                className="shadow border rounded w-full py-2 px-3"
                value={figure.value}
                onChange={(e) => {
                  const updated = [...tempKeyFigures];
                  updated[index] = { ...updated[index], value: e.target.value };
                  setTempKeyFigures(updated);
                }}
                placeholder="Valor"
              />
            </div>
          ))}
        </EditModal>

        {teamMembersToDisplay.length > 0 && (
          <AnimatedSection delay="1.2s">
            <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-red-200">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-bold text-red-800 text-center flex-grow">Conoce a Nuestro Equipo</h3>
                {isEntrepreneurOwner && <EditButton onClick={() => setIsEditingTeam(true)} />}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembersToDisplay.map((member: TeamMember, idx: number) => (
                  <div key={member.id || idx} className="flex flex-col items-center text-center bg-red-50 p-6 rounded-lg shadow-md border border-red-200">
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

        <EditModal isOpen={isEditingTeam} onClose={() => setIsEditingTeam(false)} title="Editar Equipo" onSave={() => handleSave('team')}>
          {tempTeamMembers.map((member: TeamMember, index: number) => (
            <div key={member.id || index} className="mb-4 p-4 border rounded-lg bg-gray-50">
              <input
                type="text"
                className="shadow border rounded w-full py-2 px-3 mb-2"
                value={member.name}
                onChange={(e) => {
                  const updated = [...tempTeamMembers];
                  updated[index] = { ...updated[index], name: e.target.value };
                  setTempTeamMembers(updated);
                }}
                placeholder="Nombre"
              />
              <input
                type="text"
                className="shadow border rounded w-full py-2 px-3 mb-2"
                value={member.role}
                onChange={(e) => {
                  const updated = [...tempTeamMembers];
                  updated[index] = { ...updated[index], role: e.target.value };
                  setTempTeamMembers(updated);
                }}
                placeholder="Puesto"
              />
              <textarea
                className="shadow border rounded w-full py-2 px-3 h-24"
                value={member.bio}
                onChange={(e) => {
                  const updated = [...tempTeamMembers];
                  updated[index] = { ...updated[index], bio: e.target.value };
                  setTempTeamMembers(updated);
                }}
                placeholder="Biografía"
              />
            </div>
          ))}
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

        <EditModal isOpen={isEditingCommunity} onClose={() => setIsEditingCommunity(false)} title="Editar Comunidad" onSave={() => handleSave('community')}>
          <textarea
            className="shadow border rounded w-full py-2 px-3 h-32"
            value={tempCommunityText}
            onChange={(e) => setTempCommunityText(e.target.value)}
          />
        </EditModal>

        <AnimatedSection delay="1.6s">
          <div className="text-center py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-3xl shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              ¿Listo para ser parte de nuestra historia?
            </h2>
            <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto">
              Descubre nuestros planes de suscripción y comienza tu propia aventura con {club.name}.
            </p>
            <Link
              to={`/club/${club.id}`}
              className="inline-block bg-white text-blue-600 px-12 py-5 rounded-full font-bold text-xl hover:bg-blue-100 transition-all duration-300 shadow-lg"
            >
              ¡Suscríbete Ahora!
            </Link>
          </div>
        </AnimatedSection>

        <div className="text-center mt-16">
          <button
            onClick={() => navigate(`/club/${club.id}`)}
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gray-700 hover:bg-gray-800 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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