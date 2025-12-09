import React from 'react';
import { Search, Download, Plus } from 'lucide-react';
import { TRANSACTION_TYPES, WALLET_FILTERS } from '../../constants/transactionConstants';

interface TransactionFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: 'All' | 'Income' | 'Expense';
  onTypeChange: (type: 'All' | 'Income' | 'Expense') => void;
  filterWallet: string;
  onWalletChange: (wallet: string) => void;
  onAddClick: () => void;
}

// Filters and controls component
export const TransactionHeaderAndFilters: React.FC<TransactionFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filterType,
  onTypeChange,
  filterWallet,
  onWalletChange,
  onAddClick,
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h2>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-grow lg:flex-grow-0 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {TRANSACTION_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === type
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
              }`}
          >
            {type}
          </button>
        ))}
        <div className="w-px h-8 bg-gray-300 dark:bg-gray-700 mx-2"></div>
        {WALLET_FILTERS.map((wallet) => (
          <button
            key={wallet}
            onClick={() => onWalletChange(wallet)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterWallet === wallet
              ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
              }`}
          >
            {wallet === 'All' ? 'All Wallets' : wallet}
          </button>
        ))}
      </div>
    </>
  );
};
