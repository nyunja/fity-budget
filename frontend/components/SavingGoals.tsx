import React from 'react';
import { SavingGoal } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface SavingGoalsProps {
  data: SavingGoal[];
}

const SavingGoals: React.FC<SavingGoalsProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm h-full transition-colors duration-200">
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Saving goals</h3>
        <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-900 dark:hover:border-gray-400 transition-colors">
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="space-y-6">
        {data.length > 0 ? (
          data.map((goal) => {
            const target = goal.target || 0;
            const current = goal.current || 0;
            const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
            return (
                <div key={goal.id}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{goal.name}</span>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">${target.toLocaleString()}</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="h-8 w-full bg-gray-50 dark:bg-gray-700 rounded-lg relative overflow-hidden flex items-center px-2">
                         {/* Filled Part */}
                        <div 
                            className={`absolute left-0 top-0 bottom-0 bg-indigo-600 dark:bg-indigo-900 opacity-20 rounded-lg transition-all duration-1000`} 
                            style={{ width: `${percentage}%` }}
                        ></div>
                         {/* Solid Indicator Bar */}
                         <div 
                            className={`absolute left-0 top-0 bottom-0 bg-indigo-600 dark:bg-indigo-900 rounded-lg transition-all duration-1000`}
                            style={{ width: `${percentage * 0.8}%` }} // Visual trick to match design where bar isn't full width of bg
                         ></div>
                         
                         {/* Percentage Label inside bar */}
                        <span className="relative z-10 text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">{percentage}%</span>
                    </div>
                </div>
            );
        })
        ) : (
           <p className="text-sm text-gray-400 text-center py-4">No saving goals yet.</p>
        )}
      </div>
    </div>
  );
};

export default SavingGoals;