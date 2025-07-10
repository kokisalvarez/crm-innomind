// src/types/index.ts

// ——— Prospectos ———
export type Platform = 'WhatsApp' | 'Instagram' | 'Facebook';

export type ProspectStatus =
  | 'Nuevo'
  | 'Contactado'
  | 'En seguimiento'
  | 'Cotizado'
  | 'Venta cerrada'
  | 'Perdido';

export interface FollowUp {
  id: string;
  fecha: Date;
  nota: string;
  usuario: string;
}

export interface Prospect {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  plataforma: Platform;
  servicioInteres: string;
  fechaContacto: Date;
  estado: ProspectStatus;
  ultimoSeguimiento?: Date;
  notasInternas: string;
  responsable: string;
  seguimientos: FollowUp[];
  cotizaciones: Quote[];
}

// ——— Productos & Cotizaciones ———
export interface Product {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  categoria: string;
  unidadMedida: string;
  imagen?: string;
  estado: 'activo' | 'inactivo';
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface QuoteItem {
  id: string;
  productId?: string;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  tipoDescuento: 'porcentaje' | 'monto';
  subtotal: number;
}

export interface QuoteHistoryEntry {
  id: string;
  fecha: Date;
  accion: string;
  usuario: string;
  detalles: string;
}

export interface Quote {
  id: string;
  numero: string;
  prospectId: string;
  fecha: Date;
  vigencia: Date;
  items: QuoteItem[];
  subtotal: number;
  descuentoGlobal: number;
  tipoDescuentoGlobal: 'porcentaje' | 'monto';
  iva: number;
  total: number;
  estado: 'Borrador' | 'Enviada' | 'Aceptada' | 'Rechazada' | 'Vencida';
  condicionesPago: string;
  notasAdicionales: string;
  terminosCondiciones: string;
  metodosPago: string[];
  plantilla?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  creadoPor: string;
  historialCambios: QuoteHistoryEntry[];
}

export interface QuoteTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  items: Omit<QuoteItem, 'id'>[];
  condicionesPago: string;
  notasAdicionales: string;
  terminosCondiciones: string;
  metodosPago: string[];
  fechaCreacion: Date;
  creadoPor: string;
}

// ——— Ajustes de la Compañía ———
export interface CompanySettings {
  nombre: string;
  logo?: string;
  direccion: string;
  telefono: string;
  correo: string;
  sitioWeb: string;
  rfc: string;
  regimenFiscal: string;
  iva: number;
  condicionesPagoDefault: string;
  terminosCondicionesDefault: string;
  metodosPagoDefault: string[];
  recordatoriosAutomaticos: boolean;
  diasRecordatorio: number;
}

// ——— Webhooks ———
export interface WebhookData {
  nombre: string;
  telefono: string;
  correo?: string;
  plataforma: Platform;
  servicio_interes: string;
  fecha_contacto: string;
}

// ——— Dashboard CRM ———
export interface DashboardMetrics {
  totalProspectos: number;
  prospectosPorPlataforma: Record<Platform, number>;
  prospectosPorEstado: Record<ProspectStatus, number>;
  cotizacionesGeneradas: number;
  ventasCerradas: number;
  tasaConversion: number;
  cotizacionesPorEstado: Record<Quote['estado'], number>;
  valorTotalCotizaciones: number;
  tasaAceptacion: number;
}

// ——— Usuarios y Permisos ———
export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface UserPermission {
  modulo: string;
  acciones: string[];
}

export interface UserSettings {
  idioma: string;
  timezone: string;
  notificaciones: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  tema: 'light' | 'dark' | 'auto';
}

export interface UserStats {
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
  dispositivo?: string;
}

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  avatar?: string;
  rol: UserRole;
  estado: UserStatus;
  fechaRegistro: Date;
  ultimoAcceso?: Date;
  departamento?: string;
  cargo?: string;
  permisos: UserPermission[];
  configuracion: UserSettings;
  estadisticas: UserStats;
  historialActividad: ActivityLog[];
}

export interface UserInvitation {
  id: string;
  email: string;
  rol: UserRole;
  fechaInvitacion: Date;
  fechaExpiracion: Date;
  estado: 'pending' | 'accepted' | 'expired';
  invitadoPor: string;
  token: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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

// ——— Tipos de Finanzas ———
export * from "./finance";
