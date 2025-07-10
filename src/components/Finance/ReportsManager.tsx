import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Download, FileText, PieChart, TrendingUp, Calendar } from 'lucide-react';

const ReportsManager: React.FC = () => {
  const { transactions, invoices, budgets, exportReport } = useFinance();
  const [selectedReport, setSelectedReport] = useState('income');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [exportFormat, setExportFormat] = useState('pdf');

  const reportTypes = [
    { id: 'income', name: 'Reporte de Ingresos', icon: TrendingUp, color: 'bg-green-500' },
    { id: 'expense', name: 'Reporte de Gastos', icon: TrendingUp, color: 'bg-red-500' },
    { id: 'balance', name: 'Balance General', icon: PieChart, color: 'bg-blue-500' },
    { id: 'roi', name: 'Análisis ROI', icon: TrendingUp, color: 'bg-purple-500' },
    { id: 'cashflow', name: 'Flujo de Efectivo', icon: FileText, color: 'bg-orange-500' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getReportData = () => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    switch (selectedReport) {
      case 'income':
        return {
          title: 'Reporte de Ingresos',
          data: filteredTransactions.filter(t => t.type === 'income'),
          summary: {
            total: filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
            count: filteredTransactions.filter(t => t.type === 'income').length
          }
        };
      case 'expense':
        return {
          title: 'Reporte de Gastos',
          data: filteredTransactions.filter(t => t.type === 'expense'),
          summary: {
            total: filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
            count: filteredTransactions.filter(t => t.type === 'expense').length
          }
        };
      case 'balance':
        const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return {
          title: 'Balance General',
          data: { income, expense, balance: income - expense },
          summary: {
            total: income - expense,
            count: filteredTransactions.length
          }
        };
      default:
        return {
          title: 'Reporte',
          data: filteredTransactions,
          summary: {
            total: 0,
            count: filteredTransactions.length
          }
        };
    }
  };

  const reportData = getReportData();

  const handleExport = () => {
    exportReport(selectedReport, exportFormat);
  };

  const generateQuickReport = (type: string) => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    setDateRange({
      start: thirtyDaysAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    });
    setSelectedReport(type);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reportes Financieros</h2>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Reporte</span>
        </button>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => generateQuickReport(report.id)}
              className={`p-4 rounded-lg text-white hover:opacity-90 transition-opacity ${report.color}`}
            >
              <Icon className="w-6 h-6 mb-2" />
              <h3 className="font-semibold text-sm">{report.name}</h3>
              <p className="text-xs opacity-90">Últimos 30 días</p>
            </button>
          );
        })}
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración del Reporte</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Reporte</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formato de Exportación</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{reportData.title}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(dateRange.start).toLocaleDateString('es-MX')} - {new Date(dateRange.end).toLocaleDateString('es-MX')}</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800">Monto Total</h4>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(reportData.summary.total)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Total de Transacciones</h4>
            <p className="text-2xl font-bold text-green-900">{reportData.summary.count}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800">Monto Promedio</h4>
            <p className="text-2xl font-bold text-purple-900">
              {formatCurrency(reportData.summary.count > 0 ? reportData.summary.total / reportData.summary.count : 0)}
            </p>
          </div>
        </div>

        {/* Report Data */}
        {selectedReport === 'balance' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Ingresos Totales</span>
              <span className="text-green-600 font-bold">{formatCurrency(reportData.data.income)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Gastos Totales</span>
              <span className="text-red-600 font-bold">{formatCurrency(reportData.data.expense)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <span className="font-bold text-blue-800">Balance Neto</span>
              <span className={`font-bold ${reportData.data.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(reportData.data.balance)}
              </span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(reportData.data) && reportData.data.map((transaction: any) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                        {getStatusText(transaction.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {Array.isArray(reportData.data) && reportData.data.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No hay datos disponibles para el período seleccionado</p>
                <p className="text-sm">Intenta ajustar el rango de fechas o el tipo de reporte</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsManager;