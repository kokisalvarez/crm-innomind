import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  FileText,
  Plus,
  CheckCircle,
  AlertTriangle,
  Video,
  Receipt,
  MessageSquare
} from 'lucide-react';
import { Project } from '../../types/projects';
import { useProjects } from '../../context/ProjectContext';
import { format } from 'date-fns';
import ProjectTimeline from './ProjectTimeline';
import ProjectNotes from './ProjectNotes';
import ProjectPayments from './ProjectPayments';
import ProjectMeetings from './ProjectMeetings';
import ProjectDocuments from './ProjectDocuments';
import ProjectExpenses from './ProjectExpenses';

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
  onEdit: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onClose, onEdit }) => {
  const { getClient } = useProjects();
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'notes' | 'payments' | 'meetings' | 'documents' | 'expenses'>('overview');

  const client = getClient(project.clientId);

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

  const getProjectProgress = () => {
    if (project.milestones.length === 0) return 0;
    const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
    return (completedMilestones / project.milestones.length) * 100;
  };

  const getProjectHealth = () => {
    const progress = getProjectProgress();
    const daysRemaining = Math.ceil((project.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const overdueTasks = project.milestones.filter(m => m.status !== 'completed' && m.dueDate < new Date()).length;
    
    if (overdueTasks > 0) return { status: 'at-risk', color: 'text-red-600', icon: AlertTriangle };
    if (progress >= 80) return { status: 'on-track', color: 'text-green-600', icon: CheckCircle };
    if (daysRemaining < 7) return { status: 'urgent', color: 'text-orange-600', icon: Clock };
    return { status: 'on-track', color: 'text-green-600', icon: CheckCircle };
  };

  const projectHealth = getProjectHealth();
  const HealthIcon = projectHealth.icon;

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: FileText },
    { id: 'timeline', label: 'Cronograma', icon: Calendar },
    { id: 'notes', label: 'Notas', icon: MessageSquare },
    { id: 'payments', label: 'Pagos', icon: DollarSign },
    { id: 'meetings', label: 'Reuniones', icon: Video },
    { id: 'documents', label: 'Documentos', icon: FileText },
    { id: 'expenses', label: 'Gastos', icon: Receipt }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <p className="text-gray-600">{client?.companyName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${projectHealth.color}`}>
            <HealthIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{projectHealth.status}</span>
          </div>
          <button
            onClick={onEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </button>
        </div>
      </div>

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Progreso</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(getProjectProgress())}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">${project.totalValue.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Días Restantes</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.ceil((project.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${
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

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Proyecto</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Descripción</label>
                    <p className="text-gray-900 mt-1">{project.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tipo</label>
                      <p className="text-gray-900 mt-1 capitalize">{project.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Prioridad</label>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Fecha de Inicio</label>
                      <p className="text-gray-900 mt-1">{format(project.startDate, 'dd/MM/yyyy')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Fecha de Entrega</label>
                      <p className="text-gray-900 mt-1">{format(project.endDate, 'dd/MM/yyyy')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso General</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progreso del Proyecto</span>
                      <span className="font-medium">{Math.round(getProjectProgress())}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${getProjectProgress()}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Horas Estimadas:</span>
                      <span className="font-medium ml-2">{project.estimatedHours}h</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Horas Trabajadas:</span>
                      <span className="font-medium ml-2">{project.actualHours}h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h3>
                {client && (
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900">{client.companyName}</p>
                      <p className="text-sm text-gray-600">{client.contactPerson}</p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">{client.email}</p>
                      <p className="text-gray-600">{client.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Team */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipo</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Project Manager</p>
                    <p className="text-gray-900">{project.projectManager}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Asignados ({project.assignedTo.length})</p>
                    <div className="space-y-1">
                      {project.assignedTo.map((member, index) => (
                        <p key={index} className="text-gray-900 text-sm">{member}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hitos:</span>
                    <span className="font-medium">{project.milestones.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Notas:</span>
                    <span className="font-medium">{project.notes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Documentos:</span>
                    <span className="font-medium">{project.documents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reuniones:</span>
                    <span className="font-medium">{project.meetings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gastos:</span>
                    <span className="font-medium">
                      ${project.expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && <ProjectTimeline project={project} />}
        {activeTab === 'notes' && <ProjectNotes project={project} />}
        {activeTab === 'payments' && <ProjectPayments project={project} />}
        {activeTab === 'meetings' && <ProjectMeetings project={project} />}
        {activeTab === 'documents' && <ProjectDocuments project={project} />}
        {activeTab === 'expenses' && <ProjectExpenses project={project} />}
      </div>
    </div>
  );
};

export default ProjectDetail;