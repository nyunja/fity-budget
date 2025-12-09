import { useMemo } from 'react';
import { useAPI } from '../useAPI';
import { transactionsAPI } from '../../services/api';
import { Transaction } from '../../types';
import { formatTransactionDate } from '../../utils/transactionUtils';

// Hook for fetching and transforming transactions
export const useTransactions = () => {
  const { data: transactionsData, loading, error, refetch } = useAPI<{ transactions: any[] }>(
    () => transactionsAPI.list(),
    { auto: true }
  );

  const transactions: Transaction[] = useMemo(() => {
    if (!transactionsData?.transactions) return [];

    return transactionsData.transactions.map((tx: any) => ({
      id: tx.id,
      date: formatTransactionDate(tx.date),
      amount: tx.type === 'income' ? tx.amount : -tx.amount,
      name: tx.description,
      method: tx.wallet_id,
      category: tx.category,
      status: 'Completed',
      wallet: tx.wallet_id,
      notes: tx.notes,
    }));
  }, [transactionsData]);

  return { transactions, loading, error, refetch };
};
