import React, { useState } from 'react';
import { Club, HistoryMoment, TeamMember, SubscriptionPlan } from '../../types/club';

interface ManageClubImagesContentProps {
  activeSection: string;
  club: Club;
  onUpdateClub: (updatedClub: Club) => void;
}

const ManageClubImagesContent: React.FC<ManageClubImagesContentProps> = ({ activeSection, club, onUpdateClub }) => {
  const [logoPreview, setLogoPreview] = useState<string>(club.logoImage);
  const [bannerPreviews, setBannerPreviews] = useState<string[]>(club.bannerImages);
  const [historyMoments, setHistoryMoments] = useState<HistoryMoment[]>(club.historyMoments || []);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(club.teamMembers || []);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(club.subscriptionPlans);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) { 
      const url = URL.createObjectURL(file);
      callback(url);
    } else {
      alert('Solo imágenes JPG/PNG menores a 5MB');
    }
  };

  const updateClub = () => {
    const updatedClub = { ...club, logoImage: logoPreview, bannerImages: bannerPreviews, historyMoments, teamMembers, subscriptionPlans };
    onUpdateClub(updatedClub);
  };

  const removeImage = (index: number, array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>) => {
    setArray(array.filter((_, i) => i !== index));
  };

  const addHistoryMoment = (image: string, description: string) => {
    const newMoment: HistoryMoment = { id: `hm-${Date.now()}`, image, description };
    setHistoryMoments([...historyMoments, newMoment]);
  };

  const addTeamMember = (name: string, role: string, bio: string, image: string) => {
    const newMember: TeamMember = { id: `tm-${Date.now()}`, name, role, bio, image };
    setTeamMembers([...teamMembers, newMember]);
  };

  const updatePlanImage = (planId: string, newImage: string) => {
    const updatedPlans = subscriptionPlans.map(plan => 
      plan.planId === planId ? { ...plan, image: newImage } : plan
    );
    setSubscriptionPlans(updatedPlans);
  };

  switch (activeSection) {
    case 'logo':
      return (
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-bold mb-4">Logo Principal</h2>
          <p className="text-gray-600 mb-4">Aparece en: Header del perfil del club, navbar, todas las páginas.</p>
          <div className="flex flex-col md:flex-row gap-6">
            <img src={logoPreview} alt="Logo actual" className="w-32 h-32 object-contain border rounded-lg" />
            <div>
              <input type="file" onChange={(e) => handleImageUpload(e, setLogoPreview)} accept="image/*" className="mb-2" />
              <button onClick={updateClub} className="bg-blue-600 text-white px-4 py-2 rounded">Guardar Cambios</button>
            </div>
          </div>
        </div>
      );
    case 'banners':
      return (
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-bold mb-4">Banners</h2>
          <p className="text-gray-600 mb-4">Aparece en: Slider principal del perfil del club (rotación automática).</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {bannerPreviews.map((img, index) => (
              <div key={index} className="relative">
                <img src={img} alt={`Banner ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                <button onClick={() => removeImage(index, bannerPreviews, setBannerPreviews)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded">X</button>
              </div>
            ))}
          </div>
          <input type="file" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setBannerPreviews([...bannerPreviews, URL.createObjectURL(file)]);
          }} accept="image/*" multiple className="mb-2" />
          <button onClick={updateClub} className="bg-blue-600 text-white px-4 py-2 rounded">Guardar Cambios</button>
          <p className="text-sm text-gray-500 mt-2">Arrastra para reordenar (implementar drag&drop en backend).</p>
        </div>
      );
    case 'history':
      return (
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-bold mb-4">Imágenes de Historia</h2>
          <p className="text-gray-600 mb-4">Aparece en: Sección "Nuestra Historia" del perfil (1-3 imágenes con descripciones).</p>
          <div className="space-y-4 mb-4">
            {historyMoments.map((moment) => (
              <div key={moment.id} className="flex gap-4 p-4 border rounded-lg">
                <img src={moment.image} alt={moment.description} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <textarea
                    value={moment.description}
                    onChange={(e) => setHistoryMoments(historyMoments.map(m => m.id === moment.id ? { ...m, description: e.target.value } : m))}
                    className="w-full p-2 border rounded"
                    rows={2}
                  />
                  <button onClick={() => setHistoryMoments(historyMoments.filter(m => m.id !== moment.id))} className="text-red-500 mt-2">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mb-4">
            <input type="file" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                const desc = prompt('Descripción para esta imagen:');
                if (desc) addHistoryMoment(url, desc);
              }
            }} accept="image/*" />
          </div>
          <button onClick={updateClub} className="bg-blue-600 text-white px-4 py-2 rounded">Guardar Cambios</button>
        </div>
      );
    case 'plans':
      return (
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-bold mb-4">Imágenes de Planes de Suscripción</h2>
          <p className="text-gray-600 mb-4">Aparece en: Tarjetas de planes en el perfil del club y detalles de suscripción.</p>
          <div className="space-y-4">
            {subscriptionPlans.map((plan) => (
              <div key={plan.planId} className="flex gap-4 p-4 border rounded-lg">
                <img src={plan.image} alt={plan.name} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-bold">{plan.name}</h3>
                  <input type="file" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) updatePlanImage(plan.planId, URL.createObjectURL(file));
                  }} accept="image/*" className="mt-2" />
                  <button onClick={() => updateClub()} className="bg-blue-600 text-white px-3 py-1 rounded ml-2">Actualizar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'team':
      return (
        <div className="animate-fadeInUp">
          <h2 className="text-2xl font-bold mb-4">Imágenes de Equipo</h2>
          <p className="text-gray-600 mb-4">Aparece en: Sección "Conoce Nuestro Equipo" del perfil.</p>
          <div className="space-y-4 mb-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex gap-4 p-4 border rounded-lg">
                <img src={member.image} alt={member.name} className="w-20 h-20 object-cover rounded-full" />
                <div className="flex-1">
                  <h3 className="font-bold">{member.name}</h3>
                  <p className="text-sm">{member.role}</p>
                  <textarea
                    value={member.bio}
                    onChange={(e) => setTeamMembers(teamMembers.map(m => m.id === member.id ? { ...m, bio: e.target.value } : m))}
                    className="w-full p-2 border rounded mt-2"
                    rows={2}
                  />
                  <button onClick={() => setTeamMembers(teamMembers.filter(m => m.id !== member.id))} className="text-red-500 mt-2">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Nombre" id="newName" className="p-2 border rounded" />
            <input type="text" placeholder="Rol" id="newRole" className="p-2 border rounded" />
            <input type="file" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                const name = (document.getElementById('newName') as HTMLInputElement).value;
                const role = (document.getElementById('newRole') as HTMLInputElement).value;
                const bio = prompt('Bio del miembro:');
                if (name && role && bio) addTeamMember(name, role, bio, url);
              }
            }} accept="image/*" className="p-2 border rounded col-span-2" />
          </div>
          <button onClick={updateClub} className="bg-blue-600 text-white px-4 py-2 rounded">Guardar Cambios</button>
        </div>
      );
    default:
      return <div>Sección no encontrada</div>;
  }
};

export default ManageClubImagesContent;