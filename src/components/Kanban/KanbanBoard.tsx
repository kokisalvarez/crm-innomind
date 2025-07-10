import React, { useState } from 'react';
import { ProspectStatus, Prospect } from '../../types';
import { useCRM } from '../../context/CRMContext';
import { format } from 'date-fns';
import { Phone, Mail, MessageSquare, User } from 'lucide-react';

const KanbanBoard: React.FC = () => {
  const { prospects, updateProspect, selectProspect } = useCRM();
  const [draggedProspect, setDraggedProspect] = useState<Prospect | null>(null);

  const statuses: ProspectStatus[] = [
    'Nuevo',
    'Contactado', 
    'En seguimiento',
    'Cotizado',
    'Venta cerrada',
    'Perdido'
  ];

  const getStatusColor = (status: ProspectStatus) => {
    const colors = {
      'Nuevo': 'bg-blue-50 border-blue-200',
      'Contactado': 'bg-yellow-50 border-yellow-200',
      'En seguimiento': 'bg-orange-50 border-orange-200',
      'Cotizado': 'bg-purple-50 border-purple-200',
      'Venta cerrada': 'bg-green-50 border-green-200',
      'Perdido': 'bg-red-50 border-red-200'
    };
    return colors[status];
  };

  const getStatusHeaderColor = (status: ProspectStatus) => {
    const colors = {
      'Nuevo': 'bg-blue-600',
      'Contactado': 'bg-yellow-600',
      'En seguimiento': 'bg-orange-600',
      'Cotizado': 'bg-purple-600',
      'Venta cerrada': 'bg-green-600',
      'Perdido': 'bg-red-600'
    };
    return colors[status];
  };

  const getProspectsForStatus = (status: ProspectStatus) => {
    return prospects.filter(p => p.estado === status);
  };

  const handleDragStart = (e: React.DragEvent, prospect: Prospect) => {
    setDraggedProspect(prospect);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: ProspectStatus) => {
    e.preventDefault();
    if (draggedProspect && draggedProspect.estado !== newStatus) {
      updateProspect(draggedProspect.id, { estado: newStatus });
    }
    setDraggedProspect(null);
  };

  const handleDragEnd = () => {
    setDraggedProspect(null);
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const getPlatformEmoji = (platform: string) => {
    const emojis = {
      'WhatsApp': '💬',
      'Instagram': '📷',
      'Facebook': '📘'
    };
    return emojis[platform as keyof typeof emojis] || '📱';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Embudo de Ventas</h2>
        <p className="text-gray-600">Arrastra los prospectos entre las columnas para cambiar su estado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto min-h-[600px]">
        {statuses.map((status) => {
          const statusProspects = getProspectsForStatus(status);
          
          return (
            <div
              key={status}
              className={`flex flex-col min-w-80 rounded-lg border-2 ${getStatusColor(status)} transition-colors duration-200`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              {/* Column Header */}
              <div className={`${getStatusHeaderColor(status)} text-white p-4 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{status}</h3>
                  <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                    {statusProspects.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 p-3 space-y-3 min-h-32">
                {statusProspects.map((prospect) => (
                  <div
                    key={prospect.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, prospect)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow duration-200 ${
                      draggedProspect?.id === prospect.id ? 'opacity-50 transform rotate-2' : ''
                    }`}
                  >
                    {/* Prospect Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {prospect.nombre}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {prospect.servicioInteres}
                        </p>
                      </div>
                      <span className="text-lg ml-2">
                        {getPlatformEmoji(prospect.plataforma)}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center text-xs text-gray-600">
                        <Phone className="h-3 w-3 mr-1" />
                        <span className="truncate">{prospect.telefono}</span>
                      </div>
                      {prospect.correo && (
                        <div className="flex items-center text-xs text-gray-600">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">{prospect.correo}</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>{prospect.responsable.split(' ')[0]}</span>
                      </div>
                      <span>{format(prospect.fechaContacto, 'dd/MM')}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                      <button
                        onClick={() => selectProspect(prospect)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                      >
                        Ver detalles
                      </button>
                      <button
                        onClick={() => openWhatsApp(prospect.telefono)}
                        className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded transition-colors flex items-center"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        WhatsApp
                      </button>
                    </div>

                    {/* Indicators */}
                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
                      <div className="flex space-x-2">
                        {prospect.seguimientos.length > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                            {prospect.seguimientos.length} seguimientos
                          </span>
                        )}
                        {prospect.cotizaciones.length > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
                            {prospect.cotizaciones.length} cotizaciones
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {statusProspects.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6" />
                    </div>
                    <p className="text-sm">No hay prospectos en esta etapa</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Embudo</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statuses.map((status) => {
            const count = getProspectsForStatus(status).length;
            const percentage = prospects.length > 0 ? (count / prospects.length) * 100 : 0;
            
            return (
              <div key={status} className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${getStatusHeaderColor(status)} flex items-center justify-center`}>
                  <span className="text-white font-bold">{count}</span>
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">{status}</h4>
                <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;