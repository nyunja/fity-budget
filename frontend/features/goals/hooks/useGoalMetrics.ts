import { useMemo } from 'react';
import { SavingGoal } from '../../../types';

export const useGoalMetrics = (goals: SavingGoal[]) => {
  return useMemo(() => {
    const totalTarget = goals.reduce((acc, g) => acc + g.target, 0);
    const totalSaved = goals.reduce((acc, g) => acc + g.current, 0);
    const averageProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    const activeGoalsCount = goals.filter(g => g.status === 'Active').length;
    const completedGoalsCount = goals.filter(g => g.status === 'Completed').length;

    return {
      totalTarget,
      totalSaved,
      averageProgress,
      activeGoalsCount,
      completedGoalsCount,
    };
  }, [goals]);
};

