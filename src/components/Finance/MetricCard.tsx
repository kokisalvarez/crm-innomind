import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: number;
  trendLabel: string;
  color: 'green' | 'red' | 'blue' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendLabel,
  color
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'red':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'blue':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'orange':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getTrendColor = () => {
    return trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';
  };

  const TrendIcon = trend > 0 ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${getColorClasses()}`}>
          {icon}
        </div>
        {trend !== 0 && (
          <div className={`flex items-center ${getTrendColor()}`}>
            <TrendIcon className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">
              {Math.abs(trend).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      
      <p className="text-sm text-gray-500">{trendLabel}</p>
    </div>
  );
};

export default MetricCard;