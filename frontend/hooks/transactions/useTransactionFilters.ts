import { useMemo } from 'react';
import { Transaction } from '../../types';
import { groupTransactionsByDate } from '../../utils/transactionUtils';

// Hook for filtering and grouping transactions
export const useTransactionFilters = (
  transactions: Transaction[],
  filterType: 'All' | 'Income' | 'Expense',
  searchQuery: string,
  filterWallet: string
) => {
  // 1. Filter Logic
  const filteredData = useMemo(() => {
    return transactions.filter(item => {
      // Type Filter
      if (filterType === 'Income' && item.amount < 0) return false;
      if (filterType === 'Expense' && item.amount > 0) return false;

      // Wallet Filter
      if (filterWallet !== 'All') {
        const methodMatch = item.method.toLowerCase().includes(filterWallet.toLowerCase());
        const walletMatch = item.wallet?.toLowerCase().includes(filterWallet.toLowerCase());
        if (!methodMatch && !walletMatch) return false;
      }

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.method.toLowerCase().includes(query) ||
          (item.notes && item.notes.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [filterType, searchQuery, filterWallet, transactions]);

  // 2. Summary Statistics for current view
  const summary = useMemo(() => {
    const income = filteredData.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredData.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
    return { income, expense, net: income - expense };
  }, [filteredData]);

  // 3. Group by Date
  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(filteredData);
  }, [filteredData]);

  return { filteredData, summary, groupedTransactions };
};
