import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StatMetric } from '../types';

const StatCard: React.FC<StatMetric> = ({ label, value, trend, trendDirection, prefix }) => {
  const isPositive = trendDirection === 'up';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">{label}</h3>
        <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-gray-400 transition-colors cursor-pointer">
          <ArrowUpRight size={16} />
        </div>
      </div>
      
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {prefix}{value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
        
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
            isPositive 
              ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
              : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}%
          </div>
          <span className="text-xs text-gray-400">vs last month</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;