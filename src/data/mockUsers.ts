import { User } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    nombre: 'Juan Carlos',
    apellido: 'Administrador',
    email: 'admin@techsolutions.com',
    telefono: '+52 55 1234 5678',
    avatar: undefined,
    rol: 'admin',
    estado: 'active',
    fechaRegistro: new Date('2024-01-01'),
    ultimoAcceso: new Date('2024-01-30T10:30:00'),
    departamento: 'Administración',
    cargo: 'Administrador del Sistema',
    permisos: [
      { modulo: 'prospects', acciones: ['view', 'create', 'edit', 'delete'] },
      { modulo: 'quotes', acciones: ['view', 'create', 'edit', 'delete', 'approve'] },
      { modulo: 'products', acciones: ['view', 'create', 'edit', 'delete'] },
      { modulo: 'users', acciones: ['view', 'create', 'edit', 'delete', 'invite'] },
      { modulo: 'reports', acciones: ['view', 'export'] },
      { modulo: 'settings', acciones: ['view', 'edit'] }
    ],
    configuracion: {
      idioma: 'es',
      timezone: 'America/Mexico_City',
      notificaciones: {
        email: true,
        push: true,
        sms: false
      },
      tema: 'light'
    },
    estadisticas: {
      prospectosManagedos: 45,
      cotizacionesCreadas: 23,
      ventasCerradas: 12,
      tasaConversion: 26.7,
      tiempoPromedioRespuesta: 2.5
    },
    historialActividad: [
      {
        id: '1',
        fecha: new Date('2024-01-30T10:30:00'),
        accion: 'Inicio de sesión',
        modulo: 'auth',
        detalles: 'Usuario inició sesión desde navegador web',
        ip: '192.168.1.100',
        dispositivo: 'Chrome/Windows'
      },
      {
        id: '2',
        fecha: new Date('2024-01-30T09:15:00'),
        accion: 'Creó cotización COT-2024-005',
        modulo: 'quotes',
        detalles: 'Nueva cotización para cliente María Rodríguez',
        ip: '192.168.1.100'
      },
      {
        id: '3',
        fecha: new Date('2024-01-29T16:45:00'),
        accion: 'Actualizó prospecto',
        modulo: 'prospects',
        detalles: 'Cambió estado de Carlos García a "En seguimiento"',
        ip: '192.168.1.100'
      }
    ]
  },
  {
    id: '2',
    nombre: 'Ana María',
    apellido: 'López',
    email: 'ana.lopez@techsolutions.com',
    telefono: '+52 55 2345 6789',
    avatar: undefined,
    rol: 'manager',
    estado: 'active',
    fechaRegistro: new Date('2024-01-05'),
    ultimoAcceso: new Date('2024-01-29T18:20:00'),
    departamento: 'Ventas',
    cargo: 'Gerente de Ventas',
    permisos: [
      { modulo: 'prospects', acciones: ['view', 'create', 'edit', 'delete'] },
      { modulo: 'quotes', acciones: ['view', 'create', 'edit', 'approve'] },
      { modulo: 'products', acciones: ['view', 'create', 'edit'] },
      { modulo: 'users', acciones: ['view', 'invite'] },
      { modulo: 'reports', acciones: ['view', 'export'] },
      { modulo: 'settings', acciones: ['view'] }
    ],
    configuracion: {
      idioma: 'es',
      timezone: 'America/Mexico_City',
      notificaciones: {
        email: true,
        push: true,
        sms: true
      },
      tema: 'light'
    },
    estadisticas: {
      prospectosManagedos: 78,
      cotizacionesCreadas: 34,
      ventasCerradas: 18,
      tasaConversion: 23.1,
      tiempoPromedioRespuesta: 1.8
    },
    historialActividad: [
      {
        id: '4',
        fecha: new Date('2024-01-29T18:20:00'),
        accion: 'Aprobó cotización COT-2024-004',
        modulo: 'quotes',
        detalles: 'Cotización aprobada para cliente Pedro Sánchez',
        ip: '192.168.1.101'
      },
      {
        id: '5',
        fecha: new Date('2024-01-29T14:30:00'),
        accion: 'Generó reporte de ventas',
        modulo: 'reports',
        detalles: 'Reporte mensual de enero 2024',
        ip: '192.168.1.101'
      }
    ]
  },
  {
    id: '3',
    nombre: 'Luis',
    apellido: 'Martín',
    email: 'luis.martin@techsolutions.com',
    telefono: '+52 55 3456 7890',
    avatar: undefined,
    rol: 'agent',
    estado: 'active',
    fechaRegistro: new Date('2024-01-10'),
    ultimoAcceso: new Date('2024-01-29T17:45:00'),
    departamento: 'Ventas',
    cargo: 'Ejecutivo de Ventas',
    permisos: [
      { modulo: 'prospects', acciones: ['view', 'create', 'edit'] },
      { modulo: 'quotes', acciones: ['view', 'create', 'edit'] },
      { modulo: 'products', acciones: ['view'] },
      { modulo: 'reports', acciones: ['view'] }
    ],
    configuracion: {
      idioma: 'es',
      timezone: 'America/Mexico_City',
      notificaciones: {
        email: true,
        push: false,
        sms: false
      },
      tema: 'dark'
    },
    estadisticas: {
      prospectosManagedos: 32,
      cotizacionesCreadas: 15,
      ventasCerradas: 8,
      tasaConversion: 25.0,
      tiempoPromedioRespuesta: 3.2
    },
    historialActividad: [
      {
        id: '6',
        fecha: new Date('2024-01-29T17:45:00'),
        accion: 'Creó nuevo prospecto',
        modulo: 'prospects',
        detalles: 'Agregó prospecto Laura González desde WhatsApp',
        ip: '192.168.1.102'
      },
      {
        id: '7',
        fecha: new Date('2024-01-29T15:20:00'),
        accion: 'Actualizó cotización COT-2024-003',
        modulo: 'quotes',
        detalles: 'Modificó precios en cotización existente',
        ip: '192.168.1.102'
      }
    ]
  },
  {
    id: '4',
    nombre: 'Carmen',
    apellido: 'Rodríguez',
    email: 'carmen.rodriguez@techsolutions.com',
    telefono: '+52 55 4567 8901',
    avatar: undefined,
    rol: 'agent',
    estado: 'inactive',
    fechaRegistro: new Date('2024-01-15'),
    ultimoAcceso: new Date('2024-01-25T12:00:00'),
    departamento: 'Marketing',
    cargo: 'Especialista en Marketing Digital',
    permisos: [
      { modulo: 'prospects', acciones: ['view', 'create', 'edit'] },
      { modulo: 'quotes', acciones: ['view', 'create'] },
      { modulo: 'products', acciones: ['view'] },
      { modulo: 'reports', acciones: ['view'] }
    ],
    configuracion: {
      idioma: 'es',
      timezone: 'America/Mexico_City',
      notificaciones: {
        email: false,
        push: false,
        sms: false
      },
      tema: 'light'
    },
    estadisticas: {
      prospectosManagedos: 18,
      cotizacionesCreadas: 7,
      ventasCerradas: 3,
      tasaConversion: 16.7,
      tiempoPromedioRespuesta: 4.1
    },
    historialActividad: [
      {
        id: '8',
        fecha: new Date('2024-01-25T12:00:00'),
        accion: 'Último inicio de sesión',
        modulo: 'auth',
        detalles: 'Usuario inició sesión desde aplicación móvil',
        ip: '192.168.1.103',
        dispositivo: 'Mobile/iOS'
      }
    ]
  },
  {
    id: '5',
    nombre: 'Roberto',
    apellido: 'Hernández',
    email: 'roberto.hernandez@techsolutions.com',
    telefono: '+52 55 5678 9012',
    avatar: undefined,
    rol: 'viewer',
    estado: 'pending',
    fechaRegistro: new Date('2024-01-28'),
    ultimoAcceso: undefined,
    departamento: 'Finanzas',
    cargo: 'Analista Financiero',
    permisos: [
      { modulo: 'prospects', acciones: ['view'] },
      { modulo: 'quotes', acciones: ['view'] },
      { modulo: 'products', acciones: ['view'] },
      { modulo: 'reports', acciones: ['view'] }
    ],
    configuracion: {
      idioma: 'es',
      timezone: 'America/Mexico_City',
      notificaciones: {
        email: true,
        push: false,
        sms: false
      },
      tema: 'auto'
    },
    estadisticas: {
      prospectosManagedos: 0,
      cotizacionesCreadas: 0,
      ventasCerradas: 0,
      tasaConversion: 0,
      tiempoPromedioRespuesta: 0
    },
    historialActividad: [
      {
        id: '9',
        fecha: new Date('2024-01-28T09:00:00'),
        accion: 'Usuario invitado',
        modulo: 'users',
        detalles: 'Invitación enviada por Ana López',
        ip: '192.168.1.100'
      }
    ]
  }
];