import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Transaction } from '../../types';
import { getTransactionIcon } from '../../utils/transactionUtils';

interface TransactionItemProps {
  transaction: Transaction;
  onClick: (tx: Transaction) => void;
}

// Single transaction item component
export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onClick }) => {
  return (
    <div
      onClick={() => onClick(transaction)}
      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer flex items-center justify-between group"
    >
      <div className="flex items-center gap-4">
        {getTransactionIcon(transaction.name)}
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{transaction.name}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">{transaction.category}</span>
            <span>•</span>
            <span>{transaction.wallet || transaction.method}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={`font-bold text-sm md:text-base ${transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">{transaction.date.split(' ')[2]}</p>
        </div>
        <MoreHorizontal size={18} className="text-gray-300 group-hover:text-gray-500" />
      </div>
    </div>
  );
};
