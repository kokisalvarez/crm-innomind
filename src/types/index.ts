// project/src/types/index.ts

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

  // Campos que creas en createProspect()
  servicio: string;
  origen: string;

  plataforma: Platform;
  estado: ProspectStatus;
  responsable: string;

  // Timestamps
  createdAt?: Date;
  fechaContacto: Date;
  ultimoSeguimiento?: Date;

  // Historias y cotizaciones
  seguimientos: FollowUp[];
  cotizaciones: Quote[];

  // Opcional: notas internas si luego las usas
  notasInternas?: string;
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

// ——— Ajustes de la Compañía ———
export interface CompanySettings { /* ... */ }

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
export interface DashboardMetrics { /* ... */ }

// ——— Usuarios y Permisos ———
export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface UserPermission { /* ... */ }
export interface UserSettings { /* ... */ }
export interface UserStats { /* ... */ }
export interface ActivityLog { /* ... */ }
export interface User { /* ... */ }
export interface UserInvitation { /* ... */ }
export interface PasswordChangeRequest { /* ... */ }
export interface UserImportData { /* ... */ }

// ——— Tipos de Finanzas ———
export * from "./finance";
