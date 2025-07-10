import React from 'react';
import { Plus, FileText, CreditCard, PieChart, Download } from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    {
      name: 'Agregar Transacción',
      icon: <Plus className="w-5 h-5" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => console.log('Agregar transacción')
    },
    {
      name: 'Crear Factura',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => console.log('Crear factura')
    },
    {
      name: 'Registrar Pago',
      icon: <CreditCard className="w-5 h-5" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => console.log('Registrar pago')
    },
    {
      name: 'Crear Presupuesto',
      icon: <PieChart className="w-5 h-5" />,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => console.log('Crear presupuesto')
    },
    {
      name: 'Exportar Reporte',
      icon: <Download className="w-5 h-5" />,
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: () => console.log('Exportar reporte')
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
      
      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-white transition-colors ${action.color}`}
          >
            {action.icon}
            <span className="font-medium">{action.name}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Actividad Reciente</h4>
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            <p>• Factura INV-2024-001 pagada</p>
            <p className="text-xs text-gray-500">hace 2 horas</p>
          </div>
          <div className="text-sm text-gray-600">
            <p>• Nuevo gasto agregado: $21,600 MXN</p>
            <p className="text-xs text-gray-500">hace 5 horas</p>
          </div>
          <div className="text-sm text-gray-600">
            <p>• Presupuesto actualizado: Q1 2024</p>
            <p className="text-xs text-gray-500">hace 1 día</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;