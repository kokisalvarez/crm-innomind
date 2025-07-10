import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle, Clock, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { Project, ProjectMilestone } from '../../types/projects';
import { useProjects } from '../../context/ProjectContext';
import { format } from 'date-fns';

interface ProjectTimelineProps {
  project: Project;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project }) => {
  const { addMilestone, updateMilestone, deleteMilestone } = useProjects();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '',
    dependencies: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const milestoneData = {
      title: formData.title,
      description: formData.description,
      dueDate: new Date(formData.dueDate),
      status: 'pending' as const,
      progress: 0,
      dependencies: formData.dependencies,
      assignedTo: formData.assignedTo
    };

    if (editingMilestone) {
      updateMilestone(project.id, editingMilestone.id, milestoneData);
    } else {
      addMilestone(project.id, milestoneData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      assignedTo: '',
      dependencies: []
    });
    setShowAddForm(false);
    setEditingMilestone(null);
  };

  const handleEdit = (milestone: ProjectMilestone) => {
    setFormData({
      title: milestone.title,
      description: milestone.description,
      dueDate: format(milestone.dueDate, 'yyyy-MM-dd'),
      assignedTo: milestone.assignedTo,
      dependencies: milestone.dependencies
    });
    setEditingMilestone(milestone);
    setShowAddForm(true);
  };

  const handleDelete = (milestoneId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este hito?')) {
      deleteMilestone(project.id, milestoneId);
    }
  };

  const handleStatusChange = (milestone: ProjectMilestone, newStatus: ProjectMilestone['status']) => {
    const updates: Partial<ProjectMilestone> = { status: newStatus };
    
    if (newStatus === 'completed' && !milestone.completedDate) {
      updates.completedDate = new Date();
      updates.progress = 100;
    } else if (newStatus !== 'completed') {
      updates.completedDate = undefined;
      updates.progress = newStatus === 'in-progress' ? 50 : 0;
    }

    updateMilestone(project.id, milestone.id, updates);
  };

  const getStatusIcon = (status: ProjectMilestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ProjectMilestone['status']) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const sortedMilestones = [...project.milestones].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Cronograma del Proyecto</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Hito
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {editingMilestone ? 'Editar Hito' : 'Nuevo Hito'}
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
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asignado a
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar miembro del equipo</option>
                {project.assignedTo.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
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
                {editingMilestone ? 'Actualizar' : 'Crear'} Hito
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {sortedMilestones.map((milestone, index) => (
            <div key={milestone.id} className="relative">
              {/* Timeline line */}
              {index < sortedMilestones.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
              )}
              
              <div className="flex items-start space-x-4">
                {/* Status icon */}
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(milestone.status)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{milestone.title}</h4>
                      {milestone.description && (
                        <p className="text-gray-600 mt-1">{milestone.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(milestone.status)}`}>
                          {milestone.status}
                        </span>
                        
                        <span className="text-sm text-gray-600">
                          Vence: {format(milestone.dueDate, 'dd/MM/yyyy')}
                        </span>
                        
                        {milestone.assignedTo && (
                          <span className="text-sm text-gray-600">
                            Asignado: {milestone.assignedTo}
                          </span>
                        )}
                        
                        {milestone.completedDate && (
                          <span className="text-sm text-green-600">
                            Completado: {format(milestone.completedDate, 'dd/MM/yyyy')}
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progreso</span>
                          <span className="font-medium">{milestone.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <select
                        value={milestone.status}
                        onChange={(e) => handleStatusChange(milestone, e.target.value as ProjectMilestone['status'])}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="in-progress">En Progreso</option>
                        <option value="completed">Completado</option>
                      </select>
                      
                      <button
                        onClick={() => handleEdit(milestone)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(milestone.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {sortedMilestones.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay hitos definidos para este proyecto</p>
              <p className="text-sm">Agrega hitos para hacer seguimiento del progreso</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;