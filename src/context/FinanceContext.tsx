import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Transaction, Invoice, Budget, PaymentAlert, FinancialMetrics, ROIData, CashFlowData } from '../types/finance';
import { mockTransactions, mockInvoices, mockBudgets, mockPaymentAlerts } from '../data/mockFinanceData';

interface FinanceState {
  transactions: Transaction[];
  invoices: Invoice[];
  budgets: Budget[];
  alerts: PaymentAlert[];
  metrics: FinancialMetrics;
  roiData: ROIData[];
  cashFlowData: CashFlowData[];
  loading: boolean;
  error: string | null;
}

interface FinanceContextType extends FinanceState {
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  markAlertAsRead: (id: string) => void;
  exportReport: (type: string, format: string) => void;
  calculateROI: (projectId: string) => ROIData | null;
  generateCashFlowData: (startDate: string, endDate: string) => CashFlowData[];
}

type FinanceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_INVOICE'; payload: { id: string; updates: Partial<Invoice> } }
  | { type: 'DELETE_INVOICE'; payload: string }
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: { id: string; updates: Partial<Budget> } }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'SET_ALERTS'; payload: PaymentAlert[] }
  | { type: 'MARK_ALERT_READ'; payload: string }
  | { type: 'UPDATE_METRICS'; payload: FinancialMetrics }
  | { type: 'SET_ROI_DATA'; payload: ROIData[] }
  | { type: 'SET_CASHFLOW_DATA'; payload: CashFlowData[] };

const initialState: FinanceState = {
  transactions: [],
  invoices: [],
  budgets: [],
  alerts: [],
  metrics: {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingPayments: 0,
    overdueInvoices: 0,
    monthlyGrowth: 0,
    averageROI: 0,
    cashFlowTrend: 'stable'
  },
  roiData: [],
  cashFlowData: [],
  loading: false,
  error: null
};

const financeReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        )
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload)
      };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'ADD_INVOICE':
      return { ...state, invoices: [...state.invoices, action.payload] };
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map(i =>
          i.id === action.payload.id ? { ...i, ...action.payload.updates } : i
        )
      };
    case 'DELETE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.filter(i => i.id !== action.payload)
      };
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] };
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(b =>
          b.id === action.payload.id ? { ...b, ...action.payload.updates } : b
        )
      };
    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(b => b.id !== action.payload)
      };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'MARK_ALERT_READ':
      return {
        ...state,
        alerts: state.alerts.map(a =>
          a.id === action.payload ? { ...a, read: true } : a
        )
      };
    case 'UPDATE_METRICS':
      return { ...state, metrics: action.payload };
    case 'SET_ROI_DATA':
      return { ...state, roiData: action.payload };
    case 'SET_CASHFLOW_DATA':
      return { ...state, cashFlowData: action.payload };
    default:
      return state;
  }
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  // Calculate metrics whenever transactions or invoices change
  useEffect(() => {
    const calculateMetrics = () => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Calculate totals
      const totalRevenue = state.transactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = state.transactions
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const netProfit = totalRevenue - totalExpenses;

      const pendingPayments = state.transactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);

      const overdueInvoices = state.invoices
        .filter(i => i.status === 'overdue').length;

      // Calculate monthly growth (simplified)
      const previousMonthRevenue = state.transactions
        .filter(t => {
          const transactionDate = new Date(t.date);
          return t.type === 'income' && 
                 t.status === 'completed' &&
                 transactionDate.getMonth() === currentMonth - 1 &&
                 transactionDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const currentMonthRevenue = state.transactions
        .filter(t => {
          const transactionDate = new Date(t.date);
          return t.type === 'income' && 
                 t.status === 'completed' &&
                 transactionDate.getMonth() === currentMonth &&
                 transactionDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyGrowth = previousMonthRevenue > 0 
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;

      // Calculate average ROI
      const averageROI = state.roiData.length > 0
        ? state.roiData.reduce((sum, roi) => sum + roi.roiPercentage, 0) / state.roiData.length
        : 0;

      // Determine cash flow trend
      const cashFlowTrend = netProfit > 0 ? 'positive' : netProfit < 0 ? 'negative' : 'stable';

      const metrics: FinancialMetrics = {
        totalRevenue,
        totalExpenses,
        netProfit,
        pendingPayments,
        overdueInvoices,
        monthlyGrowth,
        averageROI,
        cashFlowTrend
      };

      dispatch({ type: 'UPDATE_METRICS', payload: metrics });
    };

    calculateMetrics();
  }, [state.transactions, state.invoices, state.roiData]);

  // Initialize with mock data
  useEffect(() => {
    dispatch({ type: 'SET_TRANSACTIONS', payload: mockTransactions });
    dispatch({ type: 'SET_INVOICES', payload: mockInvoices });
    dispatch({ type: 'SET_BUDGETS', payload: mockBudgets });
    dispatch({ type: 'SET_ALERTS', payload: mockPaymentAlerts });
  }, []);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, updates: { ...updates, updatedAt: new Date().toISOString() } } });
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_INVOICE', payload: newInvoice });
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    dispatch({ type: 'UPDATE_INVOICE', payload: { id, updates: { ...updates, updatedAt: new Date().toISOString() } } });
  };

  const deleteInvoice = (id: string) => {
    dispatch({ type: 'DELETE_INVOICE', payload: id });
  };

  const addBudget = (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_BUDGET', payload: newBudget });
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    dispatch({ type: 'UPDATE_BUDGET', payload: { id, updates: { ...updates, updatedAt: new Date().toISOString() } } });
  };

  const deleteBudget = (id: string) => {
    dispatch({ type: 'DELETE_BUDGET', payload: id });
  };

  const markAlertAsRead = (id: string) => {
    dispatch({ type: 'MARK_ALERT_READ', payload: id });
  };

  const exportReport = (type: string, format: string) => {
    // Implementation for exporting reports
    console.log(`Exporting ${type} report in ${format} format`);
  };

  const calculateROI = (projectId: string): ROIData | null => {
    // Implementation for calculating ROI for a specific project
    return state.roiData.find(roi => roi.projectId === projectId) || null;
  };

  const generateCashFlowData = (startDate: string, endDate: string): CashFlowData[] => {
    // Implementation for generating cash flow data
    return state.cashFlowData.filter(cf => 
      cf.date >= startDate && cf.date <= endDate
    );
  };

  return (
    <FinanceContext.Provider
      value={{
        ...state,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addBudget,
        updateBudget,
        deleteBudget,
        markAlertAsRead,
        exportReport,
        calculateROI,
        generateCashFlowData
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};