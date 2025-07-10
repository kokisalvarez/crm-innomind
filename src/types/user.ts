export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface UserPermission {
  modulo: string;
  acciones: string[];
}

export interface UserConfiguration {
  idioma: string;
  timezone: string;
  notificaciones: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  tema: 'light' | 'dark';
}

export interface UserStatistics {
  prospectosManagedos: number;
  cotizacionesCreadas: number;
  ventasCerradas: number;
  tasaConversion: number;
  tiempoPromedioRespuesta: number;
}

export interface ActivityLog {
  id: string;
  fecha: Date;
  accion: string;
  modulo: string;
  detalles: string;
  ip?: string;
}

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: UserRole;
  estado: UserStatus;
  departamento?: string;
  cargo?: string;
  avatar?: string;
  fechaRegistro: Date;
  fechaActualizacion?: Date;
  ultimoAcceso?: Date;
  permisos: UserPermission[];
  configuracion: UserConfiguration;
  estadisticas: UserStatistics;
  historialActividad: ActivityLog[];
}

export interface UserImportData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: UserRole;
  departamento?: string;
  cargo?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserFilters {
  search: string;
  role: UserRole | 'all';
  status: UserStatus | 'all';
  sortBy: 'nombre' | 'fechaRegistro' | 'ultimoAcceso';
  sortOrder: 'asc' | 'desc';
}

export interface UserPagination {
  page: number;
  limit: number;
  total: number;
}