import React, { useState } from 'react';
import { X, Save, Calendar, Clock, Bell, FolderSync as Sync, Palette, Shield } from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarSettings as CalendarSettingsType, EventCategory } from '../../types/calendar';

interface CalendarSettingsProps {
  onClose: () => void;
}

const CalendarSettings: React.FC<CalendarSettingsProps> = ({ onClose }) => {
  const {
    settings,
    categories,
    isGoogleConnected,
    updateSettings,
    addCategory,
    updateCategory,
    deleteCategory,
    connectToGoogle,
    disconnectFromGoogle,
  } = useCalendar();

  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'notifications' | 'integration'>('general');
  const [localSettings, setLocalSettings] = useState<CalendarSettingsType>(settings);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3174ad', description: '' });

  const handleSettingsChange = (field: keyof CalendarSettingsType, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      addCategory(newCategory);
      setNewCategory({ name: '', color: '#3174ad', description: '' });
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      deleteCategory(id);
    }
  };

  const timezones = [
    { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
    { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
    { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' },
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
    { value: 'Europe/London', label: 'Londres (GMT+0)' },
    { value: 'Asia/Tokyo', label: 'Tokio (GMT+9)' },
    { value: 'Australia/Sydney', label: 'Sídney (GMT+11)' },
  ];

  const colorOptions = [
    '#3174ad', '#28a745', '#ffc107', '#dc3545', '#6f42c1',
    '#fd7e14', '#20c997', '#6c757d', '#e83e8c', '#17a2b8'
  ];

  const viewOptions = [
    { value: 'month', label: 'Mes' },
    { value: 'week', label: 'Semana' },
    { value: 'day', label: 'Día' },
    { value: 'agenda', label: 'Agenda' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-screen overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Configuración del Calendario</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'general', label: 'General', icon: Calendar },
              { id: 'categories', label: 'Categorías', icon: Palette },
              { id: 'notifications', label: 'Notificaciones', icon: Bell },
              { id: 'integration', label: 'Integración', icon: Sync },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vista predeterminada
                  </label>
                  <select
                    value={localSettings.defaultView}
                    onChange={(e) => handleSettingsChange('defaultView', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {viewOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona horaria
                  </label>
                  <select
                    value={localSettings.timezone}
                    onChange={(e) => handleSettingsChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de inicio laboral
                  </label>
                  <input
                    type="time"
                    value={localSettings.workingHours.start}
                    onChange={(e) => handleSettingsChange('workingHours', {
                      ...localSettings.workingHours,
                      start: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de fin laboral
                  </label>
                  <input
                    type="time"
                    value={localSettings.workingHours.end}
                    onChange={(e) => handleSettingsChange('workingHours', {
                      ...localSettings.workingHours,
                      end: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoCreateMeetLinks"
                    checked={localSettings.autoCreateMeetLinks}
                    onChange={(e) => handleSettingsChange('autoCreateMeetLinks', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                  />
                  <label htmlFor="autoCreateMeetLinks" className="text-sm font-medium text-gray-700">
                    Crear automáticamente enlaces de Google Meet
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notificationsEnabled"
                    checked={localSettings.notificationsEnabled}
                    onChange={(e) => handleSettingsChange('notificationsEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                  />
                  <label htmlFor="notificationsEnabled" className="text-sm font-medium text-gray-700">
                    Habilitar notificaciones
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="syncWithGoogle"
                    checked={localSettings.syncWithGoogle}
                    onChange={(e) => handleSettingsChange('syncWithGoogle', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                    disabled={!isGoogleConnected}
                  />
                  <label htmlFor="syncWithGoogle" className="text-sm font-medium text-gray-700">
                    Sincronizar automáticamente con Google Calendar
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Agregar nueva categoría</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre de la categoría"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {colorOptions.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-full border-2 ${
                            newCategory.color === color ? 'border-gray-800' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Categorías existentes</h4>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-gray-500">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Recordatorios predeterminados</h4>
                <div className="space-y-3">
                  {localSettings.defaultReminders.map((reminder, index) => (
                    <div key={reminder.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={reminder.enabled}
                          onChange={(e) => {
                            const updatedReminders = [...localSettings.defaultReminders];
                            updatedReminders[index] = { ...reminder, enabled: e.target.checked };
                            handleSettingsChange('defaultReminders', updatedReminders);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {reminder.method === 'email' ? 'Email' :
                             reminder.method === 'popup' ? 'Notificación' :
                             'WhatsApp'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {reminder.minutes === 0 ? 'En el momento' :
                             reminder.minutes < 60 ? `${reminder.minutes} minutos antes` :
                             reminder.minutes < 1440 ? `${reminder.minutes / 60} horas antes` :
                             `${reminder.minutes / 1440} días antes`}
                          </p>
                        </div>
                      </div>
                      <Bell className={`h-4 w-4 ${reminder.enabled ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Integration Tab */}
          {activeTab === 'integration' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Google Calendar</h4>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Estado de conexión
                      </p>
                      <p className="text-xs text-gray-500">
                        {isGoogleConnected 
                          ? 'Conectado a Google Calendar' 
                          : 'No conectado a Google Calendar'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        isGoogleConnected ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      {isGoogleConnected ? (
                        <button
                          onClick={disconnectFromGoogle}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Desconectar
                        </button>
                      ) : (
                        <button
                          onClick={connectToGoogle}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Conectar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Integración WhatsApp</h4>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Compartir eventos
                      </p>
                      <p className="text-xs text-gray-500">
                        Permite compartir eventos directamente por WhatsApp
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm text-green-600">Disponible</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Seguridad</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Conexión segura</p>
                        <p className="text-xs text-gray-500">Todas las conexiones están cifradas</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Tokens seguros</p>
                        <p className="text-xs text-gray-500">Los tokens se almacenan de forma segura</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarSettings;