import React from 'react';
import { Transaction } from '../types';
import { Youtube, ShoppingBag, Coffee, ChevronDown, DollarSign } from 'lucide-react';

interface TransactionListProps {
  data: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ data }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'YouTube': return <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center"><Youtube size={16} fill="currentColor" /></div>;
      case 'Yaposhka': return <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center"><Coffee size={16} /></div>;
      case 'Salary': 
      case 'Initial Deposit':
        return <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center"><DollarSign size={16} /></div>;
      default: return <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center"><ShoppingBag size={16} /></div>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm h-full transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Recent transactions</h3>
        <div className="flex gap-2">
            <button className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                All accounts <ChevronDown size={12} />
            </button>
            <button className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                See all <ChevronDown size={12} rotate={-90} />
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-indigo-400 uppercase tracking-wider border-b border-gray-50 dark:border-gray-700">
              <th className="pb-3 font-medium pl-2">Date</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Payment Name</th>
              <th className="pb-3 font-medium">Method</th>
              <th className="pb-3 font-medium">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {data.length > 0 ? (
              data.map((tx) => (
              <tr key={tx.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="py-4 pl-2 text-sm font-medium text-gray-900 dark:text-white">{tx.date}</td>
                <td className={`py-4 text-sm font-bold ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                  {tx.amount > 0 ? '+' : ''} ${Math.abs(tx.amount)}
                </td>
                <td className="py-4 text-sm text-gray-900 dark:text-white">
                  <div className="flex items-center gap-3">
                    {getIcon(tx.name)}
                    <span className="font-medium">{tx.name}</span>
                  </div>
                </td>
                <td className="py-4 text-sm text-gray-500 dark:text-gray-400">{tx.method}</td>
                <td className="py-4 text-sm text-gray-900 dark:text-white font-medium">{tx.category}</td>
              </tr>
            ))
            ) : (
               <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">No recent transactions</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;