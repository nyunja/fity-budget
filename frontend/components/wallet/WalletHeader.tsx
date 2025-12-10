import React from 'react';
import { Plus, ArrowRightLeft, Eye, EyeOff } from 'lucide-react';

interface WalletHeaderProps {
  totalBalance: number;
  totalAvailable: number;
  walletsCount: number;
  showBalance: boolean;
  onToggleBalance: () => void;
  onAddMoney: () => void;
  onTransfer: () => void;
}

const WalletHeader: React.FC<WalletHeaderProps> = ({
  totalBalance,
  totalAvailable,
  walletsCount,
  showBalance,
  onToggleBalance,
  onAddMoney,
  onTransfer
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-black border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-black text-sm font-medium uppercase tracking-wider">Total Balance</span>
            <button onClick={onToggleBalance} className="text-black hover:text-white transition-colors">
              {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {showBalance ? `$${totalBalance.toLocaleString()}` : '••••••••'}
          </h1>
          <div className="flex gap-4 text-sm text-black">
            <span>Available: <span className="font-bold">{showBalance ? `$${totalAvailable.toLocaleString()}` : '••••'}</span></span>
            <span>•</span>
            <span>{walletsCount} Active Wallets</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={onAddMoney}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-200 rounded-xl font-bold transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>Add Money</span>
          </button>
          <button
            onClick={onTransfer}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-200 rounded-xl font-bold transition-colors shadow-sm"
          >
            <ArrowRightLeft size={18} />
            <span>Transfer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletHeader;
