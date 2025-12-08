import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BudgetCategory } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface BudgetChartProps {
  data: BudgetCategory[];
}

const BudgetChart: React.FC<BudgetChartProps> = ({ data }) => {
  const total = data.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm h-full flex flex-col transition-colors duration-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Budget</h3>
        <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-gray-400 transition-colors">
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center flex-1">
        <div className="flex-1 space-y-3 w-full pr-0 md:pr-4">
          {data.length > 0 ? (
            data.map((item, index) => (
               <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-gray-600 dark:text-gray-300 flex-1">{item.name}</span>
               </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No budget data set.</p>
          )}
        </div>
        
        <div className="relative w-[180px] h-[180px] mt-4 md:mt-0 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={40} />
                ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, #fff)' }}
                />
            </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-gray-400 font-medium">Total for month</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">${total.toLocaleString()}</span>
            </div>
             {/* Floating Label Simulation (like image) */}
             {data.length > 0 && (
               <div className="absolute top-0 left-0 bg-white dark:bg-gray-700 p-2 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 text-xs hidden sm:block transform -translate-x-2 -translate-y-2">
                  <p className="text-gray-400 dark:text-gray-300">{(data[0].value / total * 100).toFixed(0)}%</p>
                  <p className="font-bold text-gray-900 dark:text-white">${data[0].value}</p>
               </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default BudgetChart;