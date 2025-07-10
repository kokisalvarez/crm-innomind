import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Upload,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Clock,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUsers } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole, UserStatus } from '../../types/user';
import { format } from 'date-fns';

interface UserListProps {
  onUserSelect: (userId: string) => void;
  onUserEdit: (userId: string) => void;
  onUserCreate: () => void;
  onImportExport: () => void;
}

const UserList: React.FC<UserListProps> = ({
  onUserSelect,
  onUserEdit,
  onUserCreate,
  onImportExport
}) => {
  const { user: currentUser } = useAuth();
  const { 
    users, 
    loading, 
    error, 
    filters, 
    pagination,
    setFilters, 
    setPagination,
    deleteUser, 
    changeUserStatus,
    clearError 
  } = useUsers();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const isAdmin = currentUser?.role === 'admin';

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.apellido.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        (user.departamento && user.departamento.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesRole = filters.role === 'all' || user.rol === filters.role;
      const matchesStatus = filters.status === 'all' || user.estado === filters.status;
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'nombre':
          aValue = `${a.nombre} ${a.apellido}`;
          bValue = `${b.nombre} ${b.apellido}`;
          break;
        case 'fechaRegistro':
          aValue = a.fechaRegistro;
          bValue = b.fechaRegistro;
          break;
        case 'ultimoAcceso':
          aValue = a.ultimoAcceso || new Date(0);
          bValue = b.ultimoAcceso || new Date(0);
          break;
        default:
          return 0;
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, filters]);

  // Paginate users
  const paginatedUsers = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, pagination]);

  const totalPages = Math.ceil(filteredUsers.length / pagination.limit);

  const getRoleColor = (role: UserRole) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-purple-100 text-purple-800',
      agent: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return colors[role];
  };

  const getStatusColor = (status: UserStatus) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      admin: Shield,
      manager: Users,
      agent: UserCheck,
      viewer: Eye
    };
    const Icon = icons[role];
    return <Icon className="h-4 w-4" />;
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };

  const handleBulkStatusChange = async (status: UserStatus) => {
    try {
      await Promise.all(
        selectedUsers.map(userId => changeUserStatus(userId, status))
      );
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error changing user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleStatusChange = async (userId: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await changeUserStatus(userId, newStatus);
    } catch (error) {
      console.error('Error changing user status:', error);
    }
  };

  const userStats = {
    total: users.length,
    active: users.filter(u => u.estado === 'active').length,
    pending: users.filter(u => u.estado === 'pending').length,
    admins: users.filter(u => u.rol === 'admin').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-gray-600">Administra usuarios, roles y permisos del sistema</p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={onImportExport}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Importar/Exportar
            </button>
            <button
              onClick={onUserCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Usuario
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.active}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.admins}</p>
            </div>
            <Shield className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o departamento..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filters.role}
              onChange={(e) => setFilters({ role: e.target.value as UserRole | 'all' })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="manager">Manager</option>
              <option value="agent">Agente</option>
              <option value="viewer">Visualizador</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value as UserStatus | 'all' })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="pending">Pendiente</option>
              <option value="suspended">Suspendido</option>
            </select>

            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setFilters({ 
                  sortBy: field as any, 
                  sortOrder: order as any 
                });
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="fechaRegistro-desc">Más recientes</option>
              <option value="fechaRegistro-asc">Más antiguos</option>
              <option value="nombre-asc">Nombre A-Z</option>
              <option value="nombre-desc">Nombre Z-A</option>
              <option value="ultimoAcceso-desc">Último acceso</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && isAdmin && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                {selectedUsers.length} usuario(s) seleccionado(s)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkStatusChange('active')}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                >
                  Activar
                </button>
                <button
                  onClick={() => handleBulkStatusChange('inactive')}
                  className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                >
                  Desactivar
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Mostrando {paginatedUsers.length} de {filteredUsers.length} usuarios
        </span>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination({ page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <span className="px-3 py-1">
              Página {pagination.page} de {totalPages}
            </span>
            
            <button
              onClick={() => setPagination({ page: pagination.page + 1 })}
              disabled={pagination.page === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isAdmin && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estadísticas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {user.avatar ? (
                          <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.nombre} {user.apellido}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.departamento && (
                          <div className="text-xs text-gray-400">{user.departamento}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full gap-1 ${getRoleColor(user.rol)}`}>
                      {getRoleIcon(user.rol)}
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.estado)}`}>
                      {user.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.ultimoAcceso ? (
                      <div>
                        <div>{format(user.ultimoAcceso, 'dd/MM/yyyy')}</div>
                        <div className="text-xs">{format(user.ultimoAcceso, 'HH:mm')}</div>
                      </div>
                    ) : (
                      'Nunca'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Activity className="h-3 w-3" />
                        <span>{user.estadisticas.prospectosManagedos} prospectos</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.estadisticas.cotizacionesCreadas} cotizaciones
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onUserSelect(user.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Ver perfil"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {(isAdmin || currentUser?.id === user.id) && (
                        <button
                          onClick={() => onUserEdit(user.id)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Editar usuario"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      
                      {isAdmin && currentUser?.id !== user.id && (
                        <>
                          <button
                            onClick={() => handleStatusChange(user.id, user.estado)}
                            className={`transition-colors ${
                              user.estado === 'active' 
                                ? 'text-orange-600 hover:text-orange-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={user.estado === 'active' ? 'Desactivar' : 'Activar'}
                          >
                            {user.estado === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
          <p className="text-gray-500 mb-4">Intenta ajustar los filtros o crear nuevos usuarios.</p>
          {isAdmin && (
            <button
              onClick={onUserCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Primer Usuario
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserList;