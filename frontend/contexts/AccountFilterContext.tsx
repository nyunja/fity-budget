import React, { createContext, useContext, useState } from 'react';

interface AccountFilterContextValue {
  walletId: string | null;
  setWalletId: (id: string | null) => void;
}

const AccountFilterContext = createContext<AccountFilterContextValue | null>(null);

export const AccountFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletId, setWalletId] = useState<string | null>(null);
  return (
    <AccountFilterContext.Provider value={{ walletId, setWalletId }}>
      {children}
    </AccountFilterContext.Provider>
  );
};

export const useAccountFilter = (): AccountFilterContextValue => {
  const ctx = useContext(AccountFilterContext);
  if (!ctx) throw new Error('useAccountFilter must be used within an AccountFilterProvider');
  return ctx;
};
