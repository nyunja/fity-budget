import { useAPI } from '../useAPI';
import { transactionsAPI, goalsAPI } from '../../services/api';
import { Transaction, SavingGoal } from '../../types';

export const useDashboardOverview = () => {
  const { data: recentTransactions, loading: transactionsLoading, error: transactionsError } = useAPI<{ transactions: Transaction[] }>(
    () => transactionsAPI.list({ limit: 5 }),
    { auto: true }
  );

  const { data: goalsData, loading: goalsLoading, error: goalsError } = useAPI<{ goals: SavingGoal[] }>(
    () => goalsAPI.list(),
    { auto: true }
  );

  const transactions = recentTransactions?.transactions || [];
  const goals = goalsData?.goals || [];
  const loading = transactionsLoading || goalsLoading;
  const error = transactionsError || goalsError;

  return { transactions, goals, loading, error };
};
