import { useAPI } from '../useAPI';
import { analyticsAPI, budgetsAPI } from '../../services/api';
import { MoneyFlowData, BudgetCategory } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface MoneyFlowResponse {
  data: {
    months: string[];
    income_data: number[];
    expense_data: number[];
    savings_data: number[];
  };
}

interface BudgetSummaryResponse {
  summary: {
    total_budgets: number;
    total_limit: number;
    total_spent: number;
  };
}

export const useDashboardCharts = () => {
  const { isAuthenticated } = useAuth();

  const { data: moneyFlowData, loading: moneyFlowLoading, error: moneyFlowError } = useAPI<MoneyFlowResponse>(
    () => analyticsAPI.getMoneyFlow(),
    { auto: isAuthenticated }
  );

  const { data: budgetSummary, loading: budgetLoading, error: budgetError } = useAPI<BudgetSummaryResponse>(
    () => budgetsAPI.getSummary(),
    { auto: isAuthenticated }
  );

  // Transform money flow data into the format expected by the chart
  const moneyFlow: MoneyFlowData[] = moneyFlowData?.data?.months?.map((month, index) => ({
    month,
    income: moneyFlowData.data.income_data[index],
    expense: moneyFlowData.data.expense_data[index],
    savings: moneyFlowData.data.savings_data[index],
  })) || [];

  // For budget, we don't have categories from the summary endpoint
  // The summary only has totals, so we return empty array for now
  const budget: BudgetCategory[] = [];

  const loading = moneyFlowLoading || budgetLoading;
  const error = moneyFlowError || budgetError;

  return { moneyFlow, budget, loading, error };
};
