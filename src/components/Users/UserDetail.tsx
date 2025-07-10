import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Shield, 
  Activity, 
  Clock,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  MapPin
} from 'lucide-react';
import { useUsers } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { useCRM } from '../../context/CRMContext';
import { User } from '../../types/user';
import { format } from 'date-fns';

interface UserDetailProps {
  userId: string;
  onClose: () => void;
  onEdit: () => void;
}

const UserDetail: React.FC<UserDetailProps> = ({ userId, onClose, onEdit }) => {
  const { user: currentUser } = useAuth();
  const { users } = useUsers();
  const { getProspectsByUser } = useCRM();
  const [user, setUser] = useState<User | null>(null);
  const [userProspects, setUserProspects] = useState<any[]>([]);

  useEffect(() => {
    const foundUser = users.find(u => u.id === userId);
    setUser(foundUser || null);

    // Get prospects assigned to this user
    const assignedProspects = foundUser ? getProspectsByUser(foundUser.id) : [];
    setUserProspects(assignedProspects);
  }, [userId, users, getProspectsByUser]);

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Usuario no encontrado</h3>
          <button
            onClick={onClose}
            className="text-blue-600 hover:text-blue-800"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;
  const canEdit = currentUser?.role === 'admin' || isOwnProfile;

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-purple-100 text-purple-800',
      agent: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('login') || action.includes('sesión')) return <Activity className="h-4 w-4 text-green-500" />;
    if (action.includes('create') || action.includes('creó')) return <FileText className="h-4 w-4 text-blue-500" />;
    if (action.includes('update') || action.includes('actualizó')) return <Edit className="h-4 w-4 text-orange-500" />;
    if (action.includes('delete') || action.includes('eliminó')) return <Users className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
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
            <h2 className="text-2xl font-bold text-gray-900">Perfil de Usuario</h2>
            <p className="text-gray-600">
              {isOwnProfile ? 'Tu perfil personal' : `Perfil de ${user.nombre} ${user.apellido}`}
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={onEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar Perfil
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Información Personal</h3>

            <div className="flex items-start space-x-6 mb-6">
              <div className="relative">
                {user.avatar ? (
                  <img className="h-20 w-20 rounded-full" src={user.avatar} alt="" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xl font-medium text-gray-700">
                      {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.rol)}`}>
                    {user.rol}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.estado)}`}>
                    {user.estado}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Miembro desde {format(user.fechaRegistro, 'dd/MM/yyyy')}
                </p>
                {user.ultimoAcceso && (
                  <p className="text-sm text-gray-500">
                    Último acceso: {format(user.ultimoAcceso, 'dd/MM/yyyy HH:mm')}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <p className="text-gray-900">{user.nombre} {user.apellido}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{user.telefono || 'No especificado'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento
                </label>
                <p className="text-gray-900">{user.departamento || 'No especificado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo
                </label>
                <p className="text-gray-900">{user.cargo || 'No especificado'}</p>
              </div>
            </div>
          </div>

          {/* Assigned Prospects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Prospectos Asignados ({userProspects.length})
            </h3>
            
            {userProspects.length > 0 ? (
              <div className="space-y-3">
                {userProspects.slice(0, 5).map((prospect) => (
                  <div key={prospect.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{prospect.nombre}</p>
                      <p className="text-sm text-gray-600">{prospect.correo}</p>
                      <p className="text-xs text-gray-500">{prospect.servicioInteres}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        prospect.estado === 'Nuevo' ? 'bg-blue-100 text-blue-800' :
                        prospect.estado === 'Contactado' ? 'bg-yellow-100 text-yellow-800' :
                        prospect.estado === 'En seguimiento' ? 'bg-orange-100 text-orange-800' :
                        prospect.estado === 'Cotizado' ? 'bg-purple-100 text-purple-800' :
                        prospect.estado === 'Venta cerrada' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {prospect.estado}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(prospect.fechaContacto, 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
                
                {userProspects.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    ... y {userProspects.length - 5} prospectos más
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No hay prospectos asignados a este usuario
              </p>
            )}
          </div>

          {/* Activity History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Actividad</h3>
            <div className="space-y-4">
              {user.historialActividad.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.accion)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.accion}</p>
                    <p className="text-sm text-gray-600">{activity.detalles}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span>{format(activity.fecha, 'dd/MM/yyyy HH:mm')}</span>
                      <span className="mx-2">•</span>
                      <span>{activity.modulo}</span>
                      {activity.ip && (
                        <>
                          <span className="mx-2">•</span>
                          <span>IP: {activity.ip}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-700">Prospectos</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {user.estadisticas.prospectosManagedos}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-700">Cotizaciones</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {user.estadisticas.cotizacionesCreadas}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-gray-700">Ventas</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {user.estadisticas.ventasCerradas}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-gray-700">Conversión</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {user.estadisticas.tasaConversion.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Permisos y Accesos</h3>
            <div className="space-y-3">
              {user.permisos.map((permiso, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{permiso.modulo}</p>
                    <p className="text-sm text-gray-600">
                      {permiso.acciones.join(', ')}
                    </p>
                  </div>
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Idioma</span>
                <span className="text-gray-900">{user.configuracion.idioma}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Zona horaria</span>
                <span className="text-gray-900">{user.configuracion.timezone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Tema</span>
                <span className="text-gray-900">{user.configuracion.tema}</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">Notificaciones</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className={user.configuracion.notificaciones.email ? 'text-green-600' : 'text-red-600'}>
                      {user.configuracion.notificaciones.email ? 'Activado' : 'Desactivado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Push</span>
                    <span className={user.configuracion.notificaciones.push ? 'text-green-600' : 'text-red-600'}>
                      {user.configuracion.notificaciones.push ? 'Activado' : 'Desactivado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;