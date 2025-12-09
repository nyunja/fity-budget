import React from 'react';
import { getTransactionIcon } from '../../utils/transactionUtils';

interface TransactionIconProps {
  name: string;
}

// Simple wrapper component for transaction icons
export const TransactionIcon: React.FC<TransactionIconProps> = ({ name }) => {
  return getTransactionIcon(name);
};
