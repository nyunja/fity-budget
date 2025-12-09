import React from 'react';
import { Search } from 'lucide-react';
import { Transaction } from '../../types';
import { TransactionGroup } from './TransactionGroup';

interface TransactionListProps {
  groupedTransactions: Array<{ date: string; total: number; items: Transaction[] }>;
  onTransactionClick: (tx: Transaction) => void;
}

// Transaction list component with empty state
export const TransactionList: React.FC<TransactionListProps> = ({
  groupedTransactions,
  onTransactionClick,
}) => {
  return (
    <div className="space-y-6">
      {groupedTransactions.length > 0 ? (
        groupedTransactions.map((group, index) => (
          <TransactionGroup key={index} group={group} onItemClick={onTransactionClick} />
        ))
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Search size={24} />
          </div>
          <h3 className="text-gray-900 dark:text-white font-bold mb-1">No transactions found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
};
