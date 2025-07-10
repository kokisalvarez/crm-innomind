import { Transaction, Invoice, Budget, PaymentAlert, ROIData, CashFlowData } from '../types/finance';

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    category: 'Software License',
    amount: 5000,
    description: 'Monthly software license payment - Client ABC',
    date: '2024-01-15',
    clientId: 'client-1',
    projectId: 'project-1',
    status: 'completed',
    paymentMethod: 'Bank Transfer',
    reference: 'REF001',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    type: 'expense',
    category: 'Development Tools',
    amount: 1200,
    description: 'Monthly development tools subscription',
    date: '2024-01-10',
    status: 'completed',
    paymentMethod: 'Credit Card',
    reference: 'EXP001',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z'
  },
  {
    id: '3',
    type: 'income',
    category: 'Consulting',
    amount: 8000,
    description: 'Web development consulting - Client XYZ',
    date: '2024-01-20',
    clientId: 'client-2',
    projectId: 'project-2',
    status: 'completed',
    paymentMethod: 'PayPal',
    reference: 'REF002',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '4',
    type: 'expense',
    category: 'Marketing',
    amount: 2500,
    description: 'Digital marketing campaign',
    date: '2024-01-25',
    status: 'completed',
    paymentMethod: 'Bank Transfer',
    reference: 'EXP002',
    createdAt: '2024-01-25T11:15:00Z',
    updatedAt: '2024-01-25T11:15:00Z'
  },
  {
    id: '5',
    type: 'payment',
    category: 'Invoice Payment',
    amount: 15000,
    description: 'Payment for project delivery - Client DEF',
    date: '2024-01-30',
    clientId: 'client-3',
    projectId: 'project-3',
    invoiceId: 'invoice-1',
    status: 'pending',
    paymentMethod: 'Bank Transfer',
    reference: 'PAY001',
    createdAt: '2024-01-30T16:45:00Z',
    updatedAt: '2024-01-30T16:45:00Z'
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: 'invoice-1',
    number: 'INV-2024-001',
    clientId: 'client-1',
    projectId: 'project-1',
    amount: 10000,
    tax: 1000,
    total: 11000,
    status: 'paid',
    dueDate: '2024-02-15',
    issueDate: '2024-01-15',
    items: [
      {
        id: 'item-1',
        description: 'Web Application Development',
        quantity: 1,
        unitPrice: 8000,
        total: 8000
      },
      {
        id: 'item-2',
        description: 'Project Management',
        quantity: 20,
        unitPrice: 100,
        total: 2000
      }
    ],
    notes: 'Payment terms: 30 days',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'invoice-2',
    number: 'INV-2024-002',
    clientId: 'client-2',
    projectId: 'project-2',
    amount: 15000,
    tax: 1500,
    total: 16500,
    status: 'sent',
    dueDate: '2024-02-20',
    issueDate: '2024-01-20',
    items: [
      {
        id: 'item-3',
        description: 'Mobile App Development',
        quantity: 1,
        unitPrice: 12000,
        total: 12000
      },
      {
        id: 'item-4',
        description: 'UI/UX Design',
        quantity: 1,
        unitPrice: 3000,
        total: 3000
      }
    ],
    notes: 'Payment terms: 30 days',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'invoice-3',
    number: 'INV-2024-003',
    clientId: 'client-3',
    amount: 7500,
    tax: 750,
    total: 8250,
    status: 'overdue',
    dueDate: '2024-01-25',
    issueDate: '2023-12-25',
    items: [
      {
        id: 'item-5',
        description: 'E-commerce Platform Setup',
        quantity: 1,
        unitPrice: 7500,
        total: 7500
      }
    ],
    notes: 'Payment overdue - please remit payment immediately',
    createdAt: '2023-12-25T09:00:00Z',
    updatedAt: '2024-01-30T17:00:00Z'
  }
];

