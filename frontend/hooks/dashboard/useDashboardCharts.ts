import { useAPI } from '../useAPI';
import { analyticsAPI, budgetsAPI } from '../../services/api';
import { MoneyFlowData, BudgetCategory } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { usePeriod } from '../../contexts/PeriodContext';

interface MoneyFlowResponse {
  data: {
    months?: string[];
    income_data?: number[];
    expense_data?: number[];
    savings_data?: number[];
    data_points?: Array<{ date: string; income: number; expense: number }>;
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
  const { startDate, endDate, period } = usePeriod();

  // Short periods use an explicit date range (daily data points);
  // year uses the monthly trends endpoint.
  const useDateRange = period !== 'year';

  const { data: moneyFlowData, loading: moneyFlowLoading, error: moneyFlowError } = useAPI<MoneyFlowResponse>(
    () => analyticsAPI.getMoneyFlow(
      useDateRange
        ? { start_date: startDate, end_date: endDate }
        : { period: '1year' }
    ),
    { auto: isAuthenticated, deps: [isAuthenticated, startDate, endDate, useDateRange] }
  );

  const { data: budgetData, loading: budgetLoading, error: budgetError } = useAPI<BudgetListResponse>(
    () => budgetsAPI.list(),
    { auto: isAuthenticated }
  );

  // Transform money flow data into the format expected by the chart
  const moneyFlow: MoneyFlowData[] = moneyFlowData?.data?.data_points
    ? moneyFlowData.data.data_points.map((point) => ({
        month: point.date,
        income: point.income,
        expense: point.expense,
        savings: point.income - point.expense,
      }))
    : moneyFlowData?.data?.months?.map((month, index) => ({
        month,
        income: moneyFlowData.data.income_data?.[index] || 0,
        expense: moneyFlowData.data.expense_data?.[index] || 0,
        savings: moneyFlowData.data.savings_data?.[index] || 0,
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
