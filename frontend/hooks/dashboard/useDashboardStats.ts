import { useAPI } from '../useAPI';
import { analyticsAPI } from '../../services/api';
import { StatMetric } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const useDashboardStats = () => {
  const { isAuthenticated } = useAuth();

  const { data: dashboardData, loading, error } = useAPI<{ stats: StatMetric[] }>(
    () => analyticsAPI.getDashboard(),
    { auto: isAuthenticated }
  );

  // Create default stats if backend returns empty data
  const defaultStats: StatMetric[] = [
    { label: 'Total balance', value: 0, trend: 0, trendDirection: 'up', prefix: '$' },
    { label: 'Income', value: 0, trend: 0, trendDirection: 'up', prefix: '$' },
    { label: 'Expense', value: 0, trend: 0, trendDirection: 'down', prefix: '$' },
    { label: 'Total savings', value: 0, trend: 0, trendDirection: 'up', prefix: '$' },
  ];

  const stats = dashboardData?.stats && dashboardData.stats.length > 0 ? dashboardData.stats : defaultStats;

  return { stats, loading, error };
};
