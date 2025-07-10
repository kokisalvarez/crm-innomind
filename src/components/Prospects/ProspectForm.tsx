import React, { useState } from 'react';
import { X, Save, User, Building, Phone, Mail, MapPin, Target, Calendar, Users, AlertCircle } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useUsers } from '../../context/UserContext';
import { Platform, ProspectStatus } from '../../types';

interface ProspectFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  // Información obligatoria
  nombre: string;
  empresa: string;
  cargo: string;
  telefono: string;
  correo: string;
  origen: string;
  
  // Información opcional
  telefonoSecundario: string;
  direccion: string;
  industria: string;
  tamanoEmpresa: string;
  notasAdicionales: string;
  nivelInteres: 'Alto' | 'Medio' | 'Bajo';
  
  // Asignación
  responsable: string;
  estado: ProspectStatus;
  fechaProximoSeguimiento: string;
  plataforma: Platform;
  servicioInteres: string;
}

interface FormErrors {
  [key: string]: string;
}

const ProspectForm: React.FC<ProspectFormProps> = ({ onClose, onSuccess }) => {
  const { addProspect } = useCRM();
  const { users } = useUsers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    // Obligatorios
    nombre: '',
    empresa: '',
    cargo: '',
    telefono: '',
    correo: '',
    origen: '',
    
    // Opcionales
    telefonoSecundario: '',
    direccion: '',
    industria: '',
    tamanoEmpresa: '',
    notasAdicionales: '',
    nivelInteres: 'Medio',
    
    // Asignación
    responsable: 'Usuario Actual',
    estado: 'Nuevo',
    fechaProximoSeguimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 días desde hoy
    plataforma: 'WhatsApp',
    servicioInteres: ''
  });

  const origenOptions = [
    'Referido',
    'Sitio web',
    'Redes sociales',
    'WhatsApp',
    'Instagram',
    'Facebook',
    'LinkedIn',
    'Google Ads',
    'Email marketing',
    'Evento/Feria',
    'Llamada en frío',
    'Otro'
  ];

  const industriaOptions = [
    'Tecnología',
    'Retail/Comercio',
    'Servicios financieros',
    'Salud',
    'Educación',
    'Manufactura',
    'Construcción',
    'Turismo/Hospitalidad',
    'Alimentaria',
    'Automotriz',
    'Inmobiliaria',
    'Consultoría',
    'Marketing/Publicidad',
    'Logística/Transporte',
    'Otro'
  ];

  const tamanoEmpresaOptions = [
    'Startup (1-10 empleados)',
    'Pequeña (11-50 empleados)',
    'Mediana (51-200 empleados)',
    'Grande (201-1000 empleados)',
    'Corporativo (1000+ empleados)'
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validaciones obligatorias
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre completo es requerido';
    }

    if (!formData.empresa.trim()) {
      newErrors.empresa = 'La empresa/organización es requerida';
    }

    if (!formData.cargo.trim()) {
      newErrors.cargo = 'El cargo/puesto es requerido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono principal es requerido';
    } else if (!/^[\+]?[0-9\s\-\(\)]+$/.test(formData.telefono)) {
      newErrors.telefono = 'El formato del teléfono no es válido';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'El formato del correo no es válido';
    }

    if (!formData.origen) {
      newErrors.origen = 'El origen del prospecto es requerido';
    }

    if (!formData.servicioInteres.trim()) {
      newErrors.servicioInteres = 'El servicio de interés es requerido';
    }

    // Validaciones opcionales
    if (formData.telefonoSecundario && !/^[\+]?[0-9\s\-\(\)]+$/.test(formData.telefonoSecundario)) {
      newErrors.telefonoSecundario = 'El formato del teléfono secundario no es válido';
    }

    if (formData.fechaProximoSeguimiento) {
      const fechaSeguimiento = new Date(formData.fechaProximoSeguimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaSeguimiento < hoy) {
        newErrors.fechaProximoSeguimiento = 'La fecha de seguimiento no puede ser anterior a hoy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Crear el prospecto
      const prospectData = {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        correo: formData.correo.trim(),
        plataforma: formData.plataforma,
        servicioInteres: formData.servicioInteres.trim(),
        fechaContacto: new Date(),
        estado: formData.estado,
        notasInternas: `
Empresa: ${formData.empresa}
Cargo: ${formData.cargo}
Origen: ${formData.origen}
${formData.telefonoSecundario ? `Teléfono secundario: ${formData.telefonoSecundario}` : ''}
${formData.direccion ? `Dirección: ${formData.direccion}` : ''}
${formData.industria ? `Industria: ${formData.industria}` : ''}
${formData.tamanoEmpresa ? `Tamaño empresa: ${formData.tamanoEmpresa}` : ''}
Nivel de interés: ${formData.nivelInteres}
${formData.notasAdicionales ? `Notas adicionales: ${formData.notasAdicionales}` : ''}
        `.trim(),
        responsable: formData.responsable
      };

      addProspect(prospectData);

      // Mostrar mensaje de éxito
      alert('✅ Prospecto creado exitosamente');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error al crear prospecto:', error);
      alert('❌ Error al crear el prospecto. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string) => {
    return errors[field] ? (
      <div className="flex items-center mt-1 text-red-600 text-sm">
        <AlertCircle className="h-4 w-4 mr-1" />
        {errors[field]}
      </div>
    ) : null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto m-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-xl font-semibold text-gray-900">Crear Nuevo Prospecto</h4>
            <p className="text-gray-600 mt-1">Registra un nuevo prospecto en el sistema CRM</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Obligatoria */}
          <div>
            <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Información Obligatoria
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Juan Carlos Pérez"
                />
                {getFieldError('nombre')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa/Organización *
                </label>
                <div className="relative">
                  <Building className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.empresa}
                    onChange={(e) => handleInputChange('empresa', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.empresa ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Ej: TechCorp S.A."
                  />
                </div>
                {getFieldError('empresa')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo/Puesto *
                </label>
                <input
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => handleInputChange('cargo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.cargo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Gerente de Marketing"
                />
                {getFieldError('cargo')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono principal *
                </label>
                <div className="relative">
                  <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.telefono ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="+52 55 1234 5678"
                  />
                </div>
                {getFieldError('telefono')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico *
                </label>
                <div className="relative">
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => handleInputChange('correo', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.correo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="juan@empresa.com"
                  />
                </div>
                {getFieldError('correo')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origen del prospecto *
                </label>
                <select
                  value={formData.origen}
                  onChange={(e) => handleInputChange('origen', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.origen ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar origen</option>
                  {origenOptions.map(origen => (
                    <option key={origen} value={origen}>{origen}</option>
                  ))}
                </select>
                {getFieldError('origen')}
              </div>
            </div>
          </div>

          {/* Información Opcional */}
          <div>
            <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-600" />
              Información Opcional
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono secundario
                </label>
                <div className="relative">
                  <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.telefonoSecundario}
                    onChange={(e) => handleInputChange('telefonoSecundario', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.telefonoSecundario ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="+52 55 8765 4321"
                  />
                </div>
                {getFieldError('telefonoSecundario')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industria/Sector
                </label>
                <select
                  value={formData.industria}
                  onChange={(e) => handleInputChange('industria', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar industria</option>
                  {industriaOptions.map(industria => (
                    <option key={industria} value={industria}>{industria}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamaño de empresa
                </label>
                <select
                  value={formData.tamanoEmpresa}
                  onChange={(e) => handleInputChange('tamanoEmpresa', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar tamaño</option>
                  {tamanoEmpresaOptions.map(tamano => (
                    <option key={tamano} value={tamano}>{tamano}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel de interés
                </label>
                <select
                  value={formData.nivelInteres}
                  onChange={(e) => handleInputChange('nivelInteres', e.target.value as 'Alto' | 'Medio' | 'Bajo')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Alto">🔥 Alto</option>
                  <option value="Medio">⚡ Medio</option>
                  <option value="Bajo">❄️ Bajo</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                  <textarea
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Dirección completa de la empresa"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  value={formData.notasAdicionales}
                  onChange={(e) => handleInputChange('notasAdicionales', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Información adicional relevante sobre el prospecto..."
                />
              </div>
            </div>
          </div>

          {/* Asignación y Configuración */}
          <div>
            <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Asignación y Configuración
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendedor/Ejecutivo responsable
                </label>
                <select
                  value={formData.responsable}
                  onChange={(e) => handleInputChange('responsable', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar responsable</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.nombre} {user.apellido} - {user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etapa del pipeline
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value as ProspectStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Nuevo">🆕 Nuevo</option>
                  <option value="Contactado">📞 Contactado</option>
                  <option value="En seguimiento">🔄 En seguimiento</option>
                  <option value="Cotizado">📋 Cotizado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plataforma de contacto
                </label>
                <select
                  value={formData.plataforma}
                  onChange={(e) => handleInputChange('plataforma', e.target.value as Platform)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="WhatsApp">💬 WhatsApp</option>
                  <option value="Instagram">📷 Instagram</option>
                  <option value="Facebook">📘 Facebook</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de próximo seguimiento
                </label>
                <div className="relative">
                  <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="date"
                    value={formData.fechaProximoSeguimiento}
                    onChange={(e) => handleInputChange('fechaProximoSeguimiento', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.fechaProximoSeguimiento ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {getFieldError('fechaProximoSeguimiento')}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio de interés *
                </label>
                <input
                  type="text"
                  value={formData.servicioInteres}
                  onChange={(e) => handleInputChange('servicioInteres', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.servicioInteres ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Chatbot WhatsApp, CRM personalizado, Marketing digital..."
                />
                {getFieldError('servicioInteres')}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Crear Prospecto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProspectForm;