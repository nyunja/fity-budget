import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { WalletAccount } from '../types';
import { walletsAPI } from '../services/api';
import { useAPI } from '../hooks/useAPI';
import { useAccountFilter } from '../contexts/AccountFilterContext';

interface AccountFilterProps {
  className?: string;
}

const AccountFilter: React.FC<AccountFilterProps> = ({ className = '' }) => {
  const [open, setOpen] = useState(false);
  const { walletId, setWalletId } = useAccountFilter();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = useAPI<{ wallets: WalletAccount[] }>(
    () => walletsAPI.list(),
    { auto: true }
  );
  const wallets: WalletAccount[] = data?.wallets || [];
  const selected = wallets.find((w) => w.id === walletId);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      >
        {selected ? (
          <>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selected.color }} />
            <span className="max-w-[110px] truncate">{selected.name}</span>
          </>
        ) : (
          'All accounts'
        )}
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg overflow-hidden">
          <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Filter by account</p>
          <button
            onClick={() => { setWalletId(null); setOpen(false); }}
            role="option"
            aria-selected={!walletId}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <span className="flex-1 text-left">All accounts</span>
            {!walletId && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
          </button>
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => { setWalletId(wallet.id); setOpen(false); }}
              role="option"
              aria-selected={walletId === wallet.id}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: wallet.color }} />
              <span className="flex-1 text-left truncate">{wallet.name}</span>
              {walletId === wallet.id && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
            </button>
          ))}
          {wallets.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-400">No accounts yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountFilter;
