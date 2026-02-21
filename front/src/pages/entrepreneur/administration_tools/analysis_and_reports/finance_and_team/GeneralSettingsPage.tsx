import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../App';
import SettingsSidebar from '../../../../../components/entrepreneur/SettingsSidebar';
import api, { getResponseData } from '../../../../../api/config';
import { GeneralSetting } from '../../../../../types/financial';

const GeneralSettingsPage: React.FC = () => {
  const { user, userRole } = useAuth();
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const actualClubId = clubId || user?.managedClubId;
  const [clubName, setClubName] = useState('Tu Club');

  const [settings, setSettings] = useState<Record<string, GeneralSetting[]>>({});
  const [activeSection, setActiveSection] = useState('finances');
  const [editedSettings, setEditedSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (userRole !== 'entrepreneur' || !actualClubId) {
        navigate('/');
        return;
      }

      try {
        const clubResponse = await api.get(`/clubs/${actualClubId}`);
        const clubData = getResponseData(clubResponse);
        setClubName(clubData.name || 'Tu Club');

        const settingsResponse = await api.get(`/clubs/${actualClubId}/settings`);
        const settingsData = getResponseData(settingsResponse);

        const transformedSettings: Record<string, GeneralSetting[]> = {};
        for (const category in settingsData) {
          if (Object.prototype.hasOwnProperty.call(settingsData, category)) {
            transformedSettings[category] = Object.keys(settingsData[category]).map(key => ({
              key: key,
              value: settingsData[category][key],
              category: category as 'finances' | 'team' | 'notifications'
            }));
          }
        }
        setSettings(transformedSettings);

        const initialEdited: Record<string, any> = {};
        for (const category in settingsData) {
          if (Object.prototype.hasOwnProperty.call(settingsData, category)) {
            for (const key in settingsData[category]) {
              if (Object.prototype.hasOwnProperty.call(settingsData[category], key)) {
                initialEdited[key] = settingsData[category][key];
              }
            }
          }
        }
        setEditedSettings(initialEdited);
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [actualClubId, userRole, navigate]);

  const handleSettingChange = (key: string, value: any) => {
    setEditedSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSection = async () => {
    try {
      await api.put(`/clubs/${actualClubId}/settings/${activeSection}`, {
        [activeSection]: editedSettings
      });
      alert('Ajustes guardados exitosamente');
      setSettings(prev => {
        const newSettings = { ...prev };
        if (newSettings[activeSection]) {
          newSettings[activeSection] = newSettings[activeSection].map(s => ({
            ...s,
            value: editedSettings[s.key] !== undefined ? editedSettings[s.key] : s.value
          }));
        }
        return newSettings;
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      alert('Error al guardar ajustes');
    }
  };

  const renderFinancesSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">Configuraciones Financieras</h3>
      {(settings.finances || []).map((setting: GeneralSetting) => (
        <div key={setting.key} className="border p-4 rounded-lg bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{setting.key.replace(/([A-Z])/g, ' $1').trim()}</label>
          {typeof setting.value === 'number' ? (
            <input
              type="number"
              step={setting.key.includes('taxRate') ? '0.01' : '1'}
              value={editedSettings[setting.key] !== undefined ? editedSettings[setting.key] : setting.value}
              onChange={(e) => handleSettingChange(setting.key, parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Valor actual: ${setting.value}`}
            />
          ) : Array.isArray(setting.value) ? (
            <input
              type="text"
              value={editedSettings[setting.key] !== undefined ? editedSettings[setting.key].join(', ') : setting.value.join(', ')}
              onChange={(e) => handleSettingChange(setting.key, e.target.value.split(',').map(s => s.trim()))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Valores actuales: ${setting.value.join(', ')}`}
            />
          ) : (
            <input
              type="text"
              value={editedSettings[setting.key] !== undefined ? editedSettings[setting.key] : setting.value}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Valor actual: ${setting.value}`}
            />
          )}
          <p className="text-xs text-gray-500 mt-1">Valor actual: {Array.isArray(setting.value) ? setting.value.join(', ') : setting.value?.toString()}</p>
        </div>
      ))}
      <button
        onClick={handleSaveSection}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
      >
        Guardar Ajustes Financieros
      </button>
    </div>
  );

  const renderTeamSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">Configuraciones de Equipo</h3>
      {(settings.team || []).map((setting: GeneralSetting) => (
        <div key={setting.key} className="border p-4 rounded-lg bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{setting.key.replace(/([A-Z])/g, ' $1').trim()}</label>
          {typeof setting.value === 'number' ? (
            <input
              type="number"
              value={editedSettings[setting.key] !== undefined ? editedSettings[setting.key] : setting.value}
              onChange={(e) => handleSettingChange(setting.key, parseInt(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Valor actual: ${setting.value}`}
            />
          ) : typeof setting.value === 'boolean' ? (
            <select
              value={editedSettings[setting.key] !== undefined ? editedSettings[setting.key].toString() : setting.value.toString()}
              onChange={(e) => handleSettingChange(setting.key, e.target.value === 'true')}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          ) : (
            <input
              type="text"
              value={editedSettings[setting.key] !== undefined ? editedSettings[setting.key] : setting.value}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Valor actual: ${setting.value}`}
            />
          )}
          <p className="text-xs text-gray-500 mt-1">Valor actual: {setting.value?.toString()}</p>
        </div>
      ))}
      <button
        onClick={handleSaveSection}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
      >
        Guardar Ajustes de Equipo
      </button>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">Configuraciones de Notificaciones</h3>
      {(settings.notifications || []).map((setting: GeneralSetting) => (
        <div key={setting.key} className="border p-4 rounded-lg bg-gray-50 flex items-center justify-between">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={editedSettings[setting.key] !== undefined ? editedSettings[setting.key] : setting.value}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="capitalize">{setting.key.replace(/([A-Z])/g, ' $1').trim()}</span>
          </label>
          <p className="text-xs text-gray-500">Estado actual: {editedSettings[setting.key] ? 'Activado' : 'Desactivado'}</p>
        </div>
      ))}
      <button
        onClick={handleSaveSection}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
      >
        Guardar Ajustes de Notificaciones
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'finances': return renderFinancesSection();
      case 'team': return renderTeamSection();
      case 'notifications': return renderNotificationsSection();
      default: return <p className="text-gray-600">Selecciona una sección del sidebar para ver y editar los ajustes.</p>;
    }
  };

  if (loading) {
    return <div className="text-center py-20">Cargando ajustes...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <SettingsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>

        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Ajustes Generales - {clubName}</h1>
          <p className="text-gray-600 mb-6">Configura parámetros de finanzas, equipo y notificaciones para tu club.</p>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;                