import { Prospect, Product, Platform, ProspectStatus, Quote, QuoteTemplate, CompanySettings } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    nombre: 'Chatbot WhatsApp Básico',
    precio: 2500,
    descripcion: 'Chatbot automatizado para WhatsApp con respuestas básicas, configuración inicial y soporte por 30 días',
    categoria: 'Chatbots',
    unidadMedida: 'Servicio',
    estado: 'activo',
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: '2',
    nombre: 'Chatbot WhatsApp Premium',
    precio: 5000,
    descripcion: 'Chatbot avanzado con IA, integraciones múltiples, analytics y soporte premium por 90 días',
    categoria: 'Chatbots',
    unidadMedida: 'Servicio',
    estado: 'activo',
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: '3',
    nombre: 'Automatización de Ventas',
    precio: 3500,
    descripcion: 'Sistema completo de automatización de procesos de venta con CRM integrado',
    categoria: 'Automatización',
    unidadMedida: 'Servicio',
    estado: 'activo',
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: '4',
    nombre: 'CRM Personalizado',
    precio: 7500,
    descripcion: 'Sistema CRM desarrollado a medida para tu negocio con módulos específicos',
    categoria: 'Software',
    unidadMedida: 'Servicio',
    estado: 'activo',
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: '5',
    nombre: 'Marketing Digital',
    precio: 2000,
    descripcion: 'Campañas de marketing digital y gestión de redes sociales por mes',
    categoria: 'Marketing',
    unidadMedida: 'Mes',
    estado: 'activo',
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: '6',
    nombre: 'Consultoría Estratégica',
    precio: 1500,
    descripcion: 'Sesión de consultoría estratégica para optimización de procesos digitales',
    categoria: 'Consultoría',
    unidadMedida: 'Hora',
    estado: 'activo',
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: '7',
    nombre: 'Integración API',
    precio: 4000,
    descripcion: 'Desarrollo e integración de APIs personalizadas para conectar sistemas',
    categoria: 'Desarrollo',
    unidadMedida: 'Servicio',
    estado: 'activo',
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  },
  {
    id: '8',
    nombre: 'Mantenimiento Mensual',
    precio: 800,
    descripcion: 'Servicio de mantenimiento y soporte técnico mensual para sistemas implementados',
    categoria: 'Soporte',
    unidadMedida: 'Mes',
    estado: 'activo',
    fechaCreacion: new Date('2024-01-01'),
    fechaActualizacion: new Date('2024-01-01')
  }
];

export const mockQuoteTemplates: QuoteTemplate[] = [
  {
    id: '1',
    nombre: 'Paquete Chatbot Completo',
    descripcion: 'Plantilla para chatbot con implementación y soporte',
    items: [
      {
        nombre: 'Chatbot WhatsApp Premium',
        descripcion: 'Chatbot avanzado con IA y integraciones múltiples',
        cantidad: 1,
        precioUnitario: 5000,
        descuento: 0,
        tipoDescuento: 'porcentaje',
        subtotal: 5000
      },
      {
        nombre: 'Consultoría Estratégica',
        descripcion: 'Análisis y planificación de la estrategia de automatización',
        cantidad: 4,
        precioUnitario: 1500,
        descuento: 10,
        tipoDescuento: 'porcentaje',
        subtotal: 5400
      }
    ],
    condicionesPago: '50% anticipo, 50% contra entrega',
    notasAdicionales: 'Incluye capacitación del equipo y documentación completa',
    terminosCondiciones: 'Garantía de 90 días en funcionamiento. Soporte técnico incluido.',
    metodosPago: ['Transferencia bancaria', 'PayPal', 'Stripe'],
    fechaCreacion: new Date('2024-01-15'),
    creadoPor: 'Admin'
  },
  {
    id: '2',
    nombre: 'Paquete Marketing + Automatización',
    descripcion: 'Solución integral de marketing y automatización',
    items: [
      {
        nombre: 'Marketing Digital',
        descripcion: 'Gestión completa de redes sociales y campañas',
        cantidad: 3,
        precioUnitario: 2000,
        descuento: 15,
        tipoDescuento: 'porcentaje',
        subtotal: 5100
      },
      {
        nombre: 'Automatización de Ventas',
        descripcion: 'Sistema de automatización de procesos de venta',
        cantidad: 1,
        precioUnitario: 3500,
        descuento: 0,
        tipoDescuento: 'porcentaje',
        subtotal: 3500
      }
    ],
    condicionesPago: '30% anticipo, 70% en 2 pagos mensuales',
    notasAdicionales: 'Incluye reportes mensuales y optimización continua',
    terminosCondiciones: 'Contrato mínimo de 3 meses. Cancelación con 30 días de anticipación.',
    metodosPago: ['Transferencia bancaria', 'Tarjeta de crédito'],
    fechaCreacion: new Date('2024-01-20'),
    creadoPor: 'Admin'
  }
];

export const mockCompanySettings: CompanySettings = {
  nombre: 'TechSolutions Pro',
  direccion: 'Av. Tecnología 123, Col. Innovación, Ciudad de México, CP 01234',
  telefono: '+52 55 1234 5678',
  correo: 'contacto@techsolutions.com',
  sitioWeb: 'www.techsolutions.com',
  rfc: 'TSP123456789',
  regimenFiscal: 'Régimen General de Ley Personas Morales',
  iva: 16,
  condicionesPagoDefault: '50% anticipo, 50% contra entrega',
  terminosCondicionesDefault: 'Garantía de 30 días. Soporte técnico incluido por 90 días.',
  metodosPagoDefault: ['Transferencia bancaria', 'PayPal', 'Stripe', 'Tarjeta de crédito'],
  recordatoriosAutomaticos: true,
  diasRecordatorio: 7
};

export const mockProspects: Prospect[] = [
  {
    id: '1',
    nombre: 'Carlos García',
    telefono: '+5213312345678',
    correo: 'carlos@example.com',
    plataforma: 'WhatsApp',
    servicioInteres: 'Chatbot WhatsApp',
    fechaContacto: new Date('2024-01-15'),
    estado: 'En seguimiento',
    ultimoSeguimiento: new Date('2024-01-20'),
    notasInternas: 'Cliente muy interesado, tiene tienda online',
    responsable: 'Ana López',
    seguimientos: [
      {
        id: '1',
        fecha: new Date('2024-01-16'),
        nota: 'Primera llamada realizada, muy interesado en automatización',
        usuario: 'Ana López'
      },
      {
        id: '2',
        fecha: new Date('2024-01-20'),
        nota: 'Envió información adicional sobre su negocio',
        usuario: 'Ana López'
      }
    ],
    cotizaciones: []
  },
  {
    id: '2',
    nombre: 'María Rodríguez',
    telefono: '+5215544332211',
    correo: 'maria@tienda.com',
    plataforma: 'Instagram',
    servicioInteres: 'CRM Personalizado',
    fechaContacto: new Date('2024-01-18'),
    estado: 'Cotizado',
    ultimoSeguimiento: new Date('2024-01-22'),
    notasInternas: 'Dueña de boutique, necesita sistema completo',
    responsable: 'Luis Martín',
    seguimientos: [
      {
        id: '3',
        fecha: new Date('2024-01-19'),
        nota: 'Reunión virtual programada para mañana',
        usuario: 'Luis Martín'
      }
    ],
    cotizaciones: [
      {
        id: '1',
        numero: 'COT-2024-001',
        prospectId: '2',
        fecha: new Date('2024-01-21'),
        vigencia: new Date('2024-02-21'),
        items: [
          {
            id: '1',
            productId: '4',
            nombre: 'CRM Personalizado',
            descripcion: 'Sistema CRM desarrollado a medida para boutique',
            cantidad: 1,
            precioUnitario: 7500,
            descuento: 0,
            tipoDescuento: 'porcentaje',
            subtotal: 7500
          }
        ],
        subtotal: 7500,
        descuentoGlobal: 0,
        tipoDescuentoGlobal: 'porcentaje',
        iva: 16,
        total: 8700,
        estado: 'Enviada',
        condicionesPago: '50% anticipo, 50% contra entrega',
        notasAdicionales: 'Incluye capacitación del equipo',
        terminosCondiciones: 'Garantía de 90 días',
        metodosPago: ['Transferencia bancaria', 'PayPal'],
        fechaCreacion: new Date('2024-01-21'),
        fechaActualizacion: new Date('2024-01-21'),
        creadoPor: 'Luis Martín',
        historialCambios: []
      }
    ]
  },
  {
    id: '3',
    nombre: 'Pedro Sánchez',
    telefono: '+5219988776655',
    correo: 'pedro@consultoria.com',
    plataforma: 'Facebook',
    servicioInteres: 'Marketing Digital',
    fechaContacto: new Date('2024-01-20'),
    estado: 'Nuevo',
    notasInternas: 'Consultor independiente',
    responsable: 'Ana López',
    seguimientos: [],
    cotizaciones: []
  },
  {
    id: '4',
    nombre: 'Laura González',
    telefono: '+5216677889900',
    correo: 'laura@startup.com',
    plataforma: 'WhatsApp',
    servicioInteres: 'Automatización de Ventas',
    fechaContacto: new Date('2024-01-22'),
    estado: 'Venta cerrada',
    ultimoSeguimiento: new Date('2024-01-25'),
    notasInternas: 'Startup tecnológica, pagó por adelantado',
    responsable: 'Luis Martín',
    seguimientos: [
      {
        id: '4',
        fecha: new Date('2024-01-23'),
        nota: 'Cotización aceptada, iniciando proyecto',
        usuario: 'Luis Martín'
      }
    ],
    cotizaciones: [
      {
        id: '2',
        numero: 'COT-2024-002',
        prospectId: '4',
        fecha: new Date('2024-01-23'),
        vigencia: new Date('2024-02-23'),
        items: [
          {
            id: '2',
            productId: '3',
            nombre: 'Automatización de Ventas',
            descripcion: 'Sistema completo de automatización de procesos',
            cantidad: 1,
            precioUnitario: 3500,
            descuento: 0,
            tipoDescuento: 'porcentaje',
            subtotal: 3500
          }
        ],
        subtotal: 3500,
        descuentoGlobal: 0,
        tipoDescuentoGlobal: 'porcentaje',
        iva: 16,
        total: 4060,
        estado: 'Aceptada',
        condicionesPago: 'Pago único por adelantado',
        notasAdicionales: 'Cliente prefiere implementación rápida',
        terminosCondiciones: 'Garantía de 90 días',
        metodosPago: ['Transferencia bancaria'],
        fechaCreacion: new Date('2024-01-23'),
        fechaActualizacion: new Date('2024-01-23'),
        creadoPor: 'Luis Martín',
        historialCambios: []
      }
    ]
  }
];