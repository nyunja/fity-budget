import React from 'react';
import DashboardStats from './DashboardStats';
import DashboardCharts from './DashboardCharts';
import DashboardOverview from './DashboardOverview';
import { useAPI } from '../../hooks/useAPI';
import { analyticsAPI, transactionsAPI, goalsAPI, budgetsAPI } from '../../services/api';
import { StatMetric, Transaction, SavingGoal, MoneyFlowData, BudgetCategory } from '../../types';

const Dashboard: React.FC = () => {
  // Fetch Dashboard Data
  const { data: dashboardData } = useAPI<{ stats: StatMetric[] }>(
    () => analyticsAPI.getDashboard(),
    { auto: true }
  );

  const { data: moneyFlowData } = useAPI<{ flow: MoneyFlowData[] }>(
    () => analyticsAPI.getMoneyFlow(),
    { auto: true }
  );

  const { data: budgetSummary } = useAPI<{ categories: BudgetCategory[] }>(
    () => budgetsAPI.getSummary(),
    { auto: true }
  );

  const { data: recentTransactions } = useAPI<{ transactions: Transaction[] }>(
    () => transactionsAPI.list({ limit: 5 }),
    { auto: true }
  );

  const { data: goalsData } = useAPI<{ goals: SavingGoal[] }>(
    () => goalsAPI.list(),
    { auto: true }
  );

  // Derived State
  // Create default stats if backend returns empty data
  const defaultStats: StatMetric[] = [
    { label: 'Total balance', value: 0, trend: 0, trendDirection: 'up', prefix: '$' },
    { label: 'Income', value: 0, trend: 0, trendDirection: 'up', prefix: '$' },
    { label: 'Expense', value: 0, trend: 0, trendDirection: 'down', prefix: '$' },
    { label: 'Total savings', value: 0, trend: 0, trendDirection: 'up', prefix: '$' },
  ];

  const stats = dashboardData?.stats && dashboardData.stats.length > 0 ? dashboardData.stats : defaultStats;
  const moneyFlow = moneyFlowData?.flow || [];
  const budget = budgetSummary?.categories || [];
  const transactions = recentTransactions?.transactions || [];
  const goals = goalsData?.goals || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <DashboardStats stats={stats} />

      {/* Main Charts Row */}
      <DashboardCharts moneyFlow={moneyFlow} budget={budget} />

      {/* Bottom Row */}
      <DashboardOverview transactions={transactions} goals={goals} />
    </div>
  );
};

export default Dashboard;
