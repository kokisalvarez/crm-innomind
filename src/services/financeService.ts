import { Transaction, Invoice, Budget, FinancialReport } from '../types/finance';

export class FinanceService {
  private static instance: FinanceService;
  private baseURL = '/api/finance';

  private constructor() {}

  static getInstance(): FinanceService {
    if (!FinanceService.instance) {
      FinanceService.instance = new FinanceService();
    }
    return FinanceService.instance;
  }

  // Transaction methods
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    try {
      const response = await fetch(`${this.baseURL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async getTransactions(filters?: any): Promise<Transaction[]> {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${this.baseURL}/transactions?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    try {
      const response = await fetch(`${this.baseURL}/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Invoice methods
  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    try {
      const response = await fetch(`${this.baseURL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async getInvoices(filters?: any): Promise<Invoice[]> {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${this.baseURL}/invoices?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    try {
      const response = await fetch(`${this.baseURL}/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  async deleteInvoice(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/invoices/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  // Budget methods
  async createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    try {
      const response = await fetch(`${this.baseURL}/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budget),
      });

      if (!response.ok) {
        throw new Error('Failed to create budget');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  async getBudgets(filters?: any): Promise<Budget[]> {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${this.baseURL}/budgets?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    try {
      const response = await fetch(`${this.baseURL}/budgets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update budget');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  async deleteBudget(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/budgets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }

  // Reporting methods
  async generateReport(type: string, filters: any): Promise<FinancialReport> {
    try {
      const response = await fetch(`${this.baseURL}/reports/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async exportReport(reportId: string, format: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseURL}/reports/${reportId}/export?format=${format}`);

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  // Analytics methods
  async getFinancialMetrics(period: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/metrics?period=${period}`);

      if (!response.ok) {
        throw new Error('Failed to fetch financial metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching financial metrics:', error);
      throw error;
    }
  }

  async getCashFlowData(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/cashflow?start=${startDate}&end=${endDate}`);

      if (!response.ok) {
        throw new Error('Failed to fetch cash flow data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cash flow data:', error);
      throw error;
    }
  }

  async getROIData(projectId?: string): Promise<any> {
    try {
      const url = projectId 
        ? `${this.baseURL}/roi/${projectId}`
        : `${this.baseURL}/roi`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch ROI data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching ROI data:', error);
      throw error;
    }
  }
}

export const financeService = FinanceService.getInstance();