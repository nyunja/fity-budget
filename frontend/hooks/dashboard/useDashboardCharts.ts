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

interface BudgetListResponse {
  budgets: Array<{
    id: string;
    category: string;
    limit: number;
    color: string;
    icon?: string;
    is_rollover?: boolean;
    type?: string;
    alert_threshold?: number;
  }>;
}

export const useDashboardCharts = () => {
  const { isAuthenticated } = useAuth();

  const { data: moneyFlowData, loading: moneyFlowLoading, error: moneyFlowError } = useAPI<MoneyFlowResponse>(
    () => analyticsAPI.getMoneyFlow(),
    { auto: isAuthenticated }
  );

  const { data: budgetData, loading: budgetLoading, error: budgetError } = useAPI<BudgetListResponse>(
    () => budgetsAPI.list(),
    { auto: isAuthenticated }
  );

  // Transform money flow data into the format expected by the chart
  const moneyFlow: MoneyFlowData[] = moneyFlowData?.data?.months?.map((month, index) => ({
    month,
    income: moneyFlowData.data.income_data[index],
    expense: moneyFlowData.data.expense_data[index],
    savings: moneyFlowData.data.savings_data[index],
  })) || [];

  // Transform budget data from Budget[] to BudgetCategory[]
  const budget: BudgetCategory[] = budgetData?.budgets?.map((b) => ({
    name: b.category,
    value: b.limit,
    color: b.color,
  })) || [];

  const loading = moneyFlowLoading || budgetLoading;
  const error = moneyFlowError || budgetError;

  return { moneyFlow, budget, loading, error };
};
