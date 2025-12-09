import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { WalletAccount } from '../../types';
import { TRANSACTION_CATEGORIES } from '../../constants/transactionConstants';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: WalletAccount[];
  formData: {
    type: 'Expense' | 'Income';
    name: string;
    amount: string;
    category: string;
    method: string;
    wallet: string;
    notes: string;
  };
  setters: {
    setType: (type: 'Expense' | 'Income') => void;
    setName: (name: string) => void;
    setAmount: (amount: string) => void;
    setCategory: (category: string) => void;
    setMethod: (method: string) => void;
    setWallet: (wallet: string) => void;
    setNotes: (notes: string) => void;
  };
  submitError: string | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  creating: boolean;
}

// Add transaction modal component
export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  wallets,
  formData,
  setters,
  submitError,
  onSubmit,
  creating,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Transaction</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Error Message */}
          {submitError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
            </div>
          )}

          {/* Type Switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setters.setType('Expense')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'Expense' ? 'bg-white dark:bg-gray-600 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setters.setType('Income')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'Income' ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              Income
            </button>
          </div>

          {/* Amount - Big Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">$</span>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setters.setAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
              required
              className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 text-3xl font-bold focus:border-indigo-500 outline-none text-center transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setters.setName(e.target.value)}
              placeholder="e.g. Lunch at KFC"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setters.setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none appearance-none"
              >
                {TRANSACTION_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Wallet</label>
              <select
                value={formData.wallet}
                onChange={(e) => setters.setWallet(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none appearance-none"
              >
                {wallets.length === 0 && <option value="">No wallets available</option>}
                {wallets.map((wallet: any) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setters.setNotes(e.target.value)}
              placeholder="Add details..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={creating || wallets.length === 0}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
