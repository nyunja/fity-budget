import React from 'react';

export const MetricCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: 'green' | 'red';
    trend: string;
  }> = ({ title, value, icon, color, trend }) => {
    const colorClasses = {
      green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
      red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' }
    };
  
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between h-40">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">{title}</span>
          <div className={`p-2 ${colorClasses[color].bg} rounded-full ${colorClasses[color].text}`}>
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">${value.toLocaleString()}</h3>
          <p className={`text-xs ${colorClasses[color].text} mt-1 font-medium`}>{trend}</p>
        </div>
      </div>
    );
  };