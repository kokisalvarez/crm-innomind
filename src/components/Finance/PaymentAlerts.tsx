import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { AlertTriangle, Clock, TrendingUp, X } from 'lucide-react';

const PaymentAlerts: React.FC = () => {
  const { alerts, markAlertAsRead } = useFinance();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'upcoming':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'budget_exceeded':
        return <TrendingUp className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertBorderColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Alertas de Pagos</h3>
        <span className="text-sm text-gray-500">
          {alerts.filter(a => !a.read).length} sin leer
        </span>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 border-l-4 ${getAlertBorderColor(alert.priority)} bg-gray-50 rounded-lg ${
              !alert.read ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                      {getPriorityText(alert.priority)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.createdAt).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
              
              {!alert.read && (
                <button
                  onClick={() => markAlertAsRead(alert.id)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                  title="Marcar como leída"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay alertas en este momento</p>
            <p className="text-sm">Verás alertas de pagos y presupuestos aquí</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentAlerts;