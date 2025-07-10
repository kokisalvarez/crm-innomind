import React from 'react';
import { useFinance } from '../../context/FinanceContext';

const CashFlowChart: React.FC = () => {
  const { cashFlowData } = useFinance();

  // Simple bar chart implementation
  const maxValue = Math.max(...cashFlowData.map(d => Math.abs(d.balance)));
  const chartHeight = 200;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Flujo de Efectivo Diario</span>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Positivo</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Negativo</span>
          </div>
        </div>
      </div>
      
      <div className="relative" style={{ height: chartHeight }}>
        <div className="absolute inset-0 flex items-end justify-between">
          {cashFlowData.slice(0, 7).map((data, index) => {
            const height = Math.abs(data.balance) / maxValue * chartHeight;
            const isPositive = data.balance >= 0;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`w-8 ${isPositive ? 'bg-green-500' : 'bg-red-500'} rounded-t-sm`}
                  style={{ height: `${height}px` }}
                  title={`${data.date}: $${data.balance.toLocaleString('es-MX')}`}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {new Date(data.date).getDate()}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Zero line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gray-300"></div>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">Últimos 7 días</p>
      </div>
    </div>
  );
};

export default CashFlowChart;