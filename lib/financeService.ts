// project/lib/financeService.ts

import {
  Transaction,
  Invoice,
  Budget,
  FinancialReport
} from '../src/types/finance';  // ← Cambio: apuntar a src/types

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
  async createTransaction(
    transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Transaction> {
    const response = await fetch(`${this.baseURL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    if (!response.ok) throw new Error('Failed to create transaction');
    return response.json();
  }

  async getTransactions(filters?: any): Promise<Transaction[]> {
    const qs = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    const response = await fetch(`${this.baseURL}/transactions${qs}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  }

  async updateTransaction(
    id: string,
    updates: Partial<Transaction>
  ): Promise<Transaction> {
    const response = await fetch(
      `${this.baseURL}/transactions/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }
    );
    if (!response.ok) throw new Error('Failed to update transaction');
    return response.json();
  }

  async deleteTransaction(id: string): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/transactions/${id}`,
      { method: 'DELETE' }
    );
    if (!response.ok) throw new Error('Failed to delete transaction');
  }

  // Invoice methods
  async createInvoice(
    invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Invoice> {
    const response = await fetch(`${this.baseURL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice)
    });
    if (!response.ok) throw new Error('Failed to create invoice');
    return response.json();
  }

  async getInvoices(filters?: any): Promise<Invoice[]> {
    const qs = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    const response = await fetch(`${this.baseURL}/invoices${qs}`);
    if (!response.ok) throw new Error('Failed to fetch invoices');
    return response.json();
  }

  async updateInvoice(
    id: string,
    updates: Partial<Invoice>
  ): Promise<Invoice> {
    const response = await fetch(
      `${this.baseURL}/invoices/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }
    );
    if (!response.ok) throw new Error('Failed to update invoice');
    return response.json();
  }

  async deleteInvoice(id: string): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/invoices/${id}`,
      { method: 'DELETE' }
    );
    if (!response.ok) throw new Error('Failed to delete invoice');
  }

  // Budget methods
  async createBudget(
    budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Budget> {
    const response = await fetch(`${this.baseURL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget)
    });
    if (!response.ok) throw new Error('Failed to create budget');
    return response.json();
  }

  async getBudgets(filters?: any): Promise<Budget[]> {
    const qs = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    const response = await fetch(`${this.baseURL}/budgets${qs}`);
    if (!response.ok) throw new Error('Failed to fetch budgets');
    return response.json();
  }

  async updateBudget(
    id: string,
    updates: Partial<Budget>
  ): Promise<Budget> {
    const response = await fetch(
      `${this.baseURL}/budgets/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }
    );
    if (!response.ok) throw new Error('Failed to update budget');
    return response.json();
  }

  async deleteBudget(id: string): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/budgets/${id}`,
      { method: 'DELETE' }
    );
    if (!response.ok) throw new Error('Failed to delete budget');
  }

  // Reporting methods
  async generateReport(
    type: string,
    filters: any
  ): Promise<FinancialReport> {
    const response = await fetch(
      `${this.baseURL}/reports/${type}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      }
    );
    if (!response.ok) throw new Error('Failed to generate report');
    return response.json();
  }

  async exportReport(reportId: string, format: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseURL}/reports/${reportId}/export?format=${format}`
    );
    if (!response.ok) throw new Error('Failed to export report');
    return response.blob();
  }

  // Analytics methods
  async getFinancialMetrics(period: string): Promise<any> {
    const response = await fetch(
      `${this.baseURL}/metrics?period=${period}`
    );
    if (!response.ok) throw new Error('Failed to fetch financial metrics');
    return response.json();
  }

  async getCashFlowData(
    startDate: string,
    endDate: string
  ): Promise<any> {
    const response = await fetch(
      `${this.baseURL}/cashflow?start=${startDate}&end=${endDate}`
    );
    if (!response.ok) throw new Error('Failed to fetch cash flow data');
    return response.json();
  }

  async getROIData(projectId?: string): Promise<any> {
    const url = projectId
      ? `${this.baseURL}/roi/${projectId}`
      : `${this.baseURL}/roi`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch ROI data');
    return response.json();
  }
}

export const financeService = FinanceService.getInstance();
