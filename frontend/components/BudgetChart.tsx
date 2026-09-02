import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BudgetCategory } from '../types';
import { ArrowUpRight } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { cur } from '../utils/currency';

interface BudgetChartProps {
  data: BudgetCategory[];
}

const BudgetChart: React.FC<BudgetChartProps> = ({ data }) => {
  const { navigate } = useNavigation();
  const total = data.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm h-full flex flex-col transition-colors duration-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Budget</h3>
        <button
          onClick={() => navigate('budget')}
          aria-label="Go to budget"
          className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-gray-400 transition-colors"
        >
          <ArrowUpRight size={16} />
        </button>
      </div>

      {data.length > 0 ? (
        <div className="flex flex-1 items-center justify-center min-h-[200px]">
          <div className="relative w-[200px] h-[200px] md:w-full md:max-w-[280px] xl:max-w-[320px] md:h-auto md:aspect-square">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="73%"
                outerRadius="95%"
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={40} />
                ))}
                </Pie>
                <Tooltip
                  allowEscapeViewBox={{ x: false, y: false }}
                  offset={12}
                  wrapperStyle={{ pointerEvents: 'none', zIndex: 10 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, #fff)' }}
                />
            </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-gray-400 font-medium">Total for month</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{cur()}{total.toLocaleString()}</span>
            </div>
             {/* Floating Label Simulation (like image) */}
             <div className="absolute top-0 left-0 bg-white dark:bg-gray-700 p-2 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 text-xs hidden sm:block transform -translate-x-2 -translate-y-2">
                <p className="text-gray-400 dark:text-gray-300">{(data[0].value / total * 100).toFixed(0)}%</p>
                <p className="font-bold text-gray-900 dark:text-white">{cur()}{data[0].value}</p>
             </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">No budget data set.</p>
        </div>
      )}
    </div>
  );
};

export default BudgetChart;
