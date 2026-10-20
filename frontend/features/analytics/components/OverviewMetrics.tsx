import React from 'react';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { cur } from '../../../utils/currency';

interface OverviewMetricsProps {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    savingsRate: number;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate
}) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            <MetricCard
                title="Total Income"
                value={totalIncome}
                icon={<TrendingUp size={18} />}
                color="green"
                trend="+12% vs last month"
            />
            <MetricCard
                title="Total Expenses"
                value={totalExpense}
                icon={<TrendingDown size={18} />}
                color="red"
                trend="+5% vs last month"
            />
            <div className="col-span-2 md:col-span-1 bg-indigo-600 p-4 sm:p-6 rounded-3xl shadow-lg shadow-indigo-200 dark:shadow-none flex flex-col justify-between min-h-[9.5rem] text-white">
                <div className="flex justify-between">
                    <span className="text-indigo-100 font-medium text-sm">Net Savings</span>
                    <div className="p-2 bg-white/20 rounded-full text-white">
                        <Target size={18} />
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl sm:text-3xl font-bold">{cur()}{netSavings.toLocaleString()}</h3>
                    <p className="text-xs text-indigo-100 mt-1 opacity-80">{savingsRate.toFixed(1)}% savings rate</p>
                </div>
            </div>
        </div>
    )
}