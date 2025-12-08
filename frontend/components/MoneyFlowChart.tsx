import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MoneyFlowData } from '../types';
import { ChevronDown } from 'lucide-react';

interface MoneyFlowChartProps {
  data: MoneyFlowData[];
}

const MoneyFlowChart: React.FC<MoneyFlowChartProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm h-full transition-colors duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Money flow</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4 text-xs font-medium">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span className="text-gray-600 dark:text-gray-300">Income</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-200 dark:bg-indigo-900"></span>
                <span className="text-gray-600 dark:text-gray-300">Expense</span>
             </div>
          </div>
          <div className="flex gap-2">
              <button className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                All accounts <ChevronDown size={12} />
              </button>
               <button className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                This year <ChevronDown size={12} />
              </button>
          </div>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
            barGap={8}
          >
            <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                dy={10}
            />
            {/* Hiding YAxis mostly to match clean look, but can be added back */}
            <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, #fff)' }}
                itemStyle={{ color: 'var(--tooltip-text, #111)' }}
            />
            <Bar dataKey="income" fill="#6366F1" radius={[4, 4, 4, 4]} barSize={16} />
            <Bar dataKey="expense" fill="#C7D2FE" radius={[4, 4, 4, 4]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MoneyFlowChart;