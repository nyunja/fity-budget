import React from 'react';
import { Smartphone, Landmark, Banknote, CreditCard, Lock } from 'lucide-react';
import { WalletType } from '../../types';

export const getWalletIcon = (type: WalletType): React.ReactNode => {
  switch (type) {
    case 'Mobile Money': return <Smartphone size={20} />;
    case 'Bank': return <Landmark size={20} />;
    case 'Cash': return <Banknote size={20} />;
    case 'Credit': return <CreditCard size={20} />;
    case 'Savings': return <Lock size={20} />;
    default: return <Landmark size={20} />;
  }
};
