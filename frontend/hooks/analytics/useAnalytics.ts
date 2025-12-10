import { useMemo } from 'react';
import { Transaction, SavingGoal, Budget } from '@/types';
import { useAPI } from '../useAPI';
import { transactionsAPI, goalsAPI, budgetsAPI } from '@/services/api';

export const useAnalyticsData = () => {
    const { data: transactionsData } = useAPI<{ transactions: Transaction[] }>(
        () => transactionsAPI.list(),
        { auto: true }
    );

    const { data: goalsData } = useAPI<{ goals: SavingGoal[] }>(
        () => goalsAPI.list(),
        { auto: true }
    );

    const { data: budgetsData } = useAPI<{ budgets: Budget[] }>(
        () => budgetsAPI.list(),
        { auto: true }
    );

    // We could also fetch specific analytics endpoints if available, but for now we'll calculate from raw data
    // to match existing logic, or use the analyticsAPI if it provides pre-calculated values.
    // The existing code calculates metrics on the frontend, so we'll stick to that for now using the fetched lists.

    return {
        transactions: transactionsData?.transactions || [],
        goals: goalsData?.goals || [],
        budgets: budgetsData?.budgets || []
    }
};

export const useFinancialMetrics = (transactions: Transaction[]) => {
    return useMemo(() => {
        const totalIncome = transactions
            .filter(t => t.amount > 0)
            .reduce((acc, t) => acc + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.amount < 0)
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);

        const netSavings = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

        return { totalIncome, totalExpense, netSavings, savingsRate };
    }, [transactions]);
};

export const useHealthScore = (
    savingsRate: number,
    budgets: Budget[],
    transactions: Transaction[]
) => {
    return useMemo(() => {
        let healthScore = 50;

        if (savingsRate > 20) healthScore += 20;
        else if (savingsRate > 10) healthScore += 10;

        const overspentBudgets = budgets.filter(b => {
            const spent = transactions
                .filter(t => t.category === b.category && t.amount < 0)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            return spent > b.limit;
        }).length;

        healthScore -= (overspentBudgets * 5);
        healthScore = Math.max(0, Math.min(100, healthScore));

        let healthLabel = 'Needs Work';
        if (healthScore >= 80) healthLabel = 'Excellent';
        else if (healthScore >= 60) healthLabel = 'Good';
        else if (healthScore >= 40) healthLabel = 'Fair';

        return { healthScore, healthLabel, overspentBudgets };
    }, [savingsRate, budgets, transactions]);
};

export const useCategoryData = (transactions: Transaction[]) => {
    return useMemo(() => {
        const categoryData = transactions
            .filter(t => t.amount < 0)
            .reduce((acc, t) => {
                const existing = acc.find(item => item.name === t.category);
                if (existing) existing.value += Math.abs(t.amount);
                else acc.push({ name: t.category, value: Math.abs(t.amount) });
                return acc;
            }, [] as { name: string; value: number }[])
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        return categoryData;
    }, [transactions]);
};

export const useRecurringExpenses = (transactions: Transaction[]) => {
    return useMemo(() => {
        const recurringTx = transactions.reduce((acc, t) => {
            if (t.amount >= 0) return acc;
            if (acc[t.name]) acc[t.name].count++;
            else acc[t.name] = { count: 1, amount: Math.abs(t.amount), category: t.category };
            return acc;
        }, {} as any);

        return Object.keys(recurringTx)
            .filter(name => recurringTx[name].count >= 1 &&
                ['Subscription', 'Utilities', 'Rent', 'Internet'].includes(recurringTx[name].category))
            .map(name => ({
                name,
                amount: recurringTx[name].amount,
                category: recurringTx[name].category
            }));
    }, [transactions]);
};

