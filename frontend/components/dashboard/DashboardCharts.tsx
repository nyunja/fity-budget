import React from 'react';
import MoneyFlowChart from '../MoneyFlowChart';
import BudgetChart from '../BudgetChart';
import { MoneyFlowData, BudgetCategory } from '../../types';

interface DashboardChartsProps {
  moneyFlow: MoneyFlowData[];
  budget: BudgetCategory[];
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ moneyFlow, budget }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 h-[400px]">
        <MoneyFlowChart data={moneyFlow} />
      </div>
      <div className="xl:col-span-1 h-[400px]">
        <BudgetChart data={budget} />
      </div>
    </div>
  );
};

export default DashboardCharts;
