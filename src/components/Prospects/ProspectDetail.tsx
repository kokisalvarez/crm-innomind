import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  User, 
  FileText,
  Plus,
  Edit,
  Clock
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useUsers } from '../../context/UserContext';
import { format } from 'date-fns';
import { ProspectStatus } from '../../types';

const ProspectDetail: React.FC = () => {
  const { selectedProspect, selectProspect, updateProspect, addFollowUp } = useCRM();
  const { users } = useUsers();
  const [newNote, setNewNote] = useState('');
  const [editingStatus, setEditingStatus] = useState(false);

  if (!selectedProspect) {
    return null;
  }

  const handleAddFollowUp = () => {
    if (newNote.trim()) {
      addFollowUp(selectedProspect.id, newNote.trim());
      setNewNote('');
    }
  };

  const handleStatusChange = (newStatus: ProspectStatus) => {
    updateProspect(selectedProspect.id, { estado: newStatus });
    setEditingStatus(false);
  };

  const getStatusColor = (status: ProspectStatus) => {
    const colors = {
      'Nuevo': 'bg-blue-100 text-blue-800 border-blue-200',
      'Contactado': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'En seguimiento': 'bg-orange-100 text-orange-800 border-orange-200',
      'Cotizado': 'bg-purple-100 text-purple-800 border-purple-200',
      'Venta cerrada': 'bg-green-100 text-green-800 border-green-200',
      'Perdido': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status];
  };

  const openWhatsApp = () => {
    const cleanPhone = selectedProspect.telefono.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.nombre} ${user.apellido}` : userId;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => selectProspect(null)}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a la lista
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prospect Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedProspect.nombre}</h1>
                <p className="text-gray-600">{selectedProspect.servicioInteres}</p>
              </div>
              <div className="flex items-center space-x-2">
                {editingStatus ? (
                  <select
                    value={selectedProspect.estado}
                    onChange={(e) => handleStatusChange(e.target.value as ProspectStatus)}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    onBlur={() => setEditingStatus(false)}
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Contactado">Contactado</option>
                    <option value="En seguimiento">En seguimiento</option>
                    <option value="Cotizado">Cotizado</option>
                    <option value="Venta cerrada">Venta cerrada</option>
                    <option value="Perdido">Perdido</option>
                  </select>
                ) : (
                  <button
                    onClick={() => setEditingStatus(true)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(selectedProspect.estado)}`}
                  >
                    {selectedProspect.estado}
                    <Edit className="h-3 w-3 ml-1" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <Phone className="h-5 w-5 mr-2" />
                <span>{selectedProspect.telefono}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="h-5 w-5 mr-2" />
                <span>{selectedProspect.correo || 'No proporcionado'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Contacto: {format(selectedProspect.fechaContacto, 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <User className="h-5 w-5 mr-2" />
                <span>Responsable: {getUserName(selectedProspect.responsable)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={openWhatsApp}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </button>
              <button
                onClick={() => window.open(`tel:${selectedProspect.telefono}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Phone className="h-4 w-4 mr-2" />
                Llamar
              </button>
              <button
                onClick={() => window.open(`mailto:${selectedProspect.correo}`)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </button>
            </div>
          </div>

          {/* Notes */}
          {selectedProspect.notasInternas && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Notas Internas</h3>
              <p className="text-gray-600">{selectedProspect.notasInternas}</p>
            </div>
          )}

          {/* Follow-up Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Timeline de Seguimiento</h3>
            
            {/* Add new follow-up */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Agregar nueva nota de seguimiento..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddFollowUp}
                  disabled={!newNote.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Seguimiento
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {selectedProspect.seguimientos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay seguimientos registrados</p>
                </div>
              ) : (
                selectedProspect.seguimientos.map((seguimiento, index) => (
                  <div key={seguimiento.id} className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      {index < selectedProspect.seguimientos.length - 1 && (
                        <div className="w-0.5 h-16 bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{seguimiento.usuario}</span>
                        <span className="text-sm text-gray-500">
                          {format(seguimiento.fecha, 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-gray-700">{seguimiento.nota}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Plataforma:</span>
                <span className="font-medium">{selectedProspect.plataforma}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seguimientos:</span>
                <span className="font-medium">{selectedProspect.seguimientos.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cotizaciones:</span>
                <span className="font-medium">{selectedProspect.cotizaciones.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Último contacto:</span>
                <span className="font-medium">
                  {selectedProspect.ultimoSeguimiento 
                    ? format(selectedProspect.ultimoSeguimiento, 'dd/MM')
                    : 'Nunca'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Quotes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Cotizaciones</h3>
              <button className="text-blue-600 hover:text-blue-800 transition-colors">
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            {selectedProspect.cotizaciones.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <FileText className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay cotizaciones</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedProspect.cotizaciones.map((cotizacion) => (
                  <div key={cotizacion.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">
                        ${cotizacion.total.toLocaleString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        cotizacion.estado === 'Aceptada' ? 'bg-green-100 text-green-800' :
                        cotizacion.estado === 'Rechazada' ? 'bg-red-100 text-red-800' :
                        cotizacion.estado === 'Enviada' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {cotizacion.estado}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {format(cotizacion.fecha, 'dd/MM/yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProspectDetail;