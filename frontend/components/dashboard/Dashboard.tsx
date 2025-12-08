import React from 'react';
import DashboardStats from './DashboardStats';
import DashboardCharts from './DashboardCharts';
import DashboardOverview from './DashboardOverview';
import { useDashboard } from '../../hooks/dashboard';

const Dashboard: React.FC = () => {
  // Fetch all dashboard data using aggregator hook
  const { stats, moneyFlow, budget, transactions, goals } = useDashboard();

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
