import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Plus, Edit2, Trash2, AlertTriangle, Target } from 'lucide-react';

const BudgetManager: React.FC = () => {
  const { budgets, addBudget, updateBudget, deleteBudget } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'exceeded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'exceeded':
        return 'Excedido';
      default:
        return status;
    }
  };

  const getPeriodText = (period: string) => {
    switch (period) {
      case 'monthly':
        return 'Mensual';
      case 'quarterly':
        return 'Trimestral';
      case 'yearly':
        return 'Anual';
      default:
        return period;
    }
  };

  const getBudgetUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
      deleteBudget(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Presupuestos</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Presupuesto</span>
        </button>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const usagePercentage = (budget.spent / budget.totalBudget) * 100;
          const isOverBudget = budget.spent > budget.totalBudget;
          
          return (
            <div key={budget.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                  <p className="text-sm text-gray-600">
                    {getPeriodText(budget.period)} • {new Date(budget.startDate).toLocaleDateString('es-MX')} - {new Date(budget.endDate).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(budget.status)}`}>
                    {getStatusText(budget.status)}
                  </span>
                  {isOverBudget && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>

              {/* Budget Overview */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Presupuesto Total:</span>
                  <span className="font-medium">{formatCurrency(budget.totalBudget)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gastado:</span>
                  <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatCurrency(budget.spent)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Restante:</span>
                  <span className={`font-medium ${budget.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(budget.remaining)}
                  </span>
                </div>
              </div>

              {/* Usage Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Uso</span>
                  <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                    {usagePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getBudgetUsageColor(usagePercentage)}`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Categorías</h4>
                <div className="space-y-2">
                  {budget.categories.map((category) => {
                    const categoryUsage = (category.spent / category.allocated) * 100;
                    return (
                      <div key={category.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{category.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-900">{formatCurrency(category.spent)}</span>
                          <span className="text-gray-500">/</span>
                          <span className="text-gray-600">{formatCurrency(category.allocated)}</span>
                          <div className="w-12 bg-gray-200 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full ${getBudgetUsageColor(categoryUsage)}`}
                              style={{ width: `${Math.min(categoryUsage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Editar Presupuesto"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar Presupuesto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">
                  Ver Detalles
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No se encontraron presupuestos</p>
          <p className="text-sm">Crea tu primer presupuesto para comenzar a rastrear gastos</p>
        </div>
      )}
    </div>
  );
};

export default BudgetManager;