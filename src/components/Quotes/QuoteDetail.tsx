import React, { useState } from 'react';
import { ArrowLeft, Edit, Download, Send, Check, X, Clock, FileText, Mail, Phone, MessageSquare } from 'lucide-react';
import { Quote } from '../../types';
import { useCRM } from '../../context/CRMContext';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QuoteDetailProps {
  quote: Quote;
  onClose: () => void;
  onEdit: () => void;
}

const QuoteDetail: React.FC<QuoteDetailProps> = ({ quote, onClose, onEdit }) => {
  const { prospects, updateQuote, companySettings } = useCRM();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const prospect = prospects.find(p => p.id === quote.prospectId);
  const isExpired = new Date() > quote.vigencia && quote.estado === 'Enviada';

  const getStatusColor = (status: Quote['estado']) => {
    const colors = {
      'Borrador': 'bg-gray-100 text-gray-800',
      'Enviada': 'bg-blue-100 text-blue-800',
      'Aceptada': 'bg-green-100 text-green-800',
      'Rechazada': 'bg-red-100 text-red-800',
      'Vencida': 'bg-orange-100 text-orange-800'
    };
    return colors[status];
  };

  const getStatusIcon = (status: Quote['estado']) => {
    const icons = {
      'Borrador': Clock,
      'Enviada': Send,
      'Aceptada': Check,
      'Rechazada': X,
      'Vencida': Clock
    };
    const Icon = icons[status];
    return <Icon className="h-4 w-4" />;
  };

  const handleStatusChange = (newStatus: Quote['estado']) => {
    updateQuote(quote.id, { 
      estado: newStatus,
      historialCambios: [
        ...quote.historialCambios,
        {
          id: Date.now().toString(),
          fecha: new Date(),
          accion: `Estado cambiado a ${newStatus}`,
          usuario: 'Usuario Actual',
          detalles: `Estado anterior: ${quote.estado}`
        }
      ]
    });
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header with company info
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(companySettings.nombre, 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(companySettings.direccion, 20, yPosition);
      yPosition += 5;
      pdf.text(`Tel: ${companySettings.telefono} | Email: ${companySettings.correo}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`RFC: ${companySettings.rfc}`, 20, yPosition);

      // Quote title and number
      yPosition += 15;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('COTIZACIÓN', 20, yPosition);
      
      pdf.setFontSize(12);
      pdf.text(`No. ${quote.numero}`, pageWidth - 60, yPosition);

      // Client info
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CLIENTE:', 20, yPosition);
      
      yPosition += 7;
      pdf.setFont('helvetica', 'normal');
      pdf.text(prospect?.nombre || 'Cliente no encontrado', 20, yPosition);
      yPosition += 5;
      pdf.text(prospect?.telefono || '', 20, yPosition);
      yPosition += 5;
      pdf.text(prospect?.correo || '', 20, yPosition);

      // Quote dates
      pdf.text(`Fecha: ${format(quote.fecha, 'dd/MM/yyyy')}`, pageWidth - 80, yPosition - 10);
      pdf.text(`Vigencia: ${format(quote.vigencia, 'dd/MM/yyyy')}`, pageWidth - 80, yPosition - 5);

      // Items table
      yPosition += 15;
      
      // Table headers
      pdf.setFont('helvetica', 'bold');
      pdf.text('DESCRIPCIÓN', 20, yPosition);
      pdf.text('CANT.', 120, yPosition);
      pdf.text('PRECIO UNIT.', 140, yPosition);
      pdf.text('SUBTOTAL', 170, yPosition);
      
      yPosition += 5;
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 5;

      // Table items
      pdf.setFont('helvetica', 'normal');
      quote.items.forEach(item => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.text(item.nombre, 20, yPosition);
        pdf.text(item.cantidad.toString(), 120, yPosition);
        pdf.text(`$${item.precioUnitario.toLocaleString()}`, 140, yPosition);
        pdf.text(`$${item.subtotal.toLocaleString()}`, 170, yPosition);
        yPosition += 5;
        
        if (item.descripcion) {
          pdf.setFontSize(8);
          pdf.text(item.descripcion, 20, yPosition);
          pdf.setFontSize(10);
          yPosition += 4;
        }
        yPosition += 2;
      });

      // Totals
      yPosition += 10;
      pdf.line(120, yPosition, pageWidth - 20, yPosition);
      yPosition += 7;

      pdf.setFont('helvetica', 'bold');
      pdf.text(`Subtotal: $${quote.subtotal.toLocaleString()}`, 120, yPosition);
      yPosition += 5;
      
      if (quote.descuentoGlobal > 0) {
        pdf.text(`Descuento: -$${(quote.tipoDescuentoGlobal === 'porcentaje' 
          ? quote.subtotal * (quote.descuentoGlobal / 100) 
          : quote.descuentoGlobal).toLocaleString()}`, 120, yPosition);
        yPosition += 5;
      }
      
      const ivaAmount = (quote.subtotal - (quote.tipoDescuentoGlobal === 'porcentaje' 
        ? quote.subtotal * (quote.descuentoGlobal / 100) 
        : quote.descuentoGlobal)) * (quote.iva / 100);
      
      pdf.text(`IVA (${quote.iva}%): $${ivaAmount.toLocaleString()}`, 120, yPosition);
      yPosition += 5;
      
      pdf.setFontSize(12);
      pdf.text(`TOTAL: $${quote.total.toLocaleString()}`, 120, yPosition);

      // Terms and conditions
      if (quote.terminosCondiciones) {
        yPosition += 15;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TÉRMINOS Y CONDICIONES:', 20, yPosition);
        yPosition += 5;
        pdf.setFont('helvetica', 'normal');
        
        const terms = pdf.splitTextToSize(quote.terminosCondiciones, pageWidth - 40);
        pdf.text(terms, 20, yPosition);
      }

      // Payment conditions
      if (quote.condicionesPago) {
        yPosition += 15;
        pdf.setFont('helvetica', 'bold');
        pdf.text('CONDICIONES DE PAGO:', 20, yPosition);
        yPosition += 5;
        pdf.setFont('helvetica', 'normal');
        pdf.text(quote.condicionesPago, 20, yPosition);
      }

      pdf.save(`Cotizacion-${quote.numero}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const openWhatsApp = () => {
    if (prospect) {
      const cleanPhone = prospect.telefono.replace(/[^\d+]/g, '');
      const message = `Hola ${prospect.nombre}, te envío la cotización ${quote.numero} por un total de $${quote.total.toLocaleString()}. ¿Te gustaría revisar los detalles?`;
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
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
            <h2 className="text-2xl font-bold text-gray-900">Cotización {quote.numero}</h2>
            <p className="text-gray-600">
              Creada el {format(quote.fecha, 'dd/MM/yyyy')} • Vence el {format(quote.vigencia, 'dd/MM/yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full gap-1 ${
            isExpired ? 'bg-orange-100 text-orange-800' : getStatusColor(quote.estado)
          }`}>
            {getStatusIcon(isExpired ? 'Vencida' : quote.estado)}
            {isExpired ? 'Vencida' : quote.estado}
          </span>
          
          <button
            onClick={onEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </button>
          
          <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isGeneratingPDF ? 'Generando...' : 'PDF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company and Client Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">De:</h3>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{companySettings.nombre}</p>
                  <p className="text-gray-600">{companySettings.direccion}</p>
                  <p className="text-gray-600">{companySettings.telefono}</p>
                  <p className="text-gray-600">{companySettings.correo}</p>
                  <p className="text-gray-600">RFC: {companySettings.rfc}</p>
                </div>
              </div>

              {/* Client Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Para:</h3>
                {prospect ? (
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{prospect.nombre}</p>
                    <p className="text-gray-600">{prospect.telefono}</p>
                    <p className="text-gray-600">{prospect.correo}</p>
                    <p className="text-gray-600">Plataforma: {prospect.plataforma}</p>
                    <p className="text-gray-600">Interés: {prospect.servicioInteres}</p>
                  </div>
                ) : (
                  <p className="text-red-600">Cliente no encontrado</p>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items de la Cotización</h3>
            
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
                  {quote.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
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

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${quote.subtotal.toLocaleString()}</span>
                  </div>
                  
                  {quote.descuentoGlobal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Descuento Global:</span>
                      <span className="font-medium text-red-600">
                        -{quote.tipoDescuentoGlobal === 'porcentaje' 
                          ? `${quote.descuentoGlobal}%` 
                          : `$${quote.descuentoGlobal.toLocaleString()}`}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA ({quote.iva}%):</span>
                    <span className="font-medium">
                      ${((quote.subtotal - (quote.tipoDescuentoGlobal === 'porcentaje' 
                        ? quote.subtotal * (quote.descuentoGlobal / 100) 
                        : quote.descuentoGlobal)) * (quote.iva / 100)).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-blue-600">${quote.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
            
            <div className="space-y-4">
              {quote.condicionesPago && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Condiciones de Pago</h4>
                  <p className="text-gray-700">{quote.condicionesPago}</p>
                </div>
              )}
              
              {quote.notasAdicionales && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notas Adicionales</h4>
                  <p className="text-gray-700">{quote.notasAdicionales}</p>
                </div>
              )}
              
              {quote.terminosCondiciones && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Términos y Condiciones</h4>
                  <p className="text-gray-700">{quote.terminosCondiciones}</p>
                </div>
              )}
              
              {quote.metodosPago.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Métodos de Pago Aceptados</h4>
                  <div className="flex flex-wrap gap-2">
                    {quote.metodosPago.map(metodo => (
                      <span key={metodo} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        {metodo}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de la Cotización</h3>
            
            <div className="space-y-2">
              {(['Borrador', 'Enviada', 'Aceptada', 'Rechazada'] as Quote['estado'][]).map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    quote.estado === status 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{status}</span>
                    {quote.estado === status && <Check className="h-4 w-4" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          {prospect && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              
              <div className="space-y-2">
                <button
                  onClick={openWhatsApp}
                  className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Enviar por WhatsApp
                </button>
                
                <button
                  onClick={() => window.open(`mailto:${prospect.correo}?subject=Cotización ${quote.numero}&body=Estimado/a ${prospect.nombre}, adjunto encontrará la cotización solicitada.`)}
                  className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Enviar por Email
                </button>
                
                <button
                  onClick={() => window.open(`tel:${prospect.telefono}`)}
                  className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Llamar Cliente
                </button>
              </div>
            </div>
          )}

          {/* Quote Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Cotización</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Número:</span>
                <span className="font-medium">{quote.numero}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha de creación:</span>
                <span className="font-medium">{format(quote.fechaCreacion, 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Última actualización:</span>
                <span className="font-medium">{format(quote.fechaActualizacion, 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Creado por:</span>
                <span className="font-medium">{quote.creadoPor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Items:</span>
                <span className="font-medium">{quote.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vigencia:</span>
                <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                  {isExpired ? 'Vencida' : 'Vigente'}
                </span>
              </div>
            </div>
          </div>

          {/* History */}
          {quote.historialCambios.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Cambios</h3>
              
              <div className="space-y-3">
                {quote.historialCambios.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="border-l-2 border-blue-200 pl-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{entry.accion}</p>
                        <p className="text-xs text-gray-500">{entry.usuario}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {format(entry.fecha, 'dd/MM HH:mm')}
                      </span>
                    </div>
                    {entry.detalles && (
                      <p className="text-xs text-gray-600 mt-1">{entry.detalles}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteDetail;