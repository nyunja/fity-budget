import { useMemo } from 'react';
import { Budget, Transaction } from '../../../types';

export interface BudgetAnalysis extends Budget {
  spent: number;
  remaining: number;
  progress: number;
  isOverspent: boolean;
  isWarning: boolean;
}

export default function useBudgetAnalysis(budgets: Budget[], transactions: Transaction[]) {
  return useMemo(() => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(
          t =>
            t.category === budget.category &&
            t.amount < 0 &&
            (t.status === 'Completed' || t.status === 'Pending')
        )
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);

      const remaining = budget.limit - spent;
      const progress = Math.min(100, (spent / budget.limit) * 100);
      const isOverspent = spent > budget.limit;
      const isWarning = !isOverspent && progress >= (budget.alertThreshold || 80);

      return { ...budget, spent, remaining, progress, isOverspent, isWarning };
    });
  }, [budgets, transactions]);
}