import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  FileText,
  PieChart,
  Calendar,
  CreditCard
} from 'lucide-react';
import MetricCard from './MetricCard';
import CashFlowChart from './CashFlowChart';
import ROITracker from './ROITracker';
import PaymentAlerts from './PaymentAlerts';
import QuickActions from './QuickActions';

const FinanceDashboard: React.FC = () => {
  const { metrics, alerts } = useFinance();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const unreadAlerts = alerts.filter(alert => !alert.read);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Finanzas</h1>
          <p className="text-gray-600 mt-2">Monitorea tu rendimiento financiero y métricas</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Año</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Alerts */}
      {unreadAlerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Tienes {unreadAlerts.length} alerta{unreadAlerts.length > 1 ? 's' : ''} sin leer
            </span>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ingresos Totales"
          value={formatCurrency(metrics.totalRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
          trend={metrics.monthlyGrowth}
          trendLabel="vs mes anterior"
          color="green"
        />
        <MetricCard
          title="Gastos Totales"
          value={formatCurrency(metrics.totalExpenses)}
          icon={<CreditCard className="w-6 h-6" />}
          trend={-5.2}
          trendLabel="vs mes anterior"
          color="red"
        />
        <MetricCard
          title="Beneficio Neto"
          value={formatCurrency(metrics.netProfit)}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={metrics.netProfit > 0 ? 15.3 : -8.1}
          trendLabel="vs mes anterior"
          color={metrics.netProfit > 0 ? "green" : "red"}
        />
        <MetricCard
          title="Pagos Pendientes"
          value={formatCurrency(metrics.pendingPayments)}
          icon={<FileText className="w-6 h-6" />}
          trend={0}
          trendLabel="esperando pago"
          color="orange"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Flujo de Efectivo</h3>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>
          <CashFlowChart />
        </div>

        {/* ROI Tracker */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">ROI por Proyecto</h3>
            <TrendingUp className="w-5 h-5 text-gray-500" />
          </div>
          <ROITracker />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Alerts */}
        <div className="lg:col-span-2">
          <PaymentAlerts />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;