export const mockBudgets: Budget[] = [
  {
    id: 'budget-1',
    name: 'Q1 2024 Development Budget',
    projectId: 'project-1',
    totalBudget: 50000,
    spent: 32000,
    remaining: 18000,
    categories: [
      {
        id: 'cat-1',
        name: 'Development',
        allocated: 30000,
        spent: 20000,
        remaining: 10000
      },
      {
        id: 'cat-2',
        name: 'Marketing',
        allocated: 15000,
        spent: 8000,
        remaining: 7000
      },
      {
        id: 'cat-3',
        name: 'Operations',
        allocated: 5000,
        spent: 4000,
        remaining: 1000
      }
    ],
    period: 'quarterly',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-30T12:00:00Z'
  },
  {
    id: 'budget-2',
    name: 'Annual Marketing Budget 2024',
    totalBudget: 25000,
    spent: 5000,
    remaining: 20000,
    categories: [
      {
        id: 'cat-4',
        name: 'Digital Advertising',
        allocated: 15000,
        spent: 3000,
        remaining: 12000
      },
      {
        id: 'cat-5',
        name: 'Content Creation',
        allocated: 7000,
        spent: 1500,
        remaining: 5500
      },
      {
        id: 'cat-6',
        name: 'Events',
        allocated: 3000,
        spent: 500,
        remaining: 2500
      }
    ],
    period: 'yearly',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-30T12:00:00Z'
  }
];

export const mockPaymentAlerts: PaymentAlert[] = [
  {
    id: 'alert-1',
    type: 'overdue',
    title: 'Overdue Invoice',
    message: 'Invoice INV-2024-003 is overdue by 5 days',
    priority: 'high',
    relatedId: 'invoice-3',
    relatedType: 'invoice',
    createdAt: '2024-01-30T09:00:00Z',
    read: false
  },
  {
    id: 'alert-2',
    type: 'upcoming',
    title: 'Payment Due Soon',
    message: 'Invoice INV-2024-002 is due in 3 days',
    priority: 'medium',
    relatedId: 'invoice-2',
    relatedType: 'invoice',
    createdAt: '2024-01-30T10:00:00Z',
    read: false
  },
  {
    id: 'alert-3',
    type: 'budget_exceeded',
    title: 'Budget Alert',
    message: 'Operations budget is 80% utilized',
    priority: 'medium',
    relatedId: 'budget-1',
    relatedType: 'budget',
    createdAt: '2024-01-30T11:00:00Z',
    read: true
  }
];

export const mockROIData: ROIData[] = [
  {
    projectId: 'project-1',
    projectName: 'E-commerce Platform',
    investment: 25000,
    revenue: 45000,
    profit: 20000,
    roi: 0.8,
    roiPercentage: 80
  },
  {
    projectId: 'project-2',
    projectName: 'Mobile App Development',
    investment: 30000,
    revenue: 60000,
    profit: 30000,
    roi: 1.0,
    roiPercentage: 100
  },
  {
    projectId: 'project-3',
    projectName: 'Web Portal',
    investment: 15000,
    revenue: 22000,
    profit: 7000,
    roi: 0.47,
    roiPercentage: 47
  }
];

export const mockCashFlowData: CashFlowData[] = [
  {
    date: '2024-01-01',
    income: 15000,
    expense: 8000,
    balance: 7000,
    cumulativeBalance: 7000
  },
  {
    date: '2024-01-02',
    income: 3000,
    expense: 2000,
    balance: 1000,
    cumulativeBalance: 8000
  },
  {
    date: '2024-01-03',
    income: 0,
    expense: 1500,
    balance: -1500,
    cumulativeBalance: 6500
  },
  {
    date: '2024-01-04',
    income: 8000,
    expense: 3000,
    balance: 5000,
    cumulativeBalance: 11500
  },
  {
    date: '2024-01-05',
    income: 2000,
    expense: 2500,
    balance: -500,
    cumulativeBalance: 11000
  }
];