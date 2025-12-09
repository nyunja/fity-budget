import React from 'react';
import { Transaction } from '../../types';
import { TransactionItem } from './TransactionItem';

interface TransactionGroupProps {
  group: { date: string; total: number; items: Transaction[] };
  onItemClick: (tx: Transaction) => void;
}

// Transaction group component (transactions grouped by date)
export const TransactionGroup: React.FC<TransactionGroupProps> = ({ group, onItemClick }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-3 px-2">
        <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase text-sm tracking-wide">{group.date}</h3>
        <span className="text-sm font-medium text-gray-400">
          Daily Total: <span className={group.total >= 0 ? 'text-green-500' : 'text-gray-900 dark:text-white'}>${group.total.toLocaleString()}</span>
        </span>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {group.items.map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} onClick={onItemClick} />
          ))}
        </div>
      </div>
    </div>
  );
};
