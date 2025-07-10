import React from 'react';
import { Users, MessageSquare, FileText, TrendingUp, Instagram, Facebook } from 'lucide-react';
import MetricCard from './MetricCard';
import { useCRM } from '../../context/CRMContext';

interface DashboardProps {
  onNavigate?: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { dashboardMetrics } = useCRM();

  const handleProspectsClick = () => {
    if (onNavigate) {
      onNavigate('prospects');
    }
  };

  const handleQuotesClick = () => {
    if (onNavigate) {
      onNavigate('quotes');
    }
  };

  const handleKanbanClick = () => {
    if (onNavigate) {
      onNavigate('kanban');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Prospectos"
          value={dashboardMetrics.totalProspectos}
          icon={Users}
          color="blue"
          trend={{ value: 12, isPositive: true }}
          clickable={true}
          onClick={handleProspectsClick}
        />
        <MetricCard
          title="Cotizaciones Generadas"
          value={dashboardMetrics.cotizacionesGeneradas}
          icon={FileText}
          color="green"
          trend={{ value: 8, isPositive: true }}
          clickable={true}
          onClick={handleQuotesClick}
        />
        <MetricCard
          title="Ventas Cerradas"
          value={dashboardMetrics.ventasCerradas}
          icon={TrendingUp}
          color="purple"
          trend={{ value: 15, isPositive: true }}
          clickable={true}
          onClick={handleKanbanClick}
        />
        <MetricCard
          title="Tasa de Conversión"
          value={`${dashboardMetrics.tasaConversion.toFixed(1)}%`}
          icon={TrendingUp}
          color="yellow"
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prospects by Platform */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Prospectos por Plataforma</h3>
            <button 
              onClick={handleProspectsClick}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-gray-700">WhatsApp</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-900 mr-2">
                  {dashboardMetrics.prospectosPorPlataforma.WhatsApp || 0}
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((dashboardMetrics.prospectosPorPlataforma.WhatsApp || 0) / dashboardMetrics.totalProspectos) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Instagram className="h-5 w-5 text-pink-500 mr-2" />
                <span className="text-gray-700">Instagram</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-900 mr-2">
                  {dashboardMetrics.prospectosPorPlataforma.Instagram || 0}
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((dashboardMetrics.prospectosPorPlataforma.Instagram || 0) / dashboardMetrics.totalProspectos) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Facebook className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-gray-700">Facebook</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-900 mr-2">
                  {dashboardMetrics.prospectosPorPlataforma.Facebook || 0}
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((dashboardMetrics.prospectosPorPlataforma.Facebook || 0) / dashboardMetrics.totalProspectos) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prospects by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Prospectos por Estado</h3>
            <button 
              onClick={handleKanbanClick}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Ver embudo
            </button>
          </div>
          <div className="space-y-3">
            {Object.entries(dashboardMetrics.prospectosPorEstado).map(([estado, cantidad]) => {
              const statusColors: Record<string, string> = {
                'Nuevo': 'bg-blue-500',
                'Contactado': 'bg-yellow-500',
                'En seguimiento': 'bg-orange-500',
                'Cotizado': 'bg-purple-500',
                'Venta cerrada': 'bg-green-500',
                'Perdido': 'bg-red-500'
              };
              
              return (
                <div key={estado} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${statusColors[estado]} mr-2`}></div>
                    <span className="text-gray-700">{estado}</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{cantidad}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleProspectsClick}
            className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <Users className="h-6 w-6 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-blue-700">Gestionar Prospectos</span>
          </button>
          
          <button 
            onClick={handleQuotesClick}
            className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <FileText className="h-6 w-6 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-green-700">Nueva Cotización</span>
          </button>
          
          <button 
            onClick={handleKanbanClick}
            className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
          >
            <TrendingUp className="h-6 w-6 text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-purple-700">Ver Embudo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;