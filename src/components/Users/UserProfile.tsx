import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield, 
  Activity, 
  Clock,
  TrendingUp,
  Users,
  FileText,
  Eye,
  EyeOff,
  Key,
  Camera
} from 'lucide-react';
import { User, PasswordChangeRequest, ActivityLog } from '../../types';
import { format } from 'date-fns';

interface UserProfileProps {
  user: User;
  onClose: () => void;
  onUpdate: (userId: string, updates: Partial<User>) => void;
  onPasswordChange: (userId: string, passwordData: PasswordChangeRequest) => void;
  currentUserId?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onClose,
  onUpdate,
  onPasswordChange,
  currentUserId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'security'>('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    telefono: user.telefono || '',
    departamento: user.departamento || '',
    cargo: user.cargo || ''
  });
  const [passwordForm, setPasswordForm] = useState<PasswordChangeRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const isOwnProfile = currentUserId === user.id;

  const handleSaveProfile = () => {
    onUpdate(user.id, editForm);
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    onPasswordChange(user.id, passwordForm);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordForm(false);
  };

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
    if (action.includes('login')) return <Activity className="h-4 w-4 text-green-500" />;
    if (action.includes('create')) return <FileText className="h-4 w-4 text-blue-500" />;
    if (action.includes('update')) return <Edit className="h-4 w-4 text-orange-500" />;
    if (action.includes('delete')) return <X className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
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

        {(isOwnProfile || currentUserId) && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Guardar
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar Perfil
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', label: 'Perfil', icon: Users },
            { id: 'activity', label: 'Actividad', icon: Activity },
            { id: 'security', label: 'Seguridad', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
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

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                {isEditing && (
                  <button className="text-blue-600 hover:text-blue-800 transition-colors">
                    <Camera className="h-5 w-5" />
                  </button>
                )}
              </div>

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
                  {isEditing && (
                    <button className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 transition-colors">
                      <Camera className="h-3 w-3" />
                    </button>
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
                    Nombre
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.nombre}
                      onChange={(e) => setEditForm(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.apellido}
                      onChange={(e) => setEditForm(prev => ({ ...prev, apellido: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user.apellido}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.telefono}
                      onChange={(e) => setEditForm(prev => ({ ...prev, telefono: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{user.telefono || 'No especificado'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.departamento}
                      onChange={(e) => setEditForm(prev => ({ ...prev, departamento: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user.departamento || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.cargo}
                      onChange={(e) => setEditForm(prev => ({ ...prev, cargo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{user.cargo || 'No especificado'}</p>
                  )}
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
                      <p className="font-medium text-gray-900">{permiso.modulo}</p>
                      <p className="text-sm text-gray-600">
                        {permiso.acciones.join(', ')}
                      </p>
                    </div>
                    <Shield className="h-5 w-5 text-gray-400" />
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
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Actividad</h3>
          <div className="space-y-4">
            {user.historialActividad.slice(0, 20).map((activity) => (
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
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Password Change */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cambiar Contraseña</h3>
              {!showPasswordForm && (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  Cambiar Contraseña
                </button>
              )}
            </div>

            {showPasswordForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePasswordChange}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Cambiar Contraseña
                  </button>
                  <button
                    onClick={() => setShowPasswordForm(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                La contraseña fue actualizada por última vez hace 30 días.
              </p>
            )}
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Seguridad</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Autenticación de dos factores</p>
                  <p className="text-sm text-gray-600">Agrega una capa extra de seguridad</p>
                </div>
                <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                  Activar
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Sesiones activas</p>
                  <p className="text-sm text-gray-600">Gestiona tus sesiones en otros dispositivos</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Ver sesiones
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Notificaciones de seguridad</p>
                  <p className="text-sm text-gray-600">Recibe alertas sobre actividad sospechosa</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;