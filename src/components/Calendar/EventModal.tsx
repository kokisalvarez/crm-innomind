import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar, Clock, MapPin, Users, Video, Bell, Repeat, Share, Download } from 'lucide-react';
import { CalendarEvent, EventAttendee, EventReminder } from '../../types/calendar';
import { useCalendar } from '../../context/CalendarContext';
import { whatsappIntegrationService } from '../../services/whatsappIntegration';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { configureMomentLocale } from '../../utils/dateLocalization';

// Configurar la localización en español para DatePicker
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';

registerLocale('es', es);
setDefaultLocale('es');

interface EventModalProps {
  event?: CalendarEvent | null;
  initialSlot?: { start: Date; end: Date } | null;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  initialSlot,
  onSave,
  onDelete,
  onClose,
}) => {
  const { categories, settings, isGoogleConnected } = useCalendar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'attendees' | 'reminders' | 'share'>('details');

  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    start: event?.start || initialSlot?.start || new Date(),
    end: event?.end || initialSlot?.end || new Date(Date.now() + 60 * 60 * 1000),
    location: event?.location || '',
    meetLink: event?.meetLink || '',
    categoryId: event?.category?.id || categories[0]?.id || '',
    color: event?.color || categories[0]?.color || '#3174ad',
    isRecurring: event?.isRecurring || false,
    recurrenceRule: event?.recurrenceRule || '',
    visibility: event?.visibility || 'public',
  });

  const [attendees, setAttendees] = useState<EventAttendee[]>(event?.attendees || []);
  const [reminders, setReminders] = useState<EventReminder[]>(
    event?.reminders || settings.defaultReminders
  );
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');

  const selectedCategory = categories.find(c => c.id === formData.categoryId);

  useEffect(() => {
    if (selectedCategory) {
      setFormData(prev => ({ ...prev, color: selectedCategory.color }));
    }
  }, [selectedCategory]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAttendee = () => {
    if (newAttendeeEmail && !attendees.find(a => a.email === newAttendeeEmail)) {
      const newAttendee: EventAttendee = {
        id: Date.now().toString(),
        email: newAttendeeEmail,
        name: newAttendeeEmail.split('@')[0],
        status: 'needsAction',
        isOptional: false,
      };
      setAttendees(prev => [...prev, newAttendee]);
      setNewAttendeeEmail('');
    }
  };

  const handleRemoveAttendee = (id: string) => {
    setAttendees(prev => prev.filter(a => a.id !== id));
  };

  const handleToggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const eventData: Partial<CalendarEvent> = {
        ...formData,
        category: selectedCategory,
        attendees,
        reminders,
      };

      await onSave(eventData);
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = (platform: 'whatsapp' | 'email' | 'copy') => {
    if (!event) return;

    switch (platform) {
      case 'whatsapp':
        const whatsappUrl = whatsappIntegrationService.createWhatsAppShareUrl(event);
        window.open(whatsappUrl, '_blank');
        break;
      case 'email':
        const subject = encodeURIComponent(`Invitación: ${event.title}`);
        const body = encodeURIComponent(whatsappIntegrationService.generateEventMessage(event));
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(whatsappIntegrationService.generateEventMessage(event));
        alert('Información del evento copiada al portapapeles');
        break;
    }
  };

  const handleDownloadCalendar = () => {
    if (event) {
      whatsappIntegrationService.downloadCalendarFile(event);
    }
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
    color: cat.color,
  }));

  const recurrenceOptions = [
    { value: '', label: 'No repetir' },
    { value: 'FREQ=DAILY', label: 'Diariamente' },
    { value: 'FREQ=WEEKLY', label: 'Semanalmente' },
    { value: 'FREQ=MONTHLY', label: 'Mensualmente' },
    { value: 'FREQ=YEARLY', label: 'Anualmente' },
  ];

  const reminderOptions = [
    { value: 0, label: 'En el momento' },
    { value: 5, label: '5 minutos antes' },
    { value: 15, label: '15 minutos antes' },
    { value: 30, label: '30 minutos antes' },
    { value: 60, label: '1 hora antes' },
    { value: 1440, label: '1 día antes' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-screen overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {event ? 'Editar Evento' : 'Nuevo Evento'}
          </h3>
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
              { id: 'details', label: 'Detalles', icon: Calendar },
              { id: 'attendees', label: 'Participantes', icon: Users },
              { id: 'reminders', label: 'Recordatorios', icon: Bell },
              { id: 'share', label: 'Compartir', icon: Share },
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

        <form onSubmit={handleSubmit} className="p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título del evento *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Reunión con cliente"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y hora de inicio *
                  </label>
                  <DatePicker
                    selected={formData.start}
                    onChange={(date) => handleInputChange('start', date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    locale="es"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y hora de fin *
                  </label>
                  <DatePicker
                    selected={formData.end}
                    onChange={(date) => handleInputChange('end', date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    locale="es"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <Select
                    value={categoryOptions.find(opt => opt.value === formData.categoryId)}
                    onChange={(option) => handleInputChange('categoryId', option?.value)}
                    options={categoryOptions}
                    formatOptionLabel={(option) => (
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: option.color }}
                        />
                        {option.label}
                      </div>
                    )}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Seleccionar categoría"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visibilidad
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => handleInputChange('visibility', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Público</option>
                    <option value="private">Privado</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Descripción del evento..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Dirección o lugar del evento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Video className="h-4 w-4 inline mr-1" />
                    Enlace de reunión
                  </label>
                  <input
                    type="url"
                    value={formData.meetLink}
                    onChange={(e) => handleInputChange('meetLink', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://meet.google.com/..."
                  />
                  {isGoogleConnected && settings.autoCreateMeetLinks && (
                    <p className="text-xs text-gray-500 mt-1">
                      Se generará automáticamente un enlace de Google Meet si se deja vacío
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={formData.isRecurring}
                      onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                      <Repeat className="h-4 w-4 inline mr-1" />
                      Evento recurrente
                    </label>
                  </div>
                  
                  {formData.isRecurring && (
                    <div className="mt-2">
                      <Select
                        value={recurrenceOptions.find(opt => opt.value === formData.recurrenceRule)}
                        onChange={(option) => handleInputChange('recurrenceRule', option?.value)}
                        options={recurrenceOptions}
                        placeholder="Seleccionar frecuencia"
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Attendees Tab */}
          {activeTab === 'attendees' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agregar participantes
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newAttendeeEmail}
                    onChange={(e) => setNewAttendeeEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="correo@ejemplo.com"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAttendee())}
                  />
                  <button
                    type="button"
                    onClick={handleAddAttendee}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Participantes ({attendees.length})
                </h4>
                <div className="space-y-2">
                  {attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                          {(attendee.name || attendee.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {attendee.name || attendee.email}
                          </p>
                          <p className="text-xs text-gray-500">{attendee.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          attendee.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          attendee.status === 'declined' ? 'bg-red-100 text-red-800' :
                          attendee.status === 'tentative' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {attendee.status === 'accepted' ? 'Aceptó' :
                           attendee.status === 'declined' ? 'Rechazó' :
                           attendee.status === 'tentative' ? 'Tentativo' :
                           'Pendiente'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttendee(attendee.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {attendees.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No hay participantes agregados</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Configurar recordatorios
                </h4>
                <div className="space-y-3">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={reminder.enabled}
                          onChange={() => handleToggleReminder(reminder.id)}
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

          {/* Share Tab */}
          {activeTab === 'share' && event && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Compartir evento
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleShare('whatsapp')}
                    className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white text-xl">💬</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                      <p className="text-xs text-gray-500">Compartir por WhatsApp</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare('email')}
                    className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white text-xl">📧</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-xs text-gray-500">Enviar por correo</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare('copy')}
                    className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white text-xl">📋</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">Copiar</p>
                      <p className="text-xs text-gray-500">Copiar al portapapeles</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCalendar}
                    className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Download className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">Descargar</p>
                      <p className="text-xs text-gray-500">Archivo .ics</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
            <div>
              {event && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;