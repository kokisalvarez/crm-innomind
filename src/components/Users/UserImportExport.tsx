import React, { useState, useRef, useCallback } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  FileSpreadsheet,
  Users,
  Filter,
  Calendar,
  Eye,
  Trash2,
  RefreshCw,
  MapPin,
  Settings
} from 'lucide-react';
import { UserImportData, User, UserRole, UserStatus } from '../../types/user';

interface UserImportExportProps {
  onImport: (usersData: UserImportData[]) => Promise<User[]>;
  onExport: () => Promise<string>;
  onClose: () => void;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
  value: string;
}

interface ExportFilters {
  roles: UserRole[];
  statuses: UserStatus[];
  dateRange: {
    start: string;
    end: string;
  };
  includeFields: {
    basic: boolean;
    contact: boolean;
    role: boolean;
    address: boolean;
    activity: boolean;
    statistics: boolean;
  };
}

interface FieldMapping {
  csvColumn: string;
  userField: string;
  required: boolean;
  transform?: (value: string) => any;
}

const UserImportExport: React.FC<UserImportExportProps> = ({ onImport, onExport, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [loading, setLoading] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [importSuccess, setImportSuccess] = useState<User[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [exportFilters, setExportFilters] = useState<ExportFilters>({
    roles: [],
    statuses: [],
    dateRange: { start: '', end: '' },
    includeFields: {
      basic: true,
      contact: true,
      role: true,
      address: false,
      activity: false,
      statistics: true
    }
  });

  const requiredFields = [
    { key: 'nombre', label: 'Nombre', required: true },
    { key: 'apellido', label: 'Apellido', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'rol', label: 'Rol', required: true }
  ];

  const optionalFields = [
    { key: 'telefono', label: 'Teléfono', required: false },
    { key: 'departamento', label: 'Departamento', required: false },
    { key: 'cargo', label: 'Cargo', required: false }
  ];

  const allFields = [...requiredFields, ...optionalFields];

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          alert('El archivo está vacío');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = { _rowNumber: index + 2 };
          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });
          return row;
        });

        setCsvHeaders(headers);
        setImportData(data);
        setFieldMappings(headers.map(header => ({
          csvColumn: header,
          userField: '',
          required: false
        })));
        setShowPreview(true);
        setImportErrors([]);
        setImportSuccess([]);
      } catch (error) {
        alert('Error al leer el archivo. Asegúrate de que sea un CSV válido.');
      }
    };
    reader.readAsText(file);
  }, []);

  const updateFieldMapping = (csvColumn: string, userField: string) => {
    setFieldMappings(prev => prev.map(mapping => 
      mapping.csvColumn === csvColumn 
        ? { ...mapping, userField, required: requiredFields.some(f => f.key === userField) }
        : mapping
    ));
  };

  const validateImportData = (): ImportError[] => {
    const errors: ImportError[] = [];
    const emailSet = new Set<string>();

    importData.forEach((row, index) => {
      const rowNumber = row._rowNumber || index + 2;

      // Check required fields
      requiredFields.forEach(field => {
        const mapping = fieldMappings.find(m => m.userField === field.key);
        if (!mapping || !mapping.csvColumn) {
          errors.push({
            row: rowNumber,
            field: field.key,
            message: `Campo requerido no mapeado: ${field.label}`,
            value: ''
          });
          return;
        }

        const value = row[mapping.csvColumn];
        if (!value || value.trim() === '') {
          errors.push({
            row: rowNumber,
            field: field.key,
            message: `${field.label} es requerido`,
            value: value || ''
          });
        }
      });

      // Validate email format and uniqueness
      const emailMapping = fieldMappings.find(m => m.userField === 'email');
      if (emailMapping) {
        const email = row[emailMapping.csvColumn];
        if (email) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push({
              row: rowNumber,
              field: 'email',
              message: 'Formato de email inválido',
              value: email
            });
          } else if (emailSet.has(email.toLowerCase())) {
            errors.push({
              row: rowNumber,
              field: 'email',
              message: 'Email duplicado en el archivo',
              value: email
            });
          } else {
            emailSet.add(email.toLowerCase());
          }
        }
      }

      // Validate role
      const roleMapping = fieldMappings.find(m => m.userField === 'rol');
      if (roleMapping) {
        const role = row[roleMapping.csvColumn];
        if (role && !['admin', 'manager', 'agent', 'viewer'].includes(role.toLowerCase())) {
          errors.push({
            row: rowNumber,
            field: 'rol',
            message: 'Rol inválido. Debe ser: admin, manager, agent, o viewer',
            value: role
          });
        }
      }

      // Validate phone format
      const phoneMapping = fieldMappings.find(m => m.userField === 'telefono');
      if (phoneMapping) {
        const phone = row[phoneMapping.csvColumn];
        if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
          errors.push({
            row: rowNumber,
            field: 'telefono',
            message: 'Formato de teléfono inválido',
            value: phone
          });
        }
      }
    });

    return errors;
  };

  const processImport = async () => {
    const errors = validateImportData();
    setImportErrors(errors);

    if (errors.length > 0) {
      return;
    }

    setLoading(true);
    try {
      const usersData: UserImportData[] = importData.map(row => {
        const userData: any = {};
        
        fieldMappings.forEach(mapping => {
          if (mapping.userField && mapping.csvColumn) {
            let value = row[mapping.csvColumn];
            
            // Transform values based on field type
            if (mapping.userField === 'rol') {
              value = value.toLowerCase() as UserRole;
            }
            
            userData[mapping.userField] = value;
          }
        });

        return userData as UserImportData;
      });

      const createdUsers = await onImport(usersData);
      setImportSuccess(createdUsers);
      setShowPreview(false);
    } catch (error) {
      console.error('Error importing users:', error);
      alert('Error al importar usuarios. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = allFields.map(field => field.label);
    const sampleData = [
      'Juan,Pérez,juan.perez@empresa.com,agent,+52 55 1234 5678,Ventas,Ejecutivo de Ventas',
      'María,García,maria.garcia@empresa.com,manager,+52 55 8765 4321,Marketing,Gerente de Marketing'
    ];
    
    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_usuarios.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const csvData = await onExport();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usuarios_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Error al exportar usuarios. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetImport = () => {
    setImportData([]);
    setImportErrors([]);
    setImportSuccess([]);
    setCsvHeaders([]);
    setFieldMappings([]);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Importar/Exportar Usuarios</h2>
              <p className="text-green-100 text-sm">
                Gestiona usuarios de forma masiva con archivos CSV y Excel
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'import', label: 'Importar Usuarios', icon: Upload },
              { id: 'export', label: 'Exportar Usuarios', icon: Download }
            ].map((tab) => {
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

        <div className="flex-1 overflow-y-auto p-6">
          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              {!showPreview ? (
                <>
                  {/* Upload Section */}
                  <div className="text-center">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Subir archivo de usuarios
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Arrastra y suelta tu archivo CSV o haz clic para seleccionar
                      </p>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Seleccionar Archivo
                        </button>
                        <button
                          onClick={downloadTemplate}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Descargar Plantilla
                        </button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5" />
                      Instrucciones para la importación
                    </h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p>• El archivo debe estar en formato CSV con codificación UTF-8</p>
                      <p>• La primera fila debe contener los encabezados de las columnas</p>
                      <p>• Los campos requeridos son: Nombre, Apellido, Email y Rol</p>
                      <p>• Los roles válidos son: admin, manager, agent, viewer</p>
                      <p>• Los emails deben ser únicos y tener formato válido</p>
                      <p>• Descarga la plantilla para ver el formato correcto</p>
                    </div>
                  </div>

                  {/* Success Messages */}
                  {importSuccess.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium text-green-900">
                          Importación completada exitosamente
                        </h4>
                      </div>
                      <p className="text-green-800 text-sm mb-3">
                        Se importaron {importSuccess.length} usuarios correctamente:
                      </p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {importSuccess.map((user, index) => (
                          <div key={index} className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded">
                            {user.nombre} {user.apellido} ({user.email})
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={resetImport}
                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Importar más usuarios
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Field Mapping */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Mapeo de Campos
                      </h3>
                      <button
                        onClick={resetImport}
                        className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Reiniciar
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {csvHeaders.map((header, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Columna CSV: "{header}"
                            </label>
                            <select
                              value={fieldMappings[index]?.userField || ''}
                              onChange={(e) => updateFieldMapping(header, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">No mapear</option>
                              {allFields.map(field => (
                                <option key={field.key} value={field.key}>
                                  {field.label} {field.required && '*'}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview Data */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Vista Previa ({importData.length} registros)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Fila
                            </th>
                            {fieldMappings
                              .filter(mapping => mapping.userField)
                              .map((mapping, index) => (
                                <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  {allFields.find(f => f.key === mapping.userField)?.label}
                                  {allFields.find(f => f.key === mapping.userField)?.required && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {importData.slice(0, 5).map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {row._rowNumber || index + 2}
                              </td>
                              {fieldMappings
                                .filter(mapping => mapping.userField)
                                .map((mapping, mappingIndex) => (
                                  <td key={mappingIndex} className="px-4 py-2 text-sm text-gray-900">
                                    {row[mapping.csvColumn] || '-'}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {importData.length > 5 && (
                      <p className="mt-2 text-sm text-gray-500">
                        ... y {importData.length - 5} registros más
                      </p>
                    )}
                  </div>

                  {/* Validation Errors */}
                  {importErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <h4 className="font-medium text-red-900">
                          Errores de validación ({importErrors.length})
                        </h4>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {importErrors.map((error, index) => (
                          <div key={index} className="text-sm text-red-800 bg-red-100 px-3 py-2 rounded">
                            <strong>Fila {error.row}:</strong> {error.message}
                            {error.value && <span className="ml-2 text-red-600">("{error.value}")</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Import Actions */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {importData.length} registros listos para importar
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={resetImport}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={processImport}
                        disabled={loading || importErrors.length > 0}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Importar Usuarios
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Export Filters */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros de Exportación
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Role Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roles a incluir
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'admin', label: 'Administrador' },
                        { value: 'manager', label: 'Manager' },
                        { value: 'agent', label: 'Agente' },
                        { value: 'viewer', label: 'Visualizador' }
                      ].map(role => (
                        <label key={role.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={exportFilters.roles.includes(role.value as UserRole)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExportFilters(prev => ({
                                  ...prev,
                                  roles: [...prev.roles, role.value as UserRole]
                                }));
                              } else {
                                setExportFilters(prev => ({
                                  ...prev,
                                  roles: prev.roles.filter(r => r !== role.value)
                                }));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          {role.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estados a incluir
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'active', label: 'Activo' },
                        { value: 'inactive', label: 'Inactivo' },
                        { value: 'pending', label: 'Pendiente' },
                        { value: 'suspended', label: 'Suspendido' }
                      ].map(status => (
                        <label key={status.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={exportFilters.statuses.includes(status.value as UserStatus)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExportFilters(prev => ({
                                  ...prev,
                                  statuses: [...prev.statuses, status.value as UserStatus]
                                }));
                              } else {
                                setExportFilters(prev => ({
                                  ...prev,
                                  statuses: prev.statuses.filter(s => s !== status.value)
                                }));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          {status.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rango de fechas de registro
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Desde</label>
                        <input
                          type="date"
                          value={exportFilters.dateRange.start}
                          onChange={(e) => setExportFilters(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, start: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                        <input
                          type="date"
                          value={exportFilters.dateRange.end}
                          onChange={(e) => setExportFilters(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, end: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fields to Include */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Campos a incluir en la exportación
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'basic', label: 'Información Básica', icon: Users, description: 'Nombre, apellido, email' },
                    { key: 'contact', label: 'Contacto', icon: Phone, description: 'Teléfono, departamento, cargo' },
                    { key: 'role', label: 'Rol y Estado', icon: Shield, description: 'Rol, estado, permisos' },
                    { key: 'address', label: 'Dirección', icon: MapPin, description: 'Dirección completa' },
                    { key: 'activity', label: 'Actividad', icon: Calendar, description: 'Último acceso, historial' },
                    { key: 'statistics', label: 'Estadísticas', icon: Eye, description: 'Métricas de rendimiento' }
                  ].map(field => {
                    const Icon = field.icon;
                    return (
                      <label key={field.key} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportFilters.includeFields[field.key as keyof typeof exportFilters.includeFields]}
                          onChange={(e) => setExportFilters(prev => ({
                            ...prev,
                            includeFields: {
                              ...prev.includeFields,
                              [field.key]: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{field.label}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Export Actions */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Los datos se exportarán en formato CSV
                </div>
                <button
                  onClick={handleExport}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Exportar Usuarios
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserImportExport;