import React, { useState } from 'react';
import { Plus, MessageSquare, Edit, Trash2, Paperclip, Star, StarOff } from 'lucide-react';
import { Project, ProjectNote } from '../../types/projects';
import { useProjects } from '../../context/ProjectContext';
import { format } from 'date-fns';

interface ProjectNotesProps {
  project: Project;
}

const ProjectNotes: React.FC<ProjectNotesProps> = ({ project }) => {
  const { addNote, updateNote, deleteNote } = useProjects();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState<ProjectNote | null>(null);
  const [filterType, setFilterType] = useState<ProjectNote['type'] | 'all'>('all');
  const [formData, setFormData] = useState({
    content: '',
    type: 'general' as ProjectNote['type'],
    isImportant: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const noteData = {
      content: formData.content,
      type: formData.type,
      createdBy: 'Usuario Actual',
      isImportant: formData.isImportant,
      attachments: []
    };

    if (editingNote) {
      updateNote(project.id, editingNote.id, noteData);
    } else {
      addNote(project.id, noteData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      content: '',
      type: 'general',
      isImportant: false
    });
    setShowAddForm(false);
    setEditingNote(null);
  };

  const handleEdit = (note: ProjectNote) => {
    setFormData({
      content: note.content,
      type: note.type,
      isImportant: note.isImportant
    });
    setEditingNote(note);
    setShowAddForm(true);
  };

  const handleDelete = (noteId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
      deleteNote(project.id, noteId);
    }
  };

  const toggleImportant = (note: ProjectNote) => {
    updateNote(project.id, note.id, { isImportant: !note.isImportant });
  };

  const getTypeColor = (type: ProjectNote['type']) => {
    const colors = {
      'update': 'bg-blue-100 text-blue-800',
      'improvement': 'bg-green-100 text-green-800',
      'issue': 'bg-red-100 text-red-800',
      'meeting': 'bg-purple-100 text-purple-800',
      'general': 'bg-gray-100 text-gray-800'
    };
    return colors[type];
  };

  const getTypeIcon = (type: ProjectNote['type']) => {
    const icons = {
      'update': '📝',
      'improvement': '💡',
      'issue': '⚠️',
      'meeting': '🤝',
      'general': '📄'
    };
    return icons[type];
  };

  const filteredNotes = project.notes.filter(note => 
    filterType === 'all' || note.type === filterType
  ).sort((a, b) => {
    // Important notes first, then by date
    if (a.isImportant && !b.isImportant) return -1;
    if (!a.isImportant && b.isImportant) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Notas del Proyecto</h3>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ProjectNote['type'] | 'all')}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Todas las notas</option>
            <option value="update">Actualizaciones</option>
            <option value="improvement">Mejoras</option>
            <option value="issue">Problemas</option>
            <option value="meeting">Reuniones</option>
            <option value="general">General</option>
          </select>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Nota
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {editingNote ? 'Editar Nota' : 'Nueva Nota'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Nota
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ProjectNote['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="update">Actualización</option>
                  <option value="improvement">Mejora</option>
                  <option value="issue">Problema</option>
                  <option value="meeting">Reunión</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isImportant"
                  checked={formData.isImportant}
                  onChange={(e) => setFormData(prev => ({ ...prev, isImportant: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <label htmlFor="isImportant" className="text-sm font-medium text-gray-700">
                  Marcar como importante
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenido *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Escribe tu nota aquí..."
                required
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
                {editingNote ? 'Actualizar' : 'Crear'} Nota
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <div 
            key={note.id} 
            className={`bg-white rounded-xl shadow-sm border p-6 ${
              note.isImportant ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{getTypeIcon(note.type)}</span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(note.type)}`}>
                    {note.type}
                  </span>
                  {note.isImportant && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                  <span className="text-sm text-gray-500">
                    {format(note.createdAt, 'dd/MM/yyyy HH:mm')}
                  </span>
                  <span className="text-sm text-gray-500">
                    por {note.createdBy}
                  </span>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
                </div>

                {note.attachments.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {note.attachments.length} archivo(s) adjunto(s)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => toggleImportant(note)}
                  className={`transition-colors ${
                    note.isImportant 
                      ? 'text-yellow-500 hover:text-yellow-600' 
                      : 'text-gray-400 hover:text-yellow-500'
                  }`}
                  title={note.isImportant ? 'Quitar de importantes' : 'Marcar como importante'}
                >
                  {note.isImportant ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                </button>
                
                <button
                  onClick={() => handleEdit(note)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Editar nota"
                >
                  <Edit className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Eliminar nota"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay notas {filterType !== 'all' ? `de tipo "${filterType}"` : ''} para este proyecto</p>
            <p className="text-sm">Agrega notas para documentar el progreso y comunicación</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectNotes;