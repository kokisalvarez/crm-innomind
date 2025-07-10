import { Client, Project, Invoice } from '../types/projects';

export const mockClients: Client[] = [
  {
    id: '1',
    companyName: 'TechStart Solutions',
    contactPerson: 'María González',
    email: 'maria@techstart.com',
    phone: '+52 55 1234 5678',
    address: 'Av. Reforma 123, CDMX',
    website: 'www.techstart.com',
    industry: 'Technology',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    status: 'active',
    notes: 'Cliente premium con múltiples proyectos'
  },
  {
    id: '2',
    companyName: 'Retail Express',
    contactPerson: 'Carlos Mendoza',
    email: 'carlos@retailexpress.com',
    phone: '+52 55 2345 6789',
    address: 'Polanco 456, CDMX',
    website: 'www.retailexpress.com',
    industry: 'Retail',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    status: 'active',
    notes: 'Cadena de tiendas en expansión'
  },
  {
    id: '3',
    companyName: 'HealthCare Plus',
    contactPerson: 'Ana Rodríguez',
    email: 'ana@healthcareplus.com',
    phone: '+52 55 3456 7890',
    address: 'Santa Fe 789, CDMX',
    website: 'www.healthcareplus.com',
    industry: 'Healthcare',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    status: 'prospect',
    notes: 'Interesados en automatización de citas'
  }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    clientId: '1',
    name: 'Chatbot de Atención al Cliente',
    description: 'Desarrollo de chatbot inteligente para WhatsApp con IA para atención 24/7',
    type: 'chatbot',
    status: 'in-progress',
    priority: 'high',
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-03-15'),
    estimatedHours: 120,
    actualHours: 85,
    budget: 8000,
    totalValue: 12000,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-30'),
    assignedTo: ['Ana López', 'Luis Martín'],
    projectManager: 'Ana López',
    milestones: [
      {
        id: '1',
        title: 'Análisis de Requerimientos',
        description: 'Definición completa de funcionalidades y flujos',
        dueDate: new Date('2024-02-01'),
        completedDate: new Date('2024-01-30'),
        status: 'completed',
        progress: 100,
        dependencies: [],
        assignedTo: 'Ana López'
      },
      {
        id: '2',
        title: 'Desarrollo del Bot',
        description: 'Programación de lógica y respuestas del chatbot',
        dueDate: new Date('2024-02-20'),
        status: 'in-progress',
        progress: 70,
        dependencies: ['1'],
        assignedTo: 'Luis Martín'
      },
      {
        id: '3',
        title: 'Integración con WhatsApp',
        description: 'Conexión con API de WhatsApp Business',
        dueDate: new Date('2024-03-01'),
        status: 'pending',
        progress: 0,
        dependencies: ['2'],
        assignedTo: 'Luis Martín'
      },
      {
        id: '4',
        title: 'Pruebas y Lanzamiento',
        description: 'Testing completo y puesta en producción',
        dueDate: new Date('2024-03-15'),
        status: 'pending',
        progress: 0,
        dependencies: ['3'],
        assignedTo: 'Ana López'
      }
    ],
    notes: [
      {
        id: '1',
        content: 'Cliente muy satisfecho con el progreso. Solicita demo intermedia.',
        type: 'update',
        createdBy: 'Ana López',
        createdAt: new Date('2024-01-28'),
        isImportant: true,
        attachments: []
      },
      {
        id: '2',
        content: 'Sugerencia: Agregar función de escalamiento a humano para casos complejos.',
        type: 'improvement',
        createdBy: 'Luis Martín',
        createdAt: new Date('2024-01-25'),
        isImportant: false,
        attachments: []
      }
    ],
    documents: [
      {
        id: '1',
        name: 'Especificaciones Técnicas v2.0',
        type: 'specification',
        url: '/documents/specs-chatbot-v2.pdf',
        size: 2048000,
        uploadedBy: 'Ana López',
        uploadedAt: new Date('2024-01-22'),
        version: '2.0',
        description: 'Especificaciones técnicas actualizadas del chatbot'
      }
    ],
    paymentSchedule: [
      {
        id: '1',
        description: 'Anticipo 50%',
        amount: 6000,
        dueDate: new Date('2024-01-25'),
        paidDate: new Date('2024-01-24'),
        status: 'paid',
        invoiceNumber: 'INV-2024-001',
        paymentMethod: 'Transferencia',
        notes: 'Pago recibido puntualmente'
      },
      {
        id: '2',
        description: 'Pago final 50%',
        amount: 6000,
        dueDate: new Date('2024-03-20'),
        status: 'pending',
        notes: 'Pago contra entrega del proyecto'
      }
    ],
    meetings: [
      {
        id: '1',
        title: 'Kickoff Meeting',
        description: 'Reunión inicial del proyecto',
        type: 'kickoff',
        scheduledDate: new Date('2024-01-20T10:00:00'),
        duration: 60,
        attendees: ['María González', 'Ana López', 'Luis Martín'],
        meetLink: 'https://meet.google.com/abc-defg-hij',
        status: 'completed',
        notes: 'Excelente inicio, todos los requerimientos claros'
      },
      {
        id: '2',
        title: 'Demo Intermedia',
        description: 'Presentación del progreso del chatbot',
        type: 'demo',
        scheduledDate: new Date('2024-02-15T15:00:00'),
        duration: 45,
        attendees: ['María González', 'Ana López'],
        meetLink: 'https://meet.google.com/xyz-uvwx-yz',
        status: 'scheduled',
        notes: ''
      }
    ],
    expenses: [
      {
        id: '1',
        description: 'Licencia WhatsApp Business API',
        category: 'license',
        amount: 500,
        date: new Date('2024-01-22'),
        vendor: 'Meta',
        billable: true,
        approved: true,
        approvedBy: 'Ana López'
      },
      {
        id: '2',
        description: 'Servidor de desarrollo',
        category: 'hosting',
        amount: 200,
        date: new Date('2024-01-25'),
        vendor: 'AWS',
        billable: false,
        approved: true,
        approvedBy: 'Ana López'
      }
    ]
  },
  {
    id: '2',
    clientId: '2',
    name: 'Sistema de Inventario Web',
    description: 'Aplicación web para gestión de inventario en tiempo real',
    type: 'app',
    status: 'planning',
    priority: 'medium',
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-05-30'),
    estimatedHours: 200,
    actualHours: 0,
    budget: 15000,
    totalValue: 25000,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    assignedTo: ['Carmen Rodríguez', 'Roberto Hernández'],
    projectManager: 'Carmen Rodríguez',
    milestones: [
      {
        id: '5',
        title: 'Análisis de Requerimientos',
        description: 'Levantamiento de requerimientos del sistema',
        dueDate: new Date('2024-02-28'),
        status: 'in-progress',
        progress: 30,
        dependencies: [],
        assignedTo: 'Carmen Rodríguez'
      }
    ],
    notes: [],
    documents: [],
    paymentSchedule: [
      {
        id: '3',
        description: 'Anticipo 40%',
        amount: 10000,
        dueDate: new Date('2024-02-20'),
        status: 'pending',
        notes: 'Pago para iniciar desarrollo'
      }
    ],
    meetings: [],
    expenses: []
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-2024-001',
    clientId: '1',
    projectId: '1',
    issueDate: new Date('2024-01-20'),
    dueDate: new Date('2024-01-25'),
    paidDate: new Date('2024-01-24'),
    amount: 6000,
    tax: 960,
    total: 6960,
    status: 'paid',
    items: [
      {
        id: '1',
        description: 'Desarrollo Chatbot WhatsApp - Anticipo 50%',
        quantity: 1,
        rate: 6000,
        amount: 6000
      }
    ],
    notes: 'Anticipo para inicio del proyecto',
    paymentTerms: '5 días'
  }
];