import { useMemo } from 'react';
import { useAPI } from '../useAPI';
import { transactionsAPI } from '../../services/api';
import { Transaction } from '../../types';
import { formatTransactionDate } from '../../utils/transactionUtils';
import { usePeriod } from '../../contexts/PeriodContext';

// The backend stores unsigned amounts with an explicit type field;
// the UI derives income/expense from the sign, so we sign here.
const signAmount = (tx: any): Transaction => {
  const amount = Math.abs(tx.amount || 0);
  return {
    id: tx.id,
    date: formatTransactionDate(tx.transaction_date),
    amount: tx.type === 'income' ? amount : -amount,
    type: tx.type === 'income' ? 'income' : 'expense',
    name: tx.name,
    method: tx.method,
    category: tx.category,
    status: tx.status || 'Completed',
    wallet: tx.wallet_id,
    notes: tx.notes,
  };
};

// Hook for fetching and transforming transactions (filtered by the selected period)
export const useTransactions = () => {
  const { startDate, endDate } = usePeriod();

  const { data: transactionsData, loading, error, refetch } = useAPI<{ data: any[] }>(
    () => transactionsAPI.list({ start_date: startDate, end_date: endDate }),
    { auto: true, deps: [startDate, endDate] }
  );

  const transactions: Transaction[] = useMemo(() => {
    if (!transactionsData?.data) return [];
    return transactionsData.data.map(signAmount);
  }, [transactionsData]);

  return { transactions, loading, error, refetch };
};
