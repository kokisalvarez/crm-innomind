export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatPercentage = (value: number, decimals: number = 1) => {
  return `${value.toFixed(decimals)}%`;
};

export const calculateROI = (investment: number, revenue: number) => {
  if (investment === 0) return 0;
  const profit = revenue - investment;
  const roi = (profit / investment) * 100;
  return {
    profit,
    roi,
    roiPercentage: roi
  };
};

export const calculateTaxAmount = (amount: number, taxRate: number = 0.1) => {
  return amount * taxRate;
};

export const generateInvoiceNumber = (prefix: string = 'INV', date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-4);
  
  return `${prefix}-${year}${month}${day}-${timestamp}`;
};

export const calculateDueDate = (issueDate: Date, paymentTerms: number = 30) => {
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + paymentTerms);
  return dueDate;
};

export const isOverdue = (dueDate: string | Date) => {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
};

export const getDaysBetween = (startDate: string | Date, endDate: string | Date) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const calculateCashFlow = (transactions: any[], startDate: string, endDate: string) => {
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
  });

  const cashFlow = filteredTransactions.reduce((flow, transaction) => {
    const date = transaction.date;
    const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
    
    if (!flow[date]) {
      flow[date] = { income: 0, expense: 0, balance: 0 };
    }
    
    if (transaction.type === 'income') {
      flow[date].income += transaction.amount;
    } else {
      flow[date].expense += transaction.amount;
    }
    
    flow[date].balance = flow[date].income - flow[date].expense;
    
    return flow;
  }, {} as any);

  return Object.entries(cashFlow).map(([date, data]: [string, any]) => ({
    date,
    income: data.income,
    expense: data.expense,
    balance: data.balance,
    cumulativeBalance: data.balance // This would need to be calculated properly with running totals
  }));
};

export const generateFinancialSummary = (transactions: any[], invoices: any[], budgets: any[]) => {
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  
  const totalIncome = completedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = completedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netProfit = totalIncome - totalExpenses;
  
  const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + i.total, 0);
  
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  
  const activeBudgets = budgets.filter(b => b.status === 'active');
  const totalBudgetAllocated = activeBudgets.reduce((sum, b) => sum + b.totalBudget, 0);
  const totalBudgetSpent = activeBudgets.reduce((sum, b) => sum + b.spent, 0);
  
  return {
    totalIncome,
    totalExpenses,
    netProfit,
    pendingAmount,
    pendingInvoicesCount: pendingInvoices.length,
    overdueInvoicesCount: overdueInvoices.length,
    totalBudgetAllocated,
    totalBudgetSpent,
    budgetUtilization: totalBudgetAllocated > 0 ? (totalBudgetSpent / totalBudgetAllocated) * 100 : 0
  };
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const validateFinancialData = (data: any) => {
  const errors: string[] = [];
  
  if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
    errors.push('Amount must be a positive number');
  }
  
  if (!data.date || new Date(data.date) > new Date()) {
    errors.push('Date cannot be in the future');
  }
  
  if (!data.category || data.category.trim() === '') {
    errors.push('Category is required');
  }
  
  if (!data.description || data.description.trim() === '') {
    errors.push('Description is required');
  }
  
  return errors;
};

export const categorizeExpenses = (transactions: any[]) => {
  const categories = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0, transactions: [] };
      }
      acc[category].total += transaction.amount;
      acc[category].count += 1;
      acc[category].transactions.push(transaction);
      return acc;
    }, {} as any);
  
  return Object.entries(categories).map(([category, data]: [string, any]) => ({
    category,
    total: data.total,
    count: data.count,
    percentage: 0, // This would be calculated based on total expenses
    transactions: data.transactions
  }));
};

export const predictCashFlow = (historicalData: any[], daysAhead: number = 30) => {
  // Simple linear regression for cash flow prediction
  // This is a basic implementation - in production, you'd use more sophisticated methods
  
  if (historicalData.length < 2) return [];
  
  const dates = historicalData.map(d => new Date(d.date).getTime());
  const balances = historicalData.map(d => d.cumulativeBalance);
  
  // Calculate trend
  const n = dates.length;
  const sumX = dates.reduce((sum, x) => sum + x, 0);
  const sumY = balances.reduce((sum, y) => sum + y, 0);
  const sumXY = dates.reduce((sum, x, i) => sum + x * balances[i], 0);
  const sumXX = dates.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Generate predictions
  const predictions = [];
  const lastDate = new Date(Math.max(...dates));
  
  for (let i = 1; i <= daysAhead; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);
    const futureTimestamp = futureDate.getTime();
    const predictedBalance = slope * futureTimestamp + intercept;
    
    predictions.push({
      date: futureDate.toISOString().split('T')[0],
      predictedBalance,
      confidence: Math.max(0, Math.min(100, 100 - (i * 2))) // Decreasing confidence over time
    });
  }
  
  return predictions;
};