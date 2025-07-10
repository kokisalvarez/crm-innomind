import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Search, Save, Send, Copy, Calculator } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Quote, QuoteItem, Product, Prospect } from '../../types';
import { format } from 'date-fns';

interface QuoteFormProps {
  onClose: () => void;
  editingQuote?: Quote | null;
  preselectedProspect?: Prospect | null;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ onClose, editingQuote, preselectedProspect }) => {
  const { 
    prospects, 
    products, 
    quoteTemplates, 
    companySettings, 
    addQuote, 
    updateQuote, 
    calculateQuoteTotal 
  } = useCRM();

  const [formData, setFormData] = useState({
    prospectId: preselectedProspect?.id || editingQuote?.prospectId || '',
    fecha: editingQuote ? format(editingQuote.fecha, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    vigencia: editingQuote ? format(editingQuote.vigencia, 'yyyy-MM-dd') : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    condicionesPago: editingQuote?.condicionesPago || companySettings.condicionesPagoDefault,
    notasAdicionales: editingQuote?.notasAdicionales || '',
    terminosCondiciones: editingQuote?.terminosCondiciones || companySettings.terminosCondicionesDefault,
    metodosPago: editingQuote?.metodosPago || companySettings.metodosPagoDefault,
    descuentoGlobal: editingQuote?.descuentoGlobal || 0,
    tipoDescuentoGlobal: editingQuote?.tipoDescuentoGlobal || 'porcentaje' as 'porcentaje' | 'monto',
    iva: editingQuote?.iva || companySettings.iva
  });

  const [items, setItems] = useState<QuoteItem[]>(
    editingQuote?.items || []
  );

  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const filteredProducts = products.filter(product => 
    product.estado === 'activo' &&
    (product.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
     product.descripcion.toLowerCase().includes(productSearch.toLowerCase()) ||
     product.categoria.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const calculateItemSubtotal = (item: QuoteItem) => {
    const subtotal = item.cantidad * item.precioUnitario;
    let descuentoAplicado = 0;
    
    if (item.tipoDescuento === 'porcentaje') {
      descuentoAplicado = subtotal * (item.descuento / 100);
    } else {
      descuentoAplicado = item.descuento;
    }
    
    return subtotal - descuentoAplicado;
  };

  const updateItemSubtotal = (index: number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, subtotal: calculateItemSubtotal(item) } : item
    ));
  };

  const addItem = (product?: Product) => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      productId: product?.id,
      nombre: product?.nombre || '',
      descripcion: product?.descripcion || '',
      cantidad: 1,
      precioUnitario: product?.precio || 0,
      descuento: 0,
      tipoDescuento: 'porcentaje',
      subtotal: product?.precio || 0
    };
    
    setItems(prev => [...prev, newItem]);
    setShowProductSearch(false);
    setProductSearch('');
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        updatedItem.subtotal = calculateItemSubtotal(updatedItem);
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const applyTemplate = (templateId: string) => {
    const template = quoteTemplates.find(t => t.id === templateId);
    if (template) {
      const templateItems: QuoteItem[] = template.items.map((item, index) => ({
        ...item,
        id: (Date.now() + index).toString(),
        subtotal: calculateItemSubtotal(item as QuoteItem)
      }));
      
      setItems(templateItems);
      setFormData(prev => ({
        ...prev,
        condicionesPago: template.condicionesPago,
        notasAdicionales: template.notasAdicionales,
        terminosCondiciones: template.terminosCondiciones,
        metodosPago: template.metodosPago
      }));
      setShowTemplates(false);
    }
  };

  const { subtotal, total } = calculateQuoteTotal(
    items, 
    formData.descuentoGlobal, 
    formData.tipoDescuentoGlobal, 
    formData.iva
  );

  const handleSubmit = (estado: Quote['estado'] = 'Borrador') => {
    if (!formData.prospectId || items.length === 0) {
      alert('Por favor selecciona un cliente y agrega al menos un item');
      return;
    }

    const quoteData = {
      prospectId: formData.prospectId,
      fecha: new Date(formData.fecha),
      vigencia: new Date(formData.vigencia),
      items,
      subtotal,
      descuentoGlobal: formData.descuentoGlobal,
      tipoDescuentoGlobal: formData.tipoDescuentoGlobal,
      iva: formData.iva,
      total,
      estado,
      condicionesPago: formData.condicionesPago,
      notasAdicionales: formData.notasAdicionales,
      terminosCondiciones: formData.terminosCondiciones,
      metodosPago: formData.metodosPago,
      creadoPor: 'Usuario Actual'
    };

    if (editingQuote) {
      updateQuote(editingQuote.id, quoteData);
    } else {
      addQuote(quoteData);
    }

    onClose();
  };

  const selectedProspect = prospects.find(p => p.id === formData.prospectId);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {editingQuote ? 'Editar Cotización' : 'Nueva Cotización'}
            </h2>
            <p className="text-gray-600">
              {editingQuote ? `Editando ${editingQuote.numero}` : 'Crear una nueva propuesta comercial'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {!editingQuote && (
            <button
              onClick={() => setShowTemplates(true)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Usar Plantilla
            </button>
          )}
          <button
            onClick={() => handleSubmit('Borrador')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Guardar Borrador
          </button>
          <button
            onClick={() => handleSubmit('Enviada')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Enviar Cotización
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <select
                  value={formData.prospectId}
                  onChange={(e) => setFormData(prev => ({ ...prev, prospectId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {prospects.map(prospect => (
                    <option key={prospect.id} value={prospect.id}>
                      {prospect.nombre} - {prospect.telefono}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Emisión
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vigencia
                </label>
                <input
                  type="date"
                  value={formData.vigencia}
                  onChange={(e) => setFormData(prev => ({ ...prev, vigencia: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IVA (%)
                </label>
                <input
                  type="number"
                  value={formData.iva}
                  onChange={(e) => setFormData(prev => ({ ...prev, iva: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Items de la Cotización</h3>
              <button
                onClick={() => setShowProductSearch(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Item
              </button>
            </div>

            {/* Product Search Modal */}
            {showProductSearch && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-96 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Seleccionar Producto/Servicio</h4>
                    <button
                      onClick={() => setShowProductSearch(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar productos o servicios..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => addItem()}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">+ Producto/Servicio Personalizado</div>
                      <div className="text-sm text-gray-500">Crear un item personalizado</div>
                    </button>
                    
                    {filteredProducts.map(product => (
                      <button
                        key={product.id}
                        onClick={() => addItem(product)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{product.nombre}</div>
                            <div className="text-sm text-gray-500">{product.descripcion}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {product.categoria} • {product.unidadMedida}
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-blue-600">
                            ${product.precio.toLocaleString()}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
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
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subtotal
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium">
                          ${item.subtotal.toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="ml-2 p-2 text-red-600 hover:text-red-800 transition-colors"
                        title="Eliminar item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay items agregados</p>
                  <p className="text-sm">Haz clic en "Agregar Item" para comenzar</p>
                </div>
              )}
            </div>

            {/* Global Discount */}
            {items.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descuento Global
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        value={formData.descuentoGlobal}
                        onChange={(e) => setFormData(prev => ({ ...prev, descuentoGlobal: Number(e.target.value) }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                      <select
                        value={formData.tipoDescuentoGlobal}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipoDescuentoGlobal: e.target.value as 'porcentaje' | 'monto' }))}
                        className="px-2 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="porcentaje">%</option>
                        <option value="monto">$</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
            
            <div className="space-y-4">
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
                  rows={3}
                  placeholder="Información adicional, aclaraciones, etc."
                />
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
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          {selectedProspect && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Nombre:</span>
                  <p className="text-sm text-gray-900">{selectedProspect.nombre}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Teléfono:</span>
                  <p className="text-sm text-gray-900">{selectedProspect.telefono}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Correo:</span>
                  <p className="text-sm text-gray-900">{selectedProspect.correo}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Interés:</span>
                  <p className="text-sm text-gray-900">{selectedProspect.servicioInteres}</p>
                </div>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium">${subtotal.toLocaleString()}</span>
              </div>
              {formData.descuentoGlobal > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Descuento Global:</span>
                  <span className="text-sm font-medium text-red-600">
                    -{formData.tipoDescuentoGlobal === 'porcentaje' 
                      ? `${formData.descuentoGlobal}%` 
                      : `$${formData.descuentoGlobal.toLocaleString()}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">IVA ({formData.iva}%):</span>
                <span className="text-sm font-medium">
                  ${((subtotal - (formData.tipoDescuentoGlobal === 'porcentaje' 
                    ? subtotal * (formData.descuentoGlobal / 100) 
                    : formData.descuentoGlobal)) * (formData.iva / 100)).toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-blue-600">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Empresa</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{companySettings.nombre}</p>
              <p className="text-gray-600">{companySettings.direccion}</p>
              <p className="text-gray-600">{companySettings.telefono}</p>
              <p className="text-gray-600">{companySettings.correo}</p>
              <p className="text-gray-600">RFC: {companySettings.rfc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-96 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Seleccionar Plantilla</h4>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {quoteTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template.id)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{template.nombre}</div>
                  <div className="text-sm text-gray-500 mt-1">{template.descripcion}</div>
                  <div className="text-xs text-gray-400 mt-2">
                    {template.items.length} items • Creado por {template.creadoPor}
                  </div>
                </button>
              ))}
              
              {quoteTemplates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay plantillas disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteForm;