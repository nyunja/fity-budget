import React from 'react';
import { Calendar, Wallet, Layers, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { BudgetAnalysis } from '../hooks/useBudgetAnalysis';

const MonthlySummary: React.FC<{
  budgets: any[];
  transactions: any[];
  analysis: BudgetAnalysis[];
}> = ({ budgets, transactions, analysis }) => {
  const totalBudget = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = analysis.reduce((acc, b) => acc + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const monthlyIncome = 8500; // mock – replace with real value

  const chartData = [
    { name: 'Budget', value: totalBudget },
    { name: 'Spent', value: totalSpent },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly Summary</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-1.5 rounded-full shadow-sm">
          <Calendar size={14} />
          <span>This Month</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <MetricCard label="Monthly Income" value={monthlyIncome} icon={Wallet} />
        <MetricCard label="Total Budgeted" value={totalBudget} icon={Layers} />
        <MetricCard label="Total Spent" value={totalSpent} icon={ArrowUpRight} />
        <MetricCard
          label="Remaining"
          value={Math.max(0, totalRemaining)}
          icon={ArrowDownRight}
          valueClass={totalRemaining < 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${totalSpent > totalBudget ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Spending Insight</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                You have spent <span className="font-bold text-gray-900 dark:text-white">{((totalSpent / monthlyIncome) * 100).toFixed(0)}%</span> of your monthly income.
                {totalSpent > totalBudget
                  ? <span className="text-red-600 dark:text-red-400 font-medium"> You are currently over your planned budget by ${(totalSpent - totalBudget).toLocaleString()}.</span>
                  : <span className="text-green-600 dark:text-green-400 font-medium"> You are on track to stay within your budget. Great job!</span>}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm h-48 lg:h-auto flex flex-col justify-center">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4">Budget vs Spent</h3>
          <div className="flex-1 min-h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" barSize={30} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={50} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', backgroundColor: 'var(--tooltip-bg, #fff)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={idx === 0 ? '#C7D2FE' : '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  label: string;
  value: number;
  icon: React.ElementType;
  valueClass?: string;
}> = ({ label, value, icon: Icon, valueClass = 'text-gray-900 dark:text-white' }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">{label}</h3>
      <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400">
        <Icon size={16} />
      </div>
    </div>
    <h2 className={`text-3xl font-bold ${valueClass}`}>${value.toLocaleString()}</h2>
  </div>
);

export default MonthlySummary;