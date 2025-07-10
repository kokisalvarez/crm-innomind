import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Save, 
  Upload, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Building, 
  MapPin, 
  Calendar, 
  Eye, 
  EyeOff, 
  Camera,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { User as UserType, UserRole, UserStatus, UserPermission } from '../../types/user';

interface UserFormProps {
  user?: UserType | null;
  onClose: () => void;
  onSave: (userData: Partial<UserType>, password?: string) => Promise<void>;
  isInvitation?: boolean;
}

interface FormData {
  // Basic Info
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  empleadoId: string;
  
  // Authentication
  password: string;
  confirmPassword: string;
  
  // Role & Status
  rol: UserRole;
  estado: UserStatus;
  
  // Organization
  departamento: string;
  cargo: string;
  
  // Address
  direccion: {
    calle: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
    pais: string;
  };
  
  // Dates
  fechaExpiracion?: Date;
  
  // Profile
  avatar?: string;
  
  // Custom Fields
  camposPersonalizados: { [key: string]: string };
  
  // Permissions
  permisos: UserPermission[];
}

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  options?: string[];
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSave, isInvitation = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'role' | 'address' | 'custom'>('basic');
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: '1', label: 'Número de Empleado', type: 'text', required: false },
    { id: '2', label: 'Fecha de Contratación', type: 'date', required: false },
    { id: '3', label: 'Supervisor', type: 'text', required: false }
  ]);

  const [formData, setFormData] = useState<FormData>({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    empleadoId: '',
    password: '',
    confirmPassword: '',
    rol: user?.rol || 'agent',
    estado: user?.estado || 'active',
    departamento: user?.departamento || '',
    cargo: user?.cargo || '',
    direccion: {
      calle: '',
      ciudad: '',
      estado: '',
      codigoPostal: '',
      pais: 'México'
    },
    fechaExpiracion: undefined,
    avatar: user?.avatar,
    camposPersonalizados: {},
    permisos: user?.permisos || []
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono || '',
        rol: user.rol,
        estado: user.estado,
        departamento: user.departamento || '',
        cargo: user.cargo || '',
        avatar: user.avatar,
        permisos: user.permisos
      }));
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Basic validation
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    // Password validation (only for new users or when changing password)
    if (!user || formData.password) {
      if (!formData.password) newErrors.password = 'La contraseña es requerida';
      else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    // Phone validation
    if (formData.telefono && !/^\+?[\d\s\-\(\)]+$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }

    // Custom fields validation
    customFields.forEach(field => {
      if (field.required && !formData.camposPersonalizados[field.id]) {
        newErrors[`custom_${field.id}`] = `${field.label} es requerido`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    setLoading(true);
    try {
      const userData: Partial<UserType> = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim() || undefined,
        rol: formData.rol,
        estado: formData.estado,
        departamento: formData.departamento.trim() || undefined,
        cargo: formData.cargo.trim() || undefined,
        avatar: formData.avatar,
        permisos: getDefaultPermissions(formData.rol)
      };

      console.log('Calling onSave with userData:', userData);

      // Pass password separately for new users
      const password = (!user && formData.password) ? formData.password : undefined;
      
      await onSave(userData, password);
      
      console.log('User saved successfully');
      // Don't close here - let the parent component handle it
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Error al guardar el usuario' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, avatar: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addCustomField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      label: 'Nuevo Campo',
      type: 'text',
      required: false
    };
    setCustomFields(prev => [...prev, newField]);
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields(prev => prev.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(field => field.id !== id));
    setFormData(prev => {
      const newCustomFields = { ...prev.camposPersonalizados };
      delete newCustomFields[id];
      return { ...prev, camposPersonalizados: newCustomFields };
    });
  };

  const getDefaultPermissions = (role: UserRole): UserPermission[] => {
    const permissions = {
      admin: [
        { modulo: 'prospects', acciones: ['view', 'create', 'edit', 'delete'] },
        { modulo: 'quotes', acciones: ['view', 'create', 'edit', 'delete', 'approve'] },
        { modulo: 'products', acciones: ['view', 'create', 'edit', 'delete'] },
        { modulo: 'users', acciones: ['view', 'create', 'edit', 'delete', 'invite'] },
        { modulo: 'reports', acciones: ['view', 'export'] },
        { modulo: 'settings', acciones: ['view', 'edit'] }
      ],
      manager: [
        { modulo: 'prospects', acciones: ['view', 'create', 'edit', 'delete'] },
        { modulo: 'quotes', acciones: ['view', 'create', 'edit', 'approve'] },
        { modulo: 'products', acciones: ['view', 'create', 'edit'] },
        { modulo: 'users', acciones: ['view', 'invite'] },
        { modulo: 'reports', acciones: ['view', 'export'] }
      ],
      agent: [
        { modulo: 'prospects', acciones: ['view', 'create', 'edit'] },
        { modulo: 'quotes', acciones: ['view', 'create', 'edit'] },
        { modulo: 'products', acciones: ['view'] },
        { modulo: 'reports', acciones: ['view'] }
      ],
      viewer: [
        { modulo: 'prospects', acciones: ['view'] },
        { modulo: 'quotes', acciones: ['view'] },
        { modulo: 'products', acciones: ['view'] },
        { modulo: 'reports', acciones: ['view'] }
      ]
    };
    return permissions[role] || permissions.viewer;
  };

  const handleRoleChange = (newRole: UserRole) => {
    setFormData(prev => ({
      ...prev,
      rol: newRole,
      permisos: getDefaultPermissions(newRole)
    }));
  };

  const tabs = [
    { id: 'basic', label: 'Información Básica', icon: User },
    { id: 'role', label: 'Rol y Permisos', icon: Shield },
    { id: 'address', label: 'Dirección', icon: MapPin },
    { id: 'custom', label: 'Campos Personalizados', icon: Plus }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {user ? 'Editar Usuario' : isInvitation ? 'Invitar Usuario' : 'Nuevo Usuario'}
              </h2>
              <p className="text-blue-100 text-sm">
                {user ? 'Actualiza la información del usuario' : 'Completa los datos del nuevo usuario'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            {/* General Error */}
            {errors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                {/* Profile Image */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Profile"
                        className="h-20 w-20 rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center border-4 border-gray-200">
                        <User className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Foto de Perfil</h3>
                    <p className="text-sm text-gray-500">
                      Sube una imagen para el perfil del usuario. Formatos: JPG, PNG (máx. 5MB)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.nombre ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ingresa el nombre"
                    />
                    {errors.nombre && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.nombre}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.apellido ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ingresa el apellido"
                    />
                    {errors.apellido && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.apellido}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico *
                    </label>
                    <div className="relative">
                      <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="usuario@empresa.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <div className="relative">
                      <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.telefono ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+52 55 1234 5678"
                      />
                    </div>
                    {errors.telefono && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.telefono}
                      </p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento
                    </label>
                    <div className="relative">
                      <Building className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <select
                        value={formData.departamento}
                        onChange={(e) => setFormData(prev => ({ ...prev, departamento: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Seleccionar departamento</option>
                        <option value="Ventas">Ventas</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Soporte">Soporte</option>
                        <option value="Administración">Administración</option>
                        <option value="Desarrollo">Desarrollo</option>
                        <option value="Recursos Humanos">Recursos Humanos</option>
                      </select>
                    </div>
                  </div>

                  {/* Job Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cargo
                    </label>
                    <input
                      type="text"
                      value={formData.cargo}
                      onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ejecutivo de Ventas"
                    />
                  </div>
                </div>

                {/* Password Section - Only for new users */}
                {!user && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Credenciales de Acceso</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contraseña *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                              errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Mínimo 6 caracteres"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.password}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmar Contraseña *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Repite la contraseña"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Role & Permissions Tab */}
            {activeTab === 'role' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol del Usuario *
                    </label>
                    <select
                      value={formData.rol}
                      onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="viewer">Visualizador</option>
                      <option value="agent">Agente</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      El rol determina los permisos base del usuario
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado de la Cuenta
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as UserStatus }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="pending">Pendiente</option>
                      <option value="suspended">Suspendido</option>
                    </select>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Permisos del Sistema</h3>
                  <div className="space-y-4">
                    {getDefaultPermissions(formData.rol).map((permiso, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 capitalize">{permiso.modulo}</h4>
                          <Shield className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {permiso.acciones.map((accion, actionIndex) => (
                            <span
                              key={actionIndex}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {accion}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Información de Dirección</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Street Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={formData.direccion.calle}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        direccion: { ...prev.direccion, calle: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Calle, número, colonia"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        value={formData.direccion.ciudad}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          direccion: { ...prev.direccion, ciudad: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Ciudad"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado/Provincia
                      </label>
                      <input
                        type="text"
                        value={formData.direccion.estado}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          direccion: { ...prev.direccion, estado: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Estado o Provincia"
                      />
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        value={formData.direccion.codigoPostal}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          direccion: { ...prev.direccion, codigoPostal: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="12345"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        País
                      </label>
                      <select
                        value={formData.direccion.pais}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          direccion: { ...prev.direccion, pais: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="México">México</option>
                        <option value="Estados Unidos">Estados Unidos</option>
                        <option value="Canadá">Canadá</option>
                        <option value="España">España</option>
                        <option value="Argentina">Argentina</option>
                        <option value="Colombia">Colombia</option>
                        <option value="Chile">Chile</option>
                        <option value="Perú">Perú</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Fields Tab */}
            {activeTab === 'custom' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Campos Personalizados</h3>
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Campo
                  </button>
                </div>

                <div className="space-y-4">
                  {customFields.map((field) => (
                    <div key={field.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4 flex-1">
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                            className="px-3 py-1 border border-gray-300 rounded text-sm font-medium"
                            placeholder="Nombre del campo"
                          />
                          <select
                            value={field.type}
                            onChange={(e) => updateCustomField(field.id, { type: e.target.value as any })}
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="text">Texto</option>
                            <option value="number">Número</option>
                            <option value="date">Fecha</option>
                            <option value="select">Selección</option>
                          </select>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateCustomField(field.id, { required: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Requerido
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCustomField(field.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Field Value Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            value={formData.camposPersonalizados[field.id] || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              camposPersonalizados: {
                                ...prev.camposPersonalizados,
                                [field.id]: e.target.value
                              }
                            }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                              errors[`custom_${field.id}`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Seleccionar opción</option>
                            {field.options?.map((option, index) => (
                              <option key={index} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={formData.camposPersonalizados[field.id] || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              camposPersonalizados: {
                                ...prev.camposPersonalizados,
                                [field.id]: e.target.value
                              }
                            }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                              errors[`custom_${field.id}`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder={`Ingresa ${field.label.toLowerCase()}`}
                          />
                        )}
                        {errors[`custom_${field.id}`] && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors[`custom_${field.id}`]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {customFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay campos personalizados configurados</p>
                    <p className="text-sm">Haz clic en "Agregar Campo" para crear uno</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="text-sm text-gray-500">
              * Campos requeridos
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? 'Guardando...' : (user ? 'Actualizar' : 'Crear Usuario')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;