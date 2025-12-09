import { useMemo } from 'react';
import { useAPI } from '../useAPI';
import { transactionsAPI } from '../../services/api';
import { Transaction } from '../../types';
import { formatTransactionDate } from '../../utils/transactionUtils';

// Hook for fetching and transforming transactions
export const useTransactions = () => {
  const { data: transactionsData, loading, error, refetch } = useAPI<{ data: any[] }>(
    () => transactionsAPI.list(),
    { auto: true }
  );

  const transactions: Transaction[] = useMemo(() => {
    if (!transactionsData?.data) return [];

    return transactionsData.data.map((tx: any) => ({
      id: tx.id,
      date: formatTransactionDate(tx.transaction_date),
      amount: tx.amount,
      name: tx.name,
      method: tx.method,
      category: tx.category,
      status: tx.status || 'Completed',
      wallet: tx.wallet_id,
      notes: tx.notes,
    }));
  }, [transactionsData]);

  return { transactions, loading, error, refetch };
};
