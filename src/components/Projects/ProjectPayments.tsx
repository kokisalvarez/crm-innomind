import React, { useState } from 'react';
import { Plus, DollarSign, Calendar, CheckCircle, Clock, AlertTriangle, Edit, Trash2, FileText } from 'lucide-react';
import { Project, PaymentSchedule } from '../../types/projects';
import { useProjects } from '../../context/ProjectContext';
import { format } from 'date-fns';

interface ProjectPaymentsProps {
  project: Project;
}

const ProjectPayments: React.FC<ProjectPaymentsProps> = ({ project }) => {
  const { addPayment, updatePayment, deletePayment, generateInvoice } = useProjects();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentSchedule | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    dueDate: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentData = {
      description: formData.description,
      amount: formData.amount,
      dueDate: new Date(formData.dueDate),
      status: 'pending' as const,
      notes: formData.notes
    };

    if (editingPayment) {
      updatePayment(project.id, editingPayment.id, paymentData);
    } else {
      addPayment(project.id, paymentData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      dueDate: '',
      notes: ''
    });
    setShowAddForm(false);
    setEditingPayment(null);
  };

  const handleEdit = (payment: PaymentSchedule) => {
    setFormData({
      description: payment.description,
      amount: payment.amount,
      dueDate: format(payment.dueDate, 'yyyy-MM-dd'),
      notes: payment.notes
    });
    setEditingPayment(payment);
    setShowAddForm(true);
  };

  const handleDelete = (paymentId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este pago?')) {
      deletePayment(project.id, paymentId);
    }
  };

  const handleStatusChange = (payment: PaymentSchedule, newStatus: PaymentSchedule['status']) => {
    const updates: Partial<PaymentSchedule> = { status: newStatus };
    
    if (newStatus === 'paid' && !payment.paidDate) {
      updates.paidDate = new Date();
    } else if (newStatus !== 'paid') {
      updates.paidDate = undefined;
    }

    updatePayment(project.id, payment.id, updates);
  };

  const handleGenerateInvoice = (payment: PaymentSchedule) => {
    try {
      const invoice = generateInvoice(project.id, payment.id);
      alert(`Factura ${invoice.number} generada exitosamente`);
    } catch (error) {
      alert('Error al generar la factura');
    }
  };

  const getStatusColor = (status: PaymentSchedule['status']) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  };

  const getStatusIcon = (status: PaymentSchedule['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-400" />;
    }
  };

  const totalAmount = project.paymentSchedule.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = project.paymentSchedule
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = totalAmount - paidAmount;

  const sortedPayments = [...project.paymentSchedule].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total del Proyecto</p>
              <p className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pagado</p>
              <p className="text-2xl font-bold text-green-600">${paidAmount.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendiente</p>
              <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progreso de Pagos</span>
          <span className="font-medium">{totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-green-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Cronograma de Pagos</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Pago
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {editingPayment ? 'Editar Pago' : 'Nuevo Pago'}
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
                  placeholder="Ej: Anticipo 50%, Pago final"
                  required
                />
              </div>

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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Vencimiento *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Notas adicionales sobre el pago"
              />
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
                {editingPayment ? 'Actualizar' : 'Crear'} Pago
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Vencimiento
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
              {sortedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(payment.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{payment.description}</div>
                        {payment.invoiceNumber && (
                          <div className="text-sm text-gray-500">Factura: {payment.invoiceNumber}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${payment.amount.toLocaleString()}</div>
                    {payment.paymentMethod && (
                      <div className="text-sm text-gray-500">{payment.paymentMethod}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{format(payment.dueDate, 'dd/MM/yyyy')}</div>
                    {payment.paidDate && (
                      <div className="text-sm text-green-600">Pagado: {format(payment.paidDate, 'dd/MM/yyyy')}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={payment.status}
                      onChange={(e) => handleStatusChange(payment, e.target.value as PaymentSchedule['status'])}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-semibold ${getStatusColor(payment.status)}`}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="paid">Pagado</option>
                      <option value="overdue">Vencido</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => handleGenerateInvoice(payment)}
                          className="text-purple-600 hover:text-purple-900 transition-colors"
                          title="Generar factura"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleEdit(payment)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Editar pago"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(payment.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar pago"
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

        {sortedPayments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay pagos programados para este proyecto</p>
            <p className="text-sm">Agrega un cronograma de pagos para hacer seguimiento</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPayments;