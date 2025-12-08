import { useAPI } from '../useAPI';
import { analyticsAPI } from '../../services/api';
import { StatMetric } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardSummary {
  total_balance: number;
  total_income: number;
  total_expense: number;
  net_savings: number;
  month_comparison?: {
    income_change: number;
    expense_change: number;
  };
}

export const useDashboardStats = () => {
  const { isAuthenticated } = useAuth();

  const { data: dashboardData, loading, error } = useAPI<{ dashboard: DashboardSummary }>(
    () => analyticsAPI.getDashboard(),
    { auto: isAuthenticated }
  );

  // Transform backend dashboard data into StatMetric array
  const stats: StatMetric[] = dashboardData?.dashboard
    ? [
        {
          label: 'Total balance',
          value: dashboardData.dashboard.total_balance,
          trend: dashboardData.dashboard.month_comparison?.income_change || 0,
          trendDirection: (dashboardData.dashboard.month_comparison?.income_change || 0) >= 0 ? 'up' : 'down',
          prefix: '$',
        },
        {
          label: 'Income',
          value: dashboardData.dashboard.total_income,
          trend: dashboardData.dashboard.month_comparison?.income_change || 0,
          trendDirection: (dashboardData.dashboard.month_comparison?.income_change || 0) >= 0 ? 'up' : 'down',
          prefix: '$',
        },
        {
          label: 'Expense',
          value: dashboardData.dashboard.total_expense,
          trend: dashboardData.dashboard.month_comparison?.expense_change || 0,
          trendDirection: (dashboardData.dashboard.month_comparison?.expense_change || 0) >= 0 ? 'up' : 'down',
          prefix: '$',
        },
        {
          label: 'Total savings',
          value: dashboardData.dashboard.net_savings,
          trend: 0,
          trendDirection: 'up',
          prefix: '$',
        },
      ]
    : [
        { label: 'Total balance', value: 0, trend: 0, trendDirection: 'up', prefix: '$' },
        { label: 'Income', value: 0, trend: 0, trendDirection: 'up', prefix: '$' },
        { label: 'Expense', value: 0, trend: 0, trendDirection: 'down', prefix: '$' },
        { label: 'Total savings', value: 0, trend: 0, trendDirection: 'up', prefix: '$' },
      ];

  return { stats, loading, error };
};
