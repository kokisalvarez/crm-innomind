import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, Phone, Mail, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { Prospect, ProspectStatus, Platform } from '../../types';
import { useCRM } from '../../context/CRMContext';
import { useUsers } from '../../context/UserContext';
import { format } from 'date-fns';
import ProspectForm from './ProspectForm';

interface ProspectTableProps {
  navigationParams?: {
    prospectId?: string;
    showDetail?: boolean;
    highlightFollowup?: boolean;
  };
}

const ProspectTable: React.FC<ProspectTableProps> = ({ navigationParams }) => {
  const { prospects, selectProspect, deleteProspect } = useCRM();
  const { users } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [userFilter, setUserFilter] = useState<string | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [highlightedProspectId, setHighlightedProspectId] = useState<string | null>(null);

  // Handle navigation parameters
  useEffect(() => {
    if (navigationParams?.prospectId && navigationParams?.showDetail) {
      const prospect = prospects.find(p => p.id === navigationParams.prospectId);
      if (prospect) {
        selectProspect(prospect);
        
        // Highlight prospect if coming from follow-up notification
        if (navigationParams.highlightFollowup) {
          setHighlightedProspectId(prospect.id);
          // Remove highlight after 3 seconds
          setTimeout(() => setHighlightedProspectId(null), 3000);
        }
      }
    }
  }, [navigationParams, prospects, selectProspect]);

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = prospect.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.telefono.includes(searchTerm) ||
                         prospect.correo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prospect.estado === statusFilter;
    const matchesPlatform = platformFilter === 'all' || prospect.plataforma === platformFilter;
    const matchesUser = userFilter === 'all' || prospect.responsable === userFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform && matchesUser;
  });

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.nombre} ${user.apellido}` : userId;
  };

  const getStatusColor = (status: ProspectStatus) => {
    const colors = {
      'Nuevo': 'bg-blue-100 text-blue-800',
      'Contactado': 'bg-yellow-100 text-yellow-800',
      'En seguimiento': 'bg-orange-100 text-orange-800',
      'Cotizado': 'bg-purple-100 text-purple-800',
      'Venta cerrada': 'bg-green-100 text-green-800',
      'Perdido': 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getPlatformIcon = (platform: Platform) => {
    const icons = {
      'WhatsApp': '💬',
      'Instagram': '📷',
      'Facebook': '📘'
    };
    return icons[platform];
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleProspectCreated = () => {
    // Refresh the prospects list or show success message
    console.log('Prospecto creado exitosamente');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProspectStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="Nuevo">Nuevo</option>
            <option value="Contactado">Contactado</option>
            <option value="En seguimiento">En seguimiento</option>
            <option value="Cotizado">Cotizado</option>
            <option value="Venta cerrada">Venta cerrada</option>
            <option value="Perdido">Perdido</option>
          </select>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as Platform | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las plataformas</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
          </select>

          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los usuarios</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.nombre} {user.apellido}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Prospecto
          </button>
        </div>
      </div>

      {/* Navigation notification */}
      {navigationParams?.highlightFollowup && highlightedProspectId && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-orange-500 text-lg">⏰</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-800">
                Seguimiento pendiente
              </p>
              <p className="text-sm text-orange-700">
                Este prospecto necesita seguimiento. Haz clic en "Ver detalles" para gestionar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Mostrando {filteredProspects.length} de {prospects.length} prospectos
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prospecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plataforma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Seguimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProspects.map((prospect) => (
                <tr 
                  key={prospect.id} 
                  className={`hover:bg-gray-50 transition-colors ${
                    highlightedProspectId === prospect.id 
                      ? 'bg-orange-50 border-l-4 border-orange-400' 
                      : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{prospect.nombre}</div>
                      <div className="text-sm text-gray-500">{prospect.servicioInteres}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{prospect.telefono}</div>
                      <div className="text-sm text-gray-500">{prospect.correo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{getPlatformIcon(prospect.plataforma)}</span>
                      <span className="text-sm text-gray-900">{prospect.plataforma}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(prospect.estado)}`}>
                      {prospect.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prospect.ultimoSeguimiento 
                      ? format(prospect.ultimoSeguimiento, 'dd/MM/yyyy')
                      : 'Sin seguimiento'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => selectProspect(prospect)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openWhatsApp(prospect.telefono)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Abrir WhatsApp"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open(`tel:${prospect.telefono}`)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Llamar"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open(`mailto:${prospect.correo}`)}
                        className="text-purple-600 hover:text-purple-900 transition-colors"
                        title="Enviar email"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteProspect(prospect.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProspects.length === 0 && (
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron prospectos</h3>
          <p className="text-gray-500 mb-4">Intenta ajustar los filtros o agregar un nuevo prospecto.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar Primer Prospecto
          </button>
        </div>
      )}

      {/* Add Prospect Modal */}
      {showAddModal && (
        <ProspectForm
          onClose={() => setShowAddModal(false)}
          onSuccess={handleProspectCreated}
        />
      )}
    </div>
  );
};

export default ProspectTable;