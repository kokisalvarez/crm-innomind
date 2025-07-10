// src/components/Quotes/QuoteManager.tsx

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  FileText,
  Download,
  Send,
  Clock
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Quote } from '../../types';
import { format } from 'date-fns';
import QuoteForm from './QuoteForm';
import QuoteDetail from './QuoteDetail';

// safeFormat: devuelve '-' si falta valor o es inválido
const safeFormat = (value: any, fmt = 'dd/MM/yyyy') => {
  if (!value) return '-';
  let dateObj;
  if (value instanceof Date) {
    dateObj = value;
  } else if (value && typeof value.toDate === 'function') {
    dateObj = value.toDate();
  } else {
    dateObj = new Date(value);
  }
  return isNaN(dateObj.getTime()) ? '-' : format(dateObj, fmt);
};

interface QuoteManagerProps {
  navigationParams?: {
    quoteId?: string;
    showDetail?: boolean;
    selectedQuote?: Quote;
  };
}

const QuoteManager: React.FC<QuoteManagerProps> = ({ navigationParams }) => {
  const { quotes, prospects, deleteQuote } = useCRM();

  const [searchTerm, setSearchTerm]             = useState('');
  const [statusFilter, setStatusFilter]         = useState<Quote['estado'] | 'all'>('all');
  const [showQuoteForm, setShowQuoteForm]       = useState(false);
  const [selectedQuote, setSelectedQuote]       = useState<Quote | null>(null);
  const [editingQuote, setEditingQuote]         = useState<Quote | null>(null);
  const [highlightedQuoteId, setHighlightedQuoteId] = useState<string | null>(null);

  // manejar params de navegación
  useEffect(() => {
    if (navigationParams?.quoteId && navigationParams.showDetail) {
      const allQ = [...quotes, ...prospects.flatMap(p => p.cotizaciones)];
      const q = allQ.find(x => x.id === navigationParams.quoteId);
      if (q) {
        setSelectedQuote(q);
        setHighlightedQuoteId(q.id);
        setTimeout(() => setHighlightedQuoteId(null), 3000);
      }
    } else if (navigationParams?.selectedQuote) {
      const q = navigationParams.selectedQuote;
      setSelectedQuote(q);
      setHighlightedQuoteId(q.id);
      setTimeout(() => setHighlightedQuoteId(null), 3000);
    }
  }, [navigationParams, quotes, prospects]);

  const allQuotes = [...quotes, ...prospects.flatMap(p => p.cotizaciones)];

  const filteredQuotes = allQuotes.filter(quote => {
    const prospect = prospects.find(p => p.id === quote.prospectId);
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (quote.numero || '').toLowerCase().includes(term) ||
      (prospect?.nombre || '').toLowerCase().includes(term) ||
      quote.items.some(i => (i.nombre || '').toLowerCase().includes(term));
    const matchesStatus = statusFilter === 'all' || quote.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Quote['estado']) => ({
    Borrador: 'bg-gray-100 text-gray-800',
    Enviada:  'bg-blue-100 text-blue-800',
    Aceptada: 'bg-green-100 text-green-800',
    Rechazada:'bg-red-100 text-red-800',
    Vencida:  'bg-orange-100 text-orange-800'
  }[status] || '');

  const getStatusIcon = (status: Quote['estado']) => {
    const map = {
      Borrador: Clock,
      Enviada:  Send,
      Aceptada: FileText,
      Rechazada: Trash2,
      Vencida:   Clock
    };
    const Icon = map[status];
    return <Icon className="h-4 w-4" />;
  };

  const handleDeleteQuote = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta cotización?')) deleteQuote(id);
  };
  const handleEditQuote = (q: Quote) => {
    setEditingQuote(q);
    setShowQuoteForm(true);
  };
  const handleCloseForm = () => {
    setEditingQuote(null);
    setShowQuoteForm(false);
  };

  if (showQuoteForm) {
    return <QuoteForm onClose={handleCloseForm} editingQuote={editingQuote} />;
  }
  if (selectedQuote) {
    return <QuoteDetail quote={selectedQuote} onClose={() => setSelectedQuote(null)} onEdit={() => handleEditQuote(selectedQuote)} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Cotizaciones</h2>
          <p className="text-gray-600">Administra todas las propuestas</p>
        </div>
        <button
          onClick={() => setShowQuoteForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Nueva Cotización
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
            className="pl-10 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 px-3 py-2"
        >
          <option value="all">Todos</option>
          <option value="Borrador">Borrador</option>
          <option value="Enviada">Enviada</option>
          <option value="Aceptada">Aceptada</option>
          <option value="Rechazada">Rechazada</option>
          <option value="Vencida">Vencida</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Cotizaciones</p>
            <p className="text-2xl font-bold">{allQuotes.length}</p>
          </div>
          <FileText className="h-8 w-8 text-blue-500" />
        </div>
        <div className="bg-white p-4 border rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Valor Total</p>
            <p className="text-2xl font-bold">
              ${allQuotes.reduce((s, q) => s + q.total, 0).toLocaleString()}
            </p>
          </div>
          <Download className="h-8 w-8 text-green-500" />
        </div>
        <div className="bg-white p-4 border rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Aceptadas</p>
            <p className="text-2xl font-bold">{allQuotes.filter(q => q.estado === 'Aceptada').length}</p>
          </div>
          <FileText className="h-8 w-8 text-green-500" />
        </div>
        <div className="bg-white p-4 border rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tasa Aceptación</p>
            <p className="text-2xl font-bold">
              {allQuotes.length
                ? ((allQuotes.filter(q => q.estado === 'Aceptada').length / allQuotes.length) * 100).toFixed(1)
                : '0.0'}%
            </p>
          </div>
          <FileText className="h-8 w-8 text-purple-500" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-auto border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha / Vence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredQuotes.map(q => {
              const prospect = prospects.find(p => p.id === q.prospectId);
              const fecha    = safeFormat(q.fecha);
              const vence    = safeFormat(q.vigencia);
              const isExpired= new Date() > new Date(q.vigencia) && q.estado === 'Enviada';

              return (
                <tr
                  key={q.id}
                  className={`hover:bg-gray-50 ${
                    highlightedQuoteId === q.id ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{q.numero || 'Sin número'}</div>
                    <div className="text-sm text-gray-500">{q.items.length} ítem{q.items.length!==1 && 's'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{prospect?.nombre || 'Cliente desconocido'}</div>
                    <div className="text-sm text-gray-500">{prospect?.correo || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="">{fecha}</div>
                    <div className={`${isExpired?'text-red-600':'text-gray-500'} text-sm`}>
                      Vence: {vence}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">${q.total.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full gap-1 ${
                      isExpired ? 'bg-orange-100 text-orange-800' : getStatusColor(q.estado)
                    }`}>
                      {getStatusIcon(isExpired?'Vencida':q.estado)}
                      {isExpired?'Vencida':q.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setSelectedQuote(q)} className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleEditQuote(q)} className="text-green-600 hover:text-green-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-900">
                        <Download className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteQuote(q.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuoteManager;
