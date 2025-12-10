import React from 'react';
import { X } from 'lucide-react';
import { WalletAccount } from '../../types';

interface TransferModalProps {
  wallets: WalletAccount[];
  transferFrom: string;
  transferTo: string;
  transferAmount: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({
  wallets,
  transferFrom,
  transferTo,
  transferAmount,
  onFromChange,
  onToChange,
  onAmountChange,
  onSubmit,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl p-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transfer Funds</h2>
          <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex flex-col gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl relative">
            {/* Connector Line */}
            <div className="absolute left-8 top-12 bottom-12 w-0.5 border-l-2 border-dashed border-gray-300 dark:border-gray-600"></div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block pl-1">From</label>
              <select
                value={transferFrom}
                onChange={(e) => onFromChange(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                required
              >
                <option value="" disabled>Select Wallet</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id} disabled={w.id === transferTo}>{w.name} (${w.balance})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block pl-1">To</label>
              <select
                value={transferTo}
                onChange={(e) => onToChange(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
                required
              >
                <option value="" disabled>Select Wallet</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id} disabled={w.id === transferFrom}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">$</span>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => onAmountChange(e.target.value)}
                className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none text-2xl font-bold"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-4 transition-colors">
            Confirm Transfer
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
