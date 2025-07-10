import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent } from '../../types/calendar';
import { useCalendar } from '../../context/CalendarContext';
import { Plus, Settings, FolderSync as Sync, Calendar as CalendarIcon, List, Grid, Clock } from 'lucide-react';
import EventModal from './EventModal';
import CalendarSettings from './CalendarSettings';
import { configureMomentLocale, formatDateSpanish } from '../../utils/dateLocalization';

// Configurar moment en español antes de crear el localizer
configureMomentLocale();
const localizer = momentLocalizer(moment);

const CalendarView: React.FC = () => {
  const {
    events,
    settings,
    isGoogleConnected,
    isLoading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    syncWithGoogle,
    connectToGoogle,
  } = useCalendar();

  const [currentView, setCurrentView] = useState<View>(settings.defaultView as View);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // Convert CalendarEvent to react-big-calendar format
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.end),
    resource: event,
    style: {
      backgroundColor: event.color,
      borderColor: event.color,
    },
  }));

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
    setSelectedSlot(null);
    setShowEventModal(true);
  };

  const handleSelectSlot = (slotInfo: any) => {
    setSelectedEvent(null);
    setSelectedSlot({
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setShowEventModal(true);
  };

  const handleEventSave = async (eventData: Partial<CalendarEvent>) => {
    try {
      if (selectedEvent) {
        await updateEvent(selectedEvent.id, eventData);
      } else {
        await addEvent(eventData);
      }
      setShowEventModal(false);
      setSelectedEvent(null);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEventDelete = async () => {
    if (selectedEvent) {
      try {
        await deleteEvent(selectedEvent.id);
        setShowEventModal(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleSync = async () => {
    if (isGoogleConnected) {
      try {
        await syncWithGoogle();
      } catch (error) {
        console.error('Error syncing with Google:', error);
      }
    }
  };

  const eventStyleGetter = (event: any) => {
    return {
      style: {
        backgroundColor: event.resource.color,
        borderColor: event.resource.color,
        color: 'white',
        borderRadius: '4px',
        border: 'none',
        fontSize: '12px',
        padding: '2px 4px',
      },
    };
  };

  const getViewIcon = (view: View) => {
    switch (view) {
      case Views.MONTH:
        return <Grid className="h-4 w-4" />;
      case Views.WEEK:
        return <CalendarIcon className="h-4 w-4" />;
      case Views.DAY:
        return <Clock className="h-4 w-4" />;
      case Views.AGENDA:
        return <List className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getViewLabel = (view: View) => {
    switch (view) {
      case Views.MONTH:
        return 'Mes';
      case Views.WEEK:
        return 'Semana';
      case Views.DAY:
        return 'Día';
      case Views.AGENDA:
        return 'Agenda';
      default:
        return view;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendario</h2>
          <p className="text-gray-600">Gestiona tus eventos y reuniones</p>
        </div>

        <div className="flex gap-2">
          {/* View Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentView === view
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {getViewIcon(view)}
                {getViewLabel(view)}
              </button>
            ))}
          </div>

          {/* Google Sync */}
          {isGoogleConnected ? (
            <button
              onClick={handleSync}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Sync className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>
          ) : (
            <button
              onClick={connectToGoogle}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Conectar Google
            </button>
          )}

          <button
            onClick={() => setShowEventModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Evento
          </button>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Configuración
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            popup
            showMultiDayTimes
            step={30}
            timeslots={2}
            defaultDate={new Date()}
            messages={{
              next: 'Siguiente',
              previous: 'Anterior',
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda',
              date: 'Fecha',
              time: 'Hora',
              event: 'Evento',
              noEventsInRange: 'No hay eventos en este rango',
              showMore: (total) => `+ Ver ${total} más`,
              allDay: 'Todo el día',
              work_week: 'Semana laboral',
              yesterday: 'Ayer',
              tomorrow: 'Mañana',
            }}
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) =>
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
              dayHeaderFormat: (date) => moment(date).format('dddd DD/MM'),
              dayRangeHeaderFormat: ({ start, end }) =>
                `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM')}`,
              monthHeaderFormat: (date) => moment(date).format('MMMM YYYY'),
              weekdayFormat: (date) => moment(date).format('ddd'),
              agendaHeaderFormat: ({ start, end }) =>
                `${moment(start).format('DD/MM/YYYY')} - ${moment(end).format('DD/MM/YYYY')}`,
              agendaDateFormat: (date) => moment(date).format('ddd DD/MM'),
              agendaTimeFormat: (date) => moment(date).format('HH:mm'),
              agendaTimeRangeFormat: ({ start, end }) =>
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
            }}
            culture="es-custom"
          />
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          event={selectedEvent}
          initialSlot={selectedSlot}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
            setSelectedSlot(null);
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <CalendarSettings
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
};

export default CalendarView;