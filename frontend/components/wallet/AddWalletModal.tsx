import React from 'react';
import { X } from 'lucide-react';
import { WalletType } from '../../types';

interface AddWalletModalProps {
  formName: string;
  formType: WalletType;
  formBalance: string;
  formColor: string;
  creating: boolean;
  onNameChange: (value: string) => void;
  onTypeChange: (value: WalletType) => void;
  onBalanceChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const AddWalletModal: React.FC<AddWalletModalProps> = ({
  formName,
  formType,
  formBalance,
  formColor,
  creating,
  onNameChange,
  onTypeChange,
  onBalanceChange,
  onColorChange,
  onSubmit,
  onClose
}) => {
  const colorOptions = ['bg-indigo-600', 'bg-green-600', 'bg-red-600', 'bg-blue-600', 'bg-purple-600', 'bg-orange-500'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl p-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connect Wallet</h2>
          <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Wallet Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
              placeholder="e.g. PayPal"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Type</label>
            <select
              value={formType}
              onChange={(e) => onTypeChange(e.target.value as WalletType)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
            >
              <option value="Mobile Money">Mobile Money</option>
              <option value="Bank">Bank Account</option>
              <option value="Cash">Cash</option>
              <option value="Savings">Savings</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Starting Balance</label>
            <input
              type="number"
              value={formBalance}
              onChange={(e) => onBalanceChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 outline-none"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Color</label>
            <div className="flex gap-2">
              {colorOptions.map(color => (
                <button
                  type="button"
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`w-8 h-8 rounded-full ${color} ${formColor === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                />
              ))}
            </div>
          </div>
          <button type="submit" disabled={creating} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-4 transition-colors disabled:opacity-50">
            {creating ? 'Adding...' : 'Add Wallet'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddWalletModal;
