import { useAPI } from '../useAPI';
import { transactionsAPI, goalsAPI } from '../../services/api';
import { Transaction, SavingGoal } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface TransactionsResponse {
  data: Transaction[];
}

interface GoalsResponse {
  goals: Array<{
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    color: string;
    icon?: string;
    deadline?: string;
    priority?: string;
    category?: string;
    status?: string;
  }>;
}

export const useDashboardOverview = () => {
  const { isAuthenticated } = useAuth();

  const { data: recentTransactions, loading: transactionsLoading, error: transactionsError } = useAPI<TransactionsResponse>(
    () => transactionsAPI.list({ limit: 5 }),
    { auto: isAuthenticated }
  );

  const { data: goalsData, loading: goalsLoading, error: goalsError } = useAPI<GoalsResponse>(
    () => goalsAPI.list(),
    { auto: isAuthenticated }
  );

  const transactions = recentTransactions?.data || [];

  // Transform goals data: backend returns target_amount/current_amount, frontend expects target/current
  const goals: SavingGoal[] = goalsData?.goals?.map(goal => ({
    id: goal.id,
    name: goal.name,
    target: goal.target_amount,
    current: goal.current_amount,
    color: goal.color,
    icon: goal.icon,
    deadline: goal.deadline,
    priority: goal.priority as any,
    category: goal.category,
    status: goal.status as any,
  })) || [];

  const loading = transactionsLoading || goalsLoading;
  const error = transactionsError || goalsError;

  return { transactions, goals, loading, error };
};
