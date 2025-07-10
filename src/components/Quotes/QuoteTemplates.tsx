import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Copy, FileText, Eye } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { QuoteTemplate } from '../../types';
import { format } from 'date-fns';

const QuoteTemplates: React.FC = () => {
  const { quoteTemplates, addQuoteTemplate, updateQuoteTemplate, deleteQuoteTemplate, products } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuoteTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<QuoteTemplate | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    condicionesPago: '',
    notasAdicionales: '',
    terminosCondiciones: '',
    metodosPago: [] as string[]
  });

  const [templateItems, setTemplateItems] = useState<Omit<QuoteTemplate['items'][0], 'id'>[]>([]);

  const filteredTemplates = quoteTemplates.filter(template =>
    template.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      condicionesPago: '',
      notasAdicionales: '',
      terminosCondiciones: '',
      metodosPago: []
    });
    setTemplateItems([]);
    setEditingTemplate(null);
    setShowForm(false);
  };

  const handleEdit = (template: QuoteTemplate) => {
    setFormData({
      nombre: template.nombre,
      descripcion: template.descripcion,
      condicionesPago: template.condicionesPago,
      notasAdicionales: template.notasAdicionales,
      terminosCondiciones: template.terminosCondiciones,
      metodosPago: template.metodosPago
    });
    setTemplateItems(template.items);
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (templateItems.length === 0) {
      alert('Agrega al menos un item a la plantilla');
      return;
    }

    const templateData = {
      ...formData,
      items: templateItems,
      creadoPor: 'Usuario Actual'
    };

    if (editingTemplate) {
      updateQuoteTemplate(editingTemplate.id, templateData);
    } else {
      addQuoteTemplate(templateData);
    }

    resetForm();
  };

  const addItem = () => {
    const newItem = {
      nombre: '',
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      descuento: 0,
      tipoDescuento: 'porcentaje' as 'porcentaje' | 'monto',
      subtotal: 0
    };
    setTemplateItems(prev => [...prev, newItem]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    setTemplateItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate subtotal
        const subtotal = updatedItem.cantidad * updatedItem.precioUnitario;
        let descuentoAplicado = 0;
        
        if (updatedItem.tipoDescuento === 'porcentaje') {
          descuentoAplicado = subtotal * (updatedItem.descuento / 100);
        } else {
          descuentoAplicado = updatedItem.descuento;
        }
        
        updatedItem.subtotal = subtotal - descuentoAplicado;
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (index: number) => {
    setTemplateItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta plantilla?')) {
      deleteQuoteTemplate(id);
    }
  };

  const duplicateTemplate = (template: QuoteTemplate) => {
    const duplicatedTemplate = {
      ...template,
      nombre: `${template.nombre} (Copia)`,
      creadoPor: 'Usuario Actual'
    };
    delete (duplicatedTemplate as any).id;
    delete (duplicatedTemplate as any).fechaCreacion;
    
    addQuoteTemplate(duplicatedTemplate);
  };

  if (viewingTemplate) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setViewingTemplate(null)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
            >
              ← Volver
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{viewingTemplate.nombre}</h2>
              <p className="text-gray-600">{viewingTemplate.descripcion}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(viewingTemplate)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={() => duplicateTemplate(viewingTemplate)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Duplicar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Items de la Plantilla</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-700">Descripción</th>
                  <th className="text-center py-3 text-sm font-medium text-gray-700">Cantidad</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-700">Precio Unit.</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-700">Descuento</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-700">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {viewingTemplate.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.nombre}</p>
                        {item.descripcion && (
                          <p className="text-sm text-gray-600 mt-1">{item.descripcion}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-center">{item.cantidad}</td>
                    <td className="py-4 text-right">${item.precioUnitario.toLocaleString()}</td>
                    <td className="py-4 text-right">
                      {item.descuento > 0 && (
                        <span className="text-red-600">
                          -{item.tipoDescuento === 'porcentaje' ? `${item.descuento}%` : `$${item.descuento.toLocaleString()}`}
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right font-medium">${item.subtotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-blue-600">
                    ${viewingTemplate.items.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Condiciones de Pago</h3>
            <p className="text-gray-700">{viewingTemplate.condicionesPago || 'No especificadas'}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pago</h3>
            <div className="flex flex-wrap gap-2">
              {viewingTemplate.metodosPago.map(metodo => (
                <span key={metodo} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                  {metodo}
                </span>
              ))}
            </div>
          </div>

          {viewingTemplate.notasAdicionales && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas Adicionales</h3>
              <p className="text-gray-700">{viewingTemplate.notasAdicionales}</p>
            </div>
          )}

          {viewingTemplate.terminosCondiciones && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Términos y Condiciones</h3>
              <p className="text-gray-700">{viewingTemplate.terminosCondiciones}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plantillas de Cotización</h2>
          <p className="text-gray-600">Crea plantillas reutilizables para agilizar el proceso de cotización</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Plantilla
        </button>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar plantillas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.nombre}</h3>
                <p className="text-sm text-gray-600 mb-2">{template.descripcion}</p>
                <div className="text-xs text-gray-500">
                  {template.items.length} items • Creado por {template.creadoPor}
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total estimado:</span>
                <span className="font-semibold text-gray-900">
                  ${template.items.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Creado:</span>
                <span className="text-gray-900">{format(template.fechaCreacion, 'dd/MM/yyyy')}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setViewingTemplate(template)}
                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Ver
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(template)}
                  className="text-green-600 hover:text-green-800 transition-colors flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => duplicateTemplate(template)}
                  className="text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1"
                >
                  <Copy className="h-4 w-4" />
                  Duplicar
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron plantillas</h3>
          <p className="text-gray-500 mb-4">Crea tu primera plantilla para agilizar el proceso de cotización.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear Primera Plantilla
          </button>
        </div>
      )}

      {/* Template Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto m-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la plantilla *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-md font-semibold text-gray-900">Items de la Plantilla</h5>
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Item
                  </button>
                </div>

                <div className="space-y-4">
                  {templateItems.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Producto/Servicio
                          </label>
                          <input
                            type="text"
                            value={item.nombre}
                            onChange={(e) => updateItem(index, 'nombre', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Nombre del producto"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                          </label>
                          <textarea
                            value={item.descripcion}
                            onChange={(e) => updateItem(index, 'descripcion', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="Descripción detallada"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => updateItem(index, 'cantidad', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            min="1"
                            step="1"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio Unitario
                          </label>
                          <input
                            type="number"
                            value={item.precioUnitario}
                            onChange={(e) => updateItem(index, 'precioUnitario', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descuento
                          </label>
                          <div className="flex">
                            <input
                              type="number"
                              value={item.descuento}
                              onChange={(e) => updateItem(index, 'descuento', Number(e.target.value))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500"
                              min="0"
                              step="0.01"
                            />
                            <select
                              value={item.tipoDescuento}
                              onChange={(e) => updateItem(index, 'tipoDescuento', e.target.value)}
                              className="px-2 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="porcentaje">%</option>
                              <option value="monto">$</option>
                            </select>
                          </div>
                        </div>

                        <div className="md:col-span-1 flex items-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-600 hover:text-red-800 transition-colors"
                            title="Eliminar item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {templateItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay items agregados</p>
                      <p className="text-sm">Haz clic en "Agregar Item" para comenzar</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condiciones de Pago
                  </label>
                  <textarea
                    value={formData.condicionesPago}
                    onChange={(e) => setFormData(prev => ({ ...prev, condicionesPago: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Ej: 50% anticipo, 50% contra entrega"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Adicionales
                  </label>
                  <textarea
                    value={formData.notasAdicionales}
                    onChange={(e) => setFormData(prev => ({ ...prev, notasAdicionales: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Información adicional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Términos y Condiciones
                </label>
                <textarea
                  value={formData.terminosCondiciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, terminosCondiciones: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Términos y condiciones del servicio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Métodos de Pago Aceptados
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Transferencia bancaria', 'PayPal', 'Stripe', 'Tarjeta de crédito', 'Efectivo', 'Cheque'].map(metodo => (
                    <label key={metodo} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.metodosPago.includes(metodo)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              metodosPago: [...prev.metodosPago, metodo]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              metodosPago: prev.metodosPago.filter(m => m !== metodo)
                            }));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{metodo}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-6 border-t">
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
                  {editingTemplate ? 'Actualizar' : 'Crear'} Plantilla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteTemplates;