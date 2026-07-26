import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import SettingsSidebar from '../../../../components/entrepreneur/SettingsSidebar';
import api, { getResponseData } from '../../../../api/config';
import { GeneralSetting } from '../../../../types/financial';

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
  const [saving, setSaving] = useState(false);

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
            transformedSettings[category] = Object.keys(settingsData[category]).map((key) => ({
              key,
              value: settingsData[category][key],
              category: category as 'finances' | 'team' | 'notifications',
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
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [actualClubId, userRole, navigate]);

  const handleSettingChange = (key: string, value: any) => {
    setEditedSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSection = async () => {
    setSaving(true);
    try {
      const sectionSettings = settings[activeSection] || [];
      const payload: Record<string, any> = {};
      sectionSettings.forEach((s) => {
        payload[s.key] = editedSettings[s.key] !== undefined ? editedSettings[s.key] : s.value;
      });

      await api.put(`/clubs/${actualClubId}/settings/${activeSection}`, {
        [activeSection]: payload,
      });
      alert('Ajustes guardados exitosamente');
      setSettings((prev) => {
        const newSettings = { ...prev };
        if (newSettings[activeSection]) {
          newSettings[activeSection] = newSettings[activeSection].map((s) => ({
            ...s,
            value: payload[s.key] !== undefined ? payload[s.key] : s.value,
          }));
        }
        return newSettings;
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar ajustes');
    } finally {
      setSaving(false);
    }
  };

  const renderFinancesSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-serif font-bold text-aurora-navy">Configuraciones Financieras</h3>
      {(settings.finances || []).map((setting: GeneralSetting) => (
        <div key={setting.key} className="border border-aurora-navy/10 p-4 rounded-xl bg-aurora-cream">
          <label className="block text-sm font-medium text-aurora-navy mb-2 capitalize">
            {setting.key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          {typeof setting.value === 'number' ? (
            <input
              type="number"
              step={setting.key.includes('taxRate') ? '0.01' : '1'}
              value={editedSettings[setting.key] !== undefined ? editedSettings[setting.key] : setting.value}
              onChange={(e) => handleSettingChange(setting.key, parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-aurora-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-navy bg-white"
              placeholder={`Valor actual: ${setting.value}`}
            />
          ) : Array.isArray(setting.value) ? (
            <input
              type="text"
              value={editedSettings[setting.key] !== undefined ? editedSettings[setting.key].join(', ') : setting.value.join(', ')}
              onChange={(e) => handleSettingChange(setting.key, e.target.value.split(',').map((s) => s.trim()))}
              className="w-full p-2 border border-aurora-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-navy bg-white"
              placeholder={`Valores actuales: ${setting.value.join(', ')}`}
            />
          ) : (
            <input
              type="text"
              value={editedSettings[setting.key] !== undefined ? editedSettings[setting.key] : setting.value}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
              className="w-full p-2 border border-aurora-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-navy bg-white"
              placeholder={`Valor actual: ${setting.value}`}
            />
          )}
          <p className="text-xs text-aurora-navy/50 mt-1">
            Valor actual: {Array.isArray(setting.value) ? setting.value.join(', ') : setting.value?.toString()}
          </p>
        </div>
      ))}
      <button
        onClick={handleSaveSection}
        disabled={saving}
        className={`bg-aurora-navy text-white px-6 py-2 rounded-lg hover:bg-aurora-navy/90 transition-colors duration-200 font-semibold ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {saving ? 'Guardando...' : 'Guardar Ajustes Financieros'}
      </button>
    </div>
  );

  const renderTeamSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-serif font-bold text-aurora-navy">Configuraciones de Equipo</h3>
      {(settings.team || []).map((setting: GeneralSetting) => (
        <div key={setting.key} className="border border-aurora-navy/10 p-4 rounded-xl bg-aurora-cream">
          <label className="block text-sm font-medium text-aurora-navy mb-2 capitalize">
            {setting.key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          {typeof setting.value === 'number' ? (
            <input
              type="number"
              value={editedSettings[setting.key] !== undefined ? editedSettings[setting.key] : setting.value}
              onChange={(e) => handleSettingChange(setting.key, parseInt(e.target.value) || 0)}
              className="w-full p-2 border border-aurora-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-navy bg-white"
              placeholder={`Valor actual: ${setting.value}`}
            />
          ) : typeof setting.value === 'boolean' ? (
            <select
              value={editedSettings[setting.key] !== undefined ? editedSettings[setting.key].toString() : setting.value.toString()}
              onChange={(e) => handleSettingChange(setting.key, e.target.value === 'true')}
              className="w-full p-2 border border-aurora-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-navy bg-white"
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          ) : (
            <input
              type="text"
              value={editedSettings[setting.key] !== undefined ? editedSettings[setting.key] : setting.value}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
              className="w-full p-2 border border-aurora-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-navy bg-white"
              placeholder={`Valor actual: ${setting.value}`}
            />
          )}
          <p className="text-xs text-aurora-navy/50 mt-1">Valor actual: {setting.value?.toString()}</p>
        </div>
      ))}
      <button
        onClick={handleSaveSection}
        disabled={saving}
        className={`bg-aurora-navy text-white px-6 py-2 rounded-lg hover:bg-aurora-navy/90 transition-colors duration-200 font-semibold ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {saving ? 'Guardando...' : 'Guardar Ajustes de Equipo'}
      </button>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-serif font-bold text-aurora-navy">Configuraciones de Notificaciones</h3>
      {(settings.notifications || []).map((setting: GeneralSetting) => (
        <div key={setting.key} className="border border-aurora-navy/10 p-4 rounded-xl bg-aurora-cream flex items-center justify-between">
          <label className="flex items-center text-sm font-medium text-aurora-navy">
            <input
              type="checkbox"
              checked={editedSettings[setting.key] !== undefined ? editedSettings[setting.key] : setting.value}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
              className="mr-3 h-4 w-4 text-aurora-navy focus:ring-aurora-navy border-aurora-navy/25 rounded"
            />
            <span className="capitalize">{setting.key.replace(/([A-Z])/g, ' $1').trim()}</span>
          </label>
          <p className="text-xs text-aurora-navy/50">
            Estado actual: {editedSettings[setting.key] ? 'Activado' : 'Desactivado'}
          </p>
        </div>
      ))}
      <button
        onClick={handleSaveSection}
        disabled={saving}
        className={`bg-aurora-navy text-white px-6 py-2 rounded-lg hover:bg-aurora-navy/90 transition-colors duration-200 font-semibold ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {saving ? 'Guardando...' : 'Guardar Ajustes de Notificaciones'}
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'finances':
        return renderFinancesSection();
      case 'team':
        return renderTeamSection();
      case 'notifications':
        return renderNotificationsSection();
      default:
        return <p className="text-aurora-navy/70">Seleccioná una sección del sidebar para ver y editar los ajustes.</p>;
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-aurora-navy/60">Cargando ajustes...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-aurora-cream">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <SettingsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>

        <div className="lg:w-3/4 bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-8">
          <h1 className="text-3xl font-serif font-bold text-aurora-navy mb-2">Ajustes Generales - {clubName}</h1>
          <p className="text-aurora-navy/70 mb-6">Configurá parámetros de finanzas, equipo y notificaciones para tu club.</p>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;