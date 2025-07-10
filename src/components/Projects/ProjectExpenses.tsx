import React, { useState } from 'react';
import { Plus, Receipt, DollarSign, Calendar, CheckCircle, Clock, Edit, Trash2, Download } from 'lucide-react';
import { Project, ProjectExpense } from '../../types/projects';
import { useProjects } from '../../context/ProjectContext';
import { format } from 'date-fns';

interface ProjectExpensesProps {
  project: Project;
}

const ProjectExpenses: React.FC<ProjectExpensesProps> = ({ project }) => {
  const { addExpense, updateExpense, deleteExpense } = useProjects();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ProjectExpense | null>(null);
  const [filterCategory, setFilterCategory] = useState<ProjectExpense['category'] | 'all'>('all');
  const [formData, setFormData] = useState({
    description: '',
    category: 'tools' as ProjectExpense['category'],
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    vendor: '',
    billable: true,
    receipt: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expenseData = {
      description: formData.description,
      category: formData.category,
      amount: formData.amount,
      date: new Date(formData.date),
      vendor: formData.vendor,
      receipt: formData.receipt,
      billable: formData.billable,
      approved: false,
      approvedBy: undefined
    };

    if (editingExpense) {
      updateExpense(project.id, editingExpense.id, expenseData);
    } else {
      addExpense(project.id, expenseData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      description: '',
      category: 'tools',
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      vendor: '',
      billable: true,
      receipt: ''
    });
    setShowAddForm(false);
    setEditingExpense(null);
  };

  const handleEdit = (expense: ProjectExpense) => {
    setFormData({
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      date: format(expense.date, 'yyyy-MM-dd'),
      vendor: expense.vendor,
      billable: expense.billable,
      receipt: expense.receipt || ''
    });
    setEditingExpense(expense);
    setShowAddForm(true);
  };

  const handleDelete = (expenseId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      deleteExpense(project.id, expenseId);
    }
  };

  const handleApprovalChange = (expense: ProjectExpense, approved: boolean) => {
    updateExpense(project.id, expense.id, {
      approved,
      approvedBy: approved ? 'Usuario Actual' : undefined
    });
  };

  const getCategoryColor = (category: ProjectExpense['category']) => {
    const colors = {
      'license': 'bg-blue-100 text-blue-800',
      'subscription': 'bg-purple-100 text-purple-800',
      'hosting': 'bg-green-100 text-green-800',
      'tools': 'bg-yellow-100 text-yellow-800',
      'travel': 'bg-orange-100 text-orange-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[category];
  };

  const getCategoryIcon = (category: ProjectExpense['category']) => {
    const icons = {
      'license': '📄',
      'subscription': '🔄',
      'hosting': '🌐',
      'tools': '🔧',
      'travel': '✈️',
      'other': '📦'
    };
    return icons[category];
  };

  const filteredExpenses = project.expenses.filter(expense => 
    filterCategory === 'all' || expense.category === filterCategory
  ).sort((a, b) => b.date.getTime() - a.date.getTime());

  const totalExpenses = project.expenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedExpenses = project.expenses.filter(e => e.approved).reduce((sum, e) => sum + e.amount, 0);
  const billableExpenses = project.expenses.filter(e => e.billable).reduce((sum, e) => sum + e.amount, 0);
  const pendingApproval = project.expenses.filter(e => !e.approved).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Gastos</p>
              <p className="text-2xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aprobados</p>
              <p className="text-2xl font-bold text-green-600">${approvedExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Facturables</p>
              <p className="text-2xl font-bold text-purple-600">${billableExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingApproval}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Gastos del Proyecto</h3>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ProjectExpense['category'] | 'all')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg"
          >
            <option value="all">Todas las categorías</option>
            <option value="license">Licencias</option>
            <option value="subscription">Suscripciones</option>
            <option value="hosting">Hosting</option>
            <option value="tools">Herramientas</option>
            <option value="travel">Viajes</option>
            <option value="other">Otros</option>
          </select>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Gasto
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Licencia Adobe Creative Suite"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ProjectExpense['category'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="license">Licencia</option>
                  <option value="subscription">Suscripción</option>
                  <option value="hosting">Hosting</option>
                  <option value="tools">Herramientas</option>
                  <option value="travel">Viajes</option>
                  <option value="other">Otros</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor
                </label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del proveedor"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recibo/Factura (URL)
                </label>
                <input
                  type="url"
                  value={formData.receipt}
                  onChange={(e) => setFormData(prev => ({ ...prev, receipt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="billable"
                  checked={formData.billable}
                  onChange={(e) => setFormData(prev => ({ ...prev, billable: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <label htmlFor="billable" className="text-sm font-medium text-gray-700">
                  Facturable al cliente
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingExpense ? 'Actualizar' : 'Crear'} Gasto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{getCategoryIcon(expense.category)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                        {expense.vendor && (
                          <div className="text-sm text-gray-500">{expense.vendor}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${expense.amount.toLocaleString()}</div>
                    {expense.billable && (
                      <div className="text-xs text-green-600">Facturable</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(expense.date, 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={expense.approved}
                        onChange={(e) => handleApprovalChange(expense, e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        expense.approved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {expense.approved ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </div>
                    {expense.approvedBy && (
                      <div className="text-xs text-gray-500 mt-1">por {expense.approvedBy}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {expense.receipt && (
                        <a
                          href={expense.receipt}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-900 transition-colors"
                          title="Ver recibo"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                      
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Editar gasto"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay gastos {filterCategory !== 'all' ? `de categoría "${filterCategory}"` : ''} para este proyecto</p>
            <p className="text-sm">Registra gastos para hacer seguimiento del presupuesto</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectExpenses;