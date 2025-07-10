import React, { useState } from 'react';
import { Plus, Video, Calendar, Users, Edit, Trash2, ExternalLink, Clock } from 'lucide-react';
import { Project, ProjectMeeting } from '../../types/projects';
import { useProjects } from '../../context/ProjectContext';
import { format } from 'date-fns';

interface ProjectMeetingsProps {
  project: Project;
}

const ProjectMeetings: React.FC<ProjectMeetingsProps> = ({ project }) => {
  const { addMeeting, updateMeeting, deleteMeeting } = useProjects();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<ProjectMeeting | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'review' as ProjectMeeting['type'],
    scheduledDate: '',
    duration: 60,
    attendees: [] as string[],
    meetLink: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const meetingData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      scheduledDate: new Date(formData.scheduledDate),
      duration: formData.duration,
      attendees: formData.attendees,
      meetLink: formData.meetLink,
      status: 'scheduled' as const,
      notes: formData.notes
    };

    if (editingMeeting) {
      updateMeeting(project.id, editingMeeting.id, meetingData);
    } else {
      addMeeting(project.id, meetingData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'review',
      scheduledDate: '',
      duration: 60,
      attendees: [],
      meetLink: '',
      notes: ''
    });
    setShowAddForm(false);
    setEditingMeeting(null);
  };

  const handleEdit = (meeting: ProjectMeeting) => {
    setFormData({
      title: meeting.title,
      description: meeting.description,
      type: meeting.type,
      scheduledDate: format(meeting.scheduledDate, "yyyy-MM-dd'T'HH:mm"),
      duration: meeting.duration,
      attendees: meeting.attendees,
      meetLink: meeting.meetLink || '',
      notes: meeting.notes
    });
    setEditingMeeting(meeting);
    setShowAddForm(true);
  };

  const handleDelete = (meetingId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reunión?')) {
      deleteMeeting(project.id, meetingId);
    }
  };

  const handleStatusChange = (meeting: ProjectMeeting, newStatus: ProjectMeeting['status']) => {
    updateMeeting(project.id, meeting.id, { status: newStatus });
  };

  const handleAttendeesChange = (value: string) => {
    const attendees = value.split(',').map(email => email.trim()).filter(email => email);
    setFormData(prev => ({ ...prev, attendees }));
  };

  const generateMeetLink = () => {
    const meetId = Math.random().toString(36).substr(2, 9);
    const meetLink = `https://meet.google.com/${meetId}`;
    setFormData(prev => ({ ...prev, meetLink }));
  };

  const getStatusColor = (status: ProjectMeeting['status']) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'rescheduled': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status];
  };

  const getTypeColor = (type: ProjectMeeting['type']) => {
    const colors = {
      'review': 'bg-purple-100 text-purple-800',
      'planning': 'bg-blue-100 text-blue-800',
      'status': 'bg-yellow-100 text-yellow-800',
      'demo': 'bg-green-100 text-green-800',
      'kickoff': 'bg-orange-100 text-orange-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[type];
  };

  const sortedMeetings = [...project.meetings].sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Reuniones del Proyecto</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Reunión
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {editingMeeting ? 'Editar Reunión' : 'Nueva Reunión'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Revisión de Progreso"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Reunión
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ProjectMeeting['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="review">Revisión</option>
                  <option value="planning">Planificación</option>
                  <option value="status">Estado</option>
                  <option value="demo">Demostración</option>
                  <option value="kickoff">Inicio</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Descripción de la reunión"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="15"
                  step="15"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participantes (emails separados por comas)
              </label>
              <textarea
                value={formData.attendees.join(', ')}
                onChange={(e) => handleAttendeesChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="email1@ejemplo.com, email2@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enlace de Reunión
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.meetLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetLink: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://meet.google.com/..."
                />
                <button
                  type="button"
                  onClick={generateMeetLink}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Generar Meet
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Notas adicionales sobre la reunión"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingMeeting ? 'Actualizar' : 'Crear'} Reunión
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Meetings List */}
      <div className="space-y-4">
        {sortedMeetings.map((meeting) => (
          <div key={meeting.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Video className="h-5 w-5 text-blue-600" />
                  <h4 className="text-lg font-medium text-gray-900">{meeting.title}</h4>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(meeting.type)}`}>
                    {meeting.type}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(meeting.status)}`}>
                    {meeting.status}
                  </span>
                </div>

                {meeting.description && (
                  <p className="text-gray-600 mb-3">{meeting.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(meeting.scheduledDate, 'dd/MM/yyyy HH:mm')}
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {meeting.duration} minutos
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {meeting.attendees.length} participantes
                  </div>
                </div>

                {meeting.attendees.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Participantes:</p>
                    <div className="flex flex-wrap gap-1">
                      {meeting.attendees.map((attendee, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          {attendee}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {meeting.meetLink && (
                  <div className="mt-3">
                    <a
                      href={meeting.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Unirse a la reunión
                    </a>
                  </div>
                )}

                {meeting.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{meeting.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <select
                  value={meeting.status}
                  onChange={(e) => handleStatusChange(meeting, e.target.value as ProjectMeeting['status'])}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="scheduled">Programada</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="rescheduled">Reprogramada</option>
                </select>
                
                <button
                  onClick={() => handleEdit(meeting)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Editar reunión"
                >
                  <Edit className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleDelete(meeting.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Eliminar reunión"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {sortedMeetings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Video className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay reuniones programadas para este proyecto</p>
            <p className="text-sm">Programa reuniones para mantener comunicación con el cliente</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMeetings;