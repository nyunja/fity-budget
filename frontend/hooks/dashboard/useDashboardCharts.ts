import { useAPI } from '../useAPI';
import { analyticsAPI, budgetsAPI } from '../../services/api';
import { MoneyFlowData, BudgetCategory } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const useDashboardCharts = () => {
  const { isAuthenticated } = useAuth();

  const { data: moneyFlowData, loading: moneyFlowLoading, error: moneyFlowError } = useAPI<{ flow: MoneyFlowData[] }>(
    () => analyticsAPI.getMoneyFlow(),
    { auto: isAuthenticated }
  );

  const { data: budgetSummary, loading: budgetLoading, error: budgetError } = useAPI<{ categories: BudgetCategory[] }>(
    () => budgetsAPI.getSummary(),
    { auto: isAuthenticated }
  );

  const moneyFlow = moneyFlowData?.flow || [];
  const budget = budgetSummary?.categories || [];
  const loading = moneyFlowLoading || budgetLoading;
  const error = moneyFlowError || budgetError;

  return { moneyFlow, budget, loading, error };
};
