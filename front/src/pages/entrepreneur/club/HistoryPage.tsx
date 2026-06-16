import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import { Club, Milestone } from '../../../types/club';
import { useAuth } from '../../../App';
import ClubSocialMedia from '../../../components/club/ClubSocialMedia';

const AnimatedSection: React.FC<{ children: React.ReactNode; delay?: string }> = ({ children, delay = '0s' }) => (
  <div className="opacity-0 animate-fadeInUp" style={{ animationDelay: delay }}>
    {children}
  </div>
);

const HistoryPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditingOrigins, setIsEditingOrigins] = useState(false);
  const [tempHistory, setTempHistory] = useState('');
  const [savingOrigins, setSavingOrigins] = useState(false);

  const [isEditingMilestones, setIsEditingMilestones] = useState(false);
  const [tempMilestones, setTempMilestones] = useState<Milestone[]>([]);
  const [savingMilestones, setSavingMilestones] = useState(false);

  const [isEditingCommunity, setIsEditingCommunity] = useState(false);
  const [tempCommunityText, setTempCommunityText] = useState('');
  const [savingCommunity, setSavingCommunity] = useState(false);

  const [teamPhotoUploading, setTeamPhotoUploading] = useState<number | null>(null);
  const [editingBioId, setEditingBioId] = useState<number | null>(null);
  const [tempBio, setTempBio] = useState('');
  const [savingBioId, setSavingBioId] = useState<number | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoUploadTargetId = useRef<number | null>(null);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await api.get(`/clubs/${clubId}`);
        const clubData = getResponseData(response);
        setClub(clubData);
        setTempHistory(clubData.history || '');
        setTempMilestones(clubData.milestones || []);
        setTempCommunityText(clubData.communityText || '');
      } catch (error) {
        console.error('Error fetching club:', error);
      } finally {
        setLoading(false);
      }
    };
    if (clubId) fetchClub();
  }, [clubId]);

  const isOwner = userRole === 'entrepreneur' && !!club?.isOwner;

  const handleSaveOrigins = async () => {
    if (!club) return;
    setSavingOrigins(true);
    try {
      await api.put(`/clubs/${club.id}`, { history: tempHistory });
      setClub({ ...club, history: tempHistory, fullHistory: tempHistory });
      setIsEditingOrigins(false);
    } catch {
      alert('Error al guardar la historia');
    } finally {
      setSavingOrigins(false);
    }
  };

  const handleSaveMilestones = async () => {
    if (!club) return;
    setSavingMilestones(true);
    try {
      await api.put(`/clubs/${club.id}`, { milestones: JSON.stringify(tempMilestones) });
      setClub({ ...club, milestones: tempMilestones });
      setIsEditingMilestones(false);
    } catch {
      alert('Error al guardar los hitos');
    } finally {
      setSavingMilestones(false);
    }
  };

  const handleAddMilestone = () => {
    setTempMilestones([...tempMilestones, { year: new Date().getFullYear(), description: '' }]);
  };

  const handleRemoveMilestone = (index: number) => {
    setTempMilestones(tempMilestones.filter((_, i) => i !== index));
  };

  const handleSaveCommunity = async () => {
    if (!club) return;
    setSavingCommunity(true);
    try {
      await api.put(`/clubs/${club.id}`, { communityText: tempCommunityText });
      setClub({ ...club, communityText: tempCommunityText });
      setIsEditingCommunity(false);
    } catch {
      alert('Error al guardar el texto de comunidad');
    } finally {
      setSavingCommunity(false);
    }
  };

  const handleSaveBio = async (entrepreneurId: number) => {
    setSavingBioId(entrepreneurId);
    try {
      await api.patch('/entrepreneurs/me', { bio: tempBio });
      setClub((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          entrepreneurs: prev.entrepreneurs?.map((e) =>
            e.id === entrepreneurId ? { ...e, bio: tempBio } : e
          ),
        };
      });
      setEditingBioId(null);
    } catch {
      alert('Error al guardar la bio');
    } finally {
      setSavingBioId(null);
    }
  };

  const handlePhotoClick = (entrepreneurId: number) => {
    photoUploadTargetId.current = entrepreneurId;
    photoInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = photoUploadTargetId.current;
    if (!file || !targetId || !club) return;
    setTeamPhotoUploading(targetId);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('idClub', String(club.id));
      formData.append('contentType', 'Imagen');
      formData.append('description', `team-${targetId}`);
      const existingImage = club.historyImageRaw?.find((img: any) => img.description === `team-${targetId}`);
      if (existingImage) {
        await api.delete(`/image-club/${existingImage.id}`);
      }
      const response = await api.post('/image-club', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newImage = getResponseData(response);
      setClub((prev) => {
        if (!prev) return prev;
        const filtered = (prev.historyImageRaw || []).filter((img: any) => img.description !== `team-${targetId}`);
        return {
          ...prev,
          historyImageRaw: [...filtered, { id: newImage.id, imageUrl: newImage.imageUrl, description: `team-${targetId}` }],
        };
      });
    } catch {
      alert('Error al subir la foto');
    } finally {
      setTeamPhotoUploading(null);
      e.target.value = '';
    }
  };

  const getTeamPhoto = (entrepreneurId: number): string => {
    const img = (club?.historyImageRaw as any[])?.find((i) => i.description === `team-${entrepreneurId}`);
    return img?.imageUrl || '/assets/default-avatar.jpg';
  };

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
  const historyParagraphs = historyText
    ? historyText.split('\n\n').map((p) => p.trim()).filter((p) => p.length > 0)
    : [];

  const milestonesToDisplay: Milestone[] = club.milestones && club.milestones.length > 0
    ? club.milestones
    : creationYear
      ? [
          { year: creationYear, description: `Fundación de ${club.name}: Nace la idea de llevar la magia a cada hogar.` },
          { year: creationYear + 1, description: 'Primera edición especial: Lanzamiento de una caja temática, agotada en 48 horas.' },
          { year: creationYear + 2, description: 'Alcanzamos los primeros suscriptores: Nuestra comunidad no para de crecer.' },
        ]
      : [];

  const communityTextToDisplay = club.communityText || 'Más allá de las cajas, somos una familia de entusiastas. Conéctate con nosotros y otros suscriptores en nuestras redes sociales.';

  const entrepreneurs = club.entrepreneurs || [];

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
              <h3 className="text-3xl font-bold text-purple-800 flex-grow">Nuestros Orígenes y Valores</h3>
              {isOwner && !isEditingOrigins && (
                <button
                  onClick={() => { setTempHistory(club.history || ''); setIsEditingOrigins(true); }}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  Editar
                </button>
              )}
            </div>
            {isEditingOrigins ? (
              <div>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-400 h-56 resize-none"
                  value={tempHistory}
                  onChange={(e) => setTempHistory(e.target.value)}
                />
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => setIsEditingOrigins(false)}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveOrigins}
                    disabled={savingOrigins}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-60"
                  >
                    {savingOrigins ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-800 leading-relaxed text-lg space-y-6">
                {historyParagraphs.length > 0 ? (
                  historyParagraphs.map((para, idx) => (
                    <p key={idx} className="text-justify">{para}</p>
                  ))
                ) : (
                  <p className="text-center italic text-gray-500">No hay una historia detallada disponible para este club.</p>
                )}
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mt-8">
                  "Cada caja es una promesa, cada entrega una conexión."
                </blockquote>
              </div>
            )}
          </section>
        </AnimatedSection>

        <AnimatedSection delay="0.8s">
          <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-orange-200">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-bold text-orange-800 flex-grow">Nuestros Hitos</h3>
              {isOwner && !isEditingMilestones && (
                <button
                  onClick={() => { setTempMilestones(club.milestones || []); setIsEditingMilestones(true); }}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  Editar
                </button>
              )}
            </div>
            {isEditingMilestones ? (
              <div>
                {tempMilestones.map((milestone, index) => (
                  <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 flex gap-3">
                    <div className="flex flex-col gap-2 flex-1">
                      <input
                        type="number"
                        className="border border-gray-300 rounded-lg px-3 py-2 w-28 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={milestone.year}
                        onChange={(e) => {
                          const updated = [...tempMilestones];
                          updated[index] = { ...updated[index], year: parseInt(e.target.value) };
                          setTempMilestones(updated);
                        }}
                        placeholder="Año"
                      />
                      <textarea
                        className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 h-20 resize-none"
                        value={milestone.description}
                        onChange={(e) => {
                          const updated = [...tempMilestones];
                          updated[index] = { ...updated[index], description: e.target.value };
                          setTempMilestones(updated);
                        }}
                        placeholder="Descripción"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveMilestone(index)}
                      className="self-start text-red-500 hover:text-red-700 text-xl font-bold px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddMilestone}
                  className="mb-4 px-4 py-2 border border-orange-400 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors duration-200 text-sm font-semibold"
                >
                  + Agregar hito
                </button>
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    onClick={() => setIsEditingMilestones(false)}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveMilestones}
                    disabled={savingMilestones}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-60"
                  >
                    {savingMilestones ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            ) : (
              milestonesToDisplay.length > 0 ? (
                <div className="relative border-l-4 border-orange-400 pl-8 ml-4">
                  {milestonesToDisplay.map((milestone, idx) => (
                    <div key={idx} className="mb-8 relative">
                      <div className="absolute -left-10 top-0 flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full text-white font-bold text-sm">
                        {milestone.year}
                      </div>
                      <div className="bg-orange-50 p-6 rounded-lg shadow-md">
                        <p className="text-gray-800 text-lg">{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center italic text-gray-500">No hay hitos cargados aún.</p>
              )
            )}
          </section>
        </AnimatedSection>

        <AnimatedSection delay="1.0s">
          <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-blue-200">
            <h3 className="text-3xl font-bold text-blue-800 mb-10">Cifras que Nos Impulsan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
                <h4 className="text-xl font-semibold mb-2 text-blue-700">Rating Promedio</h4>
                <p className="text-3xl font-extrabold text-blue-600">
                  {club.averageRating ? `${club.averageRating} / 5` : 'Sin reseñas aún'}
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
                <h4 className="text-xl font-semibold mb-2 text-blue-700">Total de Reseñas</h4>
                <p className="text-3xl font-extrabold text-blue-600">{club.totalReviews || 0}</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
                <h4 className="text-xl font-semibold mb-2 text-blue-700">Fecha de Creación</h4>
                <p className="text-3xl font-extrabold text-blue-600">{creationDateFormatted}</p>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {entrepreneurs.length > 0 && (
          <AnimatedSection delay="1.2s">
            <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-red-200">
              <h3 className="text-3xl font-bold text-red-800 mb-10">Conoce a Nuestro Equipo</h3>
              <input
                type="file"
                accept="image/*"
                ref={photoInputRef}
                className="hidden"
                onChange={handlePhotoChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {entrepreneurs.map((member) => (
                  <div key={member.id} className="flex flex-col items-center text-center bg-red-50 p-6 rounded-lg shadow-md border border-red-200">
                    <div className="relative mb-4">
                      <img
                        src={getTeamPhoto(member.id)}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-32 h-32 rounded-full object-cover border-4 border-red-400 shadow-lg"
                      />
                      {isOwner && (
                        <button
                          onClick={() => handlePhotoClick(member.id)}
                          disabled={teamPhotoUploading === member.id}
                          className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-60"
                        >
                          {teamPhotoUploading === member.id ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-red-700">{member.firstName} {member.lastName}</h4>
                    <p className="text-md text-red-600 mb-3 italic">Emprendedor/a</p>
                    {editingBioId === member.id ? (
                      <div className="w-full">
                        <textarea
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 h-24 resize-none"
                          value={tempBio}
                          onChange={(e) => setTempBio(e.target.value)}
                          placeholder="Escribí una bio..."
                        />
                        <div className="flex justify-center gap-2 mt-2">
                          <button
                            onClick={() => setEditingBioId(null)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-100 transition-colors duration-200"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveBio(member.id)}
                            disabled={savingBioId === member.id}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-60"
                          >
                            {savingBioId === member.id ? 'Guardando...' : 'Guardar'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {member.bio || <span className="italic text-gray-400">Sin bio aún.</span>}
                        </p>
                        {isOwner && (
                          <button
                            onClick={() => { setEditingBioId(member.id); setTempBio(member.bio || ''); }}
                            className="mt-3 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold hover:bg-blue-700 transition-colors duration-200"
                          >
                            Editar bio
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </AnimatedSection>
        )}

        <AnimatedSection delay="1.4s">
          <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-green-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-green-800 flex-grow">Únete a Nuestra Comunidad</h3>
              {isOwner && !isEditingCommunity && (
                <button
                  onClick={() => { setTempCommunityText(club.communityText || ''); setIsEditingCommunity(true); }}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  Editar
                </button>
              )}
            </div>
            {isEditingCommunity ? (
              <div>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-green-400 h-32 resize-none"
                  value={tempCommunityText}
                  onChange={(e) => setTempCommunityText(e.target.value)}
                />
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    onClick={() => setIsEditingCommunity(false)}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveCommunity}
                    disabled={savingCommunity}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-60"
                  >
                    {savingCommunity ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-center text-gray-700 max-w-3xl mx-auto mb-8 text-lg">
                  {communityTextToDisplay}
                </p>
                {club.socialMedia && <ClubSocialMedia socialMedia={club.socialMedia} />}
              </>
            )}
          </section>
        </AnimatedSection>

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