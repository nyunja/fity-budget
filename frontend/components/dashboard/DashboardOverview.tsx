import React from 'react';
import TransactionList from '../TransactionList';
import SavingGoals from '../SavingGoals';
import { Transaction, SavingGoal } from '../../types';

interface DashboardOverviewProps {
  transactions: Transaction[];
  goals: SavingGoal[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ transactions, goals }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <TransactionList data={transactions.slice(0, 5)} />
      </div>
      <div className="xl:col-span-1">
        <SavingGoals data={goals.slice(0, 4)} />
      </div>
    </div>
  );
};

export default DashboardOverview;
