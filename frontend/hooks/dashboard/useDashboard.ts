import { useDashboardStats } from './useDashboardStats';
import { useDashboardCharts } from './useDashboardCharts';
import { useDashboardOverview } from './useDashboardOverview';

export const useDashboard = () => {
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { moneyFlow, budget, loading: chartsLoading, error: chartsError } = useDashboardCharts();
  const { transactions, goals, loading: overviewLoading, error: overviewError } = useDashboardOverview();

  const loading = statsLoading || chartsLoading || overviewLoading;
  const error = statsError || chartsError || overviewError;

  return {
    stats,
    moneyFlow,
    budget,
    transactions,
    goals,
    loading,
    error,
  };
};
