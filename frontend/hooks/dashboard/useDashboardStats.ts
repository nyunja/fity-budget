import { useAPI } from '../useAPI';
import { analyticsAPI } from '../../services/api';
import { StatMetric } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { usePeriod } from '../../contexts/PeriodContext';

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
  const { startDate, endDate } = usePeriod();

  const { data: dashboardData, loading, error } = useAPI<{ dashboard: DashboardSummary }>(
    () => analyticsAPI.getDashboard({ start_date: startDate, end_date: endDate }),
    { auto: isAuthenticated, deps: [isAuthenticated, startDate, endDate] }
  );

  // Transform backend dashboard data into StatMetric array
  const stats: StatMetric[] = dashboardData?.dashboard
    ? [
        {
          label: 'Total balance',
          value: dashboardData.dashboard.total_balance,
          trend: Math.round((dashboardData.dashboard.month_comparison?.income_change || 0) * 10) / 10,
          trendDirection: (dashboardData.dashboard.month_comparison?.income_change || 0) >= 0 ? 'up' : 'down',
                  },
        {
          label: 'Income',
          value: dashboardData.dashboard.total_income,
          trend: Math.round((dashboardData.dashboard.month_comparison?.income_change || 0) * 10) / 10,
          trendDirection: (dashboardData.dashboard.month_comparison?.income_change || 0) >= 0 ? 'up' : 'down',
                  },
        {
          label: 'Expense',
          value: dashboardData.dashboard.total_expense,
          trend: Math.round((dashboardData.dashboard.month_comparison?.expense_change || 0) * 10) / 10,
          trendDirection: (dashboardData.dashboard.month_comparison?.expense_change || 0) >= 0 ? 'up' : 'down',
                  },
        {
          label: 'Total savings',
          value: dashboardData.dashboard.net_savings,
          trend: 0,
          trendDirection: 'up',
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
