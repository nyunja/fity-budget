import React from 'react';
import { X, Calendar, Tag, Wallet, CreditCard, FileText, Edit2, Trash2 } from 'lucide-react';
import { Transaction } from '../../types';
import { getTransactionIcon } from '../../utils/transactionUtils';

interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}

// Transaction detail modal component
export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onDelete,
  deleting,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-700">
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="p-2 bg-white dark:bg-gray-700 rounded-full text-gray-500 hover:text-gray-900 transition-colors shadow-sm">
              <X size={18} />
            </button>
          </div>
          <div className="mb-4 transform scale-125">
            {getTransactionIcon(transaction.name)}
          </div>
          <h2 className={`text-3xl font-bold mb-1 ${transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{transaction.name}</p>
          <span className="mt-2 text-xs font-bold px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 uppercase tracking-wide">
            {transaction.status || 'Completed'}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Calendar size={16} /> Date & Time</span>
            <span className="font-medium text-gray-900 dark:text-white">{transaction.date}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Tag size={16} /> Category</span>
            <span className="font-medium text-gray-900 dark:text-white">{transaction.category}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Wallet size={16} /> Wallet</span>
            <span className="font-medium text-gray-900 dark:text-white">{transaction.wallet || transaction.method}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><CreditCard size={16} /> Method</span>
            <span className="font-medium text-gray-900 dark:text-white">{transaction.method}</span>
          </div>
          {transaction.notes && (
            <div className="py-2">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1"><FileText size={16} /> Notes</span>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                {transaction.notes}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Edit2 size={16} /> Edit
            </button>
            <button
              onClick={() => onDelete(transaction.id)}
              disabled={deleting}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} /> {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
