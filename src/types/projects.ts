export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  industry: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'prospect';
  notes: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string;
  type: 'chatbot' | 'app' | 'website' | 'crm' | 'automation' | 'other';
  status: 'planning' | 'in-progress' | 'testing' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: Date;
  endDate: Date;
  estimatedHours: number;
  actualHours: number;
  budget: number;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: string[];
  projectManager: string;
  milestones: ProjectMilestone[];
  notes: ProjectNote[];
  documents: ProjectDocument[];
  paymentSchedule: PaymentSchedule[];
  meetings: ProjectMeeting[];
  expenses: ProjectExpense[];
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  progress: number; // 0-100
  dependencies: string[]; // milestone IDs
  assignedTo: string;
}

export interface ProjectNote {
  id: string;
  content: string;
  type: 'update' | 'improvement' | 'issue' | 'meeting' | 'general';
  createdBy: string;
  createdAt: Date;
  isImportant: boolean;
  attachments: string[];
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'contract' | 'specification' | 'design' | 'code' | 'documentation' | 'communication' | 'other';
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  version: string;
  description: string;
}

export interface PaymentSchedule {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  invoiceNumber?: string;
  paymentMethod?: string;
  notes: string;
}

export interface ProjectMeeting {
  id: string;
  title: string;
  description: string;
  type: 'review' | 'planning' | 'status' | 'demo' | 'kickoff' | 'other';
  scheduledDate: Date;
  duration: number; // minutes
  attendees: string[];
  meetLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes: string;
  calendarEventId?: string;
}

export interface ProjectExpense {
  id: string;
  description: string;
  category: 'license' | 'subscription' | 'hosting' | 'tools' | 'travel' | 'other';
  amount: number;
  date: Date;
  vendor: string;
  receipt?: string;
  billable: boolean;
  approved: boolean;
  approvedBy?: string;
}

// Financial Management Types
export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  projectId?: string;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  notes: string;
  paymentTerms: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface FinancialReport {
  id: string;
  type: 'profit-loss' | 'cash-flow' | 'revenue' | 'expenses' | 'project-profitability';
  period: {
    start: Date;
    end: Date;
  };
  data: any;
  generatedAt: Date;
  generatedBy: string;
}

export interface Budget {
  id: string;
  projectId: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  lastUpdated: Date;
}

export interface SalesMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  yearlyRevenue: number;
  revenueByClient: Record<string, number>;
  revenueByProject: Record<string, number>;
  averageProjectValue: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  profitMargin: number;
}

export interface ProjectFilters {
  status?: Project['status'][];
  type?: Project['type'][];
  priority?: Project['priority'][];
  assignedTo?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  client?: string[];
}