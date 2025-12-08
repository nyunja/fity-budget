import React from 'react';
import StatCard from '../StatCard';
import MoneyFlowChart from '../MoneyFlowChart';
import BudgetChart from '../BudgetChart';
import TransactionList from '../TransactionList';
import SavingGoals from '../SavingGoals';
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 h-[400px]">
          <MoneyFlowChart data={moneyFlow} />
        </div>
        <div className="xl:col-span-1 h-[400px]">
          <BudgetChart data={budget} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TransactionList data={transactions.slice(0, 5)} />
        </div>
        <div className="xl:col-span-1">
          <SavingGoals data={goals.slice(0, 4)} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
