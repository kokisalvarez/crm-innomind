export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'payment';
  category: string;
  amount: number;
  description: string;
  date: string;
  clientId?: string;
  projectId?: string;
  invoiceId?: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  projectId?: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  issueDate: string;
  items: InvoiceItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Budget {
  id: string;
  name: string;
  projectId?: string;
  totalBudget: number;
  spent: number;
  remaining: number;
  categories: BudgetCategory[];
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'exceeded';
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
}

export interface FinancialReport {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'balance' | 'roi' | 'cashflow';
  period: {
    start: string;
    end: string;
  };
  data: any;
  generatedAt: string;
}

export interface PaymentAlert {
  id: string;
  type: 'overdue' | 'upcoming' | 'budget_exceeded';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  relatedId: string;
  relatedType: 'invoice' | 'payment' | 'budget';
  createdAt: string;
  read: boolean;
}

export interface ROIData {
  projectId: string;
  projectName: string;
  investment: number;
  revenue: number;
  profit: number;
  roi: number;
  roiPercentage: number;
}

export interface CashFlowData {
  date: string;
  income: number;
  expense: number;
  balance: number;
  cumulativeBalance: number;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingPayments: number;
  overdueInvoices: number;
  monthlyGrowth: number;
  averageROI: number;
  cashFlowTrend: 'positive' | 'negative' | 'stable';
}