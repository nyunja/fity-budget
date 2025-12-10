import React from 'react';
import { MoreHorizontal, RefreshCw } from 'lucide-react';
import { WalletAccount } from '../../types';

interface WalletCardProps {
  wallet: WalletAccount;
  showBalance: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ wallet, showBalance, icon, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-[${wallet.color}]`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {wallet.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {wallet.type} • {wallet.accountNumber}
            </p>
          </div>
        </div>
        <button className="text-gray-300 hover:text-gray-600 dark:hover:text-white transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="space-y-1 mb-4">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Current Balance</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {showBalance ? `${wallet.currency} ${wallet.balance.toLocaleString()}` : '••••••••'}
        </h3>
      </div>

      <div className="flex justify-between items-center text-xs pt-4 border-t border-gray-50 dark:border-gray-700">
        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
          <RefreshCw size={12} />
          <span>Synced {wallet.lastSynced}</span>
        </div>
        {wallet.isDefault && (
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">Default</span>
        )}
      </div>
    </div>
  );
};

export default WalletCard;
