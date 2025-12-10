import React from 'react';
import { X, Edit2, Trash2, ArrowDownLeft, ArrowUpRight, MoreHorizontal, Loader2 } from 'lucide-react';
import { WalletAccount, Transaction } from '../../types';

interface WalletDetailModalProps {
  wallet: WalletAccount;
  transactions: Transaction[];
  icon: React.ReactNode;
  onClose: () => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}

const WalletDetailModal: React.FC<WalletDetailModalProps> = ({
  wallet,
  transactions,
  icon,
  onClose,
  onDelete,
  deleting
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] animate-fade-in">

        {/* Left Panel: Wallet Info */}
        <div className={`w-full md:w-1/3 bg-[${wallet.color}] p-8 text-white flex flex-col justify-between relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                {icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{wallet.name}</h2>
                <p className="text-white/80 text-sm">{wallet.type}</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-white/70 text-sm mb-1">Total Balance</p>
              <h1 className="text-4xl font-bold">${wallet.balance.toLocaleString()}</h1>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Income (Mo.)</span>
                  <ArrowDownLeft size={16} className="text-green-300" />
                </div>
                <p className="text-xl font-bold">$2,450</p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Expenses (Mo.)</span>
                  <ArrowUpRight size={16} className="text-red-300" />
                </div>
                <p className="text-xl font-bold">$1,200</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-8">
            <button className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              <Edit2 size={16} /> Edit Wallet
            </button>
            <button
              onClick={() => onDelete(wallet.id)}
              disabled={deleting}
              className="w-full py-3 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete
            </button>
          </div>
        </div>

        {/* Right Panel: Transactions */}
        <div className="flex-1 bg-white dark:bg-gray-800 p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500">
              <X size={20} />
            </button>
          </div>

          {/* Filter Tabs Mock */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold">All</button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">Income</button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">Expenses</button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {transactions.length > 0 ? (
              transactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{tx.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{tx.category} • {tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                    {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <MoreHorizontal size={24} />
                </div>
                <p>No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletDetailModal;
