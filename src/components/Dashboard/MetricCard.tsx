import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  clickable?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  onClick,
  clickable = false 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-500 bg-blue-50',
    green: 'bg-green-500 text-green-500 bg-green-50',
    yellow: 'bg-yellow-500 text-yellow-500 bg-yellow-50',
    red: 'bg-red-500 text-red-500 bg-red-50',
    purple: 'bg-purple-500 text-purple-500 bg-purple-50'
  };

  const [bgColor, textColor, lightBg] = colorClasses[color].split(' ');

  const cardClasses = `bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 ${
    clickable 
      ? 'hover:shadow-md hover:scale-105 cursor-pointer hover:border-blue-300' 
      : 'hover:shadow-md'
  }`;

  const CardContent = () => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs último mes</span>
          </div>
        )}
      </div>
      <div className={`${lightBg} p-3 rounded-lg`}>
        <Icon className={`h-8 w-8 ${textColor}`} />
      </div>
    </div>
  );

  if (clickable && onClick) {
    return (
      <div className={cardClasses} onClick={onClick}>
        <CardContent />
      </div>
    );
  }

  return (
    <div className={cardClasses}>
      <CardContent />
    </div>
  );
};

export default MetricCard;