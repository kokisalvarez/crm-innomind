import React from 'react';
import { useFinance } from '../../context/FinanceContext';

const ROITracker: React.FC = () => {
  const { roiData } = useFinance();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getROIColor = (roi: number) => {
    if (roi >= 100) return 'text-green-600 bg-green-50';
    if (roi >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-4">
      {roiData.map((project) => (
        <div key={project.projectId} className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{project.projectName}</h4>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getROIColor(project.roiPercentage)}`}>
              {project.roiPercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Inversión</p>
              <p className="font-medium">{formatCurrency(project.investment)}</p>
            </div>
            <div>
              <p className="text-gray-600">Ingresos</p>
              <p className="font-medium">{formatCurrency(project.revenue)}</p>
            </div>
            <div>
              <p className="text-gray-600">Beneficio</p>
              <p className="font-medium">{formatCurrency(project.profit)}</p>
            </div>
          </div>
          
          {/* ROI Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${project.roiPercentage >= 100 ? 'bg-green-500' : 
                  project.roiPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(project.roiPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
      
      {roiData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay datos de ROI disponibles</p>
          <p className="text-sm">Completa algunos proyectos para ver el seguimiento de ROI</p>
        </div>
      )}
    </div>
  );
};

export default ROITracker;