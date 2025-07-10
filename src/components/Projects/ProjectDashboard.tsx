import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { Project, ProjectFilters } from '../../types/projects';
import { format } from 'date-fns';

interface ProjectDashboardProps {
  onProjectSelect: (project: Project) => void;
  onNewProject: () => void;
  onNewClient: () => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  onProjectSelect,
  onNewProject,
  onNewClient
}) => {
  const { 
    projects, 
    clients, 
    getSalesMetrics, 
    getUpcomingPayments, 
    getUpcomingMeetings,
    getOverdueTasks 
  } = useProjects();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const salesMetrics = getSalesMetrics();
  const upcomingPayments = getUpcomingPayments(30);
  const upcomingMeetings = getUpcomingMeetings(7);
  const overdueTasks = getOverdueTasks();

  const filteredProjects = projects.filter(project => {
    const client = clients.find(c => c.id === project.clientId);
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.companyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status?.length || filters.status.includes(project.status);
    const matchesType = !filters.type?.length || filters.type.includes(project.type);
    const matchesPriority = !filters.priority?.length || filters.priority.includes(project.priority);

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const getStatusColor = (status: Project['status']) => {
    const colors = {
      'planning': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'testing': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'on-hold': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Project['priority']) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority];
  };

  const getProjectProgress = (project: Project) => {
    if (project.milestones.length === 0) return 0;
    const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
    return (completedMilestones / project.milestones.length) * 100;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Proyectos</h2>
          <p className="text-gray-600">Administra proyectos de clientes y seguimiento financiero</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onNewClient}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Nuevo Cliente
          </button>
          <button
            onClick={onNewProject}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Proyectos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{salesMetrics.activeProjects}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-gray-900">
                ${salesMetrics.monthlyRevenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pagos Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingPayments.length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tareas Vencidas</p>
              <p className="text-2xl font-bold text-gray-900">{overdueTasks.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(upcomingPayments.length > 0 || upcomingMeetings.length > 0 || overdueTasks.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Payments */}
          {upcomingPayments.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <DollarSign className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="font-semibold text-yellow-800">Pagos Próximos</h3>
              </div>
              <div className="space-y-2">
                {upcomingPayments.slice(0, 3).map(payment => (
                  <div key={payment.id} className="text-sm">
                    <p className="font-medium text-yellow-900">${payment.amount.toLocaleString()}</p>
                    <p className="text-yellow-700">{format(payment.dueDate, 'dd/MM/yyyy')}</p>
                  </div>
                ))}
                {upcomingPayments.length > 3 && (
                  <p className="text-xs text-yellow-600">+{upcomingPayments.length - 3} más</p>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Meetings */}
          {upcomingMeetings.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">Reuniones Próximas</h3>
              </div>
              <div className="space-y-2">
                {upcomingMeetings.slice(0, 3).map(meeting => (
                  <div key={meeting.id} className="text-sm">
                    <p className="font-medium text-blue-900">{meeting.title}</p>
                    <p className="text-blue-700">{format(meeting.scheduledDate, 'dd/MM HH:mm')}</p>
                  </div>
                ))}
                {upcomingMeetings.length > 3 && (
                  <p className="text-xs text-blue-600">+{upcomingMeetings.length - 3} más</p>
                )}
              </div>
            </div>
          )}

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-semibold text-red-800">Tareas Vencidas</h3>
              </div>
              <div className="space-y-2">
                {overdueTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="text-sm">
                    <p className="font-medium text-red-900">{task.title}</p>
                    <p className="text-red-700">{format(task.dueDate, 'dd/MM/yyyy')}</p>
                  </div>
                ))}
                {overdueTasks.length > 3 && (
                  <p className="text-xs text-red-600">+{overdueTasks.length - 3} más</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar proyectos o clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filters.status?.[0] || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                status: e.target.value ? [e.target.value as Project['status']] : undefined
              }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="planning">Planificación</option>
              <option value="in-progress">En Progreso</option>
              <option value="testing">Pruebas</option>
              <option value="completed">Completado</option>
              <option value="on-hold">En Pausa</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <select
              value={filters.type?.[0] || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                type: e.target.value ? [e.target.value as Project['type']] : undefined
              }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              <option value="chatbot">Chatbot</option>
              <option value="app">Aplicación</option>
              <option value="website">Sitio Web</option>
              <option value="crm">CRM</option>
              <option value="automation">Automatización</option>
              <option value="other">Otro</option>
            </select>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => {
            const client = clients.find(c => c.id === project.clientId);
            const progress = getProjectProgress(project);
            
            return (
              <div
                key={project.id}
                onClick={() => onProjectSelect(project)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{client?.companyName}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progreso</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-semibold text-gray-900">${project.totalValue.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Entrega:</span>
                    <span className="text-gray-900">{format(project.endDate, 'dd/MM/yyyy')}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      {project.assignedTo.length} miembros
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {project.milestones.length} hitos
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proyecto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrega
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map(project => {
                  const client = clients.find(c => c.id === project.clientId);
                  const progress = getProjectProgress(project);
                  
                  return (
                    <tr 
                      key={project.id}
                      onClick={() => onProjectSelect(project)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">{project.type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{client?.companyName}</div>
                        <div className="text-sm text-gray-500">{client?.contactPerson}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-900">{Math.round(progress)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${project.totalValue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(project.endDate, 'dd/MM/yyyy')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron proyectos</h3>
          <p className="text-gray-500 mb-4">Intenta ajustar los filtros o crear un nuevo proyecto.</p>
          <button
            onClick={onNewProject}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear Primer Proyecto
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;