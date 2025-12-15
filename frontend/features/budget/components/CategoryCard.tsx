import React from 'react';
import { Trash2, Lock, Unlock, AlertTriangle, ChevronDown, PieChart as PieChartIcon, Loader2 } from 'lucide-react';
import { BudgetAnalysis } from '../hooks/useBudgetAnalysis';

const CategoryCard: React.FC<{
  item: BudgetAnalysis;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  deleting: boolean;
}> = ({ item, isExpanded, onToggle, onDelete, deleting }) => {

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-3xl p-6 border transition-all duration-300 hover:shadow-lg cursor-pointer group ${item.isOverspent
          ? 'border-red-100 dark:border-red-900/30'
          : item.isWarning
          ? 'border-yellow-100 dark:border-yellow-900/30'
          : 'border-gray-100 dark:border-gray-700'
        }`}
      onClick={onToggle}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.isOverspent ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
            }`}>
            <PieChartIcon size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{item.category}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {item.type === 'Fixed' ? <Lock size={10} /> : <Unlock size={10} />}
              <span>{item.type}</span>
              {item.isRollover && <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px]">Rollover</span>}
            </div>
          </div>
        </div>
        <button
          onClick={e => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this budget?')) onDelete();
          }}
          className="text-gray-300 hover:text-red-500 transition-colors p-1"
          disabled={deleting}
        >
          {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className={`${item.isOverspent ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              ${item.spent.toLocaleString()}
            </span>
            <span className="text-gray-500 dark:text-gray-400">/ ${item.limit.toLocaleString()}</span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${item.isOverspent ? 'bg-red-500' : item.isWarning ? 'bg-yellow-500' : 'bg-indigo-600'}`}
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-xs">
          {item.isOverspent ? (
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
              <AlertTriangle size={14} />
              <span>Overspent by ${Math.abs(item.remaining).toLocaleString()}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <span>{item.remaining.toLocaleString()} remaining</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
            Details <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Recent Transactions</h4>
          <div className="space-y-2">
            {txs.length ? (
              txs.slice(0, 3).map(t => (
                <div key={t.id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.date}</p>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">${Math.abs(t.amount)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">No transactions this month.</p>
            )}
            {txs.length > 3 && (
              <p className="text-center text-xs text-indigo-500 mt-2 font-medium">View all</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryCard;