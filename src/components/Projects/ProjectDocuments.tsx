import React, { useState } from 'react';
import { Plus, FileText, Download, Eye, Edit, Trash2, Upload, Search } from 'lucide-react';
import { Project, ProjectDocument } from '../../types/projects';
import { useProjects } from '../../context/ProjectContext';
import { format } from 'date-fns';

interface ProjectDocumentsProps {
  project: Project;
}

const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({ project }) => {
  const { updateProject } = useProjects();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<ProjectDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ProjectDocument['type'] | 'all'>('all');
  const [formData, setFormData] = useState({
    name: '',
    type: 'documentation' as ProjectDocument['type'],
    url: '',
    description: '',
    version: '1.0'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const documentData: ProjectDocument = {
      id: editingDocument?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type,
      url: formData.url,
      size: 0, // In a real app, this would be calculated from the file
      uploadedBy: 'Usuario Actual',
      uploadedAt: new Date(),
      version: formData.version,
      description: formData.description
    };

    const updatedDocuments = editingDocument
      ? project.documents.map(doc => doc.id === editingDocument.id ? documentData : doc)
      : [...project.documents, documentData];

    updateProject(project.id, { documents: updatedDocuments });
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'documentation',
      url: '',
      description: '',
      version: '1.0'
    });
    setShowAddForm(false);
    setEditingDocument(null);
  };

  const handleEdit = (document: ProjectDocument) => {
    setFormData({
      name: document.name,
      type: document.type,
      url: document.url,
      description: document.description,
      version: document.version
    });
    setEditingDocument(document);
    setShowAddForm(true);
  };

  const handleDelete = (documentId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      const updatedDocuments = project.documents.filter(doc => doc.id !== documentId);
      updateProject(project.id, { documents: updatedDocuments });
    }
  };

  const getTypeColor = (type: ProjectDocument['type']) => {
    const colors = {
      'contract': 'bg-red-100 text-red-800',
      'specification': 'bg-blue-100 text-blue-800',
      'design': 'bg-purple-100 text-purple-800',
      'code': 'bg-green-100 text-green-800',
      'documentation': 'bg-yellow-100 text-yellow-800',
      'communication': 'bg-pink-100 text-pink-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[type];
  };

  const getTypeIcon = (type: ProjectDocument['type']) => {
    const icons = {
      'contract': '📄',
      'specification': '📋',
      'design': '🎨',
      'code': '💻',
      'documentation': '📚',
      'communication': '💬',
      'other': '📁'
    };
    return icons[type];
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = project.documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Documentos del Proyecto</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ProjectDocument['type'] | 'all')}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg"
            >
              <option value="all">Todos los tipos</option>
              <option value="contract">Contratos</option>
              <option value="specification">Especificaciones</option>
              <option value="design">Diseños</option>
              <option value="code">Código</option>
              <option value="documentation">Documentación</option>
              <option value="communication">Comunicación</option>
              <option value="other">Otros</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar Documento
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {editingDocument ? 'Editar Documento' : 'Nuevo Documento'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Documento *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Especificaciones Técnicas v2.0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ProjectDocument['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="contract">Contrato</option>
                  <option value="specification">Especificación</option>
                  <option value="design">Diseño</option>
                  <option value="code">Código</option>
                  <option value="documentation">Documentación</option>
                  <option value="communication">Comunicación</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del Documento *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://drive.google.com/..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Versión
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1.0"
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
                placeholder="Descripción del documento"
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
                {editingDocument ? 'Actualizar' : 'Agregar'} Documento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => (
          <div key={document.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getTypeIcon(document.type)}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{document.name}</h4>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(document.type)}`}>
                    {document.type}
                  </span>
                </div>
              </div>
            </div>

            {document.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{document.description}</p>
            )}

            <div className="space-y-2 text-sm text-gray-500 mb-4">
              <div className="flex justify-between">
                <span>Versión:</span>
                <span className="font-medium">{document.version}</span>
              </div>
              <div className="flex justify-between">
                <span>Subido por:</span>
                <span className="font-medium">{document.uploadedBy}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span className="font-medium">{format(document.uploadedAt, 'dd/MM/yyyy')}</span>
              </div>
              {document.size > 0 && (
                <div className="flex justify-between">
                  <span>Tamaño:</span>
                  <span className="font-medium">{formatFileSize(document.size)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="flex gap-2">
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Ver documento"
                >
                  <Eye className="h-4 w-4" />
                </a>
                <a
                  href={document.url}
                  download
                  className="text-green-600 hover:text-green-800 transition-colors"
                  title="Descargar documento"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(document)}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                  title="Editar documento"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(document.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Eliminar documento"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No hay documentos {searchTerm || filterType !== 'all' ? 'que coincidan con los filtros' : 'para este proyecto'}</p>
          <p className="text-sm">Agrega documentos para mantener un repositorio organizado</p>
        </div>
      )}
    </div>
  );
};

export default ProjectDocuments